# What the 7rkd12 test tenant changes, element by element.
# Verified 8 Aug 2026 as JimTest@7rkd12.onmicrosoft.com against org_csd_1.4testsite.

from elements import READY, SCAN, USAGE, BLOCK, DERIV

# Gap 2 is closed as a separate gap: Graph returns size on every file, verified.
# Everything that was blocked ONLY by file size now waits on the scan instead.
STATUS_OVERRIDE = {
 ('Format and Storage', 'Storage Consumed by Format'): SCAN,
 ('Format and Storage', 'Storage GB column'): SCAN,
 ('Format and Storage', 'Average file size MB column'): SCAN,
 ('Format and Storage', 'Totals row'): SCAN,
 ('Overview', 'Share of storage donut'): SCAN,
 ('Overview', 'Format finding callout'): SCAN,
}

T_READY = ("Yes. Run the query against the UAT database and hand count the same figure in the "
           "test tenant. Small enough to reconcile exactly.")
T_SCAN  = ("Yes, and this is the best thing the tenant is for. Rehearse the scan across the 22 "
           "libraries in org_csd_1.4testsite, which include permission restricted libraries and "
           "hostile filenames. A scan that survives here will survive ADB.")
T_USAGE = ("No. Usage data in a test tenant is a handful of test users clicking around, so the "
           "numbers carry no meaning. Needs the real tenant and admin rights.")
T_DEPT  = ("Partly. The connector cannot read managed metadata, so the term store link cannot be "
           "confirmed here. Testable fallback: the sites are named org_<code>_..., so check whether "
           "ADB site URLs carry a department code that could bridge until ADBMeta is populated.")
T_SITE  = ("No. The connector lists a site's libraries but not the site's own properties. Read the "
           "created date from the SharePoint admin centre instead, Active sites, Created column.")
T_COMP  = ("YES, and this is the highest value test available. org_csd_1.4testsite contains "
           "'No mapping library1', a real library full of real documents where declaration FAILS "
           "with 'No Library and Retention Label Mapping found'. Count documents in mapped versus "
           "unmapped libraries and put both numbers to RAC.")
T_DERIV = "Inherits whatever its source elements can be tested for."
T_NA    = ("Yes. Written by the refresh job, so it exists as soon as the job runs. The test tenant "
           "is the right place to run the job for the first time.")


def tenant_note(dash, element, status, how):
    """What the test tenant can do for this element."""
    if status == DERIV:
        return T_DERIV
    if 'Data as of' in element or 'Refreshed' in element:
        return T_NA
    if how.startswith('Gap 1'):
        return T_DEPT
    if how.startswith('Gap 3'):
        return T_COMP if 'compliant' in element.lower() or 'Compliant' in element else T_SITE
    if status == USAGE:
        return T_USAGE
    if status == SCAN:
        return T_SCAN
    if status == READY:
        return T_READY
    return T_SCAN


