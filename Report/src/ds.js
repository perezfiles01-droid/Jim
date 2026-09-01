/* ===================================================================
   Data sources and feasibility

   One row for every metric named in the 2026.4 requirement, mapped to
   the thing in the tenant that would actually produce it. This page is
   the reason the rest of the suite can be trusted: a dashboard that
   shows a number without saying where it comes from is a mock up, and
   a mock up is what gets signed off and then cannot be built.

   The nine tiers are defined in core.js. Read them as an answer to one
   question: what has to happen before this number is real?
   =================================================================== */
DASHBOARDS.ds = (function(){
  let filter = "all";
  let dsSort = "section", dsDir = "asc";

  /* [section, metric, tier, source, needed] */
  const MAP = [
    /* ---- 1 Bankwide oversight ---- */
    ["Bankwide oversight","Total documents in EDRMS compliant sites","scan",
     "Microsoft Graph, drive item enumeration per compliant site","Build the scan job. Filter to files only: folders return a cumulative size and summing them double counts"],
    ["Bankwide oversight","Percentage of documents declared as records","scan",
     "Declared record count over the scanned document count","Depends on the scan, and on a ruling on what counts as a document"],
    ["Bankwide oversight","Total declared records","ready",
     "public.Records, count distinct ListId plus ItemId","Nothing. Counts distinct items so a document declared twice counts once"],
    ["Bankwide oversight","Total declared records vs declared physical records registered","ready",
     "public.Records, HasPhysical flag","Nothing"],
    ["Bankwide oversight","Total number of EDRMS users (monthly active)","usage",
     "M365 usage reports, SharePoint site usage, active user counts","Build the usage feed. Filter Is Deleted or counts run about 28 per cent high"],
    ["Bankwide oversight","Active and inactive EDRMS compliant sites","app",
     "Site inventory filtered to sites carrying app B255A2AF-7F63-4A30-966A-5D5FD99F97D7, joined to last activity","Confirm with the development team how to query which sites have the app installed"],
    ["Bankwide oversight","Orphaned sites","app",
     "Site inventory joined to Entra ID, owner does not resolve to an active account","Same app detection question, plus an Entra ID lookup"],
    ["Bankwide oversight","Site split by department","mapping",
     "Site to department mapping list, joined on site id","The mapping list. ADBDepartmentOwner exists on the library and is empty on every row, so this cannot be read from SharePoint today"],
    ["Bankwide oversight","Site split by field office","mapping",
     "Same mapping list, field office column","Add a field office column to the mapping list. Ask AvePoint Cloud Governance first, it may already hold the requesting office"],
    ["Bankwide oversight","Site split by sovereign projects","mapping",
     "Same mapping list, project type column","Add a project type column. Sovereign, nonsovereign or corporate, one value per site"],
    ["Bankwide oversight","Site split by nonsovereign projects","mapping",
     "Same mapping list, project type column","As above, the same single column serves both"],

    /* ---- 2 Risk and compliance ---- */
    ["Risk and compliance","Active sites","usage",
     "Graph site analytics, allTime and lastSevenDays actorCount per site","Build the usage feed"],
    ["Risk and compliance","Inactive sites over 300 days","usage",
     "Last activity date per site, from the usage feed","Build the usage feed. The 300 day threshold is a reporting choice, not a data limit"],
    ["Risk and compliance","Orphaned sites","app",
     "Site owner resolved against Entra ID","App detection plus an Entra ID lookup"],
    ["Risk and compliance","New sites created","app",
     "GET /sites?search=* returns createdDateTime alongside webUrl and displayName","App detection only, to restrict the count to compliant sites. Watch for restored sites, one test site reported a created date ten days after its last modified date"],
    ["Risk and compliance","Sites archived","app",
     "Site lifecycle state from AvePoint Cloud Governance or the SharePoint admin centre","Confirm which system records archiving. This is not in the EDRMS database"],
    ["Risk and compliance","Site activity trend by month","usage",
     "Monthly M365 usage export, retained month on month","Build the usage feed and keep history. The exports are point in time, so history only starts when collection starts"],
    ["Risk and compliance","Active libraries, 90 or 180 days","usage",
     "Per library last activity, from the usage feed","Build the usage feed. Library level usage is a different export from site level"],
    ["Risk and compliance","Most used libraries, views plus downloads plus uploads plus edits","usage",
     "M365 usage reports, per library interaction counts","Build the usage feed. Confirm the four interaction types are all available per library, not only per site"],
    ["Risk and compliance","Largest libraries by record volume","ready",
     "public.Records grouped by ListId","Nothing. ListId matches the SharePoint list GUID, verified in the test tenant"],
    ["Risk and compliance","Largest libraries by storage","scan",
     "Sum of file size per ListId, from the scan","Build the scan. Graph returns size on every file unprompted, verified from 1,506 bytes to 2.3 MB"],
    ["Risk and compliance","Library growth rate","ready",
     "Records created in period over records at period start, from public.Records CreatedDate","Nothing"],
    ["Risk and compliance","Inactive libraries, 90 or 180 days","usage",
     "Inverse of the active library query","Build the usage feed"],
    ["Risk and compliance","Orphaned libraries, without owners","app",
     "Library owner resolved against Entra ID","An owner lookup per library. Not currently collected anywhere"],
    ["Risk and compliance","Libraries with no declared records","ready",
     "Library inventory minus the distinct ListId values in public.Records","Needs a full library inventory to subtract from, which comes with the scan"],
    ["Risk and compliance","Libraries without retention label mapping","manual",
     "The Retention Label Mapping list","Nothing new. The list already exists and already gates declaration, proved by No mapping library1 in the test tenant"],
    ["Risk and compliance","Physical records overdue for transfer","opus",
     "Opus, transfer schedule against actual transfer date","Connect Opus. Nothing in SharePoint or the EDRMS database holds this"],

    /* ---- 3 Department insight ---- */
    ["Department insight","Go live date per department","manual",
     "Records management programme records","A maintained list. One row per department, about 15 rows"],
    ["Department insight","List of site owners","app",
     "Site owner from the site inventory, resolved against Entra ID","App detection plus an owner lookup. Recommend reporting the departmental records focal mailbox rather than 1,057 individual owners"],
    ["Department insight","Total number of sites per department","mapping",
     "Site to department mapping list","The mapping list"],
    ["Department insight","Users per site","usage",
     "Site level active user count over site count","Build the usage feed"],
    ["Department insight","Visitors per site","usage",
     "Graph /sites/{id}/analytics/allTime returns actorCount, verified at actionCount 5535, actorCount 12","Build the usage feed. Only allTime and lastSevenDays windows exist, there is no 30 or 90 day unique viewer figure"],
    ["Department insight","Libraries per site","scan",
     "Library inventory grouped by site","Build the scan, which enumerates libraries as it goes"],
    ["Department insight","Total documents per department","scan",
     "Scan output joined to the site to department mapping","Both the scan and the mapping list"],
    ["Department insight","Total declared records per department","mapping",
     "public.Records joined to the mapping list through the site","The mapping list only. The record data is already there"],
    ["Department insight","Physical records registered per department","mapping",
     "public.Records HasPhysical, joined through the mapping list","The mapping list"],
    ["Department insight","Declaration rate per department","mapping",
     "Department records over department documents","The scan and the mapping list"],
    ["Department insight","Active users per department","mapping",
     "Usage feed joined through the mapping list","The usage feed and the mapping list"],
    ["Department insight","Storage consumed per department","mapping",
     "M365 storage per site, summed through the mapping list","The usage feed and the mapping list. Storage is reported per site, not per file"],
    ["Department insight","Libraries usage, name, users, documents, records, physical","scan",
     "Scan output joined to public.Records on ListId plus ItemId","The scan. The join key is verified"],
    ["Department insight","Disposal summary, inactive documents over 1 year","scan",
     "Last modified date per file, from the scan","The scan"],
    ["Department insight","Disposal summary, records due for disposal","ready",
     "Due date for disposal, which is retention label applied plus duration","Nothing. The formula was confirmed from the live calculated column"],
    ["Department insight","Disposal summary, next due date for disposal","ready",
     "Minimum future due date per library","Nothing"],
    ["Department insight","Conventions, link, approval date, version","manual",
     "The convention document itself","A four field reference list, updated when the convention is reissued"],
    ["Department insight","Programme dates, audit, review, training, CoP","manual",
     "Records management programme calendar","A short maintained list. Nothing generates these"],

    /* ---- 4 File plan ---- */
    ["File plan insights","Total terms","termstore",
     "SharePoint managed metadata term store, file plan term set","Read access to the term store, and agreement on which term set is the institutional file plan"],
    ["File plan insights","Administration terms","termstore","Term store, count of terms under the branch","As above"],
    ["File plan insights","People management terms","termstore","Term store, count of terms under the branch","As above"],
    ["File plan insights","Program and operation terms","termstore","Term store, count of terms under the branch","As above"],
    ["File plan insights","Compliance and oversight terms","termstore","Term store, count of terms under the branch","As above"],
    ["File plan insights","Risk management terms","termstore","Term store, count of terms under the branch","As above"],

    /* ---- 5 Records management ---- */
    ["Records management","Total declared records","ready","public.Records, distinct ListId plus ItemId","Nothing"],
    ["Records management","Records declared this month","ready","public.Records, CreatedDate within the month","Nothing. CreatedDate on this table is the declaration date"],
    ["Records management","Records declared by department","mapping","public.Records joined through the mapping list","The mapping list"],
    ["Records management","Records declared by year","ready","public.Records grouped by year of CreatedDate","Nothing"],
    ["Records management","Records declared by classification","ready","public.Records, classification column from ADBMeta","Confirm the classification column is populated. ADBMeta is empty for department, so check this key separately"],
    ["Records management","Records declared by business process","termstore","Record file plan term, resolved to its top level branch","Term store read access, and the file plan term populated on records"],
    ["Records management","Declaration rate","scan","Records over documents","The scan, plus a ruling on the denominator"],
    ["Records management","Libraries with highest declaration rates","scan","Records per ListId over documents per ListId","The scan"],
    ["Records management","Libraries with no declared records","ready","Library inventory minus distinct ListId in public.Records","The library inventory, which comes with the scan"],
    ["Records management","Total duplicated records, same filenames","scan","Scan output, group by filename within ListId having count over one","The scan"],
    ["Records management","Orphaned records","ready","public.Records rows whose ListId no longer resolves to a live library","Nothing, once the library inventory exists to check against"],

    /* ---- 6 Records and archives holdings ---- */
    ["Archives holdings","Total physical files","opus","Opus inventory","Connect Opus"],
    ["Archives holdings","Total legacy records","opus","Opus, records registered before departmental go live","Connect Opus, and agree the legacy cut off per department"],
    ["Archives holdings","Total boxes","opus","Opus container inventory","Connect Opus"],
    ["Archives holdings","Total storage locations","opus","Opus facility list","Connect Opus"],
    ["Archives holdings","Records by office location","opus","Opus, location attribute","Connect Opus"],
    ["Archives holdings","Records by storage facility","opus","Opus, facility attribute","Connect Opus"],
    ["Archives holdings","Records awaiting transfer","opus","Opus, transfer status","Connect Opus"],
    ["Archives holdings","Unverified physical files","opus","Opus, last verification date is null or older than the cycle","Connect Opus, and agree the verification cycle length"],
    ["Archives holdings","Missing files","opus","Opus, status of missing at last verification","Connect Opus"],
    ["Archives holdings","Files due for inventory verification","opus","Opus, verification date plus cycle","Connect Opus"],
    ["Archives holdings","Files scheduled for transfer","opus","Opus, transfer schedule","Connect Opus"],
    ["Archives holdings","HQ storage, field offices, offsite, records center","opus","Opus, facility grouped by location type","Connect Opus"],

    /* ---- 7 Format and storage ---- */
    ["Format and storage","Declared records by format, eight groups","scan",
     "File extension from the scan, mapped to a format group","The scan, plus the extension to format group rule. Without that rule the eight groups have no definition"],
    ["Format and storage","Number of files by format","scan","Scan output grouped by format group","The scan and the mapping rule"],
    ["Format and storage","Storage consumed by format","scan","Sum of file size by format group","The scan. Graph returns size on every file"],

    /* ---- 8 Retention and disposition ---- */
    ["Retention and disposition","Records due for disposition","ready","Due date for disposal in the past or near future","Nothing"],
    ["Retention and disposition","Records due within 30 days","ready","Due date for disposal within 30 days","Nothing"],
    ["Retention and disposition","Records due within 90 days","ready","Due date for disposal within 90 days","Nothing"],
    ["Retention and disposition","Records awaiting approval","ready","Disposition status column","Confirm the disposition status column is populated. It exists in the design"],
    ["Retention and disposition","Disposition completed","ready","Disposition status of completed, within the period","As above"],
    ["Retention and disposition","Disposition backlog","ready","Approved but not actioned","As above"],
    ["Retention and disposition","Records with retention schedules","ready","Retention label applied is not null","Nothing"],
    ["Retention and disposition","Records without retention schedules","ready","Retention label applied is null","Nothing"],
    ["Retention and disposition","Libraries without mapped retention schedules","manual","The Retention Label Mapping list, compared to the library inventory","The library inventory. The mapping list already exists"],
    ["Retention and disposition","Overdue dispositions","ready","Due date for disposal in the past and not disposed","Nothing"],
    ["Retention and disposition","Records beyond retention periods","ready","Retention applied plus duration passed, record still present","Nothing"],
    ["Retention and disposition","Disposition approval backlog","ready","Disposition status of awaiting approval","Confirm the status column is populated"],

    /* ---- 9 Security and classification ---- */
    ["Security and classification","Restricted records","ready","Classification column, value of restricted","Confirm the classification column is populated"],
    ["Security and classification","Confidential records","ready","Classification column, value of confidential","As above"],
    ["Security and classification","Access requests","purview","Unified audit log, access request events","Purview audit log access, and a retention window long enough to report on"],
    ["Security and classification","External sharing instances","purview","Unified audit log, sharing events with an external target","Purview audit log access. Note these are links, not people"],
    ["Security and classification","Permission exceptions","purview","Unified audit log, permission change and broken inheritance events","Purview audit log access"],
    ["Security and classification","Records with sensitivity labels","purview","Purview label activity, or the label column on the file","Purview access. A sensitivity label is not the same field as the EDRMS classification level"],
    ["Security and classification","Records without sensitivity labels","purview","Inverse of the above","As above"],
    ["Security and classification","Records by classification level","ready","Classification column grouped","Confirm the column is populated"],

    /* ---- 10 Search and usage ---- */
    ["Search and usage","Searches performed","usage","SharePoint search usage reports","Search analytics access. This is a separate report from site usage"],
    ["Search and usage","Successful searches","usage","Search usage reports, searches with a click through","Search analytics access, and agreement that click through is the definition of success"],
    ["Search and usage","Frequently searched record categories","usage","Top query report, mapped to categories","Search analytics access, plus a query to category mapping which does not exist yet"],
    ["Search and usage","Records accessed per month","usage","M365 usage reports, file activity per month","Build the usage feed and keep history"],
    ["Search and usage","Most viewed records","usage","Per item view counts","Confirm item level analytics are available. Site and library level are, item level needs checking"],
    ["Search and usage","Most downloaded records","usage","Per item download counts","As above"],
    ["Search and usage","Most accessed libraries","usage","Per library interaction counts","Build the usage feed"]
  ];

  const ROWS = MAP.map(m => ({section:m[0], metric:m[1], tier:m[2], source:m[3], needed:m[4]}));

  function counts(){
    const c = {};
    Object.keys(TIERS).forEach(t => c[t] = 0);
    ROWS.forEach(r => c[r.tier]++);
    return c;
  }

  function summaryBody(){
    const c = counts();
    const order = ["ready","scan","usage","mapping","app","termstore","manual","purview","opus"];
    return barList(order.map(t => ({
      label:TIERS[t].label, sub:TIERS[t].src, value:c[t],
      color:{ready:"var(--green)", scan:"var(--blue)", usage:"var(--teal)", mapping:"var(--amber)",
             app:"var(--orange)", termstore:"var(--deepblue)", manual:"var(--greyblue)",
             purview:"var(--purple)", opus:"var(--red)"}[t]
    })), {showShare:true}) +
    note(`<b>Read the tiers as a build order, not as a scorecard.</b>
      <b>Ready today</b> needs a query and nothing else.
      <b>Document scan</b> and <b>usage feed</b> are two jobs somebody has to write, and between them they unlock more of this report than anything else on the list.
      <b>Site mapping</b> is one spreadsheet of about 1,057 rows and is the single largest blocker: the SharePoint column ADBDepartmentOwner exists and is empty on every row, so no amount of database work reaches it.
      <b>App detection</b> is a five minute conversation with whoever deployed the EDRMS app, not a decision anybody has to make.
      <b>Purview</b> and <b>Opus</b> are separate systems with separate owners, and should be planned as separate phases rather than treated as missing data.`);
  }

  function tableBody(){
    const rows = sortBy(filter === "all" ? ROWS : ROWS.filter(r => r.tier === filter), dsSort, dsDir);
    return `<div class="toolbar">
        <span class="ctl">Show
          <select id="ds-filter">
            <option value="all" ${filter === "all" ? "selected" : ""}>All ${ROWS.length} metrics</option>
            ${Object.keys(TIERS).map(t =>
              `<option value="${t}" ${filter === t ? "selected" : ""}>${TIERS[t].label} (${counts()[t]})</option>`).join("")}
          </select>
        </span>
        <span class="ctl">Click a column heading to sort</span>
      </div>
      ${table([
        {k:"section", t:"Dashboard"},
        {k:"metric", t:"Metric as written in the requirement", cell:r => `<b>${r.metric}</b>`},
        {k:"tier", t:"Tier", cell:r => chip(r.tier)},
        {k:"source", t:"Where it comes from in the tenant"},
        {k:"needed", t:"What has to happen first"}
      ], rows, {sortable:true, sort:dsSort, dir:dsDir})}`;
  }

  const html = `<section class="dash-ds">
    ${band("Data sources and feasibility", `Every metric named in the 2026.4 requirement, mapped to the thing in the tenant that would actually produce it. ${MAP.length} metrics across ${new Set(MAP.map(m => m[0])).size} dashboards. The chips used here are the same chips that appear on every panel in the suite, so a number on a dashboard and its entry in this table can never say different things.`)}
    <div id="ds-sum"></div>
    <div id="ds-tab"></div>
    <div id="ds-asks"></div>
  </section>`;

  function init(){
    document.getElementById("ds-sum").outerHTML = panel({
      id:"ds-sum",
      title:"What is buildable, and what is waiting",
      sub:"The " + ROWS.length + " metrics grouped by what has to happen before each one is real.",
      tier:"ready", body:summaryBody()
    });
    renderTab();
    document.getElementById("ds-asks").outerHTML = panel({
      id:"ds-asks",
      title:"The asks, in the order they unblock the most",
      sub:"Four requests and two build jobs cover almost everything on this page.",
      tier:"manual",
      body: table([
        {k:"n", t:"#", num:true},
        {k:"ask", t:"Ask", cell:r => `<b>${r.ask}</b><small>${r.who}</small>`},
        {k:"unlocks", t:"Metrics unblocked", num:true, fmt:F},
        {k:"effort", t:"Effort", cell:r => `<span class="pill ${r.cls}">${r.effort}</span>`}
      ], [
        {n:1, ask:"Build the Microsoft Graph document scan", who:"Development team",
         unlocks:counts().scan, effort:"One job, filter to files only", cls:"info"},
        {n:2, ask:"Build the Microsoft 365 usage feed", who:"Development team",
         unlocks:counts().usage, effort:"Smaller job, filter Is Deleted", cls:"info"},
        {n:3, ask:"Produce the site to department mapping list", who:"RAC, with AvePoint Cloud Governance checked first",
         unlocks:counts().mapping, effort:"About 1,057 rows, or 100 rows for the shortcut", cls:"warn"},
        {n:4, ask:"Confirm how to detect the EDRMS app per site", who:"Whoever deployed the app",
         unlocks:counts().app, effort:"A conversation, not a decision", cls:"ok"},
        {n:5, ask:"Grant read access to the managed metadata term store", who:"ITD",
         unlocks:counts().termstore, effort:"Permission and a term set name", cls:"ok"},
        {n:6, ask:"Grant Purview audit log access", who:"Information security",
         unlocks:counts().purview, effort:"Separate owner, plan as a phase", cls:"warn"},
        {n:7, ask:"Connect Opus", who:"Records and archives",
         unlocks:counts().opus, effort:"Separate system, plan as a phase", cls:"bad"},
        {n:8, ask:"Maintain the reference lists", who:"RAC secretariat",
         unlocks:counts().manual, effort:"Conventions, programme dates, go live dates", cls:"ok"}
      ]) +
      note(`<b>The shortcut on the mapping list is worth taking.</b> Only a minority of sites hold any documents at all. Filling the top 100 by document count and marking the rest as unassigned turns a day of data entry into an hour, and every department figure in this report becomes meaningful immediately rather than at the end of the exercise. The question that decides whether this works at all is whether it is acceptable that every document in a departmental site counts as that department. The drilldown already assumes yes; get that confirmed in writing.`)
    });
  }

  function renderTab(){
    document.getElementById("ds-tab").outerHTML = panel({
      id:"ds-tab",
      title:"Metric by metric",
      sub:"The requirement on the left, the tenant on the right.",
      tier:"ready", body:tableBody()
    });
    const sel = document.getElementById("ds-filter");
    if (sel) sel.onchange = () => { filter = sel.value; renderTab(); };
    wireSort("#ds-tab", k => {
      if (dsSort === k) dsDir = dsDir === "desc" ? "asc" : "desc"; else { dsSort = k; dsDir = "asc"; }
      renderTab();
    });
  }

  return {
    ver:"Data sources",
    crumb:"Data sources and feasibility",
    asof:"Mapping current at 10 Aug 2026",
    html, init
  };
})();
