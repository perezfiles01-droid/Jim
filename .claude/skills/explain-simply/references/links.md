# Links, with tenant 7rkd12 filled in

Use these verbatim so he can click rather than navigate. Substitute the site
name where a path says `<sitename>`. If a URL is uncertain, say so rather than
inventing a plausible one, because a wrong link costs more trust than an
admission.

Production ADB is a different tenant. When the question is about production
rather than test, say which one you mean, since the numbers differ completely.

## SharePoint admin

| What | Link |
| --- | --- |
| Admin home | https://7rkd12-admin.sharepoint.com |
| Active sites, with a total count and an Export button | https://7rkd12-admin.sharepoint.com/_layouts/15/online/AdminHome.aspx#/siteManagement |
| Manage apps, per app deployment state | https://7rkd12-admin.sharepoint.com/_layouts/15/online/AdminHome.aspx#/manageApps |

## App catalog

Find the catalog URL first, since it is not always `/sites/appcatalog`:

```
https://7rkd12.sharepoint.com/_api/SP_TenantSettings_Current
```

Look for `CorporateCatalogUrl` in the response.

| What | Path from the catalog URL |
| --- | --- |
| Apps for SharePoint library | `/Apps for SharePoint` |
| The same list as raw data | `/_api/web/lists/getbytitle('Apps for SharePoint')/items` |
| Tenant Wide Extensions, how SPFx extensions get pushed org-wide | `/Lists/TenantWideExtensions` |

Columns that answer the compliance question, all in the Apps for SharePoint
library. Some are hidden by default; add them through **LIBRARY**, then
**Modify View**:

| Column | Meaning |
| --- | --- |
| Deployed | The package is live in the catalog |
| **Added to all sites** | **The deciding one.** Yes means every site has it and a per site count is meaningless |
| Package Default Skip Feature Deployment | What the package declares it is capable of, not what was done |
| Contains tenant wide instances | Early warning to go and check the Tenant Wide Extensions list |

## Checking a single site in the browser

Signed in, these render directly in the browser. Replace `<sitename>`.

| What | Link |
| --- | --- |
| Custom actions on the web, where an SPFx command set registers | https://7rkd12.sharepoint.com/sites/`<sitename>`/_api/web/UserCustomActions |
| Custom actions at site collection scope | https://7rkd12.sharepoint.com/sites/`<sitename>`/_api/site/UserCustomActions |

In either response, look for **`ClientSideComponentId`**. That is what actually
puts the Declare as Record button on a library. The `Location` will read
something like `ClientSideExtension.ListViewCommandSet.CommandBar`.

**`_api/web/AppTiles` is not the right endpoint for this.** It returns the
site's lists and libraries, the tiles on Site contents, not installed
solutions. It was tried and it misled.

## Microsoft Graph

Graph Explorer, sign in and press Run: https://aka.ms/ge

| What | Call |
| --- | --- |
| Every site with created date | `GET /sites?search=*&$select=id,displayName,webUrl,createdDateTime&$top=999` |
| Site usage per site, has `File Count` and `Last Activity Date` | `GET /reports/getSharePointSiteUsageDetail(period='D30')` |
| One row per user, for a distinct user count | `GET /reports/getSharePointActivityUserDetail(period='D30')` |
| Document libraries on a site, `list.id` is the ListId join key | `GET /sites/{siteId}/drives` |
| Walk a library, files only | `GET /drives/{driveId}/root/delta?$select=id,name,size,file,folder,lastModifiedDateTime` |
| Unique viewers for one site, returns `actorCount` | `GET /sites/{siteId}/analytics/allTime` |

Permissions needed: `Sites.Read.All` for sites and drives, `Reports.Read.All`
for the usage reports. Graph Explorer prompts for consent on first use.

## PowerShell

He is set up already. PowerShell 7.6.4, PnP.PowerShell 3.3.0, Entra app
**EDRMS Report Probe**, ClientId `86c791d3-edf7-4504-9b2e-fb14ae07811c`.

```powershell
Connect-PnPOnline -Url https://7rkd12-admin.sharepoint.com -Interactive -ClientId "86c791d3-edf7-4504-9b2e-fb14ae07811c"
```

Two traps that have already cost him time, worth heading off:

- **Windows PowerShell 5.1 versus PowerShell 7.** PnP 3.x only loads in 7.
  `CommandNotFoundException` on a PnP cmdlet means the wrong shell. Check with
  `$PSVersionTable.PSVersion`.
- **Placeholders get pasted literally.** Never write `<paste the GUID>` in a
  command. Put the real value in.

## Known identifiers

| Thing | Value |
| --- | --- |
| Tenant | 7rkd12, `JimTest@7rkd12.onmicrosoft.com` |
| EDRMS app, the compliance marker | `{B255A2AF-7F63-4A30-966A-5D5FD99F97D7}`, `digital-records-management-system` |
| App version seen in the catalog | 1.0.0.16, modified 4 February |
| Test site with the app | `org_csd_1.4testsite` |
| Second test site | `org_csd_1.3testsite` |
| Reporting database | `drm-npr`, PostgreSQL, schema `public`, table `Records` |
| Record grain | `ListId` plus `ItemId`, both NOT NULL. Not `DocumentId`, which is nullable |

## Measured, not assumed

Quote these as real. Everything else in the prototype is illustrative.

| Figure | Value | Where it came from |
| --- | --- | --- |
| Sites in the tenant | **1,676** | `Get-PnPTenantSite`, measured by him |
| Sites in the usage export | 2,359, of which 1,702 not deleted | M365 usage detail |
| Sites holding any documents | 977 | usage export, File Count above zero |
| Documents across those sites | 26,660 | sum of File Count |
| Rows in `Records` | about 1,990, resolving to 1,984 distinct documents | direct query |
| Unique viewers, one site, all time | `actionCount 5535, actorCount 12` | Graph analytics |

**1,057 compliant sites is not measured.** It is a placeholder inherited from
`ALLTIME_SITES` in the earlier prototype. Say so whenever it comes up.
