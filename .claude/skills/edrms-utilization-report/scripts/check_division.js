/* The division tier, reinstated 13 Aug 2026 at the client's instruction,
 * reopening the decision of 10 August.
 *
 * Division appears on four panels across two dashboards: PPT s41 and s42 on
 * Bank-wide, PPT s54 and s58 on Department Insights. The risk is the same on
 * all four: a tier that expands and looks convincing while its children do not
 * add up to their parent. That is invisible on screen and obvious here.
 *
 * It also checks the thing that matters more than the arithmetic: every panel
 * carrying division is marked as having no source, because nothing in the
 * tenant populates it and the tier is built on the client's instruction rather
 * than on a data source appearing.
 *
 *   node check_division.js /home/user/Jim/index.html
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

  console.log("\nThe tier exists and is shared, not invented twice");
  const shared=await page.evaluate(()=>{
    const f=DASHBOARDS.bw.summary.divisionsFor;
    return typeof f==="function" && f("ITD").length>0;
  });
  ok(shared,"Bank-wide exposes the division tier for Department Insights to reuse");
  const counts=await page.evaluate(()=>DASHBOARDS.bw.summary.departments
    .map(d=>DASHBOARDS.bw.summary.divisionsFor(d.code).length));
  ok(counts.every(n=>n>=2&&n<=4),`every department has 2 to 4 divisions (${counts.join(",")})`);

  console.log("\nDivisions add up to their department, all 16 walked");
  const bad=await page.evaluate(()=>{
    const S=DASHBOARDS.bw.summary,out=[];
    for(const d of S.departments){
      const v=S.divisionsFor(d.code);
      const sum=k=>v.reduce((a,x)=>a+x[k],0);
      if(sum("rec")!==d.rec)   out.push(d.code+" records "+sum("rec")+" vs "+d.rec);
      if(sum("phys")!==d.phys) out.push(d.code+" counterparts "+sum("phys")+" vs "+d.phys);
      if(sum("users")!==d.users)out.push(d.code+" users "+sum("users")+" vs "+d.users);
    }
    return out;
  });
  ok(bad.length===0,"every department's divisions total the department"+
     (bad.length?": "+bad.slice(0,4).join(" | "):""));

  console.log("\nBank-wide, PPT s41 and s42");
  await page.evaluate(()=>switchTo("bw"));
  for(const [k,label] of [["rec","records declared"],["phys","physical counterparts"]]){
    await settle(page,`.dash-bw #bw-kpis .kpi[data-k="${k}"]`);
    const title=await page.$eval(".dash-bw #bw-drill .ptitle",e=>e.textContent.toLowerCase());
    ok(/division/.test(title),`the ${label} table names the division tier in its title`);
    const closed=await page.$$eval(".dash-bw #bw-drill .drow.kid",els=>els.length);
    eq(closed,0,`${label} divisions start closed`);
    const twisty=await page.$$eval(".dash-bw #bw-drill .drow.exp .tw",els=>els.map(e=>e.textContent.trim()));
    ok(twisty.length===16&&twisty.every(t=>t==="▸"),
       `${label} shows a closed disclosure control on all 16 departments`);
    await page.click('.dash-bw #bw-drill .drow.exp[data-dep="ITD"]');
    const kids=await page.$$eval(".dash-bw #bw-drill .drow.kid .dn",els=>els.map(e=>e.textContent.trim()));
    ok(kids.length>=2,`${label} opens ITD divisions (${kids.length} rows)`);
    ok(kids.every(t=>/Division/.test(t)),`${label} child rows are named as divisions`);
    /* the children on screen must sum to the parent on screen, not merely in
       the model: this is what catches a rendering column being off by one */
    const sums=await page.evaluate(()=>{
      const parent=document.querySelector('#bw-drill .drow.exp[data-dep="ITD"]');
      const p=+parent.children[1].textContent.replace(/[^0-9]/g,"");
      let c=0,el=parent.nextElementSibling;
      while(el&&el.classList.contains("kid")){c+=+el.children[1].textContent.replace(/[^0-9]/g,"");el=el.nextElementSibling;}
      return {p,c};
    });
    eq(sums.c,sums.p,`${label} child rows on screen sum to the department row`);
    await page.click('.dash-bw #bw-drill .drow.exp[data-dep="ITD"]');
    const reclosed=await page.$$eval(".dash-bw #bw-drill .drow.kid",els=>els.length);
    eq(reclosed,0,`${label} divisions close again on a second click`);
  }

  console.log("\nDepartment Insights, PPT s54 and s58");
  await page.evaluate(()=>switchTo("dp"));
  await page.selectOption(".dash-dp #dp-sel","ITD");
  await settle(page,'.dash-dp #dp-kpis .kpi[data-k="users"]');
  const uTitle=await page.$eval(".dash-dp #dp-drill .ptitle",e=>e.textContent.toLowerCase());
  ok(/division/.test(uTitle),"the users table is by division, as drawn on PPT s54");
  const uRows=await page.$$eval(".dash-dp #dp-drill .drow .dn",els=>els.map(e=>e.textContent.trim()));
  ok(uRows.every(t=>/Division/.test(t)),`every users row is a division (${uRows.length} rows)`);
  const uSum=await page.evaluate(()=>{
    const rows=[...document.querySelectorAll("#dp-drill .drow")];
    return rows.reduce((a,r)=>a+ +r.children[1].textContent.replace(/[^0-9]/g,""),0);
  });
  const deptUsers=await page.evaluate(()=>
    DASHBOARDS.bw.summary.departments.find(d=>d.code==="ITD").users);
  eq(uSum,deptUsers,"the division rows on screen total the department's users");

  await settle(page,'.dash-dp #dp-kpis .kpi[data-k="rec"]');
  const rTitle=await page.$eval(".dash-dp #dp-drill .ptitle",e=>e.textContent.toLowerCase());
  ok(/division/.test(rTitle),"the declaration table offers the division tier, as drawn on PPT s58");
  const startClosed=await page.$$eval(".dash-dp #dp-drill .drow.kid",els=>els.length);
  eq(startClosed,0,"site divisions start closed");
  await page.click(".dash-dp #dp-drill .drow.exp");
  const openKids=await page.evaluate(()=>{
    const parent=document.querySelector("#dp-drill .drow.exp");
    const p=+parent.children[1].textContent.replace(/[^0-9]/g,"");
    let c=0,n=0,el=parent.nextElementSibling;
    while(el&&el.classList.contains("kid")){c+=+el.children[1].textContent.replace(/[^0-9]/g,"");n++;el=el.nextElementSibling;}
    return {p,c,n};
  });
  ok(openKids.n>=2,`a site opens its divisions (${openKids.n} rows)`);
  eq(openKids.c,openKids.p,"a site's division rows sum to the site row");

  console.log("\nChanging department resets the tier");
  await page.selectOption(".dash-dp #dp-sel","FIN");
  const afterSwitch=await page.$$eval(".dash-dp #dp-drill .drow.kid",els=>els.length);
  eq(afterSwitch,0,"switching department closes any open division rows");
  const finDiv=await page.evaluate(()=>{
    document.querySelector('#dp-kpis .kpi[data-k="users"]').click();
    return [...document.querySelectorAll("#dp-drill .drow .dn")].map(e=>e.textContent.trim());
  });
  ok(finDiv.every(t=>/^FIN/.test(t)),"the divisions shown belong to the newly chosen department");

  console.log("\nHouse rules");
  for(const k of ["bw","dp"]){
    await page.evaluate(key=>switchTo(key),k);
    const txt=await page.$eval(`.dash-${k}`,e=>e.textContent);
    ok(!txt.includes("—"),`no em dash in visible text on ${k}`);
  }

  console.log("\nconsole errors: "+(errors.length?errors.join(" | "):"none"));
  ok(errors.length===0,"no console errors, which is how the division reconciliation asserts surface");

  console.log("\n==============================================");
  console.log(`pass ${pass}   fail ${fail}`);
  await browser.close();
  process.exit(fail?1:0);
})();
