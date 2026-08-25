/* The division tier, WITHDRAWN 17 Aug 2026.
 *
 * History, because this decision has been reversed twice and will be asked
 * about again. The tier came off on 10 August, went back on 13 August at the
 * client's instruction, and came off again on 17 August when the exports were
 * actually read.
 *
 * What the exports say. Cloud Governance HAS a Division column, and it is
 * empty on every row of every export we hold:
 *
 *     Workspace report   Division empty on all 1,032 EDRMS sites
 *     Users export       Division "-" on all 286 users
 *     Groups export      Division "-" on all 676 groups
 *     Guest, Request     Division empty
 *     M365 usage, M365 activity   no Division column at all
 *
 * That is a stronger finding than "not found yet". The field exists in the
 * system that would hold it and nobody has ever populated it, which is why
 * audit question 5 asks the client to populate it, supply it, or drop the
 * tier rather than asking the open question "what is a division".
 *
 * The tier also produced a defect worth remembering. Because a division had
 * no document count, the code split the department's documents in proportion
 * to records and then divided records by that. The v.rec cancels, so EVERY
 * division showed its parent's declaration rate to the decimal place, whatever
 * the data. It read as a finding ("both divisions declare at the same rate")
 * and it was arithmetic. That is what the tautology check below guards.
 *
 * So this file no longer tests the tier. It asserts the tier is gone, and it
 * guards the general class of error that made it dangerous.
 *
 *   node check_division.js /home/user/Jim/index.html
 */
const {chromium}=(()=>{for(const m of ["playwright-core","/tmp/node_modules/playwright-core"]){try{return require(m);}catch(e){}}throw new Error("playwright-core not found");})();
const path=process.argv[2]||"/home/user/Jim/index.html";
const url=path.startsWith("http")?path:"file://"+path;

let pass=0,fail=0;
const ok =(c,m)=>{c?(pass++,console.log("  pass  "+m)):(fail++,console.log("  FAIL  "+m));};
const eq =(a,b,m)=>ok(a===b,`${m} (${a}${a===b?"":" , expected "+b})`);

(async()=>{
  const browser=await chromium.launch({executablePath:"/opt/pw-browsers/chromium-1194/chrome-linux/chrome"});
  const page=await browser.newPage({viewport:{width:1500,height:1000}});
  const errors=[];
  page.on("console",m=>{if(m.type()==="error")errors.push(m.text());});
  page.on("pageerror",e=>errors.push(e.message));
  await page.goto(url);
  await page.waitForTimeout(500);

  console.log("The division tier is gone from every dashboard");
  for(const key of ["bw","dp","fp","rd","ra"]){
    await page.evaluate(k=>switchTo(k),key);
    await page.waitForTimeout(150);

    /* No disclosure control anywhere. The tier was the only thing that used
       one, so any .exp row means a tier has come back. */
    const exp=await page.$$eval(".drow.exp",els=>els.length);
    eq(exp,0,`no expandable row on ${key}`);
    const kid=await page.$$eval(".drow.kid",els=>els.length);
    eq(kid,0,`no child row on ${key}`);

    /* No column or row is headed Division. */
    const heads=await page.$$eval(".dhead div",els=>els.map(e=>e.textContent.trim()));
    ok(!heads.some(h=>/^division/i.test(h)),`no Division column on ${key}`);
    const body=await page.$eval("#view",e=>e.textContent);
    ok(!/\bDivisions? reporting\b/i.test(body),`no division tally on ${key}`);
  }

  /* The tautology guard. Any derived percentage column whose value repeats
     identically down every row of a table is suspect: either the column is
     genuinely constant, which is worth knowing, or its denominator is not
     independent of its numerator, which is the bug the division tier had.
     Tables of three rows or fewer are skipped, since a real constant is
     unremarkable there. */
  console.log("\nNo percentage column repeats identically down a table");
  for(const key of ["bw","dp","fp","rd"]){
    await page.evaluate(k=>switchTo(k),key);
    await page.waitForTimeout(150);
    const flat=await page.$$eval(".dtab",tabs=>tabs.map(t=>{
      const rows=[...t.querySelectorAll(".drow")].map(r=>
        [...r.children].map(c=>c.textContent.trim()));
      const head=[...(t.querySelector(".dhead")?.children||[])].map(c=>c.textContent.trim());
      return {head,rows};
    }));
    flat.forEach((t,ti)=>{
      if(t.rows.length<4)return;
      const ncol=t.rows[0].length;
      for(let c=1;c<ncol;c++){
        const vals=t.rows.map(r=>r[c]).filter(v=>/^-?[\d.]+%$/.test(v||""));
        if(vals.length<4)continue;
        const uniq=new Set(vals);
        ok(uniq.size>1,
           `${key} table ${ti+1}, column "${t.head[c]||c}" varies across ${vals.length} rows`+
           (uniq.size>1?"":`: every row reads ${vals[0]}`));
      }
    });
  }

  console.log("\nconsole errors: "+(errors.length?errors.join(" | "):"none"));
  ok(errors.length===0,"no console errors");

  console.log("\n==============================================");
  console.log(`pass ${pass}   fail ${fail}`);
  await browser.close();
  process.exit(fail?1:0);
})();
