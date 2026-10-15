import * as React from 'react';
import { Dropdown, IDropdownOption } from '@fluentui/react';
import { IReportData, IDept, approxHead, trainingDone, documentSeries, DOC_MONTHS, sum } from '../lib/data';
import { F, short, pct } from '../lib/format';
import { Band, Panel, KpiRow, IKpi, Tiles, Search, Segmented, ExportButton, DeptCell, Pager, Caret } from '../components/ui';
import { DataTable, IColumn } from '../components/DataTable';
import { DeptFilter, filterDepts } from '../components/DeptFilter';
import { ColumnChart, ComboChart, Donut } from '../components/charts';

export interface IDashboardProps {
  data: IReportData;
  /** Opens Department Insights for one department. */
  openDept: (code: string) => void;
  /** The "Data as of" and Export to PDF controls for the title band. */
  bandTools: React.ReactNode;
}

const TIP = {
  head: 'The approximate number of people in each Department, Office, RM or RO, as provided by RAC.',
  active: 'People who opened or edited a file in an EDRMS site at least once in the last 180 days.',
  noAccess: 'An estimate of the people who have not opened any EDRMS site in the last 180 days: the approximate headcount minus the active users.',
  inList: 'The number of Departments, Offices, RMs and ROs shown in the table below.',
  trained: 'The number of people who have completed the EDRMS training course.',
  trainRate: 'The share of the approximate headcount who have completed the EDRMS training course.',
  docs: 'All files stored in EDRMS sites for the Departments, Offices, RMs and ROs shown.',
  rec: 'Documents that have been declared as official records in EDRMS.',
  declRate: 'Records declared as a share of all documents stored in EDRMS.',
  declUsers: 'The number of different people who have declared at least one record in EDRMS.',
  phys: 'Declared records that also exist on paper, for the Departments, Offices, RMs and ROs shown.',
  physShare: 'Physical counterparts as a share of all records declared in EDRMS.',
  totalDocs: 'All files stored in EDRMS sites at the end of the month shown.',
  newDocs: 'Files added to EDRMS sites in the period shown, net of files deleted.',
  storage: 'The space EDRMS sites use in SharePoint, in gigabytes, at the end of the month shown.'
};

/** The bank-wide headcount, rounded once to the nearest hundred. */
const roundedHead = (depts: IDept[]): number => Math.round(sum(depts, d => d.head) / 100) * 100;

/** The department column used by every table on this page. */
function deptColumn(width?: string): IColumn<IDept> {
  return { key: 'code', label: 'Department / Office / RM / RO', width, sortValue: d => d.code, render: d => <DeptCell code={d.code} name={d.name} /> };
}
const num = (key: string, label: string, get: (d: IDept) => number, show?: (d: IDept) => React.ReactNode): IColumn<IDept> =>
  ({ key, label, numeric: true, sortValue: get, render: d => (show ? show(d) : F(get(d))) });

/* ---------- search + filter + export, the same on every department table ---------- */

function useDeptQuery(depts: IDept[]): { q: string; setQ: (v: string) => void; sel: string[]; setSel: (v: string[]) => void; rows: IDept[]; key: string } {
  const [q, setQ] = React.useState('');
  const [sel, setSel] = React.useState<string[]>([]);
  const rows = React.useMemo(() => filterDepts(depts, sel, q), [depts, sel, q]);
  return { q, setQ, sel, setSel, rows, key: q + '|' + sel.join(',') };
}

/* ---------- Active EDRMS sites ---------- */

