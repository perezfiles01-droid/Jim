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
  const golive=await page.$eval(".dash-dp #dp-golive",e=>e.textContent);
  ok(/Go-live date/.test(golive),"the go-live date the client asked for on PPT s19 is shown");

  console.log("\nTop panel, PPT s19 and s53");
  const tiles=await page.$$eval(".dash-dp #dp-kpis .kpi",els=>els.map(e=>({
    lab:e.querySelector(".lab").textContent.trim(),
    val:e.querySelector(".val").textContent.trim(),
    tap:!!e.querySelector(".tap"),stat:e.classList.contains("stat")})));
  eq(tiles.length,8,"eight top panel tiles");
  eq(tiles.filter(t=>t.tap).length,5,"five tiles promise a click");
  ok(tiles.every(t=>t.tap!==t.stat),"no tile both promises and refuses a click");
  ok(tiles.every(t=>t.val.length>0),"every tile carries a value");

  /* The reconciliation that matters. Walk every department, not just the one
     that happens to be selected: a weighted split can be exact for a large
     department and one out for a small one. */
  console.log("\nEvery department reconciles, all 16 walked");
  const bad=await page.evaluate(()=>{
    const BW=DASHBOARDS.bw.summary, out=[];
    const sel=document.getElementById("dp-sel");
    for(const d of BW.departments){
      sel.value=d.code; sel.dispatchEvent(new Event("change"));
      const rows=[...document.querySelectorAll("#dp-sites .drow")];
      /* the visible page is 10 rows, so read the department total row instead
         and compare it against Bank-wide, then check the split separately */
      const tot=[...document.querySelector("#dp-sites .dtot").children].map(c=>c.textContent.trim());
      const n=v=>+v.replace(/[^0-9]/g,"");
      if(n(tot[2])!==d.docs)out.push(d.code+" documents "+tot[2]+" vs "+d.docs);
      if(n(tot[3])!==d.rec) out.push(d.code+" records "+tot[3]+" vs "+d.rec);
      if(n(tot[4])!==d.phys)out.push(d.code+" counterparts "+tot[4]+" vs "+d.phys);
      if(n(tot[5])!==d.due) out.push(d.code+" due "+tot[5]+" vs "+d.due);
      if(n(tot[1])!==d.sites)out.push(d.code+" site count "+tot[1]+" vs "+d.sites);
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
  const expect={users:"users",visitors:"visitor",docs:"documents",rec:"declaration",disp:"disposal"};
  for(const k of Object.keys(expect)){
    await page.click(`.dash-dp #dp-kpis .kpi[data-k="${k}"]`);
    const t=await page.$eval(".dash-dp #dp-drill .ptitle",e=>e.textContent.toLowerCase());
    ok(t.includes(expect[k]),`tile ${k} opens the ${expect[k]} table`);
    const open=await page.$$eval(".dash-dp #dp-kpis .kpi.on",els=>els.length);
    eq(open,1,`exactly one tile reads as open on ${k}`);
    const marked=await page.$$eval(".dash-dp #dp-drill .src",els=>els.length);
    eq(marked,1,`the ${k} table carries exactly one source marker`);
  }

  console.log("\nSorting and paging the site list, PPT s20");
  await page.click('.dash-dp #dp-sites .hd[data-s="name"]');
  const names=await page.$$eval(".dash-dp #dp-sites .drow .dn",els=>
    els.map(e=>e.childNodes[0].textContent.trim()));
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

  console.log("\nLibrary usage grouped by file plan category, PPT s61 to s66");
  const cats=await page.$$eval(".dash-dp #dp-libs .drow.cat .dn",els=>els.map(e=>e.textContent.trim()));
  ok(cats.length>0,`libraries are grouped under category headings (${cats.length} on this page)`);
  const libMark=await page.$eval(".dash-dp #dp-libs",e=>
    e.closest(".panel").querySelector(".src").className);
  ok(/none/.test(libMark),"the library panel is marked as having no source, since users per library has none");
  const libUsers=await page.$$eval(".dash-dp #dp-libs .drow:not(.cat)",els=>
    els.map(e=>e.children[1].textContent.trim()));
  ok(libUsers.every(v=>v==="no source"),"users per library says no source rather than showing a number");

  console.log("\nTrend, PPT s24");
  const cols=await page.$$eval(".dash-dp #dp-trend .tcol",els=>els.length);
  eq(cols,12,"the department trend shows twelve closed months");
  await page.selectOption(".dash-dp #dp-sel","ITD");
  const a=await page.$eval(".dash-dp #dp-trend-sum",e=>e.textContent);
  await page.selectOption(".dash-dp #dp-sel","ERCD");
  const b=await page.$eval(".dash-dp #dp-trend-sum",e=>e.textContent);
  ok(/ITD/.test(a)&&/ERCD/.test(b),"the trend follows the department picker");
  const na=+((a.match(/([\d,]+) records/)||[0,"0"])[1].replace(/,/g,""));
  const nb=+((b.match(/([\d,]+) records/)||[0,"0"])[1].replace(/,/g,""));
  ok(na>nb,"the larger department shows the larger trend total");

  console.log("\nReference lists, PPT s26 and s28");
  const refMarks=await page.$$eval(".dash-dp .src.ref",els=>els.length);
  eq(refMarks,2,"the convention and programme date panels are both marked as maintained lists");
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
