<#
.SYNOPSIS
  Produces the real "EDRMS compliant sites" number.

.DESCRIPTION
  The dashboard shows 1,057. That figure is a placeholder inherited from
  an earlier prototype and has never been measured. This script measures it.

  A site is EDRMS compliant if the app that carries the Declare as Record
  button is installed on it:

      digital-records-management-system-client-side-solution
      Product ID  {B255A2AF-7F63-4A30-966A-5D5FD99F97D7}

  The script walks the tenant's sites, asks each one whether that app is
  installed, and writes a CSV plus a summary. The count of Compliant = True
  is your real 1,057.

.PARAMETER TenantName
  The bit before .sharepoint.com. For https://adb.sharepoint.com pass "adb".

.PARAMETER SampleSize
  How many sites to check. Start with 20 to prove the method and time it.
  Pass 0 for every site.

.PARAMETER OutFile
  Where to write the CSV. Defaults to compliant_sites.csv in the current folder.

.EXAMPLE
  # prove the method on 20 sites and find out what the full run costs
  .\02_compliant_sites.ps1 -TenantName adb -SampleSize 20

.EXAMPLE
  # the real thing
  .\02_compliant_sites.ps1 -TenantName adb

.NOTES
  Needs PnP PowerShell and SharePoint administrator rights.
      Install-Module PnP.PowerShell -Scope CurrentUser

  ON AUTHENTICATION. -Interactive signs you in once and caches the token, so
  the per site Connect-PnPOnline calls in the loop should not re-prompt. If
  yours does prompt repeatedly, stop and switch to app-only certificate
  authentication before attempting the full run, because a thousand sign in
  prompts is not a job anybody finishes:

      Register-PnPEntraIDAppForInteractiveLogin -ApplicationName "EDRMS Report Probe" -Tenant <tenant>.onmicrosoft.com

  then connect with -ClientId and -Thumbprint instead of -Interactive. For a
  scheduled production feed, app-only is the right answer regardless.

  READ THIS BEFORE TRUSTING THE OUTPUT. Run the discriminating check that
  the script performs first, on two sites you already know differ. If the
  app comes back on a site you know is not EDRMS enabled, the script is
  reading the tenant app catalog rather than per site installation, and
  the whole approach needs a different marker. The script prints a warning
  if every site comes back compliant, because that is the signature of
  exactly that failure.
#>

[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string] $TenantName,

  [int] $SampleSize = 20,

  [string] $OutFile = "compliant_sites.csv",

  # Override only if the development team tells you the marker has changed.
  [string] $AppId = "b255a2af-7f63-4a30-966a-5d5fd99f97d7"
)

$ErrorActionPreference = "Stop"
$adminUrl = "https://$TenantName-admin.sharepoint.com"

Write-Host ""
Write-Host "EDRMS compliant site probe" -ForegroundColor Cyan
Write-Host "Marker app : $AppId"
Write-Host "Admin URL  : $adminUrl"
Write-Host ""

# ---------------------------------------------------------------
# 1. Connect to the admin centre and list the sites
# ---------------------------------------------------------------
Write-Host "Connecting to the tenant admin centre..."
Connect-PnPOnline -Url $adminUrl -Interactive

Write-Host "Listing sites..."
$allSites = Get-PnPTenantSite -IncludeOneDriveSites:$false |
            Where-Object { $_.Template -notlike "REDIRECT*" }

Write-Host ("Found {0} sites in the tenant." -f $allSites.Count) -ForegroundColor Green
Write-Host "For comparison, the test tenant held 2,359 sites, 1,702 after removing deleted ones."
Write-Host ""

$targets = if ($SampleSize -gt 0) { $allSites | Select-Object -First $SampleSize } else { $allSites }
Write-Host ("Checking {0} of them.`n" -f $targets.Count)

