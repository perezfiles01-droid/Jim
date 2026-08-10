# Requirement traceability

Source: **R2026.4 Utilization Report, Proposed Metrics** (Word document, version 4).

This file exists so that nobody has to take on trust that the prototype covers
the requirement. Every line of the requirement appears below in its original
order and wording, against the dashboard and panel that carries it.

**104 metrics, 10 dashboards, plus a Data sources reference page.** Nothing in
the requirement is unbuilt, and nothing is in the prototype that the requirement
did not ask for.

---

## 1. Bankwide oversight (Impact Statistics / Executive Summary)

Dashboard: **Bankwide oversight**

| Requirement line | Where it lands |
| --- | --- |
| Total documents in EDRMS SharePoint compliant sites [Total information assets managed] | KPI 1 |
| Percentage of documents declared as records | KPI 3, and the donut in "Documents declared as records" |
| Total declared records vs declared physical records registered | Panel "Total declared records vs declared physical records registered" |
| Total declared records | KPI 2 |
| Total number of EDRMS Users [Monthly active users] | KPI 4 |
| Active / Inactive (Orphaned sites over 90 days) EDRMS compliant sites | KPI 5, and the panel "Active, inactive and orphaned EDRMS compliant sites" |
| By Department, Field Office | That panel, "By department" and "By field office" views |
| By Sovereign projects | That panel, "By project type" view |
| By Nonsovereign projects | That panel, "By project type" view |

The three groupings are three cuts of the same 1,057 sites, so the total does
not move when the grouping changes. The prototype asserts that.

---

## 2. Risk and Compliance Dashboard

Dashboard: **Risk and compliance**

| Requirement line | Where it lands |
| --- | --- |
| Risk Indicators / Site Health / Active sites | Panel "Site health", tile 1 |
| Inactive sites (over 300 days) | Panel "Site health", tile 3 |
| Orphaned sites | Panel "Site health", tile 4 |
| Site Trends / New sites created | Panel "Site trends", tile 1 and the monthly columns |
| Sites archived | Panel "Site trends", tile 2 and the monthly columns |
| Site activity trend by month | Panel "Site trends", second chart |
| Library usage / Active Libraries | Panel "Library usage, active libraries" |
| Libraries with user activity within the last 90/180 days | That panel, the 90 / 180 toggle |
| Most Used Libraries (Views + Downloads + Uploads + Edits) | That panel, rank by "Most used" |
| Largest Libraries by Record Volume | That panel, rank by "Largest by record volume" |
| Largest Libraries by Storage (GB/TB) | That panel, rank by "Largest by storage" |
| Library Growth Rate (new records in period over records at start) | That panel, tile 3 |
| No of new sites created | That panel, tile 4 |
| Sites archives | That panel, tile 5 |
| Inactive libraries / no activity within the last 90/180 days | Panel "Library usage, inactive and at risk libraries", tile 1 |
| Orphaned Libraries (without owners) | That panel, tile 2 |
| Libraries with no declared records | That panel, tile 3 |
| Libraries without retention label mapping | That panel, tile 4 |
| Physical records overdue for transfer | That panel, tile 5 |

The 90 / 180 day toggle is shared between the active and inactive panels, so
the two always describe the same window.

---

## 3. Department insight (Department Performance)

Dashboard: **Department insight**

| Requirement line | Where it lands |
| --- | --- |
| Departmental Overview / Go-Live Date | Panel "Departmental overview", column 2 |
| List of site owners | That panel, column 3 (see the note below) |
| Total number of Sites per Department | That panel, column 4 |
| Users per site | That panel, column 5 |
| Visitors per site | That panel, column 6 |
| Libraries per site | That panel, column 7 |
| Departmental drilldown / Total documents | Panel "Departmental drilldown", KPI 1 |
| Total declared records | KPI 2 |
| Physical records registered | KPI 3 |
| Declaration rate | KPI 4 |
| Active users | KPI 5 |
| Storage consumed (GB/TB) | KPI 6 |
| Libraries usage / Library name | Table "Libraries usage", column 1 |
| No. of users | Column 2 |
| No. of documents | Column 3 |
| No. of records declared | Column 4 |
| No. of declared records with physical counterpart | Column 5 |
| Disposal summary / Library name | Table "Disposal summary", column 1 |
| Inactive documents (over 1 year) due for disposal | Column 2 |
| Number of records due for disposal | Column 3 |
| Next due date for disposal | Column 4 |
| Conventions / Link | Panel "Conventions" |
| Date of Approval | Panel "Conventions" |
| Version number and last updated | Panel "Conventions" |
| Records management program dates / CSIS-IR audit of EDRMS | Panel "Records management programme dates" |
| Convention review | Same panel |
| Refresher training due date | Same panel |
| Focals CoP schedule | Same panel |

