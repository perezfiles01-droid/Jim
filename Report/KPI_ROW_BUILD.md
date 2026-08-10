# Building the Bankwide oversight KPI row

The five cards at the top of the Bankwide oversight dashboard, taken one at a
time: what each is based on now, what it would really be based on, whether it
can be built today, and the exact steps to prove it.

**Verdict up front: one of the five can be built today. One cannot be built
correctly as written at all. The other three are blocked on two jobs and one
question, in a chain.**

| # | Card | Today? | Blocked on |
| --- | --- | --- | --- |
| 2 | Total declared records | **Yes** | Nothing |
| 5 | EDRMS compliant sites | No | App detection, plus the usage feed for its "812 active" line |
| 1 | Total documents in compliant sites | No | Card 5 first, then the document scan |
| 3 | Percentage declared | No | Cards 1 and 2, then an intersection rule |
| 4 | Total number of EDRMS users | **Not as written** | See card 4. Three options, all imperfect |

Note the chain. Card 5 is not just one of five, it is the prerequisite for cards
1 and 3. Do it first.

One piece of good news before the detail: **the KPI row does not need the site
to department mapping list.** That is only needed to split these totals, which
is the panel below. The five headline numbers need the compliant site list, the
scan, the usage feed and the database, and nothing else.

---

## A note on what the prototype is based on

In the prototype, all five cards are derived from one array in
`src/data.js`, `DEPT_ROWS`, one row per department:

```
[code, name, goLive, sites, sitesActive, sitesInactive, libraries,
 docs, records, physical, users, visitors, storageGB]
```

and the totals are summed from it:

```js
T.docs    = sum(DEPTS, "docs")        →  card 1
T.records = sum(DEPTS, "records")     →  card 2
PCT(T.records, T.docs)                →  card 3
T.users   = sum(DEPTS, "users")       →  card 4
T.sites   = sum(DEPTS, "sites")       →  card 5
T.sitesActive / T.sitesInactive       →  card 5 sublabel
```

That structure exists so the dashboard cannot disagree with Department insight.
It is **not** how you would build it in production. In production these five are
independent counts and the department split is a separate query. Do not let the
prototype's shape dictate the warehouse's shape.

---

## Card 2. Total declared records, 421,646

### Buildable today. This is the only one.

**System** `drm-npr`, PostgreSQL, schema `public`, table `Records`.

**Columns it rests on**

| Column | Why it matters |
| --- | --- |
| `ListId` | SharePoint list GUID. `NOT NULL`. Confirmed to match SharePoint's own list GUID |
| `ItemId` | Item id within that list. `NOT NULL` |
| `DocumentId` | **Do not key on this.** It is nullable |
| `CreatedDate` | The **declaration** date, not the file's creation date |
| `ModifiedDate` | Modification of the record row |
| soft delete flag | Name to be confirmed by test 1 below |

**The formula**

```sql
SELECT COUNT(DISTINCT ("ListId"::text || ':' || "ItemId"::text)) AS total_declared_records
FROM public."Records"
WHERE <soft delete flag> IS NOT TRUE;
```

**Why distinct and not `COUNT(*)`** One SharePoint item can carry two
declaration rows. In the UAT tenant, 1,990 rows resolved to 1,984 distinct
documents. `COUNT(*)` inflates this card and everything derived from it. The
grain of this report is one SharePoint item, identified by `ListId` plus
`ItemId`.

**The companion figure on the same card family**, declared records with a
physical counterpart:

```sql
SELECT COUNT(DISTINCT ("ListId"::text || ':' || "ItemId"::text))
         FILTER (WHERE <physical flag> IS TRUE) AS with_physical
FROM public."Records"
WHERE <soft delete flag> IS NOT TRUE;
```

### Test 1. Ten minutes, run it today

