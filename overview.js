/* ===================================================================
   Overview
   An executive summary of the other dashboards. Must be defined after
   them, because every figure it shows is read from their exported
   `summary` objects rather than restated here. That is deliberate: a
   summary that keeps its own copy of the numbers drifts away from the
   detail it claims to summarise the first time either side is edited.
   =================================================================== */
DASHBOARDS.ov=(function(){
  const RM=DASHBOARDS.rm.summary;
  const SL=DASHBOARDS.sl.summary;
  const FS=DASHBOARDS.fs.summary;

  /* Cross dashboard checks. These fire in the console rather than on the page,
     so a broken figure is caught during verification instead of by a reader. */
  console.assert(RM.declared===FS.totalFiles,
    `Overview: declared records (${RM.declared}) and format file total (${FS.totalFiles}) disagree`);
  console.assert(RM.withPhysical+RM.withoutPhysical===RM.declared,
    "Overview: physical counterpart split does not sum to declared records");
  console.assert(SL.libraryRecords+SL.libraryUndeclared===SL.libraryDocuments,
    "Overview: library declaration split does not sum to library documents");
  console.assert(Math.abs(FS.formats.reduce((a,f)=>a+f.gb,0)-FS.totalGB)<0.05,
    "Overview: format storage does not sum to the storage total");

  const GB=n=>n.toFixed(1)+" GB";
  const PCT=(v,t)=>t?(v/t*100):0;

  /* ===== chart primitives, all mapped to native Power BI visuals ===== */

  /* Donut chart. Power BI equivalent: Donut chart. */
  function arcSeg(cx,cy,rO,rI,a0,a1,fill,title){
    const large=(a1-a0)>Math.PI?1:0;
    const pt=(r,a)=>[(cx+r*Math.cos(a)).toFixed(2),(cy+r*Math.sin(a)).toFixed(2)];
    const [x0,y0]=pt(rO,a0),[x1,y1]=pt(rO,a1),[x2,y2]=pt(rI,a1),[x3,y3]=pt(rI,a0);
    return `<path d="M${x0} ${y0}A${rO} ${rO} 0 ${large} 1 ${x1} ${y1}L${x2} ${y2}A${rI} ${rI} 0 ${large} 0 ${x3} ${y3}Z" fill="${fill}"><title>${title}</title></path>`;
  }
  function donut(items,o){
    o=o||{};
    const size=o.size||168, th=o.thickness||32, cx=size/2, cy=size/2, rO=size/2, rI=size/2-th;
    const total=items.reduce((a,i)=>a+i.value,0)||1;
    let a=-Math.PI/2, out="";
    items.forEach(i=>{
      const frac=i.value/total;
      if(frac<=0)return;
      const a1=a+frac*Math.PI*2;
      if(frac>0.9995){
        /* a single full slice would collapse the arc endpoints onto each other,
           so draw it as a stroked circle instead */
        out+=`<circle cx="${cx}" cy="${cy}" r="${(rO+rI)/2}" fill="none" stroke="${i.color}" stroke-width="${th}"><title>${i.label}</title></circle>`;
      }else{
        out+=arcSeg(cx,cy,rO,rI,a,a1,i.color,`${i.label}: ${o.fmt?o.fmt(i.value):F(i.value)}`);
      }
      a=a1;
    });
    const centre=o.centreValue
      ? `<text x="${cx}" y="${cy-1}" text-anchor="middle" font-size="20" font-weight="700" fill="#10243E" style="font-variant-numeric:tabular-nums">${o.centreValue}</text>
         <text x="${cx}" y="${cy+16}" text-anchor="middle" font-size="10" fill="#6B7A8C">${o.centreLabel||""}</text>`
      : "";
    return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" style="display:block;flex:0 0 auto">${out}${centre}</svg>`;
  }
  function legend(items,fmt){
    const total=items.reduce((a,i)=>a+i.value,0)||1;
    return `<div class="dleg">`+items.map(i=>
      `<div class="dlrow"><span class="sw" style="background:${i.color}"></span>
        <span class="dlab" title="${i.label}">${i.label}</span>
        <span class="dval">${fmt(i.value)}</span>
        <span class="dpct">${PCT(i.value,total).toFixed(1)}%</span></div>`).join("")+`</div>`;
  }
  function donutCard(items,o,fmt){
    return `<div class="cwrap">${donut(items,o)}${legend(items,fmt)}</div>`;
  }

  /* Ranked horizontal bars. Power BI equivalent: Clustered bar chart. */
  function topBars(items,fmt){
    const mx=Math.max(...items.map(i=>i.value),1);
    return items.map(i=>`<div class="tbar">
      <div class="tl"><b>${i.label}</b>${i.name?`<small>${i.name}</small>`:""}</div>
      <div class="tt"><div class="tf" style="width:${Math.max(3,100*i.value/mx)}%"></div></div>
      <div class="tv">${fmt(i.value)}</div></div>`).join("");
  }

  /* Two magnitudes on one shared scale, so the gap between them is the message.
     Power BI equivalent: Clustered bar chart. */
  function gapBars(rows,fmt){
    const mx=Math.max(...rows.map(r=>r.value),1);
    return rows.map(r=>`<div class="gap">
      <div class="gl"><span>${r.label}</span><b>${fmt(r.value)}</b></div>
      <div class="gt"><div class="gf" style="width:${Math.max(0.4,100*r.value/mx)}%;background:${r.color}"></div></div>
    </div>`).join("");
  }

  /* ===== palette, taken from the ADB tokens only ===== */
  const C={blue:"#0072BC",teal:"#00A5A8",deep:"#1B5E82",green:"#5CA943",grey:"#9DB8D2",faint:"#C7D3E0",orange:"#E8763C"};

  /* The same five formats appear in both format donuts, with the same colours,
     so the two can be read against each other. Grouping the tail into one slice
     also keeps each donut readable, which eight slices would not be. */
  const FMT_TOP=[...FS.formats].sort((a,b)=>b.gb-a.gb).slice(0,5);
  const FMT_REST=FS.formats.filter(f=>!FMT_TOP.includes(f));
  const FMT_COLORS=[C.blue,C.teal,C.deep,C.green,C.grey];
  const storageSlices=FMT_TOP.map((f,i)=>({label:f.label,value:f.gb,color:FMT_COLORS[i]}))
    .concat([{label:"All other formats",value:FMT_REST.reduce((a,f)=>a+f.gb,0),color:C.faint}]);
  const fileSlices=FMT_TOP.map((f,i)=>({label:f.label,value:f.files,color:FMT_COLORS[i]}))
    .concat([{label:"All other formats",value:FMT_REST.reduce((a,f)=>a+f.files,0),color:C.faint}]);

  console.assert(Math.abs(storageSlices.reduce((a,s)=>a+s.value,0)-FS.totalGB)<0.05,
    "Overview: storage donut does not sum to the storage total");
  console.assert(fileSlices.reduce((a,s)=>a+s.value,0)===FS.totalFiles,
    "Overview: file donut does not sum to the file total");

  /* The single most useful comparison in the data: the format that dominates
     storage is not the format that dominates the file count. */
  const bigStorage=storageSlices[0];
  const bigStorageFiles=fileSlices[0];
  const bigFiles=[...fileSlices].sort((a,b)=>b.value-a.value)[0];

  const html=`<section class="dash-ov">
    <div class="band">
      <h2>Executive summary</h2>
      <div class="bd">One view of how the EDRMS is being adopted across the bank. Each section below summarises a dashboard: open that dashboard for the full detail, filters, and drill down.</div>
    </div>

    <div class="kpis" id="ov-kpis"></div>

    <div class="panel">
      <div class="phead">
        <div>
          <div class="ptitle">Records Management</div>
          <div class="psub">How much of the content held in EDRMS compliant sites has been formally declared as a record, and which departments are declaring it.</div>
        </div>
        <button class="golink" data-go="rm">Open Records Management &rsaquo;</button>
      </div>
      <div class="crow">
        <div class="chart">
          <div class="ctitle">Declared records by physical counterpart</div>
          <div id="ov-rm-donut"></div>
        </div>
        <div class="chart">
          <div class="ctitle">Declared against everything held</div>
          <div id="ov-rm-gap"></div>
        </div>
        <div class="chart wide">
          <div class="ctitle">Top 5 departments by declared records</div>
          <div id="ov-rm-top"></div>
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="phead">
        <div>
          <div class="ptitle">Sites and Libraries</div>
          <div class="psub">How far the compliant site rollout has reached, and how thoroughly the libraries inside those sites are declaring their content.</div>
        </div>
        <button class="golink" data-go="sl">Open Sites and Libraries &rsaquo;</button>
      </div>
      <div class="crow">
        <div class="chart">
          <div class="ctitle">Library content declared as records</div>
          <div id="ov-sl-donut"></div>
        </div>
        <div class="chart wide">
          <div class="ctitle">Top 5 departments by compliant sites created</div>
          <div id="ov-sl-top"></div>
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="phead">
        <div>
          <div class="ptitle">Format and Storage</div>
          <div class="psub">Which file formats the declared records are held in, and which of them are actually consuming the storage.</div>
        </div>
        <button class="golink" data-go="fs">Open Format and Storage &rsaquo;</button>
      </div>
      <div class="crow">
        <div class="chart">
          <div class="ctitle">Share of storage consumed</div>
          <div id="ov-fs-gb"></div>
        </div>
        <div class="chart">
          <div class="ctitle">Share of files held</div>
          <div id="ov-fs-files"></div>
        </div>
      </div>
      <div id="ov-fs-callout"></div>
    </div>
  </section>`;

  function init(){
    /* headline cards, each one a route into the dashboard it came from */
    const cards=[
      {lab:"Total Declared Records", val:F(RM.declared),                 go:"rm", to:"Records Management"},
      {lab:"Documents in Compliant Sites", val:(RM.documents/1e6).toFixed(2)+"M", go:"rm", to:"Records Management"},
      {lab:"Compliant Sites Created", val:F(SL.sitesCreated),            go:"sl", to:"Sites and Libraries"},
      {lab:"Storage Consumed", val:GB(FS.totalGB),                       go:"fs", to:"Format and Storage"},
      {lab:"Active Sites, Last 7 Days", val:F(RM.activeSites7),          go:"rm", to:"Records Management"},
    ];
    document.getElementById("ov-kpis").innerHTML=cards.map(c=>
      `<div class="kpi" data-go="${c.go}"><div class="lab">${c.lab}</div><div class="val">${c.val}</div>
       <div class="tap">View in ${c.to} &rsaquo;</div></div>`).join("");

    /* Records Management */
    const physSlices=[
      {label:"Without physical counterpart",value:RM.withoutPhysical,color:C.grey},
      {label:"With physical counterpart",value:RM.withPhysical,color:C.teal},
    ];
    document.getElementById("ov-rm-donut").innerHTML=
      donutCard(physSlices,{centreValue:F(RM.declared),centreLabel:"declared records"},F);

    const rate=PCT(RM.declared,RM.documents);
    document.getElementById("ov-rm-gap").innerHTML=
      gapBars([
        {label:"Documents in compliant sites",value:RM.documents,color:C.orange},
        {label:"Declared as records",value:RM.declared,color:C.blue},
      ],F)+
      `<div class="callout"><b>${rate.toFixed(2)}%</b> of the documents held in EDRMS compliant sites have been declared as records. The remaining <b>${F(RM.documents-RM.declared)}</b> documents sit in compliant sites without record status.</div>`;

    document.getElementById("ov-rm-top").innerHTML=topBars(RM.topDepartments,F)+
      `<div class="mini"><div>Departments reporting<b>${F(RM.departmentCount)}</b></div>
        <div>Active users, last 7 days<b>${F(RM.activeUsers7)}</b></div></div>`;

    /* Sites and Libraries */
    const libSlices=[
      {label:"Declared as records",value:SL.libraryRecords,color:C.teal},
      {label:"Not yet declared",value:SL.libraryUndeclared,color:C.grey},
    ];
    document.getElementById("ov-sl-donut").innerHTML=
      donutCard(libSlices,{centreValue:PCT(SL.libraryRecords,SL.libraryDocuments).toFixed(1)+"%",centreLabel:"declared"},F);

    document.getElementById("ov-sl-top").innerHTML=topBars(SL.topDepartments,F)+
      `<div class="mini"><div>Compliant sites created<b>${F(SL.sitesCreated)}</b></div>
        <div>Libraries tracked<b>${F(SL.libraryCount)}</b></div>
        <div>Library storage<b>${GB(SL.storageGB)}</b></div></div>`;

    /* Format and Storage, two donuts sharing one colour scheme so they can be
       read against each other */
    document.getElementById("ov-fs-gb").innerHTML=
      donutCard(storageSlices,{centreValue:GB(FS.totalGB),centreLabel:"total storage"},GB);
    document.getElementById("ov-fs-files").innerHTML=
      donutCard(fileSlices,{centreValue:F(FS.totalFiles),centreLabel:"total files"},F);

    const gbShare=PCT(bigStorage.value,FS.totalGB), fileShare=PCT(bigStorageFiles.value,FS.totalFiles);
    document.getElementById("ov-fs-callout").innerHTML=
      `<div class="callout">The two charts do not agree, and that is the point. <b>${bigStorage.label}</b> account for <b>${gbShare.toFixed(1)}%</b> of storage but only <b>${fileShare.toFixed(1)}%</b> of files, while <b>${bigFiles.label}</b> are the most numerous at <b>${PCT(bigFiles.value,FS.totalFiles).toFixed(1)}%</b> of files. Storage pressure comes from a small number of large files, not from the formats people create most often.</div>`;

    /* every card and button routes to the dashboard the figure came from */
    document.querySelectorAll(".dash-ov [data-go]").forEach(el=>
      el.onclick=()=>switchTo(el.dataset.go));
  }

  return {
    ver:"Overview Dashboard",
    crumb:"Overview",
    /* A summary is only as current as its stalest input, so this quotes the
       oldest refresh across the dashboards it draws from rather than the newest. */
    asof:"Data as of Sun 05 Jul 2026 23:59, the oldest refresh across the dashboards summarised here",
    html,init
  };
})();
