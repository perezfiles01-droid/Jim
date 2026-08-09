# Every visual element of the prototype, in the order it appears.
# [dashboard, section, element, type, shows, calculation, status, table, columns, how_to_source, sql]

R = "public.Records"
U = "rpt.utilization_report"
S = "rpt.utilization_site_activity"

READY = "Ready today"
SCAN  = "Needs the document scan"
USAGE = "Needs the usage feed"
BLOCK = "Blocked"
DERIV = "Derived from other elements"

SCAN_HOW = ("Weekly Microsoft Graph scan of every document library in every compliant site, "
            "matched to Records on ListId + ItemId. This one job supplies every undeclared document.")
DEPT_HOW = ("Gap 1. ADBMeta is marked Future Enhancement and is empty. Attach the department to the "
            "SITE in the Site Activity Table, about 1,057 values, and let documents inherit it. "
            "Check AvePoint Cloud Governance first: it may already hold it from provisioning.")
DIV_HOW  = ("Gap 1. Same source as department. The Division term set is hierarchical, so division "
            "rolls up to department on its own.")
SIZE_HOW = ("Gap 2. Two routes, use both. Microsoft Graph returns size on every item so the scan gets "
            "it free. For declared records, add a FileSize key to the FileMeta JSON the EDRMS "
            "application already writes: a JSON key, not a database migration.")
SITE_HOW = ("Gap 3. SharePoint admin centre, Active sites, the Created column, exportable to CSV. "
            "Or Microsoft Graph /sites createdDateTime. Or AvePoint Cloud Governance provisioning date.")
COMP_HOW = ("Gap 3. No system holds this, it is a definition. RAC picks one of three: a maintained list "
            "of compliant site URLs, a site template check, or an AvePoint Cloud Governance flag.")
USAGE_HOW = ("Microsoft 365 admin centre, Reports, Usage, SharePoint site usage. Or the Graph reports "
             "API getSharePointSiteUsageDetail(period='D7'/'D30'/'D90'). Written weekly into the "
             "Site Activity Table.")
NONE_HOW = "Nothing needed. The data is in the EDRMS database today."

LATEST = f'WHERE "SnapshotDate" = (SELECT max("SnapshotDate") FROM {U})'

