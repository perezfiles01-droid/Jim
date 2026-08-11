let chromium;
for (const base of [process.cwd(),'/tmp',process.env.HOME||'']) {
  try { ({chromium}=require(require.resolve('playwright-core',{paths:[base]}))); break; } catch(e){}
}
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const p=await b.newPage(); const errs=[];
p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
p.on('pageerror',e=>errs.push('pageerror: '+e.message));
await p.goto('file:///home/user/Jim/index.html'); await p.waitForTimeout(300);
const r=await p.evaluate(()=>{
  const fp=DASHBOARDS.rt.summary, sl=DASHBOARDS.sl.summary;
  return {terms:fp.totalTerms,sets:fp.totalSets,cats:fp.categoryCount,
          sum:fp.categories.reduce((a,c)=>a+c.terms,0),depth:fp.maxDepth,
          navLive:[...document.querySelectorAll('nav a[data-d]')].map(a=>a.dataset.d),
          dis:document.querySelectorAll('nav a.dis').length};
});
await p.click('nav a[data-d="rt"]'); await p.waitForTimeout(400);
const seen=await p.evaluate(()=>({
  bars:document.querySelectorAll('#rt-plan .fbar').length,
  scope:!!document.querySelector('section.dash-rt'),
  /* The file plan must sit alongside the retention figures, not replace them */
  labels:document.querySelectorAll('#rt-labels .lbar').length}));
await p.click('nav a[data-d="sl"]'); await p.waitForTimeout(400);
const sl=await p.evaluate(()=>({
  libRows:document.querySelectorAll('#lib-table .nm').length,
  growth:document.getElementById('kpi-growth').textContent,
  libact:document.getElementById('kpi-libact').textContent,
  pills:[...document.querySelectorAll('#lib-table .pill')].map(e=>e.textContent),
  siteRows:document.querySelectorAll('#st-table .nm').length}));
const fail=[];
if(r.sum!==r.terms) fail.push(`category terms sum ${r.sum} vs total ${r.terms}`);
if(seen.bars!==r.cats) fail.push(`rendered ${seen.bars} category bars for ${r.cats} categories`);
if(!seen.scope) fail.push('retention section missing its .dash-rt scope class');
if(!seen.labels) fail.push('the retention label profile was lost when the file plan moved in');
if(sl.libRows!==15) fail.push(`library table rows ${sl.libRows}`);
if(r.navLive.includes('fp')) fail.push('a standalone File Plan nav entry survives; it should live inside Retention');
const states=new Set(sl.pills);
if(!(states.has('Active')&&states.has('Inactive')&&states.has('Long dormant')))
  fail.push('library table does not show all three states: '+[...states].join(', '));
if(sl.pills.some(x=>/orphan/i.test(x))) fail.push('Orphaned wording survives in the library table');
console.log('nav live      :', r.navLive.join(', '), `(${r.dis} placeholders left)`);
console.log('file plan     :', r.terms, 'terms over', r.cats, 'categories,', r.sets, 'sets, deepest', r.depth, 'levels');
console.log('library health:', sl.libact, 'active |', sl.libRows, 'rows | growth', sl.growth);
console.log('states seen   :', [...states].join(', '));
console.log('console errors:', errs.length?errs:'none');
console.log(fail.length?'\nFAIL:\n  '+fail.join('\n  '):'\nall assertions passed');
await b.close(); process.exit(fail.length||errs.length?1:0);
})();
