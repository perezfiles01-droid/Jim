"""Build EDRMS_Utilization_Report_Checker_2026-08-13.xlsx.

A checker for the report: one sheet per dashboard, every figure on it, where
each figure comes from, which database column carries it, how it is computed,
whether it can be tested in the tenant today, and what to ask the client.

Never hand edit the workbook. Edit this file and rerun:

    python3 .claude/skills/edrms-utilization-report/scripts/build_checker.py

The dashboard inventory is kept in step with index.html by hand. If a panel is
added there, add its rows here. check_data.js guards the reverse direction, that
nothing in the requirements loses its home on the page.
"""

import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from utilization_tables import TABLES, SOURCE

OUT = "EDRMS_Utilization_Report_Checker_2026-08-13.xlsx"
FONT = "Arial"
ADB_BLUE = "0067B1"
GREY = "6B7785"

FILL_HEAD = PatternFill("solid", fgColor=ADB_BLUE)
FILL_TITLE = PatternFill("solid", fgColor="E8EFF6")
FILL_SECT = PatternFill("solid", fgColor="F2F6FA")
THIN = Side(style="thin", color="D4DCE4")
BORDER = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)

# Status drives the colour, and is the column to filter on.
STATUS_FILL = {
    "Buildable now":            PatternFill("solid", fgColor="D9EFD9"),
    "Needs department list":    PatternFill("solid", fgColor="E4F0DA"),
    "Needs new column or join": PatternFill("solid", fgColor="FFF2CC"),
    "Needs application change": PatternFill("solid", fgColor="FFE4CC"),
    "Needs reference list":     PatternFill("solid", fgColor="FFF7DA"),
    "Needs new data source":    PatternFill("solid", fgColor="F8D7D7"),
    "Decision needed":          PatternFill("solid", fgColor="E2DCF0"),
}
STATUS_MEANING = {
    "Buildable now": "Sourceable from the 73 column design as it stands",
    "Needs department list": "Buildable the moment RAC supply the site to department list",
    "Needs new column or join": "The design must change: a new column, or a join that does not exist",
    "Needs application change": "Needs a new field in the EDRMS application, a development change request",
    "Needs reference list": "Not a measurement. Somebody has to maintain a list for it to exist",
    "Needs new data source": "A system we have not touched, or data no API returns",
    "Decision needed": "The client must answer before it can be scoped",
}

HDR = ["S/N", "Section", "Element", "Type", "What the figure is",
       "Source system", "Database table", "Database column", "How it is produced",
       "In the design?", "In the tenant today?", "Testable in the tenant, and how",
       "Effort", "Status", "Question to ask the client, and why"]
WID = [5, 26, 30, 9, 40, 20, 22, 30, 48, 13, 15, 46, 9, 24, 60]

# Shorthands used a lot below.
T1, T2, T3, T4 = "1 Utilization Report", "2 Site Activity", "3 User Activity", "4 File Plan"
EDRMS, GRAPH, USAGE, ANALYTICS, TERMS, LIST, NONE = (
    "EDRMS database", "Microsoft Graph", "M365 usage report", "Site analytics",
    "Term store", "SharePoint list", "No source")
BUILD, DEPT, JOIN, APPCH, REFL, NEWSRC, DECIDE = (
    "Buildable now", "Needs department list", "Needs new column or join",
    "Needs application change", "Needs reference list", "Needs new data source",
    "Decision needed")

# Test recipes reused across rows, so a tester reads the same words each time.
TEST_DECL = ("Yes. Query public.\"Records\" in drm-npr and count rows. "
             "About 1,990 in UAT")
TEST_DOCS = ("Partly. The declared half is queryable today. The undeclared half "
             "needs the weekly SharePoint scan, which is not built")
TEST_USAGE = ("Yes. Export the SharePoint site usage report from "
              "admin.microsoft.com, Reports, Usage, SharePoint site usage")
TEST_USER = ("Yes. Export the SharePoint activity user detail report. "
             "Note only 8 of the 30 licensed users in UAT show any activity")
TEST_GRAPH = "Yes. Graph Explorer, aka.ms/ge, with the call in the formula column"
TEST_NO = "No. Nothing in the tenant holds this"
TEST_DEPT = ("Not until the department list exists. The measure itself is "
             "testable bank-wide today")

Q_DEPT = ("Ask RAC for the site to department list, roughly 1,057 rows, one "
          "department per site URL. Check AvePoint Cloud Governance first, it "
          "may already hold it from the site request. Why: this single list "
          "unlocks every departmental figure in the report")
Q_DIV = ("Ask who supplies division alongside department. Why: the tier was "
         "reinstated at the client's request but nothing in the tenant "
         "populates it, so the RAC list has to carry a division column too")
Q_PROJ = ("Ask whether a project site register exists: site URL to project "
          "number, and sovereign or nonsovereign. Check Cloud Governance "
          "first. Why: it is the only thing missing for the whole Project "
          "Insights dashboard, every measure on it is already producible")
Q_FILEPLAN = ("Ask where the institutional file plan actually lives. It is in "
              "neither the term store, which holds 6 dropdown value sets and "
              "16 terms one level deep, nor Purview, which holds 53 flat "
              "retention labels. Why: a whole dashboard waits on the answer")
Q_TERMJOIN = ("Ask the development team to add a term reference to the "
              "document row, or supply a term to library mapping list. Why: "
              "nothing links a term to a document, so no per term figure can "
              "be produced even once the file plan is located")
Q_DISPOSAL = ("Raise a change request for a disposal status field: status, "
              "approver, and date disposed. Why: nothing records that a "
              "disposal happened, so every completion figure is unanswerable")
Q_COMPLIANT = ("Ask Mihal Le which API returns the installed app list per "
               "site, for app {B255A2AF-7F63-4A30-966A-5D5FD99F97D7}. Why: it "
               "defines which sites are in the report at all")
Q_STAFF = ("Ask which system owns staff, contractor and consultant "
           "classification and training completion. The client asks the same "
           "question on their own slide 54. Why: nothing in SharePoint holds it")
Q_IDLE = ("Ask whether an inactive site is 90 days or 300. The deck says 90, "
          "the metrics document says 300. Why: it changes every inactivity "
          "figure, and it is a one line change either way")
Q_FORMAT = ("Ask RAC for the file extension to format group mapping, a short "
            "list. Why: without it every extension falls into All other formats")
Q_ARCHIVE = ("Ask what archived means for a site, and how it is marked. Why: "
             "there is no definition anywhere, so the figure cannot be counted")
Q_RAC = ("Ask RAC for the physical holdings system: boxes, folders, locations, "
         "transfers and retrievals. Slide 67 names eServe for retrievals and "
         "shows an IR Dashboard screenshot. Why: none of it is in any system "
         "this report reads, and access to that dashboard may answer most of it")
Q_ACCESS = ("Ask whether audit log access can be granted, and confirm the "
            "purpose. Why: access requests, external sharing and permission "
            "exceptions live in the audit log, a different Graph surface with "
            "a different permission set")
Q_REF = ("Ask who maintains this list and where it will live. Why: it is not a "
         "measurement, nothing can generate it, and without an owner the panel "
         "stays empty")


def R(section, element, typ, measure, source, table, column, formula,
      design, tenant, test, effort, status, question=""):
    return (section, element, typ, measure, source, table, column, formula,
            design, tenant, test, effort, status, question)


