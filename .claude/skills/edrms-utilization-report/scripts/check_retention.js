/* Assertions specific to this change. verify.js is the structural floor; these
   are the numbers a reader would notice were wrong. */
/* playwright-core is installed ad hoc, and this script lives in the repo rather
   than beside node_modules, so resolve it the same way verify.js does. */
let chromium;
for (const base of [process.cwd(), '/tmp', process.env.HOME || '']) {
  try { ({chromium} = require(require.resolve('playwright-core', {paths:[base]}))); break; }
  catch (e) { /* keep looking */ }
}
if (!chromium) {
  console.error('playwright-core not found. Run:  cd /tmp && npm i playwright-core');
  process.exit(2);
}
/* The image ships Chromium already; never download one. */
const BROWSER = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

(async () => {
  const b = await chromium.launch({executablePath: BROWSER});
  const p = await b.newPage();
  const errs = [];
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await p.goto('file:///home/user/Jim/index.html');
  await p.waitForTimeout(400);

  const r = await p.evaluate(() => {
    const rt = DASHBOARDS.rt.summary, rm = DASHBOARDS.rm.summary, sl = DASHBOARDS.sl.summary;
    return {
      labelTotal: rt.labelTotal,
      declared: rm.declared,
      due: rt.dueNext12,
      permanent: rt.permanent,
      nextDue: rt.nextDue,
      mau: rm.monthlyActiveUsers,
      siteSum: rm.activeUsers7,
      sitesListed: sl.sitesListed,
      active: sl.activeSites,
      inactive: sl.inactiveSites,
      libs: sl.librariesAcrossSites,
      owners: sl.distinctOwners,
      navLive: [...document.querySelectorAll('nav a[data-d]')].map(a => a.dataset.d),
      navDis: document.querySelectorAll('nav a.dis').length,
    };
  });

  // Render the Retention dashboard and read what a reader would actually see.
  await p.click('nav a[data-d="rt"]');
  await p.waitForTimeout(400);
  const seen = await p.evaluate(() => ({
    kpiDue: document.getElementById('kpi-due').textContent,
    kpiNext: document.getElementById('kpi-next').textContent,
    rows: document.querySelectorAll('#rt-table .nm').length,
    labelRows: document.querySelectorAll('#rt-labels .lbar').length,
    scope: !!document.querySelector('section.dash-rt'),
  }));

  const fail = [];
  const eq = (a, bb, m) => { if (a !== bb) fail.push(`${m}: ${a} vs ${bb}`); };

  eq(r.labelTotal, r.declared, 'retention labels vs declared records');
  eq(r.labelTotal, 21646, 'declared record total');
  if (!(r.due < r.labelTotal - r.permanent)) fail.push('records due must exclude the permanent population');
  if (!(r.mau < r.siteSum * 3)) fail.push('monthly active users looks implausible against per site sums');
  eq(r.active + r.inactive, r.sitesListed, 'active plus inactive vs sites listed');
  eq(seen.rows, 15, 'disposal table rows');
  eq(seen.labelRows, 5, 'retention label bars');
  if (!seen.scope) fail.push('retention section missing its .dash-rt scope class');
  eq(r.navDis, 1, 'placeholder nav entries remaining');
  if (!r.navLive.includes('rt')) fail.push('Retention not wired into the nav');

  console.log('nav live        :', r.navLive.join(', '), `(${r.navDis} placeholder left)`);
  console.log('declared records:', r.declared, '| retention labels total:', r.labelTotal);
  console.log('due next 12m    :', seen.kpiDue, '| next due date:', seen.kpiNext);
  console.log('permanent       :', r.permanent, 'never due');
  console.log('sites           :', r.sitesListed, '=', r.active, 'active +', r.inactive, "inactive");
  console.log('libraries       :', r.libs, '| distinct owners:', r.owners);
  console.log('monthly users   :', r.mau, 'distinct, vs', r.siteSum, 'summed over sites at 7 days');
  console.log('console errors  :', errs.length ? errs : 'none');
  console.log(fail.length ? '\nFAIL:\n  ' + fail.join('\n  ') : '\nall assertions passed');

  await b.close();
  process.exit(fail.length || errs.length ? 1 : 0);
})();
