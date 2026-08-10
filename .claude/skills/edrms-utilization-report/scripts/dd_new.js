DASHBOARDS.dd=(function(){
  /* Every array below is generated from utilizationdb.md, so the page and the
     document cannot disagree. Columns keep the names they already have in the
     EDRMS database: CreatedDate stays CreatedDate, ListId stays ListId. JSON
     keys inside FileMeta, EDRMSMeta and ADBMeta become real columns keeping the
     key name exactly. */
  const TABLES=[
    {n:"Utilization Report Table", db:"utilization_report",
     g:"One row per document held in an EDRMS compliant site, declared or not",
     v:"About 3.47 million rows, replaced in full at each weekly refresh",
     c:[
      ["Id","Unique ID","Unique row identifier",""],
      ["SnapshotDate","Date","The date this data was captured","key"],
      ["DocumentId","Text","SharePoint Document ID",""],
      ["Title","Text","Filename of the file",""],
      ["DocumentUrl","Text","Direct link to the document",""],
      ["FileType","Text","File extension, lowercase",""],
      ["FormatGroup","Choice","The grouping the report displays","key"],
      ["FileSize","Whole number","Size of the file in bytes","gap"],
      ["FileCreatedDate","Date and time","When the file itself was created",""],
      ["FileModifiedDate","Date and time","When the file itself was last changed",""],
      ["FolderPath","Text","Folder path inside the library",""],
      ["LibraryName","Text","Name of the library holding the file","key"],
      ["LibraryUrl","Text","URL of the library",""],
      ["LibraryLastActivityDate","Date","When anything in the library last changed","key"],
      ["ListId","Unique ID","SharePoint library ID","key"],
      ["ItemId","Whole number","SharePoint item ID within the library",""],
      ["ADBLibraryCategory","Text","Library category",""],
      ["SiteName","Text","Name of the site holding the file","key"],
      ["SiteUrl","Text","URL of the site holding the file","key"],
      ["SiteCreatedDate","Date","When the SharePoint site was created","gap"],
      ["IsEdrmsCompliant","Yes / No","Whether the parent site is an EDRMS compliant site","gap"],
      ["ADBDepartmentOwner","Text","Owning department","gap"],
      ["IsDeclaredRecord","Yes / No","Whether this document has been declared a record","key"],
      ["CreatedDate","Date and time","Date when the user declared the file as a record","key"],
      ["CreatedBy","Text","Email or ID of the user that declared the record",""],
      ["DeclarationType","Whole number","Regular or centralized declaration, as a code",""],
      ["HasPhysical","Yes / No","Whether the file has a physical counterpart","key"],
      ["PhysicalCounterpartRetention","Choice","Retention that applies to the physical copy",""],
      ["EDRMSRetentionLabel","Text","Retention label applied to the file",""],
      ["EDRMSDuration","Text","Duration length of the retention label",""],
      ["EDRMSRetentionLabelApplied","Date and time","Date the retention label was applied",""],
      ["EDRMSDueDateForDisposal","Date","Computed EDRMSRetentionLabelApplied plus EDRMSDuration","key"],
      ["RetentionStatus","Text","Retention classification based on the duration",""],
      ["SensitivityLabelName","Text","Sensitivity label on the file",""],
      ["IsDeleted","Yes / No","Soft delete flag","key"],
      ["RowLoadedDate","Date and time","When this row was last written",""]
    ]},
    {n:"Site Activity Table", db:"utilization_site_activity",
     g:"One row per SharePoint site",
     v:"About 1,057 rows, one for every compliant site",
     c:[
      ["Id","Whole number","Unique row identifier",""],
      ["SnapshotDate","Date","The date this data was captured","key"],
      ["SiteUrl","Text","URL of the site","key"],
      ["SiteName","Text","Name of the site","key"],
      ["SiteCreatedDate","Date","When the SharePoint site was created","gap"],
      ["IsEdrmsCompliant","Yes / No","Whether this is an EDRMS compliant site","gap"],
      ["ADBDepartmentOwner","Text","Owning department","gap"],
      ["SiteVisits7","Whole number","Site visits, last 7 days","key"],
      ["SiteVisits30","Whole number","Site visits, last 30 days","key"],
      ["SiteVisits90","Whole number","Site visits, last 90 days","key"],
      ["UniqueViewers7","Whole number","Unique viewers, last 7 days",""],
      ["UniqueViewers30","Whole number","Unique viewers, last 30 days",""],
      ["LibraryCount","Whole number","Number of document libraries in the site","key"],
      ["LastActivityDate","Date","Most recent activity on the site","key"],
      ["StorageUsed","Whole number","Storage used by the site, in bytes",""],
      ["SiteOwner","Text","Primary site administrator",""],
      ["ProjectEndDate","Date","Project end date for the site",""],
      ["IsDeleted","Yes / No","Soft delete flag","key"],
      ["RowLoadedDate","Date and time","When this row was last written",""]
    ]},
    {n:"User Activity Table", db:"utilization_user_activity",
     g:"One row per person who used SharePoint in the window",
     v:"About 9,400 rows. Exists because people cannot be counted from a table of sites",
     c:[
      ["Id","Whole number","Unique row identifier",""],
      ["SnapshotDate","Date","The date this data was captured","key"],
      ["UserPrincipalName","Text","The person's sign in name","key"],
      ["DisplayName","Text","The person's display name",""],
      ["LastActivityDate","Date","Their most recent SharePoint activity","key"],
      ["ViewedOrEditedFileCount","Whole number","Files they viewed or edited in the window",""],
      ["RowLoadedDate","Date and time","When this row was last written",""]
    ]},
    {n:"File Plan Table", db:"utilization_file_plan",
     g:"One row per term in the institutional file plan",
     v:"A few hundred to a few thousand rows. The taxonomy that classifies the content, rather than the content",
     c:[
      ["Id","Whole number","Unique row identifier",""],
      ["SnapshotDate","Date","The date this data was captured","key"],
      ["TermId","Unique ID","The term's own identifier",""],
      ["TermName","Text","The term's label",""],
      ["TermSetName","Text","The term set the term belongs to",""],
      ["CategoryName","Text","The top level group","key"],
      ["Depth","Whole number","How many levels down the term sits",""],
      ["RowLoadedDate","Date and time","When this row was last written",""]
    ]}
  ];

  /* [column, which figure it produces, status, where it is today, how to
     source it], in the same order as the tables above. */
  const USES=[
   {t:"Utilization Report Table", r:[
     ["Id","<b>None.</b> Identifies the row so a refresh can update or remove it. It does <b>not</b> produce Total Declared Records: that figure counts distinct ListId plus ItemId pairs where IsDeclaredRecord is true and IsDeleted is false","have","<code>4 Records</code> row 56 (S/N 1) <code>Id</code>. Live <code>Records.Id</code>","Generated by the refresh job"],
     ["SnapshotDate","The \"Data as of\" line, top right of all five dashboards","new","Not in the workbook","Written by the refresh job. Set it once per run"],
     ["DocumentId","<b>None directly.</b> Stops a renamed or moved file being counted twice, so it protects every count on every dashboard","have","<code>4 Records</code> row 69 (S/N 14). Live <code>Records.DocumentId</code>","EDRMS database for declared. <b>Microsoft Graph</b> returns it for the rest"],
     ["Title","<b>None on a chart.</b> Makes an export or a click through readable","have","<code>4 Records</code> row 66 (S/N 11). Live <code>Records.Title</code>","EDRMS database, then Microsoft Graph for the rest"],
     ["DocumentUrl","<b>None.</b> The click through from the report to the document","derived","Not stored. Built from rows 70, 72, 74, 66","Assemble at load from SiteUrl, LibraryUrl, FolderPath and Title"],
     ["FileType","Feeds FormatGroup. Also the Format label on each row of the Storage Consumed by Format table","have","<code>4 Records</code> row 75 (S/N 20) <code>FileMeta</code> key <code>FileType</code>. Live <code>Records.FileMeta</code>","EDRMS database, then Microsoft Graph for the rest"],
     ["FormatGroup","<b>Format and Storage:</b> all 8 rows of Storage Consumed by Format, the Most Common Format KPI (PDF), the declared records by format bars. <b>Overview:</b> the share of storage donut and the share of files donut","derived","Not in the workbook","A lookup list mapping extension to group. RAC owns the list; the eight groups are already fixed in the prototype"],
     ["FileSize","<b>Format and Storage:</b> the Storage GB column, the Avg file size MB column, the 46.7 GB KPI. <b>Sites and Libraries:</b> Largest Libraries bars, the 43.1 GB KPI, the avg file size sort. <b>Overview:</b> the storage KPI card and the share of storage donut","gap","<code>4 Records</code> row 75 <code>FileMeta</code> holds FileType, FileCreatedDate, SensitivityLabelName and SensitivityLabelID. <b>No size key</b>","Two routes, and you want both. <b>Microsoft Graph</b> returns <code>size</code> on every driveItem, so the weekly scan gets it at no extra cost. For declared records captured at declaration time, add a <code>FileSize</code> key to the <code>FileMeta</code> JSON the EDRMS application already writes: a JSON key, not a database migration"],
     ["FileCreatedDate","<b>Records Management:</b> the date range filter on the Total Documents in EDRMS Compliant Sites panel","have","<code>4 Records</code> row 75 (S/N 20) <code>FileMeta</code> key <code>FileCreatedDate</code>. Live <code>Records.FileMeta</code>","EDRMS database, then Microsoft Graph <code>createdDateTime</code> for the rest"],
     ["FileModifiedDate","<b>None today.</b> Needed for any future stale content view","new","<code>Records.ModifiedDate</code> exists but means when the record row changed, not the file","Microsoft Graph <code>lastModifiedDateTime</code>, from the same scan"],
     ["FolderPath","<b>None.</b> Builds DocumentUrl and separates folders inside one library","have","<code>4 Records</code> row 74 (S/N 19). Live <code>Records.FolderPath</code>","EDRMS database, then Microsoft Graph for the rest"],
     ["LibraryName","<b>Records Management:</b> level 4 of both drill downs. <b>Sites and Libraries:</b> the row label on Libraries Declaration Rate and on Largest Libraries","have","<code>4 Records</code> row 73 (S/N 18). Live <code>Records.LibraryName</code>","EDRMS database, then Microsoft Graph for the rest"],
     ["LibraryUrl","<b>None.</b> Click through to the library","have","<code>4 Records</code> row 72 (S/N 17). Live <code>Records.LibraryUrl</code>","EDRMS database, then Microsoft Graph for the rest"],
     ["LibraryLastActivityDate","<b>Sites and Libraries:</b> Active Libraries, Inactive Libraries, the Long dormant tile and the Last activity column","new","Nowhere","<b>Microsoft Graph</b> <code>lastModifiedDateTime</code> on the drive, from the same <code>GET /sites/{id}/drives</code> call that supplies <code>LibraryCount</code>"],
     ["ListId","<b>None directly.</b> The grouping key behind Libraries Declaration Rate and Largest Libraries, because library names can change","have","<code>4 Records</code> row 67 (S/N 12). Live <code>Records.ListId</code>","EDRMS database, then Microsoft Graph for the rest"],
     ["ItemId","<b>None on its own.</b> With ListId it identifies the row, which is what stops a document declared twice being counted twice","have","<code>4 Records</code> row 68 (S/N 13). Live <code>Records.ItemId</code>","EDRMS database, then Microsoft Graph for the rest"],
     ["ADBLibraryCategory","<b>None today.</b> The natural grouping for Department Performance when it is built","planned","<code>4 Records</code> row 76 (S/N 21) <code>ADBMeta</code>, marked <b>Future Enhancement</b>. Also <code>Library</code> row 6 and <code>ADBMaster</code> rows 22 to 24, neither built. Live <code>Records.ADBMeta</code> is empty","<b>Available now without waiting for ADBMeta.</b> The Retention Label Mapping list in <code>app_edrms_data_uat</code> holds it as \"Library Type\" per library. Join on library and you have it today"],
     ["SiteName","<b>Records Management:</b> level 3 of both drill downs, and the row label on Active Departmental Sites. <b>Sites and Libraries:</b> the \"in site\" sub label under each library","have","<code>4 Records</code> row 71 (S/N 16). Also <code>Site</code> row 14. Live <code>Records.SiteName</code> and <code>ADBSites.SiteName</code>","EDRMS database. <code>ADBSites</code> also carries it for every tracked site"],
     ["SiteUrl","<b>None.</b> Joins this table to the Site Activity Table","have","<code>4 Records</code> row 70 (S/N 15). Also <code>Site</code> row 13. Live <code>Records.SiteUrl</code> and <code>ADBSites.SiteUrl</code>","EDRMS database and <code>ADBSites</code>"],
     ["SiteCreatedDate","<b>None from this table.</b> A copy of the Site Activity value, so a document can be filtered by site age without a join","gap","<code>Site</code> row 6 is <code>CreatedDate</code>, but that is when the <b>row</b> was created in EDRMS, not when the <b>SharePoint site</b> was created. Not in <code>ADBSites</code>","<b>SharePoint admin centre</b>, Active sites view, the \"Created\" column, exportable to CSV. <b>Microsoft Graph</b> <code>/sites</code> returns <code>createdDateTime</code> for a scripted version. <b>AvePoint Cloud Governance</b> holds the provisioning date if the site was provisioned through it"],
     ["IsEdrmsCompliant","<b>Records Management:</b> decides which documents count toward Total Documents in EDRMS Compliant Sites, 3.47M. Defines the population of the entire table","gap","No such column and no rule anywhere in the workbook or the database","<b>No system holds this. It is a definition, not a lookup.</b> RAC picks one of three: a maintained list of compliant site URLs, which is simplest and can start today in a SharePoint list beside the Retention Label Mapping list; a site template check, if compliant sites use a distinct template; or an <b>AvePoint Cloud Governance</b> flag, if compliant sites are provisioned through a specific request form"],
     ["ADBDepartmentOwner","<b>Records Management:</b> level 1 of both drill downs, and the department filter on 4 panels. <b>Sites and Libraries:</b> the department filter and the treemap grouping. <b>Overview:</b> top 5 departments by declared records and top 5 by compliant sites","gap","<code>4 Records</code> row 76 (S/N 21) <code>ADBMeta</code> key <code>ADBDepartmentOwner</code>, marked <b>Future Enhancement</b>. Values in <code>ADBMaster</code> rows 13 to 15, never built. Live <code>Records.ADBMeta</code> is empty","<b>The vocabulary already exists</b>, populated in the <b>SharePoint term store</b> under Managed Metadata. What is missing is the link from a site to its department. Best source: <b>AvePoint Cloud Governance</b>, which records the requesting department when a site is provisioned. Fallback: RAC maintains a site to department list once, about 1,057 rows, in a SharePoint list. <b>Attach it to the site, not to each record</b>, and every document inherits it"],
     ["IsDeclaredRecord","<b>Records Management:</b> Total Declared Records 21,646 and every bar under it, counted over distinct items rather than rows. <b>Sites and Libraries:</b> the declared half of Libraries Declaration Rate and the rate itself. <b>Format and Storage:</b> declared records by format. <b>Overview:</b> 3 of the 5 KPI cards, the physical counterpart donut, the library declared donut, the share of files donut. <b>Retention:</b> every figure","new","Not a column today, because every row in <code>Records</code> already <b>is</b> a declared record","Derived at load: true where the document is present in <code>Records</code>, false where the scan found it but <code>Records</code> does not. Costs nothing beyond running the scan"],
     ["CreatedDate","<b>Records Management:</b> the date range filter on Total Declared Records, and the in range subtotal line under it","have","<code>4 Records</code> row 59 (S/N 4), described as \"When the User Declared the file as a Record\". Live <code>Records.CreatedDate</code>","EDRMS database. Blank for undeclared documents, which is correct"],
     ["CreatedBy","<b>None today.</b> Supports a declarations by user view","have","<code>4 Records</code> row 60 (S/N 5). Live <code>Records.CreatedBy</code>","EDRMS database"],
     ["DeclarationType","<b>None today.</b> Separates Regular from Centralized declarations","have","<code>4 Records</code> row 82 (S/N 27) shows it as release 2026.2, but the deployed table has it as an <code>integer</code> today","EDRMS database, available now. Confirm the code to label mapping with the development team"],
     ["HasPhysical","<b>Records Management:</b> the two colour split on every bar of Total Declared Records. <b>Overview:</b> the physical counterpart donut","have","<code>4 Records</code> row 77 (S/N 22) <code>EDRMSMeta</code> key <code>HasPhysical</code>. Live <code>Records.EDRMSMeta</code>","EDRMS database. Undeclared documents are neither, so leave it blank rather than false"],
     ["PhysicalCounterpartRetention","<b>None today</b>","have","Not in the workbook","<b>Retention Label Mapping list</b> in <code>app_edrms_data_uat</code>, column \"Physical Counterpart\". Maintained per library, so join on library"],
     ["EDRMSRetentionLabel","<b>Retention</b>, not yet built","have","<code>4 Records</code> row 78 (S/N 23). Live <code>Records.EDRMSRetentionLabel</code>","EDRMS database. Also per library in the Retention Label Mapping list"],
     ["EDRMSDuration","Feeds EDRMSDueDateForDisposal","have","<code>4 Records</code> row 80 (S/N 25). Live <code>Records.EDRMSDuration</code>","EDRMS database. Also \"Retention Duration\" per library in the mapping list"],
     ["EDRMSRetentionLabelApplied","Feeds EDRMSDueDateForDisposal. <b>Deliberately not used to date declarations</b>","have","<code>4 Records</code> row 79 (S/N 24), described as the basis for the duration computation. Live <code>Records.EDRMSRetentionLabelApplied</code>","EDRMS database"],
     ["EDRMSDueDateForDisposal","<b>Retention</b>, not yet built: records due for disposal","have","<code>4 Records</code> row 81 (S/N 26), defined as RetentionLabelApplied plus Duration. Live <code>Records.EDRMSDueDateForDisposal</code>","EDRMS database, already computed"],
     ["RetentionStatus","<b>Retention</b>, not yet built: the status breakdown","have","<code>4 Records</code> row 77 (S/N 22) <code>EDRMSMeta</code> key <code>RetentionStatus</code>. Permitted values in <code>5 EDRMSMasters</code> rows 16 to 18. Live <code>Records.EDRMSMeta</code>","EDRMS database, with the value list from <code>EDRMSMasters</code>"],
     ["SensitivityLabelName","<b>None on any dashboard</b>","have","<code>4 Records</code> row 75 (S/N 20) <code>FileMeta</code> key <code>SensitivityLabelName</code>. Live <code>Records.FileMeta</code>","EDRMS database, then Microsoft Graph for the rest"],
     ["IsDeleted","<b>Every count on every dashboard</b> excludes rows where this is true","have","<code>4 Records</code> row 65 (S/N 10). Live <code>Records.IsDeleted</code>","EDRMS database. For undeclared documents, absence from the next scan is the delete signal"],
     ["RowLoadedDate","<b>None.</b> Operational, so a partial refresh can be spotted","new","Not in the workbook","Written by the refresh job"]
   ]},
   {t:"Site Activity Table", r:[
     ["Id","<b>None.</b> Identifies the row","have","<code>Site</code> row 5 (S/N 1)","Generated by the refresh job"],
     ["SnapshotDate","The \"Data as of\" line","new","Not in the workbook","Written by the refresh job"],
     ["SiteUrl","<b>None.</b> Joins to the Utilization Report Table","have","<code>Site</code> row 13 (S/N 9). Live <code>ADBSites.SiteUrl</code>","<code>ADBSites</code>, or the SharePoint admin centre export"],
     ["SiteName","<b>Records Management:</b> the row label on Active Departmental Sites and Active Users","have","<code>Site</code> row 14 (S/N 10). Live <code>ADBSites.SiteName</code>","<code>ADBSites</code>, or the SharePoint admin centre export"],
     ["SiteCreatedDate","<b>Sites and Libraries:</b> the treemap of sites created by department, and the date range filter above it","gap","<code>Site</code> row 6 <code>CreatedDate</code> is the row's creation, not the site's. Not in <code>ADBSites</code>","<b>SharePoint admin centre</b>, Active sites, the \"Created\" column, exportable to CSV. Or <b>Microsoft Graph</b> <code>/sites</code> <code>createdDateTime</code>. Or <b>AvePoint Cloud Governance</b> provisioning date"],
     ["IsEdrmsCompliant","<b>Sites and Libraries:</b> Total EDRMS Compliant Sites Created, 1,057, and everything drawn from it","gap","Nowhere","A RAC definition. See row 19 of Table 1"],
     ["ADBDepartmentOwner","<b>Sites and Libraries:</b> the treemap grouping and the department filter. <b>Overview:</b> top 5 departments by compliant sites","gap","Nowhere. <code>ADBSites</code> has no department column","<b>AvePoint Cloud Governance</b> provisioning record first. Fallback: RAC maintains the site to department list once. <b>This is the single highest value item in the whole report</b>, because attaching it here fixes it for all 3.47 million documents at once"],
     ["SiteVisits7","<b>Records Management:</b> Active Departmental Sites, the 7 day window","new","Nowhere","<b>Microsoft 365 admin centre</b>, Reports, Usage, SharePoint site usage. Or the <b>Microsoft Graph reports API</b>, <code>getSharePointSiteUsageDetail(period='D7')</code>"],
     ["SiteVisits30","<b>Records Management:</b> Active Departmental Sites, the 30 day window, and the Active Sites KPI","new","Nowhere","Same report at <code>period='D30'</code>"],
     ["SiteVisits90","<b>Records Management:</b> Active Departmental Sites, the 90 day window. Site visits are available at 90 days even though unique viewers are not","new","Nowhere","Same report at <code>period='D90'</code>"],
     ["UniqueViewers7","<b>Records Management:</b> Active Users, the 7 day window","new","Nowhere","Same report, the \"Visited Page Count\" and unique viewer fields"],
     ["UniqueViewers30","<b>Records Management:</b> Active Users, the 30 day window, and the Active Users KPI","new","Nowhere","Same report at <code>period='D30'</code>"],
     ["LibraryCount","<b>Sites and Libraries:</b> the Libraries column on the site inventory, and the \"libraries across them\" tile","new","Nowhere","<b>Microsoft Graph</b> <code>GET /sites/{id}/drives</code>, counted. Verified against the test tenant"],
     ["LastActivityDate","<b>Sites and Libraries:</b> the Last activity column and the Active / Inactive split. <b>Records Management:</b> the \"last activity\" text beside each bar on Active Departmental Sites","new","Nowhere","Same Microsoft 365 usage report, \"Last Activity Date\" column"],
     ["StorageUsed","<b>None today.</b> Sites and Libraries measures storage from FileSize instead","new","Nowhere","<b>SharePoint admin centre</b>, Active sites, the \"Storage used\" column. Note it includes version history, so it will not match the sum of FileSize"],
     ["SiteOwner","<b>Sites and Libraries:</b> the Site owner column on the site inventory. Who to contact about a site that has gone quiet","new","Nowhere","<b>SharePoint admin centre</b>, Active sites, the \"Primary admin\" column"],
     ["ProjectEndDate","<b>None today.</b> The obvious basis for a site closure view","have","<code>Site</code> row 15 (S/N 11). Live <code>ADBSites.ProjectEndDate</code>","<code>ADBSites</code>, already populated"],
     ["IsDeleted","Excludes closed sites from current figures without changing historical ones","have","<code>Site</code> row 12 (S/N 8). Live <code>ADBSites.IsDeleted</code>","<code>ADBSites</code>, already populated. A site missing from the next admin centre export is the delete signal"],
     ["RowLoadedDate","<b>None.</b> Operational","new","Not in the workbook","Written by the refresh job"]
   ]},
   {t:"User Activity Table", r:[
     ["Id","<b>None.</b> Identifies the row","new","Nowhere","Generated by the refresh job"],
     ["SnapshotDate","The \"Data as of\" line","new","Nowhere","Written by the refresh job"],
     ["UserPrincipalName","<b>Records Management:</b> Total EDRMS Users, counted distinct. The only column the headline figure needs","new","Nowhere","<b>Microsoft Graph</b> <code>getSharePointActivityUserDetail(period='D30')</code>, one row per person"],
     ["DisplayName","<b>None.</b> Readability when the list is inspected","new","Nowhere","Same call"],
     ["LastActivityDate","Filters the count to a 7 or 30 day window","new","Nowhere","Same call"],
     ["ViewedOrEditedFileCount","<b>None today.</b> Separates heavy users from one time visitors, and the obvious basis for an adoption view","new","Nowhere","Same call"],
     ["RowLoadedDate","<b>None.</b> Operational","new","Nowhere","Written by the refresh job"]
   ]},
   {t:"File Plan Table", r:[
     ["Id","<b>None.</b> Identifies the row","new","Nowhere","Generated by the refresh job"],
     ["SnapshotDate","The \"Data as of\" line","new","Nowhere","Written by the refresh job"],
     ["TermId","<b>None.</b> Keeps a count stable when a term is renamed","new","Nowhere","<b>Microsoft Graph</b> term store"],
     ["TermName","<b>None on a chart.</b> Readability when the plan is inspected","new","Nowhere","Same source"],
     ["TermSetName","<b>File Plan:</b> the \"N term sets\" line under each category","new","Nowhere","Same source"],
     ["CategoryName","<b>File Plan:</b> the five category bars and their shares","new","Nowhere","Same source, <code>GET /termStore/groups</code>"],
     ["Depth","<b>File Plan:</b> the \"N levels deep\" line, and the deepest branch note","new","Nowhere","Derived while walking the tree, at no extra cost"],
     ["RowLoadedDate","<b>None.</b> Operational","new","Nowhere","Written by the refresh job"]
   ]}
  ];
  const UBADGE={
    have:['g-ok','In the database'],
    derived:['g-ok','Derived at load'],
    new:['g-part','New column'],
    planned:['g-part','Designed, not built'],
    gap:['g-gap','Missing, blocks a figure']
  };

  /* [dashboard, figure, table, how the number is produced, status]. The same
     information as USES read from the other direction, figure first. */
  const TRACE=[
    ["Records Management","Total Declared Records, 21,646","Utilization Report Table","Count the distinct ListId plus ItemId pairs where IsDeclaredRecord is true and IsDeleted is false","ok"],
    ["Records Management","Declared records by department","Utilization Report Table","The same count, grouped by ADBDepartmentOwner","gap"],
    ["Records Management","The two colour split on each bar","Utilization Report Table","The same count, split by HasPhysical","ok"],
    ["Records Management","Drill: department, site, library","Utilization Report Table","The same count, regrouped by SiteName, then LibraryName. Level 1 needs ADBDepartmentOwner; levels 2 and 3 are ready today","ok"],
    ["Records Management","Date range on declared records","Utilization Report Table","Keep only rows where CreatedDate falls in the range","ok"],
    ["Records Management","Total Documents in compliant sites, 3.47M","Utilization Report Table","Count all the rows where IsEdrmsCompliant is true","scan"],
    ["Records Management","Date range on total documents","Utilization Report Table","Keep only rows where FileCreatedDate falls in the range","scan"],
    ["Records Management","Active Departmental Sites","Site Activity Table","Rank sites by SiteVisits7, SiteVisits30 or SiteVisits90","usage"],
    ["Records Management","Last activity beside each site","Site Activity Table","Read LastActivityDate","usage"],
    ["Records Management","Unique viewers per site","Site Activity Table","Rank sites by UniqueViewers7 or UniqueViewers30","usage"],
    ["Records Management","Total EDRMS Users, monthly active","<b>User Activity Table</b>","Count distinct UserPrincipalName in the latest snapshot. <b>Not</b> the sum of UniqueViewers30, which counts a person once per site","usage"],
    ["Sites and Libraries","Total Compliant Sites Created, 1,057","Site Activity Table","Count the rows where IsEdrmsCompliant is true","gap"],
    ["Sites and Libraries","Sites created by department treemap","Site Activity Table","The same count, grouped by ADBDepartmentOwner","gap"],
    ["Sites and Libraries","Date range on the treemap","Site Activity Table","Keep only rows where SiteCreatedDate falls in the range","gap"],
    ["Sites and Libraries","Libraries Declaration Rate","Utilization Report Table","Per ListId, count all rows, count the rows where IsDeclaredRecord is true, and divide","scan"],
    ["Sites and Libraries","Largest Libraries, 43.1 GB","Utilization Report Table","Per ListId, add up FileSize","scan"],
    ["Sites and Libraries","Average file size","Utilization Report Table","Per ListId, total FileSize divided by the row count","scan"],
    ["Sites and Libraries","Site owner","Site Activity Table","Read SiteOwner","ok"],
    ["Sites and Libraries","Libraries per site","Site Activity Table","Read LibraryCount","ok"],
    ["Sites and Libraries","Visits and users per site","Site Activity Table","Read SiteVisits30 and UniqueViewers30","usage"],
    ["Sites and Libraries","Active and Inactive sites","Site Activity Table","Inactive where LastActivityDate is more than 90 days old, active otherwise","usage"],
    ["Sites and Libraries","Active Libraries, last 90 days","Utilization Report Table","Count distinct ListId where LibraryLastActivityDate is within 90 days","ok"],
    ["Sites and Libraries","Inactive and Long dormant libraries","Utilization Report Table","The same count at the 90 and 180 day thresholds","ok"],
    ["Sites and Libraries","Library Growth Rate","Utilization Report Table","Records declared during the period, divided by the records held at the start. Both come from CreatedDate, so <b>no snapshot history is needed</b>","ok"],
    ["Sites and Libraries","New records this period, per library","Utilization Report Table","Count the declared rows per ListId where CreatedDate falls in the period","ok"],
    ["Format and Storage","Storage Consumed by Format, 46.7 GB","Utilization Report Table","Per FormatGroup, add up FileSize","gap"],
    ["Format and Storage","Number of files by format","Utilization Report Table","Per FormatGroup, count the rows","ok"],
    ["Format and Storage","Most Common Format, PDF","Utilization Report Table","The FormatGroup with the highest row count","ok"],
    ["Format and Storage","Declared records by format","Utilization Report Table","Per FormatGroup, count the rows where IsDeclaredRecord is true","ok"],
    ["Retention","Declared records by retention label","Utilization Report Table","Per EDRMSRetentionLabel, count the declared rows","ok"],
    ["Retention","Records Due for Disposal, next 12 months","Utilization Report Table","Count the declared rows where EDRMSDueDateForDisposal falls in the next 12 months. Permanent labels have no due date and drop out on their own","ok"],
    ["Retention","Next Due Date for Disposal","Utilization Report Table","The earliest EDRMSDueDateForDisposal still ahead of today","ok"],
    ["Retention","Disposal summary per library","Utilization Report Table","The same two figures grouped by ListId, with LibraryName for the label","ok"],
    ["Retention","Inactive over 1 year","Utilization Report Table","Count the rows where FileModifiedDate is more than a year old. <b>The one figure on the Retention dashboard that is not ready</b>, because an untouched document has no row until the scan creates one","scan"],
    ["File Plan","Total Terms","<b>File Plan Table</b>","Count the rows in the latest snapshot","ok"],
    ["File Plan","Term Sets","<b>File Plan Table</b>","Count distinct TermSetName","ok"],
    ["File Plan","Terms by category","<b>File Plan Table</b>","Count the rows grouped by CategoryName","ok"],
    ["File Plan","How deep the plan runs","<b>File Plan Table</b>","The maximum Depth, overall and per category","ok"],
    ["Every dashboard","The \"Data as of\" line","All four tables","Read SnapshotDate","ok"]
  ];
  const TBADGE={ok:["g-ok","Ready today"],scan:["g-part","Needs the scan"],
                usage:["g-part","Needs the usage feed"],gap:["g-gap","Blocked"]};

  const SOURCES=[
   ["EDRMS database","<code>drm-npr</code>, schema <code>public</code>, table <code>Records</code>","24 of the 37 columns, for the 21,646 declared records only"],
   ["Microsoft Graph, weekly scan","A scheduled job walking every document library in every compliant site","The same columns for the other 3.45 million documents, plus <code>size</code> and <code>lastModifiedDateTime</code>. <b>The single biggest missing piece. It unlocks Total Documents, the declaration rate and every storage figure</b>"],
   ["SharePoint admin centre","Active sites view, exportable to CSV","Site created date, storage used, primary admin, last activity"],
   ["Microsoft 365 usage reports","Admin centre, Reports, Usage, SharePoint site usage. Or the Graph reports API","Site visits and unique viewers at 7, 30 and 90 days"],
   ["AvePoint Cloud Governance","The provisioning records for EDRMS sites","Department per site, and the provisioning date. <b>Check this before anyone starts mapping sites by hand</b>"],
   ["Retention Label Mapping list","<code>app_edrms_data_uat</code>, the list you already maintain","Library Type, Retention Label, Retention Duration, Physical Counterpart, all per library"]
  ];

  const html=`<section class="dash-dd">
    <div class="band">
      <h2>The database behind the report</h2>
      <div class="bd">What has to exist in the database for the Utilization Report to work, written the way a SharePoint list is written. Every column keeps the name it already has in the EDRMS database, so it can be traced back to where it came from. Every figure on every dashboard is traced back to a column here.</div>
    </div>

    <div class="panel">
      <h3>Can it be one table only?</h3>
      <p>Almost. One table gets you about nine tenths of the report. Four things break.</p>
      <p><b>A site with no documents in it disappears.</b> Sites and Libraries reports 1,057 compliant sites created. If sites are counted from a table of documents, a site is only counted once it holds at least one document, so a site created last month that nobody has uploaded to yet is invisible and the count comes out low. It gets worse over time, because the newest sites are the emptiest ones.</p>
      <p><b>Site visits and unique viewers are measured per site, not per document.</b> If a site had 4,812 visits last month and holds 6,000 documents, putting 4,812 on all 6,000 rows means any total that adds the column up returns 28 million visits. There is no way to put a per site figure on a per document table and have it stay correct when summed.</p>
      <p><b>People cannot be counted from a table of sites.</b> Total EDRMS Users asks how many people used EDRMS. Someone who works in three sites appears in three site rows, so adding up the per site viewer counts counts that person three times. Only a row per person answers it.</p>
      <p><b>The file plan is not content at all.</b> Its terms are the taxonomy that classifies documents, so they are neither documents nor sites nor people and none of the other tables can hold them.</p>
      <p>Everything else fits in one table. So the answer is <b>four tables, one per grain</b>: one row per document, one row per site, one row per person, one row per term. The last three are small, and each exists only because its grain cannot be reached from the others.</p>
    </div>

    <div class="panel">
      <h3>Naming rule</h3>
      <p><b>Where a column already exists in the EDRMS database, it keeps the exact same name.</b> <code>CreatedDate</code> stays <code>CreatedDate</code>, not "Declared Date". <code>ListId</code> stays <code>ListId</code>, not "Library ID". Renaming makes a column impossible to trace back to where it came from.</p>
      <p><b>JSON keys become real columns, keeping the key name.</b> <code>FileMeta</code>, <code>EDRMSMeta</code> and <code>ADBMeta</code> each hold several values inside one JSON field. A reporting table cannot filter or total a value buried inside JSON efficiently, so each key becomes its own column: <code>FileMeta</code> key <code>FileType</code> becomes a column called <code>FileType</code>.</p>
      <p><b>Two names had to be invented because the existing name means something else.</b> <code>ModifiedDate</code> in <code>Records</code> is when the record row changed, not when the file changed, so the file's own date is <code>FileModifiedDate</code>. And <code>CreatedDate</code> already means the declaration date, which is why the file's own creation date stays <code>FileCreatedDate</code>.</p>
    </div>

    <div class="panel">
      <h3>What one row means</h3>
      <p>One row is <b>one SharePoint item</b>, identified by <code>ListId</code> plus <code>ItemId</code> together. Not by <code>DocumentId</code>.</p>
      <p><code>DocumentId</code> looks like the natural identifier and it is nullable, so it cannot carry that job on its own. A check against UAT returned <b>1,990 rows against 1,984 distinct DocumentId</b>, a gap of six. Whether those six are documents declared twice or rows with no <code>DocumentId</code> at all, the conclusion is the same: <code>ListId</code> and <code>ItemId</code> are both mandatory in <code>Records</code> and together they locate exactly one item in exactly one library.</p>
      <p>This matters for one figure. <b>Total Declared Records counts distinct items, not rows</b>, so a document declared twice is one record and not two. On the UAT data that is a difference of six in 1,990, which changes nothing visually and everything about whether two people building two reports arrive at the same number. It is a definition RAC should sign off once, in writing.</p>
    </div>

    <div class="panel">
      <h3>The four tables</h3>
      <div class="lead">Names in <b style="color:var(--deepblue)">blue</b> are ones the report cannot function without. Names in <b style="color:#9C4A16">amber</b> do not exist today and block a figure.</div>
      <div id="dd-tables"></div>
    </div>

    <div class="panel">
      <h3>Which figure each column produces, and how to source it</h3>
      <div class="lead"><b>Read this first, or the table will mislead you:</b> <code>Records</code> holds declared records only, about 21,646 of them, while the Utilization Report Table holds every document, about 3.47 million. So where a row says a column exists in <code>Records</code>, it exists <b>for the declared 21,646</b>. For the other 3.45 million the same column comes from the weekly SharePoint scan, which is one piece of work covering most of the table in one go, not twenty separate problems.</div>
      <div class="lead">Where it is today cites <code>Database_Design_12.03_2.xlsx</code> by sheet and actual spreadsheet row, and the live <code>drm-npr</code> database. All Records references are to the <b>2026.1 block, rows 56 to 82</b>, not the older 1.3 block above it. <code>ADBMaster</code>, <code>Library</code>, <code>PhysicalRecords</code> and <code>favoritelocations</code> are in the workbook but were never built.</div>
      <div id="dd-uses"></div>
      <div class="tally" id="dd-tally"></div>
    </div>

    <div class="panel">
      <h3>Where every figure comes from</h3>
      <div class="lead">The same information read from the other direction: every number in the prototype and how it is produced. If a figure is not on this list, it has no source.</div>
      <div class="scroll"><table id="dd-trace"></table></div>
    </div>

    <div class="panel">
      <h3>Where to go for each source</h3>
      <div class="lead">Six systems supply everything. This is the practical answer to where do I get this.</div>
      <div class="scroll"><table id="dd-src"></table></div>
      <p style="margin-top:12px">Two things are not in any system and have to be <b>decided</b> rather than found: <code>IsEdrmsCompliant</code>, which is a RAC definition, and the extension to format group mapping behind <code>FormatGroup</code>, which is a short list RAC signs off once.</p>
    </div>

    <div class="panel">
      <h3>The remaining gaps</h3>
      <p><b>1. Nothing records which department owns a site.</b> The only gap left that needs a person rather than code. <code>ADBDepartmentOwner</code> exists as a SharePoint column and is empty on every row, which is why <code>ADBMeta</code> is empty. The term store holds the vocabulary, but a list of valid answers is not the answer. Attach department to the <b>site</b>, in the Site Activity Table, and let every document inherit it through <code>SiteUrl</code>, which every row already carries: about 1,057 values instead of 3.47 million, working for existing documents as well as new ones with no migration. Confirmed feasible by the development team on 10 August 2026. Check AvePoint Cloud Governance first, since it may already hold it from provisioning.</p>
      <p><b>2. File size is not captured.</b> Blocks the 46.7 GB headline, storage by format, average file size and Largest Libraries. The smallest of the three, and it has two independent routes: Microsoft Graph returns <code>size</code> on every item so the weekly scan solves the library and format figures on its own, and adding a <code>FileSize</code> key to the existing <code>FileMeta</code> JSON solves per record storage without a migration. One warning that came with it: folders are returned with a <b>cumulative</b> size, so the scan must filter to files only or storage is double counted.</p>
      <p><b>3. Which sites are EDRMS compliant.</b> No longer a decision. A site is compliant when it has the Declare as Record button, and that button comes from an installed app, Product ID <code>{B255A2AF-7F63-4A30-966A-5D5FD99F97D7}</code>. It is visible per site in Site Contents, listed separately from the app catalog, so the rule is mechanical rather than a maintained list. What remains is a question for the development team: which call returns that row across 1,057 sites rather than one at a time.</p>
      <p>Site created date is closed: Microsoft Graph returns <code>createdDateTime</code> on every site.</p>
    </div>
  </section>`;

  function init(){
    document.getElementById("dd-tables").innerHTML=TABLES.map(t=>
      `<div class="tc">
        <div class="th"><b>${t.n}<em>${t.db}</em></b><small>${t.g}. ${t.v}</small></div>
        <div class="wrap"><table>
          <tr><th>#</th><th>Column</th><th>Type</th><th>What it holds</th></tr>
          ${t.c.map(([col,typ,desc,flag],i)=>
            `<tr class="${flag}"><td class="n">${i+1}</td><td class="c"><b>${col}</b></td>
             <td class="t">${typ}</td><td class="d">${desc}</td></tr>`).join("")}
        </table></div>
        <div class="cnt">${t.c.length} columns</div>
      </div>`).join("");

    document.getElementById("dd-uses").innerHTML=USES.map(u=>
      `<div class="tc">
        <div class="th"><b>${u.t}</b><small>${u.r.length} columns</small></div>
        <div class="wrap scroll"><table class="ut">
          <tr><th style="width:34px">#</th><th style="width:150px">Column</th><th style="width:25%">Which figure it produces</th><th style="width:120px">Status</th><th style="width:22%">Where it is today</th><th>How to source it</th></tr>
          ${u.r.map(([col,fig,st,now,how],i)=>
            `<tr class="${st==='gap'||st==='planned'?'gap':''}">
              <td class="n">${i+1}</td><td class="c"><b>${col}</b></td><td class="d">${fig}</td>
              <td><span class="dtag ${UBADGE[st][0]}">${UBADGE[st][1]}</span></td>
              <td class="d">${now}</td><td class="d">${how}</td></tr>`).join("")}
        </table></div>
      </div>`).join("");

    /* Counted from the data at render time, so the tally can never claim a
       number the table above it does not show. */
    const tally={}; let n=0;
    USES.forEach(u=>u.r.forEach(r=>{tally[r[2]]=(tally[r[2]]||0)+1;n++;}));
    document.getElementById("dd-tally").innerHTML=
      Object.entries(UBADGE).filter(([k])=>tally[k]).map(([k,[cls,lbl]])=>
        `<span class="ti"><b>${tally[k]}</b> <span class="dtag ${cls}">${lbl}</span></span>`).join("")+
      `<span class="ti tot"><b>${n}</b> columns across the four tables</span>`;

    document.getElementById("dd-trace").innerHTML=
      `<tr><th style="width:15%">Dashboard</th><th style="width:22%">Figure</th><th style="width:16%">Table</th><th>How the number is produced</th><th style="width:14%">Ready?</th></tr>`+
      TRACE.map(([dash,fig,tbl,how,st])=>
        `<tr><td>${dash}</td><td>${fig}</td><td>${tbl}</td><td class="d">${how}</td>
         <td><span class="dtag ${TBADGE[st][0]}">${TBADGE[st][1]}</span></td></tr>`).join("");

    document.getElementById("dd-src").innerHTML=
      `<tr><th style="width:20%">Source</th><th style="width:30%">What to open</th><th>What it gives you</th></tr>`+
      SOURCES.map(([s,o,g])=>`<tr><td><b>${s}</b></td><td class="d">${o}</td><td class="d">${g}</td></tr>`).join("");
  }

  return {
    ver:"Reporting Database Design",
    crumb:"Data Design",
    /* Documentation, not a dashboard. verify.js reads this so it does not
       demand a KPI card from a page that correctly has none. */
    kind:"reference",
    asof:"Design reference. Full detail in utilizationdb.md",
    html,init
  };
})();