# Evidence gathered, for the findings sheet.
# [what was checked, what was found, what it changes, status]
FINDINGS = [
 ("Does Microsoft Graph return file size?",
  "Yes, on every file, unprompted. Observed: 11.eml 2,727 bytes; a .docx 26,276 bytes; three .png "
  "files 154,419 bytes each; nature_theme_2MB.pdf 2,338,767 bytes.",
  "GAP 2 IS CLOSED as a separate gap. Six elements move from Blocked to Needs the scan. The "
  "FileMeta.FileSize change is now optional, wanted only for per record detail at declaration time.",
  "Resolved"),

 ("Do folders come back as items, and with what size?",
  "Yes, folders are returned alongside files, and their size is the RECURSIVE TOTAL of their "
  "contents. Observed: one folder 5,163,738 bytes, another 9,191,536 bytes, several 0 bytes.",
  "A NEW BUG, caught before anyone wrote the scan. Summing every item's size double counts: once "
  "in the folder, again in each file inside it. Storage would land at roughly double and look "
  "entirely plausible. The scan must filter to files only.",
  "New risk, now known"),

 ("Does the ListId in Records match SharePoint's own list GUID?",
  "Yes. Decoded from the Graph drive IDs: Annual Meetings is list 387ed159-b632-45af-b4d4-c6fd96d8ee33, "
  "Budget is a09d42b9-5b7a-4a07-b6c7-8c600a74eef6, both under site 414bd9e3-7f1e-43bf-8e41-65d7b9b94df0.",
  "The ListId + ItemId join key is verifiable end to end, on data small enough to check by hand. "
  "This is the first thing to test once the scan runs.",
  "Confirmed"),

 ("Is there anything that already defines which libraries EDRMS manages?",
  "Yes, and it is already enforced. The tenant contains 'No mapping library1', a real library holding "
  "real documents (.docx, .pdf, .png, a 2.3MB PDF). Declaration into it FAILS, and the error emails "
  "read 'Error Type: No Retention Label Mapping' and 'No Library and Retention Label Mapping found'.",
  "A MUCH BETTER ANSWER TO GAP 3 than the three options previously proposed. The Retention Label "
  "Mapping list is already the de facto registry of what EDRMS manages: it is maintained, and the "
  "application already enforces it. Proposed rule: a library is in scope if it appears in that list, "
  "and a site is compliant if it holds at least one mapped library. Needs no new list and no new process.",
  "Proposal, needs RAC sign off"),

 ("Does the denominator question have a real consequence?",
  "Yes. Documents sitting in unmapped libraries can NEVER be declared, because the application "
  "rejects the attempt. They are not undeclared, they are undeclarable.",
  "If unmapped libraries are counted in Total Documents, the declaration rate is permanently held "
  "down by documents nobody could ever declare, and it can never reach 100 percent. This is the "
  "single most important thing to settle before the KPI goes in front of RAC.",
  "Decision needed"),

 ("Can the department and division link be confirmed here?",
  "No. The connector reads files and folders but not managed metadata or column values, so the term "
  "store link cannot be checked. Noted separately: sites are named org_csd_1.4testsite, "
  "org_csd_1.3testsite, and the Records sample site is org_edrms_uat.",
  "GAP 1 IS UNCHANGED and remains the largest open item. A possible bridge: if ADB site URLs carry a "
  "department code the way these do, department could be parsed from the URL until ADBMeta is "
  "populated. Treat as a fallback, not a plan: naming conventions drift, and a wrong department is "
  "worse than a blank one.",
  "Still blocked"),

 ("Can site created date be read?",
  "Not with this connector. It lists a site's 22 libraries but does not expose the site's own "
  "properties.",
  "GAP 3a UNCHANGED. Read it from the SharePoint admin centre, Active sites, Created column, "
  "exportable to CSV. Cheap, but it is not something this tenant closes.",
  "Still blocked"),

 ("Can the usage feed be tested here?",
  "Not meaningfully. A test tenant's site visits and unique viewers are a handful of test accounts.",
  "FEED 2 UNCHANGED. It needs the real tenant and admin rights. It stays the cheapest item on the "
  "list and it is independent of everything else.",
  "Still blocked"),

 ("Is the test data realistic enough to trust a rehearsal?",
  "More than realistic, it is adversarial. Filenames contain zero width spaces, non breaking hyphens, "
  "currency symbols and the full punctuation set. Libraries are named 'permission lib', 'library with "
  "read access' and 'permission no'. Folders differ only by a trailing letter. Several .png files "
  "share an identical byte size.",
  "A scan that runs clean here has already survived permission trimming, hostile names and near "
  "duplicates. This is worth more than a tidy dataset would be.",
  "Confirmed"),
]


# =====================================================================
# Round 2: the real usage export, 8 Aug 2026.
# 5 CSVs from the 7rkd12 admin centre. One per site (2,359 rows), four
# tenant wide daily trends (180 rows each). They reconcile exactly.
# =====================================================================

# Total Documents no longer needs the expensive scan: File Count in the usage
# report supplies it. Active Users does: the report has no unique viewer column
# at all, which disproves what I had promised.
STATUS_OVERRIDE_2 = {
 ('Records Management', 'Total Documents in EDRMS Compliant Sites'): USAGE,
 ('Records Management', 'Active Users'): BLOCK,
 ('Records Management', 'Unique viewers per site'): BLOCK,
}

