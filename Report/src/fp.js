/* ===================================================================
   EDRMS Institutional File Plan insights

   Spec: 2026.4 Reports Utilization, section 4.
     Total terms
       Total Administration terms
       People Management terms
       Program and operation terms
       Compliance and oversight terms
       Risk management terms

   The file plan lives in the SharePoint managed metadata term store,
   which is why this is the only dashboard on the termstore tier.
   =================================================================== */
DASHBOARDS.fp = (function(){

  /* How many declared records are actually filed against each branch of
     the plan. A branch with many terms and few records is a branch that
     was designed and never adopted, which is the insight this page is
     for. Business process on the records side maps one to one onto the
     file plan's top level terms. */
  const USE = FILEPLAN.map(f => {
    const key = f.label.replace(/ terms$/, "").toLowerCase();
    const bp = BUSINESS_PROCESS.find(b => b.label.toLowerCase() === key);
    return {label:f.label.replace(/ terms$/, ""), terms:f.value, records:bp ? bp.value : 0, color:f.color};
  });

  const html = `<section class="dash-fp">
    ${band("EDRMS institutional file plan insights", `The file plan is the bank's classification scheme, held as managed metadata terms. Counting the terms tells you how large the scheme is. Counting the records filed against each branch tells you which parts of it staff actually use, and which branches were designed and then ignored.`)}
    <div id="fp-kpis"></div>
    <div id="fp-split"></div>
    <div id="fp-use"></div>
  </section>`;

  function init(){
    document.getElementById("fp-kpis").innerHTML = kpis(
      [{lab:"Total terms", val:F(FILEPLAN_TOTAL), tier:"termstore", sub:"Across all branches of the file plan"}]
      .concat(FILEPLAN.map(f => ({lab:"Total " + f.label.toLowerCase(), val:F(f.value), tier:"termstore",
        sub:PCTS(f.value, FILEPLAN_TOTAL) + " of the plan"})))
    );

    document.getElementById("fp-split").outerHTML = panel({
      id:"fp-split",
      title:"File plan composition",
      sub:"How the " + F(FILEPLAN_TOTAL) + " terms are distributed across the five top level branches.",
      tier:"termstore",
      body: donut(FILEPLAN, {centre:F(FILEPLAN_TOTAL), centreLabel:"terms"})
    });

    document.getElementById("fp-use").outerHTML = panel({
      id:"fp-use",
      title:"File plan adoption, terms against records filed",
      sub:"Terms available in each branch, next to the declared records actually filed against that branch. Records per term is the adoption measure.",
      tier:"termstore",
      body: table([
        {k:"label", t:"Branch"},
        {k:"terms", t:"Terms", num:true, fmt:F},
        {k:"records", t:"Declared records filed", num:true, fmt:F},
        {k:"share", t:"Share of records", num:true, cell:r => PCTS(r.records, T.records)},
        {k:"per", t:"Records per term", num:true, cell:r => F(r.records / r.terms)}
      ], sortBy(USE, "records", "desc")) +
      `<div class="ptitle" style="margin-top:22px">Records filed per branch</div>
       <div class="psub" style="margin-bottom:12px">Bars are declared records. A short bar against a large term count is an unused branch.</div>` +
      barList(sortBy(USE, "records", "desc").map(u => ({
        label:u.label, sub:F(u.terms) + " terms available", value:u.records, color:u.color
      })), {showShare:true}) +
      note(`<b>Term counts and record counts come from different systems.</b> The terms are in the managed metadata term store; the records are in the EDRMS records database. They are joined on the term, so a record filed against a term that was later renamed or deprecated will not appear in either column. Reconcile the two before the adoption ratio is quoted in a paper.`)
    });
  }

  return {
    ver:"File plan insights",
    crumb:"EDRMS institutional file plan insights",
    asof:ASOF.edrms,
    html, init
  };
})();
