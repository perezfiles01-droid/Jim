<#
    Proves the accumulation model on real tenant data, without a database.

    The 12 job generated columns (Id, SnapshotDate, RowLoadedDate on each table)
    cannot be tested against the tenant, because nothing in the tenant supplies
    them. The job invents them. What CAN be tested is whether they behave
    correctly across runs, which is the part that decides whether a date range
    is answerable later.

    This runs the pull twice with two different snapshot dates, appends both to
    one file the way the database will, and then checks four things.

    REQUIRES  PowerShell 7 (check with $PSVersionTable.PSVersion) and the
              EDRMS Report Probe app registration.
#>

$Tenant   = '7rkd12'
$ClientId = '86c791d3-edf7-4504-9b2e-fb14ae07811c'
$OutFile  = '.\utilization_site_activity_accumulated.csv'

Connect-PnPOnline -Url "https://$Tenant-admin.sharepoint.com" -Interactive -ClientId $ClientId

function Invoke-Run {
    param([string]$SnapshotDate)

    # Real data, pulled fresh each run, exactly as the job would.
    $sites = Get-PnPTenantSite
    $loaded = (Get-Date).ToString('s')

    $sites | ForEach-Object {
        [PSCustomObject]@{
            # A fresh identifier per row per run. Never reused, which is what
            # makes a failed run safe to repeat.
            Id            = [guid]::NewGuid()
            SnapshotDate  = $SnapshotDate
            SiteUrl       = $_.Url
            SiteName      = $_.Title
            SiteOwner     = $_.Owner
            StorageUsed   = $_.StorageUsageCurrent
            RowLoadedDate = $loaded
        }
    }
}

# Two runs a week apart. In production these are two separate weeks; here the
# dates are supplied so the behaviour can be seen in one sitting.
Write-Host "`n--- run 1 ---"
$run1 = Invoke-Run -SnapshotDate '2026-01-10'
Write-Host "$($run1.Count) rows"

Write-Host "`n--- run 2 ---"
$run2 = Invoke-Run -SnapshotDate '2026-01-17'
Write-Host "$($run2.Count) rows"

# APPEND, never replace. This single choice is the whole design decision.
$all = $run1 + $run2
$all | Export-Csv -Path $OutFile -NoTypeInformation -Encoding UTF8

Write-Host "`n=== what the database would now hold ==="
$snapshots = $all | Group-Object SnapshotDate
$dupIds    = ($all | Group-Object Id    | Where-Object Count -gt 1).Count
$perSite   = $all | Group-Object SiteUrl

Write-Host ("total rows          : {0}   (run 1 was {1}, so the second run ADDED rather than replaced)" -f $all.Count, $run1.Count)
Write-Host ("distinct SnapshotDate: {0}   ({1})" -f $snapshots.Count, ($snapshots.Name -join ', '))
Write-Host ("duplicate Ids        : {0}   (must be 0)" -f $dupIds)
Write-Host ("rows per site        : {0}   (must be 2, one per run)" -f (($perSite | Select-Object -First 1).Count))

Write-Host "`n=== the two questions this makes answerable ==="
$latest = ($all.SnapshotDate | Sort-Object -Descending | Select-Object -First 1)
Write-Host ("sites as at {0}      : {1}   <- reports read the LATEST snapshot by default" -f $latest, ($all | Where-Object SnapshotDate -eq $latest).Count)
Write-Host ("rows across both weeks: {0}   <- a date range reads every snapshot in the period" -f $all.Count)

Write-Host "`n=== what replacing would have cost ==="
Write-Host ("if run 2 had overwritten run 1 you would hold {0} rows and 1 snapshot," -f $run2.Count)
Write-Host  "10 Jan would be gone, and no later work could bring it back."
Write-Host ("`nwritten to {0}" -f $OutFile)
