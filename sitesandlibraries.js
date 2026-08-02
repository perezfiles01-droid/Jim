/* ===================================================================
   Sites and Libraries
   Source: EDRMS_Sites_and_Libraries_Dashboard_v1.html
   =================================================================== */
DASHBOARDS.sl=(function(){
  /* --- pager: this variant prints the row count even on a single page --- */
  function pager(total,page,pages,noun){
    if(pages<=1)return `<div class="pager"><div class="pinfo">Showing 1 to ${F(total)} of ${F(total)} ${noun}</div><div></div></div>`;
    const win=[];for(let p=1;p<=pages;p++){if(p===1||p===pages||Math.abs(p-page)<=1)win.push(p);}
    let nums="",last=0;win.forEach(p=>{if(last&&p-last>1)nums+=`<span style="color:var(--mut)">…</span>`;nums+=`<button class="${p===page?'on':''}" data-pg="${p}">${p}</button>`;last=p;});
    const from=(page-1)*10+1,to=Math.min(total,page*10);
    return `<div class="pager"><div class="pinfo">Showing ${from} to ${to} of ${F(total)} ${noun}</div>
      <div class="pbtns"><button data-pg="prev" ${page===1?'disabled':''}>‹ Prev</button>${nums}<button data-pg="next" ${page===pages?'disabled':''}>Next ›</button></div></div>`;
  }
  function rangeFactor(sId,eId){
    const s=(document.getElementById(sId)||{}).value||"",e=(document.getElementById(eId)||{}).value||"";
    if(s===""&&e==="")return 1;
    const sd=s?new Date(s+"T00:00:00"):null, ed=e?new Date(e+"T00:00:00"):null;
    let sM=(sd&&!isNaN(sd))?(sd.getFullYear()<2026?0:sd.getFullYear()>2026?12:sd.getMonth()):0;
    let eM=(ed&&!isNaN(ed))?(ed.getFullYear()>2026?11:ed.getFullYear()<2026?-1:ed.getMonth()):11;
    const months=Math.min(11,eM)-Math.max(0,sM)+1;
    return Math.max(0,Math.min(1,months/12));
  }

  /* ===== data ===== */
  const SITEDEPTS=[
   ["ITD","Information Technology",40],["SARD","South Asia Regional",36],["OSFG","Sovereign Operations",32],
   ["FIN","Finance",28],["PARD","Procurement and Admin",26],["HRD","Human Resources",24],
   ["SERD","Southeast Asia",22],["OGC","General Counsel",21],["EARD","East Asia Regional",20],
   ["BRM","Budget and Mgmt Services",19],["CWRD","Central and West Asia",17],["PSOD","Private Sector Operations",15],
   ["SPD","Strategy and Policy",12],["SDCC","Sustainable Dev and Climate",10],["OAS","Administrative Services",8],
  ];
  const DNAME={};SITEDEPTS.forEach(d=>DNAME[d[0]]=d[1]);
  const ALLTIME_SITES=1057;

  /* [lib, site, dept, docs, records, storageGB] */
  const LIBS=[
   ["Final Documents","ITD Records Site","ITD",3200,640,4.2],
   ["Loan Agreements","FIN Treasury Site","FIN",2400,384,6.8],
   ["Correspondence","PARD Procurement Site","PARD",2100,210,1.9],
   ["Board Papers","OGC Legal Site","OGC",1800,540,5.4],
   ["Country Reports","SARD Ops Site","SARD",1500,450,3.1],
   ["Field Reports","SERD Ops Site","SERD",1300,286,7.2],
   ["Project Completion","OSFG Country Site","OSFG",1200,300,8.9],
   ["Case Files","OGC Compliance Site","OGC",1000,280,2.4],
   ["Policies","HRD People Site","HRD",900,315,0.8],
   ["Minutes","BRM Budget Site","BRM",700,245,0.5],
   ["Legal Opinions","OGC Advisory Site","OGC",640,150,0.45],
   ["Audit Reports","CWRD Ops Site","CWRD",580,120,0.42],
   ["Investment Memos","PSOD Investments Site","PSOD",520,180,0.38],
   ["Climate Briefs","SDCC Climate Site","SDCC",460,95,0.35],
   ["Admin Records","OAS Facilities Site","OAS",400,88,0.30],
  ];
  const TOTAL_RECORDS=LIBS.reduce((a,l)=>a+l[4],0);
  const TOTAL_GB=LIBS.reduce((a,l)=>a+l[5],0);

  /* ===== treemap ===== */
  function squarify(items,x,y,w,h){
    const area=w*h,sum=items.reduce((a,b)=>a+b.v,0)||1;
    let rem=items.map(it=>({...it,area:it.v/sum*area})),R=[],rx=x,ry=y,rw=w,rh=h;
    function worst(a,side){const s=a.reduce((p,q)=>p+q,0),mx=Math.max(...a),mn=Math.min(...a);return Math.max(side*side*mx/(s*s),(s*s)/(side*side*mn));}
    while(rem.length){const side=Math.min(rw,rh);let row=[rem[0]],wr=worst(row.map(z=>z.area),side);
      while(row.length<rem.length){const t=row.concat([rem[row.length]]);const w3=worst(t.map(z=>z.area),side);if(w3>wr)break;row=t;wr=w3;}
      const ra=row.reduce((a,b)=>a+b.area,0);
      if(rw>=rh){const cw=ra/rh;let cy=ry;row.forEach(z=>{const ch=z.area/cw;R.push({...z,x:rx,y:cy,w:cw,h:ch});cy+=ch;});rx+=cw;rw-=cw;}
      else{const rhh=ra/rw;let cx=rx;row.forEach(z=>{const cwd=z.area/rhh;R.push({...z,x:cx,y:ry,w:cwd,h:rhh});cx+=cwd;});ry+=rhh;rh-=rhh;}
      rem=rem.slice(row.length);}
    return R;
  }
  function shade(v,mn,mx){const t=mx>mn?(v-mn)/(mx-mn):0.6;const L=[156,195,236],D=[8,52,90];const c=i=>Math.round(L[i]+(D[i]-L[i])*t);return `rgb(${c(0)},${c(1)},${c(2)})`;}
  function darkText(v,mn,mx){const t=mx>mn?(v-mn)/(mx-mn):0.6;return t<0.42;}

  let sitePage=1;
  function renderS1(){
    document.getElementById("s1-detail").innerHTML=`<div class="panel">
      <div class="ptitle">Sites created by department</div>
      <div class="psub">Each block is a department, sized by the number of compliant sites created. Darker means more sites.</div>
      <div class="tilesrow">
        <div class="tiles">
          <div class="tile"><div class="tl">Total sites created</div><div class="tv">${F(ALLTIME_SITES)}</div></div>
          <div class="tile hi"><div class="tl">Total sites created by date range</div><div class="tv" id="st-tile2">—</div></div>
        </div>
        <div class="stfilter">
          <div class="drange">Date range <input type="date" id="st-s"> to <input type="date" id="st-e"></div>
          <button class="resetbtn" id="st-reset"><i>↺</i> Reset filter</button>
        </div>
      </div>
      <div id="st-treemap"></div>
      <div class="tmlegend"><span>Fewer sites</span><span class="sw" style="background:rgb(156,195,236)"></span><span class="sw" style="background:rgb(120,163,201)"></span><span class="sw" style="background:rgb(84,120,152)"></span><span class="sw" style="background:rgb(8,52,90)"></span><span>More sites</span></div>
      <div id="st-pager"></div></div>`;
    document.getElementById("st-s").onchange=()=>{sitePage=1;drawTreemap();};
    document.getElementById("st-e").onchange=()=>{sitePage=1;drawTreemap();};
    document.getElementById("st-reset").onclick=()=>{document.getElementById("st-s").value="";document.getElementById("st-e").value="";sitePage=1;drawTreemap();};
    drawTreemap();
  }
  function drawTreemap(){
    const factor=rangeFactor("st-s","st-e");
    const depts=SITEDEPTS.map(d=>({label:d[0],name:d[1],v:Math.max(1,Math.round(d[2]*factor))})).sort((a,b)=>b.v-a.v);
    document.getElementById("st-tile2").textContent=F(depts.reduce((a,b)=>a+b.v,0));
    const pages=Math.ceil(depts.length/10);if(sitePage>pages)sitePage=pages;
    const page=depts.slice((sitePage-1)*10,sitePage*10);
    const mn=Math.min(...page.map(d=>d.v)),mx=Math.max(...page.map(d=>d.v));
    const rects=squarify(page,0,0,900,400);
    let svg="";
    rects.forEach(r=>{const x=r.x+3,y=r.y+3,w=r.w-6,h=r.h-6;const t=darkText(r.v,mn,mx),tc=t?"#082F4E":"#FFFFFF",sc=t?"#2C567A":"#DCEBFA";
      svg+=`<g><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="7" fill="${shade(r.v,mn,mx)}"><title>${r.name}: ${r.v} sites</title></rect>`;
      svg+=`<text x="${(x+14).toFixed(1)}" y="${(y+27).toFixed(1)}" font-size="15" font-weight="700" fill="${tc}">${r.label}</text>`;
      svg+=`<text x="${(x+14).toFixed(1)}" y="${(y+44).toFixed(1)}" font-size="11" fill="${sc}">${r.name}</text>`;
      svg+=`<text x="${(x+14).toFixed(1)}" y="${(y+h-15).toFixed(1)}" font-size="26" font-weight="700" fill="${tc}" style="font-variant-numeric:tabular-nums">${r.v}</text></g>`;
    });
    document.getElementById("st-treemap").innerHTML=`<svg viewBox="0 0 900 400" width="100%" style="display:block;max-height:430px">${svg}</svg>`;
    document.getElementById("st-pager").innerHTML=pager(depts.length,sitePage,pages,"departments");
    wirePager("#st-pager",v=>{sitePage=v==="prev"?Math.max(1,sitePage-1):v==="next"?Math.min(pages,sitePage+1):+v;drawTreemap();});
  }

  /* ===== libraries ===== */
  function deptOptions(sel){const codes=[...new Set(LIBS.map(l=>l[2]))];return `<option value="all">All departments</option>`+codes.map(c=>`<option value="${c}" ${sel===c?"selected":""}>${c} — ${DNAME[c]||c}</option>`).join("");}
  let deptDecl="all",fieldDecl="docs",dirDecl="desc",pageDecl=1;
  let deptStor="all",fieldStor="gb",dirStor="desc",pageStor=1;
  let curS2="decl";

  function renderS2(which){
    curS2=which;
    document.querySelectorAll("#s2-kpis .kpi").forEach(k=>k.classList.toggle("on",k.dataset.k===which));
    const box=document.getElementById("s2-detail");
    if(which==="decl"){
      box.innerHTML=`<div class="panel">
        <div class="ptitle">Libraries declaration rate</div>
        <div class="psub">How much of each library's content has been declared as records. Bars stack the declared portion over the not yet declared portion, sized to total documents.</div>
        <div class="toolbar">
          <span>Department <select id="decl-dept">${deptOptions(deptDecl)}</select></span>
          <div class="drange">Date range <input type="date" id="decl-s"> to <input type="date" id="decl-e"></div>
          <button class="resetbtn" id="decl-reset"><i>↺</i> Reset filter</button>
        </div>
        <div class="sortwrap">
          <div class="legend"><span class="lg"><span class="sw" style="background:var(--teal)"></span>Declared as records</span><span class="lg"><span class="sw" style="background:var(--greyblue)"></span>Not yet declared</span></div>
          <div class="sortctl"><span class="lbl">Sort by</span>
            <div class="segctl" id="decl-field"><button data-f="docs">Documents</button><button data-f="rec">Records</button><button data-f="rate">Rate</button></div>
            <button class="dirbtn" id="decl-dir"></button></div>
        </div>
        <div id="decl-rows"></div><div id="decl-pager"></div></div>`;
      document.getElementById("decl-dept").onchange=e=>{deptDecl=e.target.value;pageDecl=1;drawDecl();};
      document.getElementById("decl-s").onchange=()=>{pageDecl=1;drawDecl();};
      document.getElementById("decl-e").onchange=()=>{pageDecl=1;drawDecl();};
      document.getElementById("decl-reset").onclick=()=>{deptDecl="all";fieldDecl="docs";dirDecl="desc";pageDecl=1;document.getElementById("decl-dept").value="all";document.getElementById("decl-s").value="";document.getElementById("decl-e").value="";drawDecl();};
      document.querySelectorAll("#decl-field button").forEach(b=>b.onclick=()=>{fieldDecl=b.dataset.f;pageDecl=1;drawDecl();});
      document.getElementById("decl-dir").onclick=()=>{dirDecl=dirDecl==="desc"?"asc":"desc";drawDecl();};
      drawDecl();
    }else{
      box.innerHTML=`<div class="panel">
        <div class="ptitle">Largest libraries by storage</div>
        <div class="psub">Libraries ranked by total storage consumed. Storage per library is the sum of its file sizes.</div>
        <div class="toolbar">
          <span>Department <select id="stor-dept">${deptOptions(deptStor)}</select></span>
          <div class="drange">Date range <input type="date" id="stor-s"> to <input type="date" id="stor-e"></div>
          <button class="resetbtn" id="stor-reset"><i>↺</i> Reset filter</button>
        </div>
        <div class="sortwrap"><span></span>
          <div class="sortctl"><span class="lbl">Sort by</span>
            <div class="segctl" id="stor-field"><button data-f="gb">Storage</button><button data-f="docs">Documents</button><button data-f="avg">Avg file size</button></div>
            <button class="dirbtn" id="stor-dir"></button></div>
        </div>
        <div id="stor-rows"></div><div id="stor-pager"></div></div>`;
      document.getElementById("stor-dept").onchange=e=>{deptStor=e.target.value;pageStor=1;drawStor();};
      document.getElementById("stor-s").onchange=()=>{pageStor=1;drawStor();};
      document.getElementById("stor-e").onchange=()=>{pageStor=1;drawStor();};
      document.getElementById("stor-reset").onclick=()=>{deptStor="all";fieldStor="gb";dirStor="desc";pageStor=1;document.getElementById("stor-dept").value="all";document.getElementById("stor-s").value="";document.getElementById("stor-e").value="";drawStor();};
      document.querySelectorAll("#stor-field button").forEach(b=>b.onclick=()=>{fieldStor=b.dataset.f;pageStor=1;drawStor();});
      document.getElementById("stor-dir").onclick=()=>{dirStor=dirStor==="desc"?"asc":"desc";drawStor();};
      drawStor();
    }
  }
  function paintSeg(scope,field){document.querySelectorAll(scope+" button").forEach(b=>b.classList.toggle("on",b.dataset.f===field));}
  function drawDecl(){
    const f=rangeFactor("decl-s","decl-e");
    let rows=LIBS.filter(l=>deptDecl==="all"||l[2]===deptDecl).map(l=>({lib:l[0],site:l[1],docs:Math.round(l[3]*f),rec:Math.round(l[4]*f)}));
    const val={docs:r=>r.docs,rec:r=>r.rec,rate:r=>r.docs?r.rec/r.docs:0};
    rows.sort((a,b)=>dirDecl==="desc"?val[fieldDecl](b)-val[fieldDecl](a):val[fieldDecl](a)-val[fieldDecl](b));
    paintSeg("#decl-field",fieldDecl);
    document.getElementById("decl-dir").innerHTML=(dirDecl==="desc"?'▼ Highest first':'▲ Lowest first');
    const mx=Math.max(...rows.map(r=>r.docs),1);
    const pages=Math.max(1,Math.ceil(rows.length/10));if(pageDecl>pages)pageDecl=pages;
    const pg=rows.slice((pageDecl-1)*10,pageDecl*10);
    document.getElementById("decl-rows").innerHTML=pg.map(r=>{
      const tot=100*r.docs/mx, tealW=r.docs?100*r.rec/mx:0, greyW=r.docs?100*(r.docs-r.rec)/mx:0, rate=r.docs?Math.round(r.rec/r.docs*100):0;
      return `<div class="sbar"><div class="sl"><b>${r.lib}</b><small>${r.site}</small></div>
        <div class="st"><div class="seg e" style="width:${tealW}%"></div><div class="seg p" style="width:${greyW}%"></div></div>
        <div class="vv"><b>${F(r.docs)}</b><span> docs · ${F(r.rec)} rec · ${rate}%</span></div></div>`;}).join("");
    document.getElementById("decl-pager").innerHTML=pager(rows.length,pageDecl,pages,"libraries");
    wirePager("#decl-pager",v=>{pageDecl=v==="prev"?Math.max(1,pageDecl-1):v==="next"?Math.min(pages,pageDecl+1):+v;drawDecl();});
  }
  function drawStor(){
    const f=rangeFactor("stor-s","stor-e");
    let rows=LIBS.filter(l=>deptStor==="all"||l[2]===deptStor).map(l=>({lib:l[0],site:l[1],docs:Math.round(l[3]*f),gb:l[5]*f}));
    const val={gb:r=>r.gb,docs:r=>r.docs,avg:r=>r.docs?r.gb*1024/r.docs:0};
    rows.sort((a,b)=>dirStor==="desc"?val[fieldStor](b)-val[fieldStor](a):val[fieldStor](a)-val[fieldStor](b));
    paintSeg("#stor-field",fieldStor);
    document.getElementById("stor-dir").innerHTML=(dirStor==="desc"?'▼ Highest first':'▲ Lowest first');
    const mx=Math.max(...rows.map(r=>r.gb),0.1);
    const pages=Math.max(1,Math.ceil(rows.length/10));if(pageStor>pages)pageStor=pages;
    const pg=rows.slice((pageStor-1)*10,pageStor*10);
    document.getElementById("stor-rows").innerHTML=pg.map(r=>{
      const w=100*r.gb/mx, avg=r.docs?(r.gb*1024/r.docs).toFixed(1):"0.0";
      return `<div class="sbar"><div class="sl"><b>${r.lib}</b><small>${r.site}</small></div>
        <div class="st" style="background:#EEF3F8"><div class="single" style="width:${Math.max(4,w)}%"></div></div>
        <div class="vv"><b>${r.gb.toFixed(1)} GB</b><span> · ${F(r.docs)} files · ${avg} MB avg</span></div></div>`;}).join("");
    document.getElementById("stor-pager").innerHTML=pager(rows.length,pageStor,pages,"libraries");
    wirePager("#stor-pager",v=>{pageStor=v==="prev"?Math.max(1,pageStor-1):v==="next"?Math.min(pages,pageStor+1):+v;drawStor();});
  }

  const html=`<section class="dash-sl">
    <div class="band">
      <h2>Compliant site rollout</h2>
      <div class="bd">How many EDRMS compliant sites have been created, and how new site creation is spread across departments.</div>
    </div>
    <div class="kpis" id="s1-kpis">
      <div class="kpi on"><div class="lab">Total EDRMS Compliant Sites Created</div><div class="val">1,057</div><div class="tap">▾ Opened below</div></div>
    </div>
    <div id="s1-detail"></div>

    <div class="band">
      <h2>Library adoption and volume</h2>
      <div class="bd">How thoroughly libraries are declaring records, and which libraries hold the most content.</div>
    </div>
    <div class="kpis" id="s2-kpis">
      <div class="kpi on" data-k="decl"><div class="lab">Libraries Declaration Rate</div><div class="val" id="kpi-decl">—</div><div class="tap">▾ Click to open</div></div>
      <div class="kpi" data-k="stor"><div class="lab">Largest Libraries</div><div class="val" id="kpi-stor">—</div><div class="tap">▾ Click to open</div></div>
    </div>
    <div id="s2-detail"></div>
  </section>`;

  function init(){
    document.getElementById("kpi-decl").textContent=F(TOTAL_RECORDS);
    document.getElementById("kpi-stor").textContent=TOTAL_GB.toFixed(1)+" GB";
    document.querySelectorAll("#s2-kpis .kpi").forEach(k=>k.onclick=()=>renderS2(k.dataset.k));
    renderS1();
    renderS2(curS2);
  }

  return {
    ver:"Sites and Libraries Dashboard",
    crumb:"Sites and Libraries Dashboard",
    asof:"Data as of Sun 05 Jul 2026 23:59 · refreshed Mon 06 Jul 06:00",
    /* Read by the Overview dashboard. Derived from the same arrays this
       dashboard renders, so a summary figure can never drift from the detail. */
    summary:{
      sitesCreated:ALLTIME_SITES,
      sitesInSample:SITEDEPTS.reduce((a,d)=>a+d[2],0),
      libraryCount:LIBS.length,
      libraryDocuments:LIBS.reduce((a,l)=>a+l[3],0),
      libraryRecords:TOTAL_RECORDS,
      get libraryUndeclared(){return this.libraryDocuments-this.libraryRecords;},
      storageGB:TOTAL_GB,
      topDepartments:[...SITEDEPTS].sort((a,b)=>b[2]-a[2]).slice(0,5).map(d=>({label:d[0],name:d[1],value:d[2]})),
      departmentCount:SITEDEPTS.length
    },
    html,init
  };
})();
