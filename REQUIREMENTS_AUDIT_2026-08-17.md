# Requirements audit, 17 August 2026

**The first audit built from the deck itself.** `EDRMS_Dashboard_requirements_1.pptx`
is now in the repo, 69 slides, with its full text dump at
`evidence_deck_text_2026-08-17.txt`. Every earlier slide reference in this project
came from `REQUIREMENTS_2026-08-13.md`, which was written by someone reading the
deck and taking notes. This file replaces that with the deck's own words.

Read this file to answer three questions:

1. **Is it in the requirements?** If it is not here, it is not a requirement.
2. **Can we build it, and from what?** Source, then the table and column it lands in.
3. **If we cannot, what exactly do we ask the client, and why?** Section 4 is
   written to be sent, not summarised.

---

## 1. How the deck is structured, which was not obvious before

The deck is **two documents in one**, and reading it as a single list of
requirements produces contradictions that are not really there.

| Slides | What they are |
| --- | --- |
| 1 to 12 | **The client critiquing the OLD prototype.** Their comments on Overview, Records management, Migration and Content volume. This is where things get killed |
| 13 to 14 | **The new six dashboard structure.** The nav order the prototype uses |
| 15 to 33 | **The outline** of each new dashboard. Top panel stats and headline tables |
| 34 to 69 | **The detailed design.** One slide per screen. This is the authority |

**Where 15 to 33 and 34 to 69 disagree, the detailed design wins**, because it is
drawn as screens with real column headings rather than listed as bullets.

**Three things the client killed outright, in their own words:**

| Slide | What they said | Consequence |
| --- | --- | --- |
| s7, Site rollout | "Only relevant to the Project. Will not be needed once project is completed. Suggest removing" | Gone. Correctly absent |
| s11, Migration dashboard | "I do not believe this is required at all" | Gone, **but see the contradiction below** |
| s12, Content volume | "There is no new information derived from this except the total size of documents and storage growth. Perhaps this could be amalgamated somewhere?" | Format groups are **not** a requirement. Total size and storage growth **are**, and they land on s40 |

**The one real contradiction in the deck.** s11 kills the migration dashboard, but
s57 (Department Insights, documents) still asks for "Total number of documents
migrated, Total number of users migrating documents, Total migrated documents size".
That needs a ruling and it is question 9 in section 4.

---

## 2. Bank-wide Oversight: the definitive requirement

The deck gives Bank-wide **a top panel of ten tiles**, each opening one screen.
Not eight. The prototype is missing two.

### 2.1 The ten tiles, s34

| # | Tile, the client's words | Opens | Sourcing verdict |
| --- | --- | --- | --- |
| 1 | Number of active EDRMS SharePoint sites for Department, RM, office | s35 | **Ready** |
| 2 | Total Number of active EDRMS SharePoint sites for Sovereign projects | s36 | **Blocked**, project register |
| 3 | Total Number of active EDRMS SharePoint sites for Nonsovereign projects | s37 | **Blocked**, project register |
| 4 | Total number of EDRMS users | s39 | **Ready** for the count, blocked for the split |
| 5 | Total number of documents in EDRMS | s40 | **Needs the scan** |
| 6 | Total number of records declared in EDRMS | s41 | **Ready** |
| 7 | Total number of physical counterparts identified | s42 | **Ready** |
| 8 | Total number of records due for disposal | s43 | **Ready** |
| 9 | **Retention and disposal insights** | s44 | Navigation tile, **missing from the prototype** |
| 10 | **Institutional File Plan insights** | s47 | Navigation tile, **missing from the prototype** |

Tiles 9 and 10 explain something that has puzzled this project for a week: **why
s44 and s47 carry the "EDRMS Bank-wide oversights" banner while s45, s46 and s48
to s52 do not.** They are the landing screens of two other dashboards, reached
from a Bank-wide tile. The banner marks the route, not the ownership.

### 2.2 Every drill, column by column

Legend for the verdict column:

- **READY** data exists in a source we hold, and the column is in the design
- **SCAN** needs the weekly SharePoint scan, which is designed and not built
- **APP** needs a new field in the EDRMS application, a change request to Mihal Le
- **ASK** needs something only the client can give us
- **NONE** no source exists anywhere, in any system, today

