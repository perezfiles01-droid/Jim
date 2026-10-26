import * as React from 'react';
import { Callout, DirectionalHint } from '@fluentui/react';
import { FunnelGlyph } from './ui';
import { CategoryBar } from './CategoryBar';
/**
 * The Filter button on department tables. The popup holds the same Category >
 * Sub-category > Sub-group boxes as Department Insights (RAC Item 5, 22 Oct
 * 2026); Apply narrows the table. An empty selection means every department.
 */
export var DeptFilter = function (_a) {
    var depts = _a.depts, selected = _a.selected, onApply = _a.onApply;
    var _b = React.useState(false), open = _b[0], setOpen = _b[1];
    var _c = React.useState([]), draft = _c[0], setDraft = _c[1];
    var btn = React.useRef(null);
    var show = function () { setDraft(selected.slice()); setOpen(true); };
    var apply = function () { onApply(draft.length === depts.length ? [] : draft); setOpen(false); };
    var reset = function () { onApply([]); setOpen(false); };
    return (React.createElement(React.Fragment, null,
        React.createElement("button", { type: "button", ref: btn, className: 'fBtn' + (selected.length ? ' on' : ''), "aria-haspopup": "true", "aria-expanded": open, onClick: function () { return (open ? setOpen(false) : show()); } },
            React.createElement(FunnelGlyph, null),
            "Filter",
            selected.length ? " (".concat(selected.length, ")") : ''),
        open && (React.createElement(Callout, { target: btn, onDismiss: function () { return setOpen(false); }, directionalHint: DirectionalHint.bottomRightEdge, gapSpace: 6, setInitialFocus: true, role: "dialog", ariaLabel: "Filter departments", 
            // A box's own list opens in a separate layer; choosing from it must not close the popup.
            preventDismissOnEvent: function (ev) { return !!(ev.target instanceof Element && ev.target.closest('.ms-Layer')); } },
            React.createElement("div", { className: "fPop" },
                React.createElement("div", { className: "fHead" }, "Filter Department / Office / RM / RO"),
                React.createElement(CategoryBar, { depts: depts, codes: draft, onChange: setDraft, vertical: true }),
                React.createElement("div", { className: "fBtns" },
                    React.createElement("button", { type: "button", className: "btn", onClick: reset }, "Reset"),
                    React.createElement("button", { type: "button", className: "btn primary", onClick: apply }, "Apply")))))));
};
/** Filters and searches a department list the same way on every table. */
export function filterDepts(depts, selected, query) {
    var q = query.trim().toLowerCase();
    return depts.filter(function (d) { return (!selected.length || selected.indexOf(d.code) >= 0) &&
        (!q || (d.code + ' ' + d.name).toLowerCase().indexOf(q) >= 0); });
}
//# sourceMappingURL=DeptFilter.js.map