import React from 'react';
/* KT Part 3: how a release is delivered. Fully animated, no recording.
   Layout for each step: 4 stage tracker and 17 step progress on top, the step's
   own animated scene on the left, the house (stage progress), owner and the
   2026.4 date on the right. Every element lands on the word that names it. */
import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame } from 'remotion';
import BEATS from './beats.gen.json';
import { INK, BLUE, TEAL, ADB, GREEN, SOFT, PAPER, RED, FONT, pop, ease, In, Doc, User, Mail, Cal } from '../../src/MG';

const FPS = 30, W = 1920, H = 1080, LEAD = 10, TAIL = 16;
const len = b => LEAD + Math.ceil(b.seconds * FPS) + TAIL;
const START = BEATS.reduce((a, b, i) => [...a, i ? a[i - 1] + len(BEATS[i - 1]) : 0], []);
export const TOTAL = START.at(-1) + len(BEATS.at(-1));
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };
const AMBER = '#F2A900';
const rnd = i => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); };
const bounce = (f, s) => spring({ frame: f - s, fps: FPS, config: { damping: 9, stiffness: 150 } });

const STAGES = [['Plan', BLUE], ['Build', TEAL], ['Test', AMBER], ['Go live', GREEN]];
const STEPS = [
  [1, 'Initial requirements', 'RAC', 1], [2, 'Feasibility', 'AvePoint', 1], [3, 'Requirement gathering workshop', 'AvePoint + RAC', 1],
  [4, 'Dev assessment', 'AvePoint', 1], [5, 'Confirmation', 'RAC', 1], [6, 'Product backlog', 'AvePoint BAs', 1],
  [7, 'Effort estimation', 'AvePoint', 1], [8, 'Backlog sign-off', 'RAC', 1], [9, 'Dev kickoff and development', 'AvePoint', 2],
  [10, 'AvePoint QA', 'AvePoint QA', 2], [11, 'SIT', 'ITD TCS QA', 3], [12, 'UAT', 'RAC', 3], [13, 'UAT completion report', '', 3],
  [14, 'CAB preparation', 'Change Advisory Board', 4], [15, 'Production deployment', '', 4], [16, 'Sanity testing', 'ITD TCS QA', 4],
  [17, 'Hypercare', 'The team', 4],
];
const GATES = { 5: 'Requirements confirmed', 8: 'Backlog signed off', 11: 'SIT signed off', 12: 'UAT signed off', 14: 'Change board approved', 16: 'QA signed off' };
const OWNER_C = o => o.startsWith('RAC') ? ADB : o.startsWith('ITD') ? BLUE : o.startsWith('AvePoint') ? TEAL : PAPER;

/* ---------- shared pieces ---------- */
const Back = ({ children }) => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 25% 15%, #1B3A63 0%, ${INK} 65%)`, fontFamily: FONT, color: 'white', overflow: 'hidden' }}>
    {Array.from({ length: 18 }, (_, i) => <div key={i} style={{ position: 'absolute', left: rnd(i) * W, top: ((rnd(i + 5) * H) + useCurrentFrame() * (0.2 + rnd(i + 9) * 0.5)) % H,
      width: 4 + rnd(i + 3) * 6, height: 4 + rnd(i + 3) * 6, borderRadius: 10, background: TEAL, opacity: 0.12 + rnd(i + 1) * 0.15 }} />)}
    {children}</AbsoluteFill>
);
const Title = ({ k, children, size = 64, color = 'white' }) => (
  <In k={k}><div style={{ fontSize: size, fontWeight: 800, color, textAlign: 'center' }}>{children}</div></In>
);
const Check = ({ s = 56, c = GREEN }) => (
  <svg width={s} height={s} viewBox="0 0 50 50"><circle cx="25" cy="25" r="24" fill={c} />
    <path d="M14 26l8 8 15-17" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Stamp = ({ f, s, text, c = GREEN, rot = -10, size = 46 }) => {
  const k = bounce(f, s);
  return f < s ? null : <div style={{ display: 'inline-block', border: `6px solid ${c}`, color: c, fontWeight: 900, fontSize: size, padding: '6px 22px',
    borderRadius: 10, background: 'rgba(16,36,62,.85)', transform: `rotate(${rot}deg) scale(${3 - 2 * k})`, opacity: Math.min(1, k * 2), letterSpacing: 2 }}>{text}</div>;
};
const Gear = ({ f, s = 70, c = TEAL, dir = 1 }) => (
  <svg width={s} height={s} viewBox="-50 -50 100 100" style={{ transform: `rotate(${dir * f * 4}deg)` }}>
    {Array.from({ length: 8 }, (_, i) => <rect key={i} x="-9" y="-48" width="18" height="22" rx="4" fill={c} transform={`rotate(${i * 45})`} />)}
    <circle r="32" fill={c} /><circle r="13" fill={INK} /></svg>
);
const Person = ({ c, label, s = 90 }) => (
  <div style={{ textAlign: 'center', width: s + 40 }}><User s={s} c={c} /><div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>{label}</div></div>
);
const Bubble = ({ k, children, c = 'white', style }) => (
  <div style={{ position: 'absolute', opacity: Math.min(1, k * 1.5), transform: `scale(${0.5 + 0.5 * k})`, background: c, color: INK, fontWeight: 800, fontSize: 26,
    padding: '10px 18px', borderRadius: 18, boxShadow: '0 8px 24px rgba(0,0,0,.3)', ...style }}>{children}</div>
);
const Bug = ({ s = 50, c = RED }) => (
  <svg width={s} height={s} viewBox="0 0 50 50"><ellipse cx="25" cy="28" rx="12" ry="15" fill={c} /><circle cx="25" cy="12" r="7" fill={c} />
    {[16, 26, 36].map(y => <g key={y}><line x1="13" y1={y} x2="3" y2={y - 4} stroke={c} strokeWidth="3" /><line x1="37" y1={y} x2="47" y2={y - 4} stroke={c} strokeWidth="3" /></g>)}
    <line x1="25" y1="16" x2="25" y2="42" stroke="rgba(0,0,0,.3)" strokeWidth="2" /></svg>
);
const Ticket = ({ text, done, c = BLUE }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 10, background: 'white', color: INK, fontSize: 22, fontWeight: 700,
    borderLeft: `8px solid ${done ? GREEN : c}`, boxShadow: '0 6px 18px rgba(0,0,0,.25)' }}>{text}{done && <span style={{ color: GREEN, marginLeft: 'auto' }}>✓</span>}</div>
);