#### s35, sites by department, office and RM

Also drawn at s16. **Same table.** It appears twice in the deck, once in the
outline and once as the drill, and should appear once in the prototype.

| Column | Source | Table and column | Verdict |
| --- | --- | --- | --- |
| Department / office / RM | Cloud Governance `Department` | `T2 c7 ADBDepartmentOwner` | **READY.** Closed 14 Aug. **But see the multi-department problem, question 1** |
| Number of EDRMS SharePoint sites | CG `EDRMS Site Type`, 1,032 rows | `T2 c6 IsEdrmsCompliant` | **READY** |
| Total number of documents | Weekly scan | `T1`, all rows | **SCAN** |
| Total number of records declared | `public."Records"` | `T1 c23 IsDeclaredRecord` | **READY** |
| Total number of physical counterparts | `Records.EDRMSMeta` | `T1 c27 HasPhysical` | **READY** |
| *Indicator:* sites created | CG `Created Time` | `T2 c5 SiteCreatedDate` | **READY.** Site creation, **not** EDRMS go-live |
| *Indicator:* sites deleted | CG `Site Status` | `T2 c18 IsDeleted` | **READY** |
| *Indicator:* sites archived | CG `Status` = Archived | **new column needed** on T2 | **READY**, needs a column |
| *Indicator:* inactive 90 days | CG `Last Active Time` | `T2 c14 LastActivityDate` | **READY** |

Their note: each name clickable into that unit's dashboard. **Built 16 Aug.**

#### s36 and s37, sovereign and nonsovereign projects

Identical shape to s35, keyed on Project Number and Project Name. Their own note
says the rows click through to Project Insights.

**Every row of both tables is blocked on one thing.** Nothing in SharePoint,
Cloud Governance or `drm-npr` says a site belongs to a project, or which project.
The measures are all otherwise producible. This is question 2.

#### s39, users

| Column | Source | Table and column | Verdict |
| --- | --- | --- | --- |
| Total number of users (staff) | **None** | — | **ASK.** See question 3 |
| Total number of users (Contractors) | **None** | — | **ASK** |
| Total number of users (Consultants) | **None** | — | **ASK** |
| Completion of training | **None** | — | **ASK** |
| Onboarded since go-live | **None** | — | **ASK**, and needs the go-live date, question 4 |
| *Indicator:* % of active users | M365 activity report | `T3 c5 LastActivityDate` | **READY** |
| *Indicator:* never accessed EDRMS | M365 activity report, blank last activity | `T3 c5` | **READY** |
| *Indicator:* not accessed in 90 days | M365 activity report | `T3 c5` | **READY** |

**A gap nobody has named until now: user to department.** Every column on this
screen is per department. Gap 1 was closed on 14 August for **sites**, using the
Cloud Governance `Department` column. That does nothing for **people**. A user
does not live in a site, so site to department cannot carry them. `T3` has no
department column and no source for one. This is part of question 3.

#### s40, documents

| Column | Source | Table and column | Verdict |
| --- | --- | --- | --- |
| Number of documents created / uploaded | Weekly scan | `T1`, all rows | **SCAN** |
| Number of users creating documents | Weekly scan, `createdBy` per item | **NEW COLUMN on T1** | **SCAN.** `T1 c25 CreatedBy` is the *declarer*, not the creator. A distinct creator count over all documents needs a second column |
| Documents size (in GB) | Weekly scan | `T1 c8 FileSize` | **SCAN.** This is Gap 2, file size not captured today |
| *Indicator:* new documents month on month | Snapshot history | `T1 c2 SnapshotDate` | **Needs a decision**, question 8 |
| *Indicator:* average monthly storage growth | Snapshot history | `T1 c2` + `c8` | **Needs a decision**, question 8 |
| *Indicator:* per **division** | **None** | — | **ASK**, question 5 |

#### s41, records declared

