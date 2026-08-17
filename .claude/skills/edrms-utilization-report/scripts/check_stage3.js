/* Stage 3 of the client redesign of 13 Aug 2026: Project Insights, the
 * Institutional File Plan, Retention and Disposal, and Records and Archive
 * Holdings.
 *
 * Three of these four have no buildable requirement at all, which changes what
 * is worth checking. On a dashboard where every figure is layout, the figures
 * matter less than the honesty: that the page says so, that no unsourceable
 * cell shows a plausible number without saying where it came from, and that
 * the one dashboard with real arithmetic (Retention and Disposal) still
 * reconciles with the Retention dashboard it overlaps.
 *
 *   node check_stage3.js /home/user/Jim/index.html
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

const n  =s=>+String(s).replace(/[^0-9]/g,"");

(async()=>{
  const browser=await chromium.launch({executablePath:"/opt/pw-browsers/chromium-1194/chrome-linux/chrome"});
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];
  page.on("console",m=>{if(m.type()==="error"||m.type()==="assert")errors.push(m.text());});
  page.on("pageerror",e=>errors.push(String(e)));
  await page.goto(url,{waitUntil:"load"});

  /* ---------------- Project Insights, WITHDRAWN 17 Aug ---------------- */
  /* s36, s37 and s38 are gone with the two Bank-wide project tiles that
     reached them. Nothing in SharePoint, Cloud Governance or drm-npr records
     that a site belongs to a project, so not one figure on those three screens
     could be produced: they were demo data with no path to a real number. The
     whole dashboard is kept working in
     EDRMS_Prototype_with_project_sites_2026-08-17.html and goes back the day
     the client supplies the register. Audit question 2.

     One lead worth testing before asking: 1,024 of the 1,032 EDRMS site URLs
     in the test tenant begin "prj_", so the site naming convention may already
     mark project sites and may even carry the project number. If the client
     confirms their convention document, question 2 shrinks from "give us a
     register" to "confirm the prefix". */
  console.log("\nProject Insights, withdrawn");
  const pjNav=await page.$('.nav a[data-d="pj"]');
  ok(!pjNav,"Project Insights is out of the nav, not left empty");
  const pjSection=await page.$(".dash-pj");
  ok(!pjSection,"the Project Insights section is gone");

  /* ---------------- Institutional File Plan, PPT s29 to s52 ---------------- */
  console.log("\nInstitutional File Plan");
  await page.evaluate(()=>switchTo("fp"));
  const catRows=await page.$$eval(".dash-fp #fp-cats .drow",els=>els.map(e=>
    [...e.children].map(c=>c.textContent.trim())));
  eq(catRows.length,5,"the five categories from PPT s47 are listed");
  /* The categories must total the bank-wide figures, or the file plan quietly
     disagrees with Records Management about how many records exist. The Total
     rows came off on 17 August by instruction, so this now sums the column off
     the screen, which is the stronger check: it cannot pass on a total that was
     computed separately from the rows above it. */
  const rm=await page.evaluate(()=>({declared:DATA.DECLARED,documents:DATA.DOCUMENTS}));
  eq(catRows.reduce((a,r)=>a+n(r[5]),0),rm.declared,"the categories total the declared record count");
  eq(catRows.reduce((a,r)=>a+n(r[4]),0),rm.documents,"the categories total the document count");

  const terms=await page.$$eval(".dash-fp #fp-terms .drow",els=>els.length);
  ok(terms>=3,`the first category lists its terms (${terms})`);
  await page.selectOption(".dash-fp #fp-cat","Programs and Operations");
  const poTerms=await page.$$eval(".dash-fp #fp-terms .drow .dn",els=>els.map(e=>e.textContent));
  ok(poTerms.some(t=>/Portfolio Management/.test(t)),
     "choosing a category shows that category's terms, as drawn on PPT s51");
  const bars=await page.$$eval(".dash-fp #fp-terms .hbar",els=>els.length);
  ok(bars>0,`most used and least used term panels are populated (${bars} bars)`);
  /* s48 to s52 all repeat five indicators. Three have no source. */
  const asks=await page.$eval(".dash-fp #fp-terms .asks",e=>e.textContent);
  ok(/outside the convention/i.test(asks)&&/new term/i.test(asks),
     "the indicators s48 to s52 repeat are listed rather than invented");

  /* ---------------- Retention and Disposal, PPT s44 to s46 ---------------- */
  console.log("\nRetention and Disposal");
  await page.evaluate(()=>switchTo("rd"));
  const rd=await page.evaluate(()=>DASHBOARDS.rd.summary);
  const rt=await page.evaluate(()=>({dueNext12:DATA.DUE_NEXT_12,labelled:DATA.LABEL_TOTAL,
    phys:DATA.WITH_PHYSICAL}));
  eq(rd.permanent+rd.temporary,rt.labelled,"permanent plus temporary total every labelled record");
  eq(rd.due,rt.dueNext12,"records due agree with the shared disposal window");

  /* s44 is this dashboard's slide 1, reached from the Bank-wide tile. */
  const body=await page.$eval(".dash-rd",e=>e.textContent);
  ok(/EDRMS retention and disposal insights/.test(body),"the s44 rollup opens this dashboard");
  ok(!/disposition risk/i.test(body),"Disposition risk is gone, it appears nowhere in the deck");
  ok(!/without a schedule/i.test(body),"Records with and without a schedule is gone, likewise");

  /* s45 and s46 are two DIFFERENT tables: permanent carries a document count
     and no retention label, temporary carries the label, the due date and the
     disposed count. They are drawn separately rather than collapsed into one. */
  const heads=await page.$$eval(".dash-rd .dhead",els=>els.map(e=>
    [...e.children].map(c=>c.textContent.trim())));
  /* Four tables: the client's three, then the retention label grouping added
     after them. The permanent versus temporary split needs a rule that sorts
     the 53 labels into two groups and nothing holds that rule, whereas the
     label itself is on every declared record. The order matters and is
     asserted: the client's own design is read first, the buildable
     alternative sits after it, never in place of it. */
  eq(heads.length,4,"four tables: the rollup, permanent, temporary, and labels");
  ok(heads[1].includes("Number of documents")&&!heads[1].includes("Retention label"),
     "the permanent table carries documents and no retention label, PPT s45");
  ok(heads[2].includes("Retention label")&&heads[2].includes("Number of records due for disposal"),
     "the temporary table carries the label and the due count, PPT s46");
  ok(!heads.some(h=>h.includes("Number of records disposed")),
     "records disposed is absent, not printed empty: it needs the disposal fields");
  ok(heads[3][0]==="Retention label"&&heads[3].includes("Number of records declared"),
     "the label grouping is last, after the client's own three screens");

  /* It must cover the whole declared holding, or it is not an alternative to
     the split at all. Read off the screen, not from DATA. */
  const labTot=await page.$$eval(".dash-rd .dtab",els=>{
    const t=els[els.length-1], rows=[...t.querySelectorAll(".drow")];
    return rows.reduce((a,r)=>a+Number(r.children[1].textContent.replace(/,/g,"")),0);
  });
  const rollTot=await page.$$eval(".dash-rd .dtab",els=>{
    const rows=[...els[0].querySelectorAll(".drow")];
    return rows.reduce((a,r)=>a+Number(r.children[3].textContent.replace(/,/g,"")),0);
  });
  eq(labTot,rollTot,"the retention labels total every declared record, same as the rollup");

  const tabs=await page.$$eval(".dash-rd .dtab",els=>els.map(t=>
    [...t.querySelectorAll(".drow")].map(r=>[...r.children].map(c=>c.textContent.trim()))));
  eq(tabs[1].reduce((a,r)=>a+n(r[4]),0),rd.permanent,"the permanent terms total the permanent count");
  eq(tabs[2].reduce((a,r)=>a+n(r[3]),0),rd.temporary,"the temporary terms total the temporary count");
  eq(tabs[2].reduce((a,r)=>a+n(r[6]),0),rt.dueNext12,
     "the temporary terms carry every record due for disposal");
  ok(tabs[2].every(r=>/years|declaration|separation|closure/.test(r[5])),
     "every temporary term shows its duration, as drawn on PPT s46");
  /* Every unsourced measure came off this dashboard rather than printing an
     empty cell. Asserting the absence is the point: a later edit that puts one
     back would show a blank column to a committee. What was removed is
     recorded in STATUS.md so the client questions behind it stay live. */
  const disposed=await page.$$eval(".dash-rd .nosrc",els=>els.length);
  eq(disposed,0,"no unsourced cell is left on Retention and Disposal");

  /* ---------------- Records and Archive Holdings, PPT s67 to s69 ---------------- */
  console.log("\nRecords and Archive Holdings");
  await page.evaluate(()=>switchTo("ra"));
  /* s68 and s69 are drawn with real column headings, so the SHAPE is a
     requirement even though no system holds a box, a folder or a retrieval.
     They are listed as the columns each screen needs rather than drawn as a
     grid of empty cells, because a table of blanks reads as a broken report
     while a list of columns reads as the specification this still is. */
  const specs=await page.$$eval(".dash-ra .spec",els=>els.map(e=>
    [...e.querySelectorAll("li")].map(li=>li.textContent.trim())));
  eq(specs.length,2,"storage and retrieval are both specified, PPT s68 and s69");
  ok(specs[0].includes("Remarks")&&specs[0].includes("Total number of boxes stored"),
     "the storage spec carries the client's own column names, including Remarks");
  ok(specs[1].includes("Status")&&specs[1].includes("Total number of boxes retrieved"),
     "the retrieval spec carries the client's own column names, including Status");
  const raNos=await page.$$eval(".dash-ra .nosrc",els=>els.length);
  eq(raNos,0,"no unsourced cell is left on Records and Archive Holdings");

  /* ---------------- across all three ---------------- */
  console.log("\nAcross all three, house rules");
  for(const k of ["fp","rd","ra"]){
    await page.evaluate(key=>switchTo(key),k);
    const txt=await page.$eval(`.dash-${k}`,e=>e.textContent);
    ok(!txt.includes("—"),`no em dash in visible text on ${k}`);
    const badTap=await page.$$eval(`.dash-${k} .kpi.stat .tap`,els=>els.length);
    eq(badTap,0,`no static card carries a click affordance on ${k}`);
    const vals=await page.$$eval(`.dash-${k} .kpi .val`,els=>els.map(e=>e.textContent.trim()));
    ok(vals.every(v=>v.length>0),`every KPI card on ${k} carries a value`);
  }

  console.log("\nconsole errors: "+(errors.length?errors.join(" | "):"none"));
  ok(errors.length===0,"no console errors");

  console.log("\n==============================================");
  console.log(`pass ${pass}   fail ${fail}`);
  await browser.close();
  process.exit(fail?1:0);
})();
