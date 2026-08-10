/* ===================================================================
   Format and Storage Analysis

   Spec: 2026.4 Reports Utilization, section 7.
     Declared Records by Format   PDF, Word, Excel, PowerPoint,
                                  Email (.msg/.eml), image files,
                                  video files, all other formats
     Storage by Format            number of files, storage consumed

   The eight format groups are a decomposition of the declared record
   total, so their file counts must sum to it. data.js asserts that at
   load, which is what stops this dashboard drifting away from Records
   management.
   =================================================================== */
DASHBOARDS.fs = (function(){
  let sort = "files", dir = "desc";

  function formatBody(){
    const rows = sortBy(FORMATS, sort, dir);
    const maxFiles = Math.max(...FORMATS.map(f => f.files));
    const maxGB = Math.max(...FORMATS.map(f => f.storageGB));
    const maxAvg = Math.max(...FORMATS.map(f => f.avgMB));
    const bar = (v, max, on) => `<div style="position:relative;height:24px;background:#F3F7FB;border-radius:5px;overflow:hidden">
        <div style="position:absolute;left:0;top:0;height:24px;width:${(v / max * 100).toFixed(1)}%;background:${on ? "#CFE0F2" : "#E4EBF3"};border-radius:5px"></div></div>`;
    return table([
      {k:"label", t:"Format", cell:r => `<b>${r.label}</b>`},
      {k:"files", t:"Number of files", num:true, cell:r =>
        `<div style="display:flex;align-items:center;gap:8px;justify-content:flex-end">
           <div style="flex:1;min-width:60px">${bar(r.files, maxFiles, sort === "files")}</div>
           <b style="min-width:64px">${F(r.files)}</b></div>`},
      {k:"storageGB", t:"Storage consumed", num:true, cell:r =>
        `<div style="display:flex;align-items:center;gap:8px;justify-content:flex-end">
           <div style="flex:1;min-width:60px">${bar(r.storageGB, maxGB, sort === "storageGB")}</div>
           <b style="min-width:72px">${GB(r.storageGB)}</b></div>`},
      {k:"avgMB", t:"Average file size", num:true, cell:r =>
        `<div style="display:flex;align-items:center;gap:8px;justify-content:flex-end">
           <div style="flex:1;min-width:60px">${bar(r.avgMB, maxAvg, sort === "avgMB")}</div>
           <b style="min-width:64px">${F1(r.avgMB)} MB</b></div>`},
      {k:"share", t:"Share of records", num:true, cell:r => PCTS(r.files, FORMAT_FILES)}
    ], rows, {sortable:true, sort, dir}) +
    /* Totals are shown as tiles rather than a table footer row, because the
       three data columns hold in-cell bars and a footer row cannot line up
       with them without hard coding widths that then break on narrow screens. */
    tiles([
      {tl:"All formats, files", tv:F(FORMAT_FILES), tn:"Equals total declared records", cls:"hi"},
      {tl:"All formats, storage", tv:GB(FORMAT_GB)},
      {tl:"All formats, average file size", tv:F1(FORMAT_GB * 1024 / FORMAT_FILES) + " MB"}
    ]) +
    note(`<b>Average file size is derived, never stored:</b> storage in GB times 1,024, divided by the file count. Video is the case that makes the point: ${PCTS(FORMATS.find(f => f.label === "Video files").files, FORMAT_FILES)} of declared records and ${PCTS(FORMATS.find(f => f.label === "Video files").storageGB, FORMAT_GB)} of the storage they consume.`);
  }

  const html = `<section class="dash-fs">
    ${band("Format and storage analysis", `What the declared records are made of and what they cost to keep. The file counts here are a decomposition of the ${F(T.records)} declared records reported on the Records management dashboard, so they sum to that figure exactly.`)}
    <div id="fs-kpis"></div>
    <div id="fs-tab"></div>
    <div class="prow"><div id="fs-rec"></div><div id="fs-sto"></div></div>
  </section>`;

  function init(){
    const top = sortBy(FORMATS, "files", "desc")[0];
    const heaviest = sortBy(FORMATS, "storageGB", "desc")[0];
    document.getElementById("fs-kpis").innerHTML = kpis([
      {lab:"Declared records covered", val:F(FORMAT_FILES), tier:"scan", sub:"All eight format groups"},
      {lab:"Total storage consumed", val:GB(FORMAT_GB), tier:"scan", sub:"Declared records only"},
      {lab:"Most common format", val:top.label, tier:"scan", small:true, sub:F(top.files) + " files, " + PCTS(top.files, FORMAT_FILES)},
      {lab:"Heaviest format by storage", val:heaviest.label, tier:"scan", small:true, sub:GB(heaviest.storageGB) + ", " + PCTS(heaviest.storageGB, FORMAT_GB)},
      {lab:"Average file size", val:F1(FORMAT_GB * 1024 / FORMAT_FILES) + " MB", tier:"scan", sub:"Across all declared records"}
    ]);

    renderTab();

    document.getElementById("fs-rec").outerHTML = panel({
      id:"fs-rec",
      title:"Declared records by format",
      sub:"Count of declared records in each of the eight format groups.",
      tier:"scan",
      body: barList(sortBy(FORMATS, "files", "desc").map(f => ({label:f.label, value:f.files})), {showShare:true, narrow:true})
    });

    document.getElementById("fs-sto").outerHTML = panel({
      id:"fs-sto",
      title:"Storage by format",
      sub:"Storage consumed by each format group. The order is not the same as the file count order, which is the whole point of showing both.",
      tier:"scan",
      body: donut(sortBy(FORMATS, "storageGB", "desc").map((f, i) => ({
        label:f.label, value:f.storageGB,
        color:["var(--blue)","var(--teal)","var(--green)","var(--orange)","var(--greyblue)","var(--deepblue)","var(--purple)","var(--amber)"][i]
      })), {fmt:GB, centre:GB(FORMAT_GB), centreLabel:"total"})
    });
  }

  function renderTab(){
    document.getElementById("fs-tab").outerHTML = panel({
      id:"fs-tab",
      title:"Format and storage table",
      sub:"Files, storage and average file size for every format group. Click a column heading to sort.",
      tier:"scan",
      body: formatBody()
    });
    wireSort("#fs-tab", k => {
      if (sort === k) dir = dir === "desc" ? "asc" : "desc"; else { sort = k; dir = "desc"; }
      renderTab();
    });
  }

  return {
    ver:"Format and storage",
    crumb:"Format and storage analysis",
    asof:ASOF.edrms + " | " + ASOF.m365,
    html, init
  };
})();
