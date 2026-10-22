import * as React from 'react';
import { Dropdown, IDropdownOption, DropdownMenuItemType } from '@fluentui/react';
import { CategoryBar } from '../components/CategoryBar';
import {
  IReportData, ISite, ILibrary, sum, visitorSplit, siteCreated, ownerName, ownerInitials, libraryExtras
} from '../lib/data';
import { F, pct, refreshIso } from '../lib/format';
import { Band, Panel, KpiRow, IKpi, Search, Segmented, ExportButton, Chip, SumCard, Caret } from '../components/ui';
import { DataTable, IColumn } from '../components/DataTable';
import { BarList, ColumnChart } from '../components/charts';
import { IDashboardProps } from './BankWide';

const ALL = '__all';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtDate = (d: Date): string => d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();

export interface IDepartmentInsightsProps extends IDashboardProps {
  /** A department chosen on Bank-wide Oversight, shown first. */
  focus?: string;
}

/* ---------- pickers ---------- */

/** Sites inside the chosen departments. An empty list means all of them. */
const SitePicker: React.FC<{ sites: ISite[]; value: string[]; onChange: (v: string[]) => void }> = ({ sites, value, onChange }) => {
  const options: IDropdownOption[] = [{ key: ALL, text: 'All ' + F(sites.length) + ' sites' }, { key: 'div', text: '-', itemType: DropdownMenuItemType.Divider }]
    .concat(sites.map(s => ({ key: s.name, text: s.name })));
  return (
    <Dropdown onRenderCaretDown={Caret} className="picker" multiSelect options={options} selectedKeys={value.length ? value : [ALL]} ariaLabel="Site"
      styles={{ callout: { maxHeight: 360 } }}
      onRenderTitle={() => <span>{value.length ? (value.length === 1 ? value[0] : F(value.length) + ' sites') : 'All ' + F(sites.length) + ' sites'}</span>}
      onChange={(_, o) => {
        if (!o) return;
        if (o.key === ALL) { onChange([]); return; }
        onChange(o.selected ? value.concat(String(o.key)) : value.filter(n => n !== o.key));
      }} />
  );
};

function sitesOf(data: IReportData, codes: string[]): ISite[] {
  const list = codes.length ? data.depts.filter(d => codes.indexOf(d.code) >= 0) : data.depts;
  return list.reduce((a, d) => a.concat(data.sites[d.code] || []), [] as ISite[]);
}

/* ---------- Go-Live date and site convention ---------- */

const ProfileStrip: React.FC<{ codes: string[] }> = ({ codes }) => {
  const one = codes.length === 1 ? codes[0] : null;
  let date = 'Varies by department';
  if (one) {
    let s = 0;
    for (let i = 0; i < one.length; i++) s = (s * 31 + one.charCodeAt(i)) % 997;
    date = (1 + (s % 28)) + ' ' + MONTHS[s % 12] + ' ' + (2024 + (s % 2));
  }
  return (
    <div className="strip">
      <div className="chipCard">
        <div className="ic"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg></div>
        <div><div className="k">Go-Live date</div><div className="v">{date}</div><div className="h">When this department started using EDRMS</div></div>
      </div>
      <div className="chipCard">
        <div className="ic"><svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" /><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" /></svg></div>
        <div><div className="k">Site convention</div>
          {one
            ? <><a href="#" onClick={e => e.preventDefault()} title="Link to be provided by RAC">View guide &#8599;</a><div className="h">Approved naming for sites, libraries and folders</div></>
            : <><div className="v muted">Select a department</div><div className="h">Each department has its own approved guide</div></>}
        </div>
      </div>
    </div>
  );
};

/* ---------- EDRMS sites: who owns them and when they were created ---------- */