const SitesDrill: React.FC<{ depts: IDept[]; openDept: (c: string) => void }> = ({ depts, openDept }) => {
  const f = useDeptQuery(depts);
  const top = depts.slice().sort((a, b) => b.sites - a.sites || a.code.localeCompare(b.code)).slice(0, 10);
  const max = Math.max(1, ...top.map(d => d.sites));
  const cols = [deptColumn(), num('sites', 'Sites', d => d.sites)];
  return (
    <Panel>
      <div className="split">
        <div className="box">
          <h3 className="ptitle">Top 10 by number of sites</h3>
          <p className="psub">Highest site counts across departments, offices, RM and RO.</p>
          <div className="rank">
            {top.map(d => (
              <div className="rankRow" key={d.code} title={`${d.code} - ${d.name}: ${F(d.sites)} sites`}>
                <DeptCell code={d.code} name={d.name} plain />
                <div className="rankTrack"><div className="rankFill" style={{ width: (d.sites / max) * 100 + '%' }}>{F(d.sites)}</div></div>
              </div>
            ))}
          </div>
        </div>
        <div className="box">
          <h3 className="ptitle">Sites by department / office / RM / RO</h3>
          <div className="toolbar" style={{ marginTop: 10 }}>
            <Search value={f.q} onChange={f.setQ} placeholder="Search by department / office / RM / RO" />
            <DeptFilter depts={depts} selected={f.sel} onApply={f.setSel} />
            <ExportButton table={() => ({ name: 'Sites by department', head: ['Department / Office / RM / RO', 'Sites'], rows: f.rows.map(d => [d.code + ' - ' + d.name, d.sites]) })} />
          </div>
          <DataTable columns={cols} rows={f.rows} rowKey={d => d.code} noun="departments" resetKey={f.key}
            onRowClick={d => openDept(d.code)} emptyText="No department matches the search or filter." />
        </div>
      </div>
    </Panel>
  );
};

/* ---------- EDRMS users ---------- */

const UsersDrill: React.FC<{ depts: IDept[]; openDept: (c: string) => void }> = ({ depts, openDept }) => {
  const H = roundedHead(depts), U = sum(depts, d => d.users), T = sum(depts, trainingDone), rawH = sum(depts, d => d.head);
  const noAccess = (d: IDept): number => Math.max(0, approxHead(d) - d.users);
  const rate = (d: IDept): number => trainingDone(d) / d.head;
  const cols: IColumn<IDept>[] = [
    deptColumn('24%'),
    num('head', 'Approximate Headcount', approxHead),
    num('users', 'Users active in the last 180 days', d => d.users),
    num('idle', 'No access in 180 days (Approx)', noAccess),
    num('trained', 'Completed training', trainingDone),
    num('rate', 'Training completion', rate, d => <span className="trBar"><i style={{ width: Math.round(rate(d) * 100 * 0.6) }} />{(rate(d) * 100).toFixed(1)}%</span>)
  ];
  return (
    <Panel title="Total number of EDRMS users, by Department, Office, RM or RO"
      sub="Approximate headcount per Department, Office, RM or RO, provided by RAC, and how many of those people have or have not opened an EDRMS site in the last 180 days.">
      <Tiles items={[
        { label: 'Approximate Headcount', value: F(H), info: TIP.head },
        { label: 'Users active in the last 180 days', value: F(U), info: TIP.active },
        { label: 'No access in 180 days (Approx)', value: F(Math.max(0, H - U)), info: TIP.noAccess },
        { label: 'Departments, Offices, RMs and ROs in the list', value: F(depts.length), info: TIP.inList },
        { label: 'Completed training', value: F(T), info: TIP.trained },
        { label: 'Training completion', value: pct(T, rawH), info: TIP.trainRate }
      ]} />
      <div className="toolbar" style={{ justifyContent: 'flex-end' }}>
        <ExportButton table={() => ({
          name: 'EDRMS users by department', head: cols.map(c => c.label),
          rows: depts.map(d => [d.code + ' - ' + d.name, approxHead(d), d.users, noAccess(d), trainingDone(d), pct(trainingDone(d), d.head)])
        })} />
      </div>
      <DataTable columns={cols} rows={depts} rowKey={d => d.code} noun="departments" onRowClick={d => openDept(d.code)} />
    </Panel>
  );
};

const axisShort = (v: number): string => (v >= 1e6 ? (v / 1e6).toFixed(2) + 'M' : v >= 1000 ? Math.round(v / 1000) + 'k' : String(v));
const TileCard: React.FC<{ label: string; value: string; info: string }> = t => <Tiles items={[t]} />;


/* ---------- Documents in EDRMS: documents over time ---------- */

