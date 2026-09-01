# Feasibility tests you can run yourself

Eight tests against the real tenant that settle, with evidence rather than
opinion, whether the Bankwide oversight dashboard can be built. Each one says
what to run, what a pass looks like, and what it means if it fails.

Run them in order. Tests 1 to 3 are cheap and decide the most.

You need three things: a SQL client on `drm-npr`, Graph Explorer
(<https://aka.ms/ge>), and PnP PowerShell with SharePoint administrator rights.

---

## First, the thing the chips do not show

Bankwide oversight has 11 metrics: 2 available today, 2 needing the document
scan, 1 the usage feed, 2 the app detection answer, 4 the site mapping list.

**But the app detection answer sits upstream of five of them, not two.** Every
metric on this dashboard that says "in EDRMS compliant sites" needs the list of
compliant sites before it can even be scoped. You cannot count documents in
compliant sites until you know which sites those are. The chain is:

```
app detection  →  the list of compliant sites
                  →  scope of the document scan
                     →  total documents
                     →  declaration rate
                  →  active / inactive / orphaned sites
                  →  what the site mapping list has rows for
```

So **test 3 is the one that matters most on this page.** If it fails, nine of
the eleven metrics lose their definition, not just two.

---

## What is genuinely at risk on this dashboard

Three things, in order of how likely they are to fail.

**1. The sovereign and nonsovereign split. The most likely to fail outright.**
Department at least has a named SharePoint column that is empty, and AvePoint
Cloud Governance may hold it. Nothing observed anywhere records whether a site
belongs to a sovereign or a nonsovereign project. That attribution lives in
ADB's operational systems, not in SharePoint, not in the EDRMS database, and
probably not in Cloud Governance. This may need a join to a project system on a
project number that sites do not currently carry. Test 7 settles it.

**2. Monthly active users, which has a double counting trap.**
The SharePoint site usage report gives active users per site. Summing that
column across 1,057 sites counts one person once for every site they touched,
so the bank wide figure comes out several times too high. The correct source is
a different report entirely, one row per user. Test 6 shows the size of the
error on your own data.

**3. Total documents, which has no agreed definition.**
The scan can count. What it should count is undecided: folders, versions, system
files, and documents in libraries with no retention label mapping all move the
number substantially. Test 5 measures how much, so the decision can be made
against real figures rather than in the abstract.

Nothing on this dashboard is permanently impossible. Two metrics are available
today with no work at all.

---

## Test 1. What is actually in the Records table

**Run**

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'Records'
ORDER BY ordinal_position;
```

**Pass** You get the real column list, including whichever column carries the
physical counterpart flag and the soft delete flag. Every query below should use
the names this returns rather than the names in any design document.

**Why it is first** Two of the eleven metrics are supposed to be available
today. This confirms it in one query, and gives you the correct names for
everything after.

---

## Test 2. Total declared records, and how many are double counted

**Run**

```sql
SELECT COUNT(*)                                                   AS row_count,
       COUNT(DISTINCT ("ListId"::text || ':' || "ItemId"::text))  AS distinct_items
FROM public."Records";
```

**Pass** Both return a number and `distinct_items` is less than or equal to
`row_count`.

**What the gap means** The difference is documents declared more than once. In
the UAT tenant, 1,990 rows resolved to 1,984 distinct documents. Report
`distinct_items` as Total Declared Records. If you report `row_count` instead,
every derived figure on every dashboard is slightly too high.

Then the physical counterpart, using the flag name from test 1:

```sql
SELECT COUNT(DISTINCT ("ListId"::text || ':' || "ItemId"::text))    AS declared,
       COUNT(DISTINCT ("ListId"::text || ':' || "ItemId"::text))
         FILTER (WHERE <physical flag column> IS TRUE)              AS with_physical
FROM public."Records";
```

**Pass** `with_physical` is greater than zero and less than `declared`. If it is
zero, the physical counterpart is not being captured and one KPI on this
dashboard goes dark.

---

## Test 2b. Is ADBMeta really empty, and what is in it

Worth doing while you are in the database. It takes a minute and it can change
the whole plan.

```sql
SELECT k AS key, COUNT(*) AS rows_with_key
FROM public."Records", LATERAL jsonb_object_keys("ADBMeta") AS k
GROUP BY k ORDER BY rows_with_key DESC;
```

```sql
SELECT COUNT(*) AS total,
       COUNT(*) FILTER (WHERE COALESCE("ADBMeta"->>'ADBDepartmentOwner','') <> '') AS dept_populated
FROM public."Records";
```

**Expected** `dept_populated` is zero, confirming what was already found.

**If it is not zero** That is good news worth acting on immediately. Department
would be recoverable from the records themselves and the site mapping list
becomes a fallback rather than the critical path, which moves four metrics on
this dashboard from blocked to available.

**Also check the classification key while you are here**, because it silently
decides two panels on other dashboards:

```sql
SELECT COUNT(*) FILTER (WHERE COALESCE("ADBMeta"->>'<classification key>','') <> '')
FROM public."Records";
```

---

## Test 3. Can you detect the EDRMS app per site

**The decisive test on this dashboard.** Do it as a discriminating test, not as
a query that merely returns something.

**Run, on two sites you already know differ**

```powershell
Connect-PnPOnline -Url https://<tenant>.sharepoint.com/sites/org_csd_1.4testsite -Interactive
Get-PnPApp -Scope Site | Select-Object Id, Title, InstalledVersion, AppCatalogVersion
```

**Pass** The known EDRMS site returns an app whose `Id` is
`B255A2AF-7F63-4A30-966A-5D5FD99F97D7`, and a site you know is not EDRMS
enabled does not.

That second half is the point. A query that returns the app everywhere proves
nothing, because it would mean you are reading the tenant app catalog rather
than per site installation.

**Then scale it, on 20 sites before 1,057**

```powershell
$appId = "b255a2af-7f63-4a30-966a-5d5fd99f97d7"
$sites = Get-PnPTenantSite -IncludeOneDriveSites:$false | Select-Object -First 20
$results = foreach ($s in $sites) {
  try {
    Connect-PnPOnline -Url $s.Url -Interactive -ErrorAction Stop
    $app = Get-PnPApp -Scope Site -ErrorAction SilentlyContinue |
           Where-Object { $_.Id -eq $appId }
    [pscustomobject]@{
      Url       = $s.Url
      Compliant = [bool]$app
      Version   = $app.InstalledVersion
    }
  } catch {
    [pscustomobject]@{ Url = $s.Url; Compliant = "ERROR"; Version = $_.Exception.Message }
  }
}
$results | Format-Table -AutoSize
$results | Group-Object Compliant | Select-Object Name, Count
```

**Pass** You get a mixture of true and false, no errors, and the run takes long
enough per site that you can estimate the full sweep. Time 20 sites, multiply by
53, and you have the real cost of this feed.

**If it fails** Ask the development team the direct question: *"The EDRMS
Declare as Record button comes from app
{B255A2AF-7F63-4A30-966A-5D5FD99F97D7}. How do we query which sites have it
installed?"* Alternatives to try are the site's app inventory through the
SharePoint REST API, or the tenant app catalog's own deployment view.

**Also capture the version.** If sites are running different versions of the
app, that is a useful health metric in its own right and it is free once you are
already enumerating.

---

## Test 4. Site inventory and created dates

**Run in Graph Explorer**

```
GET https://graph.microsoft.com/v1.0/sites?search=*&$select=id,displayName,webUrl,createdDateTime&$top=999
```

**Pass** Every row carries `createdDateTime`. This was verified once already:
`org_csd_1.4testsite` returned 2025-09-25.

**Watch for** sites whose `createdDateTime` is later than their
`lastModifiedDateTime`, which usually means a restore. Count them:

```
GET https://graph.microsoft.com/v1.0/sites?search=*&$select=webUrl,createdDateTime,lastModifiedDateTime&$top=999
```

Any site where created is after last modified will land in the wrong month on
any created date trend. If it is a handful, note it. If it is hundreds, the
created date is not trustworthy as a rollout measure.

---

## Test 5. Prove the document scan on one site before building it

**Run**

```
GET https://graph.microsoft.com/v1.0/sites/{siteId}/drives
GET https://graph.microsoft.com/v1.0/drives/{driveId}/root/delta?$select=id,name,size,file,folder,lastModifiedDateTime
```

Count separately:

- items where `file` is present, this is your document count
- items where `folder` is present, these must be excluded
- the sum of `size` over files only
- the sum of `size` over everything, to see the damage

**Pass** The file only count is stable and the two size totals differ
noticeably. A folder is returned with a **cumulative** size, one was observed at
5,163,738 bytes, so including folders double counts storage. If the two totals
are the same, you are not reading folders correctly.

**Then cross check against a completely different source.** Take the same site
from the M365 SharePoint site usage report and compare its `File Count` column
to your file only count.

**Pass** They agree within a few per cent.

**If they diverge badly** one of them is counting something you do not want,
usually versions, preservation hold copies, or the site assets library. Find out
which before scanning 1,057 sites, because this is exactly the disagreement that
surfaces in a steering committee three months later.

**Use `delta`, not a full enumeration.** At 3.47 million documents a full walk
every run will be throttled. The delta token gives you changes only after the
first pass.

---

## Test 6. The monthly active users trap

**Run both, for the same 30 day period**

```
GET https://graph.microsoft.com/v1.0/reports/getSharePointSiteUsageDetail(period='D30')
GET https://graph.microsoft.com/v1.0/reports/getSharePointActivityUserDetail(period='D30')
```

From the first, sum the active user count across all sites.
From the second, count rows where the user had any activity. That is one row per
user.

**Pass** The second number is smaller, probably much smaller.

**What it means** The difference is your double count. Report the second number
as "Total number of EDRMS users". The per site figure is still correct as a per
site figure, which is what Department insight uses, but it must never be summed
to a bank wide total.

**While you are in the first report**, check two things that were found before:

- **Filter `Is Deleted`.** In the test tenant, 2,359 detail rows minus 657
  deleted equalled the 1,702 in the site count file. Without the filter every
  count runs about 28 per cent high.
- **`Site URL` may be empty on every row** even when concealment is switched
  off. If so, resolve `Site Id` through Graph rather than trying to fix the
  export.
- **Note the report's own refresh date.** Microsoft data ran three days behind
  the export date. The "data as of" line must quote Microsoft's date.

---

## Test 7. Do field office, sovereign and nonsovereign exist anywhere

**The test that decides whether four metrics on this dashboard survive as
written.**

Three places to look, in order of how much you would like the answer to be yes.

**7a. AvePoint Cloud Governance.** Export the service or request report for 20
recently provisioned sites. Look for any field holding a department, an office,
a project number, or a project type.

**Pass** Such a field exists and is populated. Then the mapping list is an
export, not a data entry exercise, and all four metrics are cheap.

**7b. The site naming convention.** Pull 200 site URLs from test 4 and look for
a pattern. The test tenant used names like `org_csd_1.4testsite`, which suggests
a convention exists.

**Pass** A reliable prefix or segment encodes the owning unit or office. Then
part of the mapping can be derived rather than typed. Check it against a sample
you know the answer for; a convention that is right 70 per cent of the time is
worse than no convention, because nobody knows which 30 per cent.

**7c. Anything at all recording project type.** Search the site columns, the
Cloud Governance metadata, and the site descriptions for sovereign, nonsovereign,
loan number, or project number.

**If all three fail** the sovereign and nonsovereign split cannot be built from
the tenant as it stands. The honest options are: add a project type column to
the mapping list and fill it by hand, join to an operational project system on a
project number that sites would first have to carry, or take the metric back to
the requester and agree it is deferred. Do not leave it on the dashboard as
though it were coming.

---

## Test 8. Put it together on one site

Once tests 3, 4 and 5 pass, produce the actual KPI for a single site and check
it by hand.

1. Take one compliant site from test 3.
2. Get its document count from test 5, files only.
3. Get its declared record count from the database:

```sql
SELECT COUNT(DISTINCT ("ListId"::text || ':' || "ItemId"::text))
FROM public."Records"
WHERE "ListId" IN (<the list GUIDs for that site's libraries>);
```

4. Divide.

**Pass** The declaration rate for that one site is a believable number, and you
can explain every document in the denominator.

**Then do the join test properly.** Query `Records` for
`ListId = '387ed159-b632-45af-b4d4-c6fd96d8ee33'`, the Annual Meetings library,
enumerate the same library through Graph, and match on `ItemId`. That is the
first end to end proof of the whole design, on data small enough to check by
hand. `ListId` was already confirmed to match SharePoint's own list GUID.

---

## What the results tell you

| If this fails | These Bankwide oversight metrics are affected |
| --- | --- |
| Test 2 | Total declared records, physical counterpart. Two metrics, and they are supposed to be the easy ones |
| Test 3 | Nine of eleven. Everything scoped to compliant sites loses its definition |
| Test 5 | Total documents, declaration rate |
| Test 6 | Total number of EDRMS users, and the figure would be wrong rather than missing, which is worse |
| Test 7 | Field office, sovereign, nonsovereign. Three metrics with no fallback |

Two metrics on this dashboard, total declared records and the physical
counterpart split, depend on none of these tests. They can be built this week.