**Step 1.** Get the real column names, because every design document is a
proposal and only the database is authoritative.

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'Records'
ORDER BY ordinal_position;
```

**Step 2.** Run the two queries above using the names step 1 returned.

**Step 3.** Sanity check the declaration date range, which tells you whether
`CreatedDate` really is the declaration date:

```sql
SELECT MIN("CreatedDate"), MAX("CreatedDate"), COUNT(*)
FROM public."Records";
```

**Pass** You get three numbers: rows, distinct items, and with physical.
Distinct is less than or equal to rows. The date range starts around the first
department go live rather than years earlier.

**If distinct is much lower than rows**, that gap is a real finding. Quote it as
"records declared twice" and take it to RAC, since it is one of the open
decisions.

**If `with_physical` is zero**, the physical counterpart is not being captured
and one card on this dashboard has no source.

---

## Card 5. EDRMS compliant sites, 1,057, and "812 active, 245 not"

### Not buildable today. And it is two metrics on one card.

The big number needs app detection. The line underneath needs the usage feed.
They can arrive separately, and the number can be published before the split.

**The definition, from the client** A site is EDRMS compliant if it has the
Declare as Record button. That button comes from an SPFx app:

```
Title        digital-records-management-system-client-side-solution
Name         digital-records-management-system
Product ID   {B255A2AF-7F63-4A30-966A-5D5FD99F97D7}
Version      1.0.0.6
```

So the rule is mechanical. A Product ID cannot go stale, and it covers both
routes to compliance, provisioned through Cloud Governance or adopted
afterwards, because either way the app ends up installed.

**Sources and columns**

| Part of the card | Source | Fields |
| --- | --- | --- |
| The site list | Graph `GET /sites?search=*` | `id`, `displayName`, `webUrl`, `createdDateTime` |
| Is it compliant | PnP `Get-PnPApp -Scope Site` per site | `Id`, `Title`, `InstalledVersion` |
| Active or not | Graph `getSharePointSiteUsageDetail` | `Last Activity Date`, `Site Id`, `Is Deleted` |
| Orphaned | Entra ID lookup on the site owner | owner UPN resolves to an active account |

**The formula**

```
compliant  = sites where an installed app has Id = B255A2AF-7F63-4A30-966A-5D5FD99F97D7
active     = compliant AND last activity within 90 days
orphaned   = compliant AND site owner does not resolve to an active account
inactive   = compliant AND NOT active AND NOT orphaned
```

Orphaned is deliberately checked before inactive, so a site that is both is
counted once. That is what makes the three add to 1,057.

### Test 2. The decisive test on this dashboard

**Make it a discriminating test.** A query that returns the app everywhere
proves nothing, because it would mean you are reading the tenant app catalog
rather than per site installation. `Apps for SharePoint` is normally a catalog
library, which is a place packages are stored, not a statement that a site has
the app installed. That distinction is the whole test.

**Step 1.** Install PnP PowerShell.

```powershell
Install-Module PnP.PowerShell -Scope CurrentUser
```

**Step 2.** Run it against a site you know is EDRMS enabled.

```powershell
Connect-PnPOnline -Url https://<tenant>.sharepoint.com/sites/org_csd_1.4testsite -Interactive
Get-PnPApp -Scope Site | Select-Object Id, Title, InstalledVersion, AppCatalogVersion
```

**Step 3.** Run exactly the same thing against a site you know is **not** EDRMS
enabled.

**Pass** The first returns the Product ID above. The second does not.

**Fail, both return it** You are reading the catalog. Try `-Scope Tenant` versus
`-Scope Site` and compare, and if that does not separate them, ask the
development team the direct question below.

**Fail, neither returns it** The app may be deployed differently, for example
tenant wide deployment, which installs it everywhere without a per site record.
If so, app installation cannot distinguish compliant sites and you need a
different marker. This is the outcome that would hurt, so find out early.

**Step 4.** Scale to 20 sites and time it.

```powershell
$appId  = "b255a2af-7f63-4a30-966a-5d5fd99f97d7"
$sites  = Get-PnPTenantSite -IncludeOneDriveSites:$false | Select-Object -First 20
$sw     = [Diagnostics.Stopwatch]::StartNew()
$result = foreach ($s in $sites) {
  try {
    Connect-PnPOnline -Url $s.Url -Interactive -ErrorAction Stop
    $app = Get-PnPApp -Scope Site -ErrorAction SilentlyContinue |
           Where-Object { $_.Id -eq $appId }
    [pscustomobject]@{ Url=$s.Url; Compliant=[bool]$app; Version=$app.InstalledVersion }
  } catch {
    [pscustomobject]@{ Url=$s.Url; Compliant="ERROR"; Version=$_.Exception.Message }
  }
}
$sw.Stop()
$result | Group-Object Compliant | Select-Object Name, Count
"{0:N1} seconds for {1} sites" -f $sw.Elapsed.TotalSeconds, $sites.Count
```

**Pass** A mixture of true and false, no errors, and a per site time you can
multiply by 53 to get the real cost of the full sweep. If 20 sites take two
minutes, the full run is about two hours, which is a nightly job, not a live
query. That is worth knowing before anyone promises a refresh interval.

**Also capture `InstalledVersion`.** Sites on different versions of the app are
a useful health metric in their own right, and it is free once you are already
enumerating.

**The question to ask if the test fails**

> The EDRMS Declare as Record button comes from app
> {B255A2AF-7F63-4A30-966A-5D5FD99F97D7}. How do we query which sites have it
> installed, across about 1,057 sites? And is the app version tracked per site?

That is a five minute conversation with whoever deployed it, not a decision
anybody has to make.

**Two candidates already ruled out.** `Root Web Template` does not distinguish
EDRMS sites: both test sites reported "Team Site", along with 2,078 of the 2,359
sites in the tenant. And a maintained list of compliant site URLs works but
needs an owner and goes stale.

---

## Card 1. Total documents in EDRMS compliant sites, 3,472,880

### Not buildable today. Needs card 5 first, then the scan.

This is the card that cannot even be defined until card 5 is answered. "In
EDRMS compliant sites" is a filter, and you cannot apply a filter you cannot
evaluate.

**Source** Microsoft Graph, walking the drives of every compliant site.

**Endpoints and fields**

```
GET /sites/{siteId}/drives
    → id, name, webUrl, list.id            (list.id is your ListId join key)

