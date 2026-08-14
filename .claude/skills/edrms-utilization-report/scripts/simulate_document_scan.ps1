<#
    Simulates the weekly DOCUMENT SCAN that fills the Utilization Report Table,
    one row per document. This is the job that produces "Total Documents in
    EDRMS" and, more importantly, the denominator under every rate and
    percentage in the report.

    WHY THIS EXISTS
    public."Records" holds DECLARED RECORDS ONLY, about 1,990 rows in UAT. It
    holds no row at all for a document that was never declared. So no rate has
    a denominator until this scan exists. The SharePoint site usage export is
    not a substitute: it counts every file in every site in the tenant,
    including system libraries, and it cannot be filtered to EDRMS sites.

    WHAT IS REAL AND WHAT IS SIMULATED
    Real      site enumeration, library enumeration, file enumeration, paging,
              the folder filter, the system library filter, throttling
    Simulated the compliance test, which is blocked (see COMPLIANCE below), and
              the database insert, which writes a CSV instead

    REQUIRES  PowerShell 7. PnP 3.x will not load in Windows PowerShell 5.1.
              Check with $PSVersionTable.PSVersion. A CommandNotFoundException
              on a PnP cmdlet means the wrong shell, not a missing module.

    PERMISSIONS  Sites.Read.All. Read only throughout, which makes this an easy
              change to get approved.

    USAGE
      .\simulate_document_scan.ps1                     scan every compliant site
      .\simulate_document_scan.ps1 -MaxSites 5         a quick smoke test
      .\simulate_document_scan.ps1 -SiteUrlLike 'csd'  one department's sites
#>

param(
    [int]    $MaxSites    = 0,      # 0 means no limit
    [string] $SiteUrlLike = '',     # substring filter on the site URL
    [string] $CompliantSiteList = ''  # optional CSV of compliant site URLs
)

$Tenant   = '7rkd12'
$ClientId = '86c791d3-edf7-4504-9b2e-fb14ae07811c'
$OutFile  = ".\utilization_report_$(Get-Date -f yyyyMMdd).csv"

# Libraries that exist on every SharePoint site and hold no business document.
# Leaving these in is the most common way to inflate a document count.
$SystemLibraries = @(
    'Style Library', 'Site Assets', 'Site Pages', 'Form Templates',
    'Preservation Hold Library', 'Custom Columns', 'Images', 'Pages',
    'Teams Wiki Data', 'FormServerTemplates'
)

# ---- 0. HELPERS -----------------------------------------------------------

# Every Graph list call pages. Written once, used for sites, drives and items.
# Honours 429 by waiting the Retry-After the service asks for, rather than
# inventing a backoff. Ignoring this is the usual reason an overnight run dies.
function Get-GraphPaged {
    param([string] $Url)

    $all = @()
    while ($Url) {
        $attempt = 0
        while ($true) {
            try {
                $resp = Invoke-PnPGraphMethod -Url $Url -Method Get
                break
            } catch {
                $attempt++
                if ($attempt -ge 5) { throw }
                $wait = 10 * $attempt
                if ($_.Exception.Response.Headers -and
                    $_.Exception.Response.Headers['Retry-After']) {
                    $wait = [int] $_.Exception.Response.Headers['Retry-After']
                }
                Write-Warning "Throttled or failed on $Url, waiting $wait s (attempt $attempt)"
                Start-Sleep -Seconds $wait
            }
        }
        $all += $resp.value
        # Graph returns the next page as an absolute URL. Strip the prefix so
        # Invoke-PnPGraphMethod, which wants a relative path, accepts it.
        $Url = $null
        if ($resp.'@odata.nextLink') {
            $Url = $resp.'@odata.nextLink' -replace '^https://graph\.microsoft\.com/', ''
        }
    }
    return $all
}

# COMPLIANCE. This is Gap 3b and it is the one genuinely blocked step.
#
# The rule is known: a site is EDRMS compliant when app
# {B255A2AF-7F63-4A30-966A-5D5FD99F97D7}, digital-records-management-system, is
# installed on it, which is what puts the Declare as Record button on its
# libraries. What is NOT known is which API returns that app list across ~1,057
# sites. Site Contents shows it in a browser for one site; that is not the same
# thing.
#
# So the test sits behind this one function with two implementations. Pass
# -CompliantSiteList to use a maintained CSV today. Replace the body with the
# real query when Mihal Le answers, and nothing else in the job changes.
function Test-EdrmsCompliant {
    param([string] $SiteUrl, [hashtable] $Allowed)

    if ($Allowed.Count -gt 0) { return $Allowed.ContainsKey($SiteUrl.ToLower()) }

    # No list supplied: scan everything and mark the column unknown rather than
    # guessing. A guessed population is worse than an unfiltered one, because
    # it looks deliberate.
    return $true
}

# ---- 1. AUTHENTICATE ------------------------------------------------------
# -Interactive prompts for a sign in, which is fine by hand and impossible for
# a scheduled job. Production swaps this for a certificate or a client secret.
Connect-PnPOnline -Url "https://$Tenant-admin.sharepoint.com" -Interactive -ClientId $ClientId