# =====================================================================
# 01 BANK-WIDE OVERSIGHT
# =====================================================================
BW = [
 R("Top panel", "Total EDRMS Users", "KPI", "Distinct people who used SharePoint in the window",
   USAGE, T3, "UserPrincipalName, ViewedOrEditedFileCount",
   "COUNT(DISTINCT UserPrincipalName) WHERE ViewedOrEditedFileCount > 0, over the latest snapshot",
   "Yes", "Yes", TEST_USER, "Easy", BUILD,
   "None. Warn the client that the export lists every licensed user, so the row count is not the active count"),
 R("Top panel", "Total Documents in EDRMS", "KPI", "All documents in compliant sites, declared or not",
   EDRMS + " plus scan", T1, "All rows WHERE IsEdrmsCompliant AND NOT IsDeleted",
   "COUNT(*). The undeclared rows are the denominator for every rate",
   "Yes", "Partly", TEST_DOCS, "Medium", BUILD,
   "None, but flag that the weekly scan must be built before this is real"),
 R("Top panel", "Total Records Declared", "KPI", "Documents formally declared as records",
   EDRMS, T1, "IsDeclaredRecord", "COUNT(*) WHERE IsDeclaredRecord = true",
   "Yes", "Yes", TEST_DECL, "Easy", BUILD),
 R("Top panel", "Total Physical Counterparts", "KPI", "Declared records with a paper counterpart",
   EDRMS, T1, "HasPhysical", "COUNT(*) WHERE HasPhysical = true",
   "Yes", "Yes", "Yes. Query Records and count where the EDRMSMeta HasPhysical key is true",
   "Easy", BUILD),
 R("Top panel", "Total Records Due for Disposal", "KPI", "Records reaching the end of retention in 12 months",
   EDRMS, T1, "EDRMSDueDateForDisposal",
   "COUNT(*) WHERE EDRMSDueDateForDisposal BETWEEN today AND today + 12 months",
   "Yes", "Yes", "Yes. The due date is already computed in the source database",
   "Easy", BUILD),
 R("Top panel", "Active EDRMS Sites, Department / RM / Office", "KPI", "Compliant departmental sites still in use",
   USAGE + " plus " + GRAPH, T2, "IsEdrmsCompliant, LastActivityDate, ADBDepartmentOwner",
   "COUNT(*) WHERE IsEdrmsCompliant AND LastActivityDate >= today - 90",
   "Yes, 2 columns need a rule", "Partly", TEST_USAGE, "Medium", DEPT,
   Q_COMPLIANT + ". Also " + Q_IDLE),
 R("Top panel", "Active EDRMS Sites, Sovereign Projects", "KPI", "Compliant sites belonging to sovereign projects",
   NONE, T2, "No column exists", "Would be COUNT(*) WHERE facility type = Sovereign",
   "No", "No", TEST_NO, "Blocked", NEWSRC, Q_PROJ),
 R("Top panel", "Active EDRMS Sites, Nonsovereign Projects", "KPI", "Compliant sites belonging to nonsovereign projects",
   NONE, T2, "No column exists", "Would be COUNT(*) WHERE facility type = Nonsovereign",
   "No", "No", TEST_NO, "Blocked", NEWSRC, Q_PROJ),

 R("Users drill", "Active users, Never accessed, No access in 90 days", "Tile",
   "Adoption split of the user population", USAGE, T3, "LastActivityDate, ViewedOrEditedFileCount",
   "Active: ViewedOrEditedFileCount > 0. Never accessed: LastActivityDate IS NULL. "
   "Idle: LastActivityDate < today - 90",
   "Yes", "Yes", TEST_USER, "Easy", BUILD),
 R("Users drill", "Staff, Contractors, Consultants", "Table column",
   "Employment class of each user", NONE, T3, "No column exists",
   "Would be a GROUP BY over an employment type carried on the user row",
   "No", "No", TEST_NO, "Blocked", NEWSRC, Q_STAFF),
 R("Users drill", "Training completion", "Tile", "Share of users who completed EDRMS training",
   NONE, "None", "No column exists", "Would come from an HR or LMS extract joined on UPN",
   "No", "No", TEST_NO, "Blocked", REFL, Q_STAFF),
 R("Users drill", "By department", "Table column", "Every user figure cut by department",
   NONE, T2 + " to " + T3, "ADBDepartmentOwner", "JOIN on site, then GROUP BY ADBDepartmentOwner",
   "Column exists, unpopulated", "No", TEST_DEPT, "Easy", DEPT, Q_DEPT),

 R("Documents drill", "Documents, Storage", "Table column", "Documents held and the space they use",
   EDRMS + " plus " + GRAPH, T1, "FileCreatedDate, FileSize",
   "COUNT(*) and SUM(FileSize)/1024^3 for GB, grouped by department",
   "Yes, FileSize is a new key", "Partly", TEST_GRAPH + ": GET /sites/{id}/drive/items, the size field",
   "Medium", DEPT,
   "None, but note that a folder returns a cumulative size, so the scan must filter to files only"),
 R("Documents drill", "Users creating documents", "Table column", "Distinct authors of documents",
   NONE, T1, "CreatedBy covers declarers only",
   "Would be COUNT(DISTINCT Author). The scan does not capture Author today",
   "Partly", "No", "No. We hold who declared a record, not who authored an undeclared document",
   "Medium", JOIN,
   "Ask the development team to capture Author on the document scan. Why: without it, "
   "creation activity can only be measured for records, not for documents"),

 R("Records drill", "Records declared, Users declaring, Declaration rate", "Table column",
   "Declaration volume and coverage per department", EDRMS, T1,
   "IsDeclaredRecord, CreatedBy, ADBDepartmentOwner",
   "Rate = COUNT(IsDeclaredRecord = true) / COUNT(*), grouped by ADBDepartmentOwner",
   "Yes", "Partly", TEST_DEPT, "Easy", DEPT, Q_DEPT),
 R("Records drill", "By division", "Drill tier", "The same figures one level below department",
   NONE, T1 + " and " + T2, "No division column exists",
   "Would be GROUP BY a division carried alongside department",
   "No, removed 10 Aug and rebuilt as layout 13 Aug", "No", TEST_NO, "Easy once supplied", NEWSRC, Q_DIV),

 R("Counterparts drill", "Physical counterparts by department", "Table column",
   "Records flagged as having a paper copy", EDRMS, T1, "HasPhysical, ADBDepartmentOwner",
   "COUNT(*) WHERE HasPhysical, grouped by department", "Yes", "Partly", TEST_DEPT, "Easy", DEPT, Q_DEPT),
 R("Counterparts drill", "Turned over to RAC, Completion rate", "Table column",
   "Counterparts physically transferred to RAC", NONE, "None", "No column exists",
   "Would be transferred / flagged as having a counterpart",
   "No", "No", TEST_NO, "Blocked", NEWSRC, Q_RAC),

 R("Disposal drill", "Records due, Next due date", "Table column", "What falls due and when",
   EDRMS, T1, "EDRMSDueDateForDisposal", "COUNT and MIN over the due date, grouped by department",
   "Yes", "Yes", "Yes. Query the due date column directly", "Easy", DEPT, Q_DEPT),
 R("Disposal drill", "Approver, Status, Records disposed", "Table column",
   "Who approves a disposal and what happened", NONE, T1, "DisposalStatus was removed from the design",
   "Would be GROUP BY status. Nothing records that a disposal occurred",
   "No, deliberately", "No", TEST_NO, "Blocked", APPCH, Q_DISPOSAL),

 R("Overview of sites", "Department table", "Table",
   "Sites, documents, records and counterparts for every department",
   EDRMS + " plus " + USAGE, T1 + " and " + T2, "ADBDepartmentOwner and the measures above",
   "GROUP BY ADBDepartmentOwner over both tables, joined on SiteUrl",
   "Yes", "Partly", TEST_DEPT, "Medium", DEPT, Q_DEPT),
 R("Overview of sites", "Department treemap", "Chart", "Departments sized by records declared",
   EDRMS, T1, "IsDeclaredRecord, ADBDepartmentOwner", "Same query as the table, rendered as a treemap",
   "Yes", "Partly", TEST_DEPT, "Easy", DEPT, Q_DEPT),
 R("Overview of sites", "Sites created, last 90 days", "Tile", "New compliant sites in the period",
   GRAPH, T2, "SiteCreatedDate", "COUNT(*) WHERE SiteCreatedDate >= today - 90",
   "Yes", "Yes", TEST_GRAPH + ": GET /sites?search=*&$select=createdDateTime", "Easy", BUILD),
 R("Overview of sites", "Inactive over 90 days", "Tile", "Sites with no activity since the threshold",
   USAGE, T2, "LastActivityDate", "COUNT(*) WHERE LastActivityDate < today - 90. Threshold is not stored",
   "Yes", "Yes", TEST_USAGE + ". Populated on 381 of 1,918 live sites", "Easy", BUILD, Q_IDLE),
 R("Overview of sites", "Sites deleted", "Tile", "Sites removed since the last snapshot",
   USAGE, T2, "IsDeleted", "A site present last week and absent this week is the delete signal",
   "Yes, unpopulated", "Partly", "Partly. Needs two snapshots to compare, so it needs the job running weekly",
   "Medium", JOIN,
   "Confirm that a deleted site should be counted from its disappearance between two snapshots, "
   "rather than from a deletion event. Why: nothing raises an event to us, so absence is the only "
   "signal available, and it cannot distinguish a deletion from a permissions change that hides "
   "the site from the export"),
 R("Overview of sites", "Sites archived", "Tile", "Sites moved to an archived state",
   NONE, T2, "No column exists", "No rule exists to compute it",
   "No", "No", TEST_NO, "Blocked", DECIDE, Q_ARCHIVE),

 R("Comparison", "Users against documents, users against records, documents against records", "Chart",
   "Three ratios per department", EDRMS + " plus " + USAGE, T1 + " and " + T3,
   "UserPrincipalName, IsDeclaredRecord, all document rows",
   "Two measures per department drawn side by side. The third pair is the declaration rate",
   "Yes", "Partly", TEST_DEPT, "Easy", DEPT, Q_DEPT),

 R("Declaration trend", "Records declared by month", "Chart", "Declarations in each of the last 12 months",
   EDRMS, T1, "CreatedDate, IsDeclaredRecord",
   "COUNT(*) GROUP BY month of CreatedDate, last 12 closed months",
   "Yes", "Yes", TEST_DECL + ", grouped by month of CreatedDate", "Easy", BUILD),
 R("Declaration trend", "Department filter", "Filter", "The same trend for one department",
   EDRMS, T1, "ADBDepartmentOwner", "Add WHERE ADBDepartmentOwner = selection",
   "Column exists, unpopulated", "No", TEST_DEPT, "Easy", DEPT, Q_DEPT),
 R("Declaration trend", "Records declared this month, Monthly average", "Tile",
   "Current month against its 12 month average", EDRMS, T1, "CreatedDate",
   "Latest month value, and total / 12", "Yes", "Yes", TEST_DECL, "Easy", BUILD),
 R("Declaration trend", "Records declared by year", "Chart", "Declarations per calendar year",
   EDRMS, T1, "CreatedDate", "COUNT(*) GROUP BY year of CreatedDate",
   "Yes", "Yes", TEST_DECL + ", grouped by year", "Easy", BUILD),

 R("Site activity trend", "Site visits by month", "Chart", "Page views across the estate each month",
   USAGE, T2, "SiteVisits7, ReportRefreshDate",
   "SUM(SiteVisits7) over the snapshots in each month. NEVER sum the 30, 90 or 180 day "
   "columns: 7 day windows tile exactly, longer ones overlap",
   "Yes", "Partly", "Partly. One snapshot is testable today. A series needs the job running weekly, "
   "and history that was never captured cannot be recovered",
   "Medium", BUILD,
   "None. Confirm the job start date with the client, because the trend can only begin there"),
 R("Site activity trend", "Department and period filters", "Filter", "The series cut by department and window",
   USAGE, T2, "ADBDepartmentOwner, ReportRefreshDate",
   "WHERE ADBDepartmentOwner = selection, and last N months on ReportRefreshDate",
   "Yes", "Partly", TEST_DEPT, "Easy", DEPT, Q_DEPT),

 R("Retention rollup", "Permanent and temporary split", "Chart and table",
   "How the holding divides by retention type", EDRMS, T1, "EDRMSDuration, EDRMSRetentionLabel",
   "Permanent WHERE EDRMSDuration = 'Permanent', temporary otherwise. Duration is text, cast before arithmetic",
   "Yes", "Yes", "Yes. Query the retention label and duration columns", "Easy", BUILD),
 R("Retention rollup", "Departments and libraries provisioned per term", "Table column",
   "Reach of each retention term", NONE, T4, "No join from a term to a library exists",
   "Would need a term reference on the document or library row",
   "No", "No", TEST_NO, "Blocked", JOIN, Q_TERMJOIN),
 R("Retention rollup", "Disposed", "Table column", "Records actually disposed of",
   NONE, T1, "No column exists", "Would be COUNT WHERE disposal completed",
   "No", "No", TEST_NO, "Blocked", APPCH, Q_DISPOSAL),

 R("Format and storage", "Files and storage by format group", "Chart and table",
   "The eight format families", EDRMS + " plus " + GRAPH, T1, "FormatGroup, FileType, FileSize",
   "COUNT(*) and SUM(FileSize) GROUP BY FormatGroup. FormatGroup is derived from FileType by a mapping list",
   "Yes, mapping outstanding", "Partly", TEST_GRAPH + " for size, the database for extension",
   "Medium", DECIDE, Q_FORMAT),
 R("Format and storage", "Average file size", "Table column", "Mean size within a format group",
   GRAPH, T1, "FileSize", "SUM(FileSize) / COUNT(*), converted to MB",
   "Yes", "Partly", TEST_GRAPH, "Easy", BUILD),

 R("Risk and compliance", "Compliant, active and inactive sites", "Tile and chart",
   "Site health across the estate", USAGE, T2, "IsEdrmsCompliant, LastActivityDate",
   "COUNT over the compliance flag and the activity threshold",
   "Yes", "Partly", TEST_USAGE, "Easy", DECIDE, Q_COMPLIANT + ". Also " + Q_IDLE),
 R("Risk and compliance", "Orphaned sites, no owner", "Tile", "Sites with no administrator",
   USAGE, T2, "SiteOwner", "COUNT(*) WHERE SiteOwner IS NULL",
   "Yes", "Yes", TEST_USAGE + ". Verified: 19 of 1,918 live sites have no owner", "Easy", BUILD),
 R("Risk and compliance", "Libraries across sites, active, dormant", "Tile",
   "Library counts and their activity", GRAPH, T2 + " and " + T1, "LibraryCount, LibraryLastActivityDate",
   "SUM(LibraryCount). Active WHERE LibraryLastActivityDate >= today - 90, dormant at 180",
   "Yes", "Yes", TEST_GRAPH + ": GET /sites/{id}/drives, lastModifiedDateTime", "Easy", BUILD),
 R("Risk and compliance", "Libraries with no declared records", "Tile", "Provisioned but unused libraries",
   EDRMS + " plus " + GRAPH, T1, "ListId, IsDeclaredRecord",
   "Library list from Graph MINUS the distinct ListId values present in Records",
   "Yes", "Yes", "Yes. Compare the Graph drive list against distinct ListId in Records", "Easy", BUILD),
 R("Risk and compliance", "Library growth rate", "Tile", "New records against the opening balance",
   EDRMS, T1, "CreatedDate, ListId",
   "Records created in the period / records held at the start of the period",
   "Yes", "Yes", TEST_DECL, "Easy", BUILD),
 R("Risk and compliance", "Library ranking, three measures", "Chart",
   "Largest by volume, largest by storage, highest declaration rate",
   EDRMS + " plus " + GRAPH, T1, "ListId, LibraryName, SiteName, FileSize, IsDeclaredRecord",
   "GROUP BY ListId, ordered by the chosen measure. Always show the library with its parent site, "
   "because library names repeat across sites",
   "Yes", "Partly", TEST_GRAPH + " for size", "Easy", BUILD),
 R("Risk and compliance", "Most used libraries", "Tile", "Libraries ranked by views and edits",
   NONE, "None", "No column exists", "SharePoint reports activity per site and never per library",
   "No", "No", TEST_NO, "Blocked", NEWSRC,
   "Tell the client this cannot be produced and offer records created per library instead. "
   "Why: Microsoft exposes no per library activity feed at all"),
 R("Risk and compliance", "Orphaned libraries", "Tile", "Libraries with no owner",
   NONE, "None", "No library owner column exists", "We hold an owner for the site only",
   "No", "No", TEST_NO, "Blocked", JOIN,
   "Ask whether a library owner is maintained anywhere. Why: the site owner is the only "
   "owner the tenant returns"),

 R("Records quality", "Duplicated records", "Tile", "Declared records sharing a filename",
   EDRMS, T1, "Title", "COUNT over Title HAVING COUNT(*) > 1. A repeated filename is the only "
   "definition the data supports, and it will overcount legitimate repeats such as a monthly report",
   "Yes", "Yes", "Yes. GROUP BY Title on Records and count the groups above one", "Easy", BUILD,
   "Confirm the definition. Why: the client wrote 'with same filenames?' themselves, so they "
   "already suspect it is imprecise"),
 R("Records quality", "Orphaned records", "Tile", "Records whose parent no longer resolves",
   EDRMS, T1, "ListId, SiteUrl", "Records whose ListId or SiteUrl no longer appears in the site or library list",
   "Yes", "Yes", "Yes. Left join Records against the Graph site and drive lists", "Easy", BUILD,
   "Confirm what counts as orphaned. Why: it could mean a missing site, a missing library or a "
   "missing owner, and the three give different numbers"),

 R("Classification", "Records by sensitivity label", "Chart and tile",
   "Protection applied to declared records", EDRMS, T1, "SensitivityLabelName",
   "COUNT(*) GROUP BY SensitivityLabelName, with NULL counted as unlabelled",
   "Yes", "Yes", "Yes. The column is on the document row in the design and readable from Records",
   "Easy", BUILD),
 R("Classification", "Restricted and Confidential records", "Tile", "Counts at each classification level",
   EDRMS, T1, "SensitivityLabelName", "COUNT(*) WHERE SensitivityLabelName IN the chosen levels",
   "Yes", "Yes", "Yes, provided the label set actually uses those names", "Easy", BUILD,
   "Confirm the label names in use. Why: the tile names must match the tenant's own labels"),

 R("Access management", "Access requests granted and declined", "Tile", "Permission requests on sites",
   NONE, "None", "No column exists", "Would come from the audit log, not a reporting feed",
   "No", "No", TEST_NO, "Blocked", NEWSRC, Q_ACCESS),
 R("Access management", "External sharing, Permission exceptions", "Tile", "Content shared outside its site",
   NONE, "None", "No column exists", "Audit log and permission data, a different Graph surface",
   "No", "No", TEST_NO, "Blocked", NEWSRC, Q_ACCESS),

 R("Search analytics", "Searches performed, Successful searches", "Tile", "How people look for records",
   NONE, "None", "No column exists", "SharePoint search analytics are tenant level and not exposed per record",
   "No", "No", TEST_NO, "Blocked", NEWSRC,
   "Tell the client search analytics cannot be attributed to a record or a library. "
   "Why: Microsoft reports them at tenant level only"),
 R("Search analytics", "Most viewed and most downloaded records", "Tile", "Top content",
   NONE, "None", "No column exists", "Graph analytics reports a site, never a document",
   "No", "No", TEST_NO, "Blocked", NEWSRC,
   "Offer most active sites instead. Why: document grain analytics do not exist"),
]

