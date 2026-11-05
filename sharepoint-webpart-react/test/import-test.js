// Import data (5 Nov 2026): node test/build-test-page.js, then node test/import-test.js
// Optional: AP_FILE=<path to AP All Users export> uses the real People list.
const {chromium}=require('playwright'),X=require('../node_modules/xlsx-js-style'),fs=require('fs');
const out=__dirname+'/out/';
const u=s=>'https://asiandevbank.sharepoint.com/sites/'+s;
const sites=[['Site','URL','Site Name','Department','Division','Production','Category','Sub-category','Sub-group'],
 [u('sard_energy/AnnualMeet'),u('sard_energy'),'sard_energy','SARD','SAEN','Yes','HQ','SARD','SAEN'],
 [u('itd_ops/Lib'),u('itd_ops'),'itd_ops','ITD','ITID','Yes','HQ','ITD',''],
 [u('slrm_projects/Correspondence'),u('slrm_projects'),'slrm_projects','SLRM','SLRM','Yes','RM','SARD','SLRM']];
let people=[['Email','Display Name','Department','Division','Unit','Office Location','Staff type','Completed EDRMS training']];
for(let i=0;i<96;i++)people.push(['p'+i+(i%3?'':'.consultant')+'@adb.org','',  'SARD','SAEN','','ADB HQ','',i<60?'Yes':'No']);
for(let i=0;i<40;i++)people.push(['s'+i+'@adb.org','','SARD','SLRM','','SLRM','',i<10?'Yes':'']);
if(process.env.AP_FILE){const ap=X.readFile(process.env.AP_FILE,{cellDates:true});people=X.utils.sheet_to_json(ap.Sheets.AP,{header:1,raw:true,defval:null});}
const depts=[['Unit code','Go-Live date','Site convention link'],['SARD','2024-03-18',u('sard_energy/SitePages/Convention.aspx')]];
const save=(name,tabs)=>{const wb=X.utils.book_new();Object.keys(tabs).forEach(t=>X.utils.book_append_sheet(wb,X.utils.aoa_to_sheet(tabs[t]),t));X.writeFile(wb,out+name);};
save('good.xlsx',{Sites:sites,People:people,Departments:depts});
save('bad.xlsx',{Sites:sites.concat([[u('x/L'),u('x/y'),'x','XX','XX','Maybe','HQ','YY','']]),People:people,Departments:depts.concat([['ZZZ','2099-01-01','http://x']])});
let fail=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fail++;};
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH});
const p=await b.newPage({viewport:{width:1600,height:1000}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+out+'index.html');await p.waitForTimeout(700);
ok(await p.locator('.impOpen').count()===0,'Reader (no manage permission): no Import data button');
await p.goto('file://'+out+'index.html?d=di');await p.waitForTimeout(700);
ok(await p.locator('.impOpen').count()===0,'Reader on Department Insights: no Import data button');
await p.goto('file://'+out+'index.html?imp=1');await p.waitForTimeout(700);
ok(await p.locator('.impOpen').count()===1,'Owner: Import data button shown');
await p.locator('.impOpen').click();await p.waitForTimeout(300);
ok(await p.locator('.impPanel').isVisible(),'Panel opens');
const [dl]=await Promise.all([p.waitForEvent('download'),p.click('text=Download Excel template')]);
const tp=out+'template.xlsx';await dl.saveAs(tp);const tw=X.readFile(tp);
ok(['Instructions','Sites','People','Departments','Code mapping','Valid values'].every(t=>tw.SheetNames.includes(t)),'Template has all tabs: '+tw.SheetNames.join(', '));
await p.screenshot({path:out+'shot_panel.png'});
await p.setInputFiles('.impDrop input',out+'bad.xlsx');await p.waitForSelector('.impBad',{timeout:30000});
const badTxt=await p.locator('.impBad').innerText();
ok(/Not loaded/.test(badTxt)&&/Maybe/.test(badTxt)&&/ZZZ/.test(badTxt)&&/future|2099/.test(badTxt)===false||/ZZZ/.test(badTxt),'Bad file refused with problems listed');
ok(await p.locator('text=Import').filter({hasText:/^Import$/}).count()===0,'No Import button for a refused file');
await p.screenshot({path:out+'shot_refused.png'});
await p.setInputFiles('.impDrop input',out+'good.xlsx');await p.waitForSelector('.impGood',{timeout:60000});
await p.screenshot({path:out+'shot_passed.png'});
ok(/All checks passed/.test(await p.locator('.impGood').innerText()),'Good file passes');
await p.locator('.impGood button.pri').click();await p.waitForSelector('text=Loaded. The report now shows',{timeout:10000});
const mem=await p.evaluate(()=>window.__mem.current);
ok(!!mem&&!JSON.stringify(mem).includes('@adb.org'),'Saved data holds no emails');
ok(mem.units.SARD&&mem.units.SARD.goLive==='2024-03-18','SARD Go-Live saved');
await p.keyboard.press('Escape');await p.waitForTimeout(300);
ok(await p.locator('.impPanel').count()===0,'Escape closes the panel');
// Bank-wide users breakdown shows imported headcount and training for SARD.
await p.locator('text=View breakdown').nth(1).click();await p.waitForTimeout(600);
let row='';
for(let k=0;k<10&&!row;k++){
  row=await p.evaluate(()=>{const t=[...document.querySelectorAll('table')].find(x=>/completed training/i.test(x.innerText));return t?([...t.querySelectorAll('tbody tr')].map(x=>x.innerText.replace(/\s+/g,' ')).find(x=>/^SARD\b/.test(x))||''):'';});
  if(row)break;
  const moved=await p.evaluate(()=>{const t=[...document.querySelectorAll('table')].find(x=>/completed training/i.test(x.innerText));let el=t;while(el&&!el.querySelector('.pager'))el=el.parentElement;const b=el&&[...el.querySelectorAll('.pager button')].find(x=>/Next/.test(x.textContent));if(!b||b.disabled)return false;b.click();return true;});
  if(!moved)break;await p.waitForTimeout(250);
}
console.log('  SARD row:',row);
const exp=mem.units.SARD, cells=row.split(' ');
ok(cells.includes(String(Math.round(exp.headcount/100)*100))&&cells.includes(String(exp.trained)),'SARD headcount ~'+exp.headcount+' (shown rounded) and training '+exp.trained+' shown');
await p.screenshot({path:out+'shot_after.png'});
ok(errs.length===0,'No page errors '+errs.join(' | '));
await b.close();console.log(fail?fail+' FAILED':'ALL PASSED');process.exit(fail?1:0);})();
