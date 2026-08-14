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

  /* ---------------- Project Insights, PPT s36 to s38 ---------------- */
  console.log("\nProject Insights");
  await page.evaluate(()=>switchTo("pj"));
  const sov=await page.$$eval(".dash-pj #pj-list .drow",els=>els.length);
  ok(sov>=3,`the sovereign list is populated (${sov} projects)`);
  const listTot=await page.$eval(".dash-pj #pj-list .dtot",e=>
    [...e.children].map(c=>c.textContent.trim()));
  const listRows=await page.$$eval(".dash-pj #pj-list .drow",els=>els.map(e=>
    [...e.children].map(c=>c.textContent.trim())));
  for(const [i,label] of [[1,"sites"],[2,"documents"],[3,"records"]]){
    eq(listRows.reduce((a,r)=>a+n(r[i]),0),n(listTot[i]),`sovereign ${label} sum to the total row`);
  }
  await page.selectOption(".dash-pj #pj-fac","Nonsovereign");
  const nonsov=await page.$$eval(".dash-pj #pj-list .drow",els=>els.length);
  ok(nonsov>=3,`switching to nonsovereign changes the list (${nonsov} projects)`);
  const nsTot=await page.$eval(".dash-pj #pj-list .dtot div",e=>e.textContent);
  ok(/Nonsovereign/.test(nsTot),"the total row names the facility type in scope");
  const profile=await page.$$eval(".dash-pj #pj-profile .pf .k",els=>els.map(e=>e.textContent.trim()));
  eq(profile.length,8,"the eight project attributes from PPT s38 are laid out");
  ok(profile.some(k=>/Modality/.test(k))&&profile.some(k=>/Effectivity/.test(k)),
     "the profile carries modality and effectivity date, as the client listed");
  await page.selectOption(".dash-pj #pj-sel","54461-003");
  const nameNow=await page.$eval(".dash-pj #pj-pname",e=>e.textContent);
  ok(/Human Capital/.test(nameNow),"choosing a project changes the profile");

  /* ---------------- Institutional File Plan, PPT s29 to s52 ---------------- */
  console.log("\nInstitutional File Plan");
  await page.evaluate(()=>switchTo("fp"));
  const catRows=await page.$$eval(".dash-fp #fp-cats .drow",els=>els.map(e=>
    [...e.children].map(c=>c.textContent.trim())));
  eq(catRows.length,5,"the five categories from PPT s47 are listed");
  const catTot=await page.$eval(".dash-fp #fp-cats .dtot",e=>
    [...e.children].map(c=>c.textContent.trim()));
  /* the categories must total the bank-wide figures, or the file plan quietly
     disagrees with Records Management about how many records exist */
  const rm=await page.evaluate(()=>({declared:DATA.DECLARED,documents:DATA.DOCUMENTS}));
  eq(catRows.reduce((a,r)=>a+n(r[5]),0),rm.declared,"the categories total the declared record count");
  eq(catRows.reduce((a,r)=>a+n(r[4]),0),rm.documents,"the categories total the document count");
  eq(n(catTot[5]),rm.declared,"the total row agrees with Records Management");
  const terms=await page.$$eval(".dash-fp #fp-terms .drow",els=>els.length);
  ok(terms>=3,`the first category lists its terms (${terms})`);
  await page.selectOption(".dash-fp #fp-cat","Programs and Operations");
  const poTerms=await page.$$eval(".dash-fp #fp-terms .drow .dn",els=>els.map(e=>e.textContent));
  ok(poTerms.some(t=>/Portfolio Management/.test(t)),
     "choosing a category shows that category's terms, as drawn on PPT s51");
  const top=await page.$$eval(".dash-fp #fp-top .hbar",els=>els.length);
  const bottom=await page.$$eval(".dash-fp #fp-bottom .hbar",els=>els.length);
  ok(top>0&&bottom>0,`most used and least used term panels are populated (${top} and ${bottom})`);
  const topVals=await page.$$eval(".dash-fp #fp-top .hf",els=>els.map(e=>+e.textContent.replace(/[^0-9]/g,"")));
  ok(topVals.every((v,i)=>i===0||topVals[i-1]>=v),"most used terms are ordered highest first");

  /* ---------------- Retention and Disposal, PPT s32 and s44 to s46 ---------------- */
  console.log("\nRetention and Disposal");
  await page.evaluate(()=>switchTo("rd"));
  const rt=await page.evaluate(()=>({labelTotal:DATA.LABEL_TOTAL,dueNext12:DATA.DUE_NEXT_12}));
  const rd=await page.evaluate(()=>DASHBOARDS.rd.summary);
  eq(rd.permanent+rd.temporary,rt.labelTotal,"permanent plus temporary total every labelled record");
  eq(rd.due,rt.dueNext12,"records due agree with the shared disposal window");
  const tempRows=await page.$$eval(".dash-rd #rd-terms .drow",els=>els.map(e=>
    [...e.children].map(c=>c.textContent.trim())));
  eq(tempRows.reduce((a,r)=>a+n(r[6]),0),rt.dueNext12,
     "the temporary terms carry every record due for disposal");
  eq(tempRows.reduce((a,r)=>a+n(r[3]),0),rd.temporary,
     "the temporary terms total the temporary record count");
  ok(tempRows.every(r=>/years|declaration|separation|closure/.test(r[5])),
     "every temporary term shows its duration, as drawn on PPT s46");
  await page.selectOption(".dash-rd #rd-mode","permanent");
  const permRows=await page.$$eval(".dash-rd #rd-terms .drow",els=>els.map(e=>
    [...e.children].map(c=>c.textContent.trim())));
  eq(permRows.reduce((a,r)=>a+n(r[3]),0),rd.permanent,"the permanent terms total the permanent count");
  const note=await page.$eval(".dash-rd #rd-mode-note",e=>e.textContent);
  ok(/never falls due/.test(note),"the permanent note explains why it carries no due figure");

  /* ---------------- Records and Archive Holdings, PPT s67 to s69 ---------------- */
  console.log("\nRecords and Archive Holdings");
  await page.evaluate(()=>switchTo("ra"));
  const stor=await page.$$eval(".dash-ra .drow",els=>els.map(e=>
    [...e.children].map(c=>c.textContent.trim())));
  ok(stor.length>=6,`storage and retrieval tables are both populated (${stor.length} rows)`);

  /* ---------------- across all four ---------------- */
  console.log("\nAcross all four, house rules");
  for(const k of ["pj","fp","rd","ra"]){
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
