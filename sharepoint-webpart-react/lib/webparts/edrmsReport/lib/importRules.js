/*
 * The single manual data template (5 Nov 2026) and every rule it must pass.
 *
 * One workbook, one import, three data tabs:
 *   Sites        sir Rotsen's site file (Site, URL, Site Name, Department,
 *                Division, Production, Category, Sub-category, Sub-group)
 *   People       the AP All Users export, one row per person, plus one column
 *                RAC fills in: Completed EDRMS training (Yes / No / blank)
 *   Departments  Go-Live date and Site convention link per unit
 * and one optional helper tab:
 *   Code mapping People codes that are not report units (SD1, CCSD...) and
 *                the unit they count towards
 *
 * Headcount, staff type split and completed training are COUNTED from People,
 * never typed. Only per unit counts are kept; no names or emails are stored.
 *
 * If any rule is broken nothing is loaded. Skipped rows (service accounts,
 * repeated emails) are not errors: they are counted and reported.
 * This file has no SharePoint or browser imports, so the Floot copy
 * (helpers/importRules.tsx) is the same code.
 */
export var TABS = { sites: 'Sites', people: 'People', departments: 'Departments', mapping: 'Code mapping' };
export var COLUMNS = {
    sites: [
        { name: 'Site', req: true, rule: 'Full link to the library. Must start with the URL on the same row followed by /. Each Site once.' },
        { name: 'URL', req: true, rule: 'https://<tenant>.sharepoint.com/sites/<name>, nothing after the site name.' },
        { name: 'Site Name', req: true, rule: 'Must equal the <name> at the end of the URL.' },
        { name: 'Department', req: true, rule: 'Unit code (capital letters and digits). Must equal the Sub-category or the Sub-group.' },
        { name: 'Division', req: true, rule: 'Division code (capital letters and digits).' },
        { name: 'Production', req: true, rule: 'Yes or No.' },
        { name: 'Category', req: true, rule: 'HQ, RM or RO.' },
        { name: 'Sub-category', req: true, rule: 'Unit code.' },
        { name: 'Sub-group', req: false, rule: 'Unit code, or blank.' }
    ],
    people: [
        { name: 'Email', req: true, rule: 'The person\'s email. Each person once (repeats are counted once). Only adb.org, adbi.org and afe.adb.org mailboxes are counted; others are skipped as service or test accounts.' },
        { name: 'Display Name', req: false, rule: 'Optional, for your reference only. Never stored.' },
        { name: 'Department', req: true, rule: 'Department code as in the AP export.' },
        { name: 'Division', req: false, rule: 'As in the AP export.' },
        { name: 'Unit', req: false, rule: 'As in the AP export.' },
        { name: 'Office Location', req: false, rule: 'ADB HQ, or the RM / RO code. A person in an RM or RO counts towards it; otherwise towards the Department.' },
        { name: 'Staff type', req: false, rule: 'Staff, Consultant or Contractor. Leave blank to take it from the email (.consultant, .contractor, otherwise Staff).' },
        { name: 'Completed EDRMS training', req: false, rule: 'Yes or No. Blank counts as No.' }
    ],
    departments: [
        { name: 'Unit code', req: true, rule: 'A unit that appears on Sites or People. Each unit once.' },
        { name: 'Go-Live date', req: false, rule: 'YYYY-MM-DD (an Excel date also works), from 2015-01-01 up to today. Blank if not live yet.' },
        { name: 'Site convention link', req: false, rule: 'https:// link on a sharepoint.com address. Blank if not provided yet.' },
        { name: 'Completed training (count)', req: false, rule: 'Only when RAC gives a number per unit instead of a list of people. Whole number from 0 up to the unit\'s headcount counted from People. Leave blank when People already marks who completed training; giving both for the same unit is refused.' }
    ],
    mapping: [
        { name: 'Code in People', req: true, rule: 'A Department or Office Location code used on People.' },
        { name: 'Report unit', req: true, rule: 'The report unit those people count towards.' }
    ]
};
/* Older header spellings accepted so the client's files can be pasted as they are. */
var ALIASES = {
    'main category': 'category', 'sub category': 'sub-category', 'sub sub category': 'sub-group',
    'subcategory': 'sub-category', 'sub group': 'sub-group', 'email id': 'email', 'e-mail': 'email'
};
export var POLICIES = [
    'Use this template. Only .xlsx files, 10 MB at most.',
    'Keep the tab names and the column headings in row 1. Columns may be in any order; extra columns are refused.',
    'Sites: at least 1 and at most 5,000 rows. People: at most 30,000 rows. Departments: at most 500 rows.',
    'Cells must not start with = + - or @ (formulas are not accepted).',
    'The raw AP All Users pivot can be pasted into People as it is: blank cells are filled down from the row above and Total rows are dropped.',
    'If any rule is broken, nothing in the file is loaded. Every problem is listed by tab, row and column.',
    'Headcount, staff type and completed training are counted from People. Only the counts per unit are kept; names and emails are never stored.'
];
var CODE = /^[A-Z][A-Z0-9-]{1,11}$/;
/* People codes come from HR as they are, e.g. "VAN PCO" or "MYRM-YGN". */
var PCODE = /^[A-Z][A-Z0-9 -]{1,15}$/;
var SITE_URL = /^https:\/\/[a-z0-9-]+\.sharepoint\.com\/sites\/([A-Za-z0-9_.-]+)$/i;
var EMAIL = /^[a-z0-9._%+'-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
var ADB_DOMAINS = ['adb.org', 'adbi.org', 'afe.adb.org'];
var HQ = ['', 'adb hq', '(blank)', 'hq'];
function clean(v) {
    if (v === null || v === undefined)
        return '';
    if (v instanceof Date)
        return isoDate(v);
    return String(v).replace(/ /g, ' ').trim();
}
function isoDate(d) {
    var x = new Date(d.getTime() + 60000);
    var p2 = function (n) { return (n < 10 ? '0' : '') + n; };
    return x.getFullYear() + '-' + p2(x.getMonth() + 1) + '-' + p2(x.getDate());
}
function today() { return isoDate(new Date()); }
function isFormula(s) { return /^[=+\-@]/.test(s) && !/^-?\d+(\.\d+)?$/.test(s); }
function isSpLink(s) {
    if (/\s/.test(s))
        return false;
    var m = /^https:\/\/([^/?#]+)(\/|$)/i.exec(s);
    return !!m && /(^|\.)sharepoint\.com$/i.test(m[1]);
}
function parseDate(s) {
    if (/^\d{5}(\.0+)?$/.test(s))
        return new Date(Date.UTC(1899, 11, 30) + Math.floor(+s) * 86400000).toISOString().slice(0, 10);
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (!m)
        return null;
    var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3] ? s : null;
}
function key(h) {
    var k = h.toLowerCase().replace(/\s+/g, ' ').trim();
    return ALIASES[k] || k;
}
/** Reads one tab: finds the heading row (row 1, or the AP pivot's row 3), checks the headings. */
function readTab(tab, sheet, spec, issues, opts) {
    var push = function (row, column, message) { if (issues.length < 1000)
        issues.push({ tab: tab, row: row, column: column, message: message }); };
    if (!sheet || !sheet.length) {
        if (opts.required)
            push(0, '(tab)', 'The ' + tab + ' tab is missing or empty. Use the downloaded template and keep the tab name.');
        return null;
    }
    var want = spec.map(function (c) { return key(c.name); }), ignore = (opts.ignore || []).map(key);
    var hr = 0;
    var _loop_1 = function (r) {
        var ks = (sheet[r] || []).map(function (c) { return key(clean(c)); });
        if (want.filter(function (w) { return ks.indexOf(w) >= 0; }).length >= 2) {
            hr = r;
            return "break";
        }
    };
    for (var r = 0; r < Math.min(10, sheet.length); r++) {
        var state_1 = _loop_1(r);
        if (state_1 === "break")
            break;
    }
    var head = (sheet[hr] || []).map(function (c) { return clean(c); });
    var cols = {};
    head.forEach(function (h, i) {
        if (!h)
            return;
        var k = key(h);
        if (want.indexOf(k) < 0) {
            if (ignore.indexOf(k) < 0)
                push(hr + 1, h, 'Unknown column "' + h + '". Remove it or use the latest template.');
            return;
        }
        if (cols[k] !== undefined)
            push(hr + 1, h, 'Column "' + h + '" appears more than once.');
        else
            cols[k] = i;
    });
    spec.forEach(function (c) { if (c.req && cols[key(c.name)] === undefined)
        push(hr + 1, c.name, 'Missing column "' + c.name + '".'); });
    if (issues.some(function (i) { return i.tab === tab; }))
        return null;
    var rows = [];
    var carry = {};
    var _loop_2 = function (r) {
        var raw = sheet[r] || [];
        var vals = {};
        Object.keys(cols).forEach(function (k) { vals[k] = clean(raw[cols[k]]); });
        var all = raw.map(function (c) { return clean(c); });
        if (all.every(function (v) { return v === ''; }))
            return "continue";
        if (opts.pivot) {
            // AP pivot: drop Total rows, fill grouped columns down.
            if (all.some(function (v) { return /(^|\s)total$/i.test(v) || /^grand total$/i.test(v); }))
                return "continue";
            ['department', 'division', 'unit', 'organization'].forEach(function (k) {
                if (cols[k] === undefined)
                    return;
                if (vals[k])
                    carry[k] = vals[k];
                else
                    vals[k] = carry[k] || '';
            });
        }
        rows.push({ line: r + 1, get: function (k) { return vals[key(k)] || ''; } });
    };
    for (var r = hr + 1; r < sheet.length; r++) {
        _loop_2(r);
    }
    if (rows.length > opts.maxRows)
        push(0, '(tab)', 'Too many rows (' + rows.length + '). The limit is ' + opts.maxRows + '.');
    if (opts.required && rows.length === 0)
        push(hr + 2, '(tab)', 'No data rows under the headings.');
    var _loop_3 = function (row) {
        Object.keys(cols).forEach(function (k) {
            var v = row.get(k);
            if (v && isFormula(v))
                push(row.line, k, 'Starts with = + - or @. Formulas are not accepted.');
            if (v.length > 2048)
                push(row.line, k, 'Too long (' + v.length + ' characters).');
        });
    };
    for (var _i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
        var row = rows_1[_i];
        _loop_3(row);
    }
    return { cols: cols, rows: rows };
}
export function validate(book, fileName, importedBy) {
    var issues = [];
    var notes = [];
    var push = function (tab, row, column, message) { if (issues.length < 1000)
        issues.push({ tab: tab, row: row, column: column, message: message }); };
    var find = function (name) {
        var k = Object.keys(book).find(function (t) { return t.trim().toLowerCase() === name.toLowerCase(); });
        return k ? book[k] : undefined;
    };
    /* ---------- Sites ---------- */
    var sitesT = readTab(TABS.sites, find(TABS.sites), COLUMNS.sites, issues, { required: true, maxRows: 5000 });
    var sites = [];
    var known = new Set();
    if (sitesT) {
        var seen = {}, siteSig = {};
        var _loop_4 = function (r) {
            var P = function (c, m) { return push(TABS.sites, r.line, c, m); };
            var site = r.get('Site'), url = r.get('URL'), nm = r.get('Site Name');
            var dept = r.get('Department').toUpperCase(), div = r.get('Division').toUpperCase(), prodRaw = r.get('Production');
            var cat = r.get('Category').toUpperCase(), sub = r.get('Sub-category').toUpperCase(), grp = r.get('Sub-group').toUpperCase();
            COLUMNS.sites.forEach(function (c) { if (c.req && !r.get(c.name))
                P(c.name, 'Required. This cell is empty.'); });
            var m = SITE_URL.exec(url);
            if (url && !m)
                P('URL', 'Must look like https://<tenant>.sharepoint.com/sites/<name>, with nothing after the site name.');
            if (m && nm && nm.toLowerCase() !== m[1].toLowerCase())
                P('Site Name', 'Must equal "' + m[1] + '", the name in the URL.');
            if (site) {
                if (!isSpLink(site))
                    P('Site', 'Must be a full https:// link on a sharepoint.com address.');
                else if (url && site.toLowerCase().indexOf(url.toLowerCase().replace(/\/$/, '') + '/') !== 0)
                    P('Site', 'Must start with the URL on the same row followed by /.');
                var k = site.toLowerCase().replace(/\/$/, '');
                if (seen[k])
                    P('Site', 'Repeated (first on row ' + seen[k] + ').');
                else
                    seen[k] = r.line;
            }
            [['Department', dept], ['Division', div], ['Sub-category', sub], ['Sub-group', grp]].forEach(function (_a) {
                var c = _a[0], v = _a[1];
                if (v && !CODE.test(v))
                    P(c, '"' + v + '" is not a valid code (capital letters and digits, 2 to 12 characters).');
            });
            var prod = prodRaw.toLowerCase();
            if (prodRaw && prod !== 'yes' && prod !== 'no')
                P('Production', '"' + prodRaw + '" must be Yes or No.');
            if (cat && ['HQ', 'RM', 'RO'].indexOf(cat) < 0)
                P('Category', '"' + cat + '" must be HQ, RM or RO.');
            if (dept && sub && dept !== sub && dept !== grp)
                P('Department', '"' + dept + '" must equal the Sub-category (' + sub + ')' + (grp ? ' or the Sub-group (' + grp + ')' : '') + '.');
            if (m) {
                var sig = [dept, div, prod, cat, sub, grp].join('|'), prev = siteSig[url.toLowerCase()];
                if (prev && prev.sig !== sig)
                    P('URL', 'Same site as row ' + prev.line + ' but with a different Department, Division, Production or category.');
                else if (!prev)
                    siteSig[url.toLowerCase()] = { line: r.line, sig: sig };
            }
            if (dept)
                known.add(dept);
            if (sub)
                known.add(sub);
            if (grp)
                known.add(grp);
            sites.push({ site: site.replace(/\/$/, ''), url: url, siteName: nm, department: dept, division: div, production: prod === 'yes', category: cat, subCategory: sub, subGroup: grp || null });
        };
        for (var _i = 0, _a = sitesT.rows; _i < _a.length; _i++) {
            var r = _a[_i];
            _loop_4(r);
        }
    }
    /* ---------- Code mapping (optional) ---------- */
    var map = {};
    var mapT = readTab(TABS.mapping, find(TABS.mapping), COLUMNS.mapping, issues, { required: false, maxRows: 500 });
    if (mapT) {
        for (var _b = 0, _c = mapT.rows; _b < _c.length; _b++) {
            var r = _c[_b];
            var from = r.get('Code in People').toUpperCase(), to = r.get('Report unit').toUpperCase();
            if (!from || !to) {
                push(TABS.mapping, r.line, !from ? 'Code in People' : 'Report unit', 'Required. This cell is empty.');
                continue;
            }
            if (!PCODE.test(from))
                push(TABS.mapping, r.line, 'Code in People', '"' + from + '" is not a valid code.');
            if (!CODE.test(to))
                push(TABS.mapping, r.line, 'Report unit', '"' + to + '" is not a valid code.');
            if (map[from])
                push(TABS.mapping, r.line, 'Code in People', '"' + from + '" is mapped twice.');
            map[from] = to;
        }
    }
    /* ---------- People ---------- */
    var units = {};
    var unit = function (c) { return units[c] || (units[c] = { headcount: 0, staff: 0, consultant: 0, contractor: 0, trained: 0, goLive: null, convUrl: null }); };
    var peopleT = readTab(TABS.people, find(TABS.people), COLUMNS.people, issues, { required: true, maxRows: 30000, pivot: true, ignore: ['Organization', 'Count of User Name'] });
    var people = 0, skippedDomain = 0, repeats = 0, trainedAll = 0, noDept = 0, countUnits = 0;
    if (peopleT) {
        var seen = {};
        var _loop_5 = function (r) {
            var P = function (c, m) { return push(TABS.people, r.line, c, m); };
            var email = r.get('Email').toLowerCase(), dept = r.get('Department').toUpperCase();
            var officeRaw = r.get('Office Location'), typeRaw = r.get('Staff type'), trRaw = r.get('Completed EDRMS training');
            if (!email) {
                skippedDomain++;
                return "continue";
            } // accounts with no mailbox (system ids) are not people
            if (!EMAIL.test(email)) {
                skippedDomain++;
                return "continue";
            }
            var dom = email.split('@')[1];
            if (ADB_DOMAINS.indexOf(dom) < 0) {
                skippedDomain++;
                return "continue";
            }
            if (seen[email]) {
                repeats++;
                return "continue";
            }
            seen[email] = true;
            if (!dept || dept === '(BLANK)') {
                noDept++;
            }
            var t = typeRaw.toLowerCase();
            if (!t) {
                var loc = email.split('@')[0];
                t = /\.consultant$/.test(loc) ? 'consultant' : /\.contractor$/.test(loc) ? 'contractor' : 'staff';
            }
            if (['staff', 'consultant', 'contractor'].indexOf(t) < 0) {
                P('Staff type', '"' + typeRaw + '" must be Staff, Consultant or Contractor.');
                return "continue";
            }
            var tr = trRaw.toLowerCase();
            if (tr && tr !== 'yes' && tr !== 'no') {
                P('Completed EDRMS training', '"' + trRaw + '" must be Yes, No or blank.');
                return "continue";
            }
            var office = officeRaw.toUpperCase();
            var code = HQ.indexOf(officeRaw.toLowerCase()) >= 0 ? (dept && dept !== '(BLANK)' ? dept : 'UNASSIGNED') : office;
            code = map[code] || code;
            if (!PCODE.test(code)) {
                P(HQ.indexOf(officeRaw.toLowerCase()) >= 0 ? 'Department' : 'Office Location', '"' + code + '" is not a valid code. Add it to the Code mapping tab.');
                return "continue";
            }
            var u = unit(code);
            u.headcount++;
            if (t === 'staff')
                u.staff++;
            else if (t === 'consultant')
                u.consultant++;
            else
                u.contractor++;
            if (tr === 'yes') {
                u.trained++;
                trainedAll++;
            }
            people++;
        };
        for (var _d = 0, _e = peopleT.rows; _d < _e.length; _d++) {
            var r = _e[_d];
            _loop_5(r);
        }
        if (skippedDomain)
            notes.push(skippedDomain + ' account(s) skipped: no email or not an ADB mailbox (service and test accounts).');
        if (repeats)
            notes.push(repeats + ' repeated email(s) counted once.');
        if (noDept)
            notes.push(noDept + ' person(s) with no Department or office, counted under UNASSIGNED.');
        if (people === 0)
            push(TABS.people, 0, '(tab)', 'No people could be counted. Check the Email column.');
    }
    /* ---------- Departments ---------- */
    var deptT = readTab(TABS.departments, find(TABS.departments), COLUMNS.departments, issues, { required: false, maxRows: 500 });
    if (deptT) {
        var seen = {}, now = today();
        var _loop_6 = function (r) {
            var P = function (c, m) { return push(TABS.departments, r.line, c, m); };
            var code = r.get('Unit code').toUpperCase(), d = r.get('Go-Live date'), link = r.get('Site convention link'), cnt = r.get('Completed training (count)');
            if (!code) {
                P('Unit code', 'Required. This cell is empty.');
                return "continue";
            }
            if (!CODE.test(code)) {
                P('Unit code', '"' + code + '" is not a valid code.');
                return "continue";
            }
            if (seen[code]) {
                P('Unit code', '"' + code + '" is repeated (first on row ' + seen[code] + ').');
                return "continue";
            }
            seen[code] = r.line;
            if (!known.has(code) && !units[code])
                P('Unit code', '"' + code + '" is not on the Sites or People tab.');
            var date = null;
            if (d) {
                date = parseDate(d);
                if (!date)
                    P('Go-Live date', '"' + d + '" is not a real date in YYYY-MM-DD form.');
                else if (date < '2015-01-01')
                    P('Go-Live date', date + ' is before 2015-01-01.');
                else if (date > now)
                    P('Go-Live date', date + ' is in the future.');
            }
            if (link && !isSpLink(link))
                P('Site convention link', 'Must be a full https:// link on a sharepoint.com address, with no spaces.');
            var u = unit(code);
            u.goLive = date;
            u.convUrl = link || null;
            if (cnt) {
                var t = cnt.replace(/,/g, '');
                if (!/^\d+$/.test(t))
                    P('Completed training (count)', '"' + cnt + '" is not a whole number.');
                else if (u.headcount === 0)
                    P('Completed training (count)', code + ' has no people on the People tab, so there is no headcount to count against.');
                else if (+t > u.headcount)
                    P('Completed training (count)', t + ' is more than ' + code + '\'s headcount (' + u.headcount + ').');
                else if (u.trained > 0)
                    P('Completed training (count)', code + ' already has ' + u.trained + ' people marked Yes on the People tab. Use one or the other, not both.');
                else {
                    u.trained = +t;
                    countUnits++;
                }
            }
        };
        for (var _f = 0, _g = deptT.rows; _f < _g.length; _f++) {
            var r = _g[_f];
            _loop_6(r);
        }
    }
    if (countUnits)
        notes.push('Completed training taken as a number for ' + countUnits + ' unit(s) from the Departments tab.');
    trainedAll = Object.keys(units).reduce(function (a, k) { return a + units[k].trained; }, 0);
    if (people > 0 && trainedAll === 0)
        notes.push('No completed training given (no Yes on People, no count on Departments), so Completed training will show 0 for every unit.');
    var noSites = Object.keys(units).filter(function (c) { return units[c].headcount > 0 && !known.has(c); });
    if (noSites.length)
        notes.push(noSites.length + ' unit(s) have people but no EDRMS site: ' + noSites.slice(0, 12).join(', ') + (noSites.length > 12 ? ', ...' : '') + '. Map them on Code mapping if they belong to another unit.');
    var summary = { sites: sites.length, people: people, units: Object.keys(units).length, trained: trainedAll };
    var ok = issues.length === 0;
    return {
        issues: issues,
        notes: notes,
        summary: summary,
        data: ok ? { version: 2, importedAt: new Date().toISOString(), importedBy: importedBy, fileName: fileName, units: units, sites: sites, notes: notes } : null
    };
}
//# sourceMappingURL=importRules.js.map