const SitesCreated: React.FC<{ sites: ISite[]; resetKey: string }> = ({ sites, resetKey }) => {
  const now = new Date(), minD = new Date(2024, 0, 1), maxD = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const [year, setYear] = React.useState('all');
  const [draft, setDraft] = React.useState<[string, string]>(['', '']);
  const [custom, setCustom] = React.useState<[string, string] | null>(null);
  const [period, setPeriod] = React.useState<string | null>(null);
  const [q, setQ] = React.useState('');

  const rows = React.useMemo(() => sites.map(s => ({ s, dt: siteCreated(s) })), [sites]);
  const parse = (v: string): Date | null => (v ? new Date(+v.slice(0, 4), +v.slice(5, 7) - 1, +v.slice(8, 10)) : null);
  let a: Date | null = null, b: Date | null = null, g: 'y' | 'm' = 'y';
  if (custom) {
    a = parse(custom[0]) || minD; b = parse(custom[1]) || maxD;
    if (b < a) { const t = a; a = b; b = t; }
    b = new Date(b.getFullYear(), b.getMonth(), b.getDate(), 23, 59, 59);
    g = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()) + 1 <= 24 ? 'm' : 'y';
  } else if (year !== 'all') { a = new Date(+year, 0, 1); b = new Date(+year, 11, 31, 23, 59, 59); g = 'm'; }
  const keyOf = (d: Date): string => (g === 'y' ? String(d.getFullYear()) : d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2));
  const labOf = (k: string): string => (g === 'y' ? k : MONTHS[+k.slice(5) - 1] + " '" + k.slice(2, 4));
  const inRange = rows.filter(r => (!a || r.dt >= a) && (!b || r.dt <= b));
  const periods: string[] = [];
  const pa = a && a > minD ? a : minD, pb = b && b < maxD ? b : maxD;
  if (g === 'y') for (let y = pa.getFullYear(); y <= pb.getFullYear(); y++) periods.push(String(y));
  else for (let d = new Date(pa.getFullYear(), pa.getMonth(), 1); d <= pb; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) periods.push(keyOf(d));
  const counts = periods.map(p => ({ key: p, label: g === 'y' ? p : periods.length <= 14 ? MONTHS[+p.slice(5) - 1] : labOf(p), value: inRange.filter(r => keyOf(r.dt) === p).length }));

  const term = q.trim().toLowerCase();
  const shown = inRange.filter(r => (!period || keyOf(r.dt) === period) &&
    (!term || (r.s.name + ' ' + r.s.owner + ' ' + ownerName(r.s.owner)).toLowerCase().indexOf(term) >= 0));
  type Row = typeof rows[0];
  const cols: IColumn<Row>[] = [
    { key: 'name', label: 'Site', width: '46%', sortValue: r => r.s.name, render: r => r.s.name, className: 'strong' },
    { key: 'owner', label: 'Site owner', width: '30%', sortValue: r => ownerName(r.s.owner), render: r => <span title={r.s.owner}><span className="av">{ownerInitials(r.s.owner)}</span>{ownerName(r.s.owner)}</span> },
    { key: 'created', label: 'Created', sortValue: r => r.dt.getTime(), render: r => fmtDate(r.dt) }
  ];
  const years: string[] = [];
  for (let y = maxD.getFullYear(); y >= 2024; y--) years.push(String(y));
  const clickBar = (k: string): void => { if (g === 'y' && !custom) { setYear(k); setPeriod(null); } else setPeriod(period === k ? null : k); };
  const title = custom ? 'Sites created, selected range' : year !== 'all' ? 'Sites created in ' + year : 'Sites created over time';

  return (
    <Panel title="EDRMS sites" sub="Each EDRMS site, who owns it, and when it was created.">
      <div className="ctl" style={{ justifyContent: 'flex-start' }}>
        <div className="ctlG"><span className="ctlL">Year</span>
          <Dropdown onRenderCaretDown={Caret} className="picker" style={{ minWidth: 130 }} selectedKey={year} ariaLabel="Year"
            options={[{ key: 'all', text: 'All years' }].concat(years.map(y => ({ key: y, text: y })))}
            onChange={(_, o) => { if (o) { setYear(String(o.key)); setCustom(null); setDraft(['', '']); setPeriod(null); } }} /></div>
        <div className="ctlG"><span className="ctlL">Custom range</span>
          <div className="ctlRow">
            <input className="date" type="date" aria-label="From" min="2024-01-01" max={refreshIso()} value={draft[0]} onChange={e => setDraft([e.target.value, draft[1]])} />
            <span style={{ fontSize: 12, color: '#6B7A8C' }}>to</span>
            <input className="date" type="date" aria-label="To" min={draft[0] || '2024-01-01'} max={refreshIso()} value={draft[1]} onChange={e => setDraft([draft[0], e.target.value])} />
            <button type="button" className="btn primary" disabled={!draft[0] && !draft[1]} onClick={() => { setCustom(draft); setYear('all'); setPeriod(null); }}>Apply</button>
            <button type="button" className="btn" onClick={() => { setYear('all'); setCustom(null); setDraft(['', '']); setPeriod(null); }}>Reset</button>
          </div>
        </div>
      </div>
      <div className="split">
        <div className="box">
          <div className="toolbar">
            <Search value={q} onChange={setQ} placeholder="Search a site or owner" />
            {period && <Chip text={'Created: ' + labOf(period)} onClear={() => setPeriod(null)} />}
            <ExportButton table={() => ({ name: 'EDRMS sites', head: ['Site', 'Site owner', 'Created'], rows: shown.map(r => [r.s.name, ownerName(r.s.owner), fmtDate(r.dt)]) })} />
          </div>
          <DataTable columns={cols} rows={shown} rowKey={r => r.s.name} noun="sites" resetKey={resetKey + q + period + year + String(custom)} emptyText="No sites match." />
        </div>
        <div className="box">
          <div className="boxHd">
            <div><div className="boxT">{title}</div><div className="boxS">{g === 'y' ? 'Click a year to see its months.' : 'Click a month to see the sites created then.'}</div></div>
            {!custom && year !== 'all' && <span className="crumb"><a onClick={() => { setYear('all'); setPeriod(null); }}>All years</a> &#8250; <b>{year}</b></span>}
          </div>
          <ColumnChart items={counts} width={560} height={430} selected={period} onClick={clickBar} ariaLabel="Sites created over time" />
        </div>
      </div>
    </Panel>
  );
};