/* The house, built stage by stage: blueprint, walls, inspection, keys. */
const House = ({ stage, f, s = 1, at }) => {
  const k = n => (stage > n ? 1 : stage === n ? ease(f, at ? at[n] : 6, 24) : 0);
  const plan = k(1), build = k(2), test = k(3), live = k(4);
  return (
    <svg width={360 * s} height={300 * s} viewBox="0 0 360 300">
      <g opacity={plan}>{Array.from({ length: 10 }, (_, i) => <line key={'v' + i} x1={20 + i * 36} y1="20" x2={20 + i * 36} y2="280" stroke={BLUE} strokeWidth="1" opacity=".35" />)}
        {Array.from({ length: 8 }, (_, i) => <line key={'h' + i} x1="20" y1={20 + i * 37} x2="344" y2={20 + i * 37} stroke={BLUE} strokeWidth="1" opacity=".35" />)}
        <path d="M70 140 L180 60 L290 140 V260 H70 Z" fill="none" stroke="#7FB6E8" strokeWidth="4" strokeDasharray="10 8" /></g>
      <g style={{ transform: `translateY(${(1 - build) * 60}px)`, transformOrigin: 'center' }} opacity={build}>
        <rect x="80" y="140" width="200" height="120" fill="#E8EEF5" /><path d="M60 145 L180 55 L300 145 Z" fill={RED} />
        <rect x="160" y="190" width="44" height="70" fill={ADB} transform={`translate(${live * 0} 0)`} />
        {[[100, 165], [228, 165]].map(([x, y]) => <rect key={x} x={x} y={y} width="36" height="32" fill={live > 0.5 ? AMBER : '#9FB6CC'} />)}</g>
      {test > 0 && <g opacity={test * (1 - live)} transform={`translate(${250 + Math.sin(f / 10) * 20} ${120 + Math.cos(f / 12) * 14})`}>
        <circle r="34" fill="rgba(242,169,0,.2)" stroke={AMBER} strokeWidth="8" /><rect x="22" y="22" width="14" height="40" rx="5" fill={AMBER} transform="rotate(-45 22 22)" /></g>}
      {live > 0 && <g opacity={live}><path d="M160 190 L140 200 V270 L160 260 Z" fill="#0D3A6E" />
        <g transform={`translate(300 230) rotate(${Math.sin(f / 6) * 15})`}><circle r="16" fill="none" stroke={AMBER} strokeWidth="6" /><rect x="12" y="-4" width="34" height="8" fill={AMBER} /><rect x="36" y="4" width="6" height="10" fill={AMBER} /></g></g>}
    </svg>
  );
};

const StageBar = ({ stage, f, fresh }) => (
  <div style={{ position: 'absolute', left: 60, right: 60, top: 28, display: 'flex', gap: 14 }}>
    {STAGES.map(([t, c], i) => { const on = i + 1 === stage, done = i + 1 < stage, k = on && fresh ? bounce(f, 2) : 1;
      return <div key={t} style={{ flex: on ? 1.5 : 1, display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', borderRadius: 14,
        background: on ? c : done ? 'rgba(62,155,58,.22)' : 'rgba(255,255,255,.07)', border: `2px solid ${on ? c : done ? GREEN : 'rgba(255,255,255,.15)'}`,
        color: on ? (c === AMBER ? INK : 'white') : done ? '#CDEBCB' : SOFT, fontSize: on ? 32 : 24, fontWeight: 800, transform: `scale(${on ? 0.92 + 0.08 * k : 1})` }}>
        <span style={{ width: 40, height: 40, borderRadius: 20, display: 'grid', placeItems: 'center', background: on ? 'white' : done ? GREEN : 'rgba(255,255,255,.12)',
          color: on ? c : 'white', fontSize: 22 }}>{done ? '✓' : i + 1}</span>{t}</div>; })}
  </div>
);
const Dots = ({ n, f }) => (
  <div style={{ position: 'absolute', left: 60, right: 60, top: 112, display: 'flex', gap: 8, alignItems: 'center' }}>
    {STEPS.map(([i, , , st]) => { const on = i === n, done = i < n;
      return <div key={i} style={{ flex: 1, height: on ? 30 : 12, borderRadius: 15, background: done ? GREEN : on ? STAGES[st - 1][1] : 'rgba(255,255,255,.14)',
        display: 'grid', placeItems: 'center', fontSize: 18, fontWeight: 900, color: on && st === 3 ? INK : 'white', boxShadow: on ? `0 0 20px ${STAGES[st - 1][1]}` : 'none',
        transform: on ? `scaleX(${0.6 + 0.4 * ease(f, 0, 12)})` : 'none' }}>{on ? i : ''}</div>; })}
  </div>
);