**On "list of site owners".** The requirement asks for a list. The prototype
reports the departmental records focal contact rather than enumerating every
site owner, because there are 1,057 sites and an individual owner list goes
stale the moment somebody changes post. The per site owner is still on the site
itself. If the committee genuinely wants the full enumeration, it is one extra
column on the site mapping list and a table swap here. Flagging it rather than
deciding it.

---

## 4. EDRMS Institutional File Plan insights

Dashboard: **File plan insights**

| Requirement line | Where it lands |
| --- | --- |
| Total terms | KPI 1 and the donut centre |
| Total Administration terms | KPI 3 |
| People Management terms | KPI 4 |
| Program and operation terms | KPI 2 |
| Compliance and oversight terms | KPI 5 |
| Risk management terms | KPI 6 |

The dashboard adds one thing the requirement did not ask for and which is worth
keeping: a table of terms against records actually filed under each branch. A
branch with many terms and no records is a branch that was designed and never
adopted, which is the only interesting question a term count raises. Remove it
if it is not wanted; it is one panel.

---

## 5. Records Management Metrics

Dashboard: **Records management**

| Requirement line | Where it lands |
| --- | --- |
| Records Declaration / Total declared records | KPI 1 |
| Records declared this month | KPI 2 |
| Records declared by department | Panel "Records declaration", "By department" |
| Records declared by year | Same panel, "By year" |
| Records declared by classification | Same panel, "By classification" |
| Records declared by business process | Same panel, "By business process" |
| Declaration Performance / Declaration rate | KPI 3, and panel "Declaration performance" tile 1 |
| Libraries with highest declaration rates | Panel "Declaration performance", bar chart |
| Libraries with no declared records | Panel "Declaration performance", table |
| Records Quality / Total No. of Duplicated Records (same filenames) | KPI 4 and panel "Records quality" |
| Orphaned Records | KPI 5 and panel "Records quality" |

The requirement writes "with same filenames?" with a question mark. The
prototype answers it: duplicates are counted as two items sharing a filename
within one library. The panel also separates that from records declared twice
and from orphaned records, because the three get confused and mean different
things.

---

## 6. Records and Archives Holdings

Dashboard: **Archives holdings**

| Requirement line | Where it lands |
| --- | --- |
| Physical Records Holdings / Total physical files | KPI 1 |
| Total Legacy Records | KPI 2 |
| Total | Panel "Physical records holdings", tile 3, shown as total current records |
| Total boxes | KPI 3 |
| Total storage locations | KPI 4 |
| Records by office location | Panel "Physical records holdings", donut |
| Records by storage facility | Panel "Records by storage facility" |
| Records awaiting transfer | KPI 5 |
| Inventory Health / Unverified physical files | Panel "Inventory health", tile 1 |
| Missing files | Tile 2 and KPI 6 |
| Files due for inventory verification | Tile 3 |
| Files scheduled for transfer | Tile 4 |
| Storage Location Dashboard / HQ Storage | Panel "Storage location dashboard" |
| Field Offices | Same panel |
| Offsite Storage | Same panel |
| Records Center | Same panel |

The bare line "Total" under "Total physical files" is read as the current
holdings, that is total minus legacy, since legacy is the other child of the
same parent. Confirm that reading.

---

## 7. Format and Storage Analysis

Dashboard: **Format and storage**

| Requirement line | Where it lands |
| --- | --- |
| Declared Records by Format / PDF, Word, Excel, PowerPoint, Email (.msg/.eml), Image files, Video files, [All Other formats] | Panel "Declared records by format", all eight groups, and the format table |
| Storage by Format / Number of files | Format table, column 2 |
| Storage consumed (GB/TB) | Format table column 3, and panel "Storage by format" |

The eight format file counts are a decomposition of the declared record total
and are asserted to sum to it at load, so this dashboard cannot drift away from
Records management.

---

## 8. Retention and Disposition Metrics

