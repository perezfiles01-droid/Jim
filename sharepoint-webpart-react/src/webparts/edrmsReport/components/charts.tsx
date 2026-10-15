// Charts, drawn as plain SVG so they match the approved design exactly.
// Each maps to a native Power BI visual: clustered bar, clustered column,
// line and clustered column (two axes) and donut.

import * as React from 'react';
import { F, niceMax, axisLabel } from '../lib/format';

const BLUE = '#0072BC';

/* ---------- horizontal bars: Top 10 lists that pick a row in the table ---------- */

export interface IBarItem {
  key: string;
  name: string;
  /** Shown small after the name, e.g. the site of a library. */
  note?: string;
  value: number;
  label: string;
  title?: string;
}

export const BarList: React.FC<{
  items: IBarItem[];
  selected?: string | null;
  onSelect?: (key: string | null) => void;
  color?: string;
  /** "+ 39 more sites with 7 ..." under the list, when more rows tie with the tenth. */
  more?: { text: string; onClick: () => void };
  valueWidth?: number;
}> = ({ items, selected, onSelect, color, more, valueWidth }) => {
  const max = Math.max(0.0001, ...items.map(i => i.value));
  return (
    <div className="hbars">
      {items.map(i => {
        const on = selected === i.key, dim = !!selected && !on;
        return (
          <button type="button" key={i.key} className={'hbar' + (on ? ' on' : '') + (dim ? ' dim' : '')} title={i.title}
            style={valueWidth ? { gridTemplateColumns: `minmax(0,1fr) minmax(0,1.3fr) ${valueWidth}px` } : undefined}
            onClick={() => onSelect && onSelect(on ? null : i.key)}>
            <span className="nm">{i.name}{i.note && <small>{i.note}</small>}</span>
            <span className="track"><span className="fill" style={{ width: (i.value / max) * 100 + '%', background: color || BLUE }} /></span>
            <span className="v">{i.label}</span>
          </button>
        );
      })}
      {more && <button type="button" className="more" onClick={more.onClick}>{more.text} <span aria-hidden="true">&#8250;</span></button>}
    </div>
  );
};

/* ---------- vertical columns ---------- */

export interface IColumnItem { key: string; label: string; value: number; title?: string }

export const ColumnChart: React.FC<{
  items: IColumnItem[];
  height?: number;
  /** Drawing width; smaller makes the text larger in a narrow box. */
  width?: number;
  color?: string;
  /** Highlights one column and fades the others. */
  selected?: string | null;
  onClick?: (key: string) => void;
  valueLabel?: (v: number) => string;
  showValues?: boolean;
  ariaLabel: string;
}> = ({ items, height, width, color, selected, onClick, valueLabel, showValues, ariaLabel }) => {
  const W = width || 900, H = height || 280, L = 56, R = W - 12, T = 22, B = H - 30;
  const n = Math.max(1, items.length), step = (R - L) / n;
  const max = niceMax(Math.max(1, ...items.map(i => i.value)));
  const every = n <= 14 ? 1 : Math.ceil(n / 12);
  const lab = valueLabel || F;
  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel}>
        {[0, 1, 2, 3, 4].map(t => {
          const y = B - (B - T) * t / 4;
          return <g key={t}><line x1={L} x2={R} y1={y} y2={y} stroke="#E3E9F0" /><text x={L - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#5B6B7D">{axisLabel(max * t / 4)}</text></g>;
        })}
        {items.map((it, i) => {
          const h = (B - T) * it.value / max, bw = Math.min(Math.max(step * 0.62, 4), 64), x = L + step * i + step / 2;
          const fill = !selected ? (color || BLUE) : selected === it.key ? '#005A96' : '#B5D4F4';
          return (
            <g key={it.key}>
              <rect className={onClick ? 'click' : undefined} x={x - bw / 2} y={B - h} width={bw} height={Math.max(h, it.value ? 2 : 0)} rx="2" fill={fill}
                onClick={onClick ? () => onClick(it.key) : undefined}><title>{it.title || it.label + ': ' + F(it.value)}</title></rect>
              {(showValues !== false && n <= 16) && <text x={x} y={B - h - 6} textAnchor="middle" fontSize="11" fontWeight="600" fill="#1F2D3D">{lab(it.value)}</text>}
              {i % every === 0 && <text x={x} y={B + 16} textAnchor="middle" fontSize="11" fill="#5B6B7D">{it.label}</text>}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/* ---------- columns per period with a running total line (two axes) ---------- */

export const ComboChart: React.FC<{
  items: IColumnItem[];
  onClick?: (key: string) => void;
  ariaLabel: string;
}> = ({ items, onClick, ariaLabel }) => {
  const W = 920, H = 300, L = 60, R = W - 60, T = 30, B = H - 40;
  const n = Math.max(1, items.length), step = (R - L) / n;
  const total = items.reduce((a, i) => a + i.value, 0);
  const mL = niceMax(Math.max(1, ...items.map(i => i.value)) * 1.05), mR = niceMax(total * 1.02);
  const dense = n > 24;
  let run = 0;
  const pts = items.map((it, i) => { run += it.value; return { x: L + step * i + step / 2, y: B - (B - T) * run / mR, run, it }; });
  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel}>
        {[0, 1, 2, 3, 4, 5].map(t => {
          const y = B - (B - T) * t / 5;
          return (
            <g key={t}>
              <line x1={L} x2={R} y1={y} y2={y} stroke="#E3E9F0" />
              <text x={L - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#5B6B7D">{axisLabel(mL * t / 5)}</text>
              <text x={R + 8} y={y + 4} fontSize="11" fill="#5B6B7D">{axisLabel(mR * t / 5)}</text>
            </g>
          );
        })}
        {items.map((it, i) => {
          const h = (B - T) * it.value / mL, bw = Math.min(Math.max(step * 0.6, 2), n <= 4 ? 150 : n <= 12 ? 70 : 60), x = L + step * i + step / 2;
          return (
            <g key={it.key}>
              <rect className={onClick ? 'click' : undefined} x={x - bw / 2} y={B - h} width={bw} height={h} rx="2" fill="#5CA943"
                onClick={onClick ? () => onClick(it.key) : undefined}>
                <title>{it.label + ': ' + F(it.value) + (onClick ? ' (click to see its months)' : '')}</title>
              </rect>
              {!dense && <text x={x} y={B - h - 7} textAnchor="middle" fontSize={n > 14 ? 10 : 12} fontWeight="600" fill="#1F2D3D" stroke="#fff" strokeWidth="4" paintOrder="stroke">{n > 14 ? axisLabel(it.value) : F(it.value)}</text>}
              {!dense && <text x={x} y={B + 16} textAnchor="middle" fontSize="11" fill="#5B6B7D">{it.label}</text>}
            </g>
          );
        })}
        <path d={pts.map((p, i) => (i ? 'L' : 'M') + p.x + ' ' + p.y).join('')} fill="none" stroke={BLUE} strokeWidth="2.5" />
        {pts.map(p => <circle key={p.it.key} cx={p.x} cy={p.y} r="3.5" fill={BLUE}><title>{'Running total to ' + p.it.label + ': ' + F(p.run)}</title></circle>)}
      </svg>
    </div>
  );
};

/* ---------- donut ---------- */

export const Donut: React.FC<{ part: number; total: number; color: string; rest: string; caption: string }> =
  ({ part, total, color, rest, caption }) => {
    const r = 80, c = 2 * Math.PI * r, share = total ? part / total : 0;
    return (
      <svg viewBox="0 0 200 200" width="260" height="260" role="img" aria-label={(share * 100).toFixed(1) + '% ' + caption}>
        <circle cx="100" cy="100" r={r} fill="none" stroke={rest} strokeWidth="22" />
        <circle cx="100" cy="100" r={r} fill="none" stroke={color} strokeWidth="22" strokeDasharray={`${c * share} ${c}`} transform="rotate(-90 100 100)" />
        <text x="100" y="98" textAnchor="middle" fontSize="30" fontWeight="600" fill="#10243E">{(share * 100).toFixed(1)}%</text>
        <text x="100" y="120" textAnchor="middle" fontSize="10.5" fill="#64748B">of records have a physical</text>
        <text x="100" y="134" textAnchor="middle" fontSize="10.5" fill="#64748B">counterpart</text>
      </svg>
    );
  };
