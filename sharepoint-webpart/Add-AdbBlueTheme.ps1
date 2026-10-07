# Adds an "ADB Blue" company theme (#194F8E, the blue of the BPMSD site) to the
# SharePoint tenant, so site owners can pick it under Change the look > Theme.
#
# Run once, as a SharePoint administrator, in Windows PowerShell:
#   1. Install-Module -Name Microsoft.Online.SharePoint.PowerShell   (first time only)
#   2. Change the admin address below if your tenant is not 7rkd12
#   3. .\Add-AdbBlueTheme.ps1

Connect-SPOService -Url "https://7rkd12-admin.sharepoint.com"

$palette = @{
    "themePrimary" = "#194f8e";
    "themeLighterAlt" = "#f4f6f9";
    "themeLighter" = "#d6dfeb";
    "themeLight" = "#b1c3d9";
    "themeTertiary" = "#7092b9";
    "themeSecondary" = "#35649c";
    "themeDarkAlt" = "#164780";
    "themeDark" = "#133c6c";
    "themeDarker" = "#0e2c50";
    "neutralLighterAlt" = "#faf9f8";
    "neutralLighter" = "#f3f2f1";
    "neutralLight" = "#edebe9";
    "neutralQuaternaryAlt" = "#e1dfdd";
    "neutralQuaternary" = "#d0d0d0";
    "neutralTertiaryAlt" = "#c8c6c4";
    "neutralTertiary" = "#a19f9d";
    "neutralSecondary" = "#605e5c";
    "neutralPrimaryAlt" = "#3b3a39";
    "neutralPrimary" = "#323130";
    "neutralDark" = "#201f1e";
    "black" = "#000000";
    "white" = "#ffffff";
}

Add-SPOTheme -Identity "ADB Blue" -Palette $palette -IsInverted $false -Overwrite
Write-Host "Added the ADB Blue theme. On the site: gear icon > Change the look > Theme > From your organization > ADB Blue > Save."
