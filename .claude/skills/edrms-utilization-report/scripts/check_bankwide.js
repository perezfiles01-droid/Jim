/* Bank-wide Oversight, stage 1 of the client redesign of 13 Aug 2026.
 *
 * verify.js is a floor: it passes on a page whose numbers are wrong. This
 * checks the numbers a stakeholder would actually notice, plus the two things
 * that are easy to break by accident here: the KPI affordance contract, and the
 * source markers that tell a real figure from an aspiration.
 *
 *   node check_bankwide.js /home/user/Jim/index.html
 */
const {chromium}=require("/tmp/node_modules/playwright-core");
const path=process.argv[2]||"/home/user/Jim/index.html";
const url=path.startsWith("http")?path:"file://"+path;

let pass=0,fail=0;
const ok =(c,m)=>{c?(pass++,console.log("  pass  "+m)):(fail++,console.log("  FAIL  "+m));};
const eq =(a,b,m)=>ok(a===b,`${m} (${a}${a===b?"":" , expected "+b})`);
const settle=async(page,sel)=>{
  await page.waitForTimeout(120);
  await page.$eval(sel,e=>e.scrollIntoView({block:"center"}));
  await page.waitForTimeout(120);
  await page.$eval(sel,e=>e.click());
};

const num=s=>+String(s).replace(/[^0-9.-]/g,"");

