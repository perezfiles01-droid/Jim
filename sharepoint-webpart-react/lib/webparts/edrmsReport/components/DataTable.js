import * as React from 'react';
import { Pager } from './ui';
import { compare } from '../lib/format';
/** A sortable, paged table. Click a heading to sort, again to reverse. */
export function DataTable(p) {
    var size = p.pageSize || 10;
    var _a = React.useState(p.defaultSort || p.columns[0].key), sort = _a[0], setSort = _a[1];
    var _b = React.useState(p.defaultDir || 'asc'), dir = _b[0], setDir = _b[1];
    var _c = React.useState(1), page = _c[0], setPage = _c[1];
    React.useEffect(function () { return setPage(1); }, [p.resetKey]);
    var col = p.columns.find(function (c) { return c.key === sort; }) || p.columns[0];
    var sorted = React.useMemo(function () {
        var out = p.rows.slice().sort(function (a, b) { return compare(col.sortValue(a), col.sortValue(b)); });
        return dir === 'asc' ? out : out.reverse();
    }, [p.rows, col, dir]);
    var pages = Math.max(1, Math.ceil(sorted.length / size));
    var jump = p.jumpTo ? p.jumpTo(sorted) : undefined;
    React.useEffect(function () { if (jump)
        setPage(jump); }, [jump]);
    var current = Math.min(page, pages);
    var shown = sorted.slice((current - 1) * size, current * size);
    var onSort = function (c) {
        if (c.key === sort)
            setDir(dir === 'asc' ? 'desc' : 'asc');
        else {
            setSort(c.key);
            setDir(c.numeric ? 'desc' : 'asc');
        }
        setPage(1);
    };
    return (React.createElement("div", null,
        React.createElement("table", { className: "tbl" },
            React.createElement("thead", null,
                React.createElement("tr", null, p.columns.map(function (c) { return (React.createElement("th", { key: c.key, style: c.width ? { width: c.width } : undefined, className: (c.numeric ? 'n ' : '') + (c.key === sort ? 'on' : ''), "aria-sort": c.key === sort ? (dir === 'asc' ? 'ascending' : 'descending') : 'none', tabIndex: 0, onClick: function () { return onSort(c); }, onKeyDown: function (e) { if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSort(c);
                    } } },
                    c.label,
                    c.key === sort ? (dir === 'asc' ? ' ↑' : ' ↓') : '')); }))),
            React.createElement("tbody", null,
                shown.length ? shown.map(function (r) { return (React.createElement("tr", { key: p.rowKey(r), className: (p.onRowClick ? 'go ' : '') + (p.highlight && p.highlight(r) ? 'hl' : ''), tabIndex: p.onRowClick ? 0 : undefined, onClick: p.onRowClick ? function () { return p.onRowClick(r); } : undefined, onKeyDown: p.onRowClick ? function (e) { if (e.key === 'Enter')
                        p.onRowClick(r); } : undefined }, p.columns.map(function (c) { return React.createElement("td", { key: c.key, className: (c.numeric ? 'n ' : '') + (c.className || '') }, c.render(r)); }))); }) : (React.createElement("tr", null,
                    React.createElement("td", { className: "empty", colSpan: p.columns.length }, p.emptyText || 'Nothing matches.'))),
                p.totalRow && shown.length > 0 && (React.createElement("tr", { className: "tot" }, p.totalRow.map(function (c, i) { return React.createElement("td", { key: i, className: p.columns[i] && p.columns[i].numeric ? 'n' : '' }, c); }))))),
        React.createElement(Pager, { total: sorted.length, page: current, size: size, noun: p.noun, onPage: setPage })));
}
//# sourceMappingURL=DataTable.js.map