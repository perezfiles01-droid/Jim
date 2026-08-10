/* ===================================================================
   Retention and Disposition Metrics

   Spec: 2026.4 Reports Utilization, section 8.
     Retention Dashboard          records due for disposition,
                                  due within 30 days, due within 90 days,
                                  awaiting approval, disposition
                                  completed, disposition backlog
     Retention Compliance         records with retention schedules,
                                  records without, libraries without
                                  mapped retention schedules
     Disposition Risk Indicators  overdue dispositions, records beyond
                                  retention periods, disposition
                                  approval backlog
   =================================================================== */
DASHBOARDS.rd = (function(){

  function retentionBody(){
    /* Due within 30 is a subset of due within 90, which is a subset of
       due for disposition. Showing them as nested bars stops a reader
       adding three overlapping numbers together. */
    return tiles([
      {tl:"Records due for disposition", tv:F(RETENTION.dueForDisposition),
       tn:PCTS(RETENTION.dueForDisposition, T.records) + " of declared records", cls:"hi"},
      {tl:"Due within 30 days", tv:F(RETENTION.dueWithin30), cls:"bad"},
      {tl:"Due within 90 days", tv:F(RETENTION.dueWithin90), cls:"warn"},
      {tl:"Awaiting approval", tv:F(RETENTION.awaitingApproval), cls:"warn"},
      {tl:"Disposition completed", tv:F(RETENTION.completed), tn:"Rolling 12 months"},
      {tl:"Disposition backlog", tv:F(RETENTION.backlog), tn:"Approved, not yet actioned", cls:"bad"}
    ]) +
    `<div class="ptitle" style="margin-top:6px">The disposition funnel</div>
     <div class="psub" style="margin-bottom:12px">Each bar is a subset of the one above it. They are not additive.</div>` +
    barList([
      {label:"Due for disposition", sub:"Retention period has expired", value:RETENTION.dueForDisposition, color:"var(--blue)"},
      {label:"Due within 90 days", sub:"Subset, expiring soon", value:RETENTION.dueWithin90, color:"var(--amber)"},
      {label:"Due within 30 days", sub:"Subset, expiring imminently", value:RETENTION.dueWithin30, color:"var(--red)"},
      {label:"Awaiting approval", sub:"Submitted, decision outstanding", value:RETENTION.awaitingApproval, color:"var(--orange)"},
      {label:"Backlog", sub:"Approved, not yet actioned", value:RETENTION.backlog, color:"var(--deepblue)"},
      {label:"Completed", sub:"Disposed in the last 12 months", value:RETENTION.completed, color:"var(--green)"}
    ], {max:RETENTION.dueForDisposition}) +
    note(`<b>Due date for disposal is the retention label applied date plus the retention duration, not the declaration date plus the duration.</b> That was confirmed against the live calculated column formula in the test tenant. Using the declaration date instead shifts every date on this dashboard, usually earlier, and produces an overdue population that is not really overdue.`);
  }

  function complianceBody(){
    return tiles([
      {tl:"Records with retention schedules", tv:F(RETENTION.withSchedule),
       tn:PCTS(RETENTION.withSchedule, T.records) + " of declared records", cls:"hi"},
      {tl:"Records without retention schedules", tv:F(RETENTION.withoutSchedule),
       tn:PCTS(RETENTION.withoutSchedule, T.records) + " of declared records", cls:"bad"},
      {tl:"Libraries without mapped retention schedules", tv:F(RETENTION.librariesUnmapped),
       tn:PCTS(RETENTION.librariesUnmapped, LIBSTATS.total) + " of libraries", cls:"bad"}
    ]) +
    donut([
      {label:"With a retention schedule", value:RETENTION.withSchedule, color:"var(--green)"},
      {label:"Without a retention schedule", value:RETENTION.withoutSchedule, color:"var(--red)"}
    ], {centre:PCTS(RETENTION.withSchedule, T.records), centreLabel:"covered"}) +
    `<div class="ptitle" style="margin-top:22px">Libraries with no retention label mapping</div>
     <div class="psub" style="margin-bottom:12px">These libraries are not merely uncovered, they are undeclarable. Declaration fails outright with "No Library and Retention Label Mapping found".</div>` +
    table([
      {k:"name", t:"Library", cell:r => `<b>${r.name}</b><small>${r.site} (${r.dept})</small>`},
      {k:"docs", t:"Documents held", num:true, fmt:F},
      {k:"records", t:"Declared records", num:true, fmt:F},
      {k:"state", t:"State", cell:() => `<span class="pill bad">Declaration will fail</span>`}
    ], LIBS.filter(l => !l.retentionMapped)) +
    note(`<b>Two levels of retention control, and they are separate questions.</b> A library appears in the Retention Label Mapping list, which decides whether a document in it can be declared at all. A record then carries a retention label, which decides when it is disposed of. A compliant site can hold an unmapped library, and does: that combination was confirmed in the test tenant.`);
  }

  function riskBody(){
    return tiles([
      {tl:"Overdue dispositions", tv:F(RETENTION.overdue),
       tn:"Past the due date, not actioned", cls:"bad"},
      {tl:"Records beyond retention periods", tv:F(RETENTION.beyondRetention),
       tn:"Held longer than the schedule allows", cls:"bad"},
      {tl:"Disposition approval backlog", tv:F(RETENTION.awaitingApproval),
       tn:"Waiting on an approver", cls:"warn"}
    ]) +
    barList([
      {label:"Overdue dispositions", value:RETENTION.overdue, color:"var(--red)"},
      {label:"Beyond retention periods", value:RETENTION.beyondRetention, color:"var(--orange)"},
      {label:"Approval backlog", value:RETENTION.awaitingApproval, color:"var(--amber)"}
    ], {max:Math.max(RETENTION.overdue, RETENTION.beyondRetention, RETENTION.awaitingApproval)}) +
    note(`<b>Overdue and beyond retention are different failures.</b> An overdue disposition is a process failure: the decision was due and nobody made it. A record beyond its retention period is a legal exposure: the bank is holding information it agreed to destroy. The approval backlog is usually the cause of both, which is why all three sit together.`);
  }

  const html = `<section class="dash-rd">
    ${band("Retention and disposition metrics", `Retention is the promise the bank made about how long it would keep something. This dashboard measures whether that promise is being kept: how much is covered by a schedule, what is falling due, what is stuck waiting for approval, and what is already being held longer than it should be.`)}
    <div id="rd-kpis"></div>
    <div id="rd-ret"></div>
    <div id="rd-comp"></div>
    <div id="rd-risk"></div>
  </section>`;

  function init(){
    document.getElementById("rd-kpis").innerHTML = kpis([
      {lab:"Records due for disposition", val:F(RETENTION.dueForDisposition), tier:"ready"},
      {lab:"Due within 30 days", val:F(RETENTION.dueWithin30), tier:"ready"},
      {lab:"Awaiting approval", val:F(RETENTION.awaitingApproval), tier:"ready"},
      {lab:"Records without retention schedules", val:F(RETENTION.withoutSchedule), tier:"ready"},
      {lab:"Overdue dispositions", val:F(RETENTION.overdue), tier:"ready"},
      {lab:"Libraries without mapped retention", val:F(RETENTION.librariesUnmapped), tier:"manual"}
    ]);
    document.getElementById("rd-ret").outerHTML = panel({
      id:"rd-ret",
      title:"Retention dashboard", sub:"What is falling due and where it is in the disposition process.",
      tier:"ready", body:retentionBody()
    });
    document.getElementById("rd-comp").outerHTML = panel({
      id:"rd-comp",
      title:"Retention compliance", sub:"How much of the record estate is covered by a schedule at all.",
      tier:"ready", body:complianceBody()
    });
    document.getElementById("rd-risk").outerHTML = panel({
      id:"rd-risk",
      title:"Disposition risk indicators", sub:"The three measures that turn a retention problem into a finding.",
      tier:"ready", body:riskBody()
    });
  }

  return {
    ver:"Retention and disposition",
    crumb:"Retention and disposition metrics",
    asof:ASOF.edrms,
    html, init
  };
})();