| Column | Source | Table and column | Verdict |
| --- | --- | --- | --- |
| Total number of records declared | `Records` | `T1 c23` | **READY** |
| Total number of users declaring records | `COUNT(DISTINCT CreatedBy)` | `T1 c25 CreatedBy` | **READY**, never actually run |
| Number of records declared per division | **None** | — | **ASK**, question 5 |
| Number of users declaring records per division | **None** | — | **ASK**, question 5 |
| *Indicator:* zero record declarations | `Records` against the compliant list | `T1 c23`, `T2 c6` | **READY.** This is the compliance case the register was chosen for |
| *Indicator:* declaration rate vs documents created | Scan for the denominator | `T1 c23` over `T1` | **SCAN** |

**Two of the four columns on this screen cannot be filled.** That is the sharpest
illustration of the division problem in the whole deck.

#### s42, physical counterparts

| Column | Source | Table and column | Verdict |
| --- | --- | --- | --- |
| Total number of physical records declared | `Records.EDRMSMeta` | `T1 c27 HasPhysical` | **READY** |
| Total number of users declaring records | `T1 c25` | | **READY** |
| Per division, two columns | **None** | — | **ASK**, question 5 |
| *Indicator:* physical counterpart completion rate | **None.** "records turned over for RAC storage" is a custody event, not a field | — | **NONE**, question 6 |

**Note a probable slip in the client's own slide.** Columns 3, 4 and 5 of s42 are
copied verbatim from s41 and were not edited; only column 2 gained the word
"physical". Worth confirming rather than building literally. Question 10.

#### s43, records due for disposal

| Column | Source | Table and column | Verdict |
| --- | --- | --- | --- |
| Number of records due for disposal | `Records` | `T1 c32 EDRMSDueDateForDisposal` | **READY** |
| Next due date for disposal | Earliest future due date | `T1 c32` | **READY** |
| Disposal approver | **None** | **NEW COLUMN** | **APP**, question 7 |
| With physical counterpart? | `T1 c27` | | **READY** |
| Status (Approved) | **None** | **NEW COLUMN** | **APP**, question 7 |
| Status (Declined) | **None** | **NEW COLUMN** | **APP**, question 7 |
| Status (Extended) | **None** | **NEW COLUMN** | **APP**, question 7 |
| *Indicator:* records disposed month on month | **None** | **NEW COLUMN**, a disposal date | **APP** |
| *Indicator:* overdue actions, pending approvals | **None** | needs the status | **APP** |
| *Indicator:* disposal completion rate | **None** | needs the status | **APP** |
| *Indicator:* upcoming next quarter | `T1 c32` | | **READY** |

**Three of the eight columns are producible. Five wait on one change request.**

#### s44, the retention and disposal rollup

Two rows, Permanent retention and Temporary retention, plus a Total.

| Column | Source | Verdict |
| --- | --- | --- |
| Departments / Offices / RMs provisioned | CG `Department` joined through the records | **READY** |
| Number of libraries provisioned | Graph `/sites/{id}/drives` | **READY** |
| Number of records declared | `T1 c23` | **READY** |
| Number of physical counterparts | `T1 c27` | **READY** |
| Number of records due for disposal | `T1 c32` | **READY** |
| Number of records disposed | **None** | **APP**, question 7 |

**Splitting permanent from temporary needs a rule.** `T1 c33 RetentionStatus`
exists and reads from `EDRMSMasters`, and `T1 c28` already uses the vocabulary
"Long Term, Permanent". Whether every one of the 53 Purview labels maps cleanly to
one side has **never been checked**, because the Purview file plan has never been
exported. Question 11.

#### s47, the institutional file plan rollup

Five named categories, which the deck gives us for the first time:
**Institutional Management, Administration, People management, Programs and
operations, Other.**

Every column beyond "Total terms" needs a term to document join that **does not
exist in the design**: `T4` has no key that reaches `T1`, and `T1` carries no
`TermId`. This is a design change and a scan change on top of a missing source.
Questions 12 and 13.

### 2.3 The rest of Bank-wide

| Screen | Slide | Verdict |
| --- | --- | --- |
| Comparison, three named ratios | s17, from s6 | **READY.** Users/documents, users/records, documents/records. Two of the three need the scan for the document half |
| Bankwide record declaration trend | s18, from s10 | **READY.** s10 asks "What would be the default (current year?)" and asks for a per department cut too |

