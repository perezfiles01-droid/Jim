<#
    COUNTS documents across EDRMS compliant sites. It does not export them.

    This is the small, fast counterpart to simulate_document_scan.ps1. That one
    writes one row per document, about 3.47M of them, and is how the reporting
    table gets filled. This one answers a single question:

        How many documents are there in the EDRMS?

    Run this FIRST. It is quick, it produces a number you can put in front of
    somebody, and if the number looks wrong you find out before committing to a
    multi hour scan.

    WHAT IT PROVES, AND WHAT IT DOES NOT
    The count is real: it walks every library in every site it is given and
    applies the same rules as the full scan. What it cannot do on its own is
    tell you WHICH sites are EDRMS compliant, because nobody has answered that
    yet. See COMPLIANCE in simulate_document_scan.ps1. Without a compliant site
    list this reports an UPPER BOUND across the whole tenant, and it says so.

    THE RULE THE NUMBER DEPENDS ON
    An item with a `folder` facet is a folder. An item with a `file` facet is a
    document. Only files are counted. Measured on org_csd_1.4testsite, Documents
    library, 14 Aug 2026: 73 items returned, 19 of them folders, 54 documents.
    Counting rows instead of checking facets overstates by 35 percent there, and
    sums storage at roughly four times the true figure, because a folder reports
    the CUMULATIVE size of everything beneath it.

    REQUIRES     PowerShell 7. PnP 3.x will not load in Windows PowerShell 5.1.
                 Check with $PSVersionTable.PSVersion.
    PERMISSIONS  Sites.Read.All. Read only throughout.

    USAGE
      .\count_documents.ps1 -MaxSites 3                 smoke test, ~1 minute
      .\count_documents.ps1 -SiteUrlLike 'csd'          one department
      .\count_documents.ps1 -CompliantSiteList .\compliant_sites.csv
      .\count_documents.ps1                             everything, upper bound

    The compliant site list is a CSV with one column headed SiteUrl.
#>

param(
    [int]    $MaxSites          = 0,   # 0 means no limit
    [string] $SiteUrlLike       = '',  # substring filter on the site URL
    [string] $CompliantSiteList = '',  # CSV with a SiteUrl column
    [string] $OutDir            = '.'
)

$Tenant   = '7rkd12'
$ClientId = '86c791d3-edf7-4504-9b2e-fb14ae07811c'
$stamp    = Get-Date -f yyyyMMdd
$SiteOut  = Join-Path $OutDir "document_count_by_site_$stamp.csv"
$LibOut   = Join-Path $OutDir "document_count_by_library_$stamp.csv"

# Libraries SharePoint creates itself. None of them holds a business document,
# and leaving them in is the most common way to inflate a document count.
# 'Apps for SharePoint' and 'Client Side Assets' were both observed on
# org_csd_1.4testsite on 14 Aug 2026, created by SharePoint four seconds apart.
$SystemLibraries = @(
    'Style Library', 'Site Assets', 'Site Pages', 'Form Templates',
    'Preservation Hold Library', 'Custom Columns', 'Images', 'Pages',
    'Teams Wiki Data', 'FormServerTemplates',
    'Apps for SharePoint', 'Client Side Assets'
)

# ---- HELPERS --------------------------------------------------------------

# Every Graph list call pages. Honours 429 by waiting the Retry-After the
# service asks for rather than inventing a backoff. Ignoring this is the usual
# reason an overnight run dies three quarters of the way through.
function Get-GraphPaged {
    param([string] $Url)

    $all = @()
    while ($Url) {
        $attempt = 0
        while ($true) {
            try { $resp = Invoke-PnPGraphMethod -Url $Url -Method Get; break }
            catch {
                $attempt++
                if ($attempt -ge 5) { throw }
                $wait = 10 * $attempt
                if ($_.Exception.Response.Headers -and
                    $_.Exception.Response.Headers['Retry-After']) {
                    $wait = [int] $_.Exception.Response.Headers['Retry-After']
                }
                Write-Warning "  throttled on $Url, waiting $wait s (attempt $attempt)"
                Start-Sleep -Seconds $wait
            }
        }
        $all += $resp.value
        # Graph returns the next page as an absolute URL. Strip the host so
        # Invoke-PnPGraphMethod, which wants a relative path, accepts it.
        $Url = $null
        if ($resp.'@odata.nextLink') {
            $Url = $resp.'@odata.nextLink' -replace '^https://graph\.microsoft\.com/', ''
        }
    }
    return $all
}

# Gap 3b, the one genuinely blocked step. The rule is known: a site is compliant
# when app {B255A2AF-7F63-4A30-966A-5D5FD99F97D7} is installed on it. Which API
# returns that across every site is not known. Replace this function body when
# Mihal Le answers; nothing else in either script changes.
function Test-EdrmsCompliant {
    param([string] $SiteUrl, [hashtable] $Allowed)
    if ($Allowed.Count -gt 0) { return $Allowed.ContainsKey($SiteUrl.ToLower()) }
    return $true   # no list supplied: count everything, and label it an upper bound
}

# ---- 1. AUTHENTICATE ------------------------------------------------------
Connect-PnPOnline -Url "https://$Tenant-admin.sharepoint.com" -Interactive -ClientId $ClientId

# ---- 2. THE COMPLIANT SITE LIST -------------------------------------------
$allowed = @{}
if ($CompliantSiteList -and (Test-Path $CompliantSiteList)) {
    foreach ($r in Import-Csv $CompliantSiteList) {
        if ($r.SiteUrl) { $allowed[$r.SiteUrl.ToLower()] = $true }
    }
    Write-Host "$($allowed.Count) compliant sites loaded from $CompliantSiteList"
} else {
    Write-Warning "No compliant site list supplied. Counting ALL sites, so the result is an UPPER BOUND, not Total Documents in EDRMS."
}