# ---------------------------------------------------------------
# 2. Ask each site whether the app is installed
# ---------------------------------------------------------------
$sw      = [Diagnostics.Stopwatch]::StartNew()
$i       = 0
$results = foreach ($s in $targets) {
  $i++
  Write-Progress -Activity "Checking sites for the EDRMS app" `
                 -Status  ("{0} of {1}: {2}" -f $i, $targets.Count, $s.Url) `
                 -PercentComplete ($i / $targets.Count * 100)
  try {
    Connect-PnPOnline -Url $s.Url -Interactive -ErrorAction Stop

    # -Scope Site asks what is installed HERE, which is the question that
    # matters. -Scope Tenant would ask what is available in the catalog,
    # which would return the app everywhere and prove nothing.
    $app = Get-PnPApp -Scope Site -ErrorAction SilentlyContinue |
           Where-Object { $_.Id -eq $AppId }

    [pscustomobject]@{
      Url              = $s.Url
      Title            = $s.Title
      Compliant        = [bool]$app
      AppVersion       = if ($app) { $app.InstalledVersion } else { "" }
      Template         = $s.Template
      LastContentChange= $s.LastContentModifiedDate
      StorageUsedMB    = $s.StorageUsageCurrent
      Owner            = $s.Owner
      Error            = ""
    }
  }
  catch {
    [pscustomobject]@{
      Url              = $s.Url
      Title            = $s.Title
      Compliant        = $null
      AppVersion       = ""
      Template         = $s.Template
      LastContentChange= $s.LastContentModifiedDate
      StorageUsedMB    = $s.StorageUsageCurrent
      Owner            = $s.Owner
      Error            = $_.Exception.Message
    }
  }
}
$sw.Stop()
Write-Progress -Activity "Checking sites for the EDRMS app" -Completed

# ---------------------------------------------------------------
# 3. Report
# ---------------------------------------------------------------
$results | Export-Csv -Path $OutFile -NoTypeInformation -Encoding UTF8

$compliant = @($results | Where-Object { $_.Compliant -eq $true }).Count
$plain     = @($results | Where-Object { $_.Compliant -eq $false }).Count
$errors    = @($results | Where-Object { $_.Error -ne "" }).Count
$checked   = $results.Count

Write-Host ""
Write-Host "RESULT" -ForegroundColor Cyan
Write-Host ("  Sites checked      : {0}" -f $checked)
Write-Host ("  EDRMS COMPLIANT    : {0}" -f $compliant) -ForegroundColor Green
Write-Host ("  Not compliant      : {0}" -f $plain)
Write-Host ("  Errors             : {0}" -f $errors)
Write-Host ("  Elapsed            : {0:N1} seconds, {1:N1} per site" -f `
              $sw.Elapsed.TotalSeconds, ($sw.Elapsed.TotalSeconds / [Math]::Max($checked,1)))
Write-Host ("  CSV written to     : {0}" -f (Resolve-Path $OutFile))
Write-Host ""

# App versions in the wild, a free health metric
if ($compliant -gt 0) {
  Write-Host "App versions found:" -ForegroundColor Cyan
  $results | Where-Object { $_.Compliant -eq $true } |
    Group-Object AppVersion | Select-Object Name, Count | Format-Table -AutoSize
}

# ---------------------------------------------------------------
# 4. Sanity checks on the result itself
# ---------------------------------------------------------------
if ($checked -gt 0 -and $plain -eq 0 -and $errors -eq 0) {
  Write-Warning @"
Every single site came back compliant.

That is the signature of reading the tenant app catalog rather than per site
installation, OR of the app having been deployed tenant wide, which installs it
everywhere without a per site record.

Either way, app installation would not distinguish compliant sites and you need
a different marker. Verify by hand against a site you are certain is not EDRMS
enabled before reporting this number.
"@
}

if ($errors -gt 0) {
  Write-Warning ("{0} sites errored. Common cause is the account lacking access to that site collection. Check the Error column in the CSV." -f $errors)
}

if ($SampleSize -gt 0 -and $allSites.Count -gt $SampleSize) {
  $projected = $sw.Elapsed.TotalSeconds / [Math]::Max($checked,1) * $allSites.Count
  Write-Host ""
  Write-Host ("Projection: the full run over {0} sites would take about {1:N0} minutes." -f `
                $allSites.Count, ($projected / 60)) -ForegroundColor Yellow
  Write-Host "If that is over an hour, this is a nightly job rather than a live query,"
  Write-Host "which is worth knowing before anyone promises a refresh interval."
  Write-Host ""
  Write-Host "Run again without -SampleSize for the real number."
}

Write-Host ""
Write-Host "NEXT: the card's sublabel, 'active' versus 'not', needs each compliant" -ForegroundColor Cyan
Write-Host "site's last activity date. See probe/03_graph_calls.md step 3, then join"
Write-Host "it to this CSV on the site URL."
