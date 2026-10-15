// Usage: npm run build, then node test/build-test-page.js (needs esbuild),
// then node test/interaction-test.js (needs playwright; set CHROMIUM_PATH if needed).
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH});
const ctx=await b.newContext({viewport:{width:1872,height:1030},acceptDownloads:true});const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push('PAGEERROR '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200));});
const ok=(n,c)=>console.log((c?'PASS ':'FAIL ')+n);
await p.goto('file://'+__dirname+'/out/index.html');await p.waitForTimeout(600);
// search
await p.fill('.search >> nth=0','fin');await p.waitForTimeout(200);
ok('search finds FIN',(await p.$$eval('.tbl >> nth=0',t=>t[0].querySelectorAll('tbody tr').length))===1);
await p.fill('.search >> nth=0','');
// filter
await p.click('.fBtn >> nth=0');await p.waitForTimeout(300);
await p.click('text=All Departments / Offices / RMs / ROs');await p.click('.fList >> text=ITD');await p.click('.fList >> text=HRD');await p.click('.fBtns >> text=Apply');await p.waitForTimeout(200);
ok('filter shows 2',(await p.$$eval('.tbl >> nth=0',t=>t[0].querySelectorAll('tbody tr').length))===2);
ok('filter button counts',(await p.textContent('.fBtn >> nth=0')).includes('(2)'));
// pager
await p.click('.fBtn >> nth=0');await p.click('.fBtns >> text=Reset');
await p.click('.pbtns >> nth=0 >> text=2');ok('page 2',(await p.textContent('.pinfo >> nth=0')).includes('11 to 16'));
// excel
const [dl]=await Promise.all([p.waitForEvent('download',{timeout:15000}),p.click('.xpBtn >> nth=0')]);ok('excel '+dl.suggestedFilename(),dl.suggestedFilename().endsWith('.xlsx'));
// trend: all time + year view
await p.click('text=All time');await p.click('.seg button:text-is("Year") >> nth=-1');await p.waitForTimeout(200);
const bars=await p.$$('.chart rect.click');ok('year bars clickable '+bars.length,bars.length>=1);
await bars[bars.length-1].click();await p.waitForTimeout(200);ok('year drill crumb',!!(await p.$('text=All years')));
// comparison mode
await p.click('.cmpH >> text=Approximate headcount');ok('cmp sorted',(await p.textContent('.cmpH')).includes('↓'));
// dept link -> DI
await p.click('.tbl >> nth=0 >> tbody tr >> nth=0');await p.waitForTimeout(500);
const title=await p.textContent('.band h2');const pick=await p.textContent('.picker >> nth=0');
ok('opens DI for PARD ('+pick+')',title.includes('Department insights')&&pick.includes('PARD'));
ok('sites card 90',(await p.textContent('.kpi .val >> nth=0')).trim()==='90');
// DI: year select + bar click
await p.click('.chart rect.click >> nth=0');await p.waitForTimeout(200);ok('sites year drill',(await p.textContent('.boxT >> nth=0')).includes('Sites created in'));
// visitors drill bar select
await p.click('.kpi >> nth=1');await p.click('.hbar >> nth=0');await p.waitForTimeout(200);
ok('bar selects one row',(await p.$$eval('.tbl >> nth=0',t=>t[0].querySelectorAll('tbody tr').length))===1);
// phys tie
await p.click('.kpi >> nth=4');const more=await p.$('.more');if(more){await more.click();await p.waitForTimeout(200);ok('tie chip',!!(await p.$('.chip')));}
// site picker
await p.click('.picker >> nth=1');await p.waitForTimeout(300);await p.click('.ms-Dropdown-item >> nth=2');await p.keyboard.press('Escape');await p.waitForTimeout(300);
ok('site filter changes sites card',(await p.textContent('.kpi .val >> nth=0')).trim()==='1');
// pdf
const [pdf]=await Promise.all([p.waitForEvent('download',{timeout:60000}),p.click('.pdfBtn')]);ok('pdf '+pdf.suggestedFilename(),pdf.suggestedFilename().endsWith('.pdf'));
await pdf.saveAs(__dirname+'/out/test.pdf');
// sidebar
await p.click('.menuBtn');ok('sidebar closes',await p.$eval('.side',e=>e.classList.contains('closed')));
console.log(errs.join('\n')||'no errors');await b.close();})();