const DocumentsDrill: React.FC<{ depts: IDept[]; openDept: (c: string) => void; asOf: string }> = ({ depts, openDept, asOf }) => {
  const [year, setYear] = React.useState<'2024' | '2025' | '2026' | 'all'>('all');
  const [by, setBy] = React.useState<'y' | 'm'>('y');
  const [show, setShow] = React.useState<'t' | 'a'>('t');
  const [dept, setDept] = React.useState('all');

  const series = React.useMemo(() => {
    const o: { [c: string]: { start: number; held: number[] } } = {};
    depts.forEach(d => { o[d.code] = documentSeries(d); });
    return o;
  }, [depts]);
  const idx = DOC_MONTHS.map((m, i) => i).filter(i => year === 'all' || DOC_MONTHS[i].y === +year);
  const list = dept === 'all' ? depts : depts.filter(d => d.code === dept);
  const heldAt = (i: number): number => sum(list, d => (i < 0 ? series[d.code].start : series[d.code].held[i]));

  const groups: { key: string; lab: string; first: number; last: number }[] = [];
  idx.forEach(i => {
    const key = by === 'y' ? String(DOC_MONTHS[i].y) : String(i), lab = by === 'y' ? String(DOC_MONTHS[i].y) : DOC_MONTHS[i].lab;
    const g = groups[groups.length - 1];
    if (!g || g.key !== key) groups.push({ key, lab, first: i, last: i }); else g.last = i;
  });
  const first = idx[0], last = idx[idx.length - 1];
  const endHeld = heldAt(last), added = endHeld - heldAt(first - 1);
  const items = groups.map(g => ({ key: g.key, label: g.lab, value: show === 't' ? heldAt(g.last) : heldAt(g.last) - heldAt(g.first - 1) }));

  const period = year === 'all' ? 'all years' : year;
  const endLab = year === 'all' || year === '2026' ? asOf : 'Dec ' + year;
  const startLab = year === 'all' ? '2024' : year;
  interface IRow { d: IDept; start: number; end: number }
  const rows: IRow[] = depts.map(d => ({ d, start: first === 0 ? series[d.code].start : series[d.code].held[first - 1], end: series[d.code].held[last] }));
  const cols: IColumn<IRow>[] = [
    { key: 'code', label: 'Department / Office / RM / RO', width: '30%', sortValue: r => r.d.code, render: r => <DeptCell code={r.d.code} name={r.d.name} /> },
    { key: 'start', label: 'Total at start of ' + startLab, numeric: true, sortValue: r => r.start, render: r => F(r.start) },
    { key: 'end', label: 'Total as of ' + endLab, numeric: true, sortValue: r => r.end, render: r => F(r.end) },
    { key: 'new', label: 'New documents', numeric: true, sortValue: r => r.end - r.start, render: r => F(r.end - r.start) },
    { key: 'gb', label: 'Storage used (GB)', numeric: true, sortValue: r => r.d.gb, render: r => r.d.gb.toFixed(1) }
  ];
  const tS = sum(rows, r => r.start), tE = sum(rows, r => r.end), tGb = Math.round(sum(depts, d => d.gb));
  const deptOptions: IDropdownOption[] = [{ key: 'all', text: 'All Departments / Offices / RMs / ROs' }]
    .concat(depts.slice().sort((a, b) => a.code.localeCompare(b.code)).map(d => ({ key: d.code, text: d.code + ' - ' + d.name })));

  return (
    <Panel title="Documents over time" sub="How many documents are stored in EDRMS, and how many new documents were added, by Department / Office / RM / RO.">
      <div className="ctl">
        <div className="ctlG"><span className="ctlL">Year</span>
          <Segmented label="Year" value={year} onChange={setYear} options={[{ key: '2024', text: '2024' }, { key: '2025', text: '2025' }, { key: '2026', text: '2026' }, { key: 'all', text: 'All' }]} /></div>
        <div className="ctlG"><span className="ctlL">Show by</span>
          <Segmented label="Show by" value={by} onChange={setBy} options={[{ key: 'y', text: 'Year' }, { key: 'm', text: 'Month' }]} /></div>
        <div className="ctlG"><span className="ctlL">View</span>
          <Segmented label="View" value={show} onChange={setShow} options={[{ key: 't', text: 'Total documents' }, { key: 'a', text: 'New documents' }]} /></div>
        <div className="ctlG"><span className="ctlL">Department / Office / RM / RO</span>
          <Dropdown onRenderCaretDown={Caret} className="picker" selectedKey={dept} options={deptOptions} onChange={(_, o) => o && setDept(String(o.key))} ariaLabel="Department / Office / RM / RO" /></div>
      </div>
      <div className="tiles" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        {[
          { label: 'Total documents as of ' + endLab, value: F(endHeld), info: TIP.totalDocs },
          { label: 'New documents in ' + period, value: F(added), info: TIP.newDocs },
          { label: 'Storage used (GB) as of ' + asOf, value: F(Math.round(sum(list, d => d.gb))), info: TIP.storage }
        ].map(t => <TileCard key={t.label} {...t} />)}
      </div>
      <div className="legend"><span><i style={{ background: '#0072BC' }} />{(show === 't' ? 'Total documents at the end of each ' : 'New documents in each ') + (by === 'y' ? 'year' : 'month') + ', ' + period}</span></div>
      <ColumnChart items={items} height={260} valueLabel={axisShort} showValues={items.length <= 12} ariaLabel="Documents in EDRMS by period" />
      <div className="toolbar" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
        <ExportButton table={() => ({
          name: 'Documents over time', head: cols.map(c => c.label),
          rows: rows.map(r => [r.d.code + ' - ' + r.d.name, r.start, r.end, r.end - r.start, r.d.gb]),
          total: ['All Departments / Offices / RMs / ROs', tS, tE, tE - tS, tGb]
        })} />
      </div>
      <DataTable columns={cols} rows={rows} rowKey={r => r.d.code} noun="departments" defaultSort="end" defaultDir="desc"
        onRowClick={r => openDept(r.d.code)} highlight={r => r.d.code === dept}
        jumpTo={sorted => (dept === 'all' ? undefined : Math.floor(sorted.findIndex(r => r.d.code === dept) / 10) + 1)}
        totalRow={['All Departments / Offices / RMs / ROs', F(tS), F(tE), F(tE - tS), F(tGb)]} />
    </Panel>
  );
};
/* ---------- Records declared in EDRMS ---------- */