# ---- 3. SITES -------------------------------------------------------------
$sites = Get-GraphPaged "v1.0/sites?search=*&`$select=id,displayName,webUrl&`$top=999"
Write-Host "$($sites.Count) sites returned by Graph"

$sites = $sites | Where-Object { Test-EdrmsCompliant -SiteUrl $_.webUrl -Allowed $allowed }
if ($SiteUrlLike) { $sites = $sites | Where-Object { $_.webUrl -like "*$SiteUrlLike*" } }
if ($MaxSites -gt 0) { $sites = $sites | Select-Object -First $MaxSites }
Write-Host "$($sites.Count) sites will be counted"
Write-Host ""

# ---- 4. WALK LIBRARIES AND COUNT ------------------------------------------
$siteRows = [System.Collections.Generic.List[object]]::new()
$libRows  = [System.Collections.Generic.List[object]]::new()

$totalDocs = 0L; $totalBytes = 0L; $totalFolders = 0L
$totalLibs = 0;  $skippedLibs = 0; $failedSites = 0

$n = 0
foreach ($site in $sites) {
    $n++
    Write-Host "[$n/$($sites.Count)] $($site.webUrl)"

    $drives = @()
    try { $drives = Get-GraphPaged "v1.0/sites/$($site.id)/drives" }
    catch { Write-Warning "  drives failed: $_"; $failedSites++; continue }

    $siteDocs = 0L; $siteBytes = 0L; $siteLibs = 0

    foreach ($drive in $drives) {
        if ($SystemLibraries -contains $drive.name) { $skippedLibs++; continue }

        # The ListId is NOT on the drive object. /drives returns driveType,
        # owner and quota, but no `list` block, so $drive.list.id reads as null.
        # It has to be fetched from the drive's underlying list. This matters
        # because ListId plus ItemId is the grain that joins a scanned document
        # to public."Records", and a silently blank ListId makes that join
        # impossible while looking like it worked.
        $listId = $null
        try {
            $l = Invoke-PnPGraphMethod -Url "v1.0/drives/$($drive.id)/list?`$select=id" -Method Get
            $listId = $l.id
        } catch { Write-Warning "  $($drive.name): list id unavailable: $_" }

        # delta walks the whole tree in one paged sequence, so there is no
        # recursion to write. The same call becomes the incremental refresh
        # later: replay its deltaLink and only changes come back.
        $items = @()
        try {
            $items = Get-GraphPaged "v1.0/drives/$($drive.id)/root/delta?`$select=id,name,size,file,folder,deleted"
        } catch { Write-Warning "  $($drive.name): delta failed: $_"; continue }

        # THE RULE THE WHOLE NUMBER RESTS ON. Only items carrying a `file` facet
        # are documents. Folders carry a `folder` facet and a CUMULATIVE size,
        # so adding them counts the same bytes at every level of the tree.
        $files   = $items | Where-Object { $_.file -and -not $_.deleted }
        $folders = @($items | Where-Object { $_.folder -and -not $_.deleted }).Count
        $bytes   = ($files | Measure-Object size -Sum).Sum
        if ($null -eq $bytes) { $bytes = 0 }

        $libRows.Add([PSCustomObject]@{
            SiteUrl       = $site.webUrl
            SiteName      = $site.displayName
            LibraryName   = $drive.name
            ListId        = $listId
            DriveId       = $drive.id
            ItemsReturned = $items.Count
            Folders       = $folders
            Documents     = @($files).Count
            Bytes         = $bytes
        })

        $siteDocs += @($files).Count; $siteBytes += $bytes; $siteLibs++
        $totalFolders += $folders
    }

    $siteRows.Add([PSCustomObject]@{
        SiteUrl   = $site.webUrl
        SiteName  = $site.displayName
        SiteId    = $site.id
        Libraries = $siteLibs
        Documents = $siteDocs
        Bytes     = $siteBytes
    })

    Write-Host "    $siteLibs libraries, $siteDocs documents, $([math]::Round($siteBytes/1MB,1)) MB"
    $totalDocs += $siteDocs; $totalBytes += $siteBytes; $totalLibs += $siteLibs
}

# ---- 5. WRITE AND REPORT --------------------------------------------------
# Export-Csv quotes every field, which matters: library names in this tenant
# contain commas, double quotes and backslashes. Never build a path from a
# library name, and never write CSV by string concatenation.
$siteRows | Export-Csv -Path $SiteOut -NoTypeInformation -Encoding UTF8
$libRows  | Export-Csv -Path $LibOut  -NoTypeInformation -Encoding UTF8

Write-Host ""
Write-Host "=== TOTAL DOCUMENTS IN EDRMS ==="
Write-Host ""
Write-Host "  Documents            : $totalDocs"
Write-Host "  Storage              : $([math]::Round($totalBytes/1GB,2)) GB"
Write-Host ""
Write-Host "  Sites counted        : $($siteRows.Count)"
Write-Host "  Sites failed         : $failedSites"
Write-Host "  Libraries counted    : $totalLibs"
Write-Host "  Libraries skipped    : $skippedLibs   (system libraries)"
Write-Host "  Folders excluded     : $totalFolders"
Write-Host ""
Write-Host "  By site    : $SiteOut"
Write-Host "  By library : $LibOut"
Write-Host ""

if ($allowed.Count -eq 0) {
    Write-Warning "UPPER BOUND across all sites, not Total Documents in EDRMS. Supply -CompliantSiteList once the compliance rule is settled."
}
Write-Host "Nothing was written to any database. This script only reads."
