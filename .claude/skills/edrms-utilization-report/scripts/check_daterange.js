/* The usage panels take a real date range, not fixed windows, because the
   refresh keeps every week's rows. This checks the range actually filters,
   that it cannot reach back before the first snapshot, and that Reset works. */
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

const start=await p.evaluate(()=>({
  min:document.getElementById('sites-s').min,
  max:document.getElementById('sites-e').max,
  s:document.getElementById('sites-s').value,
  e:document.getElementById('sites-e').value,
  total:document.querySelector('#sites-stats .sv')?.textContent||'',
  buttons:document.querySelectorAll('#sites-win button').length,
}));
// narrow the range and the total must fall
await p.fill('#sites-s','2026-06-01'); await p.dispatchEvent('#sites-s','change'); await p.waitForTimeout(400);
const narrow=await p.evaluate(()=>document.querySelector('#sites-stats .sv')?.textContent||'');
await p.click('#sites-reset'); await p.waitForTimeout(400);
const reset=await p.evaluate(()=>document.getElementById('sites-s').value);

const num=t=>Number(String(t).replace(/[^\d]/g,''))||0;
const fail=[];
if(start.buttons) fail.push('fixed window buttons survive');
if(start.min!=='2026-01-05') fail.push('range does not stop at the first snapshot: min='+start.min);
if(!(num(narrow)<num(start.total))) fail.push(`narrowing the range did not reduce the total: ${start.total} -> ${narrow}`);
if(reset!=='2026-01-05') fail.push('Reset did not restore the full range, got '+reset);
console.log('range limits :', start.min, 'to', start.max);
console.log('full range   :', start.s, 'to', start.e, '| total visits', start.total);
console.log('from 1 Jun   :', narrow, '(must be lower)');
console.log('after reset  :', reset);
console.log('console errors:', errs.length?errs:'none');
console.log(fail.length?'\nFAIL:\n  '+fail.join('\n  '):'\nall assertions passed');
await b.close(); process.exit(fail.length||errs.length?1:0);
})();
