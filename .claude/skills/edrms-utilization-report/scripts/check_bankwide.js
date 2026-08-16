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
  eq(tiles.length,8,"eight top panel tiles, one per PPT s34 stat");
  eq(tiles.filter(t=>t.tap).length,5,"five tiles promise a click");
  eq(tiles.filter(t=>t.stat).length,3,"three tiles are static");
  ok(tiles.every(t=>t.tap!==t.stat),"no tile both promises and refuses a click");
  ok(tiles.every(t=>t.val.length>0),"every tile carries a value");
  ok(tiles.some(t=>/Sovereign/.test(t.lab))&&tiles.some(t=>/Nonsovereign/.test(t.lab)),
     "the sovereign and nonsovereign split the client asked for three times is present");

  console.log("\nReconciliation against the other dashboards");
  const s=await page.evaluate(()=>({
    bw:DASHBOARDS.bw.summary, d:DATA}));
  eq(s.bw.declared,s.d.DECLARED,"declared records match the shared base figures");
  eq(s.bw.documents,s.d.DOCUMENTS,"documents match the shared base figures");
  eq(s.bw.physical,s.d.WITH_PHYSICAL,"physical counterparts match the shared base figures");
  eq(s.bw.users,s.d.MONTHLY_ACTIVE_USERS,"users match the monthly active user figure");
  eq(s.bw.dueForDisposal,s.d.DUE_NEXT_12,"records due match the shared disposal window");
  eq(s.bw.departmentalSites+s.bw.projectSites,s.d.SITES_CREATED,
     "departmental plus project sites total compliant sites created");

  console.log("\nDepartment table, PPT s16 and s35");
  const rows=await page.$$eval(".dash-bw #bw-depts .drow",els=>els.map(e=>
    [...e.children].map(c=>c.textContent.trim())));
  eq(rows.length,18,"sixteen departments plus the two project groupings");
  eq(rows.filter((r,i)=>i>=16).length,2,"two project rows sit beneath the departments");
  const tot=await page.$$eval(".dash-bw #bw-depts .dtot > div",els=>els.map(e=>e.textContent.trim()));
  for(const [i,label] of [[1,"sites"],[2,"documents"],[3,"records"],[4,"counterparts"],[5,"due"]]){
    const summed=rows.reduce((a,r)=>a+num(r[i]),0);
    eq(summed,num(tot[i]),`${label} column sums to its total row`);
  }
  eq(num(tot[1]),s.d.SITES_CREATED,"the site total is the compliant site count, not a new number");
  /* The total row covers the project groupings as well as the departments, so
     it is deliberately larger than the declared record count. It is the
     departments alone that must agree with Records Management. */
  const deptOnly=rows.slice(0,16).reduce((a,r)=>a+num(r[3]),0);
  eq(deptOnly,s.d.DECLARED,"the sixteen departments alone total the declared record count");
  eq(num(tot[3]),deptOnly+rows.slice(16).reduce((a,r)=>a+num(r[3]),0),
     "the total row adds the project groupings on top of the departments");

  console.log("\nSorting, which answers the question on PPT s5");
  const firstBefore=rows[0][0].split("\n")[0];
  await page.click('.dash-bw #bw-depts .hd[data-s="code"]');
  const afterCode=await page.$eval(".dash-bw #bw-depts .drow .dn",e=>e.textContent.trim());
  ok(/^BRM/.test(afterCode),"sorting by department gives an alphabetical list, BRM first ("+afterCode.split("\n")[0]+")");
  await page.click('.dash-bw #bw-depts .hd[data-s="docs"]');
  const afterDocs=await page.$$eval(".dash-bw #bw-depts .drow",els=>
    els.slice(0,16).map(e=>+e.children[2].textContent.replace(/[^0-9]/g,"")));
  ok(afterDocs.every((v,i)=>i===0||afterDocs[i-1]>=v),"sorting by documents orders highest first");
  ok(firstBefore.length>0,"the table had a first row before sorting");

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
  ok(/Aug 2025/.test(sum)&&/Jul 2026/.test(sum),"the summary names the range actually shown");

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
