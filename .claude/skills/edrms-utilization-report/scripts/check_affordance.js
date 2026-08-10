/* Every KPI card must look like what it is.
   A card carrying the .tap chevron promises a click; a card without one
   promises nothing. This fails when the two disagree, which is the bug a
   reader hits as "I clicked it and nothing happened". */
let chromium;
for (const base of [process.cwd(),'/tmp',process.env.HOME||'']) {
  try { ({chromium}=require(require.resolve('playwright-core',{paths:[base]}))); break; } catch(e){}
}
if(!chromium){console.error('playwright-core not found. Run:  cd /tmp && npm i playwright-core');process.exit(2);}
const BROWSER='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

(async()=>{
const b=await chromium.launch({executablePath:BROWSER});
const p=await b.newPage(); const errs=[];
p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
p.on('pageerror',e=>errs.push('pageerror: '+e.message));
await p.goto('file:///home/user/Jim/index.html'); await p.waitForTimeout(300);

const keys=await p.evaluate(()=>[...document.querySelectorAll('nav a[data-d]')].map(a=>a.dataset.d));
const fail=[]; let wired=0, staticCards=0;

for(const k of keys){
  await p.click(`nav a[data-d="${k}"]`); await p.waitForTimeout(350);
  const cards=await p.evaluate(()=>[...document.querySelectorAll('.kpi')].map(el=>({
    label:(el.querySelector('.lab')||{}).textContent||'(no label)',
    tap:!!el.querySelector('.tap'),
    stat:el.classList.contains('stat'),
    on:el.classList.contains('on'),
    /* onclick is how every wired card in this file is bound, so its presence
       is the honest test of whether a click does anything. */
    wired:typeof el.onclick==='function',
    cursor:getComputedStyle(el).cursor,
  })));
  for(const c of cards){
    const where=`${k} / ${c.label.trim()}`;
    if(c.tap && !c.wired)  fail.push(`${where}: shows the click chevron but nothing is wired to it`);
    if(c.wired && !c.tap)  fail.push(`${where}: is clickable but gives the reader no sign of it`);
    if(c.wired && c.stat)  fail.push(`${where}: marked .stat yet wired to a handler`);
    if(!c.wired && c.on)   fail.push(`${where}: carries the selected-state rail but cannot be selected`);
    if(!c.wired && c.cursor==='pointer') fail.push(`${where}: shows a pointer cursor but does nothing`);
    c.wired ? wired++ : staticCards++;
  }
}
console.log(`checked ${wired+staticCards} KPI cards across ${keys.length} dashboards`);
console.log(`  ${wired} interactive, ${staticCards} static`);
console.log('console errors:', errs.length?errs:'none');
console.log(fail.length?'\nFAIL:\n  '+fail.join('\n  '):'\nevery card looks like what it is');
await b.close(); process.exit(fail.length||errs.length?1:0);
})();