/* ---------- a table of sites beside a Top 10 chart ---------- */

interface IMetric<T> {
  key: string;
  seg: string;
  get: (r: T) => number;
  fmt: (r: T) => string;
  /** For the tie line: "7 physical counterparts". */
  noun: string;
  chartTitle: string;
  chartSub: string;
  chip: (v: string) => string;
}

/** Ties are compared as they are shown, so 0.4 GB and 0.43 GB count as different. */
function tieValue<T>(m: IMetric<T>, r: T): string { return m.fmt(r); }

function useTopPick<T extends { name: string }>(rows: T[], metric: IMetric<T>, alt: (r: T) => number): {
  top: T[]; more: number; sel: string | null; setSel: (v: string | null) => void; tie: string | null; setTie: (v: string | null) => void; match: (r: T) => boolean;
} {
  const [sel, setSel] = React.useState<string | null>(null);
  const [tie, setTie] = React.useState<string | null>(null);
  const top = rows.slice().sort((a, b) => metric.get(b) - metric.get(a) || alt(b) - alt(a) || a.name.localeCompare(b.name)).slice(0, 10);
  let more = 0;
  if (top.length === 10) {
    const k = tieValue(metric, top[9]), shown = top.map(r => r.name);
    more = rows.filter(r => tieValue(metric, r) === k && shown.indexOf(r.name) < 0).length;
  }
  const match = (r: T): boolean => (!sel || r.name === sel) && (!tie || tieValue(metric, r) === tie);
  return { top, more, sel, setSel: v => { setSel(v); setTie(null); }, tie, setTie: v => { setTie(v); setSel(null); }, match };
}

interface IDrillSpec {
  title: string;
  sub: (sites: ISite[]) => React.ReactNode;
  columns: IColumn<ISite>[];
  metrics: IMetric<ISite>[];
  exportHead: string[];
  exportRow: (s: ISite) => (string | number)[];
}

const siteCol: IColumn<ISite> = { key: 'name', label: 'Site', sortValue: s => s.name, render: s => s.name, className: 'strong' };
const short = (s: ISite): string => s.name.replace(/ Site$/, '');

