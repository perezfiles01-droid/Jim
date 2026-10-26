import * as React from 'react';
import { Callout, Checkbox, DirectionalHint } from '@fluentui/react';
import { CATEGORY_LABELS, categoryOf, mainOrder } from '../lib/categories';
import { Caret } from './ui';
/** A box like the other pickers whose list has a search field and ticks (22 Oct 2026). */
export var Multi = function (_a) {
    var label = _a.label, values = _a.values, value = _a.value, allText = _a.allText, onChange = _a.onChange, text = _a.text, summary = _a.summary;
    var _b = React.useState(false), open = _b[0], setOpen = _b[1];
    var _c = React.useState(''), q = _c[0], setQ = _c[1];
    var box = React.useRef(null);
    var show = function (v) { return (text ? text(v) : v); };
    var term = q.trim().toLowerCase();
    var shown = values.filter(function (v) { return !term || show(v).toLowerCase().indexOf(term) >= 0; });
    var toggle = function (v) {
        var cur = value.length ? value : [];
        var next = cur.indexOf(v) >= 0 ? cur.filter(function (x) { return x !== v; }) : cur.concat(v);
        onChange(next.length === values.length ? [] : next);
    };
    return (React.createElement(React.Fragment, null,
        React.createElement("button", { type: "button", ref: box, className: "cgBox picker cgPick", "aria-label": label, "aria-haspopup": "listbox", "aria-expanded": open, disabled: !values.length, onClick: function () { setQ(''); setOpen(!open); } },
            React.createElement("span", { className: "cgT" }, !values.length ? 'None' : value.length ? (summary ? summary(value) : value.join(', ')) : allText),
            React.createElement(Caret, null)),
        open && (React.createElement(Callout, { target: box, onDismiss: function () { return setOpen(false); }, directionalHint: DirectionalHint.bottomLeftEdge, gapSpace: 4, isBeakVisible: false, calloutWidth: box.current ? box.current.offsetWidth : 260, setInitialFocus: true, role: "listbox", ariaLabel: label },
            React.createElement("div", { className: "cgList" },
                React.createElement("input", { type: "search", className: "cgQ", placeholder: 'Search ' + label.toLowerCase(), "aria-label": 'Search ' + label, value: q, onChange: function (e) { return setQ(e.target.value); } }),
                React.createElement("div", { className: "cgOpts" },
                    !term && React.createElement(Checkbox, { className: "cgAll", label: allText, checked: !value.length, onChange: function () { return onChange([]); } }),
                    shown.map(function (v) { return React.createElement(Checkbox, { key: v, label: show(v), checked: value.indexOf(v) >= 0, onChange: function () { return toggle(v); } }); }),
                    !shown.length && React.createElement("div", { className: "cgNone" }, "Nothing matches.")))))));
};
export var CategoryBar = function (_a) {
    var depts = _a.depts, codes = _a.codes, onChange = _a.onChange, site = _a.site, vertical = _a.vertical;
    var _b = React.useState({ cat: [], sub: [], grp: [] }), sel = _b[0], setSel = _b[1];
    var nameOf = function (code) { var d = depts.filter(function (x) { return x.code === code; })[0]; return d ? code + ' - ' + d.name : code; };
    var pass = function (s) { return function (d) {
        var c = categoryOf(d.code);
        return (!s.cat.length || s.cat.indexOf(c.main) >= 0) && (!s.sub.length || s.sub.indexOf(c.sub) >= 0) &&
            (!s.grp.length || (!!c.subSub && s.grp.indexOf(c.subSub) >= 0));
    }; };
    var pick = function (s) {
        var any = s.cat.length || s.sub.length || s.grp.length;
        return any ? depts.filter(pass(s)).map(function (d) { return d.code; }) : [];
    };
    // A department chosen elsewhere (a link from Bank-wide) shows as its own categories.
    React.useEffect(function () {
        if (pick(sel).join() === codes.join())
            return;
        if (!codes.length) {
            setSel({ cat: [], sub: [], grp: [] });
            return;
        }
        var cs = codes.map(categoryOf);
        var uniq = function (a) { return a.filter(function (v, i) { return a.indexOf(v) === i; }); };
        var withGrp = cs.every(function (c) { return !!c.subSub; });
        setSel({ cat: uniq(cs.map(function (c) { return c.main; })), sub: uniq(cs.map(function (c) { return c.sub; })), grp: withGrp ? uniq(cs.map(function (c) { return c.subSub; })) : [] });
    }, [codes.join()]);
    var order = mainOrder();
    var cats = Array.from(new Set(depts.map(function (d) { return categoryOf(d.code).main; })))
        .sort(function (a, b) { return (order.indexOf(a) < 0 ? 99 : order.indexOf(a)) - (order.indexOf(b) < 0 ? 99 : order.indexOf(b)); });
    var inCat = depts.filter(function (d) { return !sel.cat.length || sel.cat.indexOf(categoryOf(d.code).main) >= 0; });
    var subs = Array.from(new Set(inCat.map(function (d) { return categoryOf(d.code).sub; })));
    var inSub = inCat.filter(function (d) { return !sel.sub.length || sel.sub.indexOf(categoryOf(d.code).sub) >= 0; });
    var grps = Array.from(new Set(inSub.map(function (d) { return categoryOf(d.code).subSub; }).filter(Boolean)));
    var apply = function (s) {
        // A narrower box keeps only choices still possible under the wider ones.
        var c2 = depts.filter(function (d) { return !s.cat.length || s.cat.indexOf(categoryOf(d.code).main) >= 0; });
        var okSub = c2.map(function (d) { return categoryOf(d.code).sub; });
        s.sub = s.sub.filter(function (v) { return okSub.indexOf(v) >= 0; });
        var s2 = c2.filter(function (d) { return !s.sub.length || s.sub.indexOf(categoryOf(d.code).sub) >= 0; });
        var okGrp = s2.map(function (d) { return categoryOf(d.code).subSub; });
        s.grp = s.grp.filter(function (v) { return okGrp.indexOf(v) >= 0; });
        setSel(s);
        onChange(pick(s));
    };
    var scope = function (v, all) { return (v.length ? 'All in ' + v.join(', ') : all); };
    return (React.createElement("div", { className: 'cgBar' + (vertical ? ' cgV' : '') },
        React.createElement("div", { className: "cgG" },
            React.createElement("span", { className: "cgL" }, CATEGORY_LABELS[0]),
            React.createElement(Multi, { label: CATEGORY_LABELS[0], values: cats, value: sel.cat, allText: "All", onChange: function (v) { return apply({ cat: v, sub: sel.sub, grp: sel.grp }); } })),
        React.createElement("span", { className: "cgA", "aria-hidden": "true" }, "\u203A"),
        React.createElement("div", { className: "cgG" },
            React.createElement("span", { className: "cgL" }, CATEGORY_LABELS[1]),
            React.createElement(Multi, { label: CATEGORY_LABELS[1], values: subs, value: sel.sub, allText: scope(sel.cat, 'All'), text: nameOf, onChange: function (v) { return apply({ cat: sel.cat, sub: v, grp: sel.grp }); } })),
        React.createElement("span", { className: "cgA", "aria-hidden": "true" }, "\u203A"),
        React.createElement("div", { className: "cgG" },
            React.createElement("span", { className: "cgL" }, CATEGORY_LABELS[2]),
            React.createElement(Multi, { label: CATEGORY_LABELS[2], values: grps, value: sel.grp, allText: scope(sel.sub, 'All'), text: nameOf, onChange: function (v) { return apply({ cat: sel.cat, sub: sel.sub, grp: v }); } })),
        site && React.createElement("span", { className: "cgA", "aria-hidden": "true" }, "\u203A"),
        site && React.createElement("div", { className: "cgG" },
            React.createElement("span", { className: "cgL" }, "Site"),
            site)));
};
//# sourceMappingURL=CategoryBar.js.map