**On s10 the client asked two things the 16 August revision did not deliver.**
They asked for the default range, suggesting current year, and they said "Should
also be able to see the trend per department/office/RM/Projects". The 16 August
instruction removed the department filter. Those conflict. Question 14.

---

## 3. The other five dashboards, in brief

The same treatment for the remaining slides, compressed. The pattern repeats: the
counting measures are ready or need the scan, and everything describing a **person,
a project, a term or a disposal decision** is blocked.

| Dashboard | Slides | Ready today | Blocked, and on what |
| --- | --- | --- | --- |
| **Department Insights** | s19 to s28, s53 to s66 | Sites and their owners, documents, records, counterparts, records due, activity indicators, the conventions and programme date lists | **Go-live date** (question 4), the **user register** (question 3), **divisions** (question 5), **library usage by file plan category** (questions 12 and 13), **disposal status** (question 7), **visitors internal vs external and access requests** (question 15) |
| **Project Insights** | s38 | Nothing, until a site maps to a project | The **project register** (question 2) and, separately, the **eight profile fields** which come from an ADB project system never named in this work (question 16) |
| **Institutional File Plan** | s29 to s31, s47 to s52 | Nothing | The **file plan itself** (question 12) and the **term to document join** (question 13) |
| **Retention and Disposal** | s32, s44 to s46 | Records declared, counterparts, records due, retention label, duration | **Records disposed** and the whole disposal status set (question 7), the **permanent versus temporary rule** (question 11) |
| **Records and Archive Holdings** | s33, s67 to s69 | Nothing | Everything. s33 is literally "RAC suggestions?" and s67 says "We would also like to learn what is available in Opus". **The client has not specified this dashboard**, and no system holds boxes, folders, locations or capacity (question 17) |

**A gift on s54 that has been overlooked.** The client did not just ask for the
staff, contractor and consultant split. They **drew the table they would need to
give us**:

> Name | Staff status (Dropdown: Staff, Contractor, Consultant, External party
> given access?) | Onboarded since go-live (yes / no) | Training completed?
> (yes / no) | Date completed (dd-mmm-yy) | Notes

and asked, of themselves, "Source: Database of end users? Owned and maintained
by?" **That is a table specification we can accept as it stands.** It becomes a
fifth reporting table almost unchanged, and it answers four blocked columns at
once. Question 3 is written around it.

---

## 4. What to ask the client

Written to be sent. Each question says what we are asking for, why the dashboard
cannot be built without it, and **what it becomes in the database**, so the client
can see that the answer is not paperwork.

### Question 1. Can a site belong to more than one department?

**What we found.** The Cloud Governance workspace report gives a `Department` for
1,030 of the 1,032 EDRMS sites, which closed the biggest gap in this project. But
**240 of those sites carry several departments in one field, separated by
semicolons.**

**Why it matters.** Every Bank-wide table is "per department" and every figure has
to add up to the bank-wide total. If a site with three departments is counted
under all three, the column totals more than the bank. If it is counted under the
first, two departments are under-reported.

**What we need.** Either a rule ("the first named department owns it"), or a
confirmation that these are genuinely shared and should be counted fractionally,
or a corrected list.

**In the database.** `T2 c7 ADBDepartmentOwner` is currently one text value per
site. A "shared" answer turns it into a separate site-to-department table, which
is a real design change, so this is worth settling before the tables are built.

### Question 2. Which SharePoint sites belong to which project?

**What we need.** A list: project number, project name, facility type (Sovereign
or Nonsovereign), and the SharePoint site URL or URLs for that project.

**Why it matters.** Slides 36, 37 and 38 are three whole screens, and **not one
figure on any of them can be produced** without it. We can already count documents,
records, counterparts and users for any site; we simply cannot tell which sites are
project sites. Nothing in SharePoint, Cloud Governance or the EDRMS database
records it.

**In the database.** It becomes two columns on the site table, `ProjectNumber` and
`FacilityType`, and every project figure is then a group-by on them. A one-off
spreadsheet unblocks the dashboard; a maintained list keeps it correct.

### Question 3. Where is the register of EDRMS users?

**Your own slide 54 asks this question of itself**, and answers it with the exact
table we need:

