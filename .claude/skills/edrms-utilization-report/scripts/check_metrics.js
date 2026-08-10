/* Assertions for the eight metrics added from the client's sections 5 and 8.
   verify.js is the structural floor; these check the numbers reconcile. */
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
const r=await p.evaluate(()=>{
  const rm=DASHBOARDS.rm.summary, rt=DASHBOARDS.rt.summary, sl=DASHBOARDS.sl.summary;
  return {declared:rm.declared, thisMonth:rm.declaredThisMonth, years:rm.declaredByYear,
          due30:rt.due30, due90:rt.due90, due12:rt.dueNext12,
          withSched:rt.withSchedule, noSched:rt.noSchedule, beyond:rt.beyondRetention,
          labelTotal:rt.labelTotal,
          libs:sl.librariesAcrossSites, libsWith:sl.librariesWithRecords, libsNone:sl.librariesNoRecords};
});
await p.click('nav a[data-d="rm"]'); await p.waitForTimeout(400);
const rmSeen=await p.evaluate(()=>({months:document.querySelectorAll('#s3-detail .mcol').length,
                                    years:document.querySelectorAll('#s3-detail .ybar').length,
                                    kpi:document.getElementById('kpi-month').textContent}));
await p.click('nav a[data-d="rt"]'); await p.waitForTimeout(400);
const rtSeen=await p.evaluate(()=>({bars:document.querySelectorAll('#rt-compliance .lbar').length}));
const fail=[];
const eq=(a,bb,m)=>{if(a!==bb)fail.push(`${m}: ${a} vs ${bb}`)};
if(!(r.due30<=r.due90 && r.due90<=r.due12)) fail.push(`disposal windows do not nest: ${r.due30}/${r.due90}/${r.due12}`);
eq(r.withSched+r.noSched, r.labelTotal, 'with plus without schedule vs declared total');
if(r.beyond>r.withSched) fail.push('records beyond retention exceed those holding a schedule');
eq(r.libsWith+r.libsNone, r.libs, 'libraries with plus without records vs total libraries');
eq(rmSeen.months, 12, 'monthly bars');
eq(rmSeen.years, r.years.length, 'year bars');
eq(r.years[r.years.length-1].value, r.declared, 'current year vs Total Declared Records');
eq(rtSeen.bars, 3, 'retention compliance bars');
console.log('declared        :', r.declared, '| this month:', r.thisMonth, '| years:', r.years.map(y=>y.label+' '+y.value).join(', '));
console.log('disposal windows:', r.due30, '(30d) <=', r.due90, '(90d) <=', r.due12, '(12m)');
console.log('schedules       :', r.withSched, 'with +', r.noSched, 'without =', r.labelTotal, '| beyond retention:', r.beyond);
console.log('libraries       :', r.libsWith, 'with records +', r.libsNone, 'without =', r.libs);
console.log('console errors  :', errs.length?errs:'none');
console.log(fail.length?'\nFAIL:\n  '+fail.join('\n  '):'\nall assertions passed');
await b.close(); process.exit(fail.length||errs.length?1:0);
})();
