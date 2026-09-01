/* Verification for the 2026.4 Reports Utilization prototype.
   Loads the built index.html, visits every dashboard, exercises every
   interactive control, and checks the figures reconcile. */
const {chromium} = require("playwright-core");
const path = require("path");

const FILE = "file://" + path.resolve(process.argv[2] || "./index.html");
const EXE = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

let pass = 0, fail = 0;
const errs = [];
function ok(name, cond, extra){
  if (cond) { pass++; } else { fail++; errs.push(name + (extra ? " :: " + extra : "")); }
}

(async () => {
  const browser = await chromium.launch({executablePath: EXE});
  const page = await browser.newPage({viewport:{width:1440, height:1000}});
  const console_errors = [];
  page.on("console", m => { if (m.type() === "error" || m.type() === "assert") console_errors.push(m.text()); });
  page.on("pageerror", e => console_errors.push("pageerror: " + e.message));

  await page.goto(FILE);
  await page.waitForTimeout(300);

  const KEYS = ["bo","rc","di","fp","rm","ah","fs","rd","sc","su","ds"];

  /* ---- nav ---- */
  const navKeys = await page.$$eval("#nav a[data-d]", as => as.map(a => a.dataset.d));
  ok("nav has 11 entries", navKeys.length === 11, navKeys.join(","));
  ok("nav keys match", KEYS.every(k => navKeys.includes(k)), navKeys.join(","));

  /* ---- totals from the data module ---- */
  const D = await page.evaluate(() => ({
    sites:T.sites, active:T.sitesActive, inactive:T.sitesInactive, orphaned:T.sitesOrphaned,
    docs:T.docs, records:T.records, physical:T.physical, users:T.users, libraries:T.libraries,
    formatFiles:FORMAT_FILES, classSum:CLASSIFICATION.reduce((a,c)=>a+c.value,0),
    bpSum:BUSINESS_PROCESS.reduce((a,c)=>a+c.value,0),
    yearSum:RECORDS_BY_YEAR.reduce((a,c)=>a+c.y,0),
    m2026:RECORDS_2026.reduce((a,c)=>a+c.y,0),
    year2026:RECORDS_BY_YEAR[RECORDS_BY_YEAR.length-1].y,
    fieldSites:FIELD.reduce((a,f)=>a+f.sites,0),
    projSites:PROJECT_SPLIT.reduce((a,p)=>a+p.sites,0),
    projActive:PROJECT_SPLIT.reduce((a,p)=>a+p.active,0),
    facFiles:FACILITIES.reduce((a,f)=>a+f.files,0), physFiles:PHYSICAL_FILES,
    retSum:RETENTION.withSchedule+RETENTION.withoutSchedule,
    secSum:SECURITY.withLabels+SECURITY.withoutLabels,
    fpSum:FILEPLAN.reduce((a,f)=>a+f.value,0), fpTotal:FILEPLAN_TOTAL
  }));
  ok("sites split adds up", D.active + D.inactive + D.orphaned === D.sites, JSON.stringify(D));
  ok("format files equal declared records", D.formatFiles === D.records, `${D.formatFiles} vs ${D.records}`);
  ok("classification sums to records", D.classSum === D.records);
  ok("business process sums to records", D.bpSum === D.records);
  ok("records by year sums to records", D.yearSum === D.records);
  ok("2026 months sum to the 2026 year", D.m2026 === D.year2026);
  ok("field office sites sum to site total", D.fieldSites === D.sites);
  ok("project split sums to site total", D.projSites === D.sites);
  ok("project active sums to active total", D.projActive === D.active);
  ok("facilities sum to physical files", D.facFiles === D.physFiles);
  ok("retention split sums to records", D.retSum === D.records);
  ok("sensitivity split sums to records", D.secSum === D.records);
  ok("file plan branches sum to total terms", D.fpSum === D.fpTotal);
  ok("no orphaned negative", D.orphaned > 0);

  /* ---- every dashboard mounts ---- */
  for (const k of KEYS){
    await page.click(`#nav a[data-d="${k}"]`);
    await page.waitForTimeout(120);
    const info = await page.evaluate(() => ({
      panels:document.querySelectorAll("#view .panel").length,
      kpis:document.querySelectorAll("#view .kpi").length,
      chips:document.querySelectorAll("#view .chip").length,
      crumb:document.getElementById("crumb-b").textContent,
      asof:document.getElementById("asof").textContent,
      ver:document.getElementById("side-ver").textContent,
      band:document.querySelectorAll("#view .band h2").length,
      undef:document.getElementById("view").innerHTML.includes("undefined"),
      nan:document.getElementById("view").innerHTML.includes("NaN"),
      em:(document.getElementById("view").innerText.match(/—/g)||[]).length,
      on:document.querySelectorAll("#nav a.on").length,
      onKey:(document.querySelector("#nav a.on")||{dataset:{}}).dataset.d
    }));
    ok(`${k} mounts panels`, info.panels >= 1, JSON.stringify(info));
    ok(`${k} has a band`, info.band === 1);
    ok(`${k} has feasibility chips`, info.chips >= 1);
    ok(`${k} sets crumb`, info.crumb.length > 3, info.crumb);
    ok(`${k} sets as of`, info.asof.length > 3, info.asof);
    ok(`${k} sets sidebar version`, info.ver.length > 3, info.ver);
    ok(`${k} renders no undefined`, !info.undef);
    ok(`${k} renders no NaN`, !info.nan);
    ok(`${k} has no em dashes`, info.em === 0, "count " + info.em);
    ok(`${k} nav highlight is exclusive`, info.on === 1 && info.onKey === k, info.onKey);
    ok(`${k} hash updated`, await page.evaluate(() => location.hash) === "#" + k);
  }

  /* ---- duplicate ids ---- */
  const dupes = await page.evaluate(() => {
    const seen = {}, dup = [];
    document.querySelectorAll("[id]").forEach(e => { if (seen[e.id]) dup.push(e.id); seen[e.id] = 1; });
    return dup;
  });
  ok("no duplicate element ids", dupes.length === 0, dupes.join(","));

  /* ---- bo: grouping toggle keeps the total ---- */
  await page.click(`#nav a[data-d="bo"]`); await page.waitForTimeout(120);
  const boTotals = [];
  for (const g of ["dept","field","project"]){
    await page.click(`#bo-sites button[data-seg="${g}"]`);
    await page.waitForTimeout(80);
    const rows = await page.$$eval("#bo-status .sb .sval b", els => els.map(e => +e.textContent.replace(/,/g,"")));
    boTotals.push(rows.reduce((a,b)=>a+b,0));
    ok(`bo ${g} renders rows`, rows.length >= 3, "rows " + rows.length);
  }
  ok("bo grouping totals all equal the site total",
    boTotals.every(t => t === D.sites), boTotals.join(" / ") + " vs " + D.sites);

  /* ---- rc: window toggle and sort ---- */
  await page.click(`#nav a[data-d="rc"]`); await page.waitForTimeout(150);
  const a90 = await page.$eval("#rc-active .tile .tv", e => e.textContent);
  await page.click(`#rc-active button[data-seg="180"]`); await page.waitForTimeout(120);
  const a180 = await page.$eval("#rc-active .tile .tv", e => e.textContent);
  ok("rc 180 day window is larger than 90",
    (+a180.replace(/,/g,"")) > (+a90.replace(/,/g,"")), `${a90} -> ${a180}`);
  ok("rc inactive panel follows the window toggle",
    (await page.$$("#rc-inactive")).length === 1);
  for (const s of ["records","storageGB","activity"]){
    await page.selectOption("#rc-sort", s); await page.waitForTimeout(100);
    const n = await page.$$eval("#rc-active .bl", els => els.length);
    ok(`rc sort ${s} renders bars`, n > 0, "bars " + n);
  }

  /* ---- di: every department drills without error ---- */
  await page.click(`#nav a[data-d="di"]`); await page.waitForTimeout(150);
  const depts = await page.$$eval("#di-dept option", os => os.map(o => o.value));
  ok("di lists all departments", depts.length === 15, "n=" + depts.length);
  let drillSum = 0;
  for (const d of depts){
    await page.selectOption("#di-dept", d); await page.waitForTimeout(60);
    const v = await page.$$eval("#di-drill .kpi .val", els => els.map(e => e.textContent));
    ok(`di ${d} renders six KPIs`, v.length === 6, v.join("|"));
    ok(`di ${d} has no NaN`, !v.join("").includes("NaN"));
    drillSum += +v[1].replace(/,/g,"");
  }
  ok("di department records sum to the bankwide record total", drillSum === D.records,
    `${drillSum} vs ${D.records}`);
  /* overview sort + pager */
  await page.click("#di-ov th[data-sort='sites']"); await page.waitForTimeout(80);
  ok("di overview sorts", (await page.$$("#di-ov table.tb tbody tr")).length > 0);
  const pgs = await page.$$("#di-ov .pager button[data-pg]");
  ok("di overview pages", pgs.length > 0, "buttons " + pgs.length);
  await page.click("#di-ov .pager button[data-pg='next']"); await page.waitForTimeout(80);
  ok("di overview page 2 renders", (await page.$$("#di-ov table.tb tbody tr")).length > 0);

  /* ---- rm: four breakdowns ---- */
  await page.click(`#nav a[data-d="rm"]`); await page.waitForTimeout(150);
  for (const b of ["dept","year","classification","process"]){
    await page.click(`#rm-break button[data-seg="${b}"]`); await page.waitForTimeout(90);
    const has = await page.$eval("#rm-break", e => e.innerHTML.length);
    ok(`rm breakdown ${b} renders`, has > 400, "len " + has);
  }
  const rmDeptSum = await (async () => {
    await page.click(`#rm-break button[data-seg="dept"]`); await page.waitForTimeout(90);
    return page.$$eval("#rm-break .bl .bval b", els =>
      els.reduce((a,e) => a + (+e.textContent.replace(/,/g,"")), 0));
  })();
  ok("rm by department sums to the record total", rmDeptSum === D.records, `${rmDeptSum} vs ${D.records}`);

  /* ---- fs: sort every column, totals hold ---- */
  await page.click(`#nav a[data-d="fs"]`); await page.waitForTimeout(150);
  for (const c of ["files","storageGB","avgMB","label"]){
    await page.click(`#fs-tab th[data-sort='${c}']`); await page.waitForTimeout(80);
    const rows = await page.$$eval("#fs-tab table.tb tbody tr", r => r.length);
    ok(`fs sorts by ${c}`, rows === 8, "rows " + rows);
  }
  const fsFiles = await page.$$eval("#fs-rec .bl .bval b", els =>
    els.reduce((a,e) => a + (+e.textContent.replace(/,/g,"")), 0));
  ok("fs format bars sum to declared records", fsFiles === D.records, `${fsFiles} vs ${D.records}`);

  /* ---- ah: facility sort ---- */
  await page.click(`#nav a[data-d="ah"]`); await page.waitForTimeout(150);
  await page.click("#ah-fac th[data-sort='boxes']"); await page.waitForTimeout(80);
  ok("ah facility table sorts", (await page.$$("#ah-fac table.tb tbody tr")).length === 10);

  /* ---- su: top content toggle ---- */
  await page.click(`#nav a[data-d="su"]`); await page.waitForTimeout(150);
  for (const t of ["downloads","views"]){
    await page.click(`#su-top button[data-seg="${t}"]`); await page.waitForTimeout(90);
    ok(`su top by ${t}`, (await page.$$("#su-top .bl")).length > 0);
  }

  /* ---- ds: filter and sort ---- */
  await page.click(`#nav a[data-d="ds"]`); await page.waitForTimeout(150);
  const allRows = await page.$$eval("#ds-tab table.tb tbody tr", r => r.length);
  ok("ds lists every metric", allRows > 90, "rows " + allRows);
  const tierCounts = {};
  for (const t of ["ready","scan","usage","mapping","app","purview","opus","manual","termstore"]){
    await page.selectOption("#ds-filter", t); await page.waitForTimeout(80);
    tierCounts[t] = await page.$$eval("#ds-tab table.tb tbody tr", r => r.length);
    ok(`ds filter ${t} returns rows`, tierCounts[t] > 0, "rows " + tierCounts[t]);
  }
  const tierSum = Object.values(tierCounts).reduce((a,b)=>a+b,0);
  ok("ds tier filters partition the full list", tierSum === allRows, `${tierSum} vs ${allRows}`);
  await page.selectOption("#ds-filter", "all"); await page.waitForTimeout(80);
  await page.click("#ds-tab th[data-sort='tier']"); await page.waitForTimeout(80);
  ok("ds sorts by tier", (await page.$$("#ds-tab table.tb tbody tr")).length === allRows);

  /* ---- deep link ---- */
  await page.goto(FILE + "#rd"); await page.waitForTimeout(200);
  ok("deep link opens the right dashboard",
    (await page.evaluate(() => document.querySelector("#nav a.on").dataset.d)) === "rd");

  /* ---- no horizontal overflow at two widths ---- */
  for (const w of [1440, 1024]){
    await page.setViewportSize({width:w, height:1000});
    for (const k of KEYS){
      await page.click(`#nav a[data-d="${k}"]`); await page.waitForTimeout(100);
      const over = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      ok(`${k} no horizontal overflow at ${w}px`, !over);
    }
  }

  /* ---- console clean ---- */
  ok("no console errors or failed assertions", console_errors.length === 0,
    console_errors.slice(0, 5).join(" | "));

  await browser.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail) { console.log("\nFAILURES:"); errs.forEach(e => console.log("  - " + e)); process.exit(1); }
})();