HOW_OVERRIDE_2 = {
 ('Records Management', 'Total Documents in EDRMS Compliant Sites'):
   "CHANGED. The usage report's File Count column gives this per site, so the full document scan is "
   "NOT needed for the headline number. Verified: 26,660 files across 977 sites in the test export. "
   "Still needs the Gap 3 compliance rule to decide which sites count, and File Count includes system "
   "files, so the definition on the decisions sheet has to be settled.",
 ('Records Management', 'Active Users'):
   "DISPROVEN. I said the Microsoft 365 usage report supplies this. It does not. The export has 23 "
   "columns and none of them is unique viewers: Page View Count is page views, and Visited Page Count "
   "is unique PAGES, not unique people. Another source has to be found and confirmed, most likely the "
   "per site analytics endpoint /sites/{id}/analytics which returns an actor count. Do not promise "
   "this figure until that is verified.",
 ('Records Management', 'Unique viewers per site'):
   "DISPROVEN, same as Active Users. No unique viewer column exists in the usage report.",
 ('Records Management', 'Active Departmental Sites'):
   "Confirmed available. Page View Count and Visited Page Count are both populated, 302 sites had "
   "activity in the test export. WARNING: Site URL came back EMPTY on all 2,359 rows, so the load must "
   "resolve Site Id to a URL via Graph /sites/{siteId} first. Also filter Is Deleted = True, which was "
   "657 of 2,359 rows, or counts run 28 percent high.",
 ('Records Management', 'Last activity beside each site'):
   "Confirmed available as Last Activity Date, populated on 384 of 2,359 sites. Same two warnings: "
   "resolve Site Id to a URL, and filter out deleted sites.",
}

FINDINGS_2 = [
 ("Does the usage export contain unique viewers?",
  "No. 23 columns, and none of them is unique viewers. Page View Count is page views; Visited Page "
  "Count is unique PAGES, not unique people.",
  "MY CLAIM WAS WRONG. Active Users and Unique viewers per site move from Needs the usage feed to "
  "Blocked. A different source is needed, most likely /sites/{id}/analytics for an actor count. "
  "Verify it before promising the figure to RAC.",
  "Disproven"),

 ("Does File Count give a real Total Documents?",
  "Yes. 26,660 files across 977 sites that hold any, largest single site 2,547.",
  "Total Documents moves OFF the document scan and onto the usage feed. The headline 3.47M no longer "
  "waits on weeks of work. The scan is still needed for anything per library or per format.",
  "Resolved"),

 ("Is Site URL usable?",
  "NO. Empty on all 2,359 rows, while Owner Principal Name is populated with real UPNs, so this is not "
  "the usual concealment behaviour. Site Id is populated.",
  "BLOCKS EVERY PER SITE FIGURE until fixed. Two routes: check the concealed names setting in Org "
  "settings, and build the fallback anyway, resolving Site Id through Graph /sites/{siteId} to recover "
  "webUrl and displayName. About 1,702 extra calls per run.",
  "New blocker, has a fix"),

 ("Do the five exported files agree with each other?",
  "Exactly. 2,359 detail rows minus 657 deleted equals 1,702, which is the SiteCounts total. Files for "
  "live sites only equals 26,660, the FileCounts total. Storage for live sites equals 131.7 GB, the "
  "Storage total.",
  "Two load rules confirmed: 'Total' always EXCLUDES deleted sites, and the detail file INCLUDES them. "
  "Filter Is Deleted = True or every count runs 28 percent high.",
  "Confirmed"),

 ("Is there a template signal for the compliance rule?",
  "Root Web Template is populated: Team Site 2,078, Group 234, Site Page Publishing 21, Document "
  "Center 6, and eight others. But with Site URL empty, the EDRMS sites cannot be located, so which "
  "template they use is unknown.",
  "A THIRD candidate for Gap 3, alongside the Retention Label Mapping list. Checkable in minutes once "
  "Site URL is resolved. If EDRMS sites use a distinct template, compliance becomes a single column.",
  "Promising, not yet checkable"),

 ("How fresh is the data really?",
  "Report Refresh Date is 2026-08-05 on an export taken 8 August. Microsoft's data runs about three "
  "days behind.",
  "No pipeline can fix this. The 'Data as of' line must show Microsoft's refresh date, not the job's "
  "run time, or the report claims a freshness it does not have.",
  "Constraint, now known"),

 ("How much history comes in one export?",
  "The four trend files carry 180 days of DAILY tenant wide figures. The per site detail file is a "
  "single snapshot with no history.",
  "Six months of tenant level trend can be backfilled on the first run. Per site history has to "
  "accumulate week by week from SnapshotDate onward, which is exactly what that column is for.",
  "Confirmed"),

 ("Anything free that was not asked for?",
  "Yes. Site Sensitivity Label Id, External Sharing, Geo Location, and four link sharing counts "
  "(anonymous, company, guest, member) are all populated per site.",
  "Not in the prototype, but they are the obvious next governance questions and they cost nothing to "
  "store. Worth capturing now rather than re-running the load later.",
  "Opportunity"),
]


