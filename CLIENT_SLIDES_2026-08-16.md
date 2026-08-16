# Client slides received 16 August 2026

Ten images supplied by the client on 16 August 2026, in two batches. Batch A is
slides 1 to 5 below, the Bank-wide tables and Project Insights. Batch B is slides
6 to 10, **the drill tables that sit behind five of the Bank-wide top tiles.** **The image files themselves
are not in the repo.** They arrived as chat attachments and could not be written
to disk. This file is the transcription, so the content survives without them.
If the PNGs are later added, name them `slide_2026-08-16_1.png` to `_5.png` and
link them from here.

Each section records what the slide shows, then what it means for the project.
Where a claim is an inference rather than something read off the slide, it says so.

---

## Slide 1. Record declaration trend, with a date range picker

**What is drawn.** A single line with a shaded area beneath it. X axis Jan to Dec,
Y axis 0 to 25k with gridlines at 6.25k, 12.5k, 18.75k, 25k. Twelve plotted
points. Top right: **Date range 01/01/2026 to 12/31/2026**, two date input boxes
each with a calendar picker icon.

**Two findings.**

**1. The client's curve is cumulative. Ours is not.** The line rises
monotonically from roughly 2.5k in January to 25k in December, with the slope
flattening. That is a running total of records declared to date. The prototype
draws `DATA.MONTH_VALUES` as twelve independent bars, and `check_data.js` asserts
those twelve **sum** to `DECLARED`. Those are different charts telling different
stories: ours answers "how much was declared in March", theirs answers "how much
had been declared by March". Both are legitimate and both are sourceable from the
same column. **The client drew the cumulative one.** This needs a decision, and
if we change it the reconciliation assert has to change with it, because a
cumulative series does not sum to the total, its **last point** equals the total.

**2. A day level date picker, and here it is legitimate.** The 12 August decision
"no day level picker" was taken for the **usage panels**, where a week is the
smallest unit the M365 usage data holds, so a request for 8 to 15 January could
only be answered with a wrong number. **That reasoning does not apply here.** The
declaration trend comes from `public."Records"`, which carries a per document
declaration timestamp. An arbitrary day range is exactly answerable. So this
picker can be built, and building it does not reopen the earlier decision. Worth
recording explicitly, because the rule looks like it forbids this and does not.

Note the American date format `01/01/2026` / `12/31/2026`. Ours uses `13 Dec 2023`
style elsewhere on the same deck, see slide 5. The client's own deck is
inconsistent; not a decision for us to take silently.

---

## Slide 2. Bank-wide, the department table

Header **EDRMS Bank-wide oversights**. Callout top left: "Number of active EDRMS
SharePoint sites for **Department, RM, office**".

| Department / office / RM | Number of EDRMS SharePoint sites | Total number of documents | Total number of records declared | Total number of physical counterparts |
| --- | --- | --- | --- | --- |
| Alphabetical list of all Departments, offices, RMs. | # | # | # | # |
| BIOC, Office of Business Intelligence and Operations Coordination | | | | |
| BPMSD, Budget, People, and Management Systems Department | | | | |
| CCSD, Climate Change and Sustainable Development Department | | | | |
| Etc. | | | | |

BIOC is rendered as a hyperlink, the rest as plain text, illustrating the
clickable state.

**Note 1.** "Each department/office/RM name should be clickable so that when you
click on the name, it opens the Dashboard for that department/office/RM. The
Nonsovereign projects / sovereign projects should also be clickable, taking the
user to Project insights."

**Note 2.** "Include indicators for no. of sites created, sites deleted, sites
archived, inactive site for 90 days".

**What it means.**

**The unit is not "department". It is department, office or RM.** Three kinds of
organisational unit in one alphabetical list. The prototype's Department Insights
picker carries 16 departments. Whether offices and resident missions are inside
that 16, or are a longer list we have never seen, is **unknown and needs asking**.
This matters for the Cloud Governance `Department` column: **240 of 1,032 sites
carry several semicolon separated values**, and one plausible explanation is that
those values mix departments with offices and RMs rather than genuinely spanning
several departments. That is a hypothesis, not a finding. It can be tested by
reading the distinct values in `evidence_CloudGovernance_WorkspaceReport_2026-08-14.csv`
and seeing whether the multi-valued rows combine like with like.