# =====================================================================
# 02 DEPARTMENT INSIGHTS
# =====================================================================
DP = [
 R("Scope", "Department picker", "Filter", "Every panel follows the chosen department",
   NONE, T2, "ADBDepartmentOwner", "WHERE ADBDepartmentOwner = selection, inherited by documents through SiteUrl",
   "Column exists, unpopulated", "No", TEST_DEPT, "Easy", DEPT, Q_DEPT),
 R("Top panel", "Go-live date", "Label", "When the department started on EDRMS",
   NONE, "None", "No column exists", "A maintained list, one date per department",
   "No", "No", TEST_NO, "Blocked", REFL, Q_REF),
 R("Top panel", "Sites, Users, Documents, Records, Counterparts, Due", "KPI",
   "The department's totals", EDRMS + " plus " + USAGE, T1 + ", " + T2 + ", " + T3,
   "Same columns as Bank-wide, filtered", "Every bank-wide measure with a department filter applied",
   "Yes", "Partly", TEST_DEPT, "Easy", DEPT, Q_DEPT),
 R("Top panel", "Sites Inactive over 90 Days", "KPI", "Idle sites in this department",
   USAGE, T2, "LastActivityDate", "COUNT(*) WHERE LastActivityDate < today - 90",
   "Yes", "Yes", TEST_USAGE, "Easy", DEPT, Q_IDLE),

 R("Users", "Active users by division", "Table", "Adoption inside the department",
   USAGE, T3, "UserPrincipalName, LastActivityDate", "COUNT(DISTINCT UPN) grouped by division",
   "Division does not exist", "No", TEST_NO, "Easy once supplied", NEWSRC, Q_DIV),
 R("Users", "Staff, Contractors, Consultants, Training", "Table column", "Employment class and training",
   NONE, "None", "No column exists", "Would come from an HR or LMS extract joined on UPN",
   "No", "No", TEST_NO, "Blocked", NEWSRC, Q_STAFF),

 R("Visitors", "Visitors per site", "Table", "People opening content in each site",
   ANALYTICS, T2, "UniqueViewers7, UniqueViewersAllTime",
   "GET /sites/{id}/analytics/allTime and /lastSevenDays, the actorCount field. "
   "Two windows only, there is no 30 or 90 day window",
   "Yes", "Yes", TEST_GRAPH + ". Returned actorCount 12 on a test site", "Easy", BUILD,
   "Warn the client only 7 day and all time windows exist. Why: their slide implies a monthly figure"),
 R("Visitors", "Internal against external visitors", "Table column", "Where visitors come from",
   NONE, T2, "No column exists", "Graph returns a count with no internal or external split",
   "No", "No", TEST_NO, "Blocked", NEWSRC, Q_ACCESS),
 R("Visitors", "Access requests granted and declined", "Table column", "Permission requests per site",
   NONE, "None", "No column exists", "Audit log data, not a reporting feed",
   "No", "No", TEST_NO, "Blocked", NEWSRC, Q_ACCESS),

 R("Sites", "Site list with owners", "Table", "Every site the department owns",
   USAGE, T2, "SiteName, SiteOwner, SiteUrl", "All sites WHERE ADBDepartmentOwner = selection",
   "Yes", "Partly", TEST_USAGE + ". SiteOwner present on 1,899 of 1,918 live sites",
   "Easy", DEPT, Q_DEPT),
 R("Sites", "Documents, records, counterparts, due per site", "Table column", "What each site holds",
   EDRMS, T1, "SiteUrl, IsDeclaredRecord, HasPhysical, EDRMSDueDateForDisposal",
   "GROUP BY SiteUrl over the document table",
   "Yes", "Partly", TEST_DOCS, "Easy", DEPT, Q_DEPT),
 R("Sites", "No activity in 90 days", "Table column", "Sites that have gone quiet",
   USAGE, T2, "LastActivityDate", "LastActivityDate < today - 90, derived not stored",
   "Yes", "Yes", TEST_USAGE, "Easy", BUILD, Q_IDLE),

 R("Documents", "Documents, users creating, storage", "Table", "Content produced by each site",
   EDRMS + " plus " + GRAPH, T1, "FileCreatedDate, FileSize, CreatedBy",
   "COUNT and SUM per site. Users creating is unavailable for undeclared documents",
   "Partly", "Partly", TEST_DOCS, "Medium", DEPT, Q_DEPT),

 R("Declaration", "Records declared and rate per site", "Table", "Declaration performance",
   EDRMS, T1, "IsDeclaredRecord, SiteUrl", "COUNT(IsDeclaredRecord) / COUNT(*) per site",
   "Yes", "Partly", TEST_DECL, "Easy", DEPT, Q_DEPT),
 R("Declaration", "Division rows under each site", "Drill tier", "The same figures per division",
   NONE, T1, "No division column exists", "Would be GROUP BY division within site",
   "No", "No", TEST_NO, "Easy once supplied", NEWSRC, Q_DIV),
 R("Declaration", "Declaration donut and site ranking", "Chart", "Declared against everything held",
   EDRMS, T1, "IsDeclaredRecord", "Declared and undeclared as two slices, sites ranked by records",
   "Yes", "Partly", TEST_DOCS, "Easy", DEPT, Q_DEPT),

 R("Library usage", "Libraries by file plan category", "Table", "Content by classification",
   EDRMS + " plus " + TERMS, T1 + " and " + T4, "LibraryName, ListId, CategoryName",
   "GROUP BY ListId, grouped under the file plan category the library maps to",
   "No join exists", "No", TEST_NO, "Blocked", JOIN, Q_FILEPLAN + ". Also " + Q_TERMJOIN),
 R("Library usage", "Users per library", "Table column", "People working in each library",
   NONE, "None", "No column exists", "SharePoint reports viewers per site, never per library",
   "No", "No", TEST_NO, "Blocked", NEWSRC,
   "Tell the client this is not available at library grain. Why: Microsoft exposes no per library viewer feed"),

 R("Trend", "Records declared by month", "Chart", "The department's declaration trend",
   EDRMS, T1, "CreatedDate, ADBDepartmentOwner", "COUNT GROUP BY month, filtered to the department",
   "Yes", "Partly", TEST_DEPT, "Easy", DEPT, Q_DEPT),

 R("Disposal", "Records due by library, approver, status", "Table", "Disposal readiness",
   EDRMS, T1, "EDRMSDueDateForDisposal, LibraryName", "COUNT and MIN per library. Approver and status have no source",
   "Partly", "Partly", "Partly. Due dates yes, approver and status no", "Medium", APPCH, Q_DISPOSAL),

 R("Conventions", "Convention link, approval date, version", "Panel", "The department's naming convention",
   NONE, "None", "No column exists", "A maintained list, one row per department",
   "No", "No", TEST_NO, "Blocked", REFL, Q_REF),
 R("Programme dates", "Audit, review, training, CoP dates", "Panel", "The records management calendar",
   NONE, "None", "No column exists", "A maintained list, five dates per department",
   "No", "No", TEST_NO, "Blocked", REFL, Q_REF),
]

