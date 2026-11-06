// 6 Nov 2026: every Bank-wide breakdown has Search and Filter, and its figures follow them.
// node test/build-test-page.js, then node test/breakdown-filter-test.js
const {chromium}=require('playwright');
let fail=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fail++;};
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH});const p=await b.newPage({viewport:{width:1600,height:1000}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+__dirname+'/out/index.html');await p.waitForTimeout(700);
for(const [card,title] of [['EDRMS users','Total number of EDRMS users'],['Documents in EDRMS','Documents over time'],['Records declared in EDRMS','Total number of records declared']]){
  await p.click('.kpi:has-text("'+card+'")');await p.waitForTimeout(500);
  const P=p.locator('.panel',{hasText:title}).first();
  ok(await P.locator('.fBtn').count()===1,card+': Filter button');
  ok(await P.locator('input[type=search], .search input').count()>=1,card+': search box');
  ok(await P.locator('.ms-Dropdown').count()===0,card+': no single-unit drop-down');
  const tile=async()=>(await P.locator('.tiles').first().innerText()).replace(/\s+/g,' ');
  const before=await tile(), rowsBefore=await P.locator('tbody tr').count();
  await P.locator('input').first().fill('ITD');await p.waitForTimeout(400);
  const after=await tile(), rowsAfter=await P.locator('tbody tr').count();
  ok(before!==after,card+': figures follow the search');
  ok(rowsAfter>=1&&rowsAfter<rowsBefore,card+': table narrows ('+rowsBefore+' -> '+rowsAfter+')');
  await P.locator('input').first().fill('');await p.waitForTimeout(300);
  await P.locator('.fBtn').click();await p.waitForTimeout(300);
  await p.click('.fPop .cgPick >> nth=0');await p.waitForTimeout(300);
  await p.click('.cgOpts .ms-Checkbox:has-text("RM")');await p.keyboard.press('Escape');await p.waitForTimeout(200);
  await p.click('.fBtns >> text=Apply');await p.waitForTimeout(400);
  const rm=(await P.locator('tbody tr').allInnerTexts()).map(t=>t.trim().split(/\s+/)[0]).filter(c=>c!=='Total,'&&c!=='Total');
  ok(rm.length>0&&rm.every(c=>['INRM','PRCM','SLRM'].includes(c)),card+': Filter RM keeps only RM units ('+rm.join(',')+')');
}
ok(errs.length===0,'no page errors '+errs.join('|'));
await b.close();console.log(fail?fail+' FAILED':'ALL PASSED');process.exit(fail?1:0);})();