Dashboard: **Retention and disposition**

| Requirement line | Where it lands |
| --- | --- |
| Retention Dashboard / Records due for disposition | Panel "Retention dashboard", tile 1 |
| Records due within 30 days | Tile 2 |
| Records due within 90 days | Tile 3 |
| Records awaiting approval | Tile 4 |
| Disposition completed | Tile 5 |
| Disposition backlog | Tile 6 |
| Retention Compliance / Records with retention schedules | Panel "Retention compliance", tile 1 |
| Records without retention schedules | Tile 2 |
| Libraries without mapped retention schedules | Tile 3 and the table beneath |
| Disposition Risk Indicators / Overdue dispositions | Panel "Disposition risk indicators" |
| Records beyond retention periods | Same panel |
| Disposition approval backlog | Same panel |

---

## 9. Security and Information Classification

Dashboard: **Security and classification**

| Requirement line | Where it lands |
| --- | --- |
| Access Management / Restricted records | KPI 1, panel "Access management" |
| Confidential records | KPI 2, panel "Access management" |
| Access requests | KPI 3 |
| External sharing instances | KPI 4 |
| Permission exceptions | KPI 5 |
| Information Classification / Records with sensitivity labels | Panel "Information classification", tile 1 |
| Records without sensitivity labels | Tile 2 and KPI 6 |
| Records by classification level | Same panel, bars and table |

---

## 10. Search and Usage Analytics

Dashboard: **Search and usage**

| Requirement line | Where it lands |
| --- | --- |
| Information Retrieval / Searches performed | KPI 1, panel "Information retrieval" |
| Successful searches | KPI 2, same panel |
| Frequently searched record categories | Same panel, bar chart |
| Records accessed per month | KPI 3, same panel, monthly columns |
| Top Content / Most viewed records | Panel "Top content", "Most viewed" |
| Most downloaded records | Panel "Top content", "Most downloaded" |
| Most accessed libraries | Panel "Top content", bottom chart |

"Top Content" sits at the same outline level as the numbered sections in the
source document, which looks like a numbering slip: its three children are usage
measures and belong with Information Retrieval. It is carried as the second
panel of Search and usage. Say if it was meant to be a section of its own.

---

## What was removed from the previous Utilization Report

The 2026.4 requirement is a different report, not a revision of the old one.
These things were in the previous report and are **not** in this one, because
the requirement does not ask for them:

| Removed | Why |
| --- | --- |
| **Division**, everywhere | The requirement never mentions division. The drill is now Department, then Site, then Library. This also removes the report's dependence on a term that was never populated anyway |
| The **Overview** dashboard as it was | Replaced by Bankwide oversight, which is built from the requirement's own executive summary list rather than carried over |
| **Sites and Libraries** as a standalone dashboard | The requirement distributes site and library measures across Risk and compliance and Department insight. There is no section that corresponds to a combined sites and libraries page |
| The **sites created by department treemap** | The requirement asks for new sites created and sites archived as trends, not as a treemap by department |
| The **7 / 30 / 90 day unique viewer buttons** | The requirement asks for 90 and 180 day library activity windows instead. This is a good outcome: Microsoft does not return unique viewers at 90 days, so the old control could not have been built as drawn |
| The **Data Design** reference page | Replaced by Data sources and feasibility, which answers the question that page was reaching for: not what the tables look like, but whether each number can be produced |

Things that were in the previous report **and** in the requirement were kept and
rebuilt: total declared records, declaration rate, physical counterpart split,
department drilldown, library usage, format and storage, and retention.

---

## Things the requirement leaves open

Worth settling before this is built for real. None of them block the prototype.

1. **Site owners**, a full enumeration or the departmental contact. See section 3.
2. **"Total"** under total physical files. Read here as current holdings. See section 6.
3. **Top Content**, a section of its own or part of Search and usage. See section 10.
4. **Orphaned** is defined at over 90 days in section 1 and inactive at over 300
   days in section 2. Both are carried, and the prototype reports them as
   separate thresholds rather than picking one.
5. **Sovereign, nonsovereign and corporate.** The requirement names the first
   two. Sites that are neither have to go somewhere, so a third bucket exists.
   Confirm that is acceptable, or say which of the two corporate sites belong in.
6. **Classification level and sensitivity label** are treated as two different
   fields, because they are. Confirm which one section 9 is asking about.