/* ---------- the 17 step scenes ---------- */
const Box = ({ children, style }) => <div style={{ position: 'relative', width: 1120, height: 560, ...style }}>{children}</div>;
const SCENES = {
  1: ({ f, at }) => { const items = ['Show sites by department', 'Count records declared', 'Export to PDF'];
    return <Box><div style={{ position: 'absolute', left: 60, top: 80 }}><Person c={ADB} label="RAC" s={150} /></div>
      <div style={{ position: 'absolute', left: 300, top: 40, width: 520, padding: 28, borderRadius: 20, background: 'white', color: INK, transform: `rotate(-2deg) scale(${pop(f, at('they tell'))})` }}>
        <div style={{ fontSize: 30, fontWeight: 900, color: ADB, marginBottom: 14 }}>What we need</div>
        {items.map((t, i) => <div key={t} style={{ display: 'flex', gap: 14, alignItems: 'center', fontSize: 28, margin: '12px 0', opacity: ease(f, at('they tell') + 12 + i * 12, 10) }}>
          <span style={{ width: 26, height: 26, borderRadius: 6, border: `3px solid ${ADB}` }} />{t}</div>)}
        <div style={{ fontSize: 20, color: '#6B7C90', marginTop: 10 }}>example needs, for illustration</div></div>
      <Bubble k={pop(f, at('own words'))} style={{ left: 860, top: 70 }}>"In our own words"</Bubble></Box>; },
  2: ({ f, at }) => { const b = at('blocker');
    return <Box><div style={{ position: 'absolute', left: 100, top: 40, width: 460, height: 380, borderRadius: 16, background: '#16467E', border: '3px solid #7FB6E8',
      backgroundImage: 'linear-gradient(#2A5E9E 1px, transparent 1px), linear-gradient(90deg, #2A5E9E 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
      {[0, 1, 2].map(i => <div key={i} style={{ position: 'absolute', left: 50 + i * 130, top: 120 + (i % 2) * 70, width: 100, height: 70, border: '3px solid #BFE0FF', borderRadius: 6 }} />)}
      {f > b && <div style={{ position: 'absolute', left: 300, top: 200, transform: `scale(${bounce(f, b)})` }}><Bug s={70} /></div>}</div>
      <div style={{ position: 'absolute', left: 200 + Math.sin(f / 9) * 160, top: 120 + Math.cos(f / 11) * 90 }}>
        <svg width="160" height="160" viewBox="0 0 120 120"><circle cx="50" cy="50" r="36" fill="rgba(0,165,168,.2)" stroke={TEAL} strokeWidth="9" />
          <rect x="74" y="74" width="16" height="44" rx="6" fill={TEAL} transform="rotate(-45 74 74)" /></svg></div>
      <div style={{ position: 'absolute', left: 640, top: 60, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <In k={pop(f, at('can be built'))}><div style={{ fontSize: 38, fontWeight: 800 }}>Can it be built?</div></In>
        <In k={pop(f, at('and how'))}><div style={{ fontSize: 38, fontWeight: 800, color: TEAL }}>How?</div></In>
        <In k={pop(f, b)}><div style={{ padding: '18px 24px', borderRadius: 16, background: 'rgba(200,16,46,.15)', border: `3px solid ${RED}`, fontSize: 30, fontWeight: 800 }}>
          Blocker found early<div style={{ fontSize: 24, color: SOFT, fontWeight: 600 }}>cheaper now than halfway through</div></div></In></div></Box>; },
  3: ({ f, at }) => { const d = at('discovery');
    return <Box><div style={{ position: 'absolute', left: 260, top: 250, width: 560, height: 170, borderRadius: '50%', background: '#7A5634', boxShadow: '0 20px 40px rgba(0,0,0,.4)' }} />
      {[[180, 110, TEAL, 'AvePoint'], [420, 40, TEAL, 'AvePoint'], [660, 40, ADB, 'RAC'], [860, 110, ADB, 'RAC']].map(([x, y, c, l], i) =>
        <div key={i} style={{ position: 'absolute', left: x, top: y + (1 - pop(f, 4 + i * 5)) * 200, opacity: pop(f, 4 + i * 5) }}><Person c={c} label={l} s={110} /></div>)}
      {['Sites?', 'Records?', 'Filters?', 'Export?'].map((t, i) => <Bubble key={t} k={pop(f, at('every need') + i * 8)} style={{ left: 230 + i * 210, top: 0 }}>{t}</Bubble>)}
      <div style={{ position: 'absolute', left: 340, top: 300, width: 400, display: 'flex', justifyContent: 'center', gap: 14 }}>
        {[0, 1, 2].map(i => <div key={i} style={{ transform: `rotate(${(i - 1) * 8}deg)`, opacity: ease(f, at('detail') + i * 6, 8) }}><Doc s={60} c={BLUE} /></div>)}</div>
      <div style={{ position: 'absolute', right: 0, bottom: 10, opacity: ease(f, d, 10), transform: `scale(${pop(f, d)})` }}>
        <div style={{ padding: '16px 22px', borderRadius: 16, background: AMBER, color: INK, fontWeight: 900, fontSize: 28 }}>No requirements yet?
          <div style={{ fontSize: 34 }}>→ Discovery workshop</div></div></div></Box>; },
  4: ({ f, at }) => { const rows = ['Show sites by department', 'Count records declared', 'Export to PDF', 'Data refresh timing'];
    return <Box><div style={{ position: 'absolute', left: 120, top: 30, width: 700, padding: 26, borderRadius: 20, background: 'white', color: INK }}>
      <div style={{ fontSize: 30, fontWeight: 900, color: TEAL, marginBottom: 10 }}>Developer review</div>
      {rows.map((t, i) => { const flag = i === 3 ? at('risky') : i === 1 ? at('unclear') : -1, s = at('review') + i * 10;
        return <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 28, padding: '14px 0', borderBottom: '1px solid #DDE5EE', opacity: ease(f, s, 8) }}>
          {flag > 0 && f > flag ? <span style={{ fontSize: 34, color: i === 3 ? RED : AMBER, transform: `scale(${bounce(f, flag)})` }}>⚑</span> : <span style={{ color: GREEN, fontSize: 30 }}>✓</span>}
          {t}{flag > 0 && f > flag && <span style={{ marginLeft: 'auto', fontSize: 22, fontWeight: 800, color: i === 3 ? RED : AMBER }}>{i === 3 ? 'RISKY' : 'UNCLEAR'}</span>}</div>; })}</div>
      <div style={{ position: 'absolute', right: 80, top: 120 }}><Gear f={f} s={150} /></div></Box>; },
  5: ({ f, at }) => <Box>
    <div style={{ position: 'absolute', left: 80, top: 60, display: 'flex', gap: 40, alignItems: 'center' }}>
      <In k={pop(f, at('reconfirmation'))}><div style={{ width: 300, padding: 24, borderRadius: 18, background: 'rgba(255,255,255,.08)', border: '2px solid rgba(255,255,255,.2)', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}><User s={70} c={ADB} /><User s={70} c={TEAL} /></div><div style={{ fontSize: 28, fontWeight: 800, marginTop: 10 }}>Reconfirmation workshop</div></div></In>
      <In k={pop(f, at('or by email'))}><div style={{ fontSize: 40, color: SOFT, fontWeight: 800 }}>or</div></In>
      <In k={pop(f, at('or by email') + 4)}><div style={{ width: 300, padding: 24, borderRadius: 18, background: 'rgba(255,255,255,.08)', border: '2px solid rgba(255,255,255,.2)', textAlign: 'center' }}>
        <Mail s={110} /><div style={{ fontSize: 28, fontWeight: 800, marginTop: 10 }}>By email</div></div></In></div>
    <div style={{ position: 'absolute', left: 300, top: 360 }}><Stamp f={f} s={at('nothing moves')} text="CONFIRMED BY RAC" size={54} /></div></Box>,
  6: ({ f, at }) => { const s0 = at('user stories'), n = 6;
    return <Box><div style={{ position: 'absolute', left: 40, top: 40, width: 360, padding: 22, borderRadius: 16, background: 'rgba(255,255,255,.08)', textAlign: 'center' }}>
      <Doc s={100} c={GREEN} /><div style={{ fontSize: 26, fontWeight: 800 }}>Confirmed requirements</div></div>
      <div style={{ position: 'absolute', left: 560, top: 10, width: 520, height: 520, borderRadius: 18, background: '#F3F6FA', padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#0078D4', fontWeight: 900, fontSize: 26 }}>
          <div style={{ width: 32, height: 32, borderRadius: 6, background: '#0078D4' }} />Azure DevOps (ADO)</div>
        <div style={{ color: INK, fontSize: 24, fontWeight: 800, margin: '10px 0', opacity: ease(f, at('together'), 10) }}>Product backlog</div>
        {Array.from({ length: n }, (_, i) => { const t = ease(f, s0 + i * 7, 14);
          return <div key={i} style={{ position: 'absolute', left: 18 + (1 - t) * -500, top: 100 + i * 66, width: 484, opacity: t }}>
            <Ticket text={`User story ${i + 1}`} c="#0078D4" /></div>; })}</div>
      <In k={pop(f, at('one small need'))} style={{ position: 'absolute', left: 30, top: 300, width: 470 }}>
        <div style={{ padding: 20, borderRadius: 16, background: AMBER, color: INK, fontSize: 25, fontWeight: 800 }}>A user story = one small need,<br />from the user's point of view
          <div style={{ fontSize: 22, fontWeight: 600, marginTop: 8, fontStyle: 'italic' }}>"As a records officer, I want to see records by department."</div></div></In></Box>; },
  7: ({ f, at }) => { const pts = [3, 5, 2, 8, 3, 5];
    return <Box><div style={{ position: 'absolute', left: 60, top: 20, display: 'flex', flexWrap: 'wrap', gap: 18, width: 640 }}>
      {pts.map((p, i) => { const s = at('estimate') + i * 6;
        return <div key={i} style={{ position: 'relative', width: 190, opacity: ease(f, i * 3, 8) }}><Ticket text={`Story ${i + 1}`} c="#0078D4" />
          {f > s && <div style={{ position: 'absolute', right: -10, top: -18, width: 50, height: 50, borderRadius: 25, background: TEAL, display: 'grid', placeItems: 'center',
            fontSize: 26, fontWeight: 900, transform: `scale(${bounce(f, s)})` }}>{p}</div>}</div>; })}</div>
      <div style={{ position: 'absolute', right: 60, top: 30, textAlign: 'center' }}>
        <svg width="320" height="200" viewBox="0 0 320 200"><path d="M30 180 A130 130 0 0 1 290 180" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="28" />
          <path d="M30 180 A130 130 0 0 1 290 180" fill="none" stroke={TEAL} strokeWidth="28" strokeDasharray="410" strokeDashoffset={410 * (1 - 0.8 * ease(f, at('estimate'), 50))} />
          <line x1="160" y1="180" x2={160 - 110 * Math.cos(Math.PI * 0.8 * ease(f, at('estimate'), 50))} y2={180 - 110 * Math.sin(Math.PI * 0.8 * ease(f, at('estimate'), 50))} stroke="white" strokeWidth="8" strokeLinecap="round" /></svg>
        <div style={{ fontSize: 30, fontWeight: 800 }}>How much work?</div></div>
      <In k={pop(f, at('how long'))} style={{ position: 'absolute', left: 240, top: 380 }}><div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '18px 28px',
        borderRadius: 18, background: 'rgba(255,255,255,.08)', fontSize: 34, fontWeight: 800 }}><Cal s={70} />How long the release needs</div></In></Box>; },
  8: ({ f, at }) => <Box>
    <div style={{ position: 'absolute', left: 260, top: 20, width: 520, height: 430, borderRadius: 18, background: '#F3F6FA', padding: 18 }}>
      <div style={{ color: INK, fontSize: 28, fontWeight: 900 }}>Product backlog</div>
      {[0, 1, 2, 3, 4].map(i => <div key={i} style={{ marginTop: 12 }}><Ticket text={`User story ${i + 1}`} c="#0078D4" done={f > at('signs it off') + i * 3} /></div>)}</div>
    <div style={{ position: 'absolute', left: 380, top: 170 }}><Stamp f={f} s={at('signs it off') + 18} text="SIGNED OFF" size={64} /></div>
    <In k={pop(f, at('agreed plan'))} style={{ position: 'absolute', left: 820, top: 60 }}><div style={{ fontSize: 34, fontWeight: 800, width: 280 }}>= the agreed plan</div></In></Box>,
  9: ({ f, at }) => { const s0 = at('story by story');
    return <Box><div style={{ position: 'absolute', left: 60, top: 40, width: 520, height: 420, borderRadius: 16, background: '#0B1A2E', padding: 22, fontFamily: 'monospace', fontSize: 24, color: '#9FE3E4', overflow: 'hidden' }}>
      {Array.from({ length: 12 }, (_, i) => <div key={i} style={{ whiteSpace: 'nowrap', opacity: f > 8 + i * 6 ? 1 : 0, color: i % 4 === 0 ? AMBER : undefined }}>
        {['const report = build(story);', '  render(<Dashboard />);', 'test(story).pass();', 'export default Report;'][i % 4].slice(0, Math.max(0, Math.floor((f - 8 - i * 6) * 1.5)))}</div>)}</div>
      <div style={{ position: 'absolute', left: 640, top: 60, display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <Gear f={f} s={120} /><Gear f={f} s={80} c="#BFE9EA" dir={-1.5} /></div>
      <div style={{ position: 'absolute', left: 640, top: 230, width: 420, display: 'flex', flexWrap: 'wrap-reverse', gap: 10 }}>
        {Array.from({ length: 8 }, (_, i) => { const t = bounce(f, s0 + i * 8);
          return <div key={i} style={{ width: 130, height: 60, borderRadius: 8, background: i % 2 ? TEAL : BLUE, opacity: f > s0 + i * 8 ? 1 : 0, transform: `translateY(${(1 - t) * -200}px)`,
            display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 20 }}>Story {i + 1}</div>; })}</div></Box>; },
  10: ({ f, at }) => <Box>
    <div style={{ position: 'absolute', left: 80, top: 40 }}><Person c={TEAL} label="AvePoint QA" s={140} /></div>
    <div style={{ position: 'absolute', left: 330, top: 30, width: 380, padding: 22, borderRadius: 18, background: 'white', color: INK }}>
      <div style={{ fontSize: 28, fontWeight: 900, color: TEAL }}>Internal testing</div>
      {['Login', 'Filters', 'Charts', 'Export'].map((t, i) => <div key={t} style={{ display: 'flex', gap: 12, fontSize: 28, margin: '14px 0', alignItems: 'center' }}>
        {f > at('tests the release') + i * 10 ? <span style={{ color: GREEN, fontWeight: 900 }}>✓</span> : <span style={{ color: '#AAB' }}>○</span>}{t}</div>)}</div>
    <div style={{ position: 'absolute', left: 760, top: 60, width: 320 }}>
      {[0, 1, 2].map(i => { const t = ease(f, at('test cases') + i * 8, 14);
        return <div key={i} style={{ marginBottom: 14, opacity: t, transform: `translateX(${(1 - t) * 200}px)` }}><Ticket text={`Test case ${i + 1}`} c={AMBER} /></div>; })}
      <In k={pop(f, at('will use next'))}><div style={{ fontSize: 26, fontWeight: 800, color: SOFT, marginTop: 10 }}>→ handed to ADB for SIT</div></In></div></Box>,
  11: ({ f, at }) => { const found = at('every defect'), logged = at('logged'), fixed = at('fixed by'), again = at('tested again'), x = interpolate(f, [found - 20, found + 10], [-120, 330], clamp);
    return <Box><div style={{ position: 'absolute', left: 40, top: 40 }}><Person c={BLUE} label="ITD TCS QA" s={130} /></div>
      <div style={{ position: 'absolute', left: 230, top: 80, width: 420, height: 260, borderRadius: 16, background: 'white' }}>
        {[0, 1, 2, 3].map(i => <div key={i} style={{ margin: '24px 24px', height: 18, borderRadius: 9, background: '#C9D6E3', width: `${80 - i * 12}%` }} />)}
        {f < fixed && <div style={{ position: 'absolute', left: x, top: 120, transform: `rotate(${Math.sin(f / 3) * 15}deg)` }}><Bug s={64} /></div>}
        {f >= fixed && <div style={{ position: 'absolute', left: 300, top: 110, transform: `scale(${bounce(f, fixed)})` }}><Check s={70} /></div>}</div>
      <div style={{ position: 'absolute', left: 700, top: 60, width: 380, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <In k={pop(f, logged)}><Ticket text="Defect logged in ADO" c={RED} done={f > again} /></In>
        <In k={pop(f, fixed)}><Ticket text="Fixed by developers" c={TEAL} done={f > again} /></In>
        <In k={pop(f, again)}><Ticket text="Tested again" c={BLUE} done={f > again + 10} /></In></div>
      <div style={{ position: 'absolute', left: 300, top: 380 }}><Stamp f={f} s={at('give the s i t sign off')} text="SIT SIGNED OFF" size={56} /></div></Box>; },
  12: ({ f, at }) => { const pg = Math.floor(interpolate(f, [at('u a t guide'), at('any bugs')], [0, 4], clamp));
    return <Box><div style={{ position: 'absolute', left: 40, top: 30 }}><Person c={ADB} label="RAC" s={130} /></div>
      <In k={pop(f, at('briefing'))} style={{ position: 'absolute', left: 230, top: 20 }}><div style={{ padding: '14px 22px', borderRadius: 14, background: 'rgba(255,255,255,.1)', fontSize: 28, fontWeight: 800 }}>UAT briefing</div></In>
      <div style={{ position: 'absolute', left: 230, top: 110, width: 460, height: 300, borderRadius: 14, background: 'white', color: INK, padding: 22, opacity: ease(f, at('u a t guide'), 10),
        boxShadow: '8px 8px 0 #C9D6E3, 16px 16px 0 #9FB6CC' }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: ADB }}>UAT guide</div>
        {['Open the report', 'Pick a department', 'Check the figures', 'Export a PDF'].map((t, i) => <div key={t} style={{ display: 'flex', gap: 12, fontSize: 26, margin: '12px 0' }}>
          <span style={{ color: i < pg ? GREEN : '#AAB', fontWeight: 900 }}>{i < pg ? '✓' : `${i + 1}.`}</span>{t}</div>)}</div>
      <In k={pop(f, at('any bugs'))} style={{ position: 'absolute', left: 760, top: 80 }}><div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ opacity: f > at('fixed along') + 10 ? 0.25 : 1 }}><Bug s={70} /></div>{f > at('fixed along') + 10 && <Check s={60} />}</div>
        <div style={{ fontSize: 26, fontWeight: 800, marginTop: 8 }}>Bugs fixed along the way</div></In>
      <div style={{ position: 'absolute', left: 720, top: 300 }}><Stamp f={f} s={at('ends with')} text="UAT SIGNED OFF" size={50} /></div></Box>; },
  13: ({ f, at }) => <Box>
    <div style={{ position: 'absolute', left: 300, top: 10, width: 500, height: 470, borderRadius: 16, background: 'white', color: INK, padding: 30, transform: `rotate(-2deg) translateY(${(1 - pop(f, 4)) * 300}px)` }}>
      <div style={{ fontSize: 34, fontWeight: 900, color: ADB }}>UAT completion report</div>
      {[['What was tested', 'tested'], ['What was found', 'found'], ['What was fixed', 'was fixed']].map(([t, p]) => <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 16,
        fontSize: 30, fontWeight: 700, margin: '26px 0', opacity: ease(f, at(p), 8) }}><Check s={44} />{t}</div>)}
      <div style={{ marginTop: 20 }}><Stamp f={f} s={at('proof')} text="READY" size={50} rot={-6} /></div></div></Box>,
  14: ({ f, at }) => <Box>
    <div style={{ position: 'absolute', left: 60, top: 30, fontSize: 40, fontWeight: 900 }}>
      {'CAB'.split('').map((L, i) => <span key={i} style={{ color: TEAL }}>{L}<span style={{ color: 'white', fontSize: 30, opacity: ease(f, at('stands for') + i * 8, 10) }}>
        {['hange ', 'dvisory ', 'oard'][i]}</span></span>)}</div>
    <div style={{ position: 'absolute', left: 160, top: 170, width: 760, height: 60, borderRadius: 30, background: '#7A5634' }} />
    {[0, 1, 2, 3].map(i => <div key={i} style={{ position: 'absolute', left: 180 + i * 190, top: 60 }}><User s={110} c={PAPER} />
      {f > at('for approval') + i * 8 && <div style={{ position: 'absolute', left: 30, top: -50, transform: `scale(${bounce(f, at('for approval') + i * 8)})` }}><Check s={56} /></div>}</div>)}
    <In k={pop(f, at('presented'))} style={{ position: 'absolute', left: 420, top: 260 }}><Doc s={110} c={BLUE} /></In>
    <div style={{ position: 'absolute', left: 340, top: 410 }}><Stamp f={f} s={at('for approval') + 36} text="APPROVED" size={60} /></div></Box>,
  15: ({ f, at }) => { const go = at('goes live'), t = ease(f, go, 30), night = at('outside office');
    return <Box><div style={{ position: 'absolute', inset: 0, borderRadius: 30, background: `rgba(0,0,0,${0.35 * ease(f, night, 20)})` }} />
      {f > night && <div style={{ position: 'absolute', right: 70, top: 30, width: 90, height: 90, borderRadius: 45, boxShadow: `-22px 10px 0 0 ${AMBER}`, opacity: ease(f, night, 15) }} />}
      <div style={{ position: 'absolute', left: 420, top: 300 - t * 320, transform: `rotate(-10deg)` }}>
        <svg width="140" height="220" viewBox="0 0 70 110"><path d="M35 0 C55 20 58 50 52 75 H18 C12 50 15 20 35 0z" fill="white" /><circle cx="35" cy="38" r="9" fill={BLUE} />
          <path d="M18 60 L5 85 L18 78z M52 60 L65 85 L52 78z" fill={RED} />
          {f > go && <path d={`M22 76 Q35 ${100 + Math.sin(f) * 8} 48 76`} fill={AMBER} />}</svg></div>
      <div style={{ position: 'absolute', left: 60, bottom: 30, display: 'flex', gap: 14 }}>{Array.from({ length: 10 }, (_, i) =>
        <div key={i} style={{ opacity: ease(f, go + 20 + i * 3, 8) }}><User s={56} c={GREEN} /></div>)}</div>
      <In k={pop(f, go + 20)} style={{ position: 'absolute', left: 700, top: 120 }}><div style={{ fontSize: 44, fontWeight: 900, color: GREEN }}>LIVE for every user</div></In>
      {f > night && <In k={pop(f, night)} style={{ position: 'absolute', left: 700, top: 220 }}><div style={{ fontSize: 30, fontWeight: 800, color: AMBER }}>Outside office hours,<br />nobody disrupted</div></In>}</Box>; },
  16: ({ f, at }) => <Box>
    <div style={{ position: 'absolute', left: 60, top: 40 }}><Person c={BLUE} label="ITD TCS QA" s={130} /></div>
    <div style={{ position: 'absolute', left: 300, top: 30, width: 480, padding: 22, borderRadius: 18, background: 'white', color: INK }}>
      <div style={{ fontSize: 28, fontWeight: 900, color: BLUE }}>Quick checks in production</div>
      {['Site opens', 'Report loads', 'Figures match testing', 'Export works'].map((t, i) => <div key={t} style={{ display: 'flex', gap: 12, fontSize: 28, margin: '14px 0' }}>
        <span style={{ color: f > at('quick checks') + i * 5 ? GREEN : '#AAB', fontWeight: 900 }}>{f > at('quick checks') + i * 5 ? '✓' : '○'}</span>{t}</div>)}</div>
    <div style={{ position: 'absolute', left: 820, top: 80, fontSize: 90, fontWeight: 900, color: TEAL, opacity: ease(f, at('quick'), 6) * (0.6 + 0.4 * Math.sin(f / 3)) }}>⚡</div>
    <div style={{ position: 'absolute', left: 360, top: 400 }}><Stamp f={f} s={at('q a sign off')} text="QA SIGNED OFF" size={56} /></div></Box>,
  17: ({ f, at }) => { const pts = Array.from({ length: 60 }, (_, i) => { const x = i * 16, ph = (i + f / 2) % 15; return `${x},${170 - (ph > 6 && ph < 8 ? (ph < 7 ? 90 : -40) : 0)}`; }).join(' ');
    const bug = at('any issues'), fix = at('fixes them fast');
    return <Box><div style={{ position: 'absolute', left: 60, top: 40, width: 960, height: 280, borderRadius: 18, background: '#0B1A2E', overflow: 'hidden' }}>
      <svg width="960" height="280"><polyline points={pts} fill="none" stroke={GREEN} strokeWidth="5" /></svg>
      {f > bug && f < fix + 10 && <div style={{ position: 'absolute', left: 600, top: 90, transform: `scale(${bounce(f, bug)})` }}><Bug s={70} /></div>}
      {f >= fix + 10 && <div style={{ position: 'absolute', left: 600, top: 90, transform: `scale(${bounce(f, fix + 10)})` }}><Check s={70} /></div>}</div>
      <In k={pop(f, at('watches'))} style={{ position: 'absolute', left: 60, top: 350 }}><div style={{ fontSize: 34, fontWeight: 800 }}>Watching closely after go live</div></In>
      <In k={pop(f, at('hotfix'))} style={{ position: 'absolute', left: 640, top: 340 }}><div style={{ padding: '14px 24px', borderRadius: 14, background: AMBER, color: INK, fontSize: 32, fontWeight: 900 }}>
        Small fix = hotfix</div></In></Box>; },
};

const StepScene = ({ b, f, at }) => {
  const [n, title, owner, st] = STEPS[b.n - 1], S = SCENES[b.n], gate = GATES[b.n];
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 170, display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ width: 92, height: 92, borderRadius: 20, background: STAGES[st - 1][1], color: st === 3 ? INK : 'white', display: 'grid', placeItems: 'center',
          fontSize: 54, fontWeight: 900, transform: `scale(${bounce(f, 2)}) rotate(${(1 - bounce(f, 2)) * -30}deg)` }}>{n}</div>
        <div style={{ fontSize: 58, fontWeight: 900, opacity: ease(f, 6, 10), transform: `translateX(${(1 - ease(f, 6, 12)) * -60}px)` }}>{title}</div></div>
      <div style={{ position: 'absolute', left: 60, top: 300 }}><S f={f} at={at} /></div>
      <div style={{ position: 'absolute', left: 1330, top: 300, width: 530, display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center' }}>
        <div style={{ padding: 10, borderRadius: 18, background: 'rgba(255,255,255,.05)' }}><House stage={st} f={f + 200} s={0.95} /></div>
        {owner && <In k={pop(f, 14)}><div style={{ padding: '12px 22px', borderRadius: 14, background: OWNER_C(owner), fontSize: 28, fontWeight: 800 }}>Who: {owner}</div></In>}
        {b.date && <In k={pop(f, at('utilization report'))}><div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 22px', borderRadius: 14,
          background: 'white', color: INK, fontSize: 26, fontWeight: 800 }}><Cal s={44} />2026.4: {b.date}</div></In>}
        {gate && <In k={pop(f, 20)}><div style={{ padding: '10px 18px', borderRadius: 12, border: `3px dashed ${GREEN}`, color: GREEN, fontSize: 24, fontWeight: 800 }}>GATE: {gate}</div></In>}
      </div>
    </>
  );
};