ROWS = [
# ---------------- RECORDS MANAGEMENT, section 1 ----------------
["Records Management","1. Declared records vs total documents","Total Declared Records","KPI card","21,646",
 "Count the distinct ListId + ItemId pairs that are not soft deleted. Being present in Records is what makes a document declared, so no flag is tested.",
 READY, R, "ListId, ItemId, IsDeleted", NONE_HOW,
 'SELECT count(DISTINCT ("ListId","ItemId")) AS total_declared_records\nFROM public."Records"\nWHERE "IsDeleted" = false;'],

["Records Management","1. Declared records vs total documents","Declared records per department","Stacked bar chart","16 bars, 2,611 down to 540",
 "The same count, grouped by the owning department.",
 BLOCK, R, 'ADBMeta -> ADBDepartmentOwner', DEPT_HOW,
 'SELECT "ADBMeta"->>\'ADBDepartmentOwner\' AS department,\n       count(DISTINCT ("ListId","ItemId")) AS declared\nFROM public."Records"\nWHERE "IsDeleted" = false\nGROUP BY 1 ORDER BY 2 DESC;'],

["Records Management","1. Declared records vs total documents","With physical counterpart","Bar segment, teal","470 of 2,611 for ITD",
 "The same count where HasPhysical is Yes.",
 READY, R, 'EDRMSMeta -> HasPhysical', NONE_HOW,
 'SELECT "EDRMSMeta"->>\'HasPhysical\' AS has_physical,\n       count(DISTINCT ("ListId","ItemId")) AS declared\nFROM public."Records"\nWHERE "IsDeleted" = false\nGROUP BY 1;'],

["Records Management","1. Declared records vs total documents","Without physical counterpart","Bar segment, grey blue","2,141 of 2,611 for ITD",
 "The same count where HasPhysical is No. The two segments add to the bar total.",
 READY, R, 'EDRMSMeta -> HasPhysical', NONE_HOW,
 "-- same query as the row above, read the 'No' bucket"],

["Records Management","1. Declared records vs total documents","Drill level 1, Department","Drill down","Click a bar",
 "Regroup the same count by department.", BLOCK, R, 'ADBMeta -> ADBDepartmentOwner', DEPT_HOW,
 "GROUP BY \"ADBMeta\"->>'ADBDepartmentOwner'"],

["Records Management","1. Declared records vs total documents","Drill level 2, Division","Drill down","Click a department bar",
 "Regroup by division, filtered to the chosen department.", BLOCK, R, 'ADBMeta -> ADBDivisionOwner', DIV_HOW,
 "GROUP BY \"ADBMeta\"->>'ADBDivisionOwner'"],

["Records Management","1. Declared records vs total documents","Drill level 3, Site","Drill down","Click a division bar",
 "Regroup by site, filtered to the chosen division.", READY, R, "SiteName, SiteUrl", NONE_HOW,
 'GROUP BY "SiteUrl", "SiteName"'],

["Records Management","1. Declared records vs total documents","Drill level 4, Library","Drill down","Click a site bar",
 "Regroup by library, filtered to the chosen site. Group on ListId, not the name, because libraries can be renamed.",
 READY, R, "ListId, LibraryName", NONE_HOW,
 'GROUP BY "ListId", "LibraryName"'],

["Records Management","1. Declared records vs total documents","Date range on declared records","Filter","mm/dd/yyyy to mm/dd/yyyy",
 "Keep only rows declared inside the range. CreatedDate is a timestamp, so the end date must include the whole day or records declared that afternoon are silently dropped.",
 READY, R, "CreatedDate", NONE_HOW,
 'WHERE "IsDeleted" = false\n  AND "CreatedDate" >= :date_from\n  AND "CreatedDate" <  :date_to + interval \'1 day\''],

["Records Management","1. Declared records vs total documents","In range subtotal line","Text label","Declared in selected range: N of 21,646",
 "The filtered count over the unfiltered count. Shown only while a range is applied.",
 READY, R, "CreatedDate, ListId, ItemId, IsDeleted", NONE_HOW,
 "-- the filtered count above, printed against the unfiltered total"],

["Records Management","1. Declared records vs total documents","Total Documents in EDRMS Compliant Sites","KPI card","3.47M",
 "Count every document in a compliant site, declared or not. Records holds only the declared, so 3.45M of these have no row anywhere in the database today.",
 SCAN, U, "ListId, ItemId, IsEdrmsCompliant", SCAN_HOW + " IsEdrmsCompliant also needs the Gap 3 rule.",
 f'SELECT count(*) AS total_documents\nFROM {U}\n{LATEST}\n  AND "IsEdrmsCompliant" = true;'],

["Records Management","1. Declared records vs total documents","Documents per department","Bar chart, orange","16 bars, 640,000 down to 60,000",
 "The document count grouped by department.", BLOCK, U, "ADBDepartmentOwner", DEPT_HOW + " " + SCAN_HOW,
 f'SELECT "ADBDepartmentOwner", count(*) AS documents\nFROM {U}\n{LATEST}\n  AND "IsEdrmsCompliant" = true\nGROUP BY 1 ORDER BY 2 DESC;'],

["Records Management","1. Declared records vs total documents","Drill down, all four levels, documents panel","Drill down","Department to library",
 "Same four levels as the declared panel, over all documents rather than declared ones.",
 SCAN, U, "ADBDepartmentOwner, ADBDivisionOwner, SiteName, ListId", DEPT_HOW + " " + SCAN_HOW,
 "GROUP BY the level being shown, same pattern as the declared panel"],

["Records Management","1. Declared records vs total documents","Date range on total documents","Filter","Independent of the declared date range",
 "Keep only documents created inside the range. Reads FileCreatedDate, not CreatedDate: an undeclared document has no declaration date, so filtering on CreatedDate would drop all 3.45M of them.",
 SCAN, U, "FileCreatedDate", SCAN_HOW,
 f'... AND "FileCreatedDate" >= :date_from\n    AND "FileCreatedDate" <  :date_to + interval \'1 day\''],

# ---------------- RECORDS MANAGEMENT, section 2 ----------------
["Records Management","2. SharePoint sites and users governance","Active Departmental Sites","KPI card","Count of active sites",
 "Sites with at least one visit in the chosen window.", USAGE, S, "SiteVisits7 / SiteVisits30 / SiteVisits90", USAGE_HOW,
 f'SELECT count(*) FROM {S}\nWHERE "SnapshotDate" = (SELECT max("SnapshotDate") FROM {S})\n  AND "SiteVisits30" > 0;'],

["Records Management","2. SharePoint sites and users governance","Sites ranked by site visits","Bar chart, green","Top sites by visits",
 "Order sites by visits in the chosen window.", USAGE, S, "SiteName, SiteVisits7 / 30 / 90", USAGE_HOW,
 f'SELECT "SiteName", "SiteVisits30"\nFROM {S}\nWHERE "SnapshotDate" = (SELECT max("SnapshotDate") FROM {S})\nORDER BY "SiteVisits30" DESC;'],

["Records Management","2. SharePoint sites and users governance","Last activity beside each site","Text label","24 Jul 2026",
 "The most recent activity date for that site.", USAGE, S, "LastActivityDate", USAGE_HOW,
 'SELECT "SiteName", "LastActivityDate" FROM ' + S],

["Records Management","2. SharePoint sites and users governance","7 / 30 / 90 day window buttons","Filter","Three buttons",
 "Switch which of the three visit columns the chart reads. The windows are stored as separate columns, not computed on the fly, because Microsoft returns them that way.",
 USAGE, S, "SiteVisits7, SiteVisits30, SiteVisits90", USAGE_HOW,
 "-- select the column matching the chosen window"],

["Records Management","2. SharePoint sites and users governance","Department filter","Filter","All departments dropdown",
 "Restrict the chart to one department.", BLOCK, S, "ADBDepartmentOwner", DEPT_HOW,
 'WHERE "ADBDepartmentOwner" = :department'],

["Records Management","2. SharePoint sites and users governance","Active Users","KPI card","Unique viewers",
 "Distinct people who viewed content in the chosen window.", USAGE, S, "UniqueViewers7, UniqueViewers30", USAGE_HOW,
 f'SELECT sum("UniqueViewers30") FROM {S}\nWHERE "SnapshotDate" = (SELECT max("SnapshotDate") FROM {S});'],

["Records Management","2. SharePoint sites and users governance","Unique viewers per site","Bar chart, deep blue","Sites by viewer count",
 "Order sites by unique viewers.", USAGE, S, "SiteName, UniqueViewers7 / 30", USAGE_HOW,
 f'SELECT "SiteName", "UniqueViewers30" FROM {S} ORDER BY 2 DESC;'],

["Records Management","2. SharePoint sites and users governance","90 day fallback note","Amber note","Falls back to site visits",
 "Microsoft does not return unique viewers at 90 days. The dashboard shows site visits instead and says so.",
 USAGE, S, "UniqueViewers90", "Not obtainable from Microsoft. Keep the column so the gap stays visible rather than silently becoming a zero.",
 "-- UniqueViewers90 is null by design"],

# ---------------- SITES AND LIBRARIES ----------------
["Sites and Libraries","1. Compliant site rollout","Total EDRMS Compliant Sites Created","KPI card","1,057",
 "Count the sites flagged compliant. Counted from the SITE table, not from documents, because a site with no documents in it would otherwise be invisible and the count would run low.",
 BLOCK, S, "IsEdrmsCompliant", COMP_HOW,
 f'SELECT count(*) FROM {S}\nWHERE "SnapshotDate" = (SELECT max("SnapshotDate") FROM {S})\n  AND "IsEdrmsCompliant" = true;'],

["Sites and Libraries","1. Compliant site rollout","Sites created by department","Treemap","15 blocks, shaded by count",
 "The site count grouped by department, sized and shaded by the count.",
 BLOCK, S, "ADBDepartmentOwner, IsEdrmsCompliant", DEPT_HOW + " " + COMP_HOW,
 f'SELECT "ADBDepartmentOwner", count(*) AS sites\nFROM {S}\nWHERE "IsEdrmsCompliant" = true\nGROUP BY 1 ORDER BY 2 DESC;'],

["Sites and Libraries","1. Compliant site rollout","All time total tile","Summary tile","1,057",
 "The unfiltered site count.", BLOCK, S, "IsEdrmsCompliant", COMP_HOW, "-- the KPI query above, unfiltered"],

["Sites and Libraries","1. Compliant site rollout","In range total tile","Summary tile","Sites created in the range",
 "The site count restricted to the date range. Blocks across both pages of the treemap add up to this tile.",
 BLOCK, S, "SiteCreatedDate, IsEdrmsCompliant", SITE_HOW, 'WHERE "SiteCreatedDate" BETWEEN :date_from AND :date_to'],

["Sites and Libraries","1. Compliant site rollout","Date range on the treemap","Filter","Sits at the right of the tiles row",
 "Keep only sites created inside the range.", BLOCK, S, "SiteCreatedDate", SITE_HOW,
 'WHERE "SiteCreatedDate" >= :date_from AND "SiteCreatedDate" <= :date_to'],

["Sites and Libraries","2. Library adoption and volume","Libraries Declaration Rate","KPI card","4,283",
 "Per library, the declared count over the total document count. Needs both halves: the declared half exists today, the total does not.",
 SCAN, U, "ListId, IsDeclaredRecord", SCAN_HOW,
 f'SELECT "ListId", "LibraryName",\n       count(*) AS documents,\n       count(*) FILTER (WHERE "IsDeclaredRecord") AS declared,\n       round(100.0 * count(*) FILTER (WHERE "IsDeclaredRecord") / nullif(count(*),0), 1) AS rate_pct\nFROM {U}\n{LATEST}\nGROUP BY 1,2;'],

["Sites and Libraries","2. Library adoption and volume","Declared over not yet declared per library","Stacked bar chart","15 libraries",
 "The two halves of the rate, drawn as one bar sized to total documents.",
 SCAN, U, "ListId, LibraryName, IsDeclaredRecord", SCAN_HOW, "-- the query above, drawn as two segments"],

["Sites and Libraries","2. Library adoption and volume","Parent site under each library name","Text label","in <site>",
 "The site the library belongs to.", READY, U, "SiteName", NONE_HOW, 'SELECT "LibraryName", "SiteName" ...'],

["Sites and Libraries","2. Library adoption and volume","Sort by documents / records / rate","Sort control","With a direction toggle",
 "Reorder the same rows.", SCAN, U, "the three computed values", SCAN_HOW, "ORDER BY documents | declared | rate_pct"],

["Sites and Libraries","2. Library adoption and volume","Largest Libraries","KPI card","43.1 GB",
 "Total file size per library, largest first.", SCAN, U, "ListId, FileSize", SIZE_HOW + " " + SCAN_HOW,
 f'SELECT "ListId", "LibraryName",\n       sum("FileSize") / 1024.0^3 AS gb\nFROM {U}\n{LATEST}\nGROUP BY 1,2 ORDER BY 3 DESC;'],

["Sites and Libraries","2. Library adoption and volume","Average file size","Derived value","MB per file",
 "Total size divided by the file count. Never stored, always computed, so it cannot disagree with its two inputs.",
 SCAN, U, "FileSize, row count", SIZE_HOW,
 'sum("FileSize") / nullif(count(*),0) / 1024.0^2 AS avg_mb'],

# ---------------- FORMAT AND STORAGE ----------------
["Format and Storage","Storage footprint by file format","Storage Consumed by Format","KPI card","46.7 GB",
 "Total file size across all declared records.", BLOCK, U, "FileSize", SIZE_HOW,
 f'SELECT sum("FileSize")/1024.0^3 AS gb\nFROM {U}\n{LATEST}\n  AND "IsDeclaredRecord" = true;'],

["Format and Storage","Storage footprint by file format","Format column","Table column","8 rows, PDF to All other formats",
 "The eight display groups, derived from the file extension.",
 READY, R, 'FileMeta -> FileType, grouped', "The grouping list itself does not exist. RAC signs off which extensions map to which of the eight groups, once.",
 'SELECT "FileMeta"->>\'FileType\' AS ext, count(*)\nFROM public."Records" WHERE "IsDeleted"=false\nGROUP BY 1 ORDER BY 2 DESC;'],

["Format and Storage","Storage footprint by file format","Number of files column","Table column","8,200 for PDF",
 "Row count per format group. Sums to 21,646 and is asserted against the Records Management total.",
 READY, U, "FormatGroup", NONE_HOW,
 f'SELECT "FormatGroup", count(*) AS files\nFROM {U}\n{LATEST}\n  AND "IsDeclaredRecord" = true\nGROUP BY 1 ORDER BY 2 DESC;'],

["Format and Storage","Storage footprint by file format","Storage GB column","Table column","9.6 GB for PDF",
 "Total file size per format group.", BLOCK, U, "FormatGroup, FileSize", SIZE_HOW,
 'SELECT "FormatGroup", sum("FileSize")/1024.0^3 AS gb ... GROUP BY 1;'],

["Format and Storage","Storage footprint by file format","Average file size MB column","Table column","Derived",
 "Storage divided by files, per format group.", BLOCK, U, "FormatGroup, FileSize", SIZE_HOW,
 'sum("FileSize")/nullif(count(*),0)/1024.0^2'],

["Format and Storage","Storage footprint by file format","Totals row","Table row","21,646 and 46.7 GB",
 "The column totals. Must reconcile to Total Declared Records.", BLOCK, U, "FormatGroup, FileSize", SIZE_HOW,
 "-- the same query without GROUP BY"],

["Format and Storage","Storage footprint by file format","Most Common Format","KPI card","PDF",
 "The format group with the highest file count.", READY, U, "FormatGroup", NONE_HOW,
 f'SELECT "FormatGroup" FROM {U}\n{LATEST}\n  AND "IsDeclaredRecord" = true\nGROUP BY 1 ORDER BY count(*) DESC LIMIT 1;'],

["Format and Storage","Storage footprint by file format","Declared records by format","Bar chart","Count and share per format",
 "File count per format group with its percentage of the total.", READY, U, "FormatGroup", NONE_HOW,
 'SELECT "FormatGroup", count(*),\n       round(100.0*count(*)/sum(count(*)) OVER (), 1) AS share_pct\n... GROUP BY 1;'],

# ---------------- OVERVIEW ----------------
["Overview","Executive summary","Five headline KPI cards","KPI cards","Clickable, route to source dashboard",
 "Read from the other dashboards, never recalculated here. A summary holding its own copy of a number drifts from the detail the first time either side is edited.",
 DERIV, "-", "none of its own", "Nothing. It inherits the status of whichever figure it quotes.",
 "-- no query, reads the other dashboards' results"],

["Overview","Records Management summary","Physical counterpart donut","Donut chart","With vs without",
 "The HasPhysical split as a share.", READY, R, 'EDRMSMeta -> HasPhysical', NONE_HOW, "-- the physical split query"],

["Overview","Records Management summary","Documents held vs records declared","Comparison bars","Shared scale, rate called out",
 "Both totals on one scale with the declaration rate between them.", SCAN, U, "IsDeclaredRecord", SCAN_HOW,
 f'SELECT count(*) AS documents,\n       count(*) FILTER (WHERE "IsDeclaredRecord") AS declared\nFROM {U} {LATEST};'],

["Overview","Records Management summary","Top 5 departments by declared records","Ranked list","ITD SARD OSFG FIN PARD",
 "The department chart, truncated to five.", BLOCK, R, 'ADBMeta -> ADBDepartmentOwner', DEPT_HOW, "... ORDER BY declared DESC LIMIT 5"],

["Overview","Sites and Libraries summary","Library content declared vs not","Donut chart","Two slices",
 "The declaration rate as a share.", SCAN, U, "IsDeclaredRecord", SCAN_HOW, "-- the declaration rate query"],

["Overview","Sites and Libraries summary","Top 5 departments by compliant sites","Ranked list","Five departments",
 "The treemap, truncated to five.", BLOCK, S, "ADBDepartmentOwner, IsEdrmsCompliant", DEPT_HOW + " " + COMP_HOW,
 "... ORDER BY sites DESC LIMIT 5"],

["Overview","Format and Storage summary","Share of storage donut","Donut chart","Five formats",
 "Storage per format as a share of the total.", BLOCK, U, "FormatGroup, FileSize", SIZE_HOW, "-- storage by format, as percentages"],

["Overview","Format and Storage summary","Share of files donut","Donut chart","Same five formats, same colours",
 "File count per format as a share. Uses the same formats and colours as the storage donut so the two can be read against each other.",
 READY, U, "FormatGroup", NONE_HOW, "-- files by format, as percentages"],

["Overview","Format and Storage summary","Format finding callout","Text callout","The format dominating storage is not the one dominating file count",
 "A sentence comparing the two donuts.", BLOCK, U, "FormatGroup, FileSize", SIZE_HOW, "-- compares the two queries above"],

# ---------------- EVERY DASHBOARD ----------------
["Every dashboard","Header","Data as of line","Text label","Data as of Mon 20 Jul 2026 23:59",
 "The snapshot date of the underlying data. The Overview quotes the OLDEST across the dashboards it summarises, not the newest, because a summary is only as current as its stalest input.",
 SCAN, U + " and " + S, "SnapshotDate",
 "Written by the refresh job. Exists the moment the job does.",
 f'SELECT max("SnapshotDate") FROM {U};'],

["Every dashboard","Header","Refreshed line","Text label","refreshed Tue 21 Jul 06:00",
 "When the refresh job last completed successfully.", SCAN, U + " and " + S, "RowLoadedDate",
 "Written by the refresh job. Lets a failed or partial run be spotted.",
 f'SELECT max("RowLoadedDate") FROM {U};'],
]