(async()=>{
  const browser=await chromium.launch({executablePath:"/opt/pw-browsers/chromium-1194/chrome-linux/chrome"});
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];
  page.on("console",m=>{if(m.type()==="error"||m.type()==="assert")errors.push(m.text());});
  page.on("pageerror",e=>errors.push(String(e)));
  await page.goto(url,{waitUntil:"load"});
  await page.evaluate(()=>switchTo("bw"));

  console.log("\nTop panel, PPT s15 and s34");
  const tiles=await page.$$eval(".dash-bw #bw-kpis .kpi",els=>els.map(e=>({
    lab:e.querySelector(".lab").textContent.trim(),
    val:e.querySelector(".val").textContent.trim(),
    tap:!!e.querySelector(".tap"), stat:e.classList.contains("stat")})));
  /* PPT s34 draws TEN tiles, not eight. Eight open a table on this screen; two
     navigate to Retention and Disposal and to the Institutional File Plan,
     which is why s44 and s47 carry the Bank-wide banner while the slides behind
     them do not. All ten do something, so all ten carry the chevron. */
  /* Eight, not the ten on s34. The sovereign and nonsovereign project tiles
     came off on 17 August because nothing records that a site belongs to a
     project. Kept working in EDRMS_Prototype_with_project_sites_2026-08-17.html
     and restored the moment the client supplies the register. Question 2. */
  eq(tiles.length,8,"eight top panel tiles, the two project tiles withdrawn");
  eq(tiles.filter(t=>t.tap).length,8,"every tile promises a click, because every tile does something");
  eq(tiles.filter(t=>t.stat).length,0,"no tile is static");
  ok(tiles.every(t=>t.val.length>0),"every tile carries a value");
  ok(!tiles.some(t=>/[Ss]overeign/.test(t.lab)),
     "the project tiles are withdrawn, not shown empty");
  ok(tiles.some(t=>/Records due for disposal within 12 months/i.test(t.lab)),
     "the records due for disposal navigation tile is present, PPT s34");
  ok(tiles.some(t=>/File plan terms in use/i.test(t.lab)),
     "the file plan terms navigation tile is present, PPT s34");
  /* The two navigation tiles must actually navigate. */
  /* The header breadcrumb was removed on 17 Aug 2026, so the highlighted nav
     row is now the only thing that says which view is open, and it is what
     these navigation assertions read. */
  for(const [k,name] of [["rd","Retention and Disposal"],["fp","Institutional File Plan"]]){
    await page.evaluate(()=>switchTo("bw"));
    await page.click(`.dash-bw #bw-kpis .kpi[data-go="${k}"]`);
    const on=await page.$$eval("#nav a.on",e=>e.map(x=>x.textContent.trim()).join(""));
    ok(new RegExp(name.replace("and","&")).test(on)||new RegExp(name).test(on),
       `the ${k} tile opens ${name} (${on})`);
  }
  await page.evaluate(()=>switchTo("bw"));

  console.log("\nReconciliation against the other dashboards");
  const s=await page.evaluate(()=>({
    bw:DASHBOARDS.bw.summary, d:DATA}));
  eq(s.bw.declared,s.d.DECLARED,"declared records match the shared base figures");
  eq(s.bw.documents,s.d.DOCUMENTS,"documents match the shared base figures");
  eq(s.bw.physical,s.d.WITH_PHYSICAL,"physical counterparts match the shared base figures");
  eq(s.bw.users,s.d.MONTHLY_ACTIVE_USERS,"users match the monthly active user figure");
  eq(s.bw.dueForDisposal,s.d.DUE_NEXT_12,"records due match the shared disposal window");
  /* Until 17 August 180 sites were held back from the department rows to feed
     the sovereign and nonsovereign project rows. Those came off with the
     project screens, so nothing is set aside and the departments now carry the
     whole compliant estate. */
  eq(s.bw.departmentalSites,s.d.SITES_CREATED,
     "department sites total every compliant site, nothing held back for projects");
  ok(s.bw.projectSites===undefined,"the project site figure is gone from the summary");

  console.log("\nSites table, PPT s16 and s35, now the drill behind tile 1");
  /* s16 and s35 draw the SAME table. It appears once, as the drill behind the
     sites tile, rather than as a tile and a second panel further down. The
     project rows are no longer in it: s36 and s37 give them their own tables
     behind their own tiles. */
  await page.click('.dash-bw #bw-kpis .kpi[data-k="sites"]');
  const rows=await page.$$eval(".dash-bw #bw-drill .drow",els=>els.map(e=>
    [...e.children].map(c=>c.textContent.trim())));
  eq(rows.length,16,"the sixteen departments, offices and RMs");
  /* The total rows came off on 17 August by instruction: s16 and s35 draw no
     Total row, so ours was an addition. The reconciliation still has to hold,
     so it is now checked by summing the column off the screen rather than by
     reading a total row that no longer exists. That is the stronger check of
     the two, because it cannot pass on a total that was computed separately. */
  const colSum=i=>rows.reduce((a,r)=>a+num(r[i]),0);
  eq(colSum(3),s.d.DECLARED,"the department rows sum to the declared record count");
  eq(colSum(4),s.d.WITH_PHYSICAL,"the department rows sum to the physical counterpart count");

  console.log("\nSorting, which answers the question on PPT s5");
  await page.click('.dash-bw #bw-drill .hd[data-s="code"]');
  const afterCode=await page.$eval(".dash-bw #bw-drill .drow .dn",e=>e.textContent.trim());
  ok(/^BRM/.test(afterCode),"sorting by department gives an alphabetical list, BRM first ("+afterCode.split("\n")[0]+")");
  await page.click('.dash-bw #bw-drill .hd[data-s="docs"]');
  const afterDocs=await page.$$eval(".dash-bw #bw-drill .drow",els=>
    els.map(e=>+e.children[2].textContent.replace(/[^0-9]/g,"")));
  ok(afterDocs.every((v,i)=>i===0||afterDocs[i-1]>=v),"sorting by documents orders highest first");

  console.log("\nProject tables, PPT s36 and s37, withdrawn 17 Aug");
  /* Both tables are gone with their tiles. Nothing in SharePoint, Cloud
     Governance or drm-npr records that a site belongs to a project, so every
     figure on them was demo data with no path to a real number. They are kept
     whole in EDRMS_Prototype_with_project_sites_2026-08-17.html. Question 2. */
  await page.evaluate(()=>switchTo("bw"));
  for(const k of ["sov","nonsov"]){
    const tile=await page.$(`.dash-bw #bw-kpis .kpi[data-k="${k}"]`);
    ok(!tile,`the ${k} tile is withdrawn`);
  }

  console.log("\nThe five drill tables, PPT s39 to s43");
  const expect={users:"users",docs:"documents",rec:"records declared",
                phys:"physical counterparts",disp:"due for disposal"};
  for(const k of Object.keys(expect)){
    await settle(page,`.dash-bw #bw-kpis .kpi[data-k="${k}"]`);
    const t=await page.$eval(".dash-bw #bw-drill .ptitle",e=>e.textContent.toLowerCase());
    ok(t.includes(expect[k]),`tile ${k} opens the ${expect[k]} table`);
    const opened=await page.$$eval(".dash-bw #bw-kpis .kpi.on",els=>els.length);
    eq(opened,1,`exactly one tile reads as open on ${k}`);
    const drillRows=await page.$$eval(".dash-bw #bw-drill .drow",els=>els.length);
    eq(drillRows,16,`the ${k} table lists every department`);
  }


  console.log("\nRecords Declaration Trend, rebuilt 16 Aug to the client's slide");
  /* Their drawing is a cumulative curve with a date range and nothing else.
     The department filter is gone by instruction, so its absence is asserted
     rather than assumed. */
  const sel=await page.$(".dash-bw #bw-trend-sel");
  ok(sel===null,"the department filter is gone from the trend");
  /* A native date input renders in the browser's own locale, so the same
     control reads 08/01/2025 for one reader and 01/08/2025 for another and
     nothing on screen says which. The expected format is named in the label
     and carried on both inputs. */
  const fmt=await page.$eval(".dash-bw .toolbar .fmt",e=>e.textContent.trim());
  ok(/mm\/dd\/yyyy/.test(fmt),`the date range names its format (${fmt})`);
  const ph=await page.$$eval('.dash-bw .toolbar input[type="date"]',els=>
    els.map(e=>[e.placeholder,e.title,e.getAttribute("aria-label")]));
  eq(ph.length,2,"both ends of the range are date inputs");
  ok(ph.every(([p,t,a])=>p==="mm/dd/yyyy"&&t==="mm/dd/yyyy"&&/mm\/dd\/yyyy/.test(a||"")),
     "both inputs carry the format as placeholder, title and label");
  const marks=async()=>await page.$$eval(".dash-bw #bw-trend circle title",
    els=>els.map(e=>+e.textContent.split(":")[1].replace(/[^0-9]/g,"")));
  let curve=await marks();
  eq(curve.length,12,"the trend opens on twelve closed months, the default range");
  ok(curve.every((v,i)=>i===0||curve[i-1]<=v),"the series is cumulative, so it never falls");

  const title=await page.$eval(".dash-bw #bw-trend-tiles",
    e=>e.parentElement.querySelector(".ptitle").textContent.trim());
  eq(title,"Records Declaration Trend","the panel carries the client's own title");

  await page.fill(".dash-bw #bw-trend-from","2026-01-01");
  curve=await marks();
  eq(curve.length,7,"moving the from date narrows the window to the months inside it");
  await page.fill(".dash-bw #bw-trend-to","2026-03-31");
  curve=await marks();
  eq(curve.length,3,"moving the to date narrows it further");

  /* A from date after the to date would otherwise draw an empty chart with no
     explanation, so the inputs clamp each other. */
  await page.fill(".dash-bw #bw-trend-from","2026-06-01");
  const clamped=await page.$eval(".dash-bw #bw-trend-to",e=>e.value);
  ok(clamped>="2026-06-01","a from date past the to date drags the to date with it");

  await page.click(".dash-bw #bw-trend-reset");
  curve=await marks();
  eq(curve.length,12,"Reset returns the trend to the full window");
  const sum=await page.$eval(".dash-bw #bw-trend-sum",e=>e.textContent);
  /* Removed 17 Aug 2026 with the rest of the computed captions. */
  ok(!/Aug 2025/.test(sum)&&!/closed month/i.test(sum),
     `the summary names no computed range ("${sum}")`);

  console.log("\nComparison, PPT s6 and s17");
  for(const [v,label] of [["docsrec","Records declared"],["userdoc","Documents"],["userrec","Records declared"]]){
    await page.selectOption(".dash-bw #bw-cmp-sel",v);
    const legend=await page.$eval(".dash-bw #bw-cmp-legend",e=>e.textContent);
    ok(legend.includes(label),`comparison ${v} legends the right measure`);
    const n=await page.$$eval(".dash-bw #bw-cmp .cmp",els=>els.length);
    eq(n,16,`comparison ${v} covers every department`);
  }

  console.log("\nHouse rules");
  const dash=await page.$eval(".dash-bw",e=>e.textContent);
  ok(!dash.includes("—"),"no em dash in visible text");
  const badTap=await page.$$eval(".dash-bw .kpi.stat .tap",els=>els.length);
  eq(badTap,0,"no static card carries a click affordance");

  console.log("\nconsole errors: "+(errors.length?errors.join(" | "):"none"));
  ok(errors.length===0,"no console errors, which is also how a failed reconciliation surfaces");

  console.log("\n==============================================");
  console.log(`pass ${pass}   fail ${fail}`);
  await browser.close();
  process.exit(fail?1:0);
})();
