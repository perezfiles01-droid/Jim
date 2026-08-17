/* Read every named thing off the prototype, in screen order, and write it as
 * JSON for the content workbook builder.
 *
 * Why it is scraped rather than typed. The client's instruction for the
 * workbook was "do it similar to how exactly the prototype is named so I will
 * not get confused". A hand-typed list satisfies that on the day it is written
 * and drifts the first time a label changes: the previous checker workbook
 * described a prototype that no longer existed within four days. Reading the
 * labels off the rendered page means the workbook cannot disagree with the
 * screen, because it has no independent copy of the names.
 *
 * It walks: every dashboard, every KPI tile, every drill behind every tile,
 * and every drill's own tiles and column headings, plus the panel titles and
 * table headings on the dashboards that have no drill rail.
 *
 *   node extract_contents.js /home/user/Jim/index.html > contents.json
 */
const {chromium}=require("/tmp/node_modules/playwright-core");
const path=process.argv[2]||"/home/user/Jim/index.html";
const url=path.startsWith("http")?path:"file://"+path;

const DASH=[["bw","Bank-wide Oversight"],["dp","Department Insights"],
            ["fp","Institutional File Plan"],["rd","Retention and Disposal"],
            ["ra","Records and Archive Holdings"]];

const out=[];
let seq=0;
const add=(dash,where,kind,name)=>{
  name=(name||"").replace(/\s+/g," ").trim();
  if(!name)return;
  /* the sort arrow the site table appends to its active column is chrome,
     not part of the name */
  name=name.replace(/\s*[↓↑]\s*$/,"");
  out.push({n:++seq,dashboard:dash,where,kind,name});
};

/* Read the KPI rail currently on screen. */
const readKpis=()=>[...document.querySelectorAll("#view .kpi")].map(k=>({
  lab:(k.querySelector(".lab")||{}).textContent||"",
  key:k.dataset.k||k.dataset.go||""
}));

/* Read ONE container: its title, its stat tiles and its column headings.
   Used for the drill area, which must be addressed by its own id. Reading
   "the last panel on the page" instead picks up whatever panel happens to sit
   at the bottom of the dashboard, which is how the first run of this script
   labelled every Bank-wide drill "Records Declaration Trend". */
const readOne=sel=>{
  const p=document.querySelector(sel);
  if(!p)return null;
  return {
    title:(p.querySelector(".ptitle")||{}).textContent||"",
    tiles:[...p.querySelectorAll(".tile .tl")].map(e=>e.textContent),
    cols:[...p.querySelectorAll(".dhead > div")].map(e=>e.textContent),
    specs:[...p.querySelectorAll(".asks li, .colspec li")].map(e=>e.textContent)
  };
};

/* Read the drill or panel area: its title, its stat tiles and its columns. */
const readPanels=()=>[...document.querySelectorAll("#view .panel")].map(p=>({
  title:(p.querySelector(".ptitle")||{}).textContent||"",
  tiles:[...p.querySelectorAll(".tile .tl")].map(e=>e.textContent),
  cols:[...p.querySelectorAll(".dhead > div")].map(e=>e.textContent),
  specs:[...p.querySelectorAll(".asks li, .colspec li")].map(e=>e.textContent)
}));

const readBands=()=>[...document.querySelectorAll("#view .band h2")].map(e=>e.textContent);

(async()=>{
  const browser=await chromium.launch(
    {executablePath:"/opt/pw-browsers/chromium-1194/chrome-linux/chrome"});
  const page=await browser.newPage({viewport:{width:1600,height:1200}});
  await page.goto(url);await page.waitForTimeout(500);

  for(const [key,label] of DASH){
    await page.evaluate(k=>switchTo(k),key);
    await page.waitForTimeout(250);

    (await page.evaluate(readBands)).forEach(b=>add(label,"Section heading","Band",b));

    const kpis=await page.evaluate(readKpis);
    kpis.forEach(k=>add(label,"Top panel","KPI tile",k.lab));

    /* Every tile that opens a drill, opened in turn. */
    const keys=kpis.map(k=>k.key).filter(Boolean);
    if(keys.length){
      for(const k of keys){
        const sel=`#view .kpi[data-k="${k}"]`;
        if(!(await page.$(sel)))continue;          /* navigation tiles leave */
        await page.click(sel);
        await page.waitForTimeout(150);
        const p=await page.evaluate(s=>{
          const q=document.querySelector(s);
          if(!q)return null;
          return {
            title:(q.querySelector(".ptitle")||{}).textContent||"",
            tiles:[...q.querySelectorAll(".tile .tl")].map(e=>e.textContent),
            cols:[...q.querySelectorAll(".dhead > div")].map(e=>e.textContent),
            specs:[...q.querySelectorAll(".asks li")].map(e=>e.textContent)
          };
        },`#${key}-drill, #${key}-sites`);
        if(!p)continue;
        const where=`Drill behind "${(kpis.find(x=>x.key===k)||{}).lab.replace(/\s+/g," ").trim()}"`;
        add(label,where,"Drill title",p.title);
        (p.tiles||[]).forEach(t=>add(label,where,"Drill stat",t));
        (p.cols||[]).forEach(c=>add(label,where,"Table column",c));
        (p.specs||[]).forEach(s=>add(label,where,"Also asked for",s));
      }
    }else{
      /* fp, rd and ra have no drill rail: read their panels as they stand */
      (await page.evaluate(readPanels)).forEach(p=>{
        const where=p.title?`Panel "${p.title.replace(/\s+/g," ").trim()}"`:"Panel";
        add(label,where,"Panel title",p.title);
        (p.tiles||[]).forEach(t=>add(label,where,"Panel stat",t));
        (p.cols||[]).forEach(c=>add(label,where,"Table column",c));
        (p.specs||[]).forEach(s=>add(label,where,"Column this screen needs",s));
      });
    }
  }
  await browser.close();
  process.stdout.write(JSON.stringify(out,null,1));
})();
