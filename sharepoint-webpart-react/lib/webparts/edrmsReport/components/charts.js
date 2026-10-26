// Charts, drawn as plain SVG so they match the approved design exactly.
// Each maps to a native Power BI visual: clustered bar, clustered column,
// line and clustered column (two axes) and donut.
import { __spreadArray } from "tslib";
import * as React from 'react';
import { F, niceMax, axisLabel } from '../lib/format';
var BLUE = '#0072BC';
export var BarList = function (_a) {
    var items = _a.items, selected = _a.selected, onSelect = _a.onSelect, color = _a.color, more = _a.more, valueWidth = _a.valueWidth;
    var max = Math.max.apply(Math, __spreadArray([0.0001], items.map(function (i) { return i.value; }), false));
    var ref = React.useRef(null);
    // Beside a table, each bar lines up with a table row: same top, same height.
    React.useLayoutEffect(function () {
        var el = ref.current;
        var split = el && el.closest('.split');
        if (!el || !split)
            return undefined;
        var sync = function () {
            var bars = Array.prototype.slice.call(el.querySelectorAll(':scope > .hbar'));
            el.style.marginTop = '';
            bars.forEach(function (b) { b.style.height = ''; b.style.marginTop = ''; });
            var table = Array.prototype.slice.call(split.querySelectorAll('table')).filter(function (t) { return !t.contains(el); })[0];
            var rows = table ? Array.prototype.slice.call(table.querySelectorAll('tbody tr')) : [];
            if (!rows.length || !bars.length)
                return;
            var tr = table.getBoundingClientRect(), mr = el.getBoundingClientRect();
            if (tr.left === mr.left || tr.right > mr.left && mr.right > tr.left)
                return; // stacked, not side by side
            // Screen sizes include the Text size zoom; styles are set before it.
            var z = bars[0].offsetHeight ? bars[0].getBoundingClientRect().height / bars[0].offsetHeight : 1;
            var off = (rows[0].getBoundingClientRect().top - bars[0].getBoundingClientRect().top) / z;
            if (off < 0)
                return;
            bars.forEach(function (b, i) { if (rows[i])
                b.style.height = ((rows[i + 1] ? rows[i + 1].getBoundingClientRect().top : rows[i].getBoundingClientRect().bottom) - rows[i].getBoundingClientRect().top) / z + 'px'; });
            // Setting heights can move the list, and heights snap to whole pixels, so
            // nudge each bar onto its row in turn.
            el.style.marginTop = off + 'px';
            bars.forEach(function (b, i) {
                if (!rows[i])
                    return;
                var d = (rows[i].getBoundingClientRect().top - b.getBoundingClientRect().top) / z;
                if (Math.abs(d) >= 0.5)
                    b.style.marginTop = (parseFloat(b.style.marginTop) || 0) + d + 'px';
            });
        };
        sync();
        var RO = window.ResizeObserver;
        var ro = RO ? new RO(function () { return sync(); }) : undefined;
        if (ro)
            ro.observe(split);
        return function () { if (ro)
            ro.disconnect(); };
    });
    return (React.createElement("div", { className: "hbars", ref: ref },
        items.map(function (i) {
            var on = selected === i.key, dim = !!selected && !on;
            return (React.createElement("button", { type: "button", key: i.key, className: 'hbar' + (on ? ' on' : '') + (dim ? ' dim' : ''), title: i.title, style: valueWidth ? { gridTemplateColumns: "minmax(0,1fr) minmax(0,1.3fr) ".concat(valueWidth, "px") } : undefined, onClick: function () { return onSelect && onSelect(on ? null : i.key); } },
                React.createElement("span", { className: "nm" },
                    i.name,
                    i.note && React.createElement("small", null, i.note)),
                React.createElement("span", { className: "track" },
                    React.createElement("span", { className: "fill", style: { width: (i.value / max) * 100 + '%', background: color || BLUE } })),
                React.createElement("span", { className: "v" }, i.label)));
        }),
        more && React.createElement("button", { type: "button", className: "more", onClick: more.onClick },
            more.text,
            " ",
            React.createElement("span", { "aria-hidden": "true" }, "\u203A"))));
};
export var ColumnChart = function (_a) {
    var items = _a.items, height = _a.height, width = _a.width, color = _a.color, selected = _a.selected, onClick = _a.onClick, valueLabel = _a.valueLabel, showValues = _a.showValues, ariaLabel = _a.ariaLabel;
    var W = width || 900, H = height || 280, L = 56, R = W - 12, T = 22, B = H - 30;
    var n = Math.max(1, items.length), step = (R - L) / n;
    var max = niceMax(Math.max.apply(Math, __spreadArray([1], items.map(function (i) { return i.value; }), false)));
    var every = n <= 14 ? 1 : Math.ceil(n / 12);
    var lab = valueLabel || F;
    return (React.createElement("div", { className: "chart" },
        React.createElement("svg", { viewBox: "0 0 ".concat(W, " ").concat(H), role: "img", "aria-label": ariaLabel },
            [0, 1, 2, 3, 4].map(function (t) {
                var y = B - (B - T) * t / 4;
                return React.createElement("g", { key: t },
                    React.createElement("line", { x1: L, x2: R, y1: y, y2: y, stroke: "#E3E9F0" }),
                    React.createElement("text", { x: L - 8, y: y + 4, textAnchor: "end", fontSize: "11", fill: "#5B6B7D" }, axisLabel(max * t / 4)));
            }),
            items.map(function (it, i) {
                var h = (B - T) * it.value / max, bw = Math.min(Math.max(step * 0.62, 4), 64), x = L + step * i + step / 2;
                var fill = !selected ? (color || BLUE) : selected === it.key ? '#005A96' : '#B5D4F4';
                return (React.createElement("g", { key: it.key },
                    React.createElement("rect", { className: onClick ? 'click' : undefined, x: x - bw / 2, y: B - h, width: bw, height: Math.max(h, it.value ? 2 : 0), rx: "2", fill: fill, onClick: onClick ? function () { return onClick(it.key); } : undefined },
                        React.createElement("title", null, it.title || it.label + ': ' + F(it.value))),
                    (showValues !== false && n <= 16) && React.createElement("text", { x: x, y: B - h - 6, textAnchor: "middle", fontSize: "11", fontWeight: "600", fill: "#1F2D3D" }, lab(it.value)),
                    i % every === 0 && React.createElement("text", { x: x, y: B + 16, textAnchor: "middle", fontSize: "11", fill: "#5B6B7D" }, it.label)));
            }))));
};
/* ---------- columns per period with a running total line (two axes) ---------- */
export var ComboChart = function (_a) {
    var items = _a.items, onClick = _a.onClick, ariaLabel = _a.ariaLabel;
    var W = 920, H = 300, L = 60, R = W - 60, T = 30, B = H - 40;
    var n = Math.max(1, items.length), step = (R - L) / n;
    var total = items.reduce(function (a, i) { return a + i.value; }, 0);
    var mL = niceMax(Math.max.apply(Math, __spreadArray([1], items.map(function (i) { return i.value; }), false)) * 1.05), mR = niceMax(total * 1.02);
    var dense = n > 24;
    var run = 0;
    var pts = items.map(function (it, i) { run += it.value; return { x: L + step * i + step / 2, y: B - (B - T) * run / mR, run: run, it: it }; });
    return (React.createElement("div", { className: "chart" },
        React.createElement("svg", { viewBox: "0 0 ".concat(W, " ").concat(H), role: "img", "aria-label": ariaLabel },
            [0, 1, 2, 3, 4, 5].map(function (t) {
                var y = B - (B - T) * t / 5;
                return (React.createElement("g", { key: t },
                    React.createElement("line", { x1: L, x2: R, y1: y, y2: y, stroke: "#E3E9F0" }),
                    React.createElement("text", { x: L - 8, y: y + 4, textAnchor: "end", fontSize: "11", fill: "#5B6B7D" }, axisLabel(mL * t / 5)),
                    React.createElement("text", { x: R + 8, y: y + 4, fontSize: "11", fill: "#5B6B7D" }, axisLabel(mR * t / 5))));
            }),
            items.map(function (it, i) {
                var h = (B - T) * it.value / mL, bw = Math.min(Math.max(step * 0.6, 2), n <= 4 ? 150 : n <= 12 ? 70 : 60), x = L + step * i + step / 2;
                return (React.createElement("g", { key: it.key },
                    React.createElement("rect", { className: onClick ? 'click' : undefined, x: x - bw / 2, y: B - h, width: bw, height: h, rx: "2", fill: "#5CA943", onClick: onClick ? function () { return onClick(it.key); } : undefined },
                        React.createElement("title", null, it.label + ': ' + F(it.value) + (onClick ? ' (click to see its months)' : ''))),
                    !dense && React.createElement("text", { x: x, y: B - h - 7, textAnchor: "middle", fontSize: n > 14 ? 10 : 12, fontWeight: "600", fill: "#1F2D3D", stroke: "#fff", strokeWidth: "4", paintOrder: "stroke" }, n > 14 ? axisLabel(it.value) : F(it.value)),
                    !dense && React.createElement("text", { x: x, y: B + 16, textAnchor: "middle", fontSize: "11", fill: "#5B6B7D" }, it.label)));
            }),
            React.createElement("path", { d: pts.map(function (p, i) { return (i ? 'L' : 'M') + p.x + ' ' + p.y; }).join(''), fill: "none", stroke: BLUE, strokeWidth: "2.5" }),
            pts.map(function (p) { return React.createElement("circle", { key: p.it.key, cx: p.x, cy: p.y, r: "3.5", fill: BLUE },
                React.createElement("title", null, 'Running total to ' + p.it.label + ': ' + F(p.run))); }))));
};
/* ---------- donut ---------- */
export var Donut = function (_a) {
    var part = _a.part, total = _a.total, color = _a.color, rest = _a.rest, caption = _a.caption;
    var r = 80, c = 2 * Math.PI * r, share = total ? part / total : 0;
    return (React.createElement("svg", { viewBox: "0 0 200 200", width: "260", height: "260", role: "img", "aria-label": (share * 100).toFixed(1) + '% ' + caption },
        React.createElement("circle", { cx: "100", cy: "100", r: r, fill: "none", stroke: rest, strokeWidth: "22" }),
        React.createElement("circle", { cx: "100", cy: "100", r: r, fill: "none", stroke: color, strokeWidth: "22", strokeDasharray: "".concat(c * share, " ").concat(c), transform: "rotate(-90 100 100)" }),
        React.createElement("text", { x: "100", y: "98", textAnchor: "middle", fontSize: "30", fontWeight: "600", fill: "#10243E" },
            (share * 100).toFixed(1),
            "%"),
        React.createElement("text", { x: "100", y: "120", textAnchor: "middle", fontSize: "10.5", fill: "#64748B" }, "of records have a physical"),
        React.createElement("text", { x: "100", y: "134", textAnchor: "middle", fontSize: "10.5", fill: "#64748B" }, "counterpart")));
};
//# sourceMappingURL=charts.js.map