**Note 2 is now mostly answerable, and it was not before 14 August.** Of the four
indicators asked for:

| Indicator | Source | State |
| --- | --- | --- |
| Sites created | CG `Created Time` | Available. Site creation, **not** EDRMS go-live, see `STATUS.md` section 6 |
| Sites deleted | CG `Site Status` = Deleted | Available. Was "needs new column or join" |
| Sites archived | CG `Status` = Archived | Available. Was blocked on "no definition" |
| Inactive site for 90 days | CG `Last Active Time` | Available, 100% populated, against 381 of 1,918 from the M365 export |

**"inactive site for 90 days" on the client's own slide.** Open question 6 was
"the deck says 90, the metrics document says 300". This is the deck saying 90 for
the second time, on a slide the client sent this week. It does not close the
question by itself, since the metrics document still says 300 and only the client
can reconcile their own two documents, but it should now be put to them as
"your deck says 90 twice, your metrics document says 300, which governs".

**"Total number of physical counterparts" is a column of this table**, not just a
top tile. That is S/N 7. It is sourceable: `T1 c27 HasPhysical`, from the
`EDRMSMeta` key of the same name in `Records`. The prototype already computes
`WITH_PHYSICAL` and shows it on Bank-wide, Department and Project. **What is
missing is this table's column**, not the measure. Note the distinction that
`STATUS.md` blurs in two places: counting records **flagged** as having a physical
counterpart is buildable today; the **physical inventory** of boxes, locations and
facilities has no source anywhere and stays cut.

---

## Slides 3 and 4. Sovereign and Nonsovereign project tables

Same five column shape as the department table, keyed on project instead.

**Sovereign projects.** Callout: "**Total** Number of active EDRMS SharePoint
sites for **Sovereign projects**". Row header reads "Sovereign projects
(format?) / Project Number / Project Name?" in orange, so **the client is
themselves unsure what the row key should be.** Examples:

- 54461-003, Loan 4723-INO: Boosting Productivity Through Human Capital Development (Subprogram 3)
- 58499-001, Grant 0998-NEP: 2024 Floods and Landslides Emergency Response
- 57318-001, Grant 0923-VAN: Tropical Cyclone Lola Emergency Response Project

**Nonsovereign projects.** Same shape.

- 57298-002, TA 10304-PAK: Bio Tech Energy Sustainable Aviation Fuel Project
- 56189-001, Tiger Digital Infrastructure for Rural Connectivity Project
- 55106-001, ECOM COVID-19 Smallholder Farmer Climate Resilience and Livelihood Support Project

Both carry the same clickable note as slide 2.

**What it means.** The project number format is now known: **five digits, hyphen,
three digits**, `54461-003`. The project name embeds the instrument and country,
`Loan 4723-INO`, `Grant 0998-NEP`, `TA 10304-PAK`, though 56189-001 and 55106-001
do not, so that is a convention rather than a rule.

**This does not unblock anything.** The blocker was never the format. It is that
**nothing in any source we hold classifies a SharePoint site as a project site,
or maps it to a project number.** `STATUS.md` section 6 records this as "no source
anywhere" and it stands. The slides tell us the shape of a register we do not
have. Question 2 to the client, the project site register, is now the single
cheapest unblock in the deck and these three slides are the argument for asking
it: two whole tables and an entire dashboard are waiting on one CSV.

---

## Slide 5. Project Insights, slide 1. The most informative of the five

Header: **[Project Name] Tropical Cyclone Lola Emergency Response Project**.
Top right tabs "Project Insights" and "Slide 1".

**Attribute grid, eight fields in four rows:**

| | |
| --- | --- |
| Facility Type: Sovereign | Project Number: 57318-001 |
| Project Type / Modality of Assistance: Grant | Modality Number: 0923 |
| Country / Economy: Vanuatu | Project Status: Closed |
| Effectivity Date: 13 Dec 2023 | Closing Date (Actual): 10 Sep 2024 |

**Seven tiles, every label underlined, so every one is clickable:**

| Value | Label |
| --- | --- |
| 3 | Total number of sites created |
| 46 | Total number of EDRMS users |
| 19 | Total number of site visitors |
| 10,684 | Total number of documents in EDRMS |
| 9,596 | Total number of records declared in EDRMS |
| 156 | Total number of physical counterparts identified |
| 2 | Total number of records due for disposal |

