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
  eq(nav.length,6,"the nav carries exactly six dashboards, as specified on PPT s13");
  eq(nav.join(","),"bw,dp,pj,fp,rd,ra","in the client's own order");
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

  console.log("\nWhat the absorbed panels landed on");
  await page.evaluate(()=>switchTo("bw"));
  const fmtRows=await page.$$eval(".dash-bw #bw-formats .drow",els=>els.length);
  eq(fmtRows,8,"the format groups survive as a panel on Bank-wide, per PPT s12");
  const fmtTot=await page.$eval(".dash-bw #bw-formats .dtot",e=>
    +e.children[1].textContent.replace(/[^0-9]/g,""));
  eq(fmtTot,d.DECLARED,"the format panel totals the declared record count");
  const body=await page.$eval(".dash-bw",e=>e.textContent);
  ok(/Site health/.test(body),"site health survives as a panel, per the Risk and Compliance metrics");
  ok(/Library health/.test(body),"library health survives as a panel");
  ok(/Orphaned, no owner/.test(body),"orphaned sites, which the metrics document asks for, are on the page");
  ok(/Most used libraries/.test(body),"most used libraries is shown as asked, marked no source");

  /* Cutting eleven dashboards to six risked dropping content the requirements
     still ask for. Fourteen items were found missing on 13 Aug 2026 by walking
     the metrics document heading by heading, and were added back. This block
     is that walk, kept so the same content cannot quietly disappear again in a
     later edit. Each entry names the document heading it comes from. */
  console.log("\nEvery metrics document heading has somewhere to live");
  const pages={};
  for(const k of ["bw","dp","pj","fp","rd","ra"]){
    await page.evaluate(key=>switchTo(key),k);
    pages[k]=await page.$eval(`.dash-${k}`,e=>e.textContent.replace(/\s+/g," "));
  }
  const all=Object.values(pages).join(" ");
  const required=[
    ["Records declared by year",        "Records Declaration",     /declared by year/i],
    ["Records declared this month",     "Records Declaration",     /declared this month/i],
    ["Libraries with highest declaration rates","Declaration Performance",/declaration rate/i],
    ["Largest libraries by record volume","Library usage",         /record volume/i],
    ["Largest libraries by storage",    "Library usage",           /storage consumed/i],
    ["Libraries dormant over 180 days", "Library usage",           /dormant over 180/i],
    ["Site activity trend by month",    "Site Trends",             /site activity trend by month/i],
    ["Duplicated records",              "Records Quality",         /duplicated records/i],
    ["Orphaned records",                "Records Quality",         /orphaned records/i],
    ["Records with sensitivity labels", "Information Classification",/sensitivity label/i],
    ["Restricted records",              "Access Management",       /restricted records/i],
    ["Confidential records",            "Access Management",       /confidential records/i],
    ["External sharing instances",      "Access Management",       /external sharing/i],
    ["Permission exceptions",           "Access Management",       /permission exceptions/i],
    ["Searches performed",              "Information Retrieval",   /searches performed/i],
    ["Most viewed records",             "Top Content",             /most viewed/i],
    ["Most downloaded records",         "Top Content",             /most downloaded/i],
    ["Most accessed libraries",         "Top Content",             /most accessed libraries/i],
    ["Records declared by classification","Records Declaration",   /by classification/i],
    ["Records declared by business process","Records Declaration", /business process/i],
    ["Format groups",                   "Format and Storage Analysis",/format group/i],
    ["Orphaned sites",                  "Risk Indicators",         /orphaned, no owner/i],
    ["Physical records overdue for transfer","Risk and Compliance",/overdue for transfer/i],
    ["Inventory health",                "Inventory Health",        /unverified physical files/i],
    ["Storage locations",               "Storage Location Dashboard",/offsite storage/i],
  ];
  const missing=required.filter(([,,re_])=>!re_.test(all));
  ok(missing.length===0,
     `every metrics document heading is represented somewhere${
       missing.length?": missing "+missing.map(m=>m[0]).join(", "):` (${required.length} checked)`}`);

  console.log("\nThe absorbed content works, not merely present");
  await page.evaluate(()=>switchTo("bw"));
  const years=await page.$$eval(".dash-bw #bw-years .drow",els=>els.map(e=>
    [...e.children].map(c=>c.textContent.trim())));
  eq(years.length,4,"the by-year table carries three closed years plus the current window");
  eq(+years[3][1].replace(/[^0-9]/g,""),d.DECLARED,
     "the last by-year row equals the declared record count, so it agrees with the monthly chart");
  const visits=await page.$$eval(".dash-bw #bw-visits .tcol",els=>els.length);
  eq(visits,12,"the site activity trend shows twelve months");
  const sens=await page.$$eval(".dash-bw #bw-sens .lbar",els=>els.length);
  eq(sens,d.SENSITIVITY.length,"every sensitivity state is drawn");
  const libRows=await page.$$eval(".dash-bw #bw-libs .drow",els=>els.length);
  eq(libRows,d.TOP_LIBRARIES.length,"the library ranking lists every library");
  const withSite=await page.$$eval(".dash-bw #bw-libs .drow .dn small",els=>els.map(e=>e.textContent));
  ok(withSite.length===libRows&&withSite.every(t=>t.trim().length>0),
     "every library is shown with its parent site, since library names repeat across sites");
  /* the ranking must actually re-rank, not merely redraw */
  const byRec=await page.$$eval(".dash-bw #bw-libs .drow",els=>
    els.map(e=>+e.children[2].textContent.replace(/[^0-9]/g,"")));
  ok(byRec.every((v,i)=>i===0||byRec[i-1]>=v),"ranking by record volume orders highest first");
  await page.selectOption(".dash-bw #bw-librank","gb");
  const rankGB=await page.$$eval(".dash-bw #bw-libs .drow",els=>
    els.map(e=>parseFloat(e.children[4].textContent)));
  ok(rankGB.every((v,i)=>i===0||rankGB[i-1]>=v),"ranking by storage orders highest first");
  await page.selectOption(".dash-bw #bw-librank","rate");
  const byRate=await page.$$eval(".dash-bw #bw-libs .drow",els=>
    els.map(e=>parseFloat(e.children[3].textContent)));
  ok(byRate.every((v,i)=>i===0||byRate[i-1]>=v),"ranking by declaration rate orders highest first");

  console.log("\nconsole errors: "+(errors.length?errors.join(" | "):"none"));
  ok(errors.length===0,"no console errors, which is how the DATA reconciliation asserts surface");

  console.log("\n==============================================");
  console.log(`pass ${pass}   fail ${fail}`);
  await browser.close();
  process.exit(fail?1:0);
})();
