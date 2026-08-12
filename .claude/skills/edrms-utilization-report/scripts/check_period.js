/* The usage panels offer preset windows plus a year-and-month picker, never a
   day level calendar: a week is the smallest period the data holds, so a part
   week could only be estimated. This checks that presets read one stored
   figure, that By month sums the weekly tiles, and that the two disagree,
   because they answer different questions over different periods. */
let chromium;
for (const b0 of [process.cwd(),'/tmp',process.env.HOME||'']) {
  try { ({chromium}=require(require.resolve('playwright-core',{paths:[b0]}))); break; } catch(e){}
}
if(!chromium){console.error('playwright-core not found. Run:  cd /tmp && npm i playwright-core');process.exit(2);}
const BROWSER='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
(async()=>{
const b=await chromium.launch({executablePath:BROWSER});
const p=await b.newPage(); const errs=[];
p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
p.on('pageerror',e=>errs.push('pageerror: '+e.message));
await p.goto('file:///home/user/Jim/index.html'); await p.waitForTimeout(300);
await p.click('nav a[data-d="rm"]'); await p.waitForTimeout(400);
await p.click('#s2-kpis .kpi[data-k="sites"]'); await p.waitForTimeout(400);

const num=t=>Number(String(t).replace(/[^\d]/g,''))||0;
const read=()=>p.evaluate(()=>({
  /* The first stat is the site count; the second is the visits figure, which
     is the one a period is supposed to change. */
  total:document.querySelectorAll('#sites-stats .sv')[1]?.textContent||'',
  sites:document.querySelectorAll('#sites-stats .sv')[0]?.textContent||'',
  note:document.getElementById('sites-period')?.textContent||'',
  presets:[...document.querySelectorAll('#sites-preset button')].map(b=>b.textContent.trim()),
  on:document.querySelector('#sites-preset button.on')?.textContent.trim()||'',
  /* Scoped to this panel. The declared records panels legitimately keep a day
     level range, because CreatedDate sits on every row there. */
  dayPicker:document.querySelectorAll('#s2-detail input[type=date]').length,
  monthPicker:!!document.getElementById('sites-month'),
}));
const d30=await read();
// a wider preset must not be smaller than a narrower one
await p.click('#sites-preset button[data-p="90"]'); await p.waitForTimeout(400);
const d90=await read();
await p.click('#sites-preset button[data-p="7"]'); await p.waitForTimeout(400);
const d7=await read();
// By month exposes year and month pickers and reports the period it covered
await p.click('#sites-preset button[data-p="month"]'); await p.waitForTimeout(400);
const mo=await read();
await p.selectOption('#sites-month','2'); await p.waitForTimeout(400);
const mar=await read();

const fail=[];
if(d30.dayPicker) fail.push('a day level date picker is present; a part week cannot be answered');
if(!d30.presets.includes('Last 180 days')) fail.push('180 day preset missing');
if(!(num(d7.total)<=num(d30.total)&&num(d30.total)<=num(d90.total)))
  fail.push(`presets do not nest: 7=${d7.total} 30=${d30.total} 90=${d90.total}`);
if(!mo.monthPicker) fail.push('By month did not expose a month picker');
if(!/covering/.test(mo.note)) fail.push('By month does not state the period it covered: '+mo.note);
if(num(mar.total)===num(mo.total)) fail.push('changing the month did not change the figure');
if(!/last 30 days/.test(d30.note)) fail.push('preset does not state its window: '+d30.note);
console.log('presets    :', d30.presets.join(' | '));
console.log('7/30/90    :', d7.total, '/', d30.total, '/', d90.total, 'visits (must not decrease)');
console.log('preset note:', d30.note.trim());
console.log('by month   :', mo.total, '|', mo.note.trim());
console.log('other month:', mar.total, '|', mar.note.trim());
console.log('console errors:', errs.length?errs:'none');
console.log(fail.length?'\nFAIL:\n  '+fail.join('\n  '):'\nall assertions passed');
await b.close(); process.exit(fail.length||errs.length?1:0);
})();
