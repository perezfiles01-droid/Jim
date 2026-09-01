/* ===================================================================
   Bankwide oversight (Impact Statistics / Executive Summary)

   Spec: 2026.4 Reports Utilization, section 1.
     Total Records
       Total documents in EDRMS SharePoint compliant sites
         Percentage of documents declared as records
         Total declared records vs declared physical records registered
       Total declared records
       Total number of EDRMS Users (monthly active users)
       Active / Inactive / Orphaned EDRMS compliant sites
         By Department, Field Office
         By Sovereign projects
         By Nonsovereign projects
   =================================================================== */
DASHBOARDS.bo = (function(){
  let grouping = "dept";   /* dept | field | project */

  function statusRows(){
    if (grouping === "dept")
      return DEPTS.map(d => ({label:d.code, sub:d.name, a:d.sitesActive, b:d.sitesInactive, c:d.sitesOrphaned, total:d.sites}));
    if (grouping === "field")
      return FIELD.map(f => ({label:f.code, sub:f.name, a:f.active, b:f.inactive, c:f.orphaned, total:f.sites}));
    return PROJECT_SPLIT.map(p => ({label:p.label, sub:p.note, a:p.active, b:p.inactive, c:p.orphaned, total:p.sites}));
  }

  function statusPanel(){
    const rows = statusRows().slice().sort((x, y) => y.total - x.total);
    const max = Math.max(...rows.map(r => r.total));
    const body = rows.map(r => `
      <div class="sb">
        <div class="slab"><b>${r.label}</b><small>${r.sub}</small></div>
        <div class="strack">
          <div class="sseg" style="width:${(r.a / max * 100).toFixed(1)}%;background:var(--green)"></div>
          <div class="sseg" style="width:${(r.b / max * 100).toFixed(1)}%;background:var(--amber)"></div>
          <div class="sseg" style="width:${(r.c / max * 100).toFixed(1)}%;background:var(--red)"></div>
        </div>
        <div class="sval"><b>${F(r.total)}</b> <span>sites</span></div>
      </div>`).join("");
    return legend([
      {c:"var(--green)", l:"Active"},
      {c:"var(--amber)", l:"Inactive, no activity in over 90 days"},
      {c:"var(--red)",   l:"Orphaned, no owner resolves"}
    ]) + body;
  }

  const html = `<section class="dash-bo">
    ${band("Bankwide oversight", `Impact statistics for the whole bank on one screen: how much information the EDRMS holds, how much of it has been declared as a record, who is using it, and whether the compliant sites behind those numbers are still alive. Every figure below is the sum of the department rows on the Department insight dashboard, so the two can never disagree.`)}

    <div id="bo-kpis"></div>

    <div class="prow">
      <div id="bo-declared"></div>
      <div id="bo-physical"></div>
    </div>

    <div id="bo-sites"></div>
  </section>`;

  function init(){
    /* ---- KPI row ---- */
    document.getElementById("bo-kpis").innerHTML = kpis([
      {lab:"Total documents in EDRMS compliant sites", val:F(T.docs), tier:"scan",
       sub:"Total information assets managed"},
      {lab:"Total declared records", val:F(T.records), tier:"ready",
       sub:"Distinct SharePoint items declared"},
      {lab:"Percentage of documents declared as records", val:PCTS(T.records, T.docs), tier:"scan",
       sub:F(T.records) + " of " + F(T.docs)},
      {lab:"Total number of EDRMS users", val:F(T.users), tier:"usage",
       sub:"Monthly active users"},
      {lab:"EDRMS compliant sites", val:F(T.sites), tier:"app",
       sub:F(T.sitesActive) + " active, " + F(T.sitesInactive + T.sitesOrphaned) + " not"}
    ]);

    /* ---- declared vs documents ---- */
    document.getElementById("bo-declared").outerHTML = panel({
      id:"bo-declared",
      title:"Documents declared as records",
      sub:"The declaration rate is the single number that says whether the EDRMS is being used as a records system or as a file share.",
      tier:"scan",
      body: donut([
        {label:"Declared as records", value:T.records, color:"var(--blue)"},
        {label:"Not declared", value:T.docs - T.records, color:"var(--greyblue)"}
      ], {centre:PCTS(T.records, T.docs), centreLabel:"declared"}) +
      callout(`<b>Denominator warning.</b> The document count comes from the Microsoft Graph file scan, not from the records database, which holds declared records only. Documents sitting in libraries with no retention label mapping cannot be declared at all, so counting them here caps the rate below 100 per cent permanently. Decide whether they belong in the denominator before this figure is published.`)
    });

    /* ---- declared vs physical ---- */
    document.getElementById("bo-physical").outerHTML = panel({
      id:"bo-physical",
      title:"Total declared records vs declared physical records registered",
      sub:"How many declared records have a registered physical counterpart. A low share is expected; a falling share means physical registration is drifting behind digital declaration.",
      tier:"ready",
      body: tiles([
        {tl:"Total declared records", tv:F(T.records), cls:"hi"},
        {tl:"With physical counterpart", tv:F(T.physical)},
        {tl:"Share with physical", tv:PCTS(T.physical, T.records)}
      ]) +
      legend([{c:"var(--blue)", l:"Declared records"}, {c:"var(--teal)", l:"Declared physical records registered"}]) +
      barList([
        {label:"Declared records", value:T.records, color:"var(--blue)"},
        {label:"Physical counterpart", value:T.physical, color:"var(--teal)"}
      ], {max:T.records, narrow:true})
    });

    /* ---- site status ---- */
    document.getElementById("bo-sites").outerHTML = panel({
      id:"bo-sites",
      title:"Active, inactive and orphaned EDRMS compliant sites",
      sub:"The same " + F(T.sites) + " compliant sites, grouped three ways. A site is compliant when the EDRMS app that carries the Declare as Record button is installed on it.",
      tier:"app",
      body:`<div class="toolbar">
          ${segctl([
            {k:"dept",    t:"By department"},
            {k:"field",   t:"By field office"},
            {k:"project", t:"By project type"}
          ], grouping)}
          <span class="ctl">Grouping changes the split, not the total</span>
        </div>
        <div id="bo-status">${statusPanel()}</div>
        ${note(`<b>Orphaned is a stricter test than inactive.</b> Inactive means no user activity in over 90 days. Orphaned means no site owner resolves to a current staff account, which is a governance failure rather than a usage one. A site can be both, and where it is, it is counted as orphaned only, so the three segments still add to ${F(T.sites)}.`)}`
    });
    wireSeg("#bo-sites", k => {
      grouping = k;
      document.getElementById("bo-status").innerHTML = statusPanel();
      document.querySelectorAll("#bo-sites button[data-seg]").forEach(b => b.classList.toggle("on", b.dataset.seg === k));
    });
  }

  return {
    ver:"Bankwide oversight",
    crumb:"Bankwide oversight",
    asof:ASOF.edrms + " | " + ASOF.m365,
    html, init
  };
})();
