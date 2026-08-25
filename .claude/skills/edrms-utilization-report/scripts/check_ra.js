/* ===================================================================
   check_ra.js  --  Records and Archive Holdings, PPT s67 to s69

   Written 24 August 2026, when that dashboard was rebuilt to the three
   slides the client drew.

   WHY THIS IS A SEPARATE FILE. The RA assertions belong in
   check_stage3.js and were rewritten there too. But that file is stale
   in ways that have nothing to do with this dashboard: it asserts that
   Project Insights is withdrawn, which was reversed on 21 August, and
   that the File Plan lists five categories where it now lists six. It
   throws on the File Plan long before it reaches Records and Archive
   Holdings, so the RA block there cannot currently run. Repairing the
   other five dashboards' assertions is a separate job with a separate
   owner. This file runs today.

   Run:  node .claude/skills/edrms-utilization-report/scripts/check_ra.js
   =================================================================== */
const path=require("path");
const {chromium}=(()=>{for(const m of ["playwright-core","/tmp/node_modules/playwright-core"])
  {try{return require(m);}catch(e){}}
  throw new Error("playwright-core not found");})();

let fails=0,passes=0;
const ok=(cond,msg)=>{cond?(passes++,console.log("  pass  "+msg))
                          :(fails++,console.log("  FAIL  "+msg));};
const eq=(a,b,msg)=>ok(a===b,`${msg} (${a} , expected ${b})`);

(async()=>{
  const file=process.argv[2]||path.join(process.cwd(),"index.html");
  const browser=await chromium.launch({executablePath:"/opt/pw-browsers/chromium"});
  const page=await browser.newPage();
  const errs=[];
  page.on("pageerror",e=>errs.push(e.message));
  page.on("console",m=>{if(m.type()==="error")errs.push(m.text());});
  await page.goto("file://"+file,{waitUntil:"load"});
  await page.evaluate(()=>switchTo("ra"));

  const txt=await page.$eval(".dash-ra",e=>e.textContent);

  console.log("\ns67, the overview the client screenshotted");
  for(const t of ["Total storage and retrieval requests","Total storage activities",
                  "Total staff supported","Total retrieval activities"])
    ok(txt.includes(t),`s67 carries its own tile: ${t}`);
  /* The client's own published totals, which reconcile on their own slide. */
  for(const v of ["259","7,305","283","541","6,697","608","492","49"])
    ok(txt.includes(v),`the client's own s67 figure survives on the page: ${v}`);

  console.log("\ns68 storage, the client's column names word for word");
  for(const col of ["Total number of requestors (departments)",
                    "Total number of requestors (RMs)",
                    "Total number of boxes stored",
                    "Total number of folders stored","Remarks"])
    ok(txt.includes(col),`s68 keeps: ${col}`);

  console.log("\ns69 retrieval, the client's column names word for word");
  for(const col of ["Total number of boxes retrieved",
                    "Total number of folders retrieved",
                    "Status (Loan, Return to owner, For Disposal)"])
    ok(txt.includes(col),`s69 keeps: ${col}`);

  console.log("\nThe three locations the client names");
  for(const loc of ["Archives Room","Records Center","Offsite Storage"])
    ok(txt.includes(loc),`carries the client's location: ${loc}`);

  console.log("\nTheir callouts, built or named as open");
  ok(/month on month/i.test(txt),"the month on month indicator both slides ask for is built");
  ok(/by department, office or RM/i.test(txt),"the per department cut both slides ask for is built");
  ok(/disposed/i.test(txt),"s69's boxes and folders disposed is built");
  ok(/awaiting transfer/i.test(txt),"s68's counterparts awaiting transfer is built");

  console.log("\nThe capacity question stays a QUESTION");
  /* s68 and s69 ask US whether capacity and freed capacity can be included.
     A bar was drawn here until 24 August with an invented 65, 80 and 45 per
     cent, answering the client's open question with a fabrication. A later
     edit restoring it would put that back in front of the committee, so the
     absence is asserted and the question kept alive instead. */
  ok(!/%\s*used/i.test(txt),"no capacity chart answers the client's own open question");
  ok(txt.includes("% available storage capacity"),
     "the capacity question is put back to the client rather than answered");

  console.log("\nNothing invented, nothing random");
  /* Until 24 August the requestor counts came from Math.random(), so the
     tables printed different numbers on every mount and reconciled with
     nothing. Same fault that made Project Insights unusable until 21 August. */
  const grab=()=>page.$$eval(".dash-ra .tv,.dash-ra .num",els=>els.map(e=>e.textContent));
  const first=await grab();
  await page.evaluate(()=>switchTo("bw"));
  await page.evaluate(()=>switchTo("ra"));
  const second=await grab();
  const drift=first.filter((v,i)=>v!==second[i]).length;
  eq(drift,0,"every figure is stable across a remount, so nothing on the page is random");
  ok(first.length>0,"the dashboard actually rendered figures to compare");

  /* The invented totals STATUS.md records as stripped from this dashboard once
     already. If any of them comes back, it comes back as a fabrication. */
  for(const bad of ["1,840","9,260"])
    ok(!txt.includes(bad),`the invented figure ${bad} has not returned`);

  console.log("\nHouse rules");
  const nos=await page.$$eval(".dash-ra .nosrc",els=>els.length);
  eq(nos,0,"no unsourced cell is left on Records and Archive Holdings");
  ok(!txt.includes("Not captured"),"the withdrawn Not captured convention has not returned");
  ok(!txt.includes("—"),"no em dash in visible text");
  const badTap=await page.$$eval(".dash-ra .kpi.stat .tap",els=>els.length);
  eq(badTap,0,"no static card carries a click affordance");
  eq(errs.length,0,`no runtime error while mounting (${errs.join(" | ")||"none"})`);

  console.log(`\n${passes} passed, ${fails} failed`);
  await browser.close();
  process.exit(fails?1:0);
})();