> Name | Staff status (Staff / Contractor / Consultant / External party) |
> Onboarded since go-live | Training completed | Date completed | Notes

**What we need.** Who owns and maintains that list, and can we have it, refreshed
on some agreed cycle.

**Why it matters.** It is the only source for four columns on slide 39 and slide
54: the staff, contractor and consultant split, and training completion. Microsoft
365 tells us who used SharePoint and when. **It cannot tell us what kind of person
they are, or whether they were trained.** No system at ADB that we can reach holds
that.

**Also, and separately: we cannot currently put a user in a department.** The
Cloud Governance answer put *sites* in departments, not *people*. If your user
register carries a department per person, it solves that too. If it does not, one
alternative is the `department` field on each person's Microsoft 365 account, which
we can read directly, **but nobody has yet checked whether ADB fills it in.** We
will check that and come back.

**In the database.** It becomes a fifth table keyed on the person, joined to the
activity table on their sign-in name. Your slide's columns map to it one for one.

### Question 4. When did each site become EDRMS compliant?

**What we need.** The go-live date per department or per site.

**Why it matters.** Slide 53 puts "Go-Live date" at the top of every Department
screen, and slide 39 asks for users "Onboarded since go-live". Neither is
answerable today.

**What we checked.** Every date column in the Cloud Governance export. `Created
Time` is the date the SharePoint site was created, which is **not** the same thing:
Leah confirmed that sites not created in Cloud Governance get converted afterwards,
so for those the site existed first and became compliant later. Nothing anywhere
records the conversion date.

**Where it might already exist.** The Cloud Governance **Job monitor** records job
types including "Site manual import" and "Apply profile for site". If those jobs
are dated and exportable, that is the go-live date and we need nothing from you.
**Can we have a Job monitor export to check?**

**In the database.** One new column, `EdrmsGoLiveDate`, on the site table.

### Question 5. What is a division, and what populates it?

**What we found.** Six columns across slides 40, 41 and 42 are "per division". The
Cloud Governance export **has** a `Division` column and it is **empty on all 1,032
sites**.

**Why it matters.** On slide 41, two of the four columns are division columns. As
things stand, half that screen prints nothing.

**What we need.** Either a list of divisions per department with the sites or
people that belong to each, or a decision to drop the division tier and report at
department level only.

**In the database.** With a source it is one more column, `ADBDivisionOwner`, and
one more grouping level. Without one, six columns come off six screens, which is
better than shipping them empty.

### Question 6. What records a physical record being turned over to RAC?

**What we need.** The system or register that records a physical counterpart
actually being transferred to RAC custody.

**Why it matters.** Slides 42 and 59 both ask for the "Physical counterpart
completion rate", defined on the slide as records turned over for RAC storage
against records declared with a physical counterpart. **We can produce the
denominator today.** The numerator is a physical custody event and no system we
can reach records it.

**In the database.** A transfer date and a status per record, or a separate
transfer table if a transfer covers a batch.

### Question 7. The disposal fields, a change request rather than a question

**This does not need a client answer, it needs a development change**, and your
slides 43 and 60 specify it precisely enough to write. Recording it here so it is
not lost.

The EDRMS application needs to capture, per record:

| Field | Values | Comes from |
| --- | --- | --- |
| Disposal status | Pending, Approved, Declined, Extended | s43, s60, and "pending approvals" in the s43 indicators |
| Disposal approver | A person | s43, s60 |
| Disposal date | A date | "records disposed month on month", s43 |
| Extension: new due date and reason | A date and text | Implied by the "Extended" status. An extension that does not record what it moved to, and why, cannot be audited |

**What it unblocks.** Five of the eight columns on slide 43, four of the s43
indicators, "Number of records disposed" on s44, and the whole of s60.

**Until it exists**, every disposal figure this report can produce is "what is due"
and none is "what was done".

### Question 8. Do you want month on month figures, and how far back?

**What we found.** Nine slides ask for a measure "month on month". The reporting
table as designed is **replaced every week**, so it knows today and nothing else.

**Why it matters.** Month on month is not a query, it is a decision to keep
history. It is cheap if we decide now and expensive to add later, because history
that was not kept cannot be recovered.

