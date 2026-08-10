/* ===================================================================
   Department insight (Department Performance)

   Spec: 2026.4 Reports Utilization, section 3.
     By Department
       Departmental overview   go live date, site owners,
                               sites per department, users / visitors /
                               libraries per site
       Departmental drilldown  documents, declared records, physical
                               records registered, declaration rate,
                               active users, storage consumed,
                               libraries usage, disposal summary
       Conventions             link, date of approval, version, updated
       Programme dates         CSIS-IR audit, convention review,
                               refresher training, focals CoP

   Note on division: the 2026.4 requirement does not ask for division
   anywhere, so the drill is Department to Site to Library and the
   division level present in the earlier report has been removed.
   =================================================================== */
DASHBOARDS.di = (function(){
  let dept = DEPTS[0].code;
  let ovSort = "sites", ovDir = "desc", ovPage = 1;

  const D = () => DEPTS.find(d => d.code === dept);

  /* Disposal figures are derived from the library rows on a fixed rule so
     they always move together with the record counts they come from:
     inactive documents are the documents untouched for over a year, and
     records due for disposal are those whose retention has run out. */
  function disposalRows(code){
    return LIBS.filter(l => l.dept === code).map((l, i) => ({
      name:l.name, site:l.site,
      inactiveDocs:Math.round(l.docs * 0.18),
      dueForDisposal:Math.round(l.records * 0.067),
      nextDue:nextDueDate(i, l)
    }));
  }
  function nextDueDate(i, l){
    /* Deterministic sample date, spread across the coming year. */
    const base = new Date(2026, 7, 24);
    base.setDate(base.getDate() + ((l.records % 11) + i * 23) % 340 + 12);
    return base.toISOString().slice(0, 10);
  }

  /* ---------- departmental overview ---------- */
  function overviewTable(){
    const rows = sortBy(DEPTS, ovSort, ovDir);
    const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    if (ovPage > pages) ovPage = pages;
    const page = rows.slice((ovPage - 1) * PAGE_SIZE, ovPage * PAGE_SIZE);
    return table([
      {k:"code", t:"Department", cell:r => `<b>${r.code}</b><small>${r.name}</small>`},
      {k:"goLive", t:"Go live date"},
      {k:"owner", t:"Records focal / site owner contact"},
      {k:"sites", t:"Sites", num:true, fmt:F},
      {k:"usersPerSite", t:"Users per site", num:true, cell:r => F1(r.usersPerSite)},
      {k:"visitorsPerSite", t:"Visitors per site", num:true, cell:r => F1(r.visitorsPerSite)},
      {k:"libsPerSite", t:"Libraries per site", num:true, cell:r => F1(r.libsPerSite)}
    ], page, {sortable:true, sort:ovSort, dir:ovDir}) +
    `<div id="di-ovpager">${pager(rows.length, ovPage, pages, "departments")}</div>` +
    note(`<b>Site owners are shown as the departmental records focal mailbox, not as a list of individual staff.</b> A department averages ${F1(T.sites / DEPTS.length)} sites, so an individual owner list runs to over a thousand rows and goes stale the moment somebody moves post. The per site owner is on the site itself; this column is the accountable contact for the department.`);
  }

  /* ---------- drilldown ---------- */
  function drilldown(){
    const d = D();
    const libs = LIBS.filter(l => l.dept === dept);
    return `<div class="drill">
        <a data-jump="all">All departments</a><span class="arw">&rsaquo;</span>
        <span class="cur">${d.code}, ${d.name}</span>
      </div>
      <div class="toolbar">
        <span class="ctl">Department
          <select id="di-dept">${DEPTS.map(x =>
            `<option value="${x.code}" ${x.code === dept ? "selected" : ""}>${x.code}, ${x.name}</option>`).join("")}</select>
        </span>
        <span class="ctl">Go live ${d.goLive}</span>
      </div>
      ${kpis([
        {lab:"Total documents", val:F(d.docs), tier:"scan"},
        {lab:"Total declared records", val:F(d.records), tier:"ready"},
        {lab:"Physical records registered", val:F(d.physical), tier:"ready"},
        {lab:"Declaration rate", val:F1(d.rate) + "%", tier:"scan"},
        {lab:"Active users", val:F(d.users), tier:"usage"},
        {lab:"Storage consumed", val:GB(d.storageGB), tier:"usage", small:true}
      ])}
      <div class="ptitle" style="margin-top:6px">Libraries usage</div>
      <div class="psub" style="margin-bottom:12px">Every library in ${d.code}, with its users, documents, declared records and the declared records that have a physical counterpart.</div>
      ${libs.length ? table([
        {k:"name", t:"Library name", cell:r => `<b>${r.name}</b><small>${r.site}</small>`},
        {k:"users", t:"No. of users", num:true, fmt:F},
        {k:"docs", t:"No. of documents", num:true, fmt:F},
        {k:"records", t:"No. of records declared", num:true, fmt:F},
        {k:"physical", t:"With physical counterpart", num:true, fmt:F},
        {k:"rate", t:"Declaration rate", num:true, cell:r => F1(r.rate) + "%"}
      ], sortBy(libs, "docs", "desc")) : `<p class="muted">No sample libraries carried for this department.</p>`}
      ${libs.length ? `
      <div class="ptitle" style="margin-top:24px">Disposal summary</div>
      <div class="psub" style="margin-bottom:12px">What is coming up for disposal in ${d.code}, by library. Inactive documents are those untouched for over a year; records due for disposal are those whose retention period has expired.</div>
      ${table([
        {k:"name", t:"Library name", cell:r => `<b>${r.name}</b><small>${r.site}</small>`},
        {k:"inactiveDocs", t:"Inactive documents over 1 year", num:true, fmt:F},
        {k:"dueForDisposal", t:"Records due for disposal", num:true, fmt:F},
        {k:"nextDue", t:"Next due date for disposal"}
      ], sortBy(disposalRows(dept), "dueForDisposal", "desc"))}` : ""}
      ${note(`<b>Storage is measured per site, not per document.</b> Microsoft reports storage at site level, so a departmental storage figure is the sum of that department's sites. Per library storage in the table above comes from the file scan and is only as complete as the scan, which must filter to files only: folders are returned with a cumulative size and summing them double counts.`)}`;
  }

  /* ---------- conventions and programme dates ---------- */
  function conventionsPanel(){
    return panel({
      id:"di-conv",
      title:"Conventions",
      sub:"The approved naming, filing and declaration convention that departments are measured against.",
      tier:"manual",
      body:`<dl class="deflist">
        <dt>Document</dt><dd>${CONVENTIONS.title}<small>Owned by ${CONVENTIONS.owner}</small></dd>
        <dt>Link</dt><dd><a class="ext" href="${CONVENTIONS.link}" target="_blank" rel="noopener">${CONVENTIONS.link}</a></dd>
        <dt>Date of approval</dt><dd>${CONVENTIONS.approved}</dd>
        <dt>Version number</dt><dd>Version ${CONVENTIONS.version}<small>Last updated ${CONVENTIONS.updated}</small></dd>
      </dl>`
    });
  }
  function programmePanel(){
    return panel({
      id:"di-prog",
      title:"Records management programme dates",
      sub:"The fixed dates in the records management calendar. Held as a maintained list, because none of these exist in any system.",
      tier:"manual",
      body: table([
        {k:"label", t:"Milestone", cell:r => `<b>${r.label}</b><small>${r.note}</small>`},
        {k:"date", t:"Date"},
        {k:"status", t:"Status", cell:r => {
          const c = r.status === "Due" ? "bad" : r.status === "Due soon" ? "warn" : "info";
          return `<span class="pill ${c}">${r.status}</span>`;
        }}
      ], PROGRAMME_DATES)
    });
  }

  const html = `<section class="dash-di">
    ${band("Department insight", `Departmental performance in two layers: an overview that compares all ${DEPTS.length} departments on the same measures, and a drilldown into one department covering its documents, records, users, storage, library usage and disposal position. The conventions and programme dates that departments are held to sit at the foot of the page.`)}
    <div id="di-ov"></div>
    <div id="di-drill"></div>
    <div class="prow"><div id="di-conv"></div><div id="di-prog"></div></div>
  </section>`;

  function init(){ renderOv(); renderDrill(); renderRef(); }

  function renderOv(){
    document.getElementById("di-ov").outerHTML = panel({
      id:"di-ov",
      title:"Departmental overview",
      sub:"Go live date, accountable contact, and the density measures that say whether a department's sites are being used or merely exist.",
      tier:"mapping",
      body: overviewTable()
    });
    wireSort("#di-ov", k => {
      if (ovSort === k) ovDir = ovDir === "desc" ? "asc" : "desc"; else { ovSort = k; ovDir = "desc"; }
      ovPage = 1; renderOv();
    });
    wirePager("#di-ov", v => {
      const pages = Math.max(1, Math.ceil(DEPTS.length / PAGE_SIZE));
      ovPage = v === "prev" ? Math.max(1, ovPage - 1) : v === "next" ? Math.min(pages, ovPage + 1) : +v;
      renderOv();
    });
  }

  function renderDrill(){
    document.getElementById("di-drill").outerHTML = panel({
      id:"di-drill",
      title:"Departmental drilldown from bankwide sites and libraries",
      sub:"One department at a time. Every figure here rolls up to the matching figure on the Bankwide oversight dashboard.",
      tier:"mapping",
      body: drilldown()
    });
    const sel = document.getElementById("di-dept");
    if (sel) sel.onchange = () => { dept = sel.value; renderDrill(); };
    document.querySelectorAll("#di-drill [data-jump]").forEach(a => a.onclick = () => {
      document.getElementById("di-ov").scrollIntoView({behavior:"smooth", block:"start"});
    });
  }

  function renderRef(){
    document.getElementById("di-conv").outerHTML = conventionsPanel();
    document.getElementById("di-prog").outerHTML = programmePanel();
  }

  return {
    ver:"Department insight",
    crumb:"Department insight (Department Performance)",
    asof:ASOF.edrms + " | " + ASOF.m365,
    html, init
  };
})();
