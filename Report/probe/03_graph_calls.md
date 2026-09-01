# Probe 3: see the numbers with your own eyes

Copy and paste calls for **Graph Explorer**, <https://aka.ms/ge>. No install and
no code. Sign in with a tenant account, paste a call, press Run, and look at the
JSON that comes back. This is the fastest way to get the "so that is where the
number comes from" moment, because you are looking at the raw data the figure
would be counted from.

Graph Explorer will prompt you to consent to a permission the first time each
call needs one. The permissions used here are `Sites.Read.All` and
`Reports.Read.All`, both read only.

Work through the steps in order. Each one says what you are looking at and which
card on the dashboard it feeds.

---

## Step 1. Every site in the tenant

**Feeds:** the denominator behind "EDRMS compliant sites"

```
GET https://graph.microsoft.com/v1.0/sites?search=*&$select=id,displayName,webUrl,createdDateTime&$top=999
```

**What you are looking at** One JSON object per site. The `id` is the composite
`hostname,siteId,webId` that every other Graph call needs.

**What to note**

- The count in `value`. In the test tenant this was 2,359.
- `createdDateTime` is present on every row. That is the source for "new sites
  created" on the Risk and compliance dashboard, and it means no admin centre
  export is needed.
- Follow `@odata.nextLink` if it appears. 999 is the page maximum, not the
  total.

**The catch** This is *every* site, not the compliant ones. Nothing in this
response tells you whether a site has the EDRMS app. That is what
`02_compliant_sites.ps1` is for, and it is why the compliant site count cannot
be produced from Graph alone.

---

## Step 2. Spot the restored sites

**Feeds:** trust in every created-date trend

```
GET https://graph.microsoft.com/v1.0/sites?search=*&$select=webUrl,createdDateTime,lastModifiedDateTime&$top=999
```

**What to look for** Any site where `createdDateTime` is **later** than
`lastModifiedDateTime`. That is impossible in normal life and usually means the
site was restored, which resets the created date.

One such site was already spotted in the test tenant, created ten days after it
was last modified.

**Why it matters** Every "sites created by month" chart is built on that date.
If it is a handful of sites, note it. If it is hundreds, the created date is not
trustworthy as a rollout measure and the chart needs a different basis.

---

## Step 3. Site usage, which gives you "active" versus "not"

**Feeds:** the "812 active, 245 not" line under the compliant sites card

```
GET https://graph.microsoft.com/v1.0/reports/getSharePointSiteUsageDetail(period='D30')
```

This returns a CSV. Graph Explorer will show it as text, or you can add
`?$format=application/json` to see it as JSON.

**Columns that matter**

| Column | Used for |
| --- | --- |
| `Site Id` | Join key back to step 1 and to the compliant site CSV |
| `Last Activity Date` | Active versus inactive. Blank means never |
| `Is Deleted` | **Filter this out.** See below |
| `File Count` | Total documents per site, and the cross check in step 4 |
| `Active User Count` | Users per site. Do not sum this, see step 5 |
| `Storage Used (Byte)` | Storage per site and per department |

**Three things that have already caught people out here**

1. **Filter `Is Deleted`.** In the test tenant, 2,359 detail rows minus 657
   deleted equalled the 1,702 in the site count file. Skip the filter and every
   count runs about 28 per cent high.
2. **`Site URL` may be empty on every row**, even with report concealment
   switched off. It was, on all 2,359 rows, while `Owner Principal Name` held
   real values. If yours is empty too, resolve `Site Id` through step 1 rather
   than trying to fix the export.
3. **Note the report's own refresh date.** Microsoft data ran three days behind
   the export date. The "data as of" line on the dashboard must quote
   Microsoft's date, not the time your job ran.

**Then produce the real number.** Join this to `compliant_sites.csv` from probe
2 on the site URL or site id:

```
active   = compliant AND Last Activity Date within 90 days
inactive = compliant AND NOT active
```

---

## Step 4. Count the documents in one site

**Feeds:** "Total documents in EDRMS compliant sites"

Pick one site id from step 1, then:

```
GET https://graph.microsoft.com/v1.0/sites/{siteId}/drives
```

