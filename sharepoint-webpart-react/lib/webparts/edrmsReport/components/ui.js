import * as React from 'react';
import { TooltipHost, DirectionalHint } from '@fluentui/react';
import { exportTable } from '../lib/exporters';
import { F } from '../lib/format';
/* ---------- icons, drawn so they look the same in every font ---------- */
export var InfoGlyph = function () { return (React.createElement("svg", { viewBox: "0 0 8 10", "aria-hidden": "true" },
    React.createElement("circle", { cx: "4", cy: "1.4", r: "1.3", fill: "currentColor" }),
    React.createElement("rect", { x: "2.9", y: "3.6", width: "2.2", height: "6.4", rx: "0.6", fill: "currentColor" }))); };
export var DownloadGlyph = function () { return (React.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" },
    React.createElement("path", { d: "M12 4v11M7 10l5 5 5-5M5 20h14" }))); };
export var FunnelGlyph = function () { return (React.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" },
    React.createElement("path", { d: "M4 5h16l-6 7.5V19l-4-2v-4.5z" }))); };
/** The arrow on drop-downs, drawn here so it does not depend on an icon font. */
export var Caret = function () { return (React.createElement("svg", { viewBox: "0 0 12 12", width: "12", height: "12", "aria-hidden": "true", style: { display: 'block' } },
    React.createElement("path", { d: "M2.5 4.5L6 8l3.5-3.5", fill: "none", stroke: "#5B6B7D", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }))); };