/* ---------- full screen scenes ---------- */
const Hook = ({ f, at }) => {
  const snap = at('passes through'), skip = at('skip one'), follow = at('follow them all'), wel = at('welcome');
  const pipe = j => ({ x: 120 + j * 98, y: 470 });
  return <Back>
    {STEPS.map(([n, , , st], j) => { const k = ease(f, snap + j * 2, 20), x0 = rnd(j) * 1800, y0 = rnd(j + 40) * 900, p = pipe(j);
      const broken = j === 8 && f > skip && f < follow, ok = f > follow && ease(f, follow + j * 2, 6) > 0.5;
      return <div key={n} style={{ position: 'absolute', left: x0 + (p.x - x0) * k, top: y0 + (p.y - y0) * k + (broken ? 40 : 0), width: 84, height: 84, borderRadius: 16,
        background: broken ? RED : ok ? GREEN : STAGES[st - 1][1], color: st === 3 && !broken && !ok ? INK : 'white', display: 'grid', placeItems: 'center', fontSize: 38, fontWeight: 900,
        transform: `rotate(${broken ? 25 : (1 - k) * (rnd(j + 3) - 0.5) * 300}deg) scale(${f < 4 + j ? 0 : 1})`, opacity: f > wel ? 1 - ease(f, wel, 12) : 1,
        boxShadow: ok ? `0 0 24px ${GREEN}` : '0 8px 20px rgba(0,0,0,.3)' }}>{n}</div>; })}
    {f > skip && f < follow && <div style={{ position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', fontSize: 70, fontWeight: 900, color: RED,
      transform: `scale(${bounce(f, skip + 6)}) translateX(${Math.sin(f * 2) * 6}px)` }}>Skip one, it breaks</div>}
    {f > follow && f < wel && <div style={{ position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', fontSize: 70, fontWeight: 900, color: GREEN,
      transform: `scale(${bounce(f, follow + 10)})` }}>Follow them all, it works</div>}
    <div style={{ position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center', opacity: f < wel ? ease(f, snap, 10) : 1 - ease(f, wel, 10) }}>
      <div style={{ fontSize: 150, fontWeight: 900, color: TEAL, transform: `scale(${bounce(f, snap)})` }}>17 steps</div>
      <div style={{ fontSize: 40, color: SOFT, fontWeight: 700 }}>from first idea to go live</div></div>
    {f > wel && <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ fontSize: 44, color: TEAL, fontWeight: 800, opacity: ease(f, wel, 10) }}>EDRMS Knowledge Transfer</div>
      <div style={{ fontSize: 110, fontWeight: 900, transform: `scale(${3 - 2 * bounce(f, wel + 4)})`, opacity: ease(f, wel + 4, 6) }}>Part 3</div>
      <div style={{ fontSize: 64, fontWeight: 800, opacity: ease(f, wel + 14, 10) }}>How a release is delivered</div></AbsoluteFill>}
  </Back>;
};

