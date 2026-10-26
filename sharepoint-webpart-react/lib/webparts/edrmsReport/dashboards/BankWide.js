import { __assign, __spreadArray } from "tslib";
import * as React from 'react';
import { Dropdown } from '@fluentui/react';
import { approxHead, trainingDone, documentSeries, DOC_MONTHS, sum } from '../lib/data';
import { F, short, pct, refreshIso } from '../lib/format';
import { Band, Panel, KpiRow, Tiles, Search, Segmented, ExportButton, DeptCell, Pager, Caret } from '../components/ui';
import { DataTable } from '../components/DataTable';
import { DeptFilter, filterDepts } from '../components/DeptFilter';
import { ColumnChart, ComboChart, Donut } from '../components/charts';
var TIP = {
    head: 'The approximate number of people in each Department, Office, RM or RO, as provided by RAC.',
    active: 'People who opened or edited a file in an EDRMS site at least once in the last 180 days.',
    noAccess: 'An estimate of the people who have not opened any EDRMS site in the last 180 days: the approximate headcount minus the active users.',
    inList: 'The number of Departments, Offices, RMs and ROs shown in the table below.',
    trained: 'The number of people who have completed the EDRMS training course.',
    trainRate: 'The share of the approximate headcount who have completed the EDRMS training course.',
    docs: 'All files stored in EDRMS sites for the Departments, Offices, RMs and ROs shown.',
    rec: 'Documents that have been declared as official records in EDRMS.',
    declRate: 'Records declared as a share of all documents stored in EDRMS.',
    declUsers: 'The number of different people who have declared at least one record in EDRMS.',
    phys: 'Declared records that also exist on paper, for the Departments, Offices, RMs and ROs shown.',
    physShare: 'Physical counterparts as a share of all records declared in EDRMS.',
    totalDocs: 'All files stored in EDRMS sites at the end of the month shown.',
    newDocs: 'Files added to EDRMS sites in the period shown, net of files deleted.',
    storage: 'The space EDRMS sites use in SharePoint, in gigabytes, at the end of the month shown.'
};
/** The bank-wide headcount, rounded once to the nearest hundred. */
var roundedHead = function (depts) { return Math.round(sum(depts, function (d) { return d.head; }) / 100) * 100; };
/** The department column used by every table on this page. */
function deptColumn(width) {
    return { key: 'code', label: 'Department / Office / RM / RO', width: width, sortValue: function (d) { return d.code; }, render: function (d) { return React.createElement(DeptCell, { code: d.code, name: d.name }); } };
}
var num = function (key, label, get, show) {
    return ({ key: key, label: label, numeric: true, sortValue: get, render: function (d) { return (show ? show(d) : F(get(d))); } });
};
/* ---------- search + filter + export, the same on every department table ---------- */
function useDeptQuery(depts) {
    var _a = React.useState(''), q = _a[0], setQ = _a[1];
    var _b = React.useState([]), sel = _b[0], setSel = _b[1];
    var rows = React.useMemo(function () { return filterDepts(depts, sel, q); }, [depts, sel, q]);
    return { q: q, setQ: setQ, sel: sel, setSel: setSel, rows: rows, key: q + '|' + sel.join(',') };
}
/* ---------- Active EDRMS sites ---------- */
var SitesDrill = function (_a) {
    var depts = _a.depts, openDept = _a.openDept;
    var f = useDeptQuery(depts);
    var top = depts.slice().sort(function (a, b) { return b.sites - a.sites || a.code.localeCompare(b.code); }).slice(0, 10);
    var max = Math.max.apply(Math, __spreadArray([1], top.map(function (d) { return d.sites; }), false));
    var cols = [deptColumn(), num('sites', 'Sites', function (d) { return d.sites; })];
    return (React.createElement(Panel, null,
        React.createElement("div", { className: "split" },
            React.createElement("div", { className: "box" },
                React.createElement("h3", { className: "ptitle" }, "Top 10 by number of sites"),
                React.createElement("p", { className: "psub" }, "Highest site counts across departments, offices, RM and RO."),
                React.createElement("div", { className: "rank" }, top.map(function (d) { return (React.createElement("div", { className: "rankRow", key: d.code, title: "".concat(d.code, " - ").concat(d.name, ": ").concat(F(d.sites), " sites") },
                    React.createElement(DeptCell, { code: d.code, name: d.name, plain: true }),
                    React.createElement("div", { className: "rankTrack" },
                        React.createElement("div", { className: "rankFill", style: { width: (d.sites / max) * 100 + '%' } }, F(d.sites))))); }))),
            React.createElement("div", { className: "box" },
                React.createElement("h3", { className: "ptitle" }, "Sites by department / office / RM / RO"),
                React.createElement("div", { className: "toolbar", style: { marginTop: 10 } },
                    React.createElement(Search, { value: f.q, onChange: f.setQ, placeholder: "Search by department / office / RM / RO" }),
                    React.createElement(DeptFilter, { depts: depts, selected: f.sel, onApply: f.setSel }),
                    React.createElement(ExportButton, { table: function () { return ({ name: 'Sites by department', head: ['Department / Office / RM / RO', 'Sites'], rows: f.rows.map(function (d) { return [d.code + ' - ' + d.name, d.sites]; }) }); } })),
                React.createElement(DataTable, { columns: cols, rows: f.rows, rowKey: function (d) { return d.code; }, noun: "departments", resetKey: f.key, onRowClick: function (d) { return openDept(d.code); }, emptyText: "No department matches the search or filter." })))));
};
/* ---------- EDRMS users ---------- */
var UsersDrill = function (_a) {
    var depts = _a.depts, openDept = _a.openDept;
    var H = roundedHead(depts), U = sum(depts, function (d) { return d.users; }), T = sum(depts, trainingDone), rawH = sum(depts, function (d) { return d.head; });
    var noAccess = function (d) { return Math.max(0, approxHead(d) - d.users); };
    var rate = function (d) { return trainingDone(d) / d.head; };
    var cols = [
        deptColumn('24%'),
        num('head', 'Approximate Headcount', approxHead),
        num('users', 'Users active in the last 180 days', function (d) { return d.users; }),
        num('idle', 'No access in 180 days (Approx)', noAccess),
        num('trained', 'Completed training', trainingDone),
        num('rate', 'Training completion', rate, function (d) { return React.createElement("span", { className: "trBar" },
            React.createElement("i", { style: { width: Math.round(rate(d) * 100 * 0.6) } }),
            (rate(d) * 100).toFixed(1),
            "%"); })
    ];
    return (React.createElement(Panel, { title: "Total number of EDRMS users, by Department, Office, RM or RO", sub: "Approximate headcount per Department, Office, RM or RO, provided by RAC, and how many of those people have or have not opened an EDRMS site in the last 180 days." },
        React.createElement(Tiles, { items: [
                { label: 'Approximate Headcount', value: F(H), info: TIP.head },
                { label: 'Users active in the last 180 days', value: F(U), info: TIP.active },
                { label: 'No access in 180 days (Approx)', value: F(Math.max(0, H - U)), info: TIP.noAccess },
                { label: 'Departments, Offices, RMs and ROs in the list', value: F(depts.length), info: TIP.inList },
                { label: 'Completed training', value: F(T), info: TIP.trained },
                { label: 'Training completion', value: pct(T, rawH), info: TIP.trainRate }
            ] }),
        React.createElement("div", { className: "toolbar", style: { justifyContent: 'flex-end' } },
            React.createElement(ExportButton, { table: function () { return ({
                    name: 'EDRMS users by department', head: cols.map(function (c) { return c.label; }),
                    rows: depts.map(function (d) { return [d.code + ' - ' + d.name, approxHead(d), d.users, noAccess(d), trainingDone(d), pct(trainingDone(d), d.head)]; })
                }); } })),
        React.createElement(DataTable, { columns: cols, rows: depts, rowKey: function (d) { return d.code; }, noun: "departments", onRowClick: function (d) { return openDept(d.code); } })));
};
var axisShort = function (v) { return (v >= 1e6 ? (v / 1e6).toFixed(2) + 'M' : v >= 1000 ? Math.round(v / 1000) + 'k' : String(v)); };
var TileCard = function (t) { return React.createElement(Tiles, { items: [t] }); };
/* ---------- Documents in EDRMS: documents over time ---------- */
var DocumentsDrill = function (_a) {
    var depts = _a.depts, openDept = _a.openDept, asOf = _a.asOf;
    var _b = React.useState('all'), year = _b[0], setYear = _b[1];
    var _c = React.useState('y'), by = _c[0], setBy = _c[1];
    var _d = React.useState('t'), show = _d[0], setShow = _d[1];
    var _e = React.useState('all'), dept = _e[0], setDept = _e[1];
    var series = React.useMemo(function () {
        var o = {};
        depts.forEach(function (d) { o[d.code] = documentSeries(d); });
        return o;
    }, [depts]);
    var idx = DOC_MONTHS.map(function (m, i) { return i; }).filter(function (i) { return year === 'all' || DOC_MONTHS[i].y === +year; });
    var list = dept === 'all' ? depts : depts.filter(function (d) { return d.code === dept; });
    var heldAt = function (i) { return sum(list, function (d) { return (i < 0 ? series[d.code].start : series[d.code].held[i]); }); };
    var groups = [];
    idx.forEach(function (i) {
        var key = by === 'y' ? String(DOC_MONTHS[i].y) : String(i), lab = by === 'y' ? String(DOC_MONTHS[i].y) : DOC_MONTHS[i].lab;
        var g = groups[groups.length - 1];
        if (!g || g.key !== key)
            groups.push({ key: key, lab: lab, first: i, last: i });
        else
            g.last = i;
    });
    var first = idx[0], last = idx[idx.length - 1];
    var endHeld = heldAt(last), added = endHeld - heldAt(first - 1);
    var items = groups.map(function (g) { return ({ key: g.key, label: g.lab, value: show === 't' ? heldAt(g.last) : heldAt(g.last) - heldAt(g.first - 1) }); });
    var period = year === 'all' ? 'all years' : year;
    var endLab = year === 'all' || year === '2026' ? asOf : 'Dec ' + year;
    var startLab = year === 'all' ? '2024' : year;
    var rows = depts.map(function (d) { return ({ d: d, start: first === 0 ? series[d.code].start : series[d.code].held[first - 1], end: series[d.code].held[last] }); });
    var cols = [
        { key: 'code', label: 'Department / Office / RM / RO', width: '30%', sortValue: function (r) { return r.d.code; }, render: function (r) { return React.createElement(DeptCell, { code: r.d.code, name: r.d.name }); } },
        { key: 'start', label: 'Total at start of ' + startLab, numeric: true, sortValue: function (r) { return r.start; }, render: function (r) { return F(r.start); } },
        { key: 'end', label: 'Total as of ' + endLab, numeric: true, sortValue: function (r) { return r.end; }, render: function (r) { return F(r.end); } },
        { key: 'new', label: 'New documents', numeric: true, sortValue: function (r) { return r.end - r.start; }, render: function (r) { return F(r.end - r.start); } },
        { key: 'gb', label: 'Storage used (GB)', numeric: true, sortValue: function (r) { return r.d.gb; }, render: function (r) { return r.d.gb.toFixed(1); } }
    ];
    var tS = sum(rows, function (r) { return r.start; }), tE = sum(rows, function (r) { return r.end; }), tGb = Math.round(sum(depts, function (d) { return d.gb; }));
    var deptOptions = [{ key: 'all', text: 'All Departments / Offices / RMs / ROs' }]
        .concat(depts.slice().sort(function (a, b) { return a.code.localeCompare(b.code); }).map(function (d) { return ({ key: d.code, text: d.code + ' - ' + d.name }); }));
    return (React.createElement(Panel, { title: "Documents over time", sub: "How many documents are stored in EDRMS, and how many new documents were added, by Department / Office / RM / RO." },
        React.createElement("div", { className: "ctl" },
            React.createElement("div", { className: "ctlG" },
                React.createElement("span", { className: "ctlL" }, "Year"),
                React.createElement(Segmented, { label: "Year", value: year, onChange: setYear, options: [{ key: '2024', text: '2024' }, { key: '2025', text: '2025' }, { key: '2026', text: '2026' }, { key: 'all', text: 'All' }] })),
            React.createElement("div", { className: "ctlG" },
                React.createElement("span", { className: "ctlL" }, "Show by"),
                React.createElement(Segmented, { label: "Show by", value: by, onChange: setBy, options: [{ key: 'y', text: 'Year' }, { key: 'm', text: 'Month' }] })),
            React.createElement("div", { className: "ctlG" },
                React.createElement("span", { className: "ctlL" }, "View"),
                React.createElement(Segmented, { label: "View", value: show, onChange: setShow, options: [{ key: 't', text: 'Total documents' }, { key: 'a', text: 'New documents' }] })),
            React.createElement("div", { className: "ctlG" },
                React.createElement("span", { className: "ctlL" }, "Department / Office / RM / RO"),
                React.createElement(Dropdown, { onRenderCaretDown: Caret, className: "picker", selectedKey: dept, options: deptOptions, onChange: function (_, o) { return o && setDept(String(o.key)); }, ariaLabel: "Department / Office / RM / RO" }))),
        React.createElement("div", { className: "tiles", style: { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' } }, [
            { label: 'Total documents as of ' + endLab, value: F(endHeld), info: TIP.totalDocs },
            { label: 'New documents in ' + period, value: F(added), info: TIP.newDocs },
            { label: 'Storage used (GB) as of ' + asOf, value: F(Math.round(sum(list, function (d) { return d.gb; }))), info: TIP.storage }
        ].map(function (t) { return React.createElement(TileCard, __assign({ key: t.label }, t)); })),
        React.createElement("div", { className: "legend" },
            React.createElement("span", null,
                React.createElement("i", { style: { background: '#0072BC' } }),
                (show === 't' ? 'Total documents at the end of each ' : 'New documents in each ') + (by === 'y' ? 'year' : 'month') + ', ' + period)),
        React.createElement(ColumnChart, { items: items, height: 260, valueLabel: axisShort, showValues: items.length <= 12, ariaLabel: "Documents in EDRMS by period" }),
        React.createElement("div", { className: "toolbar", style: { justifyContent: 'flex-end', marginTop: 8 } },
            React.createElement(ExportButton, { table: function () { return ({
                    name: 'Documents over time', head: cols.map(function (c) { return c.label; }),
                    rows: rows.map(function (r) { return [r.d.code + ' - ' + r.d.name, r.start, r.end, r.end - r.start, r.d.gb]; }),
                    total: ['All Departments / Offices / RMs / ROs', tS, tE, tE - tS, tGb]
                }); } })),
        React.createElement(DataTable, { columns: cols, rows: rows, rowKey: function (r) { return r.d.code; }, noun: "departments", defaultSort: "end", defaultDir: "desc", onRowClick: function (r) { return openDept(r.d.code); }, highlight: function (r) { return r.d.code === dept; }, jumpTo: function (sorted) { return (dept === 'all' ? undefined : Math.floor(sorted.findIndex(function (r) { return r.d.code === dept; }) / 10) + 1); }, totalRow: ['All Departments / Offices / RMs / ROs', F(tS), F(tE), F(tE - tS), F(tGb)] })));
};
/* ---------- Records declared in EDRMS ---------- */
var RecordsDrill = function (_a) {
    var depts = _a.depts, openDept = _a.openDept, usersDeclaring = _a.usersDeclaring;
    var D = sum(depts, function (d) { return d.docs; }), R = sum(depts, function (d) { return d.rec; });
    var cols = [
        deptColumn('26%'),
        num('docs', 'Documents', function (d) { return d.docs; }),
        num('rec', 'Records declared', function (d) { return d.rec; }),
        num('rate', 'Declaration rate', function (d) { return d.rec / d.docs; }, function (d) { return pct(d.rec, d.docs, 2); }),
        num('declaring', 'Unique users declaring records', function (d) { return d.declaring; })
    ];
    return (React.createElement(Panel, { title: "Total number of records declared in EDRMS, by Department, Office, RM or RO", sub: "Records declared and the people declaring them, by Department, Office, RM or RO." },
        React.createElement(Tiles, { items: [
                { label: 'Documents', value: F(D), info: TIP.docs },
                { label: 'Records declared', value: F(R), info: TIP.rec },
                { label: 'Declaration rate', value: pct(R, D, 2), info: TIP.declRate },
                { label: 'Unique users declaring records', value: F(usersDeclaring), info: TIP.declUsers }
            ] }),
        React.createElement("div", { className: "toolbar", style: { justifyContent: 'flex-end' } },
            React.createElement(ExportButton, { table: function () { return ({ name: 'Records declared by department', head: cols.map(function (c) { return c.label; }), rows: depts.map(function (d) { return [d.code + ' - ' + d.name, d.docs, d.rec, pct(d.rec, d.docs, 2), d.declaring]; }) }); } })),
        React.createElement(DataTable, { columns: cols, rows: depts, rowKey: function (d) { return d.code; }, noun: "departments", onRowClick: function (d) { return openDept(d.code); } })));
};
/* ---------- Physical counterparts ---------- */
var PhysicalPanel = function (_a) {
    var depts = _a.depts, openDept = _a.openDept;
    var f = useDeptQuery(depts);
    var inSel = filterDepts(depts, f.sel, '');
    var P = sum(inSel, function (d) { return d.phys; }), R = sum(inSel, function (d) { return d.rec; });
    var cols = [
        deptColumn('34%'),
        num('phys', 'Physical counterparts', function (d) { return d.phys; }),
        num('rec', 'Records declared', function (d) { return d.rec; }),
        num('share', 'Share of records with a counterpart', function (d) { return d.phys / d.rec; }, function (d) { return pct(d.phys, d.rec); })
    ];
    return (React.createElement(Panel, { title: "Total number of physical counterparts, by Department, Office, RM or RO.", sub: "Physical counterparts against declared records, by Department, Office, RM or RO." },
        React.createElement(Tiles, { items: [
                { label: 'Physical counterparts', value: F(P), info: TIP.phys },
                { label: 'Records declared', value: F(R), info: TIP.rec },
                { label: 'Share of records with a counterpart', value: pct(P, R), info: TIP.physShare }
            ] }),
        React.createElement("div", { className: "split", style: { gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)' } },
            React.createElement("div", { className: "box" },
                React.createElement("div", { className: "toolbar" },
                    React.createElement(Search, { value: f.q, onChange: f.setQ, placeholder: "Search by department / office / RM / RO" }),
                    React.createElement(DeptFilter, { depts: depts, selected: f.sel, onApply: f.setSel }),
                    React.createElement(ExportButton, { table: function () { return ({ name: 'Physical counterparts by department', head: cols.map(function (c) { return c.label; }), rows: f.rows.map(function (d) { return [d.code + ' - ' + d.name, d.phys, d.rec, pct(d.phys, d.rec)]; }) }); } })),
                React.createElement(DataTable, { columns: cols, rows: f.rows, rowKey: function (d) { return d.code; }, noun: "departments", resetKey: f.key, onRowClick: function (d) { return openDept(d.code); }, emptyText: "No department matches the search or filter." })),
            React.createElement("div", { className: "box" },
                React.createElement("div", { className: "donutWrap" },
                    React.createElement(Donut, { part: P, total: R, color: "#0072BC", rest: "#B9D7F2", caption: "of records have a physical counterpart" }),
                    React.createElement("table", { className: "donutLegend" },
                        React.createElement("tbody", null,
                            React.createElement("tr", null,
                                React.createElement("td", null,
                                    React.createElement("i", { style: { background: '#0072BC' } }),
                                    "With a physical counterpart"),
                                React.createElement("td", { className: "n" }, F(P)),
                                React.createElement("td", { className: "p" }, pct(P, R))),
                            React.createElement("tr", null,
                                React.createElement("td", null,
                                    React.createElement("i", { style: { background: '#B9D7F2' } }),
                                    "Without a physical counterpart"),
                                React.createElement("td", { className: "n" }, F(R - P)),
                                React.createElement("td", { className: "p" }, pct(R - P, R))))))))));
};
/* ---------- Comparison ---------- */
var ComparisonPanel = function (_a) {
    var depts = _a.depts, openDept = _a.openDept;
    var _b = React.useState('docs'), mode = _b[0], setMode = _b[1];
    var _c = React.useState('b'), sortKey = _c[0], setSortKey = _c[1];
    var _d = React.useState('desc'), dir = _d[0], setDir = _d[1];
    var _e = React.useState(1), page = _e[0], setPage = _e[1];
    var f = useDeptQuery(depts);
    React.useEffect(function () { return setPage(1); }, [f.key, mode]);
    var lbl = mode === 'docs' ? 'Documents in EDRMS' : 'Records declared in EDRMS';
    var bColor = mode === 'docs' ? '#2677D4' : '#5CA943';
    var val = function (d, k) { return (k === 'code' ? d.code : k === 'a' ? d.head : d[mode]); };
    var rows = f.rows.slice().sort(function (x, y) {
        var a = val(x, sortKey), b = val(y, sortKey);
        var r = typeof a === 'string' ? a.localeCompare(String(b)) : a - b;
        return (dir === 'asc' ? r : -r) || x.code.localeCompare(y.code);
    });
    var PER = 20, pages = Math.max(1, Math.ceil(rows.length / PER)), cur = Math.min(page, pages);
    var aMax = Math.max.apply(Math, __spreadArray([1], depts.map(function (d) { return d.head; }), false)), bMax = Math.max.apply(Math, __spreadArray([1], depts.map(function (d) { return d[mode]; }), false));
    var K = function (n) { return (n >= 10000 ? Math.round(n / 1000) + 'k' : F(n)); };
    var head = function (k, text, swatch) { return (React.createElement("button", { type: "button", "aria-sort": sortKey === k ? (dir === 'asc' ? 'ascending' : 'descending') : 'none', onClick: function () { if (sortKey === k)
            setDir(dir === 'asc' ? 'desc' : 'asc');
        else {
            setSortKey(k);
            setDir(k === 'code' ? 'asc' : 'desc');
        } setPage(1); } },
        swatch && React.createElement("i", { style: { background: swatch } }),
        text,
        sortKey === k ? (dir === 'asc' ? ' ↑' : ' ↓') : '')); };
    var modes = [{ key: 'docs', text: 'Approximate headcount against documents in EDRMS' }, { key: 'rec', text: 'Approximate headcount against records declared in EDRMS' }];
    return (React.createElement(Panel, { title: "Compare Departments, Offices, RMs and ROs", sub: "Approximate headcount provided by RAC, compared with ".concat(lbl.charAt(0).toLowerCase() + lbl.slice(1), ". Each column has its own scale.") },
        React.createElement("div", { className: "toolbar", style: { justifyContent: 'space-between' } },
            React.createElement("span", { style: { display: 'flex', alignItems: 'center', gap: 10 } },
                React.createElement("span", { className: "lbl" }, "Compare"),
                React.createElement(Dropdown, { onRenderCaretDown: Caret, className: "picker", style: { minWidth: 330 }, selectedKey: mode, options: modes, onChange: function (_, o) { return o && setMode(o.key); }, ariaLabel: "Compare" })),
            React.createElement("span", { style: { display: 'flex', alignItems: 'center', gap: 10, flex: '0 1 420px' } },
                React.createElement(Search, { value: f.q, onChange: f.setQ, placeholder: "Search by department / office / RM / RO" }),
                React.createElement(DeptFilter, { depts: depts, selected: f.sel, onApply: f.setSel }))),
        React.createElement("div", { className: "cmpH" },
            head('code', 'Department / Office / RM / RO'),
            head('a', 'Approximate headcount', '#0F9F87'),
            head('b', lbl, bColor)),
        rows.length ? rows.slice((cur - 1) * PER, cur * PER).map(function (d) { return (React.createElement("div", { className: "cmpR", key: d.code, role: "button", tabIndex: 0, style: { cursor: 'pointer' }, onClick: function () { return openDept(d.code); }, onKeyDown: function (e) { if (e.key === 'Enter')
                openDept(d.code); } },
            React.createElement(DeptCell, { code: d.code, name: d.name }),
            React.createElement("div", { className: "cmpTrack" },
                React.createElement("div", { className: "cmpBar", title: 'Approximate headcount: ' + F(d.head), style: { width: (d.head / aMax) * 100 + '%', background: '#0F9F87' } }, K(d.head))),
            React.createElement("div", { className: "cmpTrack" },
                React.createElement("div", { className: "cmpBar", title: lbl + ': ' + F(d[mode]), style: { width: (d[mode] / bMax) * 100 + '%', background: bColor } }, K(d[mode]))))); }) : React.createElement("p", { className: "note", style: { padding: 16 } }, "No department matches the search or filter."),
        React.createElement(Pager, { total: rows.length, page: cur, size: PER, noun: "departments", onPage: setPage })));
};
var PRESETS = [
    { key: '3', text: 'Last 3 months' }, { key: '6', text: 'Last 6 months' }, { key: '12', text: 'Last 12 months' },
    { key: 'ytd', text: 'Year to date' }, { key: 'all', text: 'All time' }
];
var TrendPanel = function (_a) {
    var data = _a.data;
    var t = data.trend, K = t.keys, last = K.length - 1;
    var _b = React.useState('12'), mode = _b[0], setMode = _b[1];
    var _c = React.useState([K[Math.max(0, last - 11)], t.to]), range = _c[0], setRange = _c[1];
    var _d = React.useState(['', '']), draft = _d[0], setDraft = _d[1];
    var _e = React.useState('m'), view = _e[0], setView = _e[1];
    var _f = React.useState(null), year = _f[0], setYear = _f[1];
    var preset = function (p) {
        var y = t.to.slice(0, 4) + '-01-01';
        var r = p === 'all' ? [t.from, t.to] : p === 'ytd' ? [y < t.from ? t.from : y, t.to] : [K[Math.max(0, last - Number(p) + 1)], t.to];
        setMode(p);
        setRange(r);
        setDraft(['', '']);
        setYear(null);
    };
    var apply = function () {
        var a = draft[0], b = draft[1];
        if (!a)
            a = t.from;
        if (!b)
            b = t.to;
        if (b < a)
            b = a;
        setMode('custom');
        setRange([a, b]);
        setYear(null);
    };
    var fm = range[0].slice(0, 7), tm = range[1].slice(0, 7);
    var inRange = K.map(function (k, i) { return ({ k: k, i: i }); }).filter(function (m) { return m.k.slice(0, 7) >= fm && m.k.slice(0, 7) <= tm; });
    var v = view === 'm' && inRange.length > 24 ? 'y' : view;
    var drill = v === 'y' && year && inRange.some(function (m) { return m.k.slice(0, 4) === year; }) ? year : null;
    var used = drill ? inRange.filter(function (m) { return m.k.slice(0, 4) === drill; }) : inRange;
    var gv = drill ? 'm' : v;
    var groups = [];
    used.forEach(function (m) {
        var key = gv === 'y' ? m.k.slice(0, 4) : m.k;
        var label = gv === 'y' ? key : drill ? t.labels[m.i].replace(/\s*'?\d{2,4}$/, '') : t.labels[m.i];
        var g = groups[groups.length - 1];
        if (!g || g.key !== key)
            groups.push({ key: key, label: label, value: t.values[m.i] });
        else
            g.value += t.values[m.i];
    });
    var total = sum(groups, function (g) { return g.value; });
    var unit = gv === 'y' ? 'year' : 'month';
    var canDrill = gv === 'y' && !drill;
    /* The last day a reader can pick is the data's refresh date, the date in "Data as of". */
    var today = refreshIso();
    return (React.createElement(Panel, { title: "Records declared over time", sub: "Records declared on EDRMS compliant sites, by declaration date." },
        React.createElement("div", { className: "ctl" },
            React.createElement("div", { className: "ctlG" },
                React.createElement("span", { className: "ctlL" }, "Preset"),
                React.createElement(Segmented, { label: "Preset", value: mode, onChange: preset, options: PRESETS })),
            React.createElement("div", { className: "ctlG" },
                React.createElement("span", { className: "ctlL" }, "Custom range"),
                React.createElement("div", { className: "ctlRow" },
                    React.createElement("input", { className: "date", type: "date", "aria-label": "From", min: t.from, max: today, value: draft[0], onChange: function (e) { return setDraft([e.target.value, draft[1]]); } }),
                    React.createElement("span", { className: "lbl", style: { fontSize: 12, color: '#6B7A8C' } }, "to"),
                    React.createElement("input", { className: "date", type: "date", "aria-label": "To", min: draft[0] || t.from, max: today, value: draft[1], onChange: function (e) { return setDraft([draft[0], e.target.value]); } }),
                    React.createElement("button", { type: "button", className: "btn primary", disabled: !draft[0] && !draft[1], onClick: apply }, "Apply"),
                    React.createElement("button", { type: "button", className: "btn", onClick: function () { return preset('12'); } }, "Reset"))),
            React.createElement("div", { className: "ctlG" },
                React.createElement("span", { className: "ctlL" }, "Show by"),
                React.createElement(Segmented, { label: "Show by", value: view, onChange: function (x) { setView(x); setYear(null); }, options: [{ key: 'y', text: 'Year' }, { key: 'm', text: 'Month' }] }))),
        React.createElement("p", { className: "note" }, mode === 'custom' ? 'Custom range in use. Choosing a preset clears it.' : 'Preset in use: ' + (PRESETS.find(function (p) { return p.key === mode; }) || PRESETS[2]).text + '. Applying a custom range clears it.'),
        used.length ? (React.createElement(React.Fragment, null,
            React.createElement(Tiles, { items: [{ label: drill ? 'Records declared in ' + drill : 'Records declared in range', value: F(total) }] }),
            React.createElement("div", { className: "legend" },
                React.createElement("span", null,
                    React.createElement("i", { style: { background: '#5CA943' } }),
                    "Records declared per ",
                    unit,
                    " (left axis)"),
                React.createElement("span", null,
                    React.createElement("i", { className: "ln", style: { background: '#0072BC' } }),
                    "Running total in ",
                    drill || 'range',
                    " (right axis)"),
                drill && React.createElement("span", { className: "crumb" },
                    React.createElement("a", { onClick: function () { return setYear(null); } }, "All years"),
                    " \u203A ",
                    React.createElement("b", null, drill)),
                canDrill && React.createElement("span", { className: "crumb" }, "Click a year to see its months")),
            React.createElement(ComboChart, { items: groups, onClick: canDrill ? setYear : undefined, ariaLabel: 'Records declared per ' + unit + ' with running total' }))) : React.createElement("p", { className: "note" }, "No month with records falls inside this range.")));
};
export var BankWide = function (_a) {
    var data = _a.data, openDept = _a.openDept, bandTools = _a.bandTools;
    var depts = data.depts;
    var _b = React.useState('sites'), open = _b[0], setOpen = _b[1];
    var totals = {
        sites: sum(depts, function (d) { return d.sites; }),
        head: roundedHead(depts),
        docs: sum(depts, function (d) { return d.docs; }),
        rec: sum(depts, function (d) { return d.rec; })
    };
    var kpis = [
        { key: 'sites', label: 'Active EDRMS sites', value: F(totals.sites), info: 'Compliant and active in Cloud Governance' },
        { key: 'users', label: 'EDRMS users', value: F(totals.head), info: 'Approximate workforce headcount' },
        { key: 'docs', label: 'Documents in EDRMS', value: short(totals.docs), info: 'All files on EDRMS sites' },
        { key: 'rec', label: 'Records declared in EDRMS', value: F(totals.rec), info: 'Declared as records via EDRMS' }
    ];
    return (React.createElement("div", { className: "dash-bw" },
        React.createElement(Band, { title: "Bank-wide oversight", text: "EDRMS adoption across ADB: sites, users, documents and declared records", tools: bandTools }),
        React.createElement(KpiRow, { items: kpis, open: open, onOpen: setOpen }),
        open === 'sites' && React.createElement(SitesDrill, { depts: depts, openDept: openDept }),
        open === 'users' && React.createElement(UsersDrill, { depts: depts, openDept: openDept }),
        open === 'docs' && React.createElement(DocumentsDrill, { depts: depts, openDept: openDept, asOf: data.asOf }),
        open === 'rec' && React.createElement(RecordsDrill, { depts: depts, openDept: openDept, usersDeclaring: data.totals.usersDeclaring }),
        React.createElement(Band, { title: "Physical counterparts", text: "Declared records that also exist on paper, and their share of all declared records." }),
        React.createElement(PhysicalPanel, { depts: depts, openDept: openDept }),
        React.createElement(Band, { title: "Comparison", text: "Documents and records declared, set against the approximate headcount of each Department, Offices, RMs and ROs, provided by RAC." }),
        React.createElement(ComparisonPanel, { depts: depts, openDept: openDept }),
        React.createElement(Band, { title: "Records declaration trend", text: "Records declared over time, per period and as a running total, for a date range you choose." }),
        React.createElement(TrendPanel, { data: data })));
};
//# sourceMappingURL=BankWide.js.map