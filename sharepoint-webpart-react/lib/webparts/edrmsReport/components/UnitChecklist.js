import * as React from 'react';
import { Checkbox } from '@fluentui/react';
import { CATEGORY_LABELS, categoryOf, mainOrder } from '../lib/categories';
export var UnitChecklist = function (_a) {
    var depts = _a.depts, draft = _a.draft, setDraft = _a.setDraft;
    var _b = React.useState(''), q = _b[0], setQ = _b[1];
    var _c = React.useState('All'), main = _c[0], setMain = _c[1];
    var term = q.trim().toLowerCase();
    var sorted = React.useMemo(function () { return depts.slice().sort(function (a, b) { return a.code.localeCompare(b.code); }); }, [depts]);
    var mains = React.useMemo(function () {
        var order = mainOrder(), found = Array.from(new Set(sorted.map(function (d) { return categoryOf(d.code).main; })));
        var rank = function (m) { return (order.indexOf(m) < 0 ? order.length : order.indexOf(m)); };
        return found.sort(function (a, b) { return rank(a) - rank(b); });
    }, [sorted]);
    var visible = sorted.filter(function (d) {
        var c = categoryOf(d.code);
        var text = [d.code, d.name, c.main, c.sub, c.subSub || ''].join(' ').toLowerCase();
        return (main === 'All' || c.main === main) && (!term || text.indexOf(term) >= 0);
    });
    var vis = visible.map(function (d) { return d.code; });
    var on = function (codes) { return codes.filter(function (c) { return draft.indexOf(c) >= 0; }).length; };
    var setMany = function (codes, value) {
        return setDraft(value ? draft.concat(codes.filter(function (c) { return draft.indexOf(c) < 0; })) : draft.filter(function (c) { return codes.indexOf(c) < 0; }));
    };
    var groupBox = function (label, codes, cls, title) {
        var n = on(codes);
        return (React.createElement("div", { className: cls, title: title },
            React.createElement(Checkbox, { label: label, checked: n === codes.length, indeterminate: n > 0 && n < codes.length, onChange: function (_, v) { return setMany(codes, !!v); } })));
    };
    var leaf = function (d, depth) { return (React.createElement("div", { key: d.code, className: 'ugI d' + depth },
        React.createElement(Checkbox, { checked: draft.indexOf(d.code) >= 0, onChange: function (_, v) { return setMany([d.code], !!v); }, onRenderLabel: function () { return React.createElement("span", { className: "ugL" },
                React.createElement("b", null, d.code),
                React.createElement("span", null, d.name)); } }))); };
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "ugHead" },
            React.createElement("input", { type: "search", className: "ugQ", placeholder: "Search a category, code or name", "aria-label": "Search departments", value: q, onChange: function (e) { return setQ(e.target.value); } }),
            React.createElement("div", { className: "ugSeg", role: "group", "aria-label": CATEGORY_LABELS[0] }, ['All'].concat(mains).map(function (m) { return (React.createElement("button", { key: m, type: "button", className: m === main ? 'on' : '', "aria-pressed": m === main, onClick: function () { return setMain(m); } }, m)); }))),
        React.createElement("div", { className: "fAll" },
            React.createElement(Checkbox, { label: "Select all", checked: vis.length > 0 && on(vis) === vis.length, indeterminate: on(vis) > 0 && on(vis) < vis.length, onChange: function (_, v) { return setMany(vis, !!v); } })),
        React.createElement("div", { className: "fList" },
            mains.map(function (m) {
                var inMain = visible.filter(function (d) { return categoryOf(d.code).main === m; });
                if (!inMain.length)
                    return null;
                // Sub Category groups inside this Main Category, in first-seen order.
                var subs = [];
                inMain.forEach(function (d) {
                    var s = categoryOf(d.code).sub;
                    var g = subs.filter(function (x) { return x.key === s; })[0];
                    if (!g) {
                        g = { key: s, label: s, codes: [], items: [] };
                        subs.push(g);
                    }
                    g.codes.push(d.code);
                    g.items.push(d);
                });
                return (React.createElement(React.Fragment, { key: m },
                    groupBox(m, inMain.map(function (d) { return d.code; }), 'ugH', CATEGORY_LABELS[0]),
                    subs.map(function (g) {
                        // A Sub Category that is the unit itself is shown as the unit; one that
                        // holds Sub Sub Categories (e.g. a department's resident missions) is a group.
                        var self = g.items.length === 1 && g.items[0].code === g.key && !categoryOf(g.key).subSub;
                        if (self)
                            return leaf(g.items[0], 1);
                        var owner = sorted.filter(function (d) { return d.code === g.key; })[0];
                        return (React.createElement(React.Fragment, { key: m + '/' + g.key },
                            groupBox(g.key + (owner ? '  ' + owner.name : ''), g.codes, 'ugS', CATEGORY_LABELS[1]),
                            g.items.map(function (d) { return leaf(d, 2); })));
                    })));
            }),
            !visible.length && React.createElement("div", { className: "ugNone" }, term ? 'Nothing matches.' : 'Nothing in this category in the sample data yet.'))));
};
//# sourceMappingURL=UnitChecklist.js.map