import * as React from 'react';
import { TooltipHost, DirectionalHint } from '@fluentui/react';
import { exportTable, IExportTable } from '../lib/exporters';
import { F } from '../lib/format';

/* ---------- icons, drawn so they look the same in every font ---------- */

export const InfoGlyph = (): JSX.Element => (
  <svg viewBox="0 0 8 10" aria-hidden="true"><circle cx="4" cy="1.4" r="1.3" fill="currentColor" /><rect x="2.9" y="3.6" width="2.2" height="6.4" rx="0.6" fill="currentColor" /></svg>
);
export const DownloadGlyph = (): JSX.Element => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>
);
export const FunnelGlyph = (): JSX.Element => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16l-6 7.5V19l-4-2v-4.5z" /></svg>
);

/** The arrow on drop-downs, drawn here so it does not depend on an icon font. */
export const Caret = (): JSX.Element => (
  <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" style={{ display: 'block' }}><path d="M2.5 4.5L6 8l3.5-3.5" fill="none" stroke="#5B6B7D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

/** The small (i) at a card's top right. The description shows on hover or keyboard focus. */
export const InfoIcon: React.FC<{ text: string }> = ({ text }) => (
  <TooltipHost content={text} hostClassName="infoWrap" directionalHint={DirectionalHint.bottomRightEdge} calloutProps={{ gapSpace: 4, calloutMaxWidth: 240 }}>
    <span className="info" tabIndex={0} role="img" aria-label={text} onClick={e => e.stopPropagation()}><InfoGlyph /></span>
  </TooltipHost>
);

/* ---------- layout ---------- */

export const Band: React.FC<{ title: string; text: string; tools?: React.ReactNode }> = ({ title, text, tools }) => (
  <div className="band">
    <h2>{title}</h2>
    <div className="bd">{text}</div>
    {tools && <div className="tools">{tools}</div>}
  </div>
);

export const Panel: React.FC<{ title?: string; sub?: React.ReactNode; children?: React.ReactNode; className?: string }> =
  ({ title, sub, children, className }) => (
    <section className={'panel' + (className ? ' ' + className : '')}>
      {title && <h3 className="ptitle">{title}</h3>}
      {sub && <p className="psub">{sub}</p>}
      {children}
    </section>
  );

/* ---------- cards ---------- */

export interface IKpi {
  key: string;
  label: string;
  value: string;
  /** The description behind the (i), or the line under the figure on stacked cards. */
  info: string;
}

/** A row of clickable cards; the one that is open shows its breakdown below. */
export const KpiRow: React.FC<{ items: IKpi[]; open: string; onOpen: (k: string) => void; stacked?: boolean }> =
  ({ items, open, onOpen, stacked }) => (
    <div className={'kpis' + (stacked ? ' stacked' : '')}>
      {items.map(k => (
        <div key={k.key} role="button" tabIndex={0} aria-pressed={open === k.key}
          className={'kpi' + (open === k.key ? ' on' : '')}
          onClick={() => onOpen(k.key)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(k.key); } }}>
          <div className="lab">{k.label}</div>
          <div className="val">{k.value}</div>
          {stacked && <div className="sub">{k.info}</div>}
          <div className="tap">View breakdown <span aria-hidden="true">&#8250;</span></div>
          {!stacked && <InfoIcon text={k.info} />}
        </div>
      ))}
    </div>
  );

/** Small summary cards above a table. */
export const Tiles: React.FC<{ items: { label: string; value: string; info?: string }[] }> = ({ items }) => (
  <div className="tiles">
    {items.map(t => (
      <div className="tile" key={t.label}>
        <div className="tl">{t.label}</div>
        <div className="tv">{t.value}</div>
        {t.info && <InfoIcon text={t.info} />}
      </div>
    ))}
  </div>
);

export const SumCard: React.FC<{ label: string; value: React.ReactNode; hint?: string; swatch?: string; info?: string; children?: React.ReactNode }> =
  ({ label, value, hint, swatch, info, children }) => (
    <div className="sumCard">
      <span className="l">{swatch && <i style={{ background: swatch }} />}{label}</span>
      <span className="v">{value}</span>
      {children}
      {hint && <span className="h">{hint}</span>}
      {info && <InfoIcon text={info} />}
    </div>
  );

/* ---------- controls ---------- */

export const Search: React.FC<{ value: string; onChange: (v: string) => void; placeholder: string }> =
  ({ value, onChange, placeholder }) => (
    <input className="search" type="search" value={value} placeholder={placeholder} aria-label={placeholder}
      onChange={e => onChange(e.target.value)} />
  );

export function Segmented<T extends string>(props: { options: { key: T; text: string }[]; value: T; onChange: (v: T) => void; label?: string }): JSX.Element {
  return (
    <div className="seg" role="group" aria-label={props.label}>
      {props.options.map(o => (
        <button key={o.key} type="button" className={props.value === o.key ? 'on' : ''} aria-pressed={props.value === o.key}
          onClick={() => props.onChange(o.key)}>{o.text}</button>
      ))}
    </div>
  );
}

export const ExportButton: React.FC<{ table: () => IExportTable }> = ({ table }) => (
  <button type="button" className="xpBtn" onClick={() => { exportTable(table()).catch(() => undefined); }}>
    <DownloadGlyph />Export table
  </button>
);

export const Chip: React.FC<{ text: string; onClear: () => void }> = ({ text, onClear }) => (
  <span className="chip">{text}<button type="button" aria-label="Clear filter" onClick={onClear}>&times;</button></span>
);

/* ---------- paging ---------- */

export const Pager: React.FC<{ total: number; page: number; size: number; noun: string; onPage: (p: number) => void }> =
  ({ total, page, size, noun, onPage }) => {
    const pages = Math.max(1, Math.ceil(total / size));
    const from = total ? (page - 1) * size + 1 : 0, to = Math.min(total, page * size);
    const info = pages > 1 ? `Showing ${F(from)} to ${F(to)} of ${F(total)} ${noun}` : `Showing ${F(total)} ${noun}`;
    // First, last, and the pages either side of the current one.
    const shown: (number | '...')[] = [];
    for (let p = 1; p <= pages; p++) {
      if (p === 1 || p === pages || Math.abs(p - page) <= 1) shown.push(p);
      else if (shown[shown.length - 1] !== '...') shown.push('...');
    }
    return (
      <div className="pager">
        <span className="pinfo">{info}</span>
        {pages > 1 && (
          <span className="pbtns">
            <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)}>&#8249; Prev</button>
            {shown.map((p, i) => p === '...'
              ? <span key={'e' + i}>&hellip;</span>
              : <button type="button" key={p} className={p === page ? 'on' : ''} aria-current={p === page} onClick={() => onPage(p)}>{p}</button>)}
            <button type="button" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next &#8250;</button>
          </span>
        )}
      </div>
    );
  };

/** A department code and name. The underlined code opens Department Insights. */
export const DeptCell: React.FC<{ code: string; name: string; plain?: boolean }> = ({ code, name, plain }) => (
  <span className="dc"><span className="code" style={plain ? { color: '#10243E', textDecoration: 'none' } : undefined}>{code}</span><span className="dname">{name}</span></span>
);