GET /drives/{driveId}/root/delta?$select=id,name,size,file,folder,lastModifiedDateTime,parentReference
    → per item: id, name, size, file facet, folder facet, lastModifiedDateTime
```

**The formula**

```
total_documents = COUNT(items)
                  WHERE the `file` facet is present
                    AND the `folder` facet is absent
                    AND the drive belongs to a compliant site
```

**Three things already established about this scan, before anyone writes it**

1. **Graph returns `size` on every file unprompted.** Verified on real items from
   1,506 bytes to 2,338,767 bytes. No second call needed.
2. **Folders come back as items with a cumulative size.** One was observed at
   5,163,738 bytes. Include folders and you double count both documents and
   storage, badly.
3. **Use `delta`, not a full walk.** At 3.47 million items a full enumeration
   every run will be throttled. The delta token returns changes only after the
   first pass.

**The decision this card needs, which is not technical**

What counts as a document? Each of these moves the number materially, and
therefore moves the declaration rate on card 3:

| Population | Include? | Effect if included |
| --- | --- | --- |
| Folders | **No**, settled | Double counts |
| Previous versions | Undecided | Can multiply the count several times over |
| System libraries: Site Assets, Style Library, Form Templates | Probably not | Adds tens of thousands of files nobody thinks of as documents |
| Preservation hold library | Probably not | Adds copies of documents already counted |
| Documents in libraries with **no retention label mapping** | **Undecided, and it matters most** | These are undeclarable, not undeclared. Counting them caps the declaration rate below 100 per cent permanently |

Get that last row decided before this card is published. It is one of the open
RAC questions.

### Test 3. Prove the scan on one site, then cross check it

**Step 1.** In Graph Explorer, list the drives for one known site.

**Step 2.** Run the delta call on one drive and count separately:

- items with a `file` facet, your document count
- items with a `folder` facet, which must be excluded
- the sum of `size` over files only
- the sum of `size` over everything, to see the damage

**Pass** The two size totals differ noticeably. If they are the same you are not
reading folders correctly.

**Step 3, the important one.** Take the same site from the M365 SharePoint site
usage report and compare its `File Count` column to your file only count.

**Pass** They agree within a few per cent.

**If they diverge badly** one of the two is counting something you do not want,
usually versions or system libraries. Find out which now, on one site, rather
than after scanning 1,057. Two independent sources agreeing is the only evidence
either is right.

This cross check is worth doing precisely because it has been done partially
before: `File Count` in the usage export gave 26,660 documents across 977 sites
in the test tenant.

---

## Card 3. Percentage of documents declared as records, 12.1 per cent

### Derived from cards 1 and 2. It arrives when card 1 does.

But it carries a trap that is easy to miss and hard to unpick later.

**The wrong formula**

```
rate = total_declared_records / total_documents
```

This is wrong whenever the two counts cover different populations, and they will.
`public."Records"` contains declarations from every site that has ever declared
anything, including sites that are now archived, deleted, or outside whatever
scope the scan runs over. The scan covers the compliant sites as they exist
today. Divide one by the other and you get a rate whose numerator includes
records the denominator never saw.

**The right formula: intersect on `ListId`**

```sql
WITH scanned AS (
  SELECT list_id FROM <scan output> WHERE site_is_compliant
)
SELECT
  (SELECT COUNT(DISTINCT ("ListId"::text||':'||"ItemId"::text))
     FROM public."Records"
    WHERE "ListId" IN (SELECT list_id FROM scanned))::numeric
  /
  (SELECT COUNT(*) FROM <scan output> WHERE is_file AND site_is_compliant)
  * 100 AS declaration_rate;