const HouseScene = ({ f, at }) => {
  const ats = { 1: at('agree on the plan'), 2: at('then you build'), 3: at('inspected'), 4: at('move in') };
  const stage = f > ats[4] ? 4 : f > ats[3] ? 3 : f > ats[2] ? 2 : 1, four = at('four stages'), ex = at('we will follow');
  return <Back>
    <div style={{ position: 'absolute', left: 120, top: 150 }}><House stage={stage} f={f} s={1.8} at={ats} /></div>
    <div style={{ position: 'absolute', left: 900, top: 180, display: 'flex', flexDirection: 'column', gap: 26 }}>
      {STAGES.map(([t, c], i) => <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 22, opacity: ease(f, four + i * 8, 10), transform: `translateX(${(1 - ease(f, four + i * 8, 14)) * 200}px)` }}>
        <div style={{ width: 70, height: 70, borderRadius: 35, background: c, display: 'grid', placeItems: 'center', fontSize: 36, fontWeight: 900, color: c === AMBER ? INK : 'white' }}>{i + 1}</div>
        <div style={{ fontSize: 56, fontWeight: 900 }}>{t}</div>
        <div style={{ fontSize: 26, color: SOFT }}>{['the blueprint', 'the walls', 'the inspection', 'the keys'][i]}</div></div>)}</div>
    <In k={pop(f, ex)} style={{ position: 'absolute', left: 900, top: 720 }}><div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 26px', borderRadius: 16,
      background: 'white', color: INK, fontSize: 30, fontWeight: 800 }}><Cal s={50} />Example: Release 2026.4, Utilization Report</div></In>
  </Back>;
};

