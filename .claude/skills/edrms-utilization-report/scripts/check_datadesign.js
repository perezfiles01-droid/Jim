const {chromium}=require('playwright-core');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const p=await b.newPage(); const errs=[];
p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
p.on('pageerror',e=>errs.push('pageerror: '+e.message));
await p.goto('file:///home/user/Jim/index.html'); await p.waitForTimeout(300);
await p.click('nav a[data-d="dd"]'); await p.waitForTimeout(600);
const r=await p.evaluate(()=>{
  const txt=document.querySelector('section.dash-dd').innerText;
  return {
    cards:[...document.querySelectorAll('#dd-tables h4, #dd-tables .tname')].map(e=>e.textContent.trim()),
    tableBlocks:document.querySelectorAll('#dd-tables > *').length,
    useBlocks:document.querySelectorAll('#dd-uses > *').length,
    tally:(document.getElementById('dd-tally')||{}).textContent||'',
    rawBold:(txt.match(/\*\*/g)||[]).length,
    rawTick:(txt.match(/`/g)||[]).length,
    hasDivision:/division/i.test(txt),
    hasUserTable:/User Activity Table/.test(txt),
    threeTables:/three tables/i.test(txt),
    figRows:document.querySelectorAll('#dd-fig tr, #dd-fig > *').length,
  };
});
const fail=[];
if(r.rawBold) fail.push(`${r.rawBold} unconverted ** in rendered text`);
if(r.rawTick) fail.push(`${r.rawTick} unconverted backticks in rendered text`);
if(r.hasDivision) fail.push('Division still appears on the Data Design page');
if(!r.hasUserTable) fail.push('User Activity Table missing');
if(!r.threeTables) fail.push('page still says two tables');
console.log('table cards   :', r.cards.join(' | ')||'(n/a)');
console.log('table blocks  :', r.tableBlocks, '| use blocks:', r.useBlocks);
console.log('tally         :', r.tally.replace(/\s+/g,' ').trim().slice(0,160));
console.log('raw markdown  :', r.rawBold, 'bold,', r.rawTick, 'backticks');
console.log('console errors:', errs.length?errs:'none');
console.log(fail.length?'\nFAIL:\n  '+fail.join('\n  '):'\nall assertions passed');
await b.close(); process.exit(fail.length||errs.length?1:0);
})();