# =====================================================================
# Round 3: the library itself, 8 Aug 2026.
# Graph Explorer against org_csd_1.4testsite, plus the Annual Meetings
# library viewed with the metadata columns switched on.
# =====================================================================

DEPT_FIX = (
 "CAUSE NOW TRACED END TO END. The SharePoint column ADBDepartmentOwner EXISTS on the library, is "
 "named exactly like the ADBMeta key, and is EMPTY on every row. So ADBMeta is empty because nobody "
 "fills in the SharePoint column. The fix is upstream of the database, not in it. "
 "RECOMMENDED FIX: do not tag 3.47 million documents. The report's own drill goes Department to "
 "Division to Site to Library, so department is already a property of the SITE. Build a site to "
 "department and division mapping, about 1,057 rows, load it as the Site Activity Table, and let "
 "every document inherit from its site. No SharePoint change, no application change. "
 "ASK AVEPOINT CLOUD GOVERNANCE FIRST: if it recorded the requesting department at provisioning, "
 "this becomes an export instead of data entry. See the Gap 1 action plan sheet.")

DIV_FIX = (
 "WORSE THAN DEPARTMENT, AND NOW CONFIRMED. There is NO ADBDivisionOwner column anywhere in "
 "SharePoint. Department at least exists and is merely empty; Division was never created. So the "
 "site mapping is not the cheap option for Division, it is the ONLY option short of creating a new "
 "managed metadata column across every library at ADB. Same spreadsheet, one extra column. "
 "See the Gap 1 action plan sheet.")

HOW_OVERRIDE_3 = {
 ('Records Management', 'Declared records per department'): DEPT_FIX,
 ('Records Management', 'Drill level 1, Department'): DEPT_FIX,
 ('Records Management', 'Department filter'): DEPT_FIX,
 ('Records Management', 'Documents per department'): DEPT_FIX,
 ('Records Management', 'Drill level 2, Division'): DIV_FIX,
 ('Sites and Libraries', 'Sites created by department'): DEPT_FIX,
 ('Overview', 'Top 5 departments by declared records'): DEPT_FIX,
 ('Overview', 'Top 5 departments by compliant sites'): DEPT_FIX,
}

