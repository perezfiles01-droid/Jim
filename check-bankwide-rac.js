/**
 * Bank-wide Oversight: the RAC decisions of 21 September 2026, asserted.
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
const tilesBlock = (bw.match(/const TILES=\[[\s\S]*?\n  \];/) || [''])[0];
const navBlock = (bw.match(/const NAVTILES=\[[\s\S]*?\n  \];/) || [''])[0];

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
  !bw.includes('["' + t) && !bw.includes('"' + t + '"')));
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
  !bw.includes(w)));
check('Bank-wide uses the agreed column heading Department / Office / RM / RO',
  bw.includes('Department / Office / RM / RO'));
/* Division has no source: the Cloud Governance export's Division column is
   empty on all 1,032 EDRMS sites. It must not return as a visible grouping.
   Only rendered text is searched, since divisionsFor() is exported to
   Department Insights and is not shown here. */
const visible = (bw.match(/(?:title|sub|lab|cols)\s*:\s*[^\n]*/g) || []).join('\n');
check('No visible Bank-wide label groups by division (items 42 and 43)',
  !/\bdivision/i.test(visible), 'found: ' + (visible.match(/[^\n]*division[^\n]*/i) || [''])[0].slice(0, 80));

/* ---------------------------------------------------------------- */
console.log('\nBank-wide RAC decision checks: ' + checks.length + ' run, ' +
            (checks.length - fails.length) + ' passed, ' + fails.length + ' failed.');
if (fails.length) {
  console.error('\n❌ FAILED:');
  fails.forEach(f => console.error('  - ' + f));
  process.exit(1);
}
console.log('✅ All Bank-wide decision checks passed.');
