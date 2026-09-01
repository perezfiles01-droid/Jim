# Data sources: what the tenant can actually give you

The dashboards show numbers. This file says where each of those numbers would
really come from, and what has to happen before it exists. The same information
is on the **Data sources** page inside the prototype, driven from the same list,
so the two cannot disagree.

Everything below is grounded in what was found in the test tenant `7rkd12`
during the investigation of the previous report. Where a claim comes from an
observation rather than an assumption, it says so.

---

## The one fact that shapes everything

`public."Records"` in the `drm-npr` PostgreSQL database contains **declared
records only**. It holds no row at all for a document that has not been
declared.

So every metric about declared records can be produced today with a query. Every
metric that needs a denominator, a document count, a declaration rate, a
duplicate check, cannot, because the denominator does not exist in any system
yet. That single fact explains most of the tiers below.

---

## The nine tiers

| Tier | What it means | Metrics | Who clears it |
| --- | --- | --- | --- |
| **Ready today** | A query against `public."Records"` and nothing else | 27 | Nobody. Point a query at it |
| **Document scan** | A Microsoft Graph job that enumerates files across compliant sites | 13 | Development team, one job |
| **Usage feed** | A smaller job over the M365 usage reports and Graph site analytics | 16 | Development team, one job |
| **Site mapping** | A list mapping each site to a department, field office and project type | 11 | RAC, about 1,057 rows |
| **App detection** | Knowing which sites carry the EDRMS app | 7 | Whoever deployed the app, one conversation |
| **Term store** | Read access to the managed metadata file plan term set | 7 | ITD, a permission |
| **Reference list** | A short maintained list: conventions, programme dates, go live dates | 5 | RAC secretariat |
| **Purview** | Sensitivity labels, external sharing, permission changes, audit log | 5 | Information security, a separate phase |
| **Opus** | The physical records inventory | 13 | Records and archives, a separate phase |

104 metrics in total.

---

## Tier by tier

### Ready today, 27 metrics

Everything about declared records. Total declared records, records this month
and this year, physical counterpart counts, retention and disposition dates,
classification counts, orphaned records.

Three points of detail that were established on real data and are easy to get
wrong:

- **Count distinct items, not rows.** The grain is one SharePoint item,
  identified by `ListId` plus `ItemId`, not `DocumentId`, which is nullable. In
  the test tenant, 1,990 rows resolved to 1,984 distinct `DocumentId`. Both
  `ListId` and `ItemId` are `NOT NULL`.
- **`CreatedDate` on this table is the declaration date**, not the file's
  creation date. The file's own dates need separate columns.
- **Due date for disposal is retention label applied plus duration**, confirmed
  from the live calculated column formula. It is not declaration date plus
  duration. Getting this wrong shifts every date on the Retention dashboard.

### Document scan, 13 metrics

One Microsoft Graph job that walks the drives of every compliant site and
records, per file: path, library, extension, size, created and modified dates,
and whether SharePoint marks it as a record.

What it unlocks: total documents, declaration rate, documents per department and
per library, storage per library, format groups, duplicates, and inactive
documents for the disposal summary.

Three things known about it before a line is written:

- **Graph returns `size` on every file unprompted.** Verified on real items from
  1,506 bytes to 2,338,767 bytes. No extra call is needed.
- **Folders come back as items with a cumulative size.** One observed at
  5,163,738 bytes. **The scan must filter to files only** or storage is double
  counted, badly.
- **`Item is a Record` is populated and reliable in SharePoint.** Keep matching
  against `public."Records"` anyway, as a cross check: a row where SharePoint
  says record and the database does not is a document labelled without being
  declared, which is a failure mode nobody could measure before.

The scan also needs one decision that is not technical: **what counts as a
document.** Folders, versions, system files, and documents in libraries with no
retention label mapping all move the denominator substantially.

### Usage feed, 16 metrics

A smaller job over the Microsoft 365 usage reports plus
`/sites/{id}/analytics`.

What it unlocks: active users, visitors per site, active and inactive sites,
site and library activity, most used libraries, records accessed per month, and
the search analytics.

What was found in the exports:

- **`File Count` in the usage export gives total documents per site.** 26,660
  across 977 sites in the test tenant.
- **There is no unique viewers column.** 23 columns, and `Visited Page Count` is
  unique *pages*, not people.
- **But `/sites/{id}/analytics/allTime` returns `actorCount`.** Verified at
  `actionCount 5535, actorCount 12`. That is the unique viewer source.
- **Only `allTime` and `lastSevenDays` windows exist.** There is no 30 day
  option and Microsoft states the 90 day unique viewer figure is unavailable.
  The requirement's 90 and 180 day library windows need to come from last
  activity dates in the usage export rather than from the analytics endpoint.
- **`Site URL` is empty on all 2,359 rows** of the usage CSV, while
  `Owner Principal Name` holds real values, so this is not the tenant's
  concealment setting. Resolve `Site Id` through Graph instead.
- **Filter `Is Deleted`.** 2,359 detail rows minus 657 deleted equals the 1,702
  in the site count file. Skip the filter and every count runs about 28 per cent
  high.
- **Microsoft data ran three days behind** on the export date. The "data as of"
  line must quote Microsoft's refresh date, not the job run time. The prototype
  does this.

### Site mapping, 11 metrics. The largest blocker

Every departmental figure needs it, and it does not exist.

