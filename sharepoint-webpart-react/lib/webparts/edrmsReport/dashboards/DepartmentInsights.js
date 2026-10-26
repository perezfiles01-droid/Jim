import { __assign, __spreadArray } from "tslib";
import * as React from 'react';
import { Dropdown } from '@fluentui/react';
import { CategoryBar, Multi } from '../components/CategoryBar';
import { sum, visitorSplit, siteCreated, ownerName, ownerInitials, libraryExtras } from '../lib/data';
import { F, pct, refreshIso } from '../lib/format';
import { Band, Panel, KpiRow, Search, Segmented, ExportButton, Chip, SumCard, Caret } from '../components/ui';
import { DataTable } from '../components/DataTable';
import { BarList, ColumnChart } from '../components/charts';
var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var fmtDate = function (d) { return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); };
/* ---------- pickers ---------- */
/** Sites inside the chosen departments. An empty list means all of them.
 *  26 Oct 2026: the same box as Category / Sub-category / Sub-group, so the
 *  1,032 site list has a search field too. */
var SitePicker = function (_a) {
    var sites = _a.sites, value = _a.value, onChange = _a.onChange;
    return (React.createElement(Multi, { label: "Site", values: sites.map(function (s) { return s.name; }), value: value, allText: 'All ' + F(sites.length) + ' sites', onChange: onChange, summary: function (v) { return (v.length === 1 ? v[0] : F(v.length) + ' sites'); } }));
};
function sitesOf(data, codes) {
    var list = codes.length ? data.depts.filter(function (d) { return codes.indexOf(d.code) >= 0; }) : data.depts;
    return list.reduce(function (a, d) { return a.concat(data.sites[d.code] || []); }, []);
}
/* ---------- Go-Live date and site convention ---------- */
var ProfileStrip = function (_a) {
    var codes = _a.codes;
    var one = codes.length === 1 ? codes[0] : null;
    var date = 'Varies by department';
    if (one) {
        var s = 0;
        for (var i = 0; i < one.length; i++)
            s = (s * 31 + one.charCodeAt(i)) % 997;
        date = (1 + (s % 28)) + ' ' + MONTHS[s % 12] + ' ' + (2024 + (s % 2));
    }
    return (React.createElement("div", { className: "strip" },
        React.createElement("div", { className: "chipCard" },
            React.createElement("div", { className: "ic" },
                React.createElement("svg", { viewBox: "0 0 24 24" },
                    React.createElement("rect", { x: "3", y: "5", width: "18", height: "16", rx: "2" }),
                    React.createElement("path", { d: "M3 10h18M8 3v4M16 3v4" }))),
            React.createElement("div", null,
                React.createElement("div", { className: "k" }, "Go-Live date"),
                React.createElement("div", { className: "v" }, date),
                React.createElement("div", { className: "h" }, "When this department started using EDRMS"))),
        React.createElement("div", { className: "chipCard" },
            React.createElement("div", { className: "ic" },
                React.createElement("svg", { viewBox: "0 0 24 24" },
                    React.createElement("path", { d: "M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" }),
                    React.createElement("path", { d: "M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" }))),
            React.createElement("div", null,
                React.createElement("div", { className: "k" }, "Site convention"),
                one
                    ? React.createElement(React.Fragment, null,
                        React.createElement("a", { href: "#", onClick: function (e) { return e.preventDefault(); }, title: "Link to be provided by RAC" }, "View guide \u2197"),
                        React.createElement("div", { className: "h" }, "Approved naming for sites, libraries and folders"))
                    : React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "v muted" }, "Select a department"),
                        React.createElement("div", { className: "h" }, "Each department has its own approved guide"))))));
};
/* ---------- EDRMS sites: who owns them and when they were created ---------- */
var SitesCreated = function (_a) {
    var sites = _a.sites, resetKey = _a.resetKey;
    var now = new Date(), minD = new Date(2024, 0, 1), maxD = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var _b = React.useState('all'), year = _b[0], setYear = _b[1];
    var _c = React.useState(['', '']), draft = _c[0], setDraft = _c[1];
    var _d = React.useState(null), custom = _d[0], setCustom = _d[1];
    var _e = React.useState(null), period = _e[0], setPeriod = _e[1];
    var _f = React.useState(''), q = _f[0], setQ = _f[1];
    var rows = React.useMemo(function () { return sites.map(function (s) { return ({ s: s, dt: siteCreated(s) }); }); }, [sites]);
    var parse = function (v) { return (v ? new Date(+v.slice(0, 4), +v.slice(5, 7) - 1, +v.slice(8, 10)) : null); };
    var a = null, b = null, g = 'y';
    if (custom) {
        a = parse(custom[0]) || minD;
        b = parse(custom[1]) || maxD;
        if (b < a) {
            var t = a;
            a = b;
            b = t;
        }
        b = new Date(b.getFullYear(), b.getMonth(), b.getDate(), 23, 59, 59);
        g = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()) + 1 <= 24 ? 'm' : 'y';
    }
    else if (year !== 'all') {
        a = new Date(+year, 0, 1);
        b = new Date(+year, 11, 31, 23, 59, 59);
        g = 'm';
    }
    var keyOf = function (d) { return (g === 'y' ? String(d.getFullYear()) : d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2)); };
    var labOf = function (k) { return (g === 'y' ? k : MONTHS[+k.slice(5) - 1] + " '" + k.slice(2, 4)); };
    var inRange = rows.filter(function (r) { return (!a || r.dt >= a) && (!b || r.dt <= b); });
    var periods = [];
    var pa = a && a > minD ? a : minD, pb = b && b < maxD ? b : maxD;
    if (g === 'y')
        for (var y = pa.getFullYear(); y <= pb.getFullYear(); y++)
            periods.push(String(y));
    else
        for (var d = new Date(pa.getFullYear(), pa.getMonth(), 1); d <= pb; d = new Date(d.getFullYear(), d.getMonth() + 1, 1))
            periods.push(keyOf(d));
    var counts = periods.map(function (p) { return ({ key: p, label: g === 'y' ? p : periods.length <= 14 ? MONTHS[+p.slice(5) - 1] : labOf(p), value: inRange.filter(function (r) { return keyOf(r.dt) === p; }).length }); });
    var term = q.trim().toLowerCase();
    var shown = inRange.filter(function (r) { return (!period || keyOf(r.dt) === period) &&
        (!term || (r.s.name + ' ' + r.s.owner + ' ' + ownerName(r.s.owner)).toLowerCase().indexOf(term) >= 0); });
    var cols = [
        { key: 'name', label: 'Site', width: '46%', sortValue: function (r) { return r.s.name; }, render: function (r) { return r.s.name; }, className: 'strong' },
        { key: 'owner', label: 'Site owner', width: '30%', sortValue: function (r) { return ownerName(r.s.owner); }, render: function (r) { return React.createElement("span", { title: r.s.owner },
                React.createElement("span", { className: "av" }, ownerInitials(r.s.owner)),
                ownerName(r.s.owner)); } },
        { key: 'created', label: 'Created', sortValue: function (r) { return r.dt.getTime(); }, render: function (r) { return fmtDate(r.dt); } }
    ];
    var years = [];
    for (var y = maxD.getFullYear(); y >= 2024; y--)
        years.push(String(y));
    var clickBar = function (k) { if (g === 'y' && !custom) {
        setYear(k);
        setPeriod(null);
    }
    else
        setPeriod(period === k ? null : k); };
    var title = custom ? 'Sites created, selected range' : year !== 'all' ? 'Sites created in ' + year : 'Sites created over time';
    return (React.createElement(Panel, { title: "EDRMS sites", sub: "Each EDRMS site, who owns it, and when it was created." },
        React.createElement("div", { className: "ctl", style: { justifyContent: 'flex-start' } },
            React.createElement("div", { className: "ctlG" },
                React.createElement("span", { className: "ctlL" }, "Year"),
                React.createElement(Dropdown, { onRenderCaretDown: Caret, className: "picker", style: { minWidth: 130 }, selectedKey: year, ariaLabel: "Year", options: [{ key: 'all', text: 'All years' }].concat(years.map(function (y) { return ({ key: y, text: y }); })), onChange: function (_, o) { if (o) {
                        setYear(String(o.key));
                        setCustom(null);
                        setDraft(['', '']);
                        setPeriod(null);
                    } } })),
            React.createElement("div", { className: "ctlG" },
                React.createElement("span", { className: "ctlL" }, "Custom range"),
                React.createElement("div", { className: "ctlRow" },
                    React.createElement("input", { className: "date", type: "date", "aria-label": "From", min: "2024-01-01", max: refreshIso(), value: draft[0], onChange: function (e) { return setDraft([e.target.value, draft[1]]); } }),
                    React.createElement("span", { style: { fontSize: 12, color: '#6B7A8C' } }, "to"),
                    React.createElement("input", { className: "date", type: "date", "aria-label": "To", min: draft[0] || '2024-01-01', max: refreshIso(), value: draft[1], onChange: function (e) { return setDraft([draft[0], e.target.value]); } }),
                    React.createElement("button", { type: "button", className: "btn primary", disabled: !draft[0] && !draft[1], onClick: function () { setCustom(draft); setYear('all'); setPeriod(null); } }, "Apply"),
                    React.createElement("button", { type: "button", className: "btn", onClick: function () { setYear('all'); setCustom(null); setDraft(['', '']); setPeriod(null); } }, "Reset")))),
        React.createElement("div", { className: "split" },
            React.createElement("div", { className: "box" },
                React.createElement("div", { className: "toolbar" },
                    React.createElement(Search, { value: q, onChange: setQ, placeholder: "Search a site or owner" }),
                    period && React.createElement(Chip, { text: 'Created: ' + labOf(period), onClear: function () { return setPeriod(null); } }),
                    React.createElement(ExportButton, { table: function () { return ({ name: 'EDRMS sites', head: ['Site', 'Site owner', 'Created'], rows: shown.map(function (r) { return [r.s.name, ownerName(r.s.owner), fmtDate(r.dt)]; }) }); } })),
                React.createElement(DataTable, { columns: cols, rows: shown, rowKey: function (r) { return r.s.name; }, noun: "sites", resetKey: resetKey + q + period + year + String(custom), emptyText: "No sites match." })),
            React.createElement("div", { className: "box" },
                React.createElement("div", { className: "boxHd" },
                    React.createElement("div", null,
                        React.createElement("div", { className: "boxT" }, title),
                        React.createElement("div", { className: "boxS" }, g === 'y' ? 'Click a year to see its months.' : 'Click a month to see the sites created then.')),
                    !custom && year !== 'all' && React.createElement("span", { className: "crumb" },
                        React.createElement("a", { onClick: function () { setYear('all'); setPeriod(null); } }, "All years"),
                        " \u203A ",
                        React.createElement("b", null, year))),
                React.createElement(ColumnChart, { items: counts, width: 560, height: 430, selected: period, onClick: clickBar, ariaLabel: "Sites created over time" })))));
};
/** Ties are compared as they are shown, so 0.4 GB and 0.43 GB count as different. */
function tieValue(m, r) { return m.fmt(r); }
function useTopPick(rows, metric, alt) {
    var _a = React.useState(null), sel = _a[0], setSel = _a[1];
    var _b = React.useState(null), tie = _b[0], setTie = _b[1];
    var top = rows.slice().sort(function (a, b) { return metric.get(b) - metric.get(a) || alt(b) - alt(a) || a.name.localeCompare(b.name); }).slice(0, 10);
    var more = 0;
    if (top.length === 10) {
        var k_1 = tieValue(metric, top[9]), shown_1 = top.map(function (r) { return r.name; });
        more = rows.filter(function (r) { return tieValue(metric, r) === k_1 && shown_1.indexOf(r.name) < 0; }).length;
    }
    var match = function (r) { return (!sel || r.name === sel) && (!tie || tieValue(metric, r) === tie); };
    return { top: top, more: more, sel: sel, setSel: function (v) { setSel(v); setTie(null); }, tie: tie, setTie: function (v) { setTie(v); setSel(null); }, match: match };
}
var siteCol = { key: 'name', label: 'Site', sortValue: function (s) { return s.name; }, render: function (s) { return s.name; }, className: 'strong' };
var short = function (s) { return s.name.replace(/ Site$/, ''); };
var DOCS_SPEC = {
    title: 'Documents',
    sub: function (sites) { var gb = sum(sites, function (s) { return s.gb; }); return React.createElement(React.Fragment, null,
        "Files stored in each EDRMS site, and the storage they use. Total storage: ",
        React.createElement("b", null, gb >= 1000 ? (gb / 1000).toFixed(2) + ' TB' : gb.toFixed(1) + ' GB'),
        "."); },
    columns: [siteCol,
        { key: 'docs', label: 'Documents', numeric: true, width: '120px', sortValue: function (s) { return s.docs; }, render: function (s) { return F(s.docs); } },
        { key: 'gb', label: 'Storage (GB)', numeric: true, width: '120px', sortValue: function (s) { return s.gb; }, render: function (s) { return s.gb.toFixed(1); } }],
    metrics: [
        { key: 'docs', seg: 'Documents', get: function (s) { return s.docs; }, fmt: function (s) { return F(s.docs); }, noun: 'documents', chartTitle: 'Sites with the most documents', chartSub: 'Top 10 by number of documents. Click a bar to find it in the table.', chip: function (v) { return 'Documents: ' + v; } },
        { key: 'gb', seg: 'Storage', get: function (s) { return s.gb; }, fmt: function (s) { return s.gb.toFixed(1) + ' GB'; }, noun: 'of storage', chartTitle: 'Sites using the most storage', chartSub: 'Top 10 by storage used. Click a bar to find it in the table.', chip: function (v) { return 'Storage: ' + v; } }
    ],
    exportHead: ['Site', 'Documents', 'Storage (GB)'],
    exportRow: function (s) { return [s.name, s.docs, s.gb]; }
};
var REC_SPEC = {
    title: 'Records declared',
    sub: function () { return 'Records declared in each EDRMS site, and the people who declared them.'; },
    columns: [siteCol,
        { key: 'rec', label: 'Records', numeric: true, width: '110px', sortValue: function (s) { return s.rec; }, render: function (s) { return F(s.rec); } },
        { key: 'declaring', label: 'People who declared', numeric: true, width: '160px', sortValue: function (s) { return s.declaring; }, render: function (s) { return F(s.declaring); } }],
    metrics: [
        { key: 'rec', seg: 'Records', get: function (s) { return s.rec; }, fmt: function (s) { return F(s.rec); }, noun: 'records', chartTitle: 'Sites with the most records', chartSub: 'Top 10 by records declared. Click a bar to find it in the table.', chip: function (v) { return 'Records: ' + v; } },
        { key: 'declaring', seg: 'People', get: function (s) { return s.declaring; }, fmt: function (s) { return F(s.declaring); }, noun: 'people declaring', chartTitle: 'Sites with the most people declaring', chartSub: 'Top 10 by people who declared. Click a bar to find it in the table.', chip: function (v) { return 'People who declared: ' + v; } }
    ],
    exportHead: ['Site', 'Records', 'People who declared'],
    exportRow: function (s) { return [s.name, s.rec, s.declaring]; }
};
var share = function (s) { return (s.rec ? s.phys / s.rec : 0); };
var PHYS_SPEC = {
    title: 'Physical Counterparts',
    sub: function () { return 'Records in each EDRMS site that also have a paper or physical version.'; },
    columns: [siteCol,
        { key: 'phys', label: 'Physical Counterparts', numeric: true, width: '170px', sortValue: function (s) { return s.phys; }, render: function (s) { return F(s.phys); } },
        { key: 'rec', label: 'Records', numeric: true, width: '100px', sortValue: function (s) { return s.rec; }, render: function (s) { return F(s.rec); } },
        { key: 'share', label: 'Share', numeric: true, width: '90px', sortValue: share, render: function (s) { return (share(s) * 100).toFixed(1) + '%'; } }],
    metrics: [
        { key: 'phys', seg: 'Count', get: function (s) { return s.phys; }, fmt: function (s) { return F(s.phys); }, noun: 'physical counterparts', chartTitle: 'Sites with the most physical counterparts', chartSub: 'Top 10 by number of physical counterparts. Click a bar to find it in the table.', chip: function (v) { return 'Physical Counterparts: ' + v; } },
        { key: 'share', seg: 'Share', get: share, fmt: function (s) { return (share(s) * 100).toFixed(1) + '%'; }, noun: 'share', chartTitle: 'Sites with the highest share', chartSub: 'Top 10 by share of records with a physical counterpart. Click a bar to find it in the table.', chip: function (v) { return 'Share: ' + v; } }
    ],
    exportHead: ['Site', 'Physical Counterparts', 'Records', 'Share'],
    exportRow: function (s) { return [s.name, s.phys, s.rec, (share(s) * 100).toFixed(1) + '%']; }
};
var MetricDrill = function (_a) {
    var sites = _a.sites, resetKey = _a.resetKey, spec = _a.spec;
    var _b = React.useState(spec.metrics[0].key), mk = _b[0], setMk = _b[1];
    var _c = React.useState(''), q = _c[0], setQ = _c[1];
    var m = spec.metrics.find(function (x) { return x.key === mk; }) || spec.metrics[0];
    var other = spec.metrics.find(function (x) { return x !== m; }) || m;
    var t = useTopPick(sites, m, other.get);
    React.useEffect(function () { t.setSel(null); }, [resetKey, mk]);
    var term = q.trim().toLowerCase();
    var rows = sites.filter(function (s) { return t.match(s) && (!term || s.name.toLowerCase().indexOf(term) >= 0); });
    var chip = t.sel || (t.tie ? m.chip(t.tie) : null);
    return (React.createElement(Panel, { title: spec.title, sub: spec.sub(sites) },
        React.createElement("div", { className: "split" },
            React.createElement("div", { className: "box" },
                React.createElement("div", { className: "toolbar" },
                    React.createElement(Search, { value: q, onChange: setQ, placeholder: "Search a site" }),
                    chip && React.createElement(Chip, { text: chip, onClear: function () { return t.setSel(null); } }),
                    React.createElement(ExportButton, { table: function () { return ({ name: spec.title, head: spec.exportHead, rows: rows.map(spec.exportRow) }); } })),
                React.createElement(DataTable, { columns: spec.columns, rows: rows, rowKey: function (s) { return s.name; }, noun: "sites", resetKey: resetKey + q + chip, highlight: function (s) { return s.name === t.sel; }, emptyText: "No sites match." })),
            React.createElement("div", { className: "box" },
                React.createElement("div", { className: "boxHd" },
                    React.createElement("div", null,
                        React.createElement("div", { className: "boxT" }, m.chartTitle),
                        React.createElement("div", { className: "boxS" }, m.chartSub)),
                    React.createElement(Segmented, { label: "Measure", value: mk, onChange: setMk, options: spec.metrics.map(function (x) { return ({ key: x.key, text: x.seg }); }) })),
                React.createElement(BarList, { selected: t.sel, onSelect: t.setSel, items: t.top.map(function (s) { return ({ key: s.name, name: short(s), value: m.get(s), label: m.fmt(s), title: s.name + ': ' + m.fmt(s) }); }), more: t.more ? { text: "+ ".concat(F(t.more), " more site").concat(t.more > 1 ? 's' : '', " with ").concat(m.fmt(t.top[9]), " ").concat(m.noun), onClick: function () { return t.setTie(tieValue(m, t.top[9])); } } : undefined })))));
};
var VisitorsDrill = function (_a) {
    var sites = _a.sites, resetKey = _a.resetKey;
    var rows = React.useMemo(function () { return sites.map(function (s) { return (__assign(__assign(__assign({}, s), visitorSplit(s)), { stype: /Project/.test(s.ermsType) ? 'Project' : 'Traditional' })); }); }, [sites]);
    var _b = React.useState('visitors'), mk = _b[0], setMk = _b[1];
    var _c = React.useState(''), q = _c[0], setQ = _c[1];
    var noun = { visitors: 'unique visitors', internal: 'internal visitors', external: 'external visitors' }[mk];
    var metric = { key: mk, seg: '', get: function (r) { return r[mk]; }, fmt: function (r) { return F(r[mk]); }, noun: noun, chartTitle: '', chartSub: '', chip: function (v) { return ({ visitors: 'Unique visitors', internal: 'Internal', external: 'External' }[mk]) + ': ' + v; } };
    var t = useTopPick(rows, metric, function (r) { return r.visitors; });
    React.useEffect(function () { t.setSel(null); }, [resetKey, mk]);
    var T = sum(rows, function (r) { return r.visitors; }), TI = sum(rows, function (r) { return r.internal; }), TE = T - TI;
    var term = q.trim().toLowerCase();
    var shown = rows.filter(function (r) { return t.match(r) && (!term || r.name.toLowerCase().indexOf(term) >= 0); });
    var pc = function (a, b) { return (b ? Math.round((a / b) * 100) : 0) + '%'; };
    var cols = [
        { key: 'name', label: 'Site', sortValue: function (r) { return r.name; }, render: function (r) { return r.name; }, className: 'strong' },
        { key: 'stype', label: 'Site type', width: '110px', sortValue: function (r) { return r.stype; }, render: function (r) { return React.createElement("span", { className: 'type ' + (r.stype === 'Project' ? 'p' : 't') }, r.stype); } },
        { key: 'visitors', label: 'Unique visitors', numeric: true, width: '120px', sortValue: function (r) { return r.visitors; }, render: function (r) { return F(r.visitors); } },
        { key: 'internal', label: 'Internal (#, %)', numeric: true, width: '120px', sortValue: function (r) { return r.internal; }, render: function (r) { return React.createElement(React.Fragment, null,
                F(r.internal),
                React.createElement("span", { className: "muted" },
                    "(",
                    pc(r.internal, r.visitors),
                    ")")); } },
        { key: 'external', label: 'External (#, %)', numeric: true, width: '120px', sortValue: function (r) { return r.external; }, render: function (r) { return React.createElement(React.Fragment, null,
                F(r.external),
                React.createElement("span", { className: "muted" },
                    "(",
                    pc(r.external, r.visitors),
                    ")")); } }
    ];
    var chip = t.sel || (t.tie ? metric.chip(t.tie) : null);
    return (React.createElement(Panel, { title: "Site visitors", sub: "Number of people who opened each site in the last 180 days. A person who visits many times is counted once." },
        React.createElement("div", { className: "sumRow", style: { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' } },
            React.createElement(SumCard, { label: "Unique visitors", value: F(T), info: "The number of different people who opened at least one EDRMS site in the last 180 days. A person who opened several sites is counted once." },
                React.createElement("div", { className: "split2" },
                    React.createElement("span", { style: { width: (T ? TI / T * 100 : 0) + '%', background: '#0072BC' } }),
                    React.createElement("span", { style: { width: (T ? TE / T * 100 : 0) + '%', background: '#D97706' } }))),
            React.createElement(SumCard, { label: "Internal visitors", swatch: "#0072BC", value: React.createElement(React.Fragment, null,
                    F(TI),
                    React.createElement("small", null, pct(TI, T))), hint: "People with an ADB account" }),
            React.createElement(SumCard, { label: "External visitors", swatch: "#D97706", value: React.createElement(React.Fragment, null,
                    F(TE),
                    React.createElement("small", null, pct(TE, T))), hint: "Guests and people without an ADB account" })),
        React.createElement("div", { className: "split" },
            React.createElement("div", { className: "box" },
                React.createElement("div", { className: "toolbar" },
                    React.createElement(Search, { value: q, onChange: setQ, placeholder: "Search a site" }),
                    chip && React.createElement(Chip, { text: chip, onClear: function () { return t.setSel(null); } }),
                    React.createElement(ExportButton, { table: function () { return ({ name: 'Site visitors', head: ['Site', 'Site type', 'Unique visitors', 'Internal', 'External'], rows: shown.map(function (r) { return [r.name, r.stype, r.visitors, r.internal, r.external]; }) }); } })),
                React.createElement(DataTable, { columns: cols, rows: shown, rowKey: function (r) { return r.name; }, noun: "sites", resetKey: resetKey + q + chip, highlight: function (r) { return r.name === t.sel; }, emptyText: "No sites match." })),
            React.createElement("div", { className: "box" },
                React.createElement("div", { className: "boxHd" },
                    React.createElement("div", null,
                        React.createElement("div", { className: "boxT" }, "Most visited sites"),
                        React.createElement("div", { className: "boxS" },
                            "Top 10 by ",
                            noun,
                            ". Click a bar to find it in the table.")),
                    React.createElement(Segmented, { label: "Visitors", value: mk, onChange: setMk, options: [{ key: 'visitors', text: 'All' }, { key: 'internal', text: 'Internal' }, { key: 'external', text: 'External' }] })),
                React.createElement(BarList, { selected: t.sel, onSelect: t.setSel, color: mk === 'external' ? '#D97706' : undefined, items: t.top.map(function (r) { return ({ key: r.name, name: short(r), value: r[mk], label: F(r[mk]), title: "".concat(r.name, ": ").concat(F(r.visitors), " visitors (").concat(F(r.internal), " internal, ").concat(F(r.external), " external)") }); }), more: t.more ? { text: "+ ".concat(F(t.more), " more site").concat(t.more > 1 ? 's' : '', " with ").concat(F(t.top[9][mk]), " ").concat(noun), onClick: function () { return t.setTie(F(t.top[9][mk])); } } : undefined })))));
};
var LIB_LABEL = { folders: 'folders', docs: 'documents', rec: 'records declared', phys: 'physical counterparts', users: 'active users' };
var LibraryUsage = function (_a) {
    var data = _a.data, focus = _a.focus;
    var _b = React.useState(focus ? [focus] : []), codes = _b[0], setCodes = _b[1];
    var _c = React.useState([]), siteSel = _c[0], setSiteSel = _c[1];
    var _d = React.useState('docs'), mk = _d[0], setMk = _d[1];
    var _e = React.useState(''), q = _e[0], setQ = _e[1];
    React.useEffect(function () { if (focus) {
        setCodes([focus]);
        setSiteSel([]);
    } }, [focus]);
    var deptSites = React.useMemo(function () { return sitesOf(data, codes); }, [data, codes]);
    var libs = React.useMemo(function () {
        var raw = codes.length ? codes.reduce(function (a, c) { return a.concat(data.libsByDept[c] || []); }, []) : data.libsAll;
        return raw.filter(function (l) { return !siteSel.length || siteSel.indexOf(l.site) >= 0; })
            .map(function (l, i) { return (__assign(__assign(__assign({}, l), libraryExtras(l)), { key: l.lib + '||' + l.site + '||' + i, name: l.lib + '||' + l.site + '||' + i })); });
    }, [data, codes, siteSel]);
    var metric = { key: mk, seg: '', get: function (l) { return l[mk]; }, fmt: function (l) { return F(l[mk]); }, noun: LIB_LABEL[mk], chartTitle: '', chartSub: '', chip: function (v) { return v; } };
    var alt = { folders: 'docs', docs: 'rec', rec: 'phys', phys: 'rec', users: 'docs' };
    var t = useTopPick(libs, metric, function (l) { return l[alt[mk]]; });
    var resetKey = codes.join(',') + '|' + siteSel.join(',') + mk;
    React.useEffect(function () { t.setSel(null); }, [resetKey]);
    var maxU = Math.max.apply(Math, __spreadArray([0], libs.map(function (l) { return l.users; }), false)), uniqueUsers = Math.min(sum(libs, function (l) { return l.users; }), Math.round(maxU * 3));
    var term = q.trim().toLowerCase();
    var shown = libs.filter(function (l) { return t.match(l) && (!term || (l.lib + ' ' + l.site).toLowerCase().indexOf(term) >= 0); });
    var cols = [
        { key: 'lib', label: 'Library', width: '22%', sortValue: function (l) { return l.lib; }, render: function (l) { return l.lib; }, className: 'strong' },
        { key: 'site', label: 'Site', width: '23%', sortValue: function (l) { return l.site; }, render: function (l) { return React.createElement("span", { style: { color: '#33475F' } }, l.site); } },
        { key: 'folders', label: 'Folders', numeric: true, width: '10%', sortValue: function (l) { return l.folders; }, render: function (l) { return F(l.folders); } },
        { key: 'docs', label: 'Documents', numeric: true, width: '11%', sortValue: function (l) { return l.docs; }, render: function (l) { return F(l.docs); } },
        { key: 'rec', label: 'Records', numeric: true, width: '10%', sortValue: function (l) { return l.rec; }, render: function (l) { return F(l.rec); } },
        { key: 'phys', label: 'Physical counterparts', numeric: true, width: '13%', sortValue: function (l) { return l.phys; }, render: function (l) { return F(l.phys); } },
        { key: 'users', label: 'Active users', numeric: true, width: '11%', sortValue: function (l) { return l.users; }, render: function (l) { return F(l.users); } }
    ];
    var tieChip = t.tie ? ({ folders: 'Folders', docs: 'Documents', rec: 'Records', phys: 'Physical Counterparts', users: 'Active users' }[mk]) + ': ' + t.tie : null;
    var chip = t.sel ? t.sel.split('||')[0] : tieChip;
    return (React.createElement(Panel, { title: "Libraries by Department / Office / RM / RO" },
        React.createElement("div", { className: "toolbar" },
            React.createElement(CategoryBar, { depts: data.depts, codes: codes, onChange: function (v) { setCodes(v); setSiteSel([]); }, site: React.createElement(SitePicker, { sites: deptSites, value: siteSel, onChange: setSiteSel }) })),
        React.createElement("div", { className: "sumRow", style: { gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' } },
            React.createElement(SumCard, { label: "Libraries", value: F(libs.length), hint: "Document libraries in EDRMS sites" }),
            React.createElement(SumCard, { label: "Folders", value: F(sum(libs, function (l) { return l.folders; })), hint: "Folders inside these libraries" }),
            React.createElement(SumCard, { label: "Documents", value: F(sum(libs, function (l) { return l.docs; })), hint: "Files stored in these libraries" }),
            React.createElement(SumCard, { label: "Records declared", value: F(sum(libs, function (l) { return l.rec; })), hint: "Documents saved as official records" }),
            React.createElement(SumCard, { label: "Physical Counterparts", value: F(sum(libs, function (l) { return l.phys; })), hint: "Records that also have a paper or physical version" }),
            React.createElement(SumCard, { label: "Active users", value: F(uniqueUsers), hint: "People who opened or edited files, last 180 days" })),
        React.createElement("div", { className: "box", style: { marginBottom: 14 } },
            React.createElement("div", { className: "boxHd" },
                React.createElement("div", null,
                    React.createElement("div", { className: "boxT" }, mk === 'users' ? 'Most used libraries' : 'Largest libraries'),
                    React.createElement("div", { className: "boxS" },
                        "Top 10 by ",
                        LIB_LABEL[mk],
                        ". Click a bar to find it in the table.")),
                React.createElement(Segmented, { label: "Measure", value: mk, onChange: setMk, options: [{ key: 'folders', text: 'Folders' }, { key: 'docs', text: 'Documents' }, { key: 'rec', text: 'Records' }, { key: 'phys', text: 'Counterparts' }, { key: 'users', text: 'Users' }] })),
            React.createElement(BarList, { selected: t.sel, onSelect: t.setSel, valueWidth: 64, items: t.top.map(function (l) { return ({ key: l.name, name: l.lib, note: l.site, value: l[mk], label: F(l[mk]), title: "".concat(l.lib, " (").concat(l.site, "): ").concat(F(l[mk]), " ").concat(LIB_LABEL[mk]) }); }), more: t.more ? { text: "+ ".concat(F(t.more), " more librar").concat(t.more > 1 ? 'ies' : 'y', " with ").concat(F(t.top[9][mk]), " ").concat(LIB_LABEL[mk]), onClick: function () { return t.setTie(F(t.top[9][mk])); } } : undefined })),
        React.createElement("div", { className: "box" },
            React.createElement("div", { className: "toolbar" },
                React.createElement(Search, { value: q, onChange: setQ, placeholder: "Search a library or site" }),
                chip && React.createElement(Chip, { text: chip, onClear: function () { return t.setSel(null); } }),
                React.createElement(ExportButton, { table: function () { return ({ name: 'Library usage', head: cols.map(function (c) { return c.label; }), rows: shown.map(function (l) { return [l.lib, l.site, l.folders, l.docs, l.rec, l.phys, l.users]; }) }); } })),
            React.createElement(DataTable, { columns: cols, rows: shown, rowKey: function (l) { return l.key; }, noun: "libraries", resetKey: resetKey + q + chip, highlight: function (l) { return l.name === t.sel; }, emptyText: "No libraries match." }))));
};
/* ---------- the dashboard ---------- */
export var DepartmentInsights = function (_a) {
    var data = _a.data, bandTools = _a.bandTools, focus = _a.focus;
    var _b = React.useState(focus ? [focus] : []), codes = _b[0], setCodes = _b[1];
    var _c = React.useState([]), siteSel = _c[0], setSiteSel = _c[1];
    var _d = React.useState('sites'), open = _d[0], setOpen = _d[1];
    React.useEffect(function () { if (focus) {
        setCodes([focus]);
        setSiteSel([]);
    } }, [focus]);
    var deptSites = React.useMemo(function () { return sitesOf(data, codes); }, [data, codes]);
    var sites = siteSel.length ? deptSites.filter(function (s) { return siteSel.indexOf(s.name) >= 0; }) : deptSites;
    var chosen = codes.length ? data.depts.filter(function (d) { return codes.indexOf(d.code) >= 0; }) : data.depts;
    var fig = function (k) {
        return siteSel.length ? (k === 'sites' ? sites.length : sum(sites, function (s) { return s[k]; })) : sum(chosen, function (d) { return d[k]; });
    };
    var kpis = [
        { key: 'sites', label: 'Sites', value: F(fig('sites')), info: 'EDRMS sites set up for this department' },
        { key: 'visitors', label: 'Site visitors', value: F(fig('visitors')), info: 'People who opened a site, last 180 days' },
        { key: 'docs', label: 'Documents', value: F(fig('docs')), info: 'Files stored in EDRMS' },
        { key: 'rec', label: 'Records declared', value: F(fig('rec')), info: 'Documents saved as official records' },
        { key: 'phys', label: 'Physical Counterparts', value: F(fig('phys')), info: 'Records that also have a paper or physical version' }
    ];
    var resetKey = codes.join(',') + '|' + siteSel.join(',');
    return (React.createElement("div", { className: "dash-dp" },
        React.createElement(Band, { title: "Department insights", text: "EDRMS use by department: sites, site visitors, documents, declared records and physical counterparts", tools: bandTools }),
        React.createElement(Panel, { title: "Department Profile" },
            React.createElement("div", { className: "toolbar" },
                React.createElement(CategoryBar, { depts: data.depts, codes: codes, onChange: function (v) { setCodes(v); setSiteSel([]); }, site: React.createElement(SitePicker, { sites: deptSites, value: siteSel, onChange: setSiteSel }) })),
            React.createElement(ProfileStrip, { codes: codes }),
            React.createElement("div", { className: "gh" },
                React.createElement("b", null, "Open a breakdown"),
                React.createElement("span", null,
                    kpis.length,
                    " cards, each opens the table beneath")),
            React.createElement(KpiRow, { items: kpis, open: open, onOpen: setOpen, stacked: true })),
        open === 'sites' && React.createElement(SitesCreated, { sites: sites, resetKey: resetKey }),
        open === 'visitors' && React.createElement(VisitorsDrill, { sites: sites, resetKey: resetKey }),
        open === 'docs' && React.createElement(MetricDrill, { key: "docs", sites: sites, resetKey: resetKey, spec: DOCS_SPEC }),
        open === 'rec' && React.createElement(MetricDrill, { key: "rec", sites: sites, resetKey: resetKey, spec: REC_SPEC }),
        open === 'phys' && React.createElement(MetricDrill, { key: "phys", sites: sites, resetKey: resetKey, spec: PHYS_SPEC }),
        React.createElement(Band, { title: "Library usage", text: "Document libraries in EDRMS sites: documents, declared records, physical counterparts and active users" }),
        React.createElement(LibraryUsage, { data: data, focus: focus })));
};
//# sourceMappingURL=DepartmentInsights.js.map