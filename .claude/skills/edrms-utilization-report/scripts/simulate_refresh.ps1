<#
    Simulates the weekly refresh job that fills the Site Activity Table.

    WHY THIS EXISTS
    Neither Microsoft nor AvePoint can push data into PostgreSQL. Nothing does.
    The report is fed by a scheduled job that PULLS from the APIs and WRITES to
    the database, and this is that job with its last line changed: it writes a
    CSV instead of inserting rows.

    Everything difficult about the real job is already here. Authentication,
    permissions, paging, merging two sources, and deciding what a row looks
    like. The database insert is the easy end.

    REQUIRES  PowerShell 7 (PnP 3.x will not load in Windows PowerShell 5.1;
              check with $PSVersionTable.PSVersion), and the EDRMS Report Probe
              app registration.
#>

$Tenant   = '7rkd12'
$ClientId = '86c791d3-edf7-4504-9b2e-fb14ae07811c'
$OutFile  = ".\utilization_site_activity_$(Get-Date -f yyyyMMdd).csv"

# ---- 1. AUTHENTICATE ------------------------------------------------------
# -Interactive prompts for a sign in, which is fine by hand and impossible for
# a scheduled job. Production swaps this for a certificate or a client secret.
Connect-PnPOnline -Url "https://$Tenant-admin.sharepoint.com" -Interactive -ClientId $ClientId

# ---- 2. PULL --------------------------------------------------------------
$sites = Get-PnPTenantSite
Write-Host "$($sites.Count) sites returned"

# A second source, because no single call returns everything the table needs.
# Site created date is not in Get-PnPTenantSite; Graph has it. This is the
# merge step that makes the real job more than one line.
$created = @{}
try {
    $g = Invoke-PnPGraphMethod -Url "v1.0/sites?search=*&`$select=webUrl,createdDateTime&`$top=999"
    foreach ($s in $g.value) { $created[$s.webUrl] = $s.createdDateTime }
    Write-Host "$($created.Count) created dates matched from Graph"
} catch {
    Write-Warning "Graph call failed, SiteCreatedDate will be blank: $_"
}

# ---- 3. SHAPE -------------------------------------------------------------
# One value per run, which is what every dashboard's "Data as of" line prints.
$snapshot = (Get-Date).ToString('yyyy-MM-dd')
$loaded   = (Get-Date).ToString('s')

$rows = $sites | ForEach-Object {
    [PSCustomObject]@{
        SnapshotDate        = $snapshot
        SiteUrl             = $_.Url
        SiteName            = $_.Title
        SiteCreatedDate     = $created[$_.Url]
        SiteOwner           = $_.Owner
        StorageUsed         = $_.StorageUsageCurrent
        # Deliberately blank. Nothing in any call returns it, which is Gap 1
        # seen from the inside rather than described. It arrives from the RAC
        # site mapping, loaded separately.
        ADBDepartmentOwner  = $null
        IsDeleted           = $false
        RowLoadedDate       = $loaded
    }
}

# ---- 4. WRITE -------------------------------------------------------------
# The only line that differs in production, where it becomes an insert into
# rpt.utilization_site_activity.
$rows | Export-Csv -Path $OutFile -NoTypeInformation -Encoding UTF8
Write-Host "$($rows.Count) rows written to $OutFile"

# Run this again next week with the date in the filename and compare the two.
# Most rows will be identical; the differences are what "refreshed weekly"
# actually means.
