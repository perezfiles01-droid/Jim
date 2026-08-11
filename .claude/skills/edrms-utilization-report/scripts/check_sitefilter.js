/* The site inventory filters by department rather than carrying it as a column.
   This checks the filter actually filters, that the tiles follow it, and that
   Reset restores the full list, which is the part that quietly rots. */
let chromium;
for (const b0 of [process.cwd(),'/tmp',process.env.HOME||'']) {
  try { ({chromium}=require(require.resolve('playwright-core',{paths:[b0]}))); break; } catch(e){}
}
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const p=await b.newPage(); const errs=[];
p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
p.on('pageerror',e=>errs.push('pageerror: '+e.message));
await p.goto('file:///home/user/Jim/index.html'); await p.waitForTimeout(300);
await p.click('nav a[data-d="sl"]'); await p.waitForTimeout(500);
const all=await p.evaluate(()=>({
  heads:[...document.querySelectorAll('#st-table .hd')].map(e=>e.textContent.replace(/[↑↓]/g,'').trim()),
  rows:document.querySelectorAll('#st-table .nm').length,
  tiles:[...document.querySelectorAll('#st-tiles .tv')].map(e=>e.textContent),
  opts:document.querySelectorAll('#st-dept option').length,
}));
await p.selectOption('#st-dept','OGC'); await p.waitForTimeout(400);
const ogc=await p.evaluate(()=>({
  rows:[...document.querySelectorAll('#st-table .nm')].map(e=>e.textContent),
  tiles:[...document.querySelectorAll('#st-tiles .tv')].map(e=>e.textContent),
  label:document.querySelector('#st-tiles .tl').textContent,
}));
await p.click('#st-deptreset'); await p.waitForTimeout(400);
const reset=await p.evaluate(()=>document.querySelectorAll('#st-table .nm').length);
const fail=[];
if(all.heads.includes('Dept')) fail.push('Dept column survives');
if(all.heads[0]!=='Site') fail.push('first column is not Site: '+all.heads[0]);
if(all.rows!==15) fail.push('unfiltered rows '+all.rows);
if(ogc.rows.length!==3) fail.push('OGC should have 3 sites, got '+ogc.rows.length);
if(!ogc.rows.every(r=>r.startsWith('OGC'))) fail.push('filter leaked non-OGC rows: '+ogc.rows.join(', '));
if(ogc.label!=='OGC sites') fail.push('tile label did not follow the filter: '+ogc.label);
if(reset!==15) fail.push('reset did not restore all rows, got '+reset);
console.log('columns   :', all.heads.join(' | '));
console.log('dropdown  :', all.opts, 'options');
console.log('unfiltered:', all.rows, 'rows, tiles', all.tiles.join(' / '));
console.log('OGC       :', ogc.rows.join(', '), '| tiles', ogc.tiles.join(' / '));
console.log('after reset:', reset, 'rows');
console.log('console errors:', errs.length?errs:'none');
console.log(fail.length?'\nFAIL:\n  '+fail.join('\n  '):'\nall assertions passed');
await b.close(); process.exit(fail.length||errs.length?1:0);
})();
