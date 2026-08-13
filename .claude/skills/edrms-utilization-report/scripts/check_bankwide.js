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
    bw:DASHBOARDS.bw.summary, rm:DASHBOARDS.rm.summary,
    rt:DASHBOARDS.rt.summary, sl:DASHBOARDS.sl.summary}));
  eq(s.bw.declared,s.rm.declared,"declared records match Records Management");
  eq(s.bw.documents,s.rm.documents,"documents match Records Management");
  eq(s.bw.physical,s.rm.withPhysical,"physical counterparts match Records Management");
  eq(s.bw.users,s.rm.monthlyActiveUsers,"users match the monthly active user figure");
  eq(s.bw.dueForDisposal,s.rt.dueNext12,"records due match the Retention dashboard");
  eq(s.bw.departmentalSites+s.bw.projectSites,s.sl.sitesCreated,
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
  eq(num(tot[1]),s.sl.sitesCreated,"the site total is the compliant site count, not a new number");
  /* The total row covers the project groupings as well as the departments, so
     it is deliberately larger than the declared record count. It is the
     departments alone that must agree with Records Management. */
  const deptOnly=rows.slice(0,16).reduce((a,r)=>a+num(r[3]),0);
  eq(deptOnly,s.rm.declared,"the sixteen departments alone total the declared record count");
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
    await page.click(`.dash-bw #bw-kpis .kpi[data-k="${k}"]`);
    const t=await page.$eval(".dash-bw #bw-drill .ptitle",e=>e.textContent.toLowerCase());
    ok(t.includes(expect[k]),`tile ${k} opens the ${expect[k]} table`);
    const opened=await page.$$eval(".dash-bw #bw-kpis .kpi.on",els=>els.length);
    eq(opened,1,`exactly one tile reads as open on ${k}`);
    const drillRows=await page.$$eval(".dash-bw #bw-drill .drow",els=>els.length);
    eq(drillRows,16,`the ${k} table lists every department`);
  }

  console.log("\nSource markers, the convention agreed 13 Aug 2026");
  const marks=await page.$$eval(".dash-bw .src",els=>els.map(e=>e.className.replace("src ","")));
  ok(marks.length>=4,`the page carries source markers (${marks.length} found)`);
  ok(marks.includes("dept"),"at least one panel is marked as waiting on the department list");
  ok(marks.includes("part"),"at least one panel is marked partly sourceable");
  await page.click('.dash-bw #bw-kpis .kpi[data-k="users"]');
  const userMark=await page.$eval(".dash-bw #bw-drill .src",e=>e.className);
  ok(/none/.test(userMark),"the users table is marked as having no source, since the staff split has none");
  const noSource=await page.$$eval(".dash-bw",els=>
    (els[0].textContent.match(/no source/g)||[]).length);
  ok(noSource>=3,`unsourceable cells say so in the cell (${noSource} found)`);

  console.log("\nTrend, PPT s10 and s18");
  /* The summary line reads "<scope>, <n> records declared over the last 12
     months", so a blanket digit strip would swallow the 12 as well. Take the
     figure that precedes the word records and nothing else. */
  const trendTotal=t=>num((t.match(/([\d,]+) records declared/)||[0,"0"])[1]);
  await page.selectOption(".dash-bw #bw-trend-sel","ITD");
  const itd=await page.$eval(".dash-bw #bw-trend-sum",e=>e.textContent);
  ok(/ITD/.test(itd),"choosing a department relabels the trend summary");
  const itdTotal=trendTotal(itd);
  await page.selectOption(".dash-bw #bw-trend-sel","all");
  const all=await page.$eval(".dash-bw #bw-trend-sum",e=>e.textContent);
  ok(trendTotal(all)>itdTotal,"the bank-wide trend is larger than one department's");
  eq(trendTotal(all),s.rm.declared,"the bank-wide trend totals the declared record count");
  await page.selectOption(".dash-bw #bw-trend-sel","FIN");
  await page.click(".dash-bw #bw-trend-reset");
  const reset=await page.$eval(".dash-bw #bw-trend-sum",e=>e.textContent);
  ok(/All departments/.test(reset),"Reset returns the trend to all departments");
  const cols=await page.$$eval(".dash-bw #bw-trend .tcol",els=>els.length);
  eq(cols,12,"the trend shows twelve closed months, the default range");

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
