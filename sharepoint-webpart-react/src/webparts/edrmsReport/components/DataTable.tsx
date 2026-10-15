import * as React from 'react';
import { Pager } from './ui';
import { compare, SortDir } from '../lib/format';

export interface IColumn<T> {
  key: string;
  label: string;
  /** Right aligned, and sorted largest first on its first click. */
  numeric?: boolean;
  width?: string;
  sortValue: (row: T) => string | number;
  render: (row: T) => React.ReactNode;
  className?: string;
}

export interface IDataTableProps<T> {
  columns: IColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  noun: string;
  pageSize?: number;
  /** The column the table opens sorted by (ascending). */
  defaultSort?: string;
  defaultDir?: SortDir;
  /** Opens a row, e.g. a department in Department Insights. */
  onRowClick?: (row: T) => void;
  highlight?: (row: T) => boolean;
  /** A bold total row under the page. */
  totalRow?: React.ReactNode[];
  /** Change it to send the table back to page 1 (a new search or filter). */
  resetKey?: string;
  /** Which page to show, e.g. the page holding a chosen row. */
  jumpTo?: (sorted: T[]) => number | undefined;
  emptyText?: string;
}

/** A sortable, paged table. Click a heading to sort, again to reverse. */
export function DataTable<T>(p: IDataTableProps<T>): JSX.Element {
  const size = p.pageSize || 10;
  const [sort, setSort] = React.useState<string>(p.defaultSort || p.columns[0].key);
  const [dir, setDir] = React.useState<SortDir>(p.defaultDir || 'asc');
  const [page, setPage] = React.useState(1);

  React.useEffect(() => setPage(1), [p.resetKey]);

  const col = p.columns.find(c => c.key === sort) || p.columns[0];
  const sorted = React.useMemo(() => {
    const out = p.rows.slice().sort((a, b) => compare(col.sortValue(a), col.sortValue(b)));
    return dir === 'asc' ? out : out.reverse();
  }, [p.rows, col, dir]);

  const pages = Math.max(1, Math.ceil(sorted.length / size));
  const jump = p.jumpTo ? p.jumpTo(sorted) : undefined;
  React.useEffect(() => { if (jump) setPage(jump); }, [jump]);
  const current = Math.min(page, pages);
  const shown = sorted.slice((current - 1) * size, current * size);

  const onSort = (c: IColumn<T>): void => {
    if (c.key === sort) setDir(dir === 'asc' ? 'desc' : 'asc');
    else { setSort(c.key); setDir(c.numeric ? 'desc' : 'asc'); }
    setPage(1);
  };

  return (
    <div>
      <table className="tbl">
        <thead>
          <tr>
            {p.columns.map(c => (
              <th key={c.key} style={c.width ? { width: c.width } : undefined}
                className={(c.numeric ? 'n ' : '') + (c.key === sort ? 'on' : '')}
                aria-sort={c.key === sort ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                tabIndex={0} onClick={() => onSort(c)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSort(c); } }}>
                {c.label}{c.key === sort ? (dir === 'asc' ? ' ↑' : ' ↓') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shown.length ? shown.map(r => (
            <tr key={p.rowKey(r)}
              className={(p.onRowClick ? 'go ' : '') + (p.highlight && p.highlight(r) ? 'hl' : '')}
              tabIndex={p.onRowClick ? 0 : undefined}
              onClick={p.onRowClick ? () => p.onRowClick!(r) : undefined}
              onKeyDown={p.onRowClick ? e => { if (e.key === 'Enter') p.onRowClick!(r); } : undefined}>
              {p.columns.map(c => <td key={c.key} className={(c.numeric ? 'n ' : '') + (c.className || '')}>{c.render(r)}</td>)}
            </tr>
          )) : (
            <tr><td className="empty" colSpan={p.columns.length}>{p.emptyText || 'Nothing matches.'}</td></tr>
          )}
          {p.totalRow && shown.length > 0 && (
            <tr className="tot">{p.totalRow.map((c, i) => <td key={i} className={p.columns[i] && p.columns[i].numeric ? 'n' : ''}>{c}</td>)}</tr>
          )}
        </tbody>
      </table>
      <Pager total={sorted.length} page={current} size={size} noun={p.noun} onPage={setPage} />
    </div>
  );
}