FINDINGS_3 = [
 ("Is the ADBDepartmentOwner column actually populated?",
  "NO. The column exists on the Annual Meetings library, named exactly like the ADBMeta key, and is "
  "EMPTY on every row viewed. File Category and EDRMS Declaration Status are empty too.",
  "GAP 1 CAUSE TRACED END TO END. The chain is: SharePoint column empty, therefore ADBMeta empty, "
  "therefore no department figure. The fix is UPSTREAM of the database. No amount of database work "
  "solves it, which is the thing to say to whoever owns the release.",
  "Cause identified"),

 ("Does an ADBDivisionOwner column exist?",
  "NO. Department exists and is empty. Division was never created at all, on any library inspected.",
  "DIVISION IS WORSE THAN DEPARTMENT and nobody had noticed. Everyone has been treating Division as "
  "blocked because empty. It is blocked because the field does not exist. The site mapping is the "
  "only route short of building a new column across every library at ADB.",
  "New finding"),

 ("Is Item is a Record populated?",
  "YES, and reliably. Every row viewed shows Item is a Record = Yes, alongside a populated retention "
  "label of 'ADB- 1 year after declaration' and a duration of 1.",
  "A REAL SIMPLIFICATION. IsDeclaredRecord does not have to be derived by matching the scan against "
  "Records. SharePoint states it per item. Keep the match anyway as a CROSS CHECK: any row where "
  "SharePoint says record and Records does not is a document labelled without being declared, which "
  "is the failure mode the client flagged weeks ago and nobody could measure.",
  "Resolved, and better"),

 ("Is Retention Label Applied For Calculated typed by hand?",
  "Apparently not. On every row it matches the native compliance timestamp: calculated 6/8/2026 "
  "against native 6/8/2026 11:06 AM, calculated 6/10/2026 against native 6/10/2026 4:31 PM.",
  "REASSURING. The client worried this date might be set manually and therefore untrustworthy. It is "
  "being derived from the native SharePoint timestamp. Caveat: the column is still writable, so it "
  "COULD be edited. It just is not being.",
  "Reassuring, with a caveat"),

 ("Can site created date be read after all?",
  "YES. Graph /sites?search=* returns createdDateTime alongside webUrl and displayName. "
  "org_csd_1.4testsite was created 2025-09-25.",
  "GAP 3a IS CLOSED. One query, no admin centre export. Note it unblocks no element on its own, "
  "because everything that uses the created date also needs the compliance rule or department. It "
  "removes future work rather than moving the scoreboard.",
  "Resolved"),

 ("Is the Site URL problem solved?",
  "YES. The same query returns webUrl and displayName for every site, which the CSV export withheld. "
  "Concealed names was already switched OFF in Org settings, so the blank column in the CSV is a "
  "separate quirk of that export, not a tenant setting.",
  "The per site pipeline is unblocked. Resolve Site Id through Graph as a standard step of the load "
  "rather than treating it as a workaround.",
  "Resolved"),

 ("Does Root Web Template identify EDRMS sites?",
  "NO. Both org_csd_1.4testsite and org_csd_1.3testsite report 'Team Site', and so do 2,078 of the "
  "2,359 sites in the tenant.",
  "That candidate for the compliance rule is DEAD. It leaves the Retention Label Mapping list as the "
  "one real option, which is the better answer anyway because it is already enforced.",
  "Ruled out"),

 ("Is there an anomaly in the site dates?",
  "Yes. One site reports createdDateTime 2026-08-05 but lastModifiedDateTime 2026-07-25, so it was "
  "created ten days after it was last modified. Probably a restore or a re-provision.",
  "The Sites created by department treemap is built on createdDateTime, so sites like this land in "
  "the wrong bucket. Worth counting on the real data: if it is a handful, ignore it; if it is "
  "hundreds, the treemap needs a different date.",
  "Watch item"),
]

# What the client and the developers each have to do about Gap 1, in plain words.
# [step, who, what exactly, how long, notes]
GAP1_PLAN = [
 ("0", "You, today",
  "Ask IT whether AvePoint Cloud Governance recorded the requesting department when each site was "
  "provisioned.",
  "One email",
  "If the answer is yes, steps 1 and 2 become an export and this whole plan collapses to an "
  "afternoon. Ask before anyone starts typing."),

 ("1", "Me",
  "Produce the site list as a spreadsheet, one row per site, with Site URL and Site Name already "
  "filled in and Department and Division left blank. Column headings match the database table so it "
  "loads without rework.",
  "Same day",
  "Needs the output of the Graph query sites?search=* which has already been run successfully."),

 ("2", "The client, RAC",
  "Fill in Department and Division for each site.",
  "Half a day to a day",
  "NOT one row at a time. Sort by site name and similar sites group together, so most rows fill by "
  "dragging down in Excel. The real work is the leftovers where nobody is sure. Give this to someone "
  "who knows the organisation, or it stalls."),

 ("2b", "The client, optional",
  "SHORTCUT: fill only the top 100 sites by document count and mark the rest Unassigned.",
  "About an hour",
  "In the test tenant only 977 of 2,359 sites hold any documents at all. The top sites carry most of "
  "the volume, so the report becomes meaningful immediately and the tail can be completed later. An "
  "honest Unassigned slice beats a blocked dashboard."),

 ("3", "Development team",
  "Load the spreadsheet into the Site Activity Table, and join documents to it on Site URL so each "
  "document picks up its site's department and division.",
  "Small",
  "One table, one join. No change to SharePoint, no change to the EDRMS application, no touching any "
  "existing data."),

 ("4", "RAC, to confirm",
  "Confirm that every document in a department's site may be counted under that department.",
  "One question",
  "THE QUESTION THAT DECIDES EVERYTHING. The report's own drill down already assumes it, but it "
  "should be confirmed rather than assumed. If the answer is no, the site mapping breaks and "
  "documents must be tagged individually, which is a quarter of work rather than a week."),

 ("5", "Development team, later",
  "Ask whether the provisioning process can set the Department Owner default value when it creates a "
  "site's libraries.",
  "Medium",
  "This is what stops the problem recurring. Without it, new sites are missing from the mapping and "
  "the report quietly under reports six months from now. The list fixes it today; provisioning stops "
  "it coming back."),
]
