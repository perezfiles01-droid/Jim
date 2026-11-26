const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];
for(const [w,h] of [[1225,703],[1366,768],[1920,1080]]){const p=await b.newPage({viewport:{width:w,height:h}});p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+__dirname+'/sp2.html');await p.waitForTimeout(4500);
const chk=async n=>{await p.waitForTimeout(900);const r=await p.evaluate(()=>{const c=document.querySelector('[data-sizing]');return [...c.querySelectorAll('*')].concat([c]).filter(e=>{const s=getComputedStyle(e).overflowY;return (s==='auto'||s==='scroll')&&e.scrollHeight>e.clientHeight+1&&!e.closest('table')&&!/scroll|list|nav/.test(String(e.className))}).map(e=>(e.id||e.className).toString().slice(0,30)+':'+(e.scrollHeight-e.clientHeight))});console.log(w+'x'+h,n,r.length?'SCROLL '+r.join(','):'fits');};
await chk('overview');
for(const c of ['EDRMS Sites','ADB Users','Physical Records Identified in EDRMS']){await p.locator(`[aria-label="${c}"]`).first().click();await chk(c);await p.locator('button:has-text("Back to overview")').click();}
await p.locator('text=Department Insights').first().click();await chk('Department Insights');
if(w===1225){await p.locator('text=Bank-wide Oversight').first().click();await p.waitForTimeout(1200);await p.screenshot({path:'lap.png'});}
await p.close();}
console.log('errors',errs);await b.close();})();