/** The small (i) at a card's top right. The description shows on hover or keyboard focus. */
export var InfoIcon = function (_a) {
    var text = _a.text;
    return (React.createElement(TooltipHost, { content: text, hostClassName: "infoWrap", directionalHint: DirectionalHint.bottomRightEdge, calloutProps: { gapSpace: 4, calloutMaxWidth: 240 } },
        React.createElement("span", { className: "info", tabIndex: 0, role: "img", "aria-label": text, onClick: function (e) { return e.stopPropagation(); } },
            React.createElement(InfoGlyph, null))));
};
/* ---------- layout ---------- */
export var Band = function (_a) {
    var title = _a.title, text = _a.text, tools = _a.tools;
    return (React.createElement("div", { className: "band" },
        React.createElement("h2", null, title),
        React.createElement("div", { className: "bd" }, text),
        tools && React.createElement("div", { className: "tools" }, tools)));
};
export var Panel = function (_a) {
    var title = _a.title, sub = _a.sub, children = _a.children, className = _a.className;
    return (React.createElement("section", { className: 'panel' + (className ? ' ' + className : '') },
        title && React.createElement("h3", { className: "ptitle" }, title),
        sub && React.createElement("p", { className: "psub" }, sub),
        children));
};
/** A row of clickable cards; the one that is open shows its breakdown below. */
export var KpiRow = function (_a) {
    var items = _a.items, open = _a.open, onOpen = _a.onOpen, stacked = _a.stacked;
    return (React.createElement("div", { className: 'kpis' + (stacked ? ' stacked' : '') }, items.map(function (k) { return (React.createElement("div", { key: k.key, role: "button", tabIndex: 0, "aria-pressed": open === k.key, className: 'kpi' + (open === k.key ? ' on' : ''), onClick: function () { return onOpen(k.key); }, onKeyDown: function (e) { if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpen(k.key);
        } } },
        React.createElement("div", { className: "lab" }, k.label),
        React.createElement("div", { className: "val" }, k.value),
        React.createElement("div", { className: "tap" },
            "View breakdown ",
            React.createElement("span", { "aria-hidden": "true" }, "\u203A")),
        React.createElement(InfoIcon, { text: k.info }))); })));
};
/** Small summary cards above a table. */
export var Tiles = function (_a) {
    var items = _a.items;
    return (React.createElement("div", { className: "tiles" }, items.map(function (t) { return (React.createElement("div", { className: "tile", key: t.label },
        React.createElement("div", { className: "tl" }, t.label),
        React.createElement("div", { className: "tv" }, t.value),
        t.info && React.createElement(InfoIcon, { text: t.info }))); })));
};
export var SumCard = function (_a) {
    var label = _a.label, value = _a.value, hint = _a.hint, swatch = _a.swatch, info = _a.info, children = _a.children;
    return (React.createElement("div", { className: "sumCard" },
        React.createElement("span", { className: "l" },
            swatch && React.createElement("i", { style: { background: swatch } }),
            label),
        React.createElement("span", { className: "v" }, value),
        children,
        (info || hint) && React.createElement(InfoIcon, { text: (info || hint) })));
};
/* ---------- controls ---------- */
export var Search = function (_a) {
    var value = _a.value, onChange = _a.onChange, placeholder = _a.placeholder;
    return (React.createElement("input", { className: "search", type: "search", value: value, placeholder: placeholder, "aria-label": placeholder, onChange: function (e) { return onChange(e.target.value); } }));
};
export function Segmented(props) {
    return (React.createElement("div", { className: "seg", role: "group", "aria-label": props.label }, props.options.map(function (o) { return (React.createElement("button", { key: o.key, type: "button", className: props.value === o.key ? 'on' : '', "aria-pressed": props.value === o.key, onClick: function () { return props.onChange(o.key); } }, o.text)); })));
}
export var ExportButton = function (_a) {
    var table = _a.table;
    return (React.createElement("button", { type: "button", className: "xpBtn", onClick: function () { exportTable(table()).catch(function () { return undefined; }); } },
        React.createElement(DownloadGlyph, null),
        "Export table"));
};
export var Chip = function (_a) {
    var text = _a.text, onClear = _a.onClear;
    return (React.createElement("span", { className: "chip" },
        text,
        React.createElement("button", { type: "button", "aria-label": "Clear filter", onClick: onClear }, "\u00D7")));
};
/* ---------- paging ---------- */
export var Pager = function (_a) {
    var total = _a.total, page = _a.page, size = _a.size, noun = _a.noun, onPage = _a.onPage;
    var pages = Math.max(1, Math.ceil(total / size));
    var from = total ? (page - 1) * size + 1 : 0, to = Math.min(total, page * size);
    var info = pages > 1 ? "Showing ".concat(F(from), " to ").concat(F(to), " of ").concat(F(total), " ").concat(noun) : "Showing ".concat(F(total), " ").concat(noun);
    // First, last, and the pages either side of the current one.
    var shown = [];
    for (var p = 1; p <= pages; p++) {
        if (p === 1 || p === pages || Math.abs(p - page) <= 1)
            shown.push(p);
        else if (shown[shown.length - 1] !== '...')
            shown.push('...');
    }
    return (React.createElement("div", { className: "pager" },
        React.createElement("span", { className: "pinfo" }, info),
        pages > 1 && (React.createElement("span", { className: "pbtns" },
            React.createElement("button", { type: "button", disabled: page <= 1, onClick: function () { return onPage(page - 1); } }, "\u2039 Prev"),
            shown.map(function (p, i) { return p === '...'
                ? React.createElement("span", { key: 'e' + i }, "\u2026")
                : React.createElement("button", { type: "button", key: p, className: p === page ? 'on' : '', "aria-current": p === page, onClick: function () { return onPage(p); } }, p); }),
            React.createElement("button", { type: "button", disabled: page >= pages, onClick: function () { return onPage(page + 1); } }, "Next \u203A")))));
};
/** A department code and name. The underlined code opens Department Insights. */
export var DeptCell = function (_a) {
    var code = _a.code, name = _a.name, plain = _a.plain;
    return (React.createElement("span", { className: "dc" },
        React.createElement("span", { className: "code", style: plain ? { color: '#10243E', textDecoration: 'none' } : undefined }, code),
        React.createElement("span", { className: "dname" }, name)));
};
//# sourceMappingURL=ui.js.map