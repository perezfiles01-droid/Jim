// The report's data, and the few figures it derives from it.
//
// Everything on screen is read through IReportData. Today it is filled from
// data/sampleData.json, the same sample figures as the approved prototype, so
// the two can be compared number for number. To connect the real reporting
// database, replace loadReportData() with a call to the API and return the
// same shapes; no component needs to change.
// eslint-disable-next-line @typescript-eslint/no-require-imports
var SAMPLE = require('../data/sampleData.json');
export function loadReportData() {
    return SAMPLE;
}
/* ---------- derived figures (the same formulas as the prototype) ---------- */
/** Headcount is shown rounded to the nearest hundred. */
export var approxHead = function (d) { return Math.round(d.head / 100) * 100; };
function seed(text, mul, mod) {
    var h = 0;
    for (var i = 0; i < text.length; i++)
        h = (h * mul + text.charCodeAt(i)) % mod;
    return h;
}
/** People who completed EDRMS training (sample figure until RAC supplies it). */
export function trainingDone(d) {
    var rate = 0.6 + 0.35 * (seed(d.code, 37, 997) / 997);
    return Math.round(d.head * rate);
}
/** Internal and external visitors of a site. */
export function visitorSplit(s) {
    var h = seed(s.name, 33, 9973);
    var external = Math.round(s.visitors * (0.03 + 0.12 * (h / 9973)));
    return { internal: s.visitors - external, external: external };
}
/** The date a site was created. */
export function siteCreated(s) {
    var h = seed(s.name, 31, 100003);
    var m = h % 33;
    return new Date(2024 + Math.floor(m / 12), m % 12, 1 + (h % 27));
}
/** "k.aquino@adb.org" to "K Aquino". */
export function ownerName(email) {
    var parts = String(email || '').split('@')[0].split(/[._-]/).filter(Boolean);
    return parts.map(function (p) { return p.charAt(0).toUpperCase() + p.slice(1); }).join(' ') || email;
}
export function ownerInitials(email) {
    return ownerName(email).split(' ').map(function (p) { return p.charAt(0); }).join('').slice(0, 2);
}
/** Folders and active users of a library (sample figures). */
export function libraryExtras(l) {
    var h = seed(l.lib + '||' + l.site, 31, 9973);
    return {
        users: Math.max(1, Math.round(Math.sqrt(l.docs) / 4 + (h % 9))),
        folders: Math.max(1, Math.round(l.docs / 45 + (h % 7)))
    };
}
/* Documents over time: 33 monthly snapshots, Jan 2024 to Sep 2026. */
export var DOC_MONTHS = (function () {
    var names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var out = [];
    for (var i = 0; i < 33; i++) {
        var y = 2024 + Math.floor(i / 12);
        out.push({ y: y, m: i % 12, lab: names[i % 12] + " '" + String(y).slice(2) });
    }
    return out;
})();
/** Documents held by a department at the start, and at the end of each month. */
export function documentSeries(d) {
    var s = seed(d.code, 31, 9973);
    var w = [];
    var tw = 0;
    for (var i = 0; i < DOC_MONTHS.length; i++) {
        s = (s * 7919 + 17) % 9973;
        var x = 0.6 + 0.8 * s / 9973;
        w.push(x);
        tw += x;
    }
    var start = Math.round(d.docs * 0.55), grow = d.docs - start, held = [];
    var acc = 0;
    for (var i = 0; i < DOC_MONTHS.length; i++) {
        acc += w[i];
        held.push(start + Math.round(grow * acc / tw));
    }
    held[DOC_MONTHS.length - 1] = d.docs;
    return { start: start, held: held };
}
/** Sum a numeric field over a list. */
export function sum(list, pick) {
    return list.reduce(function (a, x) { return a + (pick(x) || 0); }, 0);
}
//# sourceMappingURL=data.js.map