const DOCS_SPEC: IDrillSpec = {
  title: 'Documents',
  sub: sites => { const gb = sum(sites, s => s.gb); return <>Files stored in each EDRMS site, and the storage they use. Total storage: <b>{gb >= 1000 ? (gb / 1000).toFixed(2) + ' TB' : gb.toFixed(1) + ' GB'}</b>.</>; },
  columns: [siteCol,
    { key: 'docs', label: 'Documents', numeric: true, width: '120px', sortValue: s => s.docs, render: s => F(s.docs) },
    { key: 'gb', label: 'Storage (GB)', numeric: true, width: '120px', sortValue: s => s.gb, render: s => s.gb.toFixed(1) }],
  metrics: [
    { key: 'docs', seg: 'Documents', get: s => s.docs, fmt: s => F(s.docs), noun: 'documents', chartTitle: 'Sites with the most documents', chartSub: 'Top 10 by number of documents. Click a bar to find it in the table.', chip: v => 'Documents: ' + v },
    { key: 'gb', seg: 'Storage', get: s => s.gb, fmt: s => s.gb.toFixed(1) + ' GB', noun: 'of storage', chartTitle: 'Sites using the most storage', chartSub: 'Top 10 by storage used. Click a bar to find it in the table.', chip: v => 'Storage: ' + v }],
  exportHead: ['Site', 'Documents', 'Storage (GB)'],
  exportRow: s => [s.name, s.docs, s.gb]
};

const REC_SPEC: IDrillSpec = {
  title: 'Records declared',
  sub: () => 'Records declared in each EDRMS site, and the people who declared them.',
  columns: [siteCol,
    { key: 'rec', label: 'Records', numeric: true, width: '110px', sortValue: s => s.rec, render: s => F(s.rec) },
    { key: 'declaring', label: 'People who declared', numeric: true, width: '160px', sortValue: s => s.declaring, render: s => F(s.declaring) }],
  metrics: [
    { key: 'rec', seg: 'Records', get: s => s.rec, fmt: s => F(s.rec), noun: 'records', chartTitle: 'Sites with the most records', chartSub: 'Top 10 by records declared. Click a bar to find it in the table.', chip: v => 'Records: ' + v },
    { key: 'declaring', seg: 'People', get: s => s.declaring, fmt: s => F(s.declaring), noun: 'people declaring', chartTitle: 'Sites with the most people declaring', chartSub: 'Top 10 by people who declared. Click a bar to find it in the table.', chip: v => 'People who declared: ' + v }],
  exportHead: ['Site', 'Records', 'People who declared'],
  exportRow: s => [s.name, s.rec, s.declaring]
};

const share = (s: ISite): number => (s.rec ? s.phys / s.rec : 0);
const PHYS_SPEC: IDrillSpec = {
  title: 'Physical Counterparts',
  sub: () => 'Records in each EDRMS site that also have a paper or physical version.',
  columns: [siteCol,
    { key: 'phys', label: 'Physical Counterparts', numeric: true, width: '170px', sortValue: s => s.phys, render: s => F(s.phys) },
    { key: 'rec', label: 'Records', numeric: true, width: '100px', sortValue: s => s.rec, render: s => F(s.rec) },
    { key: 'share', label: 'Share', numeric: true, width: '90px', sortValue: share, render: s => (share(s) * 100).toFixed(1) + '%' }],
  metrics: [
    { key: 'phys', seg: 'Count', get: s => s.phys, fmt: s => F(s.phys), noun: 'physical counterparts', chartTitle: 'Sites with the most physical counterparts', chartSub: 'Top 10 by number of physical counterparts. Click a bar to find it in the table.', chip: v => 'Physical Counterparts: ' + v },
    { key: 'share', seg: 'Share', get: share, fmt: s => (share(s) * 100).toFixed(1) + '%', noun: 'share', chartTitle: 'Sites with the highest share', chartSub: 'Top 10 by share of records with a physical counterpart. Click a bar to find it in the table.', chip: v => 'Share: ' + v }],
  exportHead: ['Site', 'Physical Counterparts', 'Records', 'Share'],
  exportRow: s => [s.name, s.phys, s.rec, (share(s) * 100).toFixed(1) + '%']
};

const MetricDrill: React.FC<{ sites: ISite[]; resetKey: string; spec: IDrillSpec }> = ({ sites, resetKey, spec }) => {
  const [mk, setMk] = React.useState(spec.metrics[0].key);
  const [q, setQ] = React.useState('');
  const m = spec.metrics.find(x => x.key === mk) || spec.metrics[0];
  const other = spec.metrics.find(x => x !== m) || m;
  const t = useTopPick(sites, m, other.get);
  React.useEffect(() => { t.setSel(null); }, [resetKey, mk]);
  const term = q.trim().toLowerCase();
  const rows = sites.filter(s => t.match(s) && (!term || s.name.toLowerCase().indexOf(term) >= 0));
  const chip = t.sel || (t.tie ? m.chip(t.tie) : null);
  return (
    <Panel title={spec.title} sub={spec.sub(sites)}>
      <div className="split">
        <div className="box">
          <div className="toolbar">
            <Search value={q} onChange={setQ} placeholder="Search a site" />
            {chip && <Chip text={chip} onClear={() => t.setSel(null)} />}
            <ExportButton table={() => ({ name: spec.title, head: spec.exportHead, rows: rows.map(spec.exportRow) })} />
          </div>
          <DataTable columns={spec.columns} rows={rows} rowKey={s => s.name} noun="sites" resetKey={resetKey + q + chip} highlight={s => s.name === t.sel} emptyText="No sites match." />
        </div>
        <div className="box">
          <div className="boxHd">
            <div><div className="boxT">{m.chartTitle}</div><div className="boxS">{m.chartSub}</div></div>
            <Segmented label="Measure" value={mk} onChange={setMk} options={spec.metrics.map(x => ({ key: x.key, text: x.seg }))} />
          </div>
          <BarList selected={t.sel} onSelect={t.setSel}
            items={t.top.map(s => ({ key: s.name, name: short(s), value: m.get(s), label: m.fmt(s), title: s.name + ': ' + m.fmt(s) }))}
            more={t.more ? { text: `+ ${F(t.more)} more site${t.more > 1 ? 's' : ''} with ${m.fmt(t.top[9])} ${m.noun}`, onClick: () => t.setTie(tieValue(m, t.top[9])) } : undefined} />
        </div>
      </div>
    </Panel>
  );
};

/* ---------- Site visitors ---------- */

interface IVisitorRow extends ISite { internal: number; external: number; stype: string }