Note: "Clickable top panel stats to show data; see Departmental Insights for
template".

**Three charts below:**

1. **No. of users**, pie. Staff 75%, Consultants 17%, Contractors 8%
2. **Record declaration trend**, the cumulative line from slide 1
3. **Comparison: Documents vs Records**, grouped bars per site with a line on a
   secondary percentage axis. Site 1 roughly 10,000 documents against 6,000
   records at 60%, Site 2 roughly 5,500 against 5,500 at 100%, Site 3 roughly
   10,000 against 2,000 at 20%. Left axis 0 to 12,000, right axis 0 to 120%

Footer: "INTERNAL. This information is accessible to ADB Management and Staff. It
may be shared outside ADB with appropriate permission."

**What it means, field by field. This is the important part.**

| Element | Source | Verdict |
| --- | --- | --- |
| All eight attribute fields | **None held.** Facility type, project number, modality, country, status, effectivity and closing dates are ADB project system data | **Blocked.** Not SharePoint, not Cloud Governance, not `drm-npr`. A different system entirely |
| Sites created | CG `Created Time`, once a site to project map exists | Blocked on the map, not on the measure |
| EDRMS users, 46 | Needs users per site. **1,028 of 1,032 EDRMS sites are Team site with no M365 group**, so group membership cannot supply it | Hard. See `STATUS.md` section 6 |
| Site visitors, 19 | SharePoint reports viewers per site, so possible once the map exists | Blocked on the map |
| Documents, 10,684 | Weekly scan | Blocked on the map, and on the scan being built |
| Records declared, 9,596 | `public."Records"` | Blocked on the map only |
| Physical counterparts, 156 | `T1 c27 HasPhysical` | Blocked on the map only |
| Records due for disposal, 2 | `EDRMSDueDateForDisposal` | Coverage of that column has **never been queried**. Listed as taken on trust |
| Staff / Consultant / Contractor pie | **No source.** This is open question 7, and the client's own PPT s54 asks the same question of itself | **Blocked, and the client knows it** |
| Declaration trend | `Records` | Sourceable. Cumulative, see slide 1 |
| Documents vs Records comparison | Both halves of the scan | The **per site** shape is new. Ours compares at department level |

**The single conclusion.** Project Insights is blocked on **two** things, not one,
and they have different owners:

1. **A site to project register.** Which SharePoint site belongs to which project
   number. Without it not one tile on this slide can be filled, however good our
   other sources are.
2. **A project attribute feed.** Facility type, modality, country, status,
   effectivity and closing dates. Even with the register, the top third of this
   screen stays empty without it. This is an ADB project system, and it has
   **never been named** in this project.

Item 2 is a new finding from these slides. Previous notes recorded Project
Insights as blocked on the register alone. **It is blocked on a second source we
have never discussed and no one has been asked for.** That goes to the client
with question 2.

**The comparison chart's percentage is worth keeping.** Records declared as a
share of documents held, per site, is a **declaration rate**, and the client has
drawn it with sites at 100%, 60% and 20%. That is a compliance measure and it is
the clearest statement yet of why the undeclared denominator matters. It cannot
be built until the weekly scan exists, because `Records` holds declared documents
only and has no row at all for an undeclared one.

---

## Slides 6 to 10. The Bank-wide drill tables

Five slides, one per top tile, each showing what opens when the tile is clicked.
Every one is keyed on **Department / office / RM**, alphabetical, with the same
BIOC / BPMSD / CCSD / Etc. sample rows and one row hyperlinked to show the
clickable state. This confirms the note on slide 2: the tiles drill into a
departmental breakdown, and the drill is always a table, never a chart.

### Slide 6. Total number of EDRMS users

| Department / office / RM | Total number of users (staff) | Total number of users (Contractors) | Total number of users (Consultants) | Completion of training | Onboarded since go-live. |

Indicator note: "% of active users, Number of users who have never accessed EDRMS
(for re-training) or have not accessed in the last 90 days (candidate for
cleanup)".