**The cause is traced end to end.** The SharePoint column `ADBDepartmentOwner`
exists on the library, is named exactly like the `ADBMeta` key the database
expects, and is **empty on every row**. So `ADBMeta` is empty because nobody
fills in the SharePoint column. The fix is upstream of the database, and no
amount of database work reaches it.

**Do not tag 3.47 million documents.** Department is already a property of the
*site*: the drill goes department, then site, then library. Map site to
department once, about 1,057 rows, and let documents inherit from their site.
No SharePoint change and no application change.

Three things that make this cheaper:

1. **Ask AvePoint Cloud Governance first.** If it recorded the requesting
   department at provisioning, this is an export rather than data entry.
2. **Take the shortcut.** Only a minority of sites hold any documents at all: in
   the test tenant, 977 of 2,359. Fill the top 100 by document count, mark the
   rest unassigned, and every department figure becomes meaningful in an hour
   rather than a week.
3. **Add the extra columns while you are there.** The 2026.4 requirement needs
   field office and project type (sovereign, nonsovereign, corporate) on the
   same list. Three columns collected once, not three exercises.

**The question that decides easy or hard:** is it acceptable that every document
in a departmental site counts as that department? The drilldown already assumes
yes. Get it confirmed.

**Division is not needed.** The 2026.4 requirement never asks for it, so it has
been dropped from the report entirely. That removes a dependency that could not
have been met: no `ADBDivisionOwner` column was found in the library inspected.

### App detection, 7 metrics

A site is EDRMS compliant if it has the **Declare as Record button**. That
button comes from an SPFx app, found in `Apps for SharePoint`:

```
Title        digital-records-management-system-client-side-solution
Name         digital-records-management-system
App version  1.0.0.6
Product ID   {B255A2AF-7F63-4A30-966A-5D5FD99F97D7}
```

So the rule is mechanical rather than a maintained list. A Product ID does not
drift and cannot go stale, and it covers both routes to compliance, provisioned
through Cloud Governance or adopted afterwards, because either way the app ends
up installed.

**Two things to confirm with the development team, not with RAC:**

1. `Apps for SharePoint` is normally a *catalog* library, a place packages are
   stored, which is not quite the same as "installed on this site". Usually the
   same in practice, but the distinction matters for the query.
2. How to ask "which sites have this app installed" across 1,057 sites.
   Candidates: the SharePoint REST app inventory, PnP PowerShell, or the tenant
   app catalog's deployment view. Let whoever deployed it name the right one.

The question to ask: *"The EDRMS button comes from app
{B255A2AF-7F63-4A30-966A-5D5FD99F97D7}. How do we query which sites have it
installed?"* Also ask whether app version is tracked, because sites on different
versions would be a useful health metric in itself.

**Two candidates already ruled out:** `Root Web Template` does not distinguish
EDRMS sites, both test sites report "Team Site" along with 2,078 of 2,359 in the
tenant. And a maintained list of compliant site URLs works but needs an owner
and goes stale; the app marker needs neither.

### Term store, 7 metrics

The file plan lives in the SharePoint managed metadata term store. Needs read
access and agreement on which term set is the institutional file plan.

Note that business process on the Records management dashboard is the same
thing seen from the records side: a record's business process is the branch of
the file plan it was filed against. If the two ever disagree, it is because a
term was renamed or deprecated after records were filed against it.

### Reference lists, 5 metrics

Conventions (link, approval date, version, last updated), the records management
programme dates, and departmental go live dates. Nothing generates these. They
are short lists someone maintains, and they are the cheapest metrics in the
whole report.

### Purview, 5 metrics

Sensitivity labels, external sharing, permission exceptions and access requests
come from Microsoft Purview and the unified audit log. Different connector,
usually a different owner, and an audit log retention window that has to be long
enough to report over. Plan it as a phase, not as missing data.

**One definition to settle first.** A *sensitivity label* is a Purview label on
the file. A *classification level* is EDRMS metadata set at declaration. They
are different fields and a record can have one without the other. Section 9 of
the requirement asks for both; make sure everyone knows which is which.

### Opus, 13 metrics

The whole Archives holdings dashboard. Physical files, legacy records, boxes,
facilities, transfers, verification status. None of it is in SharePoint and none
of it can be derived from the EDRMS database. Plan it as a phase.

---

## Retention label mapping, a level of its own

The Retention Label Mapping list is not a tier, it is a gate, and it operates at
a different level from site compliance.

| Level | Rule | Governs |
| --- | --- | --- |
| Site | The EDRMS app is installed | Is this site compliant? |
| Library | Appears in the Retention Label Mapping list | Can a document here be declared at all? |

Both can be true at once, and in the test tenant they were: a real library, full
of real documents, inside a compliant site, where declaration **failed** with
*"No Library and Retention Label Mapping found"*.

This matters for the declaration rate. Documents in unmapped libraries are
**undeclarable**, not undeclared. Counting them in the denominator means the
rate can never reach 100 per cent, however well everyone behaves.

---

## Build order

1. **The two jobs.** The document scan and the usage feed unlock 29 metrics
   between them and depend on nobody's decision.
2. **The site mapping list.** 11 metrics, and it makes every department figure
   in the report real. Ask AvePoint first, take the top 100 shortcut.
3. **The app detection question.** 7 metrics for one conversation. The cheapest
   thing on this list per metric unlocked.
4. **Term store access.** 7 metrics for a permission.
5. **The reference lists.** 5 metrics for an afternoon.
6. **Purview**, then **Opus**, as separate phases with their own owners.