const VisitorsDrill: React.FC<{ sites: ISite[]; resetKey: string }> = ({ sites, resetKey }) => {
  const rows: IVisitorRow[] = React.useMemo(() => sites.map(s => ({ ...s, ...visitorSplit(s), stype: /Project/.test(s.ermsType) ? 'Project' : 'Traditional' })), [sites]);
  const [mk, setMk] = React.useState<'visitors' | 'internal' | 'external'>('visitors');
  const [q, setQ] = React.useState('');
  const noun = { visitors: 'unique visitors', internal: 'internal visitors', external: 'external visitors' }[mk];
  const metric: IMetric<IVisitorRow> = { key: mk, seg: '', get: r => r[mk], fmt: r => F(r[mk]), noun, chartTitle: '', chartSub: '', chip: v => ({ visitors: 'Unique visitors', internal: 'Internal', external: 'External' }[mk]) + ': ' + v };
  const t = useTopPick(rows, metric, r => r.visitors);
  React.useEffect(() => { t.setSel(null); }, [resetKey, mk]);
  const T = sum(rows, r => r.visitors), TI = sum(rows, r => r.internal), TE = T - TI;
  const term = q.trim().toLowerCase();
  const shown = rows.filter(r => t.match(r) && (!term || r.name.toLowerCase().indexOf(term) >= 0));
  const pc = (a: number, b: number): string => (b ? Math.round((a / b) * 100) : 0) + '%';
  const cols: IColumn<IVisitorRow>[] = [
    { key: 'name', label: 'Site', sortValue: r => r.name, render: r => r.name, className: 'strong' },
    { key: 'stype', label: 'Site type', width: '110px', sortValue: r => r.stype, render: r => <span className={'type ' + (r.stype === 'Project' ? 'p' : 't')}>{r.stype}</span> },
    { key: 'visitors', label: 'Unique visitors', numeric: true, width: '120px', sortValue: r => r.visitors, render: r => F(r.visitors) },
    { key: 'internal', label: 'Internal (#, %)', numeric: true, width: '120px', sortValue: r => r.internal, render: r => <>{F(r.internal)}<span className="muted">({pc(r.internal, r.visitors)})</span></> },
    { key: 'external', label: 'External (#, %)', numeric: true, width: '120px', sortValue: r => r.external, render: r => <>{F(r.external)}<span className="muted">({pc(r.external, r.visitors)})</span></> }
  ];
  const chip = t.sel || (t.tie ? metric.chip(t.tie) : null);
  return (
    <Panel title="Site visitors" sub="Number of people who opened each site in the last 180 days. A person who visits many times is counted once.">
      <div className="sumRow" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        <SumCard label="Unique visitors" value={F(T)} info="The number of different people who opened at least one EDRMS site in the last 180 days. A person who opened several sites is counted once.">
          <div className="split2"><span style={{ width: (T ? TI / T * 100 : 0) + '%', background: '#0072BC' }} /><span style={{ width: (T ? TE / T * 100 : 0) + '%', background: '#D97706' }} /></div>
        </SumCard>
        <SumCard label="Internal visitors" swatch="#0072BC" value={<>{F(TI)}<small>{pct(TI, T)}</small></>} hint="People with an ADB account" />
        <SumCard label="External visitors" swatch="#D97706" value={<>{F(TE)}<small>{pct(TE, T)}</small></>} hint="Guests and people without an ADB account" />
      </div>
      <div className="split">
        <div className="box">
          <div className="toolbar">
            <Search value={q} onChange={setQ} placeholder="Search a site" />
            {chip && <Chip text={chip} onClear={() => t.setSel(null)} />}
            <ExportButton table={() => ({ name: 'Site visitors', head: ['Site', 'Site type', 'Unique visitors', 'Internal', 'External'], rows: shown.map(r => [r.name, r.stype, r.visitors, r.internal, r.external]) })} />
          </div>
          <DataTable columns={cols} rows={shown} rowKey={r => r.name} noun="sites" resetKey={resetKey + q + chip} highlight={r => r.name === t.sel} emptyText="No sites match." />
        </div>
        <div className="box">
          <div className="boxHd">
            <div><div className="boxT">Most visited sites</div><div className="boxS">Top 10 by {noun}. Click a bar to find it in the table.</div></div>
            <Segmented label="Visitors" value={mk} onChange={setMk} options={[{ key: 'visitors', text: 'All' }, { key: 'internal', text: 'Internal' }, { key: 'external', text: 'External' }]} />
          </div>
          <BarList selected={t.sel} onSelect={t.setSel} color={mk === 'external' ? '#D97706' : undefined}
            items={t.top.map(r => ({ key: r.name, name: short(r), value: r[mk], label: F(r[mk]), title: `${r.name}: ${F(r.visitors)} visitors (${F(r.internal)} internal, ${F(r.external)} external)` }))}
            more={t.more ? { text: `+ ${F(t.more)} more site${t.more > 1 ? 's' : ''} with ${F(t.top[9][mk])} ${noun}`, onClick: () => t.setTie(F(t.top[9][mk])) } : undefined} />
        </div>
      </div>
    </Panel>
  );
};

/* ---------- Library usage ---------- */

interface ILibRow extends ILibrary { key: string; name: string; folders: number; users: number }

type LibMetric = 'folders' | 'docs' | 'rec' | 'phys' | 'users';
const LIB_LABEL: { [k in LibMetric]: string } = { folders: 'folders', docs: 'documents', rec: 'records declared', phys: 'physical counterparts', users: 'active users' };