| Element | Verdict |
| --- | --- |
| Staff / Contractor / Consultant split | **No source.** Open question 7. The client's own PPT s54 asks the same question of itself |
| Completion of training | **No source.** This is a learning management system, never named in this project |
| Onboarded since go-live | **Blocked twice over.** Needs a per user onboarding date, and needs the **EDRMS go-live date**, which `STATUS.md` section 6 records as recorded nowhere in the Cloud Governance export. Job monitor is the candidate and has not been exported |
| Never accessed EDRMS | **Sourceable.** SharePoint activity user detail lists every **licensed** user; a blank `Last Activity Date` means never. In the test tenant that is 5 of 30 |
| Not accessed in 90 days | **Sourceable.** Same export, `Last Activity Date` older than 90 days |
| % of active users | **Sourceable.** In the test tenant, 8 of 30 |

**A new gap this slide exposes: user to department.** Everything on this table is
per department, and the activity export has no department column. Gap 1 was closed
on 14 August for **sites**, via the Cloud Governance `Department` column. That does
nothing for **people**. A user is not in a site, so site to department cannot be
made to carry them.

The obvious candidate is the **Entra user profile `department` attribute**, read
via Graph `GET /users?$select=userPrincipalName,department,jobTitle`. That is a
lead, **not a finding**. Nobody has run it against 7rkd12 and nobody knows whether
ADB populates it. It is cheap to check and it should be checked before this table
is described to the client as blocked, because if it is populated it also gives
`jobTitle`, which may or may not separate staff from consultants.

**"have not accessed in the last 90 days" is the third appearance of 90 days** on
a client slide this week, now against users rather than sites. The 300 in the
metrics document looks more and more like the outlier.

### Slide 7. Total number of documents in EDRMS

| Department / office / RM | Number of documents created / uploaded | Number of users creating documents | Documents size (in GB) |

Indicator note: "new documents created month-on-month per department, division"
and "Average monthly storage growth in content".

| Element | Verdict |
| --- | --- |
| Documents created / uploaded | The **weekly scan**. Not built |
| Number of users creating documents | The scan must capture `createdBy` per item. **The 73 column design does not carry it.** Column 25 `CreatedBy` exists but is documented as "the user that declared the record", sourced from `Records.CreatedBy`, so it covers declared records only. A distinct creator count over **all documents** needs a new column on table 1 |
| Documents size in GB | The scan `size`, filtered to files. Cloud Governance `Storage Used (GB)` is an alternative but measures the whole site, not its documents |
| Month on month | Needs history. The Utilization Report Table is **replaced** weekly by the 12 August decision, so month on month document counts must come from a derived series or the decision is revisited |
| **per division** | **Unsourceable.** `Division` is a column in the Cloud Governance export and is **empty on all 1,032 rows** |

### Slide 8. Total number of records declared in EDRMS

| Department / office / RM | Total number of records declared | Total number of users declaring records | Number of records declared per division | Number of users declaring records per division |

Indicator note: "new records declared, % of users declaring records, month-on-month
per department, division", "Highlight departments/offices/RMs with **zero record
declarations**", "Record declaration rate (%) compared to documents created".

| Element | Verdict |
| --- | --- |
| Records declared | **Sourceable today.** `public."Records"` |
| Users declaring records | `COUNT(DISTINCT "CreatedBy")` on `Records`. **This is one of the two queries listed as outstanding and taken on trust.** It should be run |
| Both "per division" columns | **Unsourceable.** Half this table cannot be filled |
| Zero record declarations | **Sourceable, and it is the compliance argument.** This is exactly the case made on 14 August for preferring the Cloud Governance register over a technical app test: a site designated EDRMS that declares nothing shows up and somebody asks why. **The client has independently drawn the same thing.** Worth saying to them |
| Declaration rate vs documents created | Needs the denominator, so needs the scan |

**Two of five columns on this table are division columns and neither can be
filled.** That is the clearest single illustration of the division problem, and it
is worth putting in front of the client exactly this way.

### Slide 9. Total number of physical counterparts identified

| Department / office / RM | Total number of **physical** records declared | Total number of users declaring records | Number of records declared per division | Number of users declaring records per division |

Indicator note: "no. of physical records declared month-on-month per department,
division" and "Physical counterpart completion rate (no. of records turned over
for RAC storage vs. no. of records declared with physical counterpart)".

**Columns 3, 4 and 5 are identical to slide 8's columns 2, 3 and 4**, and only
column 2 has been changed, with the word "physical" highlighted in orange. This
reads as a copy of the previous slide that was partly edited. **It should be
queried with the client** rather than built literally, since as drawn the table
repeats three columns from the previous drill without making them physical.