**What we need.** How far back should the dashboard be able to look? Twelve months
and three years cost different amounts of storage and neither is difficult.

**In the database.** The table already has a `SnapshotDate`. The decision is
whether we keep old snapshots or overwrite them, plus a retention rule for them.

### Question 9. Is migration reporting required or not?

**Slide 11 says of the migration dashboard: "I do not believe this is required at
all."** Slide 57 then asks for "Total number of documents migrated, Total number of
users migrating documents, Total migrated documents size".

**Which governs?** If migration reporting is out, s57 loses three figures and
nothing else changes. If it is in, we need to know what marks a document as
migrated, because nothing does today.

### Question 10. Slide 42, was the copy intended?

Columns 3, 4 and 5 of slide 42 are identical to columns 2, 3 and 4 of slide 41,
and only column 2 was edited to say "physical". It reads like a copied slide that
was partly updated. **Should those three columns be the physical equivalents?**

### Question 11. Which retention labels are permanent and which are temporary?

**What we need.** The Purview file plan export, or the mapping list, showing each
of the 53 retention labels against whether it is permanent or temporary.

**Why it matters.** Slides 32, 44, 45 and 46 all split the holding into permanent
and temporary. We hold the label on every record. We do not hold a rule that turns
53 labels into two groups.

**In the database.** `T1 c33 RetentionStatus` is designed for exactly this and is
populated from `EDRMSMasters`. We need to confirm that table already carries the
split, and if it does this question closes with no work at all.

### Question 12. Where does the Institutional File Plan live?

**What we need.** The file plan itself: the top level terms, grouped under your
five categories, in any exportable form.

**Why it matters.** It is the whole of one dashboard, seven slides, plus six more
on Department Insights.

**What we checked, so you know this is not a guess.** The SharePoint term store
holds 19 term groups, and **none of them is named Institutional Management,
Administration, People management, Programs and operations or Other.** Purview
holds 53 retention labels as a flat list, which is a retention schedule, not a
file plan. Neither system contains the structure your slides 47 to 52 draw.

**In the database.** It becomes the file plan table, which is already designed:
category, term name, and level.

### Question 13. How do we know which library or document uses which term?

**This is the deeper half of question 12 and it survives the answer to it.**

Even with the file plan in hand, **nothing links a term to a library or to a
document.** Slides 47 to 52 and 61 to 66 all ask for documents, records and
counterparts counted per term. There is no field on a document, and no field on a
library, that names its file plan term.

**What we need.** Either a rule we can apply (for example, the library name is the
term, which slides 48 and 61 both hint at by using "Annual Meetings" as both), or
a field added to each library recording its term.

**In the database.** A `TermId` on the document table and a matching key on the
file plan table. **This is the longest lead item in the whole deck**, because it
needs a design change, an application or convention change, and a scan change, in
that order.

### Question 14. The declaration trend: default range, and per department?

**Slide 10 asks two things** we have not settled. "What would be the default
(current year?)" and "Should also be able to see the trend per
department/office/RM/Projects".

The 16 August revision set the default to the last twelve closed months and
**removed** the department filter on instruction. Slide 10 asks for it. **Which
do you want?**

### Question 15. Visitors: internal, external, and access requests

**Your slide 56 asks "Is this data available in SharePoint/Cloud Governance?"**

**Partly, and here is the honest split.** Total visitors per site: yes, we have it.
Internal versus external: probably, because Cloud Governance publishes a guest user
report, but we have not joined it to sites yet. **Access requests granted and
denied: we have found a Cloud Governance request report and have not yet confirmed
it contains approvals and refusals.** We will check both and come back rather than
put this to you as a blocker.

### Question 16. Where do the project attributes come from?

Slide 38 puts eight fields at the top of Project Insights: facility type, project
number, project type and modality, modality number, country or economy, project
status, effectivity date and closing date.

**None of these is EDRMS data.** They come from an ADB project system that has
never been named in this work. **Which system, and can we read it?**

**This is separate from question 2.** Question 2 tells us which sites are project
sites. This one fills the top third of the screen. Both are needed.

### Question 17. What should the Records and Archive Holdings dashboard be?

