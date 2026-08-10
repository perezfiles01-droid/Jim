/* ===================================================================
   Risk and Compliance Dashboard

   Spec: 2026.4 Reports Utilization, section 2.
     Risk Indicators
       Site Health      active, inactive over 300 days, orphaned
       Site Trends      new sites created, sites archived, activity by month
       Library usage
         Active libraries    activity in 90 / 180 days, most used,
                             largest by record volume, largest by storage,
                             library growth rate, new sites, sites archived
         Inactive libraries  no activity in 90 / 180 days, orphaned,
                             no declared records, no retention label mapping,
                             physical records overdue for transfer
   =================================================================== */
DASHBOARDS.rc = (function(){
  let window180 = false;          /* the 90 / 180 day toggle, shared by both library panels */
  let activeSort = "activity";    /* activity | records | storageGB */
  let libPage = 1;

  /* Sites inactive for over 300 days are the subset of the inactive
     population that has gone properly cold. Held as a fixed share of the
     inactive count so it can never exceed it. */
  const INACTIVE_300 = Math.round(T.sitesInactive * 0.58);

  function healthPanel(){
    return panel({
      id:"rc-health",
      title:"Site health",
      sub:"Every EDRMS compliant site falls into exactly one of these three states, so the three counts add to " + F(T.sites) + ".",
      tier:"usage",
      body: tiles([
        {tl:"Active sites", tv:F(T.sitesActive), tn:PCTS(T.sitesActive, T.sites) + " of compliant sites", cls:"hi"},
        {tl:"Inactive sites", tv:F(T.sitesInactive), tn:"No activity in over 90 days", cls:"warn"},
        {tl:"Inactive over 300 days", tv:F(INACTIVE_300), tn:"Subset of inactive, gone fully cold", cls:"warn"},
        {tl:"Orphaned sites", tv:F(T.sitesOrphaned), tn:"No owner resolves to a current account", cls:"bad"}
      ]) +
      donut([
        {label:"Active", value:T.sitesActive, color:"var(--green)"},
        {label:"Inactive, over 90 days", value:T.sitesInactive, color:"var(--amber)"},
        {label:"Orphaned", value:T.sitesOrphaned, color:"var(--red)"}
      ], {centre:F(T.sites), centreLabel:"sites"}) +
      note(`<b>Two thresholds are in play.</b> The executive summary flags a site as inactive at 90 days, which is an early warning. The 300 day count here is the population that is a candidate for archiving or reassignment. Both are reported so a site does not disappear from view between the two.`)
    });
  }

  function trendPanel(){
    const points = MONTHS.map((m, i) => ({x:m, y:SITES_CREATED[i], y2:SITES_ARCHIVED[i]}));
    const created = SITES_CREATED.reduce((a, b) => a + b, 0);
    const archived = SITES_ARCHIVED.reduce((a, b) => a + b, 0);
    return panel({
      id:"rc-trend",
      title:"Site trends",
      sub:"New sites created against sites archived, month by month. Net growth is what tells you whether the estate is still expanding or has reached its shape.",
      tier:"app",
      body: tiles([
        {tl:"New sites created", tv:F(created), tn:"Last 12 months", cls:"hi"},
        {tl:"Sites archived", tv:F(archived), tn:"Last 12 months"},
        {tl:"Net change", tv:"+" + F(created - archived), tn:"Created minus archived"}
      ]) +
      legend([{c:"var(--blue)", l:"New sites created"}, {c:"var(--greyblue)", l:"Sites archived"}]) +
      trend(points, {c1:"var(--blue)", c2:"var(--greyblue)"}) +
      `<div class="ptitle" style="margin-top:22px">Site activity trend by month</div>
       <div class="psub" style="margin-bottom:12px">Number of compliant sites with any recorded user activity in the month. The August column is a partial month.</div>` +
      trend(MONTHS.map((m, i) => ({x:m, y:SITE_ACTIVITY[i]})), {c1:"var(--teal)", height:200})
    });
  }

  function activeLibs(){
    const activeCount = window180 ? LIBSTATS.active180 : LIBSTATS.active90;
    const win = window180 ? 180 : 90;
    const sorted = sortBy(LIBS.filter(l => l.lastActivityDays <= win), activeSort, "desc");
    const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    if (libPage > pages) libPage = pages;
    const page = sorted.slice((libPage - 1) * PAGE_SIZE, libPage * PAGE_SIZE);
    const fmt = activeSort === "storageGB" ? (v => GB(v)) : F;
    const cols = {
      activity:"Views, downloads, uploads and edits combined",
      records:"Declared record volume",
      storageGB:"Storage consumed"
    };
    return `<div class="toolbar">
        ${segctl([{k:"90", t:"90 days"}, {k:"180", t:"180 days"}], window180 ? "180" : "90")}
        <span class="ctl">Rank by
          <select id="rc-sort">
            <option value="activity" ${activeSort === "activity" ? "selected" : ""}>Most used (views, downloads, uploads, edits)</option>
            <option value="records" ${activeSort === "records" ? "selected" : ""}>Largest by record volume</option>
            <option value="storageGB" ${activeSort === "storageGB" ? "selected" : ""}>Largest by storage</option>
          </select>
        </span>
      </div>
      ${tiles([
        {tl:"Active libraries", tv:F(activeCount), tn:"User activity within " + win + " days", cls:"hi"},
        {tl:"Share of all libraries", tv:PCTS(activeCount, LIBSTATS.total), tn:"of " + F(LIBSTATS.total) + " libraries"},
        {tl:"Library growth rate", tv:F1(LIBSTATS.growthRate) + "%", tn:"New records this period over records at start"},
        {tl:"New sites created", tv:F(SITES_CREATED.reduce((a, b) => a + b, 0)), tn:"Last 12 months"},
        {tl:"Sites archived", tv:F(SITES_ARCHIVED.reduce((a, b) => a + b, 0)), tn:"Last 12 months"}
      ])}
      <div class="psub" style="margin-bottom:12px">${cols[activeSort]}. Libraries are always shown with their parent site, because library names repeat across sites.</div>
      ${barList(page.map(l => ({
        label:l.name, sub:l.site + " (" + l.dept + ")", value:l[activeSort],
        right:`<b>${fmt(l[activeSort])}</b>`
      })), {color:"var(--blue)"})}
      <div id="rc-libpager">${pager(sorted.length, libPage, pages, "sample libraries")}</div>`;
  }

  function inactiveLibs(){
    const win = window180 ? 180 : 90;
    const noActivity = window180 ? LIBSTATS.inactive180 : LIBSTATS.inactive90;
    const rows = LIBS.filter(l => l.lastActivityDays > win || !l.hasOwner || l.records === 0 || !l.retentionMapped);
    return tiles([
      {tl:"No activity in " + win + " days", tv:F(noActivity), tn:PCTS(noActivity, LIBSTATS.total) + " of libraries", cls:"warn"},
      {tl:"Orphaned libraries", tv:F(LIBSTATS.orphaned), tn:"No owner recorded", cls:"bad"},
      {tl:"No declared records", tv:F(LIBSTATS.noDeclaredRecords), tn:"Documents present, none declared", cls:"warn"},
      {tl:"No retention label mapping", tv:F(LIBSTATS.noRetentionMapping), tn:"Declaration will fail here", cls:"bad"},
      {tl:"Physical records overdue for transfer", tv:F(INVENTORY.overdueTransfer), tn:"Past the agreed transfer date", cls:"bad"}
    ]) +
    table([
      {k:"name", t:"Library", cell:r => `<b>${r.name}</b><small>${r.site} (${r.dept})</small>`},
      {k:"lastActivityDays", t:"Days since activity", num:true, fmt:F},
      {k:"docs", t:"Documents", num:true, fmt:F},
      {k:"records", t:"Declared records", num:true, fmt:F},
      {k:"flags", t:"Risk flags", cell:r => {
        const f = [];
        if (r.lastActivityDays > win) f.push(`<span class="pill warn">No activity ${win}d</span>`);
        if (!r.hasOwner) f.push(`<span class="pill bad">Orphaned</span>`);
        if (r.records === 0) f.push(`<span class="pill warn">No declared records</span>`);
        if (!r.retentionMapped) f.push(`<span class="pill bad">No retention mapping</span>`);
        return f.join(" ") || `<span class="pill ok">Clear</span>`;
      }}
    ], sortBy(rows, "lastActivityDays", "desc")) +
    note(`<b>No retention label mapping is the one to act on first.</b> A document in an unmapped library cannot be declared at all: the declaration fails with "No Library and Retention Label Mapping found". Those documents are undeclarable rather than undeclared, and until the mapping is added the declaration rate for that department can never reach 100 per cent.`);
  }

  const html = `<section class="dash-rc">
    ${band("Risk and compliance", `The dashboard for spotting where the EDRMS is quietly failing: sites nobody owns, libraries nobody has opened in six months, libraries where declaration is impossible because no retention label has been mapped, and physical records sitting past their transfer date. Nothing here is a headline number. Everything here is a work list.`)}
    <div id="rc-health"></div>
    <div id="rc-trend"></div>
    <div id="rc-active"></div>
    <div id="rc-inactive"></div>
  </section>`;

  function init(){
    document.getElementById("rc-health").outerHTML = healthPanel();
    document.getElementById("rc-trend").outerHTML = trendPanel();
    renderActive();
  }

  function renderActive(){
    document.getElementById("rc-active").outerHTML = panel({
      id:"rc-active",
      title:"Library usage, active libraries",
      sub:"Which libraries are actually carrying the work. Ranked three ways, over a 90 or 180 day window.",
      tier:"usage",
      body: activeLibs()
    });
    wireSeg("#rc-active", k => { window180 = (k === "180"); libPage = 1; renderActive(); });
    const sel = document.getElementById("rc-sort");
    if (sel) sel.onchange = () => { activeSort = sel.value; libPage = 1; renderActive(); };
    wirePager("#rc-active", v => {
      const win = window180 ? 180 : 90;
      const n = LIBS.filter(l => l.lastActivityDays <= win).length;
      const pages = Math.max(1, Math.ceil(n / PAGE_SIZE));
      libPage = v === "prev" ? Math.max(1, libPage - 1) : v === "next" ? Math.min(pages, libPage + 1) : +v;
      renderActive();
    });
    /* the window toggle is shared, so the inactive panel follows it */
    renderInactive();
  }

  function renderInactive(){
    const el = document.getElementById("rc-inactive");
    if (!el) return;
    el.outerHTML = panel({
      id:"rc-inactive",
      title:"Library usage, inactive and at risk libraries",
      sub:"The same library estate seen from the other side. These are the libraries that need an owner, a retention mapping, or a decision to archive.",
      tier:"usage",
      body: inactiveLibs()
    });
  }

  return {
    ver:"Risk and compliance",
    crumb:"Risk and compliance dashboard",
    asof:ASOF.m365 + " | " + ASOF.opus,
    html, init
  };
})();
