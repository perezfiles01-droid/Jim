/**
 * The RAC decisions of 21 September 2026, asserted, for both dashboards that
 * carry a decision column in Checker 7: Bank-wide Oversight and Department
 * Insights. The other four dashboards carry no decision, so nothing here
 * speaks for them.
 *
 * Static checks over index.html that fail if a later edit puts back something
 * RAC struck out, or drifts a figure away from the evidence it was read from.
 * Runs with no browser and no dependencies:
 *
 *   node check-bankwide-rac.js index.html
 *
 * It is deliberately separate from check-dashboard.js, which runs the page in
 * a browser and catches runtime faults. This one catches decisions being
 * quietly reversed, which a browser cannot see because the page still works.
 */
const fs = require('fs');
const { execFileSync } = require('child_process');
const path = require('path');

const file = process.argv[2] || path.join(__dirname, 'index.html');
const src = fs.readFileSync(file, 'utf8');
const fails = [];
const checks = [];

function check(name, ok, detail) {
  checks.push(name);
  if (!ok) fails.push(name + (detail ? '  -> ' + detail : ''));
}

/* ---- Phase 1. Base figures match the evidence, not a placeholder ---- */
let derived = null;
try {
  derived = JSON.parse(execFileSync('python3',
    [path.join(__dirname, 'derive_bankwide.py')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
} catch (e) { /* the exports may not be present in every checkout */ }

if (derived) {
  const read = k => {
    const m = src.match(new RegExp('const\\s+' + k + '\\s*=\\s*([0-9.]+)\\s*;'));
    return m ? Number(m[1]) : null;
  };
  check('SITES_CREATED equals the EDRMS site count derived from the Cloud Governance export',
    read('SITES_CREATED') === derived.SITES_CREATED,
    'file has ' + read('SITES_CREATED') + ', evidence gives ' + derived.SITES_CREATED);
  check('SITES_MULTI_DEPARTMENT equals the multi-department count in the evidence',
    read('SITES_MULTI_DEPARTMENT') === derived.SITES_MULTI_DEPARTMENT,
    'file has ' + read('SITES_MULTI_DEPARTMENT') + ', evidence gives ' + derived.SITES_MULTI_DEPARTMENT);
  check('SITES_WITH_DEPARTMENT equals the count of EDRMS sites carrying a Department',
    read('SITES_WITH_DEPARTMENT') === derived.SITES_WITH_DEPARTMENT,
    'file has ' + read('SITES_WITH_DEPARTMENT') + ', evidence gives ' + derived.SITES_WITH_DEPARTMENT);
  check('The two exports are still recorded as unjoinable, so no per-department document figure is claimed',
    derived.SOURCES_JOINABLE === false ||
      /Site URL populates/.test(src) === false, 'a joinable export has arrived: re-derive the per-department figures');
} else {
  console.log('  (evidence CSVs not readable here, skipping the derived-figure checks)');
}

/* ---- Phase 2. The top panel carries only the tiles RAC kept ---- */
/* The Bank-wide module only. Other dashboards legitimately keep measures that
   came off THIS top panel, so the search is scoped to it rather than the file. */
const bwStart = src.indexOf('DASHBOARDS.bw=(function(){');
const bwEnd = src.indexOf('DASHBOARDS.dp=(function(){');
const bw = bwStart >= 0 && bwEnd > bwStart ? src.slice(bwStart, bwEnd) : src;
/* Searching what EXECUTES, not what is written about. This file's own
   comments quote the wording of things that were removed, so a plain search
   finds the removal notice and reports the fault it is recording. `bwCode` is
   the Bank-wide module with block and line comments taken out. It is tested
   against the real module below before anything leans on it, because a
   stripper that eats too much makes every check pass and reads exactly like
   protection. */
const bwCode = bw
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .split('\n').map(l => l.replace(/(^|[^:])\/\/.*$/, '$1')).join('\n');
check('The comment stripper leaves the code it is meant to search',
  bwCode.includes('const TILES=[') && bwCode.includes('function drawUsersDrill()') &&
  bwCode.includes('DASHBOARDS.bw'),
  'the stripper removed live code, so every check built on it is blind');
check('The comment stripper actually removes comments',
  !bwCode.includes('RAC decisions of 21 September 2026'));

const tilesBlock = (bw.match(/const TILES=\[[\s\S]*?\n  \];/) || [''])[0];
const navBlock = (bw.match(/const NAVTILES=\[[\s\S]*?\n  \];/) || [''])[0];

/* The Department Insights module, sliced and comment-stripped the same way and
   for the same reason: this repo's comments quote the wording of what was
   removed. */
const dpStart = src.indexOf('DASHBOARDS.dp=(function(){');
const dpEnd = (() => {
  const m = /\nDASHBOARDS\.(?!dp)\w+=\(function\(\)\{/.exec(src.slice(dpStart + 10));
  return m ? dpStart + 10 + m.index : src.length;
})();
const dp = dpStart >= 0 ? src.slice(dpStart, dpEnd) : '';
const dpCode = dp
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .split('\n').map(l => l.replace(/(^|[^:])\/\/.*$/, '$1')).join('\n');
check('The Department Insights module is found and its comment stripper leaves live code',
  dpCode.includes('const TILES=[') && dpCode.includes('function drawDrill()'),
  'dp module not sliced correctly, so every dp check below is blind');

const KEPT_TILES = ['sites', 'users', 'docs', 'rec'];
const REMOVED_TILES = [
  ['sov', 'item 9, Sovereign project sites, Deferred'],
  ['nonsov', 'item 10, Nonsovereign project sites, Deferred'],
  ['phys', 'item 5, Physical counterparts, Deferred'],
  ['disp', 'item 6, Records due for disposal, Deferred'],
];
check('The top panel carries exactly the four tiles RAC kept',
  (tilesBlock.match(/\{k:"/g) || []).length === KEPT_TILES.length,
  'found ' + (tilesBlock.match(/\{k:"/g) || []).length + ' tiles');
KEPT_TILES.forEach(k => check('Top panel still carries the ' + k + ' tile',
  tilesBlock.includes('{k:"' + k + '"')));
REMOVED_TILES.forEach(([k, why]) => check('Top panel does not carry the ' + k + ' tile (' + why + ')',
  !tilesBlock.includes('{k:"' + k + '"')));
check('The Retention and disposal navigation tile is off the top panel (item 7, Deferred)',
  !navBlock.includes('to:"rd"'));
check('The Institutional File Plan navigation tile is kept (item 8, Agreed)',
  navBlock.includes('to:"fp"'));
check('Tile 1 uses the wording RAC agreed: Department, Office, RM and RO',
  /Number of active EDRMS SharePoint sites for Department, Office, RM and RO/.test(tilesBlock));

/* ---- Phase 3. The user definition RAC gave, items 2, 23 and 24 ---- */
check('The indicative per-unit headcount is present in the users drill (items 2 and 23)',
  /Total number of EDRMS users \(indicative, per unit\)/.test(bw));
check('The indicative headcount prints Not captured, never a plausible number',
  /Total number of EDRMS users \(indicative, per unit\)",NOSRC\]/.test(bw.replace(/\s+/g, ' ')) ||
  /indicative, per unit\)"\s*,\s*NOSRC/.test(bw));
check('The measured user tile still names its window rather than claiming the population',
  /EDRMS users with recorded activity, last "\+DATA\.ACTIVITY_WINDOW\+" days/.test(bw));
check('Units with no EDRMS site are stated as listed, not omitted (item 24)',
  /Units with no EDRMS site are listed with zeros rather than omitted/.test(bw));

/* ---- Phase 4. The drills and indicators RAC struck out ---- */
const REMOVED_DRILLS = [
  ['sov', 'items 20 and 22, the Sovereign project list and its drill-through, Deferred'],
  ['nonsov', 'item 21, the Nonsovereign project list, Deferred'],
  ['disp', 'items 49 to 59, the records due for disposal table, Deferred'],
];
REMOVED_DRILLS.forEach(([k, why]) => check('The ' + k + ' drill is gone (' + why + ')',
  !new RegExp('^\\s{4}' + k + ':\\{', 'm').test(bw)));
check('No dead route is left pointing at a removed drill',
  !/drawDispDrill|drawProjectsDrill/.test(bw));
const REMOVED_INDICATORS = [
  ['Sites created', 'item 16, Not Required, duplicate of tile 1'],
  ['Sites deleted', 'item 17, Deferred'],
  ['Sites archived', 'item 18, Deferred'],
  ['Inactive over', 'item 19, Agreed with Changes, belongs to Department Insights'],
  ['with zero declarations', 'item 40, Not Required, covered by items 38 and 39'],
];
REMOVED_INDICATORS.forEach(([t, why]) => check('Bank-wide no longer shows "' + t + '" (' + why + ')',
  !bwCode.includes('["' + t) && !bwCode.includes('"' + t + '"')));
check('The shared-site limitation is stated on the sites drill, not left to be discovered',
  /Sites shared across departments, counted to the first/.test(bw));

/* ---- Phase 5. Department / Office / RM / RO, items 11, 42 and 43 ---- */
/* The old wordings, each of which RAC replaced. Searched over the Bank-wide
   module's own text, not the whole file: other dashboards are out of this
   decision's scope until RAC rules on them. */
const OLD_WORDINGS = [
  'Department / office / RM',
  'Department, RM, office',
  'by department, office or RM',
  'Compare departments, offices and RMs',
];
OLD_WORDINGS.forEach(w => check('Bank-wide no longer says "' + w + '" (item 11)',
  !bwCode.includes(w)));
check('Bank-wide uses the agreed column heading Department / Office / RM / RO',
  bw.includes('Department / Office / RM / RO'));
/* Division has no source: the Cloud Governance export's Division column is
   empty on all 1,032 EDRMS sites. It must not return as a visible grouping.
   Only rendered text is searched, since divisionsFor() is exported to
   Department Insights and is not shown here. */
const visible = (bw.match(/(?:title|sub|lab|cols)\s*:\s*[^\n]*/g) || []).join('\n');
check('No visible Bank-wide label groups by division (items 42 and 43)',
  !/\bdivision/i.test(visible), 'found: ' + (visible.match(/[^\n]*division[^\n]*/i) || [''])[0].slice(0, 80));

/* ---- Phase 6. One inactivity window, items 25, 26 and 19 ---- */
check('Bank-wide claims no "never accessed" measure (item 25: 180 days is the longest window any source serves)',
  !/[Nn]ever accessed/.test(bwCode));
check('USERS_NEVER is gone from DATA, not merely hidden behind a label',
  !/const\s+USERS_NEVER\s*=/.test(src));
check('The inactivity figure is driven by the window constant, never a second hardcoded threshold (item 26)',
  !/No access in 90 days/.test(bwCode) && /No access in "\+DATA\.ACTIVITY_WINDOW\+" days/.test(bwCode));
check('The users drill sort keys match its columns, so no sort runs on a removed field',
  !/sortUsers==="never"|sortUsers==="idle90"/.test(bwCode));
check('Per-department inactivity still nests inside the user count',
  /d\.idle180<=d\.users/.test(bw));

/* ---- Phase 7. The comparison panel, items 60, 61 and 62 ---- */
check('Documents against records declared is gone from the comparison (item 60, Not Required)',
  !/docsrec/.test(bwCode) && !/Documents against records declared/.test(bwCode));
check('The comparison offers exactly the two ratios RAC kept',
  (bwCode.match(/<option value="/g) || []).length === 2);
check('Neither ratio says "Active users" without saying which users (items 61 and 62)',
  !/"Active users"/.test(bwCode));
check('Both ratios name their denominator as the measured window',
  (bwCode.match(/Users with recorded activity/g) || []).length >= 3);
check('The panel says the rounded headcount RAC asked for is not captured yet',
  /rounded headcount RAC asked for is not captured yet/.test(bw));

/* ---- Phase 8. Trend and physical counterparts, items 65, 44, 45, 46 ---- */
check('The monthly average tile is gone (item 65: "this is a report, not average")',
  !/Monthly average in range/.test(bwCode));
check('Records declared per month is drawn alongside the cumulative trend (item 65)',
  /bw-trend-months/.test(bwCode) && /CHART\.columns\(perMonth/.test(bwCode));
check('The months are asserted to sum to the total the cumulative trend ends at',
  /perMonth\.reduce\([\s\S]{0,60}===\s*total/.test(bwCode));
check('Records declared in range keeps its tile (item 64, Agreed)',
  /Records declared in range/.test(bwCode));
check('The physical counterpart content RAC agreed is a panel of its own, not a drill behind the deferred tile',
  /id="bw-phys-panel"/.test(bwCode) && /function drawPhysPanel/.test(bwCode));
check('No route still points at the removed physical counterparts drill',
  !/drawPhysDrill/.test(bwCode));
/* Scoped to the function body, not the module: a non-greedy match over the
   whole module would run past the end of drawPhysPanel and find the drill
   builders that legitimately write to #bw-drill. */
const physBody = (() => {
  const i = bwCode.indexOf('function drawPhysPanel()');
  if (i < 0) return '';
  const j = bwCode.indexOf('\n  function ', i + 10);
  return bwCode.slice(i, j < 0 ? bwCode.length : j);
})();
check('The physical panel renders into its own container, so sorting it cannot overwrite the drill',
  physBody.includes('getElementById("bw-phys-panel")') && !physBody.includes('getElementById("bw-drill")'),
  physBody ? 'drawPhysPanel still writes to #bw-drill' : 'drawPhysPanel not found');
check('The share of records with a counterpart is a tile carrying both bases (item 46)',
  /Share of records with a counterpart",PCT\(TOTAL_PHYS,TOTAL_REC\)/.test(bwCode.replace(/\s+/g, '')) ||
  /Total number of physical records declared[\s\S]{0,400}Share of records with a counterpart/.test(bwCode));

/* ================= DEPARTMENT INSIGHTS ================= */
/* ---- Phase 1. Top panel and picker, items 8, 4 and 1 ---- */
const dpTiles = (dpCode.match(/const TILES=\[[\s\S]*?\n  \];/) || [''])[0];
check('Department Insights carries the six tiles RAC kept',
  (dpTiles.match(/\{k:"/g) || []).length === 6,
  'found ' + (dpTiles.match(/\{k:"/g) || []).length);
check('The records due for disposal tile is gone (item 8, Deferred)',
  !dpTiles.includes('{k:"disp"'));
['sites', 'users', 'visitors', 'docs', 'rec', 'phys'].forEach(k =>
  check('Department Insights keeps the ' + k + ' tile', dpTiles.includes('{k:"' + k + '"')));
check('The visitor tile counts people, not visits (item 4)',
  /Total number of unique site visitors/.test(dpTiles) && !/Total number of site visits"/.test(dpTiles));
check('The department picker is labelled Department / Office / RM / RO (item 1)',
  /Department \/ Office \/ RM \/ RO<\/span>/.test(dpCode) &&
  !/Department \/ office \/ RM<\/span>/.test(dpCode));

/* ---- Phase 2. Users and Activity, items 12 to 19 ---- */
check('No access in the last 180 days is gone from Department Insights (item 14, Not Required)',
  !/No access in EDRMS compliant sites, last 180 days/.test(dpCode));
check('Never accessed is gone from Department Insights (item 15, Not Required: the window cannot support "never")',
  !/[Nn]ever accessed/.test(dpCode));
check('Users with recorded activity and used in the last 180 days both stay (items 12 and 13)',
  /Users with recorded activity in EDRMS compliant sites/.test(dpCode) &&
  /Used EDRMS in the last 180 days/.test(dpCode));
check('Training completion rate is present and says Not captured (item 19)',
  /Training completion rate\s*<b>\$\{NOSRC\}/.test(dpCode));
check('Staff, contractors and consultants are not drawn (items 16 to 18, Deferred)',
  !/Total number of staff|Total number of contractors|Total number of consultants/.test(dpCode));
check('No Department Insights figure still reads a field Bank-wide removed',
  !/\bd\.never\b|\bd\.idle90\b|sum\("never"\)|sum\("idle90"\)/.test(dpCode),
  'a removed field is still read here, which prints NaN rather than throwing');

/* ---- Phase 3. Site Visits, items 31 to 42 ---- */
const DP_VISIT_REMOVED = [
  ['Page View Count', 'items 33 and 36, Not Required'],
  ['Visited Page Count', 'items 34 and 37, Not Required'],
  ['Access requests denied', 'item 42, Not Required'],
];
DP_VISIT_REMOVED.forEach(([t, why]) => check('Site Visits no longer shows "' + t + '" (' + why + ')',
  !dpCode.includes(t)));
check('The date range filter is gone: no checker item asks for one on this panel',
  !/visitorFilter|dp-visitor-quick-mode|dp-visitor-custom-mode|Quick windows/.test(dpCode));
check('The machinery the filter drove is gone with it, not left wired to nothing',
  !/getFilteredMetrics|applyVisitorFilter|getVisitorTotal|VISITORS_WINDOWS/.test(dpCode));
check('No Department Insights figure is drawn with Math.random()',
  !/Math\.random\(\)/.test(dpCode),
  'a figure that changes on every redraw means no two readers see the same number');
check('The site visits table by site is kept (item 32, Agreed)',
  /<div class="ptitle">Site Visits<\/div>/.test(dpCode) && /id="dp-visitors"/.test(dpCode));
check('EDRMS Site Type is kept (item 38, Agreed)', /EDRMS Site Type/.test(dpCode));
check('The external and internal visitor split is present (items 39 and 40, Agreed)',
  /Total number of visitors, external/.test(dpCode) && /Total number of visitors, internal/.test(dpCode));
check('Access requests granted is present and scoped to Cloud Governance (item 41)',
  /Access requests granted, Cloud Governance/.test(dpCode));
check('The three measures with no per-site source say Not captured rather than printing a split',
  (dpCode.match(/Total number of visitors, external <b>\$\{NOSRC\}/) || []).length === 1);

/* ---- Phase 4. Overview of EDRMS sites, items 20 to 30 ---- */
const siteCols = (dpCode.match(/const SITECOLS=\[[\s\S]*?\];/) || [''])[0];
check('The records due for disposal column is gone from the site table (item 30, Deferred)',
  !/Number of records due for disposal/.test(siteCols));
check('The site table carries the five columns RAC agreed (items 25 to 29)',
  (siteCols.match(/\{k:"/g) || []).length === 5);
check('Due within 12 months is gone from the site summary (item 24, Deferred)',
  !/Total number of records due for disposal within 12 months",v:d\.due/.test(dpCode));
/* Scoped to the site table's own style attribute. A bare search for the grid
   template matched the library table instead and passed against the unfixed
   file, which is a check that cannot fail: worse than no check at all. */
const siteGrid = (dpCode.match(/id="dp-sites"[\s\S]{0,160}?--dc:([^"]*)"/) || [, ''])[1];
const siteTracks = (() => {
  const m = /repeat\((\d+),/.exec(siteGrid);
  return (siteGrid.match(/minmax\(/g) || []).length - (m ? 1 : 0) + (m ? Number(m[1]) : 0);
})();
check('The site table grid declares one track per column',
  siteTracks === (siteCols.match(/\{k:"/g) || []).length,
  siteTracks + ' grid tracks against ' + (siteCols.match(/\{k:"/g) || []).length + ' columns');

/* ---------------------------------------------------------------- */
console.log('\nRAC decision checks: ' + checks.length + ' run, ' +
            (checks.length - fails.length) + ' passed, ' + fails.length + ' failed.');
if (fails.length) {
  console.error('\n❌ FAILED:');
  fails.forEach(f => console.error('  - ' + f));
  process.exit(1);
}
console.log('✅ All RAC decision checks passed.');
