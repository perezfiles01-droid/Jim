/* ===================================================================
   Search and Usage Analytics

   Spec: 2026.4 Reports Utilization, section 10.
     Information Retrieval  searches performed, successful searches,
                            frequently searched record categories,
                            records accessed per month
     Top Content            most viewed records, most downloaded
                            records, most accessed libraries
   =================================================================== */
DASHBOARDS.su = (function(){
  let topBy = "views";   /* views | downloads */

  function retrievalBody(){
    return tiles([
      {tl:"Searches performed", tv:F(SEARCH.performed), tn:"Last 30 days", cls:"hi"},
      {tl:"Successful searches", tv:F(SEARCH.successful), tn:"Search led to a click through"},
      {tl:"Search success rate", tv:F1(SEARCH.successRate) + "%"},
      {tl:"Searches with no click", tv:F(SEARCH.failed), tn:"Result set returned, nothing opened", cls:"warn"}
    ]) +
    donut([
      {label:"Successful, a result was opened", value:SEARCH.successful, color:"var(--green)"},
      {label:"Abandoned, nothing opened", value:SEARCH.failed, color:"var(--amber)"}
    ], {centre:F1(SEARCH.successRate) + "%", centreLabel:"success"}) +
    `<div class="ptitle" style="margin-top:22px">Frequently searched record categories</div>
     <div class="psub" style="margin-bottom:12px">What people are looking for. A category high on this list but low on the top content list is a findability problem, not a demand problem.</div>` +
    barList(SEARCH_CATEGORIES.map(c => ({label:c.label, value:c.value})), {showShare:true}) +
    `<div class="ptitle" style="margin-top:24px">Records accessed per month</div>
     <div class="psub" style="margin-bottom:12px">Distinct declared records opened in the month. The August column is a partial month.</div>` +
    trend(MONTHS.map((m, i) => ({x:m, y:RECORDS_ACCESSED[i]})), {c1:"var(--blue)", height:210}) +
    note(`<b>Successful is defined here as a search followed by a click through to a result, which is the only definition SharePoint search analytics can actually support.</b> It is not a measure of whether the person found what they wanted. A search that returns the right document at position forty and is abandoned counts as a failure, correctly; a search where somebody opens the wrong document counts as a success, incorrectly. Treat the rate as a trend line, not an absolute.`);
  }

  function topBody(){
    const recs = sortBy(TOP_RECORDS, topBy, "desc");
    const libs = sortBy(LIBS, "activity", "desc").slice(0, 10);
    return `<div class="toolbar">${segctl([
        {k:"views", t:"Most viewed"},
        {k:"downloads", t:"Most downloaded"}
      ], topBy)}<span class="ctl">Last 90 days</span></div>
      ${barList(recs.map(r => ({
        label:r.title, sub:r.lib + ", " + r.site, value:r[topBy],
        right:`<b>${F(r[topBy])}</b> <span>${topBy === "views" ? "views" : "downloads"}</span>`
      })), {color:topBy === "views" ? "var(--blue)" : "var(--teal)"})}
      ${table([
        {k:"title", t:"Record", cell:r => `<b>${r.title}</b><small>${r.lib}, ${r.site}</small>`},
        {k:"views", t:"Views", num:true, fmt:F},
        {k:"downloads", t:"Downloads", num:true, fmt:F},
        {k:"ratio", t:"Downloads per 100 views", num:true, cell:r => F(r.downloads / r.views * 100)}
      ], recs)}
      <div class="ptitle" style="margin-top:24px">Most accessed libraries</div>
      <div class="psub" style="margin-bottom:12px">Ranked by total interactions: views, downloads, uploads and edits combined.</div>
      ${barList(libs.map(l => ({
        label:l.name, sub:l.site + " (" + l.dept + ")", value:l.activity,
        right:`<b>${F(l.activity)}</b>`
      })), {color:"var(--deepblue)"})}
      ${note(`<b>Downloads per 100 views is the column worth reading.</b> A record with heavy views and few downloads is being consulted in place, which is what the EDRMS is for. A record with a download rate near or above its view rate is being pulled out to somebody's desktop, where it stops being a managed record. The staff regulations line on this page is the example: ${F(TOP_RECORDS.find(r => r.title.indexOf("Staff Regulations") === 0).downloads)} downloads against ${F(TOP_RECORDS.find(r => r.title.indexOf("Staff Regulations") === 0).views)} views.`)}`;
  }

  const html = `<section class="dash-su">
    ${band("Search and usage analytics", `Whether people can find what the bank has kept. Declaration numbers say the records went in; these numbers say whether they come back out again. A record nobody can retrieve has been archived, not managed.`)}
    <div id="su-kpis"></div>
    <div id="su-ret"></div>
    <div id="su-top"></div>
  </section>`;

  function init(){
    document.getElementById("su-kpis").innerHTML = kpis([
      {lab:"Searches performed", val:F(SEARCH.performed), tier:"usage", sub:"Last 30 days"},
      {lab:"Successful searches", val:F(SEARCH.successful), tier:"usage", sub:F1(SEARCH.successRate) + "% of searches"},
      {lab:"Records accessed this month", val:F(RECORDS_ACCESSED[RECORDS_ACCESSED.length - 1]), tier:"usage", sub:"August 2026, month to date"},
      {lab:"Most accessed library", val:sortBy(LIBS, "activity", "desc")[0].name, tier:"usage", small:true,
       sub:F(sortBy(LIBS, "activity", "desc")[0].activity) + " interactions"}
    ]);
    document.getElementById("su-ret").outerHTML = panel({
      id:"su-ret",
      title:"Information retrieval",
      sub:"Search volume, search success, and what people are searching for.",
      tier:"usage", body:retrievalBody()
    });
    renderTop();
  }

  function renderTop(){
    document.getElementById("su-top").outerHTML = panel({
      id:"su-top",
      title:"Top content",
      sub:"The records and libraries carrying the most traffic.",
      tier:"usage", body:topBody()
    });
    wireSeg("#su-top", k => { topBy = k; renderTop(); });
  }

  return {
    ver:"Search and usage",
    crumb:"Search and usage analytics",
    asof:ASOF.m365,
    html, init
  };
})();
