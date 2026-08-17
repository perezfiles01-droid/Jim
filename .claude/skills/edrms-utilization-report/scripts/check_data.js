/* The shared base figures, DATA.
 *
 * Replaces check_metrics.js, check_retention.js, check_sitefilter.js and
 * check_period.js, which were retired on 13 Aug 2026 when the five dashboards
 * they tested were removed. Those checks were not thrown away: the assertions
 * in them that were about figures rather than about a particular screen are
 * reproduced here, against DATA, where the figures now live.
 *
 * What was genuinely lost with those dashboards, and is worth remembering:
 *   - check_period tested the usage period control (7 / 30 / 90 / 180 days and
 *     By month, with no day level picker because a week is the smallest unit
 *     the data holds). That control belonged to the usage panels, which the
 *     client's redesign does not carry. If usage panels return, the rule that
 *     produced it returns with them.
 *   - check_sitefilter tested a department filter with a Reset. The equivalent
 *     behaviour now lives in the Bank-wide trend picker and the Department
 *     Insights picker, and is covered by check_bankwide.js and
 *     check_department.js.
 *
 *   node check_data.js /home/user/Jim/index.html
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
  const d=await page.evaluate(()=>DATA);

  console.log("\nThe six key views, and only those");
  const nav=await page.$$eval("#nav a[data-d]",els=>els.map(e=>e.dataset.d));
  /* Five, not the six on s13. Project Insights and the two project tiles came
     off on 17 August: nothing in SharePoint, Cloud Governance or drm-npr says a
     site belongs to a project, so not one figure on those screens could be
     produced. The whole thing is kept working in
     EDRMS_Prototype_with_project_sites_2026-08-17.html and goes straight back
     when the client supplies the project register. Audit question 2. */
  eq(nav.length,5,"the nav carries five dashboards, project insights withdrawn");
  eq(nav.join(","),"bw,dp,fp,rd,ra","in the client's own order, less project insights");
  const dis=await page.$$eval("#nav a.dis",els=>els.length);
  eq(dis,0,"no disabled placeholder entries remain");
  const gone=await page.evaluate(()=>["rm","sl","fs","ov","rt"].filter(k=>DASHBOARDS[k]));
  eq(gone.length,0,"the five superseded dashboards are gone from the registry, not merely hidden");

  console.log("\nDepartments");
  eq(d.DEPTS.length,16,"sixteen departments");
  eq(d.DEPTS.reduce((a,x)=>a+x.rec,0),d.DECLARED,"department records total the declared count");
  eq(d.DEPTS.reduce((a,x)=>a+x.docs,0),d.DOCUMENTS,"department documents total the document count");
  eq(d.DEPTS.reduce((a,x)=>a+x.phys,0),d.WITH_PHYSICAL,"department counterparts total the counterpart count");
  ok(d.DEPTS.every(x=>x.rec<=x.docs),"no department declares more records than it holds documents");

  console.log("\nDeclaration trend");
  eq(d.MONTH_LABELS.length,12,"twelve months");
  eq(d.MONTH_VALUES.length,12,"twelve values");
  eq(d.MONTH_VALUES.reduce((a,v)=>a+v,0),d.DECLARED,"the trend totals the declared record count");
  ok(d.MONTH_LABELS[11]==="Jul","the series ends at the latest closed month, not December");

  console.log("\nRetention, carried over from check_metrics and check_retention");
  eq(d.LABEL_TOTAL,d.DECLARED,"every declared record carries exactly one retention label state");
  eq(d.WITH_SCHEDULE+d.NO_LABEL,d.LABEL_TOTAL,"with and without a schedule account for every record");
  ok(d.DUE_30<=d.DUE_90,"the 30 day window nests inside the 90 day window");
  ok(d.DUE_90<=d.DUE_NEXT_12,"the 90 day window nests inside the 12 month window");
  ok(d.PERMANENT>0&&d.PERMANENT<d.LABEL_TOTAL,"permanent retention is a real subset, not everything or nothing");
  ok(d.BEYOND_RETENTION<=d.WITH_SCHEDULE,
     "records beyond retention are a subset of those that carry a schedule");

  console.log("\nFormat groups, carried over from check_metrics");
  eq(d.FORMATS.length,8,"eight format groups, as the client lists them");
  eq(d.TOTAL_FILES,d.DECLARED,"the format groups decompose the declared record total exactly");
  ok(d.FORMATS.every(f=>f.files>0&&f.gb>0),"no format group is empty");
  const byFiles=[...d.FORMATS].sort((a,b)=>b.files-a.files)[0];
  const byGB=[...d.FORMATS].sort((a,b)=>b.gb-a.gb)[0];
  ok(byFiles.label!==byGB.label,
     `the format dominating files (${byFiles.label}) differs from the one dominating storage (${byGB.label})`);

  console.log("\nSites and libraries, carried over from check_retention");
  ok(d.SITES_INACTIVE<d.SITES_CREATED,"inactive sites are a subset of the sites created");
  eq(d.LIBS_WITH_RECORDS+d.LIBS_NO_RECORDS,d.SITE_LIBRARIES,
     "libraries with and without records account for every library");
  ok(d.LIBS_ACTIVE<=d.SITE_LIBRARIES,"active libraries cannot exceed the libraries that exist");
  eq(d.IDLE_DAYS,90,"the site inactivity threshold is 90 days, the deck's figure");

  console.log("\nWhat the client removed on 16 and 17 August stays removed");
  await page.evaluate(()=>switchTo("bw"));
  const body=await page.$eval(".dash-bw",e=>e.textContent.replace(/\s+/g," "));
  /* Ten panels were absorbed onto Bank-wide on 13 Aug when five dashboards
     were deleted. The client looked at the result on 16 Aug and asked for them
     off, so Bank-wide is the compact screen they designed. Asserting their
     absence is the point: restoring one would put a panel in front of the
     committee that the client has explicitly asked not to see. */
  const cutPanels=[
    ["Records declared by year",        /declared by year/i],
    ["Supporting detail",               /supporting detail/i],
    ["Site visits by month",            /site visits by month/i],
    ["Format and storage",              /format and storage/i],
    ["Declared records by format group",/by format group/i],
    ["Risk and compliance",             /risk and compliance/i],
    ["Site health",                     /site health/i],
    ["Library health",                  /library health/i],
    /* Removed 17 Aug on the same instruction, one step further: these two
       panels traced to no slide in the deck at all. They came from the
       proposed metrics document, which is a word list with no screen drawn.
       They were sourceable, which is why the 14 Aug rule had kept them, so
       this is the client overriding that rule rather than applying it. */
    ["Records quality",                 /records quality/i],
    ["Information classification",      /information classification/i],
    ["Duplicated records",              /duplicated records/i],
    ["Orphaned records",                /orphaned records/i],
    ["Sensitivity labels",              /sensitivity label/i],
  ];
  /* Removed 17 Aug when the deck itself was read. None of these three appears
     anywhere in its 69 slides; they came from the proposed metrics document.
     "classification", "business process" and "overdue for transfer" are all
     absent from the client's own file. */
  const notInDeck=[
    ["Records declared by classification", /by classification/i],
    ["Records declared by business process",/business process/i],
    ["Physical records overdue for transfer",/overdue for transfer/i],
    ["Disposition risk",                   /disposition risk/i],
    ["Records with and without a schedule",/without a schedule/i],
  ];
  const restored=cutPanels.filter(([,re_])=>re_.test(body));
  ok(restored.length===0,
     `every panel the client removed stays off Bank-wide${
       restored.length?": back on screen "+restored.map(m=>m[0]).join(", "):` (${cutPanels.length} checked)`}`);
  /* What the client kept, so the cut cannot quietly overshoot. */
  ok(/Comparison/.test(body),"the comparison panel survives, it is on their own slide");
  ok(/Number of active EDRMS SharePoint sites for Department/.test(body),
     "the sites table survives as the drill behind tile 1, PPT s16 and s35");
  /* s44 lives on Retention and Disposal, which is the dashboard it is slide 1
     of. Bank-wide reaches it through the tile of the same name, so drawing it
     here as well would show one table twice. */
  ok(!/EDRMS retention and disposal insights/.test(body),
     "the s44 rollup is not duplicated on Bank-wide, it lives on the dashboard it opens");
  ok(/Records Declaration Trend/.test(body),"the declaration trend survives, PPT s10 and s18");

  /* Cutting eleven dashboards to six risked dropping content the requirements
     still ask for. Fourteen items were found missing on 13 Aug 2026 by walking
     the metrics document heading by heading, and were added back. This block
     is that walk, kept so the same content cannot quietly disappear again in a
     later edit. Each entry names the document heading it comes from. */
  console.log("\nMetrics headings: sourceable ones stay, unsourceable ones stay off");
  const pages={};
  for(const k of ["bw","dp","fp","rd","ra"]){
    await page.evaluate(key=>switchTo(key),k);
    pages[k]=await page.$eval(`.dash-${k}`,e=>e.textContent.replace(/\s+/g," "));
  }
  const all=Object.values(pages).join(" ");
  /* Revised 14 Aug 2026. The client's rule is that anything not drawn on a
     slide comes off the page. Applied literally that removed ten panels, six
     of which were buildable today, so it was narrowed: a panel comes off only
     if it is both undrawn AND unsourceable. Three did not survive that test.

     STILL REQUIRED: drawn on a slide, or buildable now and kept. */
  const required=[
    ["Records declared this month",     "Records Declaration",     /declared this month/i],
    ["Libraries with highest declaration rates","Declaration Performance",/declaration rate/i],
    ["Storage locations",               "Storage Location Dashboard",/offsite storage/i],
  ];
  const backFromMetrics=notInDeck.filter(([,re_])=>re_.test(all));
  ok(backFromMetrics.length===0,
     `headings that appear nowhere in the deck stay off every dashboard${
       backFromMetrics.length?": found "+backFromMetrics.map(m=>m[0]).join(", "):` (${notInDeck.length} checked)`}`);
  const missing=required.filter(([,,re_])=>!re_.test(all));
  ok(missing.length===0,
     `every retained metrics heading is on the page${
       missing.length?": missing "+missing.map(m=>m[0]).join(", "):` (${required.length} checked)`}`);

  /* WITHDRAWN: drawn on no slide AND with no source that exists. Search
     analytics is tenant level and not exposed per record; access requests and
     external sharing need audit log data, a different Graph surface; physical
     inventory needs a system nobody has. Asserting their ABSENCE is the point:
     a later edit that restores one would put an undeliverable panel in front
     of the committee, and undeliverable is worse than missing. */
  const withdrawn=[
    ["Most used libraries",                  /most used libraries/i],
    ["Orphaned libraries",                   /orphaned libraries/i],
    ["Access requests",                      /access requests/i],
    ["External sharing instances",           /external sharing/i],
    ["Permission exceptions",                /permission exceptions/i],
    ["Searches performed",                   /searches performed/i],
    ["Most viewed records",                  /most viewed/i],
    ["Most downloaded records",              /most downloaded/i],
    ["Most accessed libraries",              /most accessed libraries/i],
    ["Inventory health",                     /unverified physical files/i],
  ];
  /* 17 Aug: every measure with no source came OFF the page rather than
     printing "Not captured". The convention served its purpose, which was to
     stop plausible numbers being invented, but a screen dense with empty
     cells reads as a broken report to a committee. What was removed is
     recorded in STATUS.md and in the content checker workbook so the client
     questions behind each one stay live. Asserting the words are gone is what
     stops a later edit reintroducing an empty column by accident. */
  for(const key of ["bw","dp","fp","rd","ra"]){
    await page.evaluate(k=>switchTo(k),key);
    await page.waitForTimeout(120);
    const n=await page.$$eval(".nosrc",els=>els.length);
    eq(n,0,`no unsourced cell is left on ${key}`);
    const txt=await page.$eval("#view",e=>e.textContent);
    ok(!/Not captured/.test(txt),`the words "Not captured" are gone from ${key}`);
  }

  const returned=withdrawn.filter(([,re_])=>re_.test(all));
  ok(returned.length===0,
     `the withdrawn unsourceable headings stay off the page${
       returned.length?": back on screen "+returned.map(m=>m[0]).join(", "):` (${withdrawn.length} checked)`}`);

  console.log("\nWhat survived the cut still works");
  await page.evaluate(()=>switchTo("bw"));
  /* The Records Declaration Trend, rebuilt 16 Aug to the client's own slide:
     a cumulative curve over a date range, no department filter.

     The reconciliation that matters here is NOT a sum. A per month series adds
     up to the declared total; a cumulative one ends at it. Asserting the wrong
     one passes on a chart that is wrong by a factor of six. */
  const pts=async()=>await page.$$eval(".dash-bw #bw-trend circle title",
    els=>els.map(e=>+e.textContent.split(":")[1].replace(/[^0-9]/g,"")));
  let curve=await pts();
  eq(curve.length,12,"the trend opens on the twelve closed months");
  eq(curve[11],d.DECLARED,"the curve ENDS at the declared record count, it does not sum to it");
  ok(curve.every((v,i)=>i===0||curve[i-1]<=v),"a cumulative curve never falls");
  ok(curve[0]<curve[11],"the curve actually rises across the window");

  const noDeptFilter=await page.$(".dash-bw #bw-trend-sel");
  ok(noDeptFilter===null,"the department filter is gone from the trend, as the client asked");
  const cap=await page.$eval(".dash-bw #bw-trend-tiles",e=>e.parentElement.querySelector(".psub").textContent);
  ok(/across all EDRMS compliant sites/i.test(cap),"the caption names the population, not a period");
  ok(!/[0-9]{3,}/.test(cap),"the caption carries no computed figure");

  /* The date range narrows the window and restarts the running total, so the
     last point of a narrowed curve is what was declared inside it. */
  await page.fill(".dash-bw #bw-trend-from","2026-05-01");
  curve=await pts();
  eq(curve.length,3,"the date range narrows the series to the months inside it");
  const lastThree=d.MONTH_VALUES.slice(9).reduce((a,v)=>a+v,0);
  eq(curve[2],lastThree,"the narrowed curve ends at what was declared inside the range");
  const sum3=await page.$eval(".dash-bw #bw-trend-sum",e=>e.textContent);
  ok(/3 closed months/.test(sum3),"the summary says how many months are actually shown");

  /* A range with no closed month in it must say so rather than draw nothing. */
  await page.fill(".dash-bw #bw-trend-from","2026-07-05");
  await page.fill(".dash-bw #bw-trend-to","2026-07-20");
  const empty=await page.$eval(".dash-bw #bw-trend",e=>e.textContent);
  ok(/No closed month/i.test(empty),"an empty range explains itself rather than drawing a blank chart");

  await page.click(".dash-bw #bw-trend-reset");
  curve=await pts();
  eq(curve.length,12,"Reset restores the full window");
  eq(curve[11],d.DECLARED,"Reset restores the full declared total");

  /* The Overview of EDRMS sites table carries the client's own column names
     word for word, and each name opens that unit's dashboard. */
  console.log("\nOverview of EDRMS sites, the client's wording and their click");
  await page.click('.dash-bw #bw-kpis .kpi[data-k="sites"]');
  const heads=await page.$$eval(".dash-bw #bw-drill .dhead .hd",els=>els.map(e=>
    e.textContent.replace(/[↑↓]/g,"").trim()));
  const want=["Department / office / RM","Number of EDRMS SharePoint sites",
              "Total number of documents","Total number of records declared",
              "Total number of physical counterparts"];
  ok(JSON.stringify(heads)===JSON.stringify(want),
     `the column names are the client's, verbatim${heads.join(" | ")!==want.join(" | ")?": got "+heads.join(" | "):""}`);
  await page.click(".dash-bw #bw-drill .drow.go[data-dept]");
  const landed=await page.$eval("#crumb-b",e=>e.textContent);
  ok(/Department Insights/.test(landed),"clicking a department name opens Department Insights");
  await page.evaluate(()=>switchTo("bw"));
  /* The sovereign and nonsovereign tiles are withdrawn, so nothing on this
     dashboard navigates to Project Insights any more. Asserting their absence
     is deliberate: putting a tile back without the project register behind it
     would give the committee a screen of blanks. */
  const sov=await page.$('.dash-bw #bw-kpis .kpi[data-k="sov"]');
  const nonsov=await page.$('.dash-bw #bw-kpis .kpi[data-k="nonsov"]');
  ok(!sov&&!nonsov,"the two project tiles are withdrawn, not left empty");
  const projRow=await page.$(".dash-bw #bw-drill .drow.go[data-fac]");
  ok(!projRow,"no row navigates to Project Insights");

  console.log("\nconsole errors: "+(errors.length?errors.join(" | "):"none"));
  ok(errors.length===0,"no console errors, which is how the DATA reconciliation asserts surface");

  console.log("\n==============================================");
  console.log(`pass ${pass}   fail ${fail}`);
  await browser.close();
  process.exit(fail?1:0);
})();
