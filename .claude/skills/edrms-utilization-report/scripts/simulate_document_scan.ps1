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
    including system libraries. It CAN now be filtered to EDRMS sites using the
    Cloud Governance list, but it still counts files rather than the documents
    this report defines, so it remains an approximation.

    WHAT IS REAL AND WHAT IS SIMULATED
    Real      site enumeration, library enumeration, file enumeration, paging,
              the folder filter, the system library filter, throttling
    Simulated only the database insert, which writes a CSV instead. The
              compliance test is no longer simulated: see COMPLIANCE below

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
# 'Apps for SharePoint' and 'Client Side Assets' were both observed on
# org_csd_1.4testsite on 14 Aug 2026, created by SharePoint four seconds apart.
$SystemLibraries = @(
    'Style Library', 'Site Assets', 'Site Pages', 'Form Templates',
    'Preservation Hold Library', 'Custom Columns', 'Images', 'Pages',
    'Teams Wiki Data', 'FormServerTemplates',
    'Apps for SharePoint', 'Client Side Assets'
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

# COMPLIANCE. Gap 3b, CLOSED 14 Aug 2026.
#
# It was never an API problem. The compliant site list is a BUSINESS REGISTER:
# AvePoint Cloud Governance, Directory, Workspace report. Its 'EDRMS Site Type'
# column is populated on 1,032 of 1,209 workspaces in the test tenant, covering
# both CG created and CG adopted sites. Export, filter to rows where that column
# is not blank, pass as -CompliantSiteList. See compliant_sites.csv.
#
# The register records intent; the installed app records reality, and they can
# drift. Validate once on a sample of about twenty sites, both directions, then
# trust the register.
function Test-EdrmsCompliant {
    param([string] $SiteUrl, [hashtable] $Allowed)

    if ($Allowed.Count -gt 0) { return $Allowed.ContainsKey($SiteUrl.ToLower()) }

    # No list supplied: scan everything and mark the column unknown rather than
    # guessing. A guessed population is worse than an unfiltered one, because
    # it looks deliberate.
    return $true
}

# Resolve a site URL to the Graph site id. Needed because Cloud Governance gives
# URLs and Graph's /drives call wants an id.
#
# This REPLACES enumerating sites with /sites?search=* on the compliant path.
# That call is a SEARCH over the crawled index, not an enumeration: measured on
# 14 Aug 2026 it returned 451 sites against 1,676 from Get-PnPTenantSite. A scan
# built on it silently misses most of the tenant. When the compliant list is
# supplied we do not need to enumerate anything, so the problem disappears.
function Resolve-SiteId {
    param([string] $SiteUrl)
    $u = [uri] $SiteUrl
    $path = $u.AbsolutePath.TrimStart('/')
    try {
        $s = Invoke-PnPGraphMethod -Url "v1.0/sites/$($u.Host):/$($path)?`$select=id,displayName,webUrl" -Method Get
        return $s
    } catch {
        Write-Warning "  cannot resolve $SiteUrl : $_"
        return $null
    }
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
# Preferred path: the compliant list supplies the URLs, so resolve each one and
# enumerate nothing. Fallback path: no list, so fall back to search, which is
# incomplete and says so.
$sites = @()
if ($allowed.Count -gt 0) {
    foreach ($u in $allowed.Keys) {
        $s = Resolve-SiteId -SiteUrl $u
        if ($s) { $sites += $s }
    }
    Write-Host "$($sites.Count) of $($allowed.Count) compliant sites resolved through Graph"
} else {
    $sites = Get-GraphPaged "v1.0/sites?search=*&`$select=id,displayName,webUrl&`$top=999"
    Write-Warning "Enumerated with /sites?search=*, which returned $($sites.Count) sites. That call is a search over the crawled index, NOT an enumeration: it returned 451 against 1,676 real sites on 14 Aug 2026. Supply -CompliantSiteList instead."
}
# Only filter on the fallback path. On the compliant path the list has already
# done the filtering, and re-checking would compare Graph's webUrl against the
# Cloud Governance URL. Those can differ in case or trailing slash, which would
# drop sites silently, which is the worst kind of wrong.
if ($allowed.Count -eq 0) {
    $sites = $sites | Where-Object { Test-EdrmsCompliant -SiteUrl $_.webUrl -Allowed $allowed }
}
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

        # The ListId is NOT on the drive object. Verified against the tenant on
        # 14 Aug 2026: /drives returns driveType, owner and quota and no `list`
        # block at all, so the earlier $drive.list.id read as null. It has to be
        # fetched from the drive's underlying list. This is the join key to
        # public."Records", so a silently blank ListId would have made the
        # scanned versus declared join impossible while looking like it worked.
        $listId = $null
        try {
            $l = Invoke-PnPGraphMethod -Url "v1.0/drives/$($drive.id)/list?`$select=id" -Method Get
            $listId = $l.id
        } catch { Write-Warning "  $($drive.name): list id unavailable: $_" }

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
                # ListId + ItemId is the grain that joins a scanned document to
                # public."Records". Fetched above, not read off the drive.
                ListId           = $listId
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
