# Where every number on Bankwide oversight came from

Honest provenance for each figure on the dashboard, and the exact command that
replaces it with a real one.

---

## The short version

**None of the numbers on the dashboard are measured.** They are illustrative
samples, shaped to look like ADB at this stage of rollout so the layout could be
judged. Read the chip on each card as the answer to "where would the real number
come from", not as a claim that the number shown is real.

Specifically, **1,057 has a traceable but unflattering history.** It was a
hard coded placeholder in the previous prototype:

```js
// old Sites and Libraries dashboard, line 317
const ALLTIME_SITES = 1057;
```

I carried it into the new report and split it across 15 departments so it would
sum back to the same figure, which is why ITD has 112 sites and OAS has 40.
Those department numbers are invented too. Nobody has ever counted ADB's EDRMS
compliant sites, because **the compliance test itself has never been run against
the tenant.**

---

## What has actually been measured

This is the complete list of real observations from the test tenant `7rkd12`.
Everything else in the prototype is illustrative.

| Real figure | Value | How it was obtained |
| --- | --- | --- |
| Sites in the tenant | 2,359 | Rows in the M365 site usage detail export |
| Sites after removing deleted | 1,702 | 2,359 minus 657 where `Is Deleted` is true. Reconciles exactly with the site count file |
| Sites holding any documents | 977 | Usage export, `File Count` greater than zero |
| Documents across those sites | 26,660 | Sum of `File Count` in the usage export |
| Sites reporting "Team Site" template | 2,078 | Root web template, which is why it was ruled out as a compliance marker |
| Rows in `public."Records"` | about 1,990 | Direct query, UAT |
| Distinct `DocumentId` in those rows | 1,984 | Same query. The six row gap is why the report counts distinct items |
| One test site's libraries | 22 | `org_csd_1.4testsite` |
| One test site's files | 2,547, 18.7 GB | Same site |
| One test site's created date | 2025-09-25 | `GET /sites?search=*`, `createdDateTime` |
| Unique viewers, one site, all time | `actionCount 5535, actorCount 12` | `GET /sites/{id}/analytics/allTime` |
| The EDRMS app Product ID | `{B255A2AF-7F63-4A30-966A-5D5FD99F97D7}` | Found in `Apps for SharePoint` on the EDRMS test site, version 1.0.0.6 |
| `ADBDepartmentOwner` population | zero rows | Column exists on the library, empty on every row |

Note what is missing from that list: **there is no measured count of compliant
sites anywhere.** 2,359 is every site in a test tenant. 1,702 is every live
site. Neither is the number the card is asking for.

---

## Card by card

### EDRMS compliant sites, shown as 1,057

| | |
| --- | --- |
| **Where the 1,057 comes from** | A placeholder in the previous prototype. Not measured |
| **Nearest real figure** | 1,702 live sites in the test tenant, but that is all sites, not compliant ones |
| **Real source** | Site inventory from Graph, filtered to sites where the EDRMS app is installed |
| **The rule** | A site is compliant if app `{B255A2AF-7F63-4A30-966A-5D5FD99F97D7}` is installed on it. That app puts the Declare as Record button on the site |
| **Run** | `probe/02_compliant_sites.ps1` |
| **You will get** | A CSV with one row per site and a true or false compliance flag, plus the count printed at the end. That count is your real 1,057 |

The sublabel "812 active, 245 not" is a second metric on the same card and comes
from somewhere else: the site usage report's `Last Activity Date` column, joined
to the compliant list. The script collects the compliant list; step 3 of
`probe/03_graph_calls.md` gets the activity dates.

### Total declared records, shown as 421,646

| | |
| --- | --- |
| **Where the 421,646 comes from** | The sum of 15 invented department figures |
| **Nearest real figure** | 1,984 distinct documents in UAT. The production database will be far larger |
| **Real source** | `public."Records"` in `drm-npr` |
| **The rule** | Count distinct `ListId` plus `ItemId`, not `COUNT(*)`, because one item can carry two declaration rows |
| **Run** | `probe/01_declared_records.sql`, queries 1 to 3 |
| **You will get** | The real total in about thirty seconds. **This is the one number on the dashboard you can make real today** |

### Total documents in EDRMS compliant sites, shown as 3,472,880

| | |
| --- | --- |
| **Where the 3,472,880 comes from** | Invented, sized to make the declaration rate land near 12 per cent |
| **Nearest real figure** | 26,660 documents across 977 sites in the test tenant |
| **Real source** | Microsoft Graph, walking the drives of each compliant site, counting items that have a `file` facet |
| **Blocked by** | The compliant site list. You cannot count documents in compliant sites until you know which sites those are |
| **Run** | `probe/03_graph_calls.md`, step 4, on one site first |
| **You will get** | A real document count for one site, and a cross check against that site's `File Count` in the usage export |

### Percentage of documents declared as records, shown as 12.1 per cent

| | |
| --- | --- |
| **Where it comes from** | Pure division of the two invented numbers above. It is not independently invented |
| **Real source** | Both of the above, intersected on `ListId` so numerator and denominator describe the same libraries |
| **Run** | `probe/01_declared_records.sql`, query 6, once you have scan output |

### Total number of EDRMS users, shown as 4,318

| | |
| --- | --- |
| **Where the 4,318 comes from** | The sum of 15 invented department figures |
| **Real source** | Contested. See `KPI_ROW_BUILD.md` card 4. The two standard reports each give half the answer |
| **Run** | `probe/03_graph_calls.md`, step 5, which shows the size of the double count on your own tenant |
| **Free alternative available today** | Distinct people who declared a record this month, from `public."Records"`. Query 5 in the SQL file |

### The site status panel, active, inactive and orphaned by department

Every bar is invented. The department split additionally needs the site to
department mapping list, which does not exist. The three groupings, department,
field office and project type, are three cuts of the same invented 1,057.

Field office and project type are the two with no known source anywhere. See
`TESTS.md` test 7.

---

## How to run the simulation

Three files in `probe/`. Run them in this order. The first two need nothing you
do not already have.

**1. `probe/01_declared_records.sql`**
Six queries against `drm-npr`. Ten minutes. Makes one KPI card real and tells
you the true column names for everything else.

**2. `probe/02_compliant_sites.ps1`**
Produces the real compliant site count. Run it with `-SampleSize 20` first, which
takes a couple of minutes and tells you what the full run will cost, then with
`-SampleSize 0` for everything.

```powershell
# prove the method on 20 sites, and time it
.\02_compliant_sites.ps1 -TenantName adb -SampleSize 20

# then the real thing
.\02_compliant_sites.ps1 -TenantName adb
```

**3. `probe/03_graph_calls.md`**
Copy and paste calls for Graph Explorer at <https://aka.ms/ge>. No install, no
code, you sign in and click Run. This is the quickest way to get the "so that is
where the number comes from" moment, because you see the raw JSON that the
figure would be counted from.

---

## What to do with the results

Put your real numbers into `src/data.js` and rebuild. The prototype will then
show your tenant instead of my samples, and the reconciliation assertions will
tell you immediately if two of your figures disagree.

The five values to replace first are at the top of `src/data.js`, in
`DEPT_ROWS`. Until the site to department mapping exists you will not have
department level figures, so the honest interim move is to put the bank wide
totals in a single row labelled "All departments" and let the department split
arrive later.

Change one thing at a time and run `node verify.js` after each. If an assertion
fires, two of your numbers contradict each other, which is a finding rather than
a bug.