# =====================================================================
# 03 PROJECT INSIGHTS
# =====================================================================
PJ = [
 R("Classification", "Which sites are project sites", "Filter", "The population this dashboard reports on",
   NONE, T2, "No column exists",
   "Would be a project register loaded onto the site row, the same way department will be",
   "No", "No", TEST_NO, "Blocked", NEWSRC, Q_PROJ),
 R("Classification", "Sovereign against nonsovereign", "Filter", "Facility type of each project",
   NONE, T2, "No column exists", "Would come with the project register",
   "No", "No", TEST_NO, "Blocked", NEWSRC, Q_PROJ),
 R("Projects", "Project number and name", "Table", "The list of projects",
   NONE, T2, "No column exists", "ADB operational data, held in ADB project systems",
   "No", "No", TEST_NO, "Blocked", NEWSRC, Q_PROJ),
 R("Projects", "Sites, documents, records, counterparts, due", "Table column",
   "What each project holds", EDRMS, T1 + " and " + T2, "All the standard measures",
   "Every one of these is producible today for any site we can identify. Only the classification is missing",
   "Yes", "Partly", "Yes, once a site can be identified as belonging to a project",
   "Easy", NEWSRC, Q_PROJ),
 R("Profile", "Facility type, modality, country, status, dates", "Panel",
   "The project's own attributes", NONE, "None", "No column exists",
   "ADB operational data. ProjectEndDate on the site table is the only project field held",
   "One field of eight", "No", TEST_NO, "Blocked", NEWSRC, Q_PROJ),
 R("Profile", "Declaration and counterpart donuts", "Chart", "Recordkeeping for one project",
   EDRMS, T1, "IsDeclaredRecord, HasPhysical", "Two slice donuts over the project's documents",
   "Yes", "Partly", "Yes, once the project's sites are known", "Easy", NEWSRC, Q_PROJ),
]