const RecordsDrill: React.FC<{ depts: IDept[]; openDept: (c: string) => void; usersDeclaring: number }> = ({ depts, openDept, usersDeclaring }) => {
  const D = sum(depts, d => d.docs), R = sum(depts, d => d.rec);
  const cols: IColumn<IDept>[] = [
    deptColumn('26%'),
    num('docs', 'Documents', d => d.docs),
    num('rec', 'Records declared', d => d.rec),
    num('rate', 'Declaration rate', d => d.rec / d.docs, d => pct(d.rec, d.docs, 2)),
    num('declaring', 'Unique users declaring records', d => d.declaring)
  ];
  return (
    <Panel title="Total number of records declared in EDRMS, by Department, Office, RM or RO" sub="Records declared and the people declaring them, by Department, Office, RM or RO.">
      <Tiles items={[
        { label: 'Documents', value: F(D), info: TIP.docs },
        { label: 'Records declared', value: F(R), info: TIP.rec },
        { label: 'Declaration rate', value: pct(R, D, 2), info: TIP.declRate },
        { label: 'Unique users declaring records', value: F(usersDeclaring), info: TIP.declUsers }
      ]} />
      <div className="toolbar" style={{ justifyContent: 'flex-end' }}>
        <ExportButton table={() => ({ name: 'Records declared by department', head: cols.map(c => c.label), rows: depts.map(d => [d.code + ' - ' + d.name, d.docs, d.rec, pct(d.rec, d.docs, 2), d.declaring]) })} />
      </div>
      <DataTable columns={cols} rows={depts} rowKey={d => d.code} noun="departments" onRowClick={d => openDept(d.code)} />
    </Panel>
  );
};

/* ---------- Physical counterparts ---------- */