# ---- 2. THE COMPLIANT SITE LIST -------------------------------------------
$allowed = @{}
if ($CompliantSiteList -and (Test-Path $CompliantSiteList)) {
    foreach ($r in Import-Csv $CompliantSiteList) {
        if ($r.SiteUrl) { $allowed[$r.SiteUrl.ToLower()] = $true }
    }
    Write-Host "$($allowed.Count) compliant sites loaded from $CompliantSiteList"
} else {
    Write-Warning "No compliant site list supplied. Scanning ALL sites, so the total is an upper bound, not Total Documents in EDRMS."
}

# ---- 3. SITES -------------------------------------------------------------
$sites = Get-GraphPaged "v1.0/sites?search=*&`$select=id,displayName,webUrl,createdDateTime&`$top=999"
Write-Host "$($sites.Count) sites returned by Graph"

$sites = $sites | Where-Object { Test-EdrmsCompliant -SiteUrl $_.webUrl -Allowed $allowed }
if ($SiteUrlLike) { $sites = $sites | Where-Object { $_.webUrl -like "*$SiteUrlLike*" } }
if ($MaxSites -gt 0) { $sites = $sites | Select-Object -First $MaxSites }
Write-Host "$($sites.Count) sites will be scanned"

# ---- 4. LIBRARIES AND FILES -----------------------------------------------
$snapshot = (Get-Date).ToString('yyyy-MM-dd')
$loaded   = (Get-Date).ToString('s')
$rows     = [System.Collections.Generic.List[object]]::new()

$n = 0
foreach ($site in $sites) {
    $n++
    Write-Host "[$n/$($sites.Count)] $($site.webUrl)"

    $drives = @()
    try { $drives = Get-GraphPaged "v1.0/sites/$($site.id)/drives" }
    catch { Write-Warning "  drives failed: $_"; continue }

    foreach ($drive in $drives) {
        if ($SystemLibraries -contains $drive.name) { continue }

        # delta returns the whole tree in one paged sequence, so no recursion
        # to write. The same call becomes the incremental refresh later: it
        # returns only what changed and the run goes from hours to minutes.
        $items = @()
        try { $items = Get-GraphPaged "v1.0/drives/$($drive.id)/root/delta" }
        catch { Write-Warning "  $($drive.name): delta failed: $_"; continue }

        foreach ($item in $items) {
            # THE RULE THAT DECIDES WHETHER THE NUMBER IS RIGHT.
            # An item with a folder facet is a folder, not a document. Graph
            # also returns a CUMULATIVE size on a folder, so counting folders
            # inflates the document count and double counts storage on top.
            if ($null -eq $item.file) { continue }
            if ($item.deleted) { continue }

            $ext = ''
            if ($item.name -match '\.([A-Za-z0-9]+)$') { $ext = $Matches[1].ToLower() }

            $rows.Add([PSCustomObject]@{
                SnapshotDate     = $snapshot
                SiteId           = $site.id
                SiteUrl          = $site.webUrl
                SiteName         = $site.displayName
                # drive.list.id is the ListId, and ListId + ItemId is the grain
                # that joins a scanned document to public."Records".
                ListId           = $drive.list.id
                LibraryName      = $drive.name
                ItemId           = $item.id
                FileName         = $item.name
                FileExtension    = $ext
                FileSize         = $item.size
                FileCreatedDate  = $item.createdDateTime
                FileModifiedDate = $item.lastModifiedDateTime
                CreatedBy        = $item.createdBy.user.email
                ModifiedBy       = $item.lastModifiedBy.user.email
                # Filled by the join against public."Records" in step 5 of the
                # real job. Costs nothing once the scan runs, and it is what
                # gives every percentage in the report a denominator.
                IsDeclaredRecord = $null
                # Blank on purpose. Nothing in any call returns it. It arrives
                # from the RAC site to department list, loaded separately, and
                # documents inherit it through the site.
                ADBDepartmentOwner = $null
                RowLoadedDate    = $loaded
            })
        }
    }
}

# ---- 5. WRITE -------------------------------------------------------------
# The only line that differs in production, where it becomes a bulk load into a
# staging table followed by a swap into rpt.utilization_report. Staging then
# swap, so the report never reads a half written table.
$rows | Export-Csv -Path $OutFile -NoTypeInformation -Encoding UTF8

Write-Host ""
Write-Host "=== RESULT ==="
Write-Host "$($rows.Count) documents written to $OutFile"
Write-Host "Sites scanned      : $($sites.Count)"
Write-Host "Libraries with docs: $(($rows | Select-Object -Unique ListId).Count)"
Write-Host "Total bytes        : $(($rows | Measure-Object FileSize -Sum).Sum)"
if ($allowed.Count -eq 0) {
    Write-Host ""
    Write-Warning "This is an UPPER BOUND across all sites, not Total Documents in EDRMS. Supply -CompliantSiteList once the compliance rule is settled."
}
