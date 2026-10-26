import * as React from 'react';
import styles from './Report.module.scss';
import { loadReportData } from '../lib/data';
import { exportPdf, exportPptx } from '../lib/exporters';
import { refreshLabel } from '../lib/format';
import { BankWide } from '../dashboards/BankWide';
import { DepartmentInsights } from '../dashboards/DepartmentInsights';
import { DownloadGlyph } from './ui';
/* Text size: Large is the default, as readers are often older. */
var ZOOM = { standard: 1, large: 1.25, xlarge: 1.5 };
var SIDEBAR_KEY = 'edrms-sidebar-closed';
var ICONS = {
    bw: React.createElement("svg", { viewBox: "0 0 16 16" },
        React.createElement("circle", { cx: "8", cy: "8", r: "6" }),
        React.createElement("circle", { cx: "8", cy: "8", r: "2.5", fill: "currentColor" })),
    dp: React.createElement("svg", { viewBox: "0 0 16 16" },
        React.createElement("rect", { x: "2", y: "2", width: "5", height: "5" }),
        React.createElement("rect", { x: "9", y: "2", width: "5", height: "5" }),
        React.createElement("rect", { x: "2", y: "9", width: "5", height: "5" }),
        React.createElement("rect", { x: "9", y: "9", width: "5", height: "5" })),
    pj: React.createElement("svg", { viewBox: "0 0 16 16" },
        React.createElement("path", { d: "M8 2l6 6-6 6-6-6z" })),
    fp: React.createElement("svg", { viewBox: "0 0 16 16" },
        React.createElement("path", { d: "M3 4h10M3 8h10M3 12h10" })),
    rd: React.createElement("svg", { viewBox: "0 0 16 16" },
        React.createElement("circle", { cx: "8", cy: "8", r: "6" }),
        React.createElement("path", { d: "M8 5v3l2 1" })),
    ra: React.createElement("svg", { viewBox: "0 0 16 16" },
        React.createElement("rect", { x: "2", y: "3", width: "12", height: "4" }),
        React.createElement("path", { d: "M3 7v6h10V7M6 10h4" }))
};
var FUTURE = [
    { key: 'pj', text: 'Project Insights' },
    { key: 'fp', text: 'Institutional File Plan' },
    { key: 'rd', text: 'Retention & Disposal' },
    { key: 'ra', text: 'Records & Archive Holdings' }
];
function readClosed() {
    try {
        return localStorage.getItem(SIDEBAR_KEY) === '1';
    }
    catch (_a) {
        return false;
    }
}
export var ReportApp = function (props) {
    var data = React.useMemo(loadReportData, []);
    var _a = React.useState(props.dashboard), dash = _a[0], setDash = _a[1];
    var _b = React.useState(undefined), focus = _b[0], setFocus = _b[1];
    var _c = React.useState(readClosed), closed = _c[0], setClosed = _c[1];
    var _d = React.useState(false), busy = _d[0], setBusy = _d[1];
    var page = React.useRef(null);
    var root = React.useRef(null);
    React.useEffect(function () { return setDash(props.dashboard); }, [props.dashboard]);
    var go = function (d) {
        setDash(d);
        if (d === 'bw')
            setFocus(undefined);
        if (root.current)
            root.current.scrollIntoView({ block: 'start' });
    };
    var openDept = function (code) { setFocus(code); go('dp'); };
    var toggle = function () {
        var next = !closed;
        setClosed(next);
        try {
            localStorage.setItem(SIDEBAR_KEY, next ? '1' : '0');
        }
        catch ( /* private window */_a) { /* private window */ }
    };
    var _e = React.useState(false), menu = _e[0], setMenu = _e[1];
    var _f = React.useState(''), busyText = _f[0], setBusyText = _f[1];
    React.useEffect(function () {
        if (!menu)
            return;
        var close = function () { return setMenu(false); };
        var key = function (e) { if (e.key === 'Escape')
            setMenu(false); };
        document.addEventListener('click', close);
        document.addEventListener('keydown', key);
        return function () { document.removeEventListener('click', close); document.removeEventListener('keydown', key); };
    }, [menu]);
    var name = dash === 'bw' ? 'Bank-wide Oversight' : 'Department Insights';
    // The capture libraries do not understand CSS zoom, so the page is drawn at
    // standard size and the text size is put back afterwards.
    var run = function (text, job) {
        if (!page.current || busy)
            return;
        setMenu(false);
        setBusy(true);
        setBusyText(text);
        var r = root.current, zoom = r ? r.style.getPropertyValue('zoom') : '';
        if (r)
            r.style.setProperty('zoom', '1');
        var done = function () { if (r)
            r.style.setProperty('zoom', zoom); setBusy(false); };
        job().then(done, function (e) { console.error('[EDRMS export]', e); done(); });
    };
    var pdf = function () { return run('Preparing PDF', function () { return exportPdf(page.current, name); }); };
    /* RAC Item 8 (22 Oct 2026): PowerPoint, one slide per breakdown and section. */
    var pptx = function () { return run('Preparing PowerPoint', function () {
        var el = page.current;
        var pick = function (q) { return ((el.querySelector(q) || {}).textContent || '').trim(); };
        return exportPptx(el, {
            name: name,
            desc: pick('.band .bd'), asOf: refreshLabel(),
            // Each box of the category bar as on screen: "Category: RM, HQ  ·  Sub-category: ...".
            filter: dash === 'bw' ? 'All Departments / Offices / RMs / ROs'
                : Array.from(el.querySelectorAll('.dash-dp > .panel:first-of-type .cgG')).map(function (g) {
                    return ((g.querySelector('.cgL') || {}).textContent || '') + ': ' + ((g.querySelector('.ms-Dropdown-title') || {}).textContent || '').trim();
                }).join('  \u00b7  ')
        });
    }); };
    var bandTools = (React.createElement(React.Fragment, null,
        React.createElement("span", { className: "asof" },
            React.createElement("i", null),
            "Data as of",
            React.createElement("b", null, refreshLabel())),
        React.createElement("span", { className: "xMenuWrap", "data-html2canvas-ignore": "true" },
            React.createElement("button", { type: "button", className: "pdfBtn", disabled: busy, "aria-haspopup": "menu", "aria-expanded": menu, onClick: function (e) { e.stopPropagation(); setMenu(!menu); } },
                React.createElement(DownloadGlyph, null),
                busy ? busyText : 'Export',
                !busy && React.createElement("span", { className: "xCaret", "aria-hidden": "true" }, "\u25BE")),
            menu && (React.createElement("div", { className: "xMenu", role: "menu", onClick: function (e) { return e.stopPropagation(); } },
                React.createElement("button", { type: "button", role: "menuitem", onClick: pdf },
                    React.createElement("span", { className: "xIc pdf" }, "PDF"),
                    React.createElement("span", null,
                        React.createElement("b", null, "PDF"),
                        React.createElement("small", null, "The dashboard as on screen"))),
                React.createElement("button", { type: "button", role: "menuitem", onClick: pptx },
                    React.createElement("span", { className: "xIc ppt" }, "PPT"),
                    React.createElement("span", null,
                        React.createElement("b", null, "PowerPoint"),
                        React.createElement("small", null, "One slide per breakdown and section, editable title and key points"))))))));
    return (React.createElement("div", { ref: root, className: styles.report, style: { zoom: ZOOM[props.textSize] || 1.25 } },
        props.showSidebar && (React.createElement("nav", { className: 'side' + (closed ? ' closed' : ''), "aria-label": "Dashboards" },
            React.createElement("div", { className: "brand" },
                React.createElement("button", { type: "button", className: "menuBtn", onClick: toggle, "aria-expanded": !closed, title: closed ? 'Open navigation' : 'Close navigation', "aria-label": closed ? 'Open navigation' : 'Close navigation' },
                    React.createElement("svg", { viewBox: "0 0 24 24" },
                        React.createElement("path", { d: "M4 6h16M4 12h16M4 18h16" }))),
                React.createElement("div", { className: "t1" }, "EDRMS Utilization Report"),
                React.createElement("div", { className: "t2" }, "Asian Development Bank")),
            React.createElement("div", { className: "grp" }, "Key views"),
            React.createElement("button", { type: "button", className: 'nav' + (dash === 'bw' ? ' on' : ''), "aria-current": dash === 'bw' ? 'page' : undefined, title: "Bank-wide Oversight", onClick: function () { return go('bw'); } },
                ICONS.bw,
                React.createElement("span", { className: "navTx" }, "Bank-wide Oversight")),
            React.createElement("button", { type: "button", className: 'nav' + (dash === 'dp' ? ' on' : ''), "aria-current": dash === 'dp' ? 'page' : undefined, title: "Department Insights", onClick: function () { return go('dp'); } },
                ICONS.dp,
                React.createElement("span", { className: "navTx" }, "Department Insights")),
            React.createElement("div", { className: "grp" }, "For future release"),
            FUTURE.map(function (f) { return (React.createElement("button", { type: "button", key: f.key, className: "nav future", "aria-disabled": "true", title: f.text + ' (future release)' },
                ICONS[f.key],
                React.createElement("span", { className: "navTx" }, f.text))); }))),
        React.createElement("div", { className: "main", ref: page }, dash === 'bw'
            ? React.createElement(BankWide, { data: data, openDept: openDept, bandTools: bandTools })
            : React.createElement(DepartmentInsights, { data: data, openDept: openDept, bandTools: bandTools, focus: focus }))));
};
//# sourceMappingURL=ReportApp.js.map