const PhysicalPanel: React.FC<{ depts: IDept[]; openDept: (c: string) => void }> = ({ depts, openDept }) => {
  const f = useDeptQuery(depts);
  const inSel = filterDepts(depts, f.sel, '');
  const P = sum(inSel, d => d.phys), R = sum(inSel, d => d.rec);
  const cols: IColumn<IDept>[] = [
    deptColumn('34%'),
    num('phys', 'Physical counterparts', d => d.phys),
    num('rec', 'Records declared', d => d.rec),
    num('share', 'Share of records with a counterpart', d => d.phys / d.rec, d => pct(d.phys, d.rec))
  ];
  return (
    <Panel title="Total number of physical counterparts, by Department, Office, RM or RO." sub="Physical counterparts against declared records, by Department, Office, RM or RO.">
      <Tiles items={[
        { label: 'Physical counterparts', value: F(P), info: TIP.phys },
        { label: 'Records declared', value: F(R), info: TIP.rec },
        { label: 'Share of records with a counterpart', value: pct(P, R), info: TIP.physShare }
      ]} />
      <div className="split" style={{ gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)' }}>
        <div className="box">
          <div className="toolbar">
            <Search value={f.q} onChange={f.setQ} placeholder="Search by department / office / RM / RO" />
            <DeptFilter depts={depts} selected={f.sel} onApply={f.setSel} />
            <ExportButton table={() => ({ name: 'Physical counterparts by department', head: cols.map(c => c.label), rows: f.rows.map(d => [d.code + ' - ' + d.name, d.phys, d.rec, pct(d.phys, d.rec)]) })} />
          </div>
          <DataTable columns={cols} rows={f.rows} rowKey={d => d.code} noun="departments" resetKey={f.key}
            onRowClick={d => openDept(d.code)} emptyText="No department matches the search or filter." />
        </div>
        <div className="box">
          <div className="donutWrap">
            <Donut part={P} total={R} color="#0072BC" rest="#B9D7F2" caption="of records have a physical counterpart" />
            <table className="donutLegend"><tbody>
              <tr><td><i style={{ background: '#0072BC' }} />With a physical counterpart</td><td className="n">{F(P)}</td><td className="p">{pct(P, R)}</td></tr>
              <tr><td><i style={{ background: '#B9D7F2' }} />Without a physical counterpart</td><td className="n">{F(R - P)}</td><td className="p">{pct(R - P, R)}</td></tr>
            </tbody></table>
          </div>
        </div>
      </div>
    </Panel>
  );
};

/* ---------- Comparison ---------- */

const ComparisonPanel: React.FC<{ depts: IDept[]; openDept: (c: string) => void }> = ({ depts, openDept }) => {
  const [mode, setMode] = React.useState<'docs' | 'rec'>('docs');
  const [sortKey, setSortKey] = React.useState<'code' | 'a' | 'b'>('b');
  const [dir, setDir] = React.useState<'asc' | 'desc'>('desc');
  const [page, setPage] = React.useState(1);
  const f = useDeptQuery(depts);
  React.useEffect(() => setPage(1), [f.key, mode]);

  const lbl = mode === 'docs' ? 'Documents in EDRMS' : 'Records declared in EDRMS';
  const bColor = mode === 'docs' ? '#2677D4' : '#5CA943';
  const val = (d: IDept, k: string): number | string => (k === 'code' ? d.code : k === 'a' ? d.head : d[mode]);
  const rows = f.rows.slice().sort((x, y) => {
    const a = val(x, sortKey), b = val(y, sortKey);
    const r = typeof a === 'string' ? a.localeCompare(String(b)) : a - (b as number);
    return (dir === 'asc' ? r : -r) || x.code.localeCompare(y.code);
  });
  const PER = 20, pages = Math.max(1, Math.ceil(rows.length / PER)), cur = Math.min(page, pages);
  const aMax = Math.max(1, ...depts.map(d => d.head)), bMax = Math.max(1, ...depts.map(d => d[mode]));
  const K = (n: number): string => (n >= 10000 ? Math.round(n / 1000) + 'k' : F(n));
  const head = (k: 'code' | 'a' | 'b', text: string, swatch?: string): JSX.Element => (
    <button type="button" aria-sort={sortKey === k ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}
      onClick={() => { if (sortKey === k) setDir(dir === 'asc' ? 'desc' : 'asc'); else { setSortKey(k); setDir(k === 'code' ? 'asc' : 'desc'); } setPage(1); }}>
      {swatch && <i style={{ background: swatch }} />}{text}{sortKey === k ? (dir === 'asc' ? ' ↑' : ' ↓') : ''}
    </button>
  );
  const modes: IDropdownOption[] = [{ key: 'docs', text: 'Approximate headcount against documents in EDRMS' }, { key: 'rec', text: 'Approximate headcount against records declared in EDRMS' }];

  return (
    <Panel title="Compare Departments, Offices, RMs and ROs"
      sub={`Approximate headcount provided by RAC, compared with ${lbl.charAt(0).toLowerCase() + lbl.slice(1)}. Each column has its own scale.`}>
      <div className="toolbar" style={{ justifyContent: 'space-between' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="lbl">Compare</span>
          <Dropdown onRenderCaretDown={Caret} className="picker" style={{ minWidth: 330 }} selectedKey={mode} options={modes} onChange={(_, o) => o && setMode(o.key as 'docs' | 'rec')} ariaLabel="Compare" />
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '0 1 420px' }}>
          <Search value={f.q} onChange={f.setQ} placeholder="Search by department / office / RM / RO" />
          <DeptFilter depts={depts} selected={f.sel} onApply={f.setSel} />
        </span>
      </div>
      <div className="cmpH">{head('code', 'Department / Office / RM / RO')}{head('a', 'Approximate headcount', '#0F9F87')}{head('b', lbl, bColor)}</div>
      {rows.length ? rows.slice((cur - 1) * PER, cur * PER).map(d => (
        <div className="cmpR" key={d.code} role="button" tabIndex={0} style={{ cursor: 'pointer' }}
          onClick={() => openDept(d.code)} onKeyDown={e => { if (e.key === 'Enter') openDept(d.code); }}>
          <DeptCell code={d.code} name={d.name} />
          <div className="cmpTrack"><div className="cmpBar" title={'Approximate headcount: ' + F(d.head)} style={{ width: (d.head / aMax) * 100 + '%', background: '#0F9F87' }}>{K(d.head)}</div></div>
          <div className="cmpTrack"><div className="cmpBar" title={lbl + ': ' + F(d[mode])} style={{ width: (d[mode] / bMax) * 100 + '%', background: bColor }}>{K(d[mode])}</div></div>
        </div>
      )) : <p className="note" style={{ padding: 16 }}>No department matches the search or filter.</p>}
      <Pager total={rows.length} page={cur} size={PER} noun="departments" onPage={setPage} />
    </Panel>
  );
};
/* ---------- Records declaration trend ---------- */

type Preset = '3' | '6' | '12' | 'ytd' | 'all' | 'custom';
const PRESETS: { key: Preset; text: string }[] = [
  { key: '3', text: 'Last 3 months' }, { key: '6', text: 'Last 6 months' }, { key: '12', text: 'Last 12 months' },
  { key: 'ytd', text: 'Year to date' }, { key: 'all', text: 'All time' }
];

const TrendPanel: React.FC<{ data: IReportData }> = ({ data }) => {
  const t = data.trend, K = t.keys, last = K.length - 1;
  const [mode, setMode] = React.useState<Preset>('12');
  const [range, setRange] = React.useState<[string, string]>([K[Math.max(0, last - 11)], t.to]);
  const [draft, setDraft] = React.useState<[string, string]>(['', '']);
  const [view, setView] = React.useState<'y' | 'm'>('m');
  const [year, setYear] = React.useState<string | null>(null);

  const preset = (p: Preset): void => {
    const y = t.to.slice(0, 4) + '-01-01';
    const r: [string, string] = p === 'all' ? [t.from, t.to] : p === 'ytd' ? [y < t.from ? t.from : y, t.to] : [K[Math.max(0, last - Number(p) + 1)], t.to];
    setMode(p); setRange(r); setDraft(['', '']); setYear(null);
  };
  const apply = (): void => {
    let [a, b] = draft;
    if (!a) a = t.from; if (!b) b = t.to;
    if (b < a) b = a;
    setMode('custom'); setRange([a, b]); setYear(null);
  };

  const fm = range[0].slice(0, 7), tm = range[1].slice(0, 7);
  const inRange = K.map((k, i) => ({ k, i })).filter(m => m.k.slice(0, 7) >= fm && m.k.slice(0, 7) <= tm);
  const v = view === 'm' && inRange.length > 24 ? 'y' : view;
  const drill = v === 'y' && year && inRange.some(m => m.k.slice(0, 4) === year) ? year : null;
  const used = drill ? inRange.filter(m => m.k.slice(0, 4) === drill) : inRange;
  const gv = drill ? 'm' : v;
  const groups: { key: string; label: string; value: number }[] = [];
  used.forEach(m => {
    const key = gv === 'y' ? m.k.slice(0, 4) : m.k;
    const label = gv === 'y' ? key : drill ? t.labels[m.i].replace(/\s*'?\d{2,4}$/, '') : t.labels[m.i];
    const g = groups[groups.length - 1];
    if (!g || g.key !== key) groups.push({ key, label, value: t.values[m.i] }); else g.value += t.values[m.i];
  });
  const total = sum(groups, g => g.value);
  const unit = gv === 'y' ? 'year' : 'month';
  const canDrill = gv === 'y' && !drill;
  const today = t.to;

  return (
    <Panel title="Records declared over time" sub="Records declared on EDRMS compliant sites, by declaration date.">
      <div className="ctl">
        <div className="ctlG"><span className="ctlL">Preset</span>
          <Segmented label="Preset" value={mode} onChange={preset} options={PRESETS} /></div>
        <div className="ctlG"><span className="ctlL">Custom range</span>
          <div className="ctlRow">
            <input className="date" type="date" aria-label="From" min={t.from} max={today} value={draft[0]} onChange={e => setDraft([e.target.value, draft[1]])} />
            <span className="lbl" style={{ fontSize: 12, color: '#6B7A8C' }}>to</span>
            <input className="date" type="date" aria-label="To" min={draft[0] || t.from} max={today} value={draft[1]} onChange={e => setDraft([draft[0], e.target.value])} />
            <button type="button" className="btn primary" disabled={!draft[0] && !draft[1]} onClick={apply}>Apply</button>
            <button type="button" className="btn" onClick={() => preset('12')}>Reset</button>
          </div>
        </div>
        <div className="ctlG"><span className="ctlL" style={{ textAlign: 'right' }}>Show by</span>
          <Segmented label="Show by" value={view} onChange={x => { setView(x); setYear(null); }} options={[{ key: 'y', text: 'Year' }, { key: 'm', text: 'Month' }]} /></div>
      </div>
      <p className="note">{mode === 'custom' ? 'Custom range in use. Choosing a preset clears it.' : 'Preset in use: ' + (PRESETS.find(p => p.key === mode) || PRESETS[2]).text + '. Applying a custom range clears it.'}</p>
      {used.length ? (
        <>
          <Tiles items={[{ label: drill ? 'Records declared in ' + drill : 'Records declared in range', value: F(total) }]} />
          <div className="legend">
            <span><i style={{ background: '#5CA943' }} />Records declared per {unit} (left axis)</span>
            <span><i className="ln" style={{ background: '#0072BC' }} />Running total in {drill || 'range'} (right axis)</span>
            {drill && <span className="crumb"><a onClick={() => setYear(null)}>All years</a> &#8250; <b>{drill}</b></span>}
            {canDrill && <span className="crumb">Click a year to see its months</span>}
          </div>
          <ComboChart items={groups} onClick={canDrill ? setYear : undefined} ariaLabel={'Records declared per ' + unit + ' with running total'} />
        </>
      ) : <p className="note">No month with records falls inside this range.</p>}
    </Panel>
  );
};

export const BankWide: React.FC<IDashboardProps> = ({ data, openDept, bandTools }) => {
  const depts = data.depts;
  const [open, setOpen] = React.useState('sites');
  const totals = {
    sites: sum(depts, d => d.sites),
    head: roundedHead(depts),
    docs: sum(depts, d => d.docs),
    rec: sum(depts, d => d.rec)
  };
  const kpis: IKpi[] = [
    { key: 'sites', label: 'Active EDRMS sites', value: F(totals.sites), info: 'Compliant and active in Cloud Governance' },
    { key: 'users', label: 'EDRMS users', value: F(totals.head), info: 'Approximate workforce headcount' },
    { key: 'docs', label: 'Documents in EDRMS', value: short(totals.docs), info: 'All files on EDRMS sites' },
    { key: 'rec', label: 'Records declared in EDRMS', value: F(totals.rec), info: 'Declared as records via EDRMS' }
  ];

  return (
    <div className="dash-bw">
      <Band title="Bank-wide oversight" text="EDRMS adoption across ADB: sites, users, documents and declared records" tools={bandTools} />
      <KpiRow items={kpis} open={open} onOpen={setOpen} />
      {open === 'sites' && <SitesDrill depts={depts} openDept={openDept} />}
      {open === 'users' && <UsersDrill depts={depts} openDept={openDept} />}
      {open === 'docs' && <DocumentsDrill depts={depts} openDept={openDept} asOf={data.asOf} />}
      {open === 'rec' && <RecordsDrill depts={depts} openDept={openDept} usersDeclaring={data.totals.usersDeclaring} />}

      <Band title="Physical counterparts" text="Declared records that also exist on paper, and their share of all declared records." />
      <PhysicalPanel depts={depts} openDept={openDept} />

      <Band title="Comparison" text="Documents and records declared, set against the approximate headcount of each Department, Offices, RMs and ROs, provided by RAC." />
      <ComparisonPanel depts={depts} openDept={openDept} />

      <Band title="Records declaration trend" text="Records declared over time, per period and as a running total, for a date range you choose." />
      <TrendPanel data={data} />
    </div>
  );
};
