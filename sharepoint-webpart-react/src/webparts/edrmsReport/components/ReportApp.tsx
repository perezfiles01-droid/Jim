import * as React from 'react';
import styles from './Report.module.scss';
import { loadReportData } from '../lib/data';
import { exportPdf } from '../lib/exporters';
import { BankWide } from '../dashboards/BankWide';
import { DepartmentInsights } from '../dashboards/DepartmentInsights';
import { DownloadGlyph } from './ui';

export type Dashboard = 'bw' | 'dp';
export type TextSize = 'standard' | 'large' | 'xlarge';

export interface IReportAppProps {
  dashboard: Dashboard;
  showSidebar: boolean;
  textSize: TextSize;
}

/* Text size: Large is the default, as readers are often older. */
const ZOOM: { [k in TextSize]: number } = { standard: 1, large: 1.25, xlarge: 1.5 };
const SIDEBAR_KEY = 'edrms-sidebar-closed';

const ICONS: { [k: string]: JSX.Element } = {
  bw: <svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" /><circle cx="8" cy="8" r="2.5" fill="currentColor" /></svg>,
  dp: <svg viewBox="0 0 16 16"><rect x="2" y="2" width="5" height="5" /><rect x="9" y="2" width="5" height="5" /><rect x="2" y="9" width="5" height="5" /><rect x="9" y="9" width="5" height="5" /></svg>,
  pj: <svg viewBox="0 0 16 16"><path d="M8 2l6 6-6 6-6-6z" /></svg>,
  fp: <svg viewBox="0 0 16 16"><path d="M3 4h10M3 8h10M3 12h10" /></svg>,
  rd: <svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" /><path d="M8 5v3l2 1" /></svg>,
  ra: <svg viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="4" /><path d="M3 7v6h10V7M6 10h4" /></svg>
};

const FUTURE: { key: string; text: string }[] = [
  { key: 'pj', text: 'Project Insights' },
  { key: 'fp', text: 'Institutional File Plan' },
  { key: 'rd', text: 'Retention & Disposal' },
  { key: 'ra', text: 'Records & Archive Holdings' }
];

function readClosed(): boolean {
  try { return localStorage.getItem(SIDEBAR_KEY) === '1'; } catch { return false; }
}

export const ReportApp: React.FC<IReportAppProps> = props => {
  const data = React.useMemo(loadReportData, []);
  const [dash, setDash] = React.useState<Dashboard>(props.dashboard);
  const [focus, setFocus] = React.useState<string | undefined>(undefined);
  const [closed, setClosed] = React.useState<boolean>(readClosed);
  const [busy, setBusy] = React.useState(false);
  const page = React.useRef<HTMLDivElement>(null);
  const root = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => setDash(props.dashboard), [props.dashboard]);

  const go = (d: Dashboard): void => {
    setDash(d);
    if (d === 'bw') setFocus(undefined);
    if (root.current) root.current.scrollIntoView({ block: 'start' });
  };
  const openDept = (code: string): void => { setFocus(code); go('dp'); };
  const toggle = (): void => {
    const next = !closed;
    setClosed(next);
    try { localStorage.setItem(SIDEBAR_KEY, next ? '1' : '0'); } catch { /* private window */ }
  };
  const pdf = (): void => {
    if (!page.current || busy) return;
    setBusy(true);
    // The PDF library does not understand CSS zoom, so the page is drawn at
    // standard size and the text size is put back afterwards.
    const r = root.current, zoom = r ? r.style.getPropertyValue('zoom') : '';
    if (r) r.style.setProperty('zoom', '1');
    const done = (): void => { if (r) r.style.setProperty('zoom', zoom); setBusy(false); };
    exportPdf(page.current, dash === 'bw' ? 'Bank-wide Oversight' : 'Department Insights').then(done, done);
  };

  const bandTools = (
    <>
      <span className="asof"><i />Data as of<b>{data.asOf}</b></span>
      <button type="button" className="pdfBtn" onClick={pdf} disabled={busy} data-html2canvas-ignore="true">
        <DownloadGlyph />{busy ? 'Preparing PDF' : 'Export to PDF'}
      </button>
    </>
  );

  return (
    <div ref={root} className={styles.report} style={{ zoom: ZOOM[props.textSize] || 1.25 } as React.CSSProperties}>
      {props.showSidebar && (
        <nav className={'side' + (closed ? ' closed' : '')} aria-label="Dashboards">
          <div className="brand">
            <button type="button" className="menuBtn" onClick={toggle} aria-expanded={!closed}
              title={closed ? 'Open navigation' : 'Close navigation'} aria-label={closed ? 'Open navigation' : 'Close navigation'}>
              <svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div className="t1">EDRMS Utilization Report</div>
            <div className="t2">Asian Development Bank</div>
          </div>
          <div className="grp">Key views</div>
          <button type="button" className={'nav' + (dash === 'bw' ? ' on' : '')} aria-current={dash === 'bw' ? 'page' : undefined} title="Bank-wide Oversight" onClick={() => go('bw')}>
            {ICONS.bw}<span className="navTx">Bank-wide Oversight</span>
          </button>
          <button type="button" className={'nav' + (dash === 'dp' ? ' on' : '')} aria-current={dash === 'dp' ? 'page' : undefined} title="Department Insights" onClick={() => go('dp')}>
            {ICONS.dp}<span className="navTx">Department Insights</span>
          </button>
          <div className="grp">For future release</div>
          {FUTURE.map(f => (
            <button type="button" key={f.key} className="nav future" aria-disabled="true" title={f.text + ' (future release)'}>
              {ICONS[f.key]}<span className="navTx">{f.text}</span>
            </button>
          ))}
        </nav>
      )}
      <div className="main" ref={page}>
        {dash === 'bw'
          ? <BankWide data={data} openDept={openDept} bandTools={bandTools} />
          : <DepartmentInsights data={data} openDept={openDept} bandTools={bandTools} focus={focus} />}
      </div>
    </div>
  );
};
