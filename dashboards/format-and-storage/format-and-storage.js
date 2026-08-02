/* ===================================================================
   Format and Storage
   Built from the approved mockup. Must be defined after DASHBOARDS.rm,
   because it asserts against that dashboard's declared records total.
   =================================================================== */
DASHBOARDS.fs=(function(){
  /* Average file size is DERIVED, never stored: storageGB * 1024 / files. */
  const FORMATS=[
    {label:"PDF",                files:8200, gb:9.6},
    {label:"Word",               files:5100, gb:3.0},
    {label:"Excel",              files:3050, gb:2.7},
    {label:"Email (.msg / .eml)",files:2100, gb:0.6},
    {label:"PowerPoint",         files:1350, gb:5.9},
    {label:"Image files",        files:980,  gb:3.6},
    {label:"Video files",        files:466,  gb:20.5},
    {label:"All other formats",  files:400,  gb:0.8},
  ];
  const avgOf=f=>f.files?f.gb*1024/f.files:0;
  const TOT_FILES=FORMATS.reduce((a,f)=>a+f.files,0);
  const TOT_GB=FORMATS.reduce((a,f)=>a+f.gb,0);
  const TOT_AVG=TOT_FILES?TOT_GB*1024/TOT_FILES:0;

  /* The format file counts are a decomposition of Total Declared Records on the
     Records Management dashboard. If the department data over there ever
     changes, this fires so the two dashboards cannot silently drift apart. */
  console.assert(TOT_FILES===DASHBOARDS.rm.annualRec,
    `Format and Storage total files (${TOT_FILES}) does not match Records Management declared records (${DASHBOARDS.rm.annualRec})`);

  const COLS=[{k:"files",label:"Number of files"},{k:"gb",label:"Storage (GB)"},{k:"avg",label:"Avg file size (MB)"}];
  const valOf={files:f=>f.files, gb:f=>f.gb, avg:f=>avgOf(f)};
  const fmtOf={files:f=>F(f.files), gb:f=>f.gb.toFixed(1)+" GB", avg:f=>avgOf(f).toFixed(1)};

  let field="files",dir="desc";

  function drawTable(){
    document.querySelectorAll("#fs-field button").forEach(b=>b.classList.toggle("on",b.dataset.f===field));
    document.getElementById("fs-dir").innerHTML=(dir==="desc"?'▼ Highest first':'▲ Lowest first');
    const rows=[...FORMATS].sort((a,b)=>dir==="desc"?valOf[field](b)-valOf[field](a):valOf[field](a)-valOf[field](b));
    const mx={};COLS.forEach(c=>{mx[c.k]=Math.max(...FORMATS.map(f=>valOf[c.k](f)),0.0001);});
    let h=`<div class="fhead"><span>Format</span>`+
      COLS.map(c=>`<span class="num ${c.k===field?'on':''}" data-col="${c.k}">${c.label}</span>`).join("")+`</div>`;
    h+=rows.map(f=>`<div class="frow"><span class="fname">${f.label}</span>`+
      COLS.map(c=>{const w=Math.max(2,100*valOf[c.k](f)/mx[c.k]);
        return `<span class="fcell"><i class="fbar" style="width:${w}%"></i><b>${fmtOf[c.k](f)}</b></span>`;}).join("")+
      `</div>`).join("");
    h+=`<div class="ftot"><span class="fname">Total</span><span class="tv">${F(TOT_FILES)}</span><span class="tv">${TOT_GB.toFixed(1)} GB</span><span class="tv">${TOT_AVG.toFixed(1)}</span></div>`;
    document.getElementById("fs-table").innerHTML=h;
  }
  function drawRecords(){
    const rows=[...FORMATS].sort((a,b)=>b.files-a.files);
    const mx=Math.max(...rows.map(r=>r.files),1);
    document.getElementById("fs-records").innerHTML=rows.map(r=>{
      const pct=TOT_FILES?r.files/TOT_FILES*100:0;
      return `<div class="rbar"><div class="rl">${r.label}</div>
        <div class="rt"><div class="rf" style="width:${Math.max(2,100*r.files/mx)}%"></div></div>
        <div class="rv"><b>${F(r.files)}</b><span> · ${pct.toFixed(1)}%</span></div></div>`;}).join("");
  }

  const html=`<section class="dash-fs">
    <div class="band">
      <h2>Storage footprint by file format</h2>
      <div class="bd">Which file formats consume the most storage across EDRMS compliant sites, and how declared records break down by format.</div>
    </div>
    <div class="kpis">
      <div class="kpi on"><div class="lab">Storage Consumed by Format</div><div class="val" id="kpi-fsgb"></div><div class="tap">▾ Opened below</div></div>
    </div>
    <div class="panel">
      <div class="ptitle">Storage consumed by format</div>
      <div class="psub">File formats ranked by number of files, storage consumed, and average file size. Bars are scaled within each column, so the longest bar in a column is that column's largest value.</div>
      <div class="sortrow"><span class="lbl">Sort by</span>
        <div class="segctl" id="fs-field"><button data-f="files">Files</button><button data-f="gb">Storage</button><button data-f="avg">Avg file size</button></div>
        <button class="dirbtn" id="fs-dir"></button></div>
      <div class="ftab" id="fs-table"></div>
    </div>

    <div class="kpis">
      <div class="kpi on"><div class="lab">Most Common Format</div><div class="val" id="kpi-fstop"></div><div class="tap">▾ Opened below</div></div>
    </div>
    <div class="panel">
      <div class="ptitle">Declared records by format</div>
      <div class="psub">Declared records broken down by file format, as a count and as a share of all declared records.</div>
      <div id="fs-records"></div>
    </div>
  </section>`;

  function init(){
    document.getElementById("kpi-fsgb").textContent=TOT_GB.toFixed(1)+" GB";
    document.getElementById("kpi-fstop").textContent=FORMATS.reduce((a,b)=>b.files>a.files?b:a).label;
    document.querySelectorAll("#fs-field button").forEach(b=>b.onclick=()=>{field=b.dataset.f;drawTable();});
    document.getElementById("fs-dir").onclick=()=>{dir=dir==="desc"?"asc":"desc";drawTable();};
    drawTable();drawRecords();
  }

  return {
    ver:"Format and Storage Dashboard",
    crumb:"Format and Storage Dashboard",
    asof:"Data as of Sun 05 Jul 2026 23:59 · refreshed Mon 06 Jul 06:00",
    html,init
  };
})();