# =====================================================================
# 04 INSTITUTIONAL FILE PLAN
# =====================================================================
FP = [
 R("Structure", "The five categories", "KPI and table", "Top level groups of the file plan",
   TERMS, T4, "CategoryName, TermName, TermSetName, Depth",
   "GET /termStore/groups, then /sets, then /children, walking one level at a time",
   "Yes, unverified", "No", "Partly. The term store is readable, but it does not hold this file plan. "
   "It holds 6 dropdown value sets, 16 terms, one level deep",
   "Medium", DECIDE, Q_FILEPLAN),
 R("Structure", "Total terms, terms per category", "KPI", "Size of the plan",
   TERMS, T4, "TermId, CategoryName", "COUNT(*) GROUP BY CategoryName",
   "Yes", "No", "Yes for whatever the term store holds, which is not the file plan",
   "Easy", DECIDE, Q_FILEPLAN),
 R("Term tables", "Documents, records, counterparts per term", "Table column",
   "How heavily each term is used", NONE, T1 + " to " + T4, "No join key exists",
   "Would be COUNT over documents GROUP BY term. Table 4 has no join key and Table 1 carries no TermId",
   "No", "No", TEST_NO, "Blocked", JOIN, Q_TERMJOIN),
 R("Term tables", "Libraries and departments provisioned per term", "Table column",
   "Reach of each term", NONE, T4, "No join key exists", "Same missing link, plus the department list",
   "No", "No", TEST_NO, "Blocked", JOIN, Q_TERMJOIN + ". Also " + Q_DEPT),
 R("Term usage", "Most used and least used terms", "Chart", "Usage pattern across the plan",
   NONE, T1 + " to " + T4, "No join key exists", "Ordered COUNT per term, once the join exists",
   "No", "No", TEST_NO, "Blocked", JOIN, Q_TERMJOIN),
 R("Classification", "Records by classification", "Tile", "Declared records by file plan term",
   NONE, T1, "No term reference exists", "The term table read the other way round",
   "No", "No", TEST_NO, "Blocked", JOIN, Q_TERMJOIN),
 R("Classification", "Records by business process", "Tile", "Declared records by business activity",
   NONE, "None", "No column exists, and no definition exists",
   "Needs both the term join and a definition of what a business process is in ADB terms",
   "No", "No", TEST_NO, "Blocked", DECIDE,
   "Ask what a business process is and how it relates to a file plan term. The two are not the "
   "same thing and the requirement names it once without defining it. Why: it cannot be counted "
   "until somebody says what it counts"),
]

