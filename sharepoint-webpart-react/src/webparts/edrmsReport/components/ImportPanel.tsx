/*
 * Import data (5 Nov 2026). Shown only to people who can manage the site
 * (SharePoint Owners and site collection admins); see EdrmsReportWebPart.ts.
 * One template, checked against every rule in lib/importRules.ts before
 * anything is saved. A file with any problem is refused whole.
 */
import * as React from 'react';
import { validate, IValidation, TABS, COLUMNS, POLICIES, IManualData, Sheet } from '../lib/importRules';
import { IManualStore, IHistoryEntry } from '../lib/manualStore';

export interface IImportPanelProps {
  store: IManualStore;
  user: string;
  role: string;
  current: IManualData | null;
  knownUnits: string[];
  onClose: () => void;
  onLoaded: (d: IManualData) => void;
}

const MAX_BYTES = 10 * 1024 * 1024;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function xlsx(): Promise<any> { return import(/* webpackChunkName: 'edrms-xlsx' */ 'xlsx-js-style'); }

async function downloadTemplate(current: IManualData | null, knownUnits: string[]): Promise<void> {
  const X = await xlsx();
  const wb = X.utils.book_new();
  const headStyle = { font: { bold: true, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '194F8E' } }, alignment: { vertical: 'center', wrapText: true } };
  const titleStyle = { font: { bold: true, sz: 14, color: { rgb: '194F8E' } } };
  const sheet = (rows: (string | number)[][], widths: number[], styleHead = true): unknown => {
    const ws = X.utils.aoa_to_sheet(rows);
    ws['!cols'] = widths.map(w => ({ wch: w }));
    if (styleHead && rows.length) rows[0].forEach((_, c) => { const a = X.utils.encode_cell({ r: 0, c }); if (ws[a]) ws[a].s = headStyle; });
    return ws;
  };

  const instr: (string | number)[][] = [['EDRMS Utilization Report: manual data template'], [],
    ['Fill in the Sites, People and Departments tabs, save, then use Import data in the report. Code mapping is optional.'], [],
    ['Rules (if any is broken, nothing is loaded)'], ...POLICIES.map((p, i) => [(i + 1) + '. ' + p]), []];
  ([['sites', TABS.sites], ['people', TABS.people], ['departments', TABS.departments], ['mapping', TABS.mapping]] as [keyof typeof COLUMNS, string][]).forEach(([k, t]) => {
    instr.push([t + ' tab'], ['Column', 'Required', 'Rule']);
    COLUMNS[k].forEach(c => instr.push([c.name, c.req ? 'Yes' : 'No', c.rule]));
    instr.push([]);
  });
  const wsI = sheet(instr, [30, 10, 110], false) as Record<string, { s?: unknown }>;
  ['A1'].forEach(a => { if (wsI[a]) wsI[a].s = titleStyle; });
  X.utils.book_append_sheet(wb, wsI, 'Instructions');

  // Sites and Departments come pre-filled with what is loaded now, so a file can be corrected in place.
  const sites = (current ? current.sites : []).map(s => [s.site, s.url, s.siteName, s.department, s.division, s.production ? 'Yes' : 'No', s.category, s.subCategory, s.subGroup || '']);
  X.utils.book_append_sheet(wb, sheet([COLUMNS.sites.map(c => c.name), ...sites], [60, 48, 24, 13, 11, 11, 11, 13, 12]), TABS.sites);
  X.utils.book_append_sheet(wb, sheet([COLUMNS.people.map(c => c.name)], [34, 26, 13, 11, 10, 16, 13, 24]), TABS.people);
  const units = current ? Object.keys(current.units).filter(k => current.units[k].goLive || current.units[k].convUrl).sort() : [];
  X.utils.book_append_sheet(wb, sheet([COLUMNS.departments.map(c => c.name), ...units.map(k => [k, current!.units[k].goLive || '', current!.units[k].convUrl || ''])], [12, 14, 80]), TABS.departments);
  X.utils.book_append_sheet(wb, sheet([COLUMNS.mapping.map(c => c.name)], [18, 16]), TABS.mapping);
  X.utils.book_append_sheet(wb, sheet([['Units the report knows'], ...knownUnits.slice().sort().map(u => [u]), [], ['Category'], ['HQ'], ['RM'], ['RO'], [], ['Production'], ['Yes'], ['No'], [], ['Staff type'], ['Staff'], ['Consultant'], ['Contractor'], [], ['Completed EDRMS training'], ['Yes'], ['No']], [28]), 'Valid values');
  X.writeFile(wb, 'EDRMS_Utilization_Manual_Data.xlsx');
}