const StageScene = ({ b, f }) => {
  const [t, c] = STAGES[b.stage - 1];
  return <Back>
    <div style={{ position: 'absolute', inset: 0, background: c, opacity: 0.18 * (1 - ease(f, 0, 30)) }} />
    <AbsoluteFill style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 90 }}>
      <House stage={b.stage} f={f} s={1.5} />
      <div><div style={{ fontSize: 48, color: c, fontWeight: 900, letterSpacing: 6, opacity: ease(f, 2, 8) }}>STAGE {b.stage}</div>
        <div style={{ fontSize: 170, fontWeight: 900, transform: `scale(${3 - 2 * bounce(f, 4)})`, opacity: ease(f, 4, 6), transformOrigin: 'left center' }}>{t}</div>
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>{STEPS.filter(s => s[3] === b.stage).map(([n], j) =>
          <div key={n} style={{ width: 64, height: 64, borderRadius: 14, background: c, color: c === AMBER ? INK : 'white', display: 'grid', placeItems: 'center', fontSize: 30, fontWeight: 900,
            transform: `scale(${bounce(f, 12 + j * 4)})` }}>{n}</div>)}</div></div>
    </AbsoluteFill></Back>;
};

const Who = ({ f, at }) => {
  const groups = [['RAC', ADB, [1, 3, 5, 8, 12], 'r a c sets'], ['AvePoint', TEAL, [2, 3, 4, 6, 7, 9, 10], 'avepoint gathers'], ['ITD TCS QA', BLUE, [11, 16], 'i t d']];
  return <Back><div style={{ position: 'absolute', top: 70, width: '100%' }}><Title k={pop(f, 0)} size={72}>Who does what?</Title></div>
    <div style={{ position: 'absolute', left: 80, right: 80, top: 230, display: 'flex', flexDirection: 'column', gap: 40 }}>
      {groups.map(([g, c, own, p], gi) => { const s = at(p);
        return <div key={g} style={{ display: 'flex', alignItems: 'center', gap: 30, opacity: ease(f, s - 10, 12) }}>
          <div style={{ width: 300, padding: '20px 24px', borderRadius: 18, background: c, fontSize: 40, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 14 }}>
            <User s={56} c="white" />{g}</div>
          <div style={{ display: 'flex', gap: 10 }}>{STEPS.map(([n]) => { const mine = own.includes(n), k = mine ? bounce(f, s + own.indexOf(n) * 5) : 0;
            return <div key={n} style={{ width: 70, height: 70, borderRadius: 14, display: 'grid', placeItems: 'center', fontSize: 30, fontWeight: 900,
              background: mine && f > s ? c : 'rgba(255,255,255,.06)', color: mine ? 'white' : 'rgba(255,255,255,.2)', transform: `scale(${mine && f > s ? 0.7 + 0.3 * k : 0.85})` }}>{n}</div>; })}</div></div>; })}</div>
    <In k={pop(f, at('three groups'))} style={{ position: 'absolute', left: 0, right: 0, top: 830 }}><Title k={1} size={54} color={TEAL}>Three groups, one release</Title></In></Back>;
};