| Element | Verdict |
| --- | --- |
| Physical records declared | **Sourceable today.** `T1 c27 HasPhysical`, from the `EDRMSMeta` key |
| Turned over for RAC storage | **No source.** This is a physical custody event in a process, not a field in any system we hold. **The prototype currently shows a "Turned over to RAC" column computed as 58% of the physical counterpart count**, `index.html:1050`. That is an invented figure with no source marker on it, and by the "unsourceable cells print no source" rule of 13 August **it should not be a number**. This is a real defect found by reading the slide |
| Completion rate | Denominator sourceable, numerator not. So the rate is not buildable |

### Slide 10. Total number of records due for disposal

| Department / office / RM | Number of records due for disposal | Next due date for disposal | Disposal approver | With physical counterpart? | Status (Approved) | Status (Declined) | Status (Extended) |

Row 1 shows the cell types: `#`, `Date`, `Name`, `(Yes/No)`, then `#` for each of
the three status columns.

Indicator note: "records disposed month-on-month per department, division", "List
of overdue disposal actions, pending approvals", "Disposal completion rate %
(including physical counterparts)", "List of upcoming records due for next quarter
(for planning and advance notice)".

**This is the most actionable slide in all ten.** `STATUS.md` has recorded since
10 August that disposal is blocked on `DisposalStatus`, "a field in the EDRMS
application, a development change request for Mihal Le". It has never said **what
the field should contain.** This slide does:

- A **status** with at least four states: Approved, Declined, Extended, and
  implicitly Pending, since the indicator note asks for "pending approvals"
- An **approver**, a person, so a second field
- **Extended** implies a mechanism, not just a label. Something must record the
  new due date and, for an auditor, why it moved
- A **disposal event date**, since "records disposed month-on-month" cannot come
  from a status alone

That is enough to write the change request precisely instead of describing a gap.
**It should be written and sent to Mihal Le**, because it is the longest lead time
item after the file plan join and it currently has no specification at all.

Sourceable today from this table: **records due for disposal** and **next due
date**, both from `EDRMSDueDateForDisposal`, and **with physical counterpart**,
from `HasPhysical`. Three of eight columns. The other five all wait on the change
request.

---

## Slides 11 and 12. Two more insight tables

Both are headed "EDRMS Bank-wide oversights" with a black **Slide 1** tab, so both
are the first screen of a further dashboard rather than a Bank-wide drill.

### Slide 11. EDRMS Retention and disposal insights

| Heading | Departments / Offices / RMs provisioned | Number of libraries provisioned | Number of records declared | Number of physical counterparts | Number of records due for disposal | Number of records disposed |
| --- | --- | --- | --- | --- | --- | --- |
| Permanent retention | list | # | # | # | # | # |
| Temporary retention | | | | | | |
| **Total** | | | | | | |

Both headings are hyperlinked, so both drill further.

**The grain is the retention class, not the department.** Two rows and a total.
This is a much smaller screen than the prototype's Retention and Disposal
dashboard, which carries permanent and temporary screens plus disposition risk and
retention compliance.

| Element | Verdict |
| --- | --- |
| Permanent versus Temporary | Needs each of the 53 Purview labels classified as one or the other. The **Retention Label Mapping list** in `app_edrms_data_uat` is the likely home and `PhysicalCounterpartRetention` already uses the vocabulary "Long Term, Permanent". **Not verified.** The Purview file plan has never been exported |
| Departments provisioned | A **list inside a cell**, not a count. Sourceable from the site to department mapping once records are attributed |
| Libraries provisioned | Graph `/sites/{id}/drives`. Sourceable, and the scan already enumerates libraries |
| Records declared, physical counterparts, records due | Sourceable today |
| **Records disposed** | **No source.** Same change request as slide 10 |

Five of six columns are sourceable or nearly so. **This is the cheapest of the
twelve slides to build**, and it is worth noting that against the effort the
prototype has already spent on a larger Retention and Disposal dashboard the
client did not draw this way.

### Slide 12. EDRMS Institutional File Plan insights