# =====================================================================
# 05 RETENTION AND DISPOSAL
# =====================================================================
RD = [
 R("Structure", "Permanent and temporary screens", "Filter", "The two retention types",
   EDRMS, T1, "EDRMSDuration", "Permanent WHERE EDRMSDuration = 'Permanent', temporary otherwise",
   "Yes", "Yes", "Yes. Query the duration column on Records", "Easy", BUILD),
 R("Retention", "Records due, 30, 90 and 12 month windows", "Tile and chart",
   "What falls due in each window", EDRMS, T1, "EDRMSDueDateForDisposal",
   "COUNT(*) WHERE the due date falls in each window. The windows must nest",
   "Yes", "Yes", "Yes. The due date is already computed in the source database", "Easy", BUILD),
 R("Retention", "Retention label and duration per term", "Table column", "How long each class is kept",
   EDRMS, T1, "EDRMSRetentionLabel, EDRMSDuration", "GROUP BY label. Duration is text, cast before arithmetic",
   "Yes", "Yes", "Yes. Purview holds 53 labels, and the label is on the record row", "Easy", BUILD),
 R("Retention", "Beyond retention period", "Tile", "Records past their disposal date",
   EDRMS, T1, "EDRMSDueDateForDisposal", "COUNT(*) WHERE the due date is in the past",
   "Yes", "Yes", "Yes", "Easy", BUILD,
   "Warn that this means the date has passed, not that action is outstanding. "
   "Why: nothing records whether a disposal was carried out"),
 R("Compliance", "Records with and without a retention schedule", "Tile",
   "Whether a record can be scheduled at all", EDRMS, T1, "EDRMSRetentionLabel",
   "COUNT WHERE the label IS NULL against NOT NULL", "Yes", "Yes", "Yes", "Easy", BUILD),
 R("Compliance", "Libraries without a mapped retention schedule", "Tile", "Unmapped libraries",
   LIST, T1, "ADBLibraryCategory, ListId",
   "Library list MINUS the libraries present in the Retention Label Mapping list",
   "Yes", "Unknown", "Yes, and worth doing first: open the Retention Label Mapping list and check "
   "whether it keys libraries by ListId or by name",
   "Easy", DECIDE,
   "Check the mapping list's key yourself before asking anyone. Why: if it keys by ListId this "
   "metric goes straight in, and if it keys by name the join is too fragile to trust"),
 R("Terms", "Departments and libraries provisioned per term", "Table column",
   "Reach of each retention term", NONE, T4, "No join key exists", "Same missing link as the file plan",
   "No", "No", TEST_NO, "Blocked", JOIN, Q_TERMJOIN),
 R("Disposal", "Records disposed, awaiting approval, backlog", "Tile",
   "What has actually happened", NONE, T1, "DisposalStatus was removed from the design",
   "Would be COUNT GROUP BY disposal status", "No, deliberately", "No", TEST_NO, "Blocked",
   APPCH, Q_DISPOSAL),
 R("Disposal", "Physical records overdue for transfer", "Tile", "Counterparts not yet with RAC",
   NONE, "None", "No column exists", "Needs the RAC holdings system",
   "No", "No", TEST_NO, "Blocked", NEWSRC, Q_RAC),
]

# =====================================================================
# 06 RECORDS AND ARCHIVE HOLDINGS
# =====================================================================
RA = [
 R("Storage", "Boxes and folders by location", "Table", "Physical holdings at each location",
   NONE, "None, a PhysicalRecords table was designed and never built", "No column exists",
   "Would come from a physical holdings register",
   "Designed, not built", "No", TEST_NO, "Blocked", NEWSRC, Q_RAC),
 R("Storage", "Requests and requestors", "Table column", "Who is depositing records",
   NONE, "None", "No column exists", "Would come from the same register",
   "No", "No", TEST_NO, "Blocked", NEWSRC, Q_RAC),
 R("Storage", "Capacity used per location", "Chart", "How full each room is",
   NONE, "None", "No column exists", "Facility data. The client asks directly whether it can be included",
   "No", "No", TEST_NO, "Blocked", NEWSRC,
   Q_RAC + ". Answer their direct question: capacity can be displayed the moment somebody holds the figure"),
 R("Retrieval", "Boxes and folders retrieved, status", "Table", "Records taken out of the holdings",
   NONE, "None", "No column exists", "Slide 67 says retrieval is processed in eServe",
   "No", "No", TEST_NO, "Blocked", NEWSRC, Q_RAC),
 R("Inventory health", "Unverified, missing, due for verification", "Tile",
   "State of the physical inventory", NONE, "None", "No column exists",
   "Implies a physical inventory process with a system behind it",
   "No", "No", TEST_NO, "Blocked", NEWSRC, Q_RAC),
 R("Inventory health", "Total physical files, legacy records", "Tile", "Size of the holding",
   NONE, "None", "No column exists", "Same register",
   "No", "No", TEST_NO, "Blocked", NEWSRC, Q_RAC),
 R("Whole dashboard", "Recommendation", "Note", "How to run this piece of work",
   NONE, "None", "n/a",
   "Run as its own workstream. It is a second data source discovery exercise of the same size as "
   "the SharePoint one already completed, and inside the utilization report it would hold up the "
   "other five dashboards",
   "n/a", "n/a", "n/a", "n/a", DECIDE,
   "Ask for access to the IR Dashboard shown on slide 67, and ask what is available in Opus. "
   "Why: both are their own questions to us, and the IR Dashboard may already hold most of this"),
]

SHEETS = [
    ("01 Bank-wide Oversight", "Bank-wide Oversight", "PPT s13 to s18, s34 to s44", BW),
    ("02 Department Insights", "Department Insights", "PPT s19 to s28, s53 to s66", DP),
    ("03 Project Insights", "Project Insights", "PPT s36, s37, s38", PJ),
    ("04 Institutional File Plan", "Institutional File Plan Insights", "PPT s29 to s31, s47 to s52", FP),
    ("05 Retention and Disposal", "Retention and Disposal Insights", "PPT s32, s44 to s46", RD),
    ("06 Records and Archive Holdings", "Records and Archive Holdings", "PPT s33, s67 to s69", RA),
]


# ---------------------------------------------------------------- helpers
def style_header(ws, row, ncols, height=32):
    for c in range(1, ncols + 1):
        cell = ws.cell(row=row, column=c)
        cell.font = Font(name=FONT, size=9.5, bold=True, color="FFFFFF")
        cell.fill = FILL_HEAD
        cell.alignment = Alignment(vertical="center", wrap_text=True)
        cell.border = BORDER
    ws.row_dimensions[row].height = height


def title_block(ws, title, subtitle, ncols):
    ws["A1"] = title
    ws["A1"].font = Font(name=FONT, size=14, bold=True, color=ADB_BLUE)
    ws["A2"] = subtitle
    ws["A2"].font = Font(name=FONT, size=9, italic=True, color=GREY)
    for r in (1, 2):
        for c in range(1, ncols + 1):
            ws.cell(row=r, column=c).fill = FILL_TITLE
    ws.row_dimensions[1].height = 20
    ws.row_dimensions[2].height = 16


