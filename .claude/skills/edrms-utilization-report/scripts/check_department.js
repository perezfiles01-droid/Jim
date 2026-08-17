/* Department Insights, stage 2 of the client redesign of 13 Aug 2026.
 *
 * The thing most worth checking here is the one a stakeholder would notice
 * first and we would notice last: a department's site rows must add back up to
 * the department header, and the department header must equal what Bank-wide
 * and Records Management say about the same department. A split that drifts by
 * one produces a page that looks entirely correct.
 *
 *   node check_department.js /home/user/Jim/index.html
 */
const {chromium}=require("/tmp/node_modules/playwright-core");
const path=process.argv[2]||"/home/user/Jim/index.html";
const url=path.startsWith("http")?path:"file://"+path;

let pass=0,fail=0;
const ok =(c,m)=>{c?(pass++,console.log("  pass  "+m)):(fail++,console.log("  FAIL  "+m));};
const settle=async(page,sel)=>{
  await page.waitForTimeout(120);
  await page.$eval(sel,e=>e.scrollIntoView({block:"center"}));
  await page.waitForTimeout(120);
  await page.$eval(sel,e=>e.click());
};

const eq =(a,b,m)=>ok(a===b,`${m} (${a}${a===b?"":" , expected "+b})`);

(async()=>{
  const browser=await chromium.launch({executablePath:"/opt/pw-browsers/chromium-1194/chrome-linux/chrome"});
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];
  page.on("console",m=>{if(m.type()==="error"||m.type()==="assert")errors.push(m.text());});
  page.on("pageerror",e=>errors.push(String(e)));
  await page.goto(url,{waitUntil:"load"});
  await page.evaluate(()=>switchTo("dp"));

  console.log("\nThe picker, which drives every panel");
  const opts=await page.$$eval(".dash-dp #dp-sel option",els=>els.map(e=>e.value));
  eq(opts.length,16,"every department is offered");
  /* The Go-Live date came off with every other unsourced measure. s53 draws
     it, but Cloud Governance records when the SharePoint site was created,
     which for a converted site is not when it became EDRMS compliant, and no
     column anywhere holds the real date. Rather than print an empty field the
     whole line is gone, and its absence is asserted so a later edit cannot
     quietly restore an invented date. Audit question 4 still stands. */
  const golive=await page.$(".dash-dp #dp-golive");
  ok(!golive,"the Go-Live date is absent, not printed empty");

  console.log("\nTop panel, PPT s19 and s53");
  const tiles=await page.$$eval(".dash-dp #dp-kpis .kpi",els=>els.map(e=>({
    lab:e.querySelector(".lab").textContent.trim(),
    val:e.querySelector(".val").textContent.trim(),
    tap:!!e.querySelector(".tap"),stat:e.classList.contains("stat")})));
  /* s53 draws SEVEN tiles, and their note says "Clickable top panel stats to
     show data", so all seven open a table. */
  eq(tiles.length,7,"seven top panel tiles, one per PPT s53 stat");
  eq(tiles.filter(t=>t.tap).length,7,"every tile promises a click, as their note asks");
  eq(tiles.filter(t=>t.stat).length,0,"no tile is static");
  ok(tiles.every(t=>t.val.length>0),"every tile carries a value");
  eq(tiles[0].lab,"Total number of sites created","the tiles carry the client's own labels");
  eq(tiles[6].lab,"Total number of records due for disposal","and the last one too");

  /* The reconciliation that matters. Walk every department, not just the one
     that happens to be selected: a weighted split can be exact for a large
     department and one out for a small one. */
  console.log("\nEvery department reconciles, all 16 walked");
  /* The site list is now the drill behind tile 1, s55, rather than a separate
     panel further down: s20 and s55 draw the same table. */
  await page.click('.dash-dp #dp-kpis .kpi[data-k="sites"]');
  const bad=await page.evaluate(()=>{
    const BW=DASHBOARDS.bw.summary, out=[];
    const sel=document.getElementById("dp-sel");
    for(const d of BW.departments){
      sel.value=d.code; sel.dispatchEvent(new Event("change"));
      document.querySelector('#dp-kpis .kpi[data-k="sites"]').click();
      const rows=[...document.querySelectorAll("#dp-sites .drow")];
      /* the visible page is 10 rows, so read the department total row instead
         and compare it against Bank-wide, then check the split separately */
      const tot=[...document.querySelector("#dp-sites .dtot").children].map(c=>c.textContent.trim());
      const n=v=>+v.replace(/[^0-9]/g,"");
      if(n(tot[2])!==d.docs)out.push(d.code+" documents "+tot[2]+" vs "+d.docs);
      if(n(tot[3])!==d.rec) out.push(d.code+" records "+tot[3]+" vs "+d.rec);
      if(n(tot[4])!==d.phys)out.push(d.code+" counterparts "+tot[4]+" vs "+d.phys);
      if(n(tot[5])!==d.due) out.push(d.code+" due "+tot[5]+" vs "+d.due);
    }
    return out;
  });
  ok(bad.length===0,"every department header equals what Bank-wide says about it"+
     (bad.length?": "+bad.slice(0,4).join(" | "):""));

  console.log("\nThe site split adds back up to the department");
  const splitBad=await page.evaluate(()=>{
    const BW=DASHBOARDS.bw.summary, out=[];
    const dp=DASHBOARDS.dp;
    /* reach the module's own numbers through the rendered pages rather than
       internals: page through every site row and sum it */
    const sel=document.getElementById("dp-sel");
    for(const d of BW.departments.slice(0,6)){
      sel.value=d.code; sel.dispatchEvent(new Event("change"));
      document.querySelector('#dp-kpis .kpi[data-k="sites"]').click();
      let rec=0,docs=0,seen=0,guard=0;
      while(guard++<40){
        document.querySelectorAll("#dp-sites .drow").forEach(r=>{
          const c=[...r.children].map(x=>x.textContent.replace(/[^0-9]/g,""));
          docs+=+c[2];rec+=+c[3];seen++;
        });
        const next=document.querySelector('#dp-sites-pager button[data-pg="next"]');
        if(!next||next.disabled)break;
        next.click();
      }
      if(rec!==d.rec)  out.push(d.code+" site records summed "+rec+" vs "+d.rec);
      if(docs!==d.docs)out.push(d.code+" site documents summed "+docs+" vs "+d.docs);
      if(seen!==d.sites)out.push(d.code+" listed "+seen+" sites vs "+d.sites);
    }
    return out;
  });
  ok(splitBad.length===0,"site rows sum to the department total across every page"+
     (splitBad.length?": "+splitBad.slice(0,4).join(" | "):""));

  console.log("\nThe five drill tables, PPT s21 to s23 and s54 to s60");
  await page.selectOption(".dash-dp #dp-sel","ITD");
  const expect={sites:"overview of edrms sites",users:"users",visitors:"visitor",
                docs:"documents",rec:"declaration",phys:"physical",disp:"disposal"};
  for(const k of Object.keys(expect)){
    await settle(page,`.dash-dp #dp-kpis .kpi[data-k="${k}"]`);
    const t=await page.$eval(".dash-dp #dp-drill .ptitle",e=>e.textContent.toLowerCase());
    ok(t.includes(expect[k]),`tile ${k} opens the ${expect[k]} table`);
    const open=await page.$$eval(".dash-dp #dp-kpis .kpi.on",els=>els.length);
    eq(open,1,`exactly one tile reads as open on ${k}`);
  }

  console.log("\nSorting and paging the site list, PPT s20 and s55");
  await page.click('.dash-dp #dp-kpis .kpi[data-k="sites"]');
  await page.click('.dash-dp #dp-sites .hd[data-s="name"]');
  const names=await page.$$eval(".dash-dp #dp-sites .drow",els=>
    els.map(e=>e.children[0].textContent.trim()));
  ok(names.every((v,i)=>i===0||names[i-1].localeCompare(v)<=0),"sorting by site name is alphabetical");
  await page.click('.dash-dp #dp-sites .hd[data-s="rec"]');
  const recs=await page.$$eval(".dash-dp #dp-sites .drow",els=>
    els.map(e=>+e.children[3].textContent.replace(/[^0-9]/g,"")));
  ok(recs.every((v,i)=>i===0||recs[i-1]>=v),"sorting by records orders highest first");
  const p1=await page.$eval(".dash-dp #dp-sites-pager .pinfo",e=>e.textContent);
  await page.click('.dash-dp #dp-sites-pager button[data-pg="next"]');
  const p2=await page.$eval(".dash-dp #dp-sites-pager .pinfo",e=>e.textContent);
  ok(p1!==p2,"the pager advances a page");
  ok(/Showing 11 to/.test(p2),"page two starts at row 11, the house pattern of 10 a page");

  console.log("\nLibrary usage by file plan category, PPT s61 to s66");
  /* Six slides with one layout, built as one screen with a category picker.
     The client's "Number of users" column is gone: Microsoft 365 publishes
     activity per SITE and never per LIBRARY, so no source can fill it. The
     declaration rate takes its place, being derivable from two columns that
     are already on the row. */
  const libHead=await page.$$eval(".dash-dp #dp-libs .dhead div",els=>els.map(e=>e.textContent.trim()));
  const libWant=["Library names","Number of documents","Number of records declared",
                 "Number of physical counterparts","Declaration rate"];
  ok(JSON.stringify(libHead)===JSON.stringify(libWant),
     `the library table column names are the client's, verbatim${
       libHead.join(" | ")!==libWant.join(" | ")?": got "+libHead.join(" | "):""}`);
  const libRows=await page.$$eval(".dash-dp #dp-libs .drow",els=>els.length);
  ok(libRows>0,`the first category lists its libraries (${libRows})`);
  await page.selectOption(".dash-dp #dp-cat","Programs and Operations");
  const po=await page.$$eval(".dash-dp #dp-libs .drow .dn small",els=>els.map(e=>e.textContent.trim()));
  ok(po.length>0&&po.every(t=>t==="Programs and Operations"),
     "choosing a category shows only that category's libraries");
  const noUsers=await page.$$eval(".dash-dp #dp-libs .drow .nosrc",els=>els.length);

  console.log("\nTrend, PPT s24");
  /* Cumulative, matching Bank-wide and the curve the client drew. A cumulative
     series ENDS at the total; it does not sum to it. */
  const curve=await page.$$eval(".dash-dp #dp-trend circle title",
    els=>els.map(e=>+e.textContent.split(":")[1].replace(/[^0-9]/g,"")));
  eq(curve.length,12,"the department trend shows twelve closed months");
  ok(curve.every((v,i)=>i===0||curve[i-1]<=v),"the trend is cumulative, so it never falls");
  const deptRec=await page.evaluate(()=>{
    const sel=document.getElementById("dp-sel");
    return DASHBOARDS.bw.summary.departments.find(d=>d.code===sel.value).rec;
  });
  eq(curve[11],deptRec,"the curve ENDS at this department's declared record count");

  console.log("\nReference lists, PPT s26 and s28");
  const prog=await page.$$eval(".dash-dp .reflist .refrow",els=>els.length);
  ok(prog>=7,`the five programme dates and the convention rows are laid out (${prog} rows)`);

  console.log("\nHouse rules");
  const dash=await page.$eval(".dash-dp",e=>e.textContent);
  ok(!dash.includes("—"),"no em dash in visible text");
  const badTap=await page.$$eval(".dash-dp .kpi.stat .tap",els=>els.length);
  eq(badTap,0,"no static card carries a click affordance");

  console.log("\nconsole errors: "+(errors.length?errors.join(" | "):"none"));
  ok(errors.length===0,"no console errors");

  console.log("\n==============================================");
  console.log(`pass ${pass}   fail ${fail}`);
  await browser.close();
  process.exit(fail?1:0);
})();