```

Both numerator and denominator now describe exactly the same set of libraries.

**A useful by-product.** Run the numerator without the filter as well. The
difference is declared records living in libraries your scan did not cover,
which is either a scope bug or a genuine population of records in
non-compliant or archived sites. Either way you want to know the number.

**The second trap.** SharePoint's own `Item is a Record` flag is populated and
reliable. Keep matching it against `public."Records"` as a cross check, not as a
substitute: any item where SharePoint says record and the database has no row is
a document that was labelled without being declared. That is a failure mode
nobody could measure before, and the scan gives it to you for free.

---

## Card 4. Total number of EDRMS users, 4,318, monthly active

### The hardest card on the row, and it cannot be built correctly as written from the standard usage reports.

The problem is that the requirement asks for two things at once: **distinct
users** and **scoped to EDRMS compliant sites**. The two standard Microsoft
reports each give you one and not the other.

| Report | Gives you | Missing |
| --- | --- | --- |
| `getSharePointActivityUserDetail` | One row per **user**. Distinct count is correct | No site dimension. Covers all of SharePoint, not just EDRMS sites |
| `getSharePointSiteUsageDetail` | One row per **site**, with an active user count | No user identity. Summing across sites counts one person once per site they touched |

So neither answers the question on its own. You have four options.

**Option A. `getSharePointActivityUserDetail`, distinct users.**
Cheap and the count is correct, but it is "people who used SharePoint", not
"people who used the EDRMS". In a tenant where SharePoint is used for everything,
this overstates EDRMS adoption substantially. **Do not label this "EDRMS users".**

**Option B. Sum active users across compliant sites only.**
Right scope, wrong count, and wrong in the unhelpful direction: it is an upper
bound that could be several times the truth. Usable as a clearly labelled upper
bound while something better is built. Never as the headline.

**Option C. The unified audit log. The correct answer.**
Count distinct `UserId` over file and page operations where the site is in the
compliant set, over 30 days. Right scope and right count.

Costs: needs Purview audit access, which is a different owner; the audit
retention window is 90 or 180 days depending on licence, so this is inherently a
rolling measure and cannot be back-filled; and the query is heavy at bank scale,
so it wants to be a scheduled extract rather than an ad hoc search.

**Option D, worth raising with the requester.** If what the committee actually
means is "people using the EDRMS as a records system", then **distinct people
who declared a record this month** is available today, from `public."Records"`,
for free, if a declared-by column exists. It is a narrower and arguably more
honest measure of EDRMS adoption than "opened a file in a site that happens to
have the app installed".

Check for it in the output of test 1, then:

```sql
SELECT COUNT(DISTINCT <declared by column>) AS distinct_declarers_last_30_days
FROM public."Records"
WHERE "CreatedDate" >= NOW() - INTERVAL '30 days';
```

**Recommendation** Build option C. Publish option B as a labelled upper bound in
the meantime. Put option D on the page as well, because it is free, it is
available today, and it may be closer to what was meant.

### Test 4. Measure your own double count

**Step 1.** In Graph Explorer, run both for the same period:

```
GET /reports/getSharePointActivityUserDetail(period='D30')
GET /reports/getSharePointSiteUsageDetail(period='D30')
```

**Step 2.** From the second, sum the active user count across all sites.
From the first, count rows where the user had any activity.

**Pass** The second number is smaller, probably much smaller. The gap is your
double count, measured on your own tenant rather than assumed.

**Step 3, while you are in the site usage report**, check three things that have
already caught people out here:

- **Filter `Is Deleted`.** In the test tenant, 2,359 detail rows minus 657
  deleted equalled the 1,702 in the site count file. Without the filter, every
  count runs about 28 per cent high.
- **`Site URL` may be empty on every row** even when report concealment is off.
  It was, on all 2,359 rows, while `Owner Principal Name` held real values. If
  so, resolve `Site Id` through Graph rather than trying to fix the export.
- **Note the report's own refresh date.** Microsoft data ran three days behind
  the export date. The "data as of" line must quote Microsoft's date, not your
  job's run time. The prototype already does this.

---

## Links

I could not reach `learn.microsoft.com` from the environment this was written
in, so these are given with the exact API operation name alongside in case a URL
has moved. Search the operation name on Microsoft Learn if a link fails.

**Tools**

- Graph Explorer, for every Graph call above: <https://aka.ms/ge>
- PnP PowerShell installation: <https://pnp.github.io/powershell/articles/installation.html>

**Graph API reference** (operation name, then link)

- `getSharePointActivityUserDetail`
  <https://learn.microsoft.com/en-us/graph/api/reportroot-getsharepointactivityuserdetail>
- `getSharePointSiteUsageDetail`
  <https://learn.microsoft.com/en-us/graph/api/reportroot-getsharepointsiteusagedetail>
- `driveItem: delta`
  <https://learn.microsoft.com/en-us/graph/api/driveitem-delta>
- `drive: list` for a site's document libraries
  <https://learn.microsoft.com/en-us/graph/api/drive-list>
- `site: search` and `site: list`
  <https://learn.microsoft.com/en-us/graph/api/site-search>
- Graph throttling guidance, read this before the scan
  <https://learn.microsoft.com/en-us/graph/throttling>

**PnP PowerShell cmdlets**

- `Get-PnPApp` <https://pnp.github.io/powershell/cmdlets/Get-PnPApp.html>
- `Get-PnPTenantSite` <https://pnp.github.io/powershell/cmdlets/Get-PnPTenantSite.html>

**Audit log, for card 4 option C**

- Purview audit search <https://learn.microsoft.com/en-us/purview/audit-search>
- `Search-UnifiedAuditLog`
  <https://learn.microsoft.com/en-us/powershell/module/exchange/search-unifiedauditlog>

**Permissions you will need**

| For | Permission |
| --- | --- |
| The usage reports | `Reports.Read.All` |
| Sites and drives | `Sites.Read.All` |
| App inventory per site | SharePoint administrator |
| Audit log | Purview audit reader, or Exchange Online PowerShell with the audit role |

Note that the usage reports return obfuscated user and site names unless report
concealment is switched off in the Microsoft 365 admin centre, under Reports
settings. It was already switched off in the test tenant, which is how the empty
`Site URL` column was identified as a separate problem rather than concealment.

---

## The order to do this in

1. **Test 1, the SQL.** Ten minutes, confirms card 2 outright, and gives you the
   real column names for everything else. Also answers whether card 4 option D
   is available.
2. **Test 2, the app detection.** One conversation and one script. Unblocks card
   5 and gives cards 1 and 3 their scope.
3. **Test 3, one site scan cross checked against `File Count`.** Proves the
   method and settles whether two independent sources agree.
4. **Test 4, the two user reports.** Measures the double count and forces the
   card 4 decision onto real numbers.
5. Only then commit to a build estimate for the scan and the usage feed.

Card 2 can go into production this week. Card 5 can follow within days of the
app detection question being answered. Cards 1 and 3 follow the scan. Card 4
needs a decision from the requester before it needs any engineering at all.
