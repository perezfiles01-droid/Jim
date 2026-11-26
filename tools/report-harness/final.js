const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1600,height:1000}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/MutationObserver|ReactDOM.render/.test(m.text()))errs.push(m.text().slice(0,200))});
const ok=(n,c)=>console.log((c?'PASS ':'FAIL ')+n);
await p.goto('file://'+__dirname+'/index.html');await p.waitForTimeout(3500);
ok('overview chart',await p.locator('svg rect').count()>10);ok('5 cards',await p.locator('[aria-pressed]').count()===5);
ok('no page scroll',await p.evaluate(()=>document.documentElement.scrollHeight<=innerHeight));
const cards=['EDRMS Sites','ADB Users','Documents in EDRMS','Records Declared in EDRMS','Physical Records Identified in EDRMS'];
for(const c of cards){await p.locator(`[aria-label="${c}"]`).first().click();await p.waitForTimeout(700);
 const crumb=await p.locator('[class*=frameTitle]').innerText();ok(c+' breadcrumb',crumb.includes(c));
 const rows=await p.locator('tbody tr').count();ok(c+' rows '+rows,rows>5);
 await p.locator(`[aria-label="${c}"]`).first().click();await p.waitForTimeout(300);ok(c+' re-click stays',await p.locator('[class*=frameTitle]').count()===1);}
await p.locator('button:has-text("Previous month")').click();await p.waitForTimeout(300);
const u=p.url();ok('link has state',/bw.open/.test(decodeURIComponent(u))&&/previous/.test(decodeURIComponent(u)));
await p.locator('button:has-text("Back to overview")').click();await p.waitForTimeout(500);ok('breadcrumb back',await p.locator('text=Filtered results').count()===1);
const q=await b.newPage({viewport:{width:1600,height:1000}});await q.goto(u);await q.waitForTimeout(3000);ok('link restores',(await q.locator('[class*=frameTitle]').innerText()).includes('Physical'));
const bad=u.split('#')[0]+'#edrms='+encodeURIComponent(JSON.stringify({'bw.open':'nope'}));const r=await b.newPage({viewport:{width:1600,height:1000}});await r.goto(bad);await r.waitForTimeout(3000);ok('bad link -> default',(await r.locator('[class*=frameTitle]').count())===0);
await p.locator('text=Department Insights').first().click();await p.waitForTimeout(2500);ok('department insights renders',(await p.evaluate(()=>document.body.innerText)).includes('Department insights'));
await p.locator('[aria-label="Close navigation"]').click();await p.waitForTimeout(500);ok('sidebar collapses',await p.locator('[aria-label="Open navigation"]').count()===1);
console.log('errors',errs.length,errs.slice(0,3));await b.close();})();