**What you are looking at** One entry per document library. Note `list.id` on
each: **that is the `ListId` that joins to `public."Records"`**, and it was
verified in the test tenant to match SharePoint's own list GUID. This is the
join that makes the whole design work.

Then take one `driveId` and walk it:

```
GET https://graph.microsoft.com/v1.0/drives/{driveId}/root/delta?$select=id,name,size,file,folder,lastModifiedDateTime
```

**Count four things separately**

| Count | Why |
| --- | --- |
| Items with a `file` facet | This is your document count |
| Items with a `folder` facet | These must be excluded |
| Sum of `size` over files only | This is your storage figure |
| Sum of `size` over everything | To see the damage |

**What you should see** The last two differ noticeably. **A folder is returned
with a cumulative size**, one was observed at 5,163,738 bytes, so including
folders double counts storage badly. If your two totals are identical, you are
not reading folders correctly.

**Also note** `size` is present on every file without asking for it. Verified on
real items from 1,506 bytes up to 2,338,767. That closed a gap that had been
open for weeks.

**Now the cross check, and this is the important part.** Take the same site's
`File Count` from step 3 and compare it to your files-only count.

- **They agree within a few per cent:** the method is sound, scale it up.
- **They diverge badly:** one of them is counting something you do not want,
  usually previous versions, the preservation hold library, or Site Assets. Find
  out which now, on one site, rather than after scanning a thousand. Two
  independent sources agreeing is the only evidence that either is right.

**On scale** Use `delta`, not a full enumeration. At millions of items a full
walk on every run will be throttled. The delta token returns only what changed
after the first pass.

---

## Step 5. Watch the user double count appear

**Feeds:** "Total number of EDRMS users"

Run both, for the same period:

```
GET https://graph.microsoft.com/v1.0/reports/getSharePointActivityUserDetail(period='D30')
GET https://graph.microsoft.com/v1.0/reports/getSharePointSiteUsageDetail(period='D30')
```

**Then compare**

- From the **site** report, sum `Active User Count` across all sites.
- From the **user** report, count the rows where the user had any activity. That
  file has one row per person.

**What you should see** The second number is much smaller. The difference is
your double count: the site report counts one person once for every site they
touched.

**Why this matters more than it looks** Neither report answers the question the
card asks. The user report gives distinct people but has **no site dimension**,
so it cannot be restricted to EDRMS sites. The site report can be restricted to
EDRMS sites but has **no user identity**, so it cannot be de-duplicated. You are
choosing between the right count of the wrong population and the wrong count of
the right population.

The correct source is the unified audit log, and the free alternative available
today is distinct declarers from the database, query 5 in
`01_declared_records.sql`. See `KPI_ROW_BUILD.md` card 4 for all four options.

---

## Step 6. Unique viewers for one site

**Feeds:** "visitors per site" on Department insight

```
GET https://graph.microsoft.com/v1.0/sites/{siteId}/analytics/allTime
```

**What you are looking at** `actionCount` and `actorCount`. Verified on a test
site: `actionCount 5535, actorCount 12`. `actorCount` is genuine unique people,
which the usage CSV cannot give you at all.

**The limitation to know before designing around it** Only `allTime` and
`lastSevenDays` windows exist. There is no 30 day option, and Microsoft states
the 90 day unique viewer figure is unavailable. Any requirement asking for
unique viewers over 30 or 90 days cannot be met from this endpoint.

**One unresolved discrepancy worth reproducing.** The SharePoint site usage page
showed 22 unique viewers for a site where this call returned 12 for all time.
All time should exceed any shorter window, so either the two count different
things or the screenshot was a different site. Resolve it before building on
`actorCount`.

---

## What you will have when you finish

| Card | Real number from |
| --- | --- |
| Total declared records | Probe 1, query 2 |
| EDRMS compliant sites | Probe 2, the script output |
| Active versus not | Probe 2 joined to step 3 |
| Total documents | Step 4, one site, then scaled |
| Percentage declared | Probe 1, query 8, intersected on `ListId` |
| Total EDRMS users | Step 5 tells you which option you are choosing |

That is the whole Bankwide oversight KPI row, sourced rather than invented.
