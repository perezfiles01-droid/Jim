/* ===================================================================
   Records Management Metrics

   Spec: 2026.4 Reports Utilization, section 5.
     Records Declaration       total declared, declared this month,
                               by department, by year, by classification,
                               by business process
     Declaration Performance   declaration rate, libraries with the
                               highest declaration rates, libraries with
                               no declared records
     Records Quality           duplicated records, orphaned records
   =================================================================== */
DASHBOARDS.rm = (function(){
  let breakdown = "dept";   /* dept | year | classification | process */

  function breakdownBody(){
    if (breakdown === "dept")
      return barList(sortBy(DEPTS, "records", "desc").map(d => ({
        label:d.code, sub:d.name, value:d.records
      })), {showShare:true});

    if (breakdown === "year")
      return trend(RECORDS_BY_YEAR, {c1:"var(--blue)"}) +
        `<div class="ptitle" style="margin-top:22px">Declared within 2026, by month</div>
         <div class="psub" style="margin-bottom:12px">The August column is a partial month and will move.</div>` +
        trend(RECORDS_2026, {c1:"var(--teal)", height:200});

    if (breakdown === "classification")
      return donut(CLASSIFICATION, {centre:F(T.records), centreLabel:"records"}) +
        note(`<b>This is the same split the Security dashboard reports.</b> Restricted and confidential counts are read from one place, so the two dashboards cannot drift.`);

    return barList(BUSINESS_PROCESS.map(b => ({label:b.label, value:b.value})), {showShare:true}) +
      note(`<b>Business process maps onto the top level of the institutional file plan.</b> A record's business process is the branch of the file plan it was filed against, which is why the File plan insights dashboard reports the same five values.`);
  }

  /* Declaration performance across the sample libraries. Libraries with
     no declared records are pulled out separately because a zero rate
     and a low rate are different problems. */
  function performanceBody(){
    const declaring = LIBS.filter(l => l.records > 0);
    const none = LIBS.filter(l => l.records === 0);
    const top = sortBy(declaring, "rate", "desc").slice(0, 10);
    return tiles([
      {tl:"Bankwide declaration rate", tv:F1(T.rate) + "%", tn:F(T.records) + " of " + F(T.docs) + " documents", cls:"hi"},
      {tl:"Best department", tv:sortBy(DEPTS, "rate", "desc")[0].code + " " + F1(sortBy(DEPTS, "rate", "desc")[0].rate) + "%"},
      {tl:"Weakest department", tv:sortBy(DEPTS, "rate", "asc")[0].code + " " + F1(sortBy(DEPTS, "rate", "asc")[0].rate) + "%", cls:"warn"},
      {tl:"Libraries with no declared records", tv:F(LIBSTATS.noDeclaredRecords), tn:"Bankwide count", cls:"bad"}
    ]) +
    `<div class="ptitle" style="margin-top:6px">Libraries with the highest declaration rates</div>
     <div class="psub" style="margin-bottom:12px">Declared records as a share of documents held. These are the libraries whose practice is worth copying.</div>` +
    barList(top.map(l => ({
      label:l.name, sub:l.site + " (" + l.dept + ")", value:l.rate,
      right:`<b>${F1(l.rate)}%</b> <span>${F(l.records)}</span>`
    })), {max:Math.max(...top.map(l => l.rate)), color:"var(--green)"}) +
    `<div class="ptitle" style="margin-top:24px">Libraries with no declared records</div>
     <div class="psub" style="margin-bottom:12px">Documents present, nothing declared. Check the retention label mapping before assuming this is a training problem.</div>` +
    table([
      {k:"name", t:"Library", cell:r => `<b>${r.name}</b><small>${r.site} (${r.dept})</small>`},
      {k:"docs", t:"Documents held", num:true, fmt:F},
      {k:"lastActivityDays", t:"Days since activity", num:true, fmt:F},
      {k:"cause", t:"Likely cause", cell:r => r.retentionMapped
        ? `<span class="pill warn">No declaration activity</span>`
        : `<span class="pill bad">No retention label mapping</span>`}
    ], sortBy(none, "docs", "desc")) +
    note(`<b>Declaration rate has a denominator problem worth stating out loud.</b> The records database holds declared records only, so the document count comes from the file scan. Until it is settled whether folders, versions, system files and documents in unmapped libraries belong in that count, the rate is directionally right and precisely wrong.`);
  }

  function qualityBody(){
    return tiles([
      {tl:"Duplicated records", tv:F(QUALITY.duplicates),
       tn:"Same filename, same library, different item", cls:"warn"},
      {tl:"Share of all declared records", tv:PCTS(QUALITY.duplicates, T.records)},
      {tl:"Orphaned records", tv:F(QUALITY.orphaned),
       tn:"Library or site no longer resolves", cls:"bad"},
      {tl:"Declared twice", tv:F(QUALITY.declaredTwice), tn:"Same item declared on two occasions", cls:"warn"}
    ]) +
    note(`<b>Three different things are being counted here, and they are easy to confuse.</b>
      A <b>duplicate</b> is two separate items with the same filename in the same library, which is a housekeeping problem.
      An <b>orphaned record</b> is a row in the records database whose library or site no longer exists, which is a referential integrity problem.
      A record <b>declared twice</b> is one SharePoint item with two declaration rows, which is why the record total counts distinct items on ListId plus ItemId rather than counting rows. In the test tenant, 1,990 rows resolved to 1,984 distinct documents, so this is not hypothetical.`);
  }

  const html = `<section class="dash-rm">
    ${band("Records management metrics", `Declaration is the act that turns a document into a record, so this dashboard is about that act: how much of it is happening, where, against what part of the file plan, and whether what comes out the other end is clean.`)}
    <div id="rm-kpis"></div>
    <div id="rm-break"></div>
    <div id="rm-perf"></div>
    <div id="rm-qual"></div>
  </section>`;

  function init(){
    document.getElementById("rm-kpis").innerHTML = kpis([
      {lab:"Total declared records", val:F(T.records), tier:"ready", sub:"Distinct items, all time"},
      {lab:"Records declared this month", val:F(RECORDS_THIS_MONTH), tier:"ready", sub:"August 2026, month to date"},
      {lab:"Declaration rate", val:F1(T.rate) + "%", tier:"scan", sub:"Declared records over documents held"},
      {lab:"Duplicated records", val:F(QUALITY.duplicates), tier:"scan", sub:"Same filename within a library"},
      {lab:"Orphaned records", val:F(QUALITY.orphaned), tier:"ready", sub:"Library or site no longer resolves"}
    ]);

    renderBreak();

    document.getElementById("rm-perf").outerHTML = panel({
      id:"rm-perf",
      title:"Declaration performance",
      sub:"Where declaration is working and where it is not.",
      tier:"scan",
      body: performanceBody()
    });

    document.getElementById("rm-qual").outerHTML = panel({
      id:"rm-qual",
      title:"Records quality",
      sub:"Whether the declared record set is trustworthy enough to report on.",
      tier:"ready",
      body: qualityBody()
    });
  }

  function renderBreak(){
    document.getElementById("rm-break").outerHTML = panel({
      id:"rm-break",
      title:"Records declaration",
      sub:"The same " + F(T.records) + " declared records, cut four ways.",
      /* By department is the only cut that needs the site to department
         mapping, so the chip changes with the selection rather than
         claiming the whole panel is ready. */
      tier:breakdown === "dept" ? "mapping" : "ready",
      body:`<div class="toolbar">${segctl([
          {k:"dept", t:"By department"},
          {k:"year", t:"By year"},
          {k:"classification", t:"By classification"},
          {k:"process", t:"By business process"}
        ], breakdown)}</div>
        <div id="rm-breakbody">${breakdownBody()}</div>`
    });
    wireSeg("#rm-break", k => { breakdown = k; renderBreak(); });
  }

  return {
    ver:"Records management",
    crumb:"Records management metrics",
    asof:ASOF.edrms,
    html, init
  };
})();