async function readBook(file: File): Promise<{ book: { [t: string]: Sheet } | null; problem: string | null }> {
  if (!/\.xlsx$/i.test(file.name)) return { book: null, problem: 'Only .xlsx files are accepted. Use the downloaded template.' };
  if (file.size > MAX_BYTES) return { book: null, problem: 'The file is larger than 10 MB.' };
  try {
    const X = await xlsx();
    const wb = X.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
    const book: { [t: string]: Sheet } = {};
    (wb.SheetNames as string[]).forEach(n => { book[n] = X.utils.sheet_to_json(wb.Sheets[n], { header: 1, raw: true, defval: null, blankrows: true }); });
    return { book, problem: null };
  } catch {
    return { book: null, problem: 'The file could not be read. Open it in Excel and save it again as .xlsx.' };
  }
}

const F = (n: number): string => n.toLocaleString('en-US');

export const ImportPanel: React.FC<IImportPanelProps> = props => {
  const [file, setFile] = React.useState<File | null>(null);
  const [result, setResult] = React.useState<IValidation | null>(null);
  const [problem, setProblem] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState('');
  const [done, setDone] = React.useState<string | null>(null);
  const [hist, setHist] = React.useState<IHistoryEntry[] | null>(null);
  const [drag, setDrag] = React.useState(false);
  const input = React.useRef<HTMLInputElement>(null);
  const shade = React.useRef<HTMLDivElement>(null);

  // Start below SharePoint's own top bar, which sits above the page and would
  // otherwise cover the panel's title and close button. The report is drawn
  // with CSS zoom (text size), so the offset is given in zoomed pixels.
  React.useLayoutEffect(() => {
    const place = (): void => {
      const el = shade.current;
      if (!el) return;
      const bars = Array.prototype.slice.call(document.querySelectorAll('#SuiteNavWrapper, #SuiteNavPlaceHolder, #O365_NavHeader, [data-automationid="SuiteNav"], #spSiteHeader ~ div[role="banner"]')) as HTMLElement[];
      const bottom = bars.reduce((a, b) => { const r = b.getBoundingClientRect(); return r.height > 0 && r.top < 5 ? Math.max(a, r.bottom) : a; }, 0);
      const zoom = parseFloat(getComputedStyle(el.parentElement || el).getPropertyValue('zoom')) || 1;
      el.style.top = Math.max(0, bottom) / zoom + 'px';
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, []);

  React.useEffect(() => { props.store.history().then(setHist, () => setHist([])); }, []);
  React.useEffect(() => {
    const k = (e: KeyboardEvent): void => { if (e.key === 'Escape' && !busy) props.onClose(); };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, [busy]);

  const reset = (): void => { setFile(null); setResult(null); setProblem(null); setDone(null); if (input.current) input.current.value = ''; };

  const check = async (f: File | null): Promise<void> => {
    reset();
    if (!f) return;
    setFile(f); setBusy('Checking ' + f.name);
    const { book, problem: p } = await readBook(f);
    if (!book) { setProblem(p); setBusy(''); return; }
    // Let the "Checking" line paint before a large file is processed.
    await new Promise(resolve => setTimeout(resolve, 30));
    const v = validate(book, f.name, props.user);
    setResult(v); setBusy('');
    if (v.issues.length) {
      await props.store.logRefused(f.name, props.user, v.issues);
      props.store.history().then(setHist, () => undefined);
    }
  };

  const load = async (): Promise<void> => {
    if (!result || !result.data) return;
    setBusy('Saving');
    try {
      await props.store.save(result.data);
      props.onLoaded(result.data);
      setDone('Loaded. The report now shows the imported figures.');
      setResult(null);
      setHist(await props.store.history());
    } catch (e) {
      setProblem('Nothing was saved: ' + (e instanceof Error ? e.message : 'SharePoint did not accept the file.') + ' Check that you are still a site owner and try again.');
    }
    setBusy('');
  };

  const last = hist && hist.find(h => h.status === 'loaded');
  const issues = result ? result.issues : [];

  return (
    <div ref={shade} className="impShade" onClick={() => { if (!busy) props.onClose(); }} data-html2canvas-ignore="true">
      <aside className="impPanel" role="dialog" aria-modal="true" aria-label="Import manual data" onClick={e => e.stopPropagation()}>
        <div className="impHead">
          <div><h2>Import manual data</h2><div className="impWho">Signed in as {props.user} · {props.role}</div></div>
          <button type="button" className="impX" aria-label="Close" title="Close" disabled={!!busy} onClick={props.onClose}>&#10005;</button>
        </div>

        <section className="impStep">
          <h3>1. Download the template</h3>
          <button type="button" className="impBtn pri" onClick={() => { downloadTemplate(props.current, props.knownUnits).catch(e => setProblem('The template could not be created: ' + e)); }}>Download Excel template</button>
        </section>

        <section className="impStep">
          <h3>2. Upload and check</h3>
          <label className={'impDrop' + (drag ? ' on' : '')}
            onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); check(e.dataTransfer.files[0] || null).catch(() => undefined); }}>
            <input ref={input} type="file" accept=".xlsx" onChange={e => { check(e.target.files ? e.target.files[0] : null).catch(() => undefined); }} />
            {file ? <b>{file.name}</b> : <span>Drop the filled template here, or <u>browse</u> (.xlsx, up to 10 MB)</span>}
          </label>
          {busy && <p className="impBusy">{busy}…</p>}
          {problem && <div className="impBad"><b>{problem}</b></div>}
          {result && issues.length > 0 && (
            <div className="impBad">
              <b>Not loaded. {F(issues.length)}{issues.length >= 1000 ? '+' : ''} problem{issues.length === 1 ? '' : 's'} found. Nothing was changed.</b>
              <div className="impTblWrap"><table className="impTbl"><thead><tr><th>Tab</th><th>Row</th><th>Column</th><th>Problem</th></tr></thead>
                <tbody>{issues.slice(0, 300).map((i, n) => <tr key={n}><td>{i.tab}</td><td>{i.row || '-'}</td><td>{i.column}</td><td>{i.message}</td></tr>)}</tbody></table></div>
              {issues.length > 300 && <p className="impSmall">Showing the first 300. Fix these and check again.</p>}
            </div>
          )}
          {result && result.data && (
            <div className="impGood">
              <b>All checks passed.</b>
              <div>{F(result.summary.sites)} sites · {F(result.summary.people)} people in {F(result.summary.units)} units · {F(result.summary.trained)} completed training</div>
              {result.notes.map((n, i) => <div key={i} className="impNote">{n}</div>)}
              <div className="impRow"><button type="button" className="impBtn pri" disabled={!!busy} onClick={() => { load().catch(() => undefined); }}>Import</button>
                <button type="button" className="impBtn" disabled={!!busy} onClick={reset}>Cancel</button></div>
            </div>
          )}
          {done && <div className="impGood"><b>{done}</b></div>}
        </section>

        <p className="impSmall">
          {last ? <>Last import: {new Date(last.at).toLocaleString()} by {last.by} · {F(last.sites)} sites, {F(last.people)} people</> : 'Nothing imported yet. The report shows sample figures.'}
        </p>
        {hist && hist.length > 0 && (
          <details className="impHist"><summary>Import history</summary>
            <table className="impTbl"><thead><tr><th>When</th><th>By</th><th>File</th><th>Result</th></tr></thead>
              <tbody>{hist.slice(0, 30).map((h, i) => <tr key={i}><td>{new Date(h.at).toLocaleString()}</td><td>{h.by}</td><td>{h.fileName}</td>
                <td className={h.status === 'loaded' ? 'ok' : 'no'}>{h.status === 'loaded' ? 'Loaded' : 'Refused, ' + F(h.problems) + ' problems'}</td></tr>)}</tbody></table>
          </details>
        )}
      </aside>
    </div>
  );
};