def widths(ws, spec):
    for i, w in enumerate(spec, start=1):
        ws.column_dimensions[get_column_letter(i)].width = w


def body(ws, first, last, ncols):
    for r in range(first, last + 1):
        for c in range(1, ncols + 1):
            cell = ws.cell(row=r, column=c)
            cell.font = Font(name=FONT, size=9)
            cell.alignment = Alignment(vertical="top", wrap_text=True)
            cell.border = BORDER


wb = Workbook()

# ================= Read me first =================
ws = wb.active
ws.title = "Read me first"
widths(ws, [3, 30, 104])
ws["B1"] = "EDRMS Utilization Report: report checker"
ws["B1"].font = Font(name=FONT, size=16, bold=True, color=ADB_BLUE)
ws["B2"] = "13 August 2026. One sheet per dashboard, plus the database design behind them."
ws["B2"].font = Font(name=FONT, size=10, italic=True, color=GREY)

intro = [
    ("", ""),
    ("What this workbook is for",
     "Checking the report. Every figure on every dashboard is listed with where it comes from, "
     "which database column carries it, how it is computed, whether it can be tested in the tenant "
     "today, and what to ask the client about it."),
    ("How to use it",
     "Filter a dashboard sheet on the Status column. Green rows can be built now. Everything else "
     "names what is missing and, in the last column, exactly what to ask and why."),
    ("", ""),
    ("The columns on each dashboard sheet", ""),
    ("Section, Element, Type", "Where the figure sits on the dashboard, and what kind of thing it is"),
    ("What the figure is", "The measure in one line, so a reader does not have to open the report"),
    ("Source system", "EDRMS database, Microsoft Graph, M365 usage report, site analytics, term store, "
                      "SharePoint list, or No source"),
    ("Database table and column", "Which of the four tables carries it, and which column. "
                                  "Blank means the column does not exist"),
    ("How it is produced", "The formula or the direction to source it. Written to be handed to whoever "
                           "builds the Power BI measure"),
    ("In the design?", "Whether the 73 column design already carries it"),
    ("In the tenant today?", "Whether the data exists in the test tenant now"),
    ("Testable in the tenant, and how", "The actual check to run, with the export or the API call"),
    ("Effort", "Easy, Medium or Blocked"),
    ("Status", "The verdict. Colour coded, see the Summary sheet"),
    ("Question to ask the client", "What to ask, and why it matters. Blank means nothing to ask"),
    ("", ""),
    ("The single most important fact", ""),
    ("Records holds declared records only",
     "public.\"Records\" in drm-npr contains declared records only, about 1,990 in UAT, and no row at "
     "all for an undeclared document. So every figure about declared records can be produced today, "
     "and every figure needing a denominator waits on the weekly SharePoint scan being built."),
    ("", ""),
    ("The three query rules", "Getting any of these wrong produces a plausible wrong number, not an error"),
    ("1. Read the latest snapshot",
     "Or 1,057 compliant sites silently becomes 55,000 after a year of retained history"),
    ("2. A range sums SiteVisits7",
     "Never the 30, 90 or 180 day figures. Consecutive 7 day windows tile exactly, longer ones "
     "overlap and would count most days several times over"),
    ("3. Match on ReportRefreshDate, not SnapshotDate",
     "The first is what Microsoft measured, the second is when the job ran, and they differ. "
     "An export taken on 12 Aug carried figures as at 10 Aug"),
    ("", ""),
    ("Sheets", ""),
    ("01 to 06", "One per dashboard, in the client's own order from PPT s13"),
    ("DB 1 to DB 4", "The four tables, every column, its type, source and remarks"),
    ("Questions to client", "Every question from the dashboard sheets, deduplicated and prioritised"),
    ("Summary", "Counts by status and by dashboard, computed from the sheets"),
]
r = 4
for left, right in intro:
    ws.cell(row=r, column=2, value=left).font = Font(name=FONT, size=10, bold=bool(left))
    ws.cell(row=r, column=3, value=right).font = Font(name=FONT, size=10)
    for c in (2, 3):
        ws.cell(row=r, column=c).alignment = Alignment(vertical="top", wrap_text=True)
    r += 1
ws.sheet_view.showGridLines = False

# ================= one sheet per dashboard =================
for sheet_name, title, slides, rows in SHEETS:
    ws = wb.create_sheet(sheet_name)
    widths(ws, WID)
    title_block(ws, title, "Client design: " + slides +
                ". Filter the Status column to see what can be built now.", len(HDR))
    for i, h in enumerate(HDR, 1):
        ws.cell(row=4, column=i, value=h)
    style_header(ws, 4, len(HDR))
    for j, row in enumerate(rows):
        r = 5 + j
        ws.cell(row=r, column=1, value=j + 1)
        for i, v in enumerate(row, start=2):
            ws.cell(row=r, column=i, value=v)
    last = 4 + len(rows)
    body(ws, 5, last, len(HDR))
    for r in range(5, last + 1):
        st = ws.cell(row=r, column=14).value
        if st in STATUS_FILL:
            ws.cell(row=r, column=14).fill = STATUS_FILL[st]
            ws.cell(row=r, column=14).font = Font(name=FONT, size=9, bold=True)
        ws.cell(row=r, column=1).alignment = Alignment(vertical="top", horizontal="center")
    ws.auto_filter.ref = f"A4:{get_column_letter(len(HDR))}{last}"
    ws.freeze_panes = "C5"
    ws.sheet_view.showGridLines = False

# ================= the four database tables =================
DBHDR = ["S/N", "Column", "Field type", "What it holds", "Values", "Sample",
         "Where the value comes from", "Joins to", "Remarks"]
DBWID = [5, 28, 24, 56, 30, 30, 20, 22, 70]

for idx, (key, title, blurb, cols) in enumerate(TABLES, start=1):
    ws = wb.create_sheet("DB %d %s" % (idx, key.split(" ", 1)[1][:22]))
    widths(ws, DBWID)
    title_block(ws, title, blurb, len(DBHDR))
    ws.row_dimensions[2].height = 42
    for i, h in enumerate(DBHDR, 1):
        ws.cell(row=4, column=i, value=h)
    style_header(ws, 4, len(DBHDR))
    for j, (name, typ, desc, vals, sample, ref, rem) in enumerate(cols):
        r = 5 + j
        ws.cell(row=r, column=1, value=j + 1)
        ws.cell(row=r, column=2, value=name)
        ws.cell(row=r, column=3, value=typ)
        ws.cell(row=r, column=4, value=desc)
        ws.cell(row=r, column=5, value=vals)
        ws.cell(row=r, column=6, value=sample)
        ws.cell(row=r, column=7, value=SOURCE.get(name, ""))
        ws.cell(row=r, column=8, value=ref)
        ws.cell(row=r, column=9, value=rem)
    last = 4 + len(cols)
    body(ws, 5, last, len(DBHDR))
    for r in range(5, last + 1):
        ws.cell(row=r, column=2).font = Font(name=FONT, size=9, bold=True)
        ws.cell(row=r, column=1).alignment = Alignment(vertical="top", horizontal="center")
        # a column nobody can fill is the one thing this sheet must not hide
        if ws.cell(row=r, column=7).value == "NEEDS A DECISION":
            ws.cell(row=r, column=7).fill = PatternFill("solid", fgColor="F8D7D7")
            ws.cell(row=r, column=7).font = Font(name=FONT, size=9, bold=True)
    ws.auto_filter.ref = f"A4:{get_column_letter(len(DBHDR))}{last}"
    ws.freeze_panes = "C5"
    ws.sheet_view.showGridLines = False

