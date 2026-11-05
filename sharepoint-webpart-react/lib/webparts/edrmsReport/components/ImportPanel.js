import { __awaiter, __generator, __spreadArray } from "tslib";
/*
 * Import data (5 Nov 2026). Shown only to people who can manage the site
 * (SharePoint Owners and site collection admins); see EdrmsReportWebPart.ts.
 * One template, checked against every rule in lib/importRules.ts before
 * anything is saved. A file with any problem is refused whole.
 */
import * as React from 'react';
import { validate, TABS, COLUMNS, POLICIES } from '../lib/importRules';
var MAX_BYTES = 10 * 1024 * 1024;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function xlsx() {
    return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, import(/* webpackChunkName: 'edrms-xlsx' */ 'xlsx-js-style')];
    }); });
}
function downloadTemplate(current, knownUnits) {
    return __awaiter(this, void 0, void 0, function () {
        var X, wb, headStyle, titleStyle, sheet, instr, wsI, sites, units;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, xlsx()];
                case 1:
                    X = _a.sent();
                    wb = X.utils.book_new();
                    headStyle = { font: { bold: true, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '194F8E' } }, alignment: { vertical: 'center', wrapText: true } };
                    titleStyle = { font: { bold: true, sz: 14, color: { rgb: '194F8E' } } };
                    sheet = function (rows, widths, styleHead) {
                        if (styleHead === void 0) { styleHead = true; }
                        var ws = X.utils.aoa_to_sheet(rows);
                        ws['!cols'] = widths.map(function (w) { return ({ wch: w }); });
                        if (styleHead && rows.length)
                            rows[0].forEach(function (_, c) { var a = X.utils.encode_cell({ r: 0, c: c }); if (ws[a])
                                ws[a].s = headStyle; });
                        return ws;
                    };
                    instr = __spreadArray(__spreadArray([['EDRMS Utilization Report: manual data template'], [],
                        ['Fill in the Sites, People and Departments tabs, save, then use Import data in the report. Code mapping is optional.'], [],
                        ['Rules (if any is broken, nothing is loaded)']], POLICIES.map(function (p, i) { return [(i + 1) + '. ' + p]; }), true), [[]], false);
                    [['sites', TABS.sites], ['people', TABS.people], ['departments', TABS.departments], ['mapping', TABS.mapping]].forEach(function (_a) {
                        var k = _a[0], t = _a[1];
                        instr.push([t + ' tab'], ['Column', 'Required', 'Rule']);
                        COLUMNS[k].forEach(function (c) { return instr.push([c.name, c.req ? 'Yes' : 'No', c.rule]); });
                        instr.push([]);
                    });
                    wsI = sheet(instr, [30, 10, 110], false);
                    ['A1'].forEach(function (a) { if (wsI[a])
                        wsI[a].s = titleStyle; });
                    X.utils.book_append_sheet(wb, wsI, 'Instructions');
                    sites = (current ? current.sites : []).map(function (s) { return [s.site, s.url, s.siteName, s.department, s.division, s.production ? 'Yes' : 'No', s.category, s.subCategory, s.subGroup || '']; });
                    X.utils.book_append_sheet(wb, sheet(__spreadArray([COLUMNS.sites.map(function (c) { return c.name; })], sites, true), [60, 48, 24, 13, 11, 11, 11, 13, 12]), TABS.sites);
                    X.utils.book_append_sheet(wb, sheet([COLUMNS.people.map(function (c) { return c.name; })], [34, 26, 13, 11, 10, 16, 13, 24]), TABS.people);
                    units = current ? Object.keys(current.units).filter(function (k) { return current.units[k].goLive || current.units[k].convUrl; }).sort() : [];
                    X.utils.book_append_sheet(wb, sheet(__spreadArray([COLUMNS.departments.map(function (c) { return c.name; })], units.map(function (k) { return [k, current.units[k].goLive || '', current.units[k].convUrl || '']; }), true), [12, 14, 80]), TABS.departments);
                    X.utils.book_append_sheet(wb, sheet([COLUMNS.mapping.map(function (c) { return c.name; })], [18, 16]), TABS.mapping);
                    X.utils.book_append_sheet(wb, sheet(__spreadArray(__spreadArray([['Units the report knows']], knownUnits.slice().sort().map(function (u) { return [u]; }), true), [[], ['Category'], ['HQ'], ['RM'], ['RO'], [], ['Production'], ['Yes'], ['No'], [], ['Staff type'], ['Staff'], ['Consultant'], ['Contractor'], [], ['Completed EDRMS training'], ['Yes'], ['No']], false), [28]), 'Valid values');
                    X.writeFile(wb, 'EDRMS_Utilization_Manual_Data.xlsx');
                    return [2 /*return*/];
            }
        });
    });
}
function readBook(file) {
    return __awaiter(this, void 0, void 0, function () {
        var X_1, wb_1, _a, _b, book_1, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!/\.xlsx$/i.test(file.name))
                        return [2 /*return*/, { book: null, problem: 'Only .xlsx files are accepted. Use the downloaded template.' }];
                    if (file.size > MAX_BYTES)
                        return [2 /*return*/, { book: null, problem: 'The file is larger than 10 MB.' }];
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, xlsx()];
                case 2:
                    X_1 = _d.sent();
                    _b = (_a = X_1).read;
                    return [4 /*yield*/, file.arrayBuffer()];
                case 3:
                    wb_1 = _b.apply(_a, [_d.sent(), { type: 'array', cellDates: true }]);
                    book_1 = {};
                    wb_1.SheetNames.forEach(function (n) { book_1[n] = X_1.utils.sheet_to_json(wb_1.Sheets[n], { header: 1, raw: true, defval: null, blankrows: true }); });
                    return [2 /*return*/, { book: book_1, problem: null }];
                case 4:
                    _c = _d.sent();
                    return [2 /*return*/, { book: null, problem: 'The file could not be read. Open it in Excel and save it again as .xlsx.' }];
                case 5: return [2 /*return*/];
            }
        });
    });
}
var F = function (n) { return n.toLocaleString('en-US'); };
export var ImportPanel = function (props) {
    var _a = React.useState(null), file = _a[0], setFile = _a[1];
    var _b = React.useState(null), result = _b[0], setResult = _b[1];
    var _c = React.useState(null), problem = _c[0], setProblem = _c[1];
    var _d = React.useState(''), busy = _d[0], setBusy = _d[1];
    var _e = React.useState(null), done = _e[0], setDone = _e[1];
    var _f = React.useState(null), hist = _f[0], setHist = _f[1];
    var _g = React.useState(false), drag = _g[0], setDrag = _g[1];
    var input = React.useRef(null);
    var shade = React.useRef(null);
    // Start below SharePoint's own top bar, which sits above the page and would
    // otherwise cover the panel's title and close button. The report is drawn
    // with CSS zoom (text size), so the offset is given in zoomed pixels.
    React.useLayoutEffect(function () {
        var place = function () {
            var el = shade.current;
            if (!el)
                return;
            var bars = Array.prototype.slice.call(document.querySelectorAll('#SuiteNavWrapper, #SuiteNavPlaceHolder, #O365_NavHeader, [data-automationid="SuiteNav"], #spSiteHeader ~ div[role="banner"]'));
            var bottom = bars.reduce(function (a, b) { var r = b.getBoundingClientRect(); return r.height > 0 && r.top < 5 ? Math.max(a, r.bottom) : a; }, 0);
            var zoom = parseFloat(getComputedStyle(el.parentElement || el).getPropertyValue('zoom')) || 1;
            el.style.top = Math.max(0, bottom) / zoom + 'px';
        };
        place();
        window.addEventListener('resize', place);
        return function () { return window.removeEventListener('resize', place); };
    }, []);
    React.useEffect(function () { props.store.history().then(setHist, function () { return setHist([]); }); }, []);
    React.useEffect(function () {
        var k = function (e) { if (e.key === 'Escape' && !busy)
            props.onClose(); };
        document.addEventListener('keydown', k);
        return function () { return document.removeEventListener('keydown', k); };
    }, [busy]);
    var reset = function () { setFile(null); setResult(null); setProblem(null); setDone(null); if (input.current)
        input.current.value = ''; };
    var check = function (f) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, book, p, v;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    reset();
                    if (!f)
                        return [2 /*return*/];
                    setFile(f);
                    setBusy('Checking ' + f.name);
                    return [4 /*yield*/, readBook(f)];
                case 1:
                    _a = _b.sent(), book = _a.book, p = _a.problem;
                    if (!book) {
                        setProblem(p);
                        setBusy('');
                        return [2 /*return*/];
                    }
                    // Let the "Checking" line paint before a large file is processed.
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 30); })];
                case 2:
                    // Let the "Checking" line paint before a large file is processed.
                    _b.sent();
                    v = validate(book, f.name, props.user);
                    setResult(v);
                    setBusy('');
                    if (!v.issues.length) return [3 /*break*/, 4];
                    return [4 /*yield*/, props.store.logRefused(f.name, props.user, v.issues)];
                case 3:
                    _b.sent();
                    props.store.history().then(setHist, function () { return undefined; });
                    _b.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var load = function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!result || !result.data)
                        return [2 /*return*/];
                    setBusy('Saving');
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, props.store.save(result.data)];
                case 2:
                    _b.sent();
                    props.onLoaded(result.data);
                    setDone('Loaded. The report now shows the imported figures.');
                    setResult(null);
                    _a = setHist;
                    return [4 /*yield*/, props.store.history()];
                case 3:
                    _a.apply(void 0, [_b.sent()]);
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _b.sent();
                    setProblem('Nothing was saved: ' + (e_1 instanceof Error ? e_1.message : 'SharePoint did not accept the file.') + ' Check that you are still a site owner and try again.');
                    return [3 /*break*/, 5];
                case 5:
                    setBusy('');
                    return [2 /*return*/];
            }
        });
    }); };
    var last = hist && hist.find(function (h) { return h.status === 'loaded'; });
    var issues = result ? result.issues : [];
    return (React.createElement("div", { ref: shade, className: "impShade", onClick: function () { if (!busy)
            props.onClose(); }, "data-html2canvas-ignore": "true" },
        React.createElement("aside", { className: "impPanel", role: "dialog", "aria-modal": "true", "aria-label": "Import manual data", onClick: function (e) { return e.stopPropagation(); } },
            React.createElement("div", { className: "impHead" },
                React.createElement("div", null,
                    React.createElement("h2", null, "Import manual data"),
                    React.createElement("div", { className: "impWho" },
                        "Signed in as ",
                        props.user,
                        " \u00B7 ",
                        props.role)),
                React.createElement("button", { type: "button", className: "impX", "aria-label": "Close", title: "Close", disabled: !!busy, onClick: props.onClose }, "\u2715")),
            React.createElement("section", { className: "impStep" },
                React.createElement("h3", null, "1. Download the template"),
                React.createElement("button", { type: "button", className: "impBtn pri", onClick: function () { downloadTemplate(props.current, props.knownUnits).catch(function (e) { return setProblem('The template could not be created: ' + e); }); } }, "Download Excel template")),
            React.createElement("section", { className: "impStep" },
                React.createElement("h3", null, "2. Upload and check"),
                React.createElement("label", { className: 'impDrop' + (drag ? ' on' : ''), onDragOver: function (e) { e.preventDefault(); setDrag(true); }, onDragLeave: function () { return setDrag(false); }, onDrop: function (e) { e.preventDefault(); setDrag(false); check(e.dataTransfer.files[0] || null).catch(function () { return undefined; }); } },
                    React.createElement("input", { ref: input, type: "file", accept: ".xlsx", onChange: function (e) { check(e.target.files ? e.target.files[0] : null).catch(function () { return undefined; }); } }),
                    file ? React.createElement("b", null, file.name) : React.createElement("span", null,
                        "Drop the filled template here, or ",
                        React.createElement("u", null, "browse"),
                        " (.xlsx, up to 10 MB)")),
                busy && React.createElement("p", { className: "impBusy" },
                    busy,
                    "\u2026"),
                problem && React.createElement("div", { className: "impBad" },
                    React.createElement("b", null, problem)),
                result && issues.length > 0 && (React.createElement("div", { className: "impBad" },
                    React.createElement("b", null,
                        "Not loaded. ",
                        F(issues.length),
                        issues.length >= 1000 ? '+' : '',
                        " problem",
                        issues.length === 1 ? '' : 's',
                        " found. Nothing was changed."),
                    React.createElement("div", { className: "impTblWrap" },
                        React.createElement("table", { className: "impTbl" },
                            React.createElement("thead", null,
                                React.createElement("tr", null,
                                    React.createElement("th", null, "Tab"),
                                    React.createElement("th", null, "Row"),
                                    React.createElement("th", null, "Column"),
                                    React.createElement("th", null, "Problem"))),
                            React.createElement("tbody", null, issues.slice(0, 300).map(function (i, n) { return React.createElement("tr", { key: n },
                                React.createElement("td", null, i.tab),
                                React.createElement("td", null, i.row || '-'),
                                React.createElement("td", null, i.column),
                                React.createElement("td", null, i.message)); })))),
                    issues.length > 300 && React.createElement("p", { className: "impSmall" }, "Showing the first 300. Fix these and check again."))),
                result && result.data && (React.createElement("div", { className: "impGood" },
                    React.createElement("b", null, "All checks passed."),
                    React.createElement("div", null,
                        F(result.summary.sites),
                        " sites \u00B7 ",
                        F(result.summary.people),
                        " people in ",
                        F(result.summary.units),
                        " units \u00B7 ",
                        F(result.summary.trained),
                        " completed training"),
                    result.notes.map(function (n, i) { return React.createElement("div", { key: i, className: "impNote" }, n); }),
                    React.createElement("div", { className: "impRow" },
                        React.createElement("button", { type: "button", className: "impBtn pri", disabled: !!busy, onClick: function () { load().catch(function () { return undefined; }); } }, "Import"),
                        React.createElement("button", { type: "button", className: "impBtn", disabled: !!busy, onClick: reset }, "Cancel")))),
                done && React.createElement("div", { className: "impGood" },
                    React.createElement("b", null, done))),
            React.createElement("p", { className: "impSmall" }, last ? React.createElement(React.Fragment, null,
                "Last import: ",
                new Date(last.at).toLocaleString(),
                " by ",
                last.by,
                " \u00B7 ",
                F(last.sites),
                " sites, ",
                F(last.people),
                " people") : 'Nothing imported yet. The report shows sample figures.'),
            hist && hist.length > 0 && (React.createElement("details", { className: "impHist" },
                React.createElement("summary", null, "Import history"),
                React.createElement("table", { className: "impTbl" },
                    React.createElement("thead", null,
                        React.createElement("tr", null,
                            React.createElement("th", null, "When"),
                            React.createElement("th", null, "By"),
                            React.createElement("th", null, "File"),
                            React.createElement("th", null, "Result"))),
                    React.createElement("tbody", null, hist.slice(0, 30).map(function (h, i) { return React.createElement("tr", { key: i },
                        React.createElement("td", null, new Date(h.at).toLocaleString()),
                        React.createElement("td", null, h.by),
                        React.createElement("td", null, h.fileName),
                        React.createElement("td", { className: h.status === 'loaded' ? 'ok' : 'no' }, h.status === 'loaded' ? 'Loaded' : 'Refused, ' + F(h.problems) + ' problems')); }))))))));
};
//# sourceMappingURL=ImportPanel.js.map