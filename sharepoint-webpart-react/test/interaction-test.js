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
// filter: the popup holds Category > Sub-category > Sub-group (RAC Item 5)
await p.click('.fBtn >> nth=0');await p.waitForTimeout(300);
ok('filter heading',(await p.textContent('.fPop .fHead')).includes('Filter Department / Office / RM / RO'));
await p.click('.fPop .cgPick >> nth=0');await p.waitForTimeout(300);
await p.fill('.cgQ','r');await p.waitForTimeout(150);ok('category search narrows the list',(await p.$$eval('.cgOpts .ms-Checkbox',x=>x.length))===2);
await p.click('.cgOpts .ms-Checkbox:has-text("RO")');await p.keyboard.press('Escape');await p.waitForTimeout(300);
ok('popup stays open after choosing',!!(await p.$('.fPop')));
await p.click('.fBtns >> text=Apply');await p.waitForTimeout(300);
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
const title=await p.textContent('.band h2');const pick=await p.textContent('.cgPick >> nth=1');
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
await p.click('.cgG:has-text("Site") .picker');await p.waitForTimeout(300);await p.click('.ms-Dropdown-item >> nth=2');await p.keyboard.press('Escape');await p.waitForTimeout(300);
ok('site filter changes sites card',(await p.textContent('.kpi .val >> nth=0')).trim()==='1');
// pdf
await p.click('.pdfBtn');ok('export menu opens',!!(await p.$('.xMenu')));
const [pdf]=await Promise.all([p.waitForEvent('download',{timeout:60000}),p.click('.xMenu button:has-text("PDF")')]);ok('pdf '+pdf.suggestedFilename(),pdf.suggestedFilename().endsWith('.pdf'));
await pdf.saveAs(__dirname+'/out/test.pdf');
// powerpoint: every breakdown and section, Department Insights
await p.waitForTimeout(500);await p.click('.pdfBtn');
const [px]=await Promise.all([p.waitForEvent('download',{timeout:120000}),p.click('.xMenu button:has-text("PowerPoint")')]);
ok('pptx '+px.suggestedFilename(),px.suggestedFilename().endsWith('.pptx'));await px.saveAs(__dirname+'/out/test.pptx');
// category bar: Category RM narrows Sub-category to SARD and EARD, Sub-group to the missions
await p.goto('file://'+__dirname+'/out/index.html?d=di');await p.waitForTimeout(700);
await p.click('.cgPick >> nth=0');await p.waitForTimeout(300);await p.click('.cgOpts .ms-Checkbox:has-text("RM")');await p.keyboard.press('Escape');await p.waitForTimeout(300);
await p.click('.cgPick >> nth=2');await p.waitForTimeout(300);
ok('sub-group lists the RM missions',(await p.$$eval('.cgOpts .ms-Checkbox',x=>x.map(e=>e.textContent))).filter(t=>/INRM|SLRM|PRCM/.test(t)).length===3);await p.keyboard.press('Escape');
ok('sites card follows RM',(await p.textContent('.kpi .val >> nth=0')).trim()!=='1,032');
// band: description under title, Monday stamp
const bb=await p.$eval('.band',e=>{const h=e.querySelector('h2').getBoundingClientRect(),d=e.querySelector('.bd').getBoundingClientRect();return d.top>=h.bottom-1;});ok('band text under title',bb);
ok('data as of Monday',/Data as of\s*Monday \d\d [A-Z][a-z]{2} \d{4}/.test(await p.textContent('.asof')));
// sidebar
await p.click('.menuBtn');ok('sidebar closes',await p.$eval('.side',e=>e.classList.contains('closed')));
console.log(errs.join('\n')||'no errors');await b.close();})();