# ================= questions =================
ws = wb.create_sheet("Questions to client")
widths(ws, [5, 26, 34, 92, 22])
title_block(ws, "Questions to ask, in priority order",
            "Ordered by how much each answer unblocks. Every one also appears against its "
            "figures on the dashboard sheets.", 5)
for i, h in enumerate(["#", "Topic", "Who answers", "What to ask, and why", "Unblocks"], 1):
    ws.cell(row=4, column=i, value=h)
style_header(ws, 4, 5)
QROWS = [
    ("Institutional file plan", "Client, records management", Q_FILEPLAN,
     "The whole File Plan dashboard, plus classification everywhere"),
    ("Site to department list", "RAC, check Cloud Governance first", Q_DEPT,
     "Every departmental figure, and all of Department Insights"),
    ("Project site register", "RAC, check Cloud Governance first", Q_PROJ,
     "The whole Project Insights dashboard"),
    ("Term to document join", "Development team", Q_TERMJOIN,
     "Every per term figure on two dashboards"),
    ("Disposal status field", "Client, then the development team", Q_DISPOSAL,
     "Disposal completion across three dashboards"),
    ("EDRMS app detection", "Mihal Le", Q_COMPLIANT,
     "Which sites are in the report at all, and 4 KPIs"),
    ("Division", "Client and RAC", Q_DIV, "Four panels across two dashboards"),
    ("Staff class and training", "Client, likely HR or an LMS", Q_STAFF,
     "The user panels on two dashboards"),
    ("Inactivity threshold", "Client", Q_IDLE, "Every inactivity figure"),
    ("Format group mapping", "RAC", Q_FORMAT, "The format and storage panel"),
    ("Reference lists", "Client", Q_REF,
     "Go-live dates, conventions and programme dates on Department Insights"),
    ("Archived sites", "Client", Q_ARCHIVE, "One tile, and the definition behind it"),
    ("Physical holdings", "RAC", Q_RAC, "The whole Records and Archive Holdings dashboard"),
    ("Audit log access", "Client and ITD", Q_ACCESS, "Access management and visitor split"),
]
for j, (topic, who, what, unb) in enumerate(QROWS):
    r = 5 + j
    ws.cell(row=r, column=1, value=j + 1)
    ws.cell(row=r, column=2, value=topic)
    ws.cell(row=r, column=3, value=who)
    ws.cell(row=r, column=4, value=what)
    ws.cell(row=r, column=5, value=unb)
last = 4 + len(QROWS)
body(ws, 5, last, 5)
for r in range(5, last + 1):
    ws.cell(row=r, column=2).font = Font(name=FONT, size=9, bold=True)
    ws.cell(row=r, column=1).alignment = Alignment(vertical="top", horizontal="center")
ws.freeze_panes = "B5"
ws.sheet_view.showGridLines = False

# ================= summary =================
ws = wb.create_sheet("Summary")
widths(ws, [4, 34, 12, 12, 78])
title_block(ws, "Summary",
            "Every count is a formula over the six dashboard sheets, so it follows any edit made there.", 5)
ws["B4"] = "By status"
ws["B4"].font = Font(name=FONT, size=11, bold=True, color=ADB_BLUE)
for i, h in enumerate(["Status", "Count", "Share", "What it means"], 2):
    ws.cell(row=5, column=i, value=h)
style_header(ws, 5, 5)

order = list(STATUS_FILL)
counts = {k: 0 for k in order}
for _, _, _, rows in SHEETS:
    for row in rows:
        counts[row[13]] = counts.get(row[13], 0) + 1

r = 6
for st in order:
    ws.cell(row=r, column=2, value=st).fill = STATUS_FILL[st]
    ws.cell(row=r, column=2).font = Font(name=FONT, size=9, bold=True)
    parts = "+".join("COUNTIF('%s'!$N:$N,$B%d)" % (s[0], r) for s in SHEETS)
    ws.cell(row=r, column=3, value="=" + parts)
    ws.cell(row=r, column=4, value="=IF($C$%d=0,0,C%d/$C$%d)" % (6 + len(order), r, 6 + len(order)))
    ws.cell(row=r, column=5, value=STATUS_MEANING[st])
    r += 1
tot = r
ws.cell(row=tot, column=2, value="Total figures checked")
ws.cell(row=tot, column=3, value="=SUM(C6:C%d)" % (tot - 1))
body(ws, 6, tot, 5)
for rr in range(6, tot + 1):
    ws.cell(row=rr, column=3).number_format = "#,##0"
    ws.cell(row=rr, column=4).number_format = "0.0%"
    for c in (3, 4):
        ws.cell(row=rr, column=c).alignment = Alignment(horizontal="center", vertical="top")
for c in (2, 3, 4, 5):
    ws.cell(row=tot, column=c).font = Font(name=FONT, size=9, bold=True)
    ws.cell(row=tot, column=c).fill = FILL_TITLE

start = tot + 3
ws.cell(row=start - 1, column=2, value="By dashboard")
ws.cell(row=start - 1, column=2).font = Font(name=FONT, size=11, bold=True, color=ADB_BLUE)
for i, h in enumerate(["Dashboard", "Figures", "Buildable now", "Blocked on something"], 2):
    ws.cell(row=start, column=i, value=h)
style_header(ws, start, 5)
r = start + 1
for name, title, _, rows in SHEETS:
    ws.cell(row=r, column=2, value=title)
    ws.cell(row=r, column=3, value="=COUNTA('%s'!$N$5:$N$200)" % name)
    ws.cell(row=r, column=4, value="=COUNTIF('%s'!$N$5:$N$200,\"Buildable now\")" % name)
    ws.cell(row=r, column=5, value="=C%d-D%d" % (r, r))
    r += 1
vtot = r
ws.cell(row=vtot, column=2, value="Total")
for c, col in ((3, "C"), (4, "D"), (5, "E")):
    ws.cell(row=vtot, column=c, value="=SUM(%s%d:%s%d)" % (col, start + 1, col, vtot - 1))
body(ws, start + 1, vtot, 5)
for rr in range(start + 1, vtot + 1):
    for c in (3, 4, 5):
        ws.cell(row=rr, column=c).number_format = "#,##0"
        ws.cell(row=rr, column=c).alignment = Alignment(horizontal="center", vertical="top")
for c in (2, 3, 4, 5):
    ws.cell(row=vtot, column=c).font = Font(name=FONT, size=9, bold=True)
    ws.cell(row=vtot, column=c).fill = FILL_TITLE

note = vtot + 2
ws.cell(row=note, column=2, value="Hand check at build time")
ws.cell(row=note, column=2).font = Font(name=FONT, size=10, bold=True)
expected = ", ".join("%d %s" % (v, k) for k, v in sorted(counts.items(), key=lambda kv: -kv[1]) if v)
ws.cell(row=note + 1, column=2,
        value="These counts are formulas over the six dashboard sheets, not typed numbers, so they "
              "follow any edit made there. LibreOffice cannot recalculate in the build environment, "
              "so they ship without cached values: Excel computes them on open, but a lightweight "
              "previewer may show them blank. Counted by hand at build time there were %d figures, "
              "being %s." % (sum(counts.values()), expected))
ws.cell(row=note + 1, column=2).font = Font(name=FONT, size=9, color=GREY)
ws.cell(row=note + 1, column=2).alignment = Alignment(vertical="top", wrap_text=True)
ws.merge_cells(start_row=note + 1, start_column=2, end_row=note + 4, end_column=5)
ws.sheet_view.showGridLines = False

wb.save(OUT)
print("wrote %s: %d sheets, %d figures checked, %d database columns"
      % (OUT, len(wb.sheetnames), sum(counts.values()),
         sum(len(c) for _, _, _, c in TABLES)))