const Gates = ({ f, at }) => {
  const ph = ['requirements confirmed', 'backlog signed', 's i t signed', 'u a t signed', 'change board', 'q a signed off'];
  const names = ['Requirements confirmed', 'Backlog signed off', 'SIT signed off', 'UAT signed off', 'Change board approved', 'QA signed off'];
  const ts = ph.map(p => at(p)), x0 = 140, gap = 290, cur = ts.filter(t => f > t).length;
  const ballX = x0 - 90 + interpolate(f, [ts[0] - 20, ...ts.map(t => t + 10)], [0, ...ts.map((_, i) => (i + 0.5) * gap + 90)], clamp);
  return <Back><div style={{ position: 'absolute', top: 70, width: '100%' }}><Title k={pop(f, 0)} size={72}>Six gates</Title></div>
    <div style={{ position: 'absolute', left: 80, right: 80, top: 560, height: 10, background: 'rgba(255,255,255,.2)', borderRadius: 5 }} />
    {names.map((n, i) => { const shut = f > ts[i], k = shut ? bounce(f, ts[i]) : 0;
      return <div key={n} style={{ position: 'absolute', left: x0 + i * gap, top: 330, width: 200, textAlign: 'center' }}>
        <div style={{ height: 230, position: 'relative' }}><div style={{ position: 'absolute', left: 30, bottom: 0, width: 14, height: 230, background: shut ? GREEN : '#5B7590', borderRadius: 7 }} />
          <div style={{ position: 'absolute', right: 30, bottom: 0, width: 14, height: 230, background: shut ? GREEN : '#5B7590', borderRadius: 7 }} />
          <div style={{ position: 'absolute', left: 30, right: 30, top: 60, height: 18, background: shut ? GREEN : '#5B7590', borderRadius: 9, transformOrigin: 'left center',
            transform: `rotate(${(1 - k) * -70}deg)` }} />
          {shut && <div style={{ position: 'absolute', left: 72, top: 110, transform: `scale(${k})` }}><Check s={56} /></div>}</div>
        <div style={{ fontSize: 26, fontWeight: 800, marginTop: 20, color: shut ? 'white' : SOFT }}>{n}</div></div>; })}
    <div style={{ position: 'absolute', left: ballX, top: 520, width: 56, height: 56, borderRadius: 28, background: TEAL, boxShadow: `0 0 30px ${TEAL}` }} />
    <In k={pop(f, at('only moves forward'))} style={{ position: 'absolute', left: 0, right: 0, top: 800 }}>
      <Title k={1} size={44} color={TEAL}>A release moves forward only when the gate before it is closed</Title></In>
    <div style={{ position: 'absolute', right: 90, top: 90, fontSize: 40, fontWeight: 900, color: GREEN }}>{cur} / 6</div></Back>;
};