**Slide 33 is "RAC suggestions?" and slide 67 says "We would also like to learn
what is available in Opus and how we can apply the features for our dashboard."**
Slides 68 and 69 draw storage and retrieval tables.

**No system we can reach holds any of it**: boxes, folders, storage locations, room
capacity, transfers or retrievals. Slide 67 mentions eServe for retrieval, which
is a lead we can follow if you confirm it.

**We need to know whether this dashboard is in scope for this delivery.** If it is,
it needs its own source discussion and it will not come from EDRMS. If it is a
later phase, saying so lets us take it off the critical path.

---

## 5. What this means for the prototype

### 5.1 Comes off, because the deck does not ask for it

Already removed on 16 and 17 August, and this audit confirms all of it against the
deck's own text rather than against a register.

| Removed | Confirmed by |
| --- | --- |
| Records declared by year | No slide asks for a yearly chart |
| Site visits by month, bank-wide | No slide. Visitors are a Department and Project measure |
| Format and storage, declared records by format group | s12 demotes it. Only total size and storage growth survive, on s40 |
| Site health, library health, risk and compliance | Those words appear nowhere in 69 slides |
| Records quality, duplicates, orphans | Appear nowhere |
| Information classification, sensitivity labels | Appear nowhere |
| Supporting detail | Our own band name |

### 5.2 Goes back, because the deck does ask for it

| To restore | Slide | Why it came off |
| --- | --- | --- |
| **Retention and disposal rollup** | **s44** | Removed 16 Aug by name. It is drawn, and it carries the Bank-wide banner. **This was an error** |
| **Retention and disposal insights tile** | s34 | Never built |
| **Institutional File Plan insights tile** | s34 | Never built |

### 5.3 Should change, because the deck is clearer than what we built

| Change | Slide | Reason |
| --- | --- | --- |
| Make the sites tile clickable, and let the Overview of EDRMS sites table be its drill | s34, s35 | s16 and s35 are the same table. It should appear once, as the drill behind tile 1, not as a tile and a separate panel |
| Move the sovereign and nonsovereign project tables to Bank-wide as the drills behind tiles 2 and 3 | s36, s37 | They carry the Bank-wide banner. Project Insights is s38 only, a single project profile |
| Remove the "Turned over to RAC" figure | s42 | It prints 58 percent of the counterpart count with nothing behind it. Question 6 is why |

### 5.4 A design change worth proposing back to the client

**The client's design puts the same four measures on nine different screens.**
Documents, records declared, physical counterparts and records due appear on s35,
s36, s37, s44, s47, s48 to s52, s55 and s61 to s66, each time grouped differently:
by department, by project, by retention class, by file plan term, by site, by
library.

That is not nine requirements. **It is one measure set and six ways of grouping
it**, and building it as nine screens makes it nine times the work to change and
nine chances for the totals to disagree.

**We should build it once.** One reporting table at document level carries all four
measures; each screen is a different `GROUP BY` on the same table. It also means
every screen reconciles to the same bank-wide total by construction rather than by
luck, which is the failure mode that would embarrass this report in front of a
committee.

This is worth saying to the client explicitly, because it changes nothing they see
and a great deal about what it costs to deliver and maintain.

---

## 6. The honest summary for a committee

Counting every column on every screen the deck draws:

| Status | Roughly | What unblocks it |
| --- | --- | --- |
| **Producible today** | About a third | Nothing. Needs the report built |
| **Needs the weekly scan** | About a sixth | Engineering only, no client input. This is the single biggest self-help item |
| **Needs one change request** | About a tenth | The disposal fields, question 7 |
| **Needs something only the client has** | About a third | Questions 1 to 6 and 11 to 13 |
| **Has no source anywhere** | The remainder | RAC holdings, question 17 |

**The single most valuable thing in our own control is the weekly scan**, because
every document figure, every declaration rate and every storage figure waits on it,
and none of it needs the client at all.

**The single most valuable thing to ask for is the project register**, question 2,
because one spreadsheet turns three blank screens into working ones.

**The longest lead item is the file plan join**, question 13, because it needs a
design change on top of a source we do not have, and it will not get shorter by
waiting.