const LibraryUsage: React.FC<{ data: IReportData; focus?: string }> = ({ data, focus }) => {
  const [codes, setCodes] = React.useState<string[]>(focus ? [focus] : []);
  const [siteSel, setSiteSel] = React.useState<string[]>([]);
  const [mk, setMk] = React.useState<LibMetric>('docs');
  const [q, setQ] = React.useState('');
  React.useEffect(() => { if (focus) { setCodes([focus]); setSiteSel([]); } }, [focus]);

  const deptSites = React.useMemo(() => sitesOf(data, codes), [data, codes]);
  const libs: ILibRow[] = React.useMemo(() => {
    const raw = codes.length ? codes.reduce((a, c) => a.concat(data.libsByDept[c] || []), [] as ILibrary[]) : data.libsAll;
    return raw.filter(l => !siteSel.length || siteSel.indexOf(l.site) >= 0)
      .map((l, i) => ({ ...l, ...libraryExtras(l), key: l.lib + '||' + l.site + '||' + i, name: l.lib + '||' + l.site + '||' + i }));
  }, [data, codes, siteSel]);

  const metric: IMetric<ILibRow> = { key: mk, seg: '', get: l => l[mk], fmt: l => F(l[mk]), noun: LIB_LABEL[mk], chartTitle: '', chartSub: '', chip: v => v };
  const alt: { [k in LibMetric]: LibMetric } = { folders: 'docs', docs: 'rec', rec: 'phys', phys: 'rec', users: 'docs' };
  const t = useTopPick(libs, metric, l => l[alt[mk]]);
  const resetKey = codes.join(',') + '|' + siteSel.join(',') + mk;
  React.useEffect(() => { t.setSel(null); }, [resetKey]);

  const maxU = Math.max(0, ...libs.map(l => l.users)), uniqueUsers = Math.min(sum(libs, l => l.users), Math.round(maxU * 3));
  const term = q.trim().toLowerCase();
  const shown = libs.filter(l => t.match(l) && (!term || (l.lib + ' ' + l.site).toLowerCase().indexOf(term) >= 0));
  const cols: IColumn<ILibRow>[] = [
    { key: 'lib', label: 'Library', width: '22%', sortValue: l => l.lib, render: l => l.lib, className: 'strong' },
    { key: 'site', label: 'Site', width: '23%', sortValue: l => l.site, render: l => <span style={{ color: '#33475F' }}>{l.site}</span> },
    { key: 'folders', label: 'Folders', numeric: true, width: '10%', sortValue: l => l.folders, render: l => F(l.folders) },
    { key: 'docs', label: 'Documents', numeric: true, width: '11%', sortValue: l => l.docs, render: l => F(l.docs) },
    { key: 'rec', label: 'Records', numeric: true, width: '10%', sortValue: l => l.rec, render: l => F(l.rec) },
    { key: 'phys', label: 'Physical counterparts', numeric: true, width: '13%', sortValue: l => l.phys, render: l => F(l.phys) },
    { key: 'users', label: 'Active users', numeric: true, width: '11%', sortValue: l => l.users, render: l => F(l.users) }
  ];
  const tieChip = t.tie ? ({ folders: 'Folders', docs: 'Documents', rec: 'Records', phys: 'Physical Counterparts', users: 'Active users' }[mk]) + ': ' + t.tie : null;
  const chip = t.sel ? t.sel.split('||')[0] : tieChip;

  return (
    <Panel title="Libraries by Department / Office / RM / RO">
      <div className="toolbar">
        <CategoryBar depts={data.depts} codes={codes} onChange={v => { setCodes(v); setSiteSel([]); }}
          site={<SitePicker sites={deptSites} value={siteSel} onChange={setSiteSel} />} />
      </div>
      <div className="sumRow" style={{ gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' }}>
        <SumCard label="Libraries" value={F(libs.length)} hint="Document libraries in EDRMS sites" />
        <SumCard label="Folders" value={F(sum(libs, l => l.folders))} hint="Folders inside these libraries" />
        <SumCard label="Documents" value={F(sum(libs, l => l.docs))} hint="Files stored in these libraries" />
        <SumCard label="Records declared" value={F(sum(libs, l => l.rec))} hint="Documents saved as official records" />
        <SumCard label="Physical Counterparts" value={F(sum(libs, l => l.phys))} hint="Records that also have a paper or physical version" />
        <SumCard label="Active users" value={F(uniqueUsers)} hint="People who opened or edited files, last 180 days" />
      </div>
      <div className="box" style={{ marginBottom: 14 }}>
        <div className="boxHd">
          <div><div className="boxT">{mk === 'users' ? 'Most used libraries' : 'Largest libraries'}</div><div className="boxS">Top 10 by {LIB_LABEL[mk]}. Click a bar to find it in the table.</div></div>
          <Segmented label="Measure" value={mk} onChange={setMk} options={[{ key: 'folders', text: 'Folders' }, { key: 'docs', text: 'Documents' }, { key: 'rec', text: 'Records' }, { key: 'phys', text: 'Counterparts' }, { key: 'users', text: 'Users' }]} />
        </div>
        <BarList selected={t.sel} onSelect={t.setSel} valueWidth={64}
          items={t.top.map(l => ({ key: l.name, name: l.lib, note: l.site, value: l[mk], label: F(l[mk]), title: `${l.lib} (${l.site}): ${F(l[mk])} ${LIB_LABEL[mk]}` }))}
          more={t.more ? { text: `+ ${F(t.more)} more librar${t.more > 1 ? 'ies' : 'y'} with ${F(t.top[9][mk])} ${LIB_LABEL[mk]}`, onClick: () => t.setTie(F(t.top[9][mk])) } : undefined} />
      </div>
      <div className="box">
        <div className="toolbar">
          <Search value={q} onChange={setQ} placeholder="Search a library or site" />
          {chip && <Chip text={chip} onClear={() => t.setSel(null)} />}
          <ExportButton table={() => ({ name: 'Library usage', head: cols.map(c => c.label), rows: shown.map(l => [l.lib, l.site, l.folders, l.docs, l.rec, l.phys, l.users]) })} />
        </div>
        <DataTable columns={cols} rows={shown} rowKey={l => l.key} noun="libraries" resetKey={resetKey + q + chip} highlight={l => l.name === t.sel} emptyText="No libraries match." />
      </div>
    </Panel>
  );
};

/* ---------- the dashboard ---------- */

export const DepartmentInsights: React.FC<IDepartmentInsightsProps> = ({ data, bandTools, focus }) => {
  const [codes, setCodes] = React.useState<string[]>(focus ? [focus] : []);
  const [siteSel, setSiteSel] = React.useState<string[]>([]);
  const [open, setOpen] = React.useState('sites');
  React.useEffect(() => { if (focus) { setCodes([focus]); setSiteSel([]); } }, [focus]);

  const deptSites = React.useMemo(() => sitesOf(data, codes), [data, codes]);
  const sites = siteSel.length ? deptSites.filter(s => siteSel.indexOf(s.name) >= 0) : deptSites;
  const chosen = codes.length ? data.depts.filter(d => codes.indexOf(d.code) >= 0) : data.depts;
  const fig = (k: 'sites' | 'visitors' | 'docs' | 'rec' | 'phys'): number =>
    siteSel.length ? (k === 'sites' ? sites.length : sum(sites, s => s[k])) : sum(chosen, d => d[k]);

  const kpis: IKpi[] = [
    { key: 'sites', label: 'Sites', value: F(fig('sites')), info: 'EDRMS sites set up for this department' },
    { key: 'visitors', label: 'Site visitors', value: F(fig('visitors')), info: 'People who opened a site, last 180 days' },
    { key: 'docs', label: 'Documents', value: F(fig('docs')), info: 'Files stored in EDRMS' },
    { key: 'rec', label: 'Records declared', value: F(fig('rec')), info: 'Documents saved as official records' },
    { key: 'phys', label: 'Physical Counterparts', value: F(fig('phys')), info: 'Records that also have a paper or physical version' }
  ];
  const resetKey = codes.join(',') + '|' + siteSel.join(',');

  return (
    <div className="dash-dp">
      <Band title="Department insights" text="EDRMS use by department: sites, site visitors, documents, declared records and physical counterparts" tools={bandTools} />
      <Panel title="Department Profile">
        <div className="toolbar">
          <CategoryBar depts={data.depts} codes={codes} onChange={v => { setCodes(v); setSiteSel([]); }}
            site={<SitePicker sites={deptSites} value={siteSel} onChange={setSiteSel} />} />
        </div>
        <ProfileStrip codes={codes} />
        <div className="gh"><b>Open a breakdown</b><span>{kpis.length} cards, each opens the table beneath</span></div>
        <KpiRow items={kpis} open={open} onOpen={setOpen} stacked />
      </Panel>
      {open === 'sites' && <SitesCreated sites={sites} resetKey={resetKey} />}
      {open === 'visitors' && <VisitorsDrill sites={sites} resetKey={resetKey} />}
      {open === 'docs' && <MetricDrill key="docs" sites={sites} resetKey={resetKey} spec={DOCS_SPEC} />}
      {open === 'rec' && <MetricDrill key="rec" sites={sites} resetKey={resetKey} spec={REC_SPEC} />}
      {open === 'phys' && <MetricDrill key="phys" sites={sites} resetKey={resetKey} spec={PHYS_SPEC} />}

      <Band title="Library usage" text="Document libraries in EDRMS sites: documents, declared records, physical counterparts and active users" />
      <LibraryUsage data={data} focus={focus} />
    </div>
  );
};