const Outro = ({ f, at }) => (
  <Back><AbsoluteFill style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 80 }}>
    <House stage={4} f={f + 300} s={1.5} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {STAGES.map(([t, c], i) => <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 18, transform: `translateX(${(1 - bounce(f, at(t.toLowerCase()) - 4)) * 300}px)`,
        opacity: ease(f, at(t.toLowerCase()) - 4, 6) }}><Check s={60} c={c} /><div style={{ fontSize: 64, fontWeight: 900 }}>{t}</div></div>)}
      <div style={{ fontSize: 44, color: TEAL, fontWeight: 800, marginTop: 20, opacity: ease(f, at('seventeen'), 10) }}>17 steps, every release</div></div>
  </AbsoluteFill></Back>
);

/* ---------- timeline, subtitles, audio ---------- */
const Subtitle = ({ text, f, n }) => {
  const parts = text.replace(/E D R M S/g, 'EDRMS').replace(/A D B/g, 'ADB').replace(/R A C/g, 'RAC').replace(/I T D/g, 'ITD').replace(/T C S Q A/g, 'TCS QA')
    .replace(/Q A/g, 'QA').replace(/A D O/g, 'ADO').replace(/S I T/g, 'SIT').replace(/U A T/g, 'UAT').replace(/C A B/g, 'CAB')
    .replace(/twenty twenty six point four/g, '2026.4')
    .match(/(?:[^.?!,:]|[.,](?=\d))+[.?!,:]*/g).map(s => s.trim()).filter(Boolean);
  const merged = parts.reduce((a, s) => (a.length && (a.at(-1).length + s.length < 70) ? [...a.slice(0, -1), a.at(-1) + ' ' + s] : [...a, s]), []);
  const tot = merged.reduce((a, s) => a + s.length, 0), span = n - LEAD - TAIL;
  let acc = 0, cur = merged[0];
  for (const s of merged) { if (LEAD + (acc / tot) * span <= f) cur = s; acc += s.length; }
  return <div style={{ position: 'absolute', left: 0, right: 0, bottom: 26, display: 'flex', justifyContent: 'center' }}>
    <div style={{ maxWidth: 1560, background: 'rgba(16,36,62,0.9)', color: 'white', fontFamily: FONT, fontSize: 34, lineHeight: 1.3, padding: '10px 28px',
      borderRadius: 10, textAlign: 'center' }}>{cur.replace(/[,:]$/, '')}</div></div>;
};
const atFor = j => phrase => {
  const b = BEATS[j], i = b.t.toLowerCase().indexOf(phrase.toLowerCase());
  return LEAD + (i < 0 ? 0 : (i / b.t.length) * b.seconds * FPS);
};

export const Part3 = () => {
  const f = useCurrentFrame();
  const i = START.findLastIndex(s => s <= f), b = BEATS[i], lf = f - START[i], n = len(b), p = BEATS[i - 1], nx = BEATS[i + 1];
  const isStep = x => x && x.mg === 'step';
  const fade = Math.min(isStep(p) && isStep(b) ? 1 : interpolate(lf, [0, 12], [0, 1], clamp), isStep(b) && isStep(nx) ? 1 : interpolate(lf, [n - 12, n], [1, 0], clamp));
  const inner = isStep(b) ? Math.min(interpolate(lf, [0, 10], [0, 1], clamp), interpolate(lf, [n - 8, n], [1, 0], clamp)) : 1;
  const at = atFor(i), stage = isStep(b) ? STEPS[b.n - 1][3] : 0;
  return (
    <AbsoluteFill style={{ background: INK }}>
      <AbsoluteFill style={{ opacity: fade }}>
        {b.mg === 'hook' && <Hook f={lf} at={at} />}
        {b.mg === 'house' && <HouseScene f={lf} at={at} />}
        {b.mg === 'stage' && <StageScene b={b} f={lf} />}
        {b.mg === 'who' && <Who f={lf} at={at} />}
        {b.mg === 'gates' && <Gates f={lf} at={at} />}
        {b.mg === 'outro' && <Outro f={lf} at={at} />}
        {isStep(b) && <Back><StageBar stage={stage} f={lf} fresh={!isStep(p) || STEPS[p.n - 1][3] !== stage} /><Dots n={b.n} f={lf} />
          <AbsoluteFill style={{ opacity: inner }}><StepScene b={b} f={lf} at={at} /></AbsoluteFill></Back>}
        <Subtitle text={b.t} f={lf} n={n} />
      </AbsoluteFill>
      <Audio src={staticFile('music.mp3')} loop volume={fr => 0.07 * interpolate(fr, [TOTAL - 60, TOTAL], [1, 0], clamp)} />
      {BEATS.map((x, j) => <Sequence key={j} from={START[j] + LEAD} durationInFrames={Math.ceil(x.seconds * FPS) + 2}><Audio src={staticFile(`vo/${j}.wav`)} /></Sequence>)}
    </AbsoluteFill>
  );
};