| Heading | Total terms | Departments / Offices / RMs provisioned | Number of libraries provisioned | Number of documents | Number of records declared | Number of physical counterparts |
| --- | --- | --- | --- | --- | --- | --- |
| Total Institutional Management terms | # | list | # | # | # | # |
| Total Administration terms | | | | | | |
| Total People management terms | | | | | | |
| Total Programs and operations terms | | | | | | |
| Total other terms | | | | | | |
| **Total terms** | | | | | | |

All five headings hyperlinked.

**This slide names the five file plan categories, which we did not have.**

1. Institutional Management
2. Administration
3. People management
4. Programs and operations
5. Other

`STATUS.md` section 6 records "the five categories in requirement section 3 exist
in neither system", with the term store holding nine groups and Purview holding a
flat list of 53 labels, and **none of them named like these**. That finding is
unchanged: naming the categories does not locate them. But it **sharpens question
1 considerably**. Instead of "where does the institutional file plan live", the
question becomes "these five groupings are in neither your term store nor your
Purview file plan, so who maintains them and where". A named list is much harder
to answer vaguely than an abstract one.

Note the fifth row is **"Total other terms"**, a catch-all. So the scheme is not
claimed to be exhaustive, which means a term that matches none of the four real
categories still has a home. Useful, because it means the mapping does not have to
be complete before the screen works.

**Four of six columns need the term to document join.** Libraries provisioned,
documents, records declared and physical counterparts are all "per file plan
category", and nothing today links a term to a library or a document: table 4 has
no join key and table 1 carries no `TermId`. `STATUS.md` section 11 already calls
this "the longest lead time item in the deck" and says it survives the answer to
question 1. **This slide is the evidence for that claim**, and it is the strongest
argument yet for raising the design change now rather than after the file plan is
located.

---

## What changes as a result of these twelve slides

Nothing in the repo has been changed yet. This file records the analysis only.

**Candidate changes to the prototype**, none applied:

1. Add the **Total number of physical counterparts** column to the Bank-wide
   department table, and the equivalent to the project tables. Sourceable today
2. Decide **cumulative versus per month** on the declaration trend, and if
   cumulative, change the `check_data.js` assert from a sum to a last point
3. Add the **date range picker** to the declaration trend. Legitimate here, see
   slide 1
4. Add the four **site lifecycle indicators** to the Bank-wide department table.
   All four became sourceable on 14 August and none is on the page
5. Rename the Department Insights unit to cover **department, office and RM**,
   pending the client's answer on how many there are

**Candidate additions to the questions for the client:**

6. Does the alphabetical list cover departments only, or departments **and**
   offices **and** resident missions? How many rows should it have?
7. Which system holds the project attributes on Project Insights slide 1?
   This is new and is separate from the project site register
8. Your deck says a site is inactive after **90 days**, three times across these
   slides. Your metrics document says **300**. Which governs?
9. **Division appears on four of these slides and nothing populates it.** Two of
   the five columns on the records declared drill are division columns. Who
   supplies division, or do those columns come off?
10. Which system holds **training completion** and the **staff, consultant,
    contractor** classification of a user?
11. Slide 9 repeats three columns from slide 8 unchanged. Was that intended?
12. Your five file plan categories, Institutional Management, Administration,
    People management, Programs and operations, Other, are in neither your term
    store nor your Purview file plan. Who maintains them and where?

**Work that can start now without any client answer:**

13. **Write the disposal change request for Mihal Le.** Slide 10 specifies it:
    a status with Approved, Declined, Extended and Pending, an approver, a
    disposal date, and a mechanism behind Extended. This has been a named gap
    since 10 August with no specification. It now has one
14. **Run `GET /users?$select=userPrincipalName,department,jobTitle` against
    7rkd12.** It is the only candidate for user to department, which slides 6
    to 9 all need and which Gap 1 did **not** close. Cheap, and currently unknown
15. **Run `COUNT(DISTINCT "CreatedBy")` on `Records`.** Slide 8 needs it and it
    is already on the outstanding list as taken on trust
16. **Fix `index.html:1050`.** "Turned over to RAC" prints 58% of the physical
    counterpart count as though measured. Nothing sources it. By the 13 August
    rule it must print "no source"
17. **Decide whether table 1 needs a `CreatedBy` for all documents**, not just
    declared ones. Slide 7 asks for users creating documents and column 25 as
    designed cannot answer it
