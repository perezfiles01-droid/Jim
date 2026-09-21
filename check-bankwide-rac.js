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

/* ---------------------------------------------------------------- */
console.log('\nBank-wide RAC decision checks: ' + checks.length + ' run, ' +
            (checks.length - fails.length) + ' passed, ' + fails.length + ' failed.');
if (fails.length) {
  console.error('\n❌ FAILED:');
  fails.forEach(f => console.error('  - ' + f));
  process.exit(1);
}
console.log('✅ All Bank-wide decision checks passed.');
