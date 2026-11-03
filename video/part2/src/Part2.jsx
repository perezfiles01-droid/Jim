import React from 'react';
/* KT Part 2: the release journey. Fully animated, no recording. A winding road
   across the top carries every release as a milestone, a marker travels to the
   one being described, and the lower half shows its info card and an animation
   of what it does, with story badges for what happened on the way. */
import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame } from 'remotion';
import BEATS from './beats.gen.json';
import { INK, BLUE, TEAL, ADB, GREEN, SOFT, PAPER, RED, FONT, pop, ease, In, Doc, User, Site, DB, Mail, Cal } from '../../src/MG';

const FPS = 30, W = 1920, H = 1080, LEAD = 10, TAIL = 16;
const len = b => LEAD + Math.ceil(b.seconds * FPS) + TAIL;
const START = BEATS.reduce((a, b, i) => [...a, i ? a[i - 1] + len(BEATS[i - 1]) : 0], []);
export const TOTAL = START.at(-1) + len(BEATS.at(-1));
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };
const AMBER = '#F2A900';
const rnd = i => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); };
const bounce = (f, s) => spring({ frame: f - s, fps: FPS, config: { damping: 9, stiffness: 150 } });

/* [number, date, title, status, hotfix?] status: done | prog | now | hold */
const R = [
  ['1.1', 'Apr 2025', 'The foundation: Cloud Governance and records declaration', 'done'],
  ['1.1.1', 'May 2025', 'Hotfix: an error message changed', 'done', 1],
  ['1.2 / 1.2.1', 'Nov 2025', 'Multimedia records, native retention label option disabled', 'done'],
  ['2026.1', 'Jan 2026', 'Multiple records declaration, plus hotfix 2026.1.1', 'done'],
  ['2026.2', 'Mar 2026', 'Centralized records declaration', 'done'],
  ['2026.3', 'Jun 2026', 'Email records declaration from Outlook (alpha)', 'done'],
  ['2026.3.1', 'In progress', 'Email records enhancement', 'prog', 1],
  ['2026.4', 'Current', 'EDRMS Utilization Report', 'now'],
  ['2026.5', 'On hold', 'Physical records management', 'hold'],
];
const COL = { done: GREEN, prog: TEAL, now: TEAL, hold: PAPER };
const LABEL = { done: 'DELIVERED', prog: 'IN PROGRESS', now: 'CURRENT RELEASE', hold: 'ON HOLD' };

/* ---------- shared pieces ---------- */
const Back = ({ children }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ background: `radial-gradient(circle at 25% 15%, #1B3A63 0%, ${INK} 65%)`, fontFamily: FONT, color: 'white', overflow: 'hidden' }}>
    {Array.from({ length: 18 }, (_, i) => <div key={i} style={{ position: 'absolute', left: rnd(i) * W, top: ((rnd(i + 5) * H) + f * (0.2 + rnd(i + 9) * 0.5)) % H,
      width: 4 + rnd(i + 3) * 6, height: 4 + rnd(i + 3) * 6, borderRadius: 10, background: TEAL, opacity: 0.12 + rnd(i + 1) * 0.15 }} />)}
    {children}</AbsoluteFill>;
};
const Title = ({ k, children, size = 64, color = 'white' }) => (
  <In k={k}><div style={{ fontSize: size, fontWeight: 800, color, textAlign: 'center' }}>{children}</div></In>
);
const Check = ({ s = 56, c = GREEN }) => (
  <svg width={s} height={s} viewBox="0 0 50 50"><circle cx="25" cy="25" r="24" fill={c} />
    <path d="M14 26l8 8 15-17" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Lock = ({ s = 46, c = GREEN }) => (
  <svg width={s} height={s} viewBox="-30 -30 60 60"><circle r="28" fill={c} /><rect x="-11" y="-3" width="22" height="16" rx="3" fill="white" />
    <path d="M-7 -3v-6a7 7 0 0 1 14 0v6" stroke="white" strokeWidth="4" fill="none" /></svg>
);
const Gear = ({ f, s = 70, c = TEAL, dir = 1 }) => (
  <svg width={s} height={s} viewBox="-50 -50 100 100" style={{ transform: `rotate(${dir * f * 4}deg)` }}>
    {Array.from({ length: 8 }, (_, i) => <rect key={i} x="-9" y="-48" width="18" height="22" rx="4" fill={c} transform={`rotate(${i * 45})`} />)}
    <circle r="32" fill={c} /><circle r="13" fill={INK} /></svg>
);
const Bug = ({ s = 50, c = RED }) => (
  <svg width={s} height={s} viewBox="0 0 50 50"><ellipse cx="25" cy="28" rx="12" ry="15" fill={c} /><circle cx="25" cy="12" r="7" fill={c} />
    {[16, 26, 36].map(y => <g key={y}><line x1="13" y1={y} x2="3" y2={y - 4} stroke={c} strokeWidth="3" /><line x1="37" y1={y} x2="47" y2={y - 4} stroke={c} strokeWidth="3" /></g>)}</svg>
);
const Wrench = ({ s = 60, c = AMBER, f = 0 }) => (
  <svg width={s} height={s} viewBox="0 0 50 50" style={{ transform: `rotate(${Math.sin(f / 4) * 20}deg)` }}>
    <path d="M30 6a10 10 0 0 0-9 14L6 35a4 4 0 0 0 6 6l15-15a10 10 0 0 0 14-9l-6 5-6-2-2-6z" fill={c} /></svg>
);
const FileIcon = ({ ext, c, s = 86 }) => (
  <div style={{ position: 'relative', width: s, textAlign: 'center' }}><Doc s={s} c={c} />
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 12, fontSize: s * 0.22, fontWeight: 800, color: c }}>{ext}</div></div>
);
const Badge = ({ k, children, c = GREEN, icon }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '10px 18px', borderRadius: 14, background: 'rgba(255,255,255,.07)', border: `3px solid ${c}`,
    fontSize: 26, fontWeight: 800, opacity: Math.min(1, k * 1.5), transform: `scale(${0.6 + 0.4 * k}) translateX(${(1 - k) * 40}px)` }}>{icon}{children}</div>
);
const Moon = ({ s = 50 }) => <div style={{ width: s, height: s, borderRadius: s, boxShadow: `-${s * 0.25}px ${s * 0.1}px 0 0 ${AMBER}` }} />;
const Pause = ({ s = 50, c = PAPER }) => <div style={{ display: 'flex', gap: s * 0.18 }}><div style={{ width: s * 0.3, height: s, background: c, borderRadius: 4 }} />
  <div style={{ width: s * 0.3, height: s, background: c, borderRadius: 4 }} /></div>;

/* ---------- the road ---------- */
const RX0 = 110, RX1 = 1810, roadY = x => 215 + 48 * Math.sin((x - RX0) / 230);
const mx = i => RX0 + (i / (R.length - 1)) * (RX1 - RX0);
const Road = ({ r, f, travelFrom }) => {
  const t = ease(f, 0, 32), from = travelFrom ?? r, x = mx(from) + (mx(r) - mx(from)) * t;
  const pts = Array.from({ length: 70 }, (_, j) => { const xx = RX0 + (j / 69) * (RX1 - RX0); return `${xx},${roadY(xx)}`; }).join(' ');
  const yr = (mx(2) + mx(3)) / 2;
  return <>
    <svg width={W} height={420} style={{ position: 'absolute', top: 0, left: 0 }}>
      <polyline points={pts} fill="none" stroke="#2A4A72" strokeWidth="30" strokeLinecap="round" />
      <polyline points={pts} fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="3" strokeDasharray="16 14" />
      <line x1={yr} y1={110} x2={yr} y2={330} stroke="rgba(255,255,255,.25)" strokeWidth="2" strokeDasharray="6 6" />
      <text x={yr - 16} y={322} fill={SOFT} fontSize="22" fontWeight="700" textAnchor="end" fontFamily={FONT}>2025</text>
      <text x={yr + 16} y={322} fill={TEAL} fontSize="22" fontWeight="800" fontFamily={FONT}>2026</text>
    </svg>
    {R.map(([n, d, , s, hot], j) => { const xx = mx(j), y = roadY(xx), on = j === r, reached = j < r || (on && t > 0.95), sz = hot ? 22 : on ? 40 : 30;
      return <div key={n} style={{ position: 'absolute', left: xx - 90, top: y - (hot ? 82 : 98), width: 180, textAlign: 'center', opacity: j <= r ? 1 : 0.3 }}>
        <div style={{ fontSize: hot ? 18 : 20, color: SOFT }}>{d}</div>
        <div style={{ fontSize: on ? 32 : hot ? 20 : 26, fontWeight: 900, marginBottom: 4, color: hot && !on ? SOFT : 'white' }}>{n}</div>
        <div style={{ width: sz, height: sz, borderRadius: 30, margin: '0 auto', background: reached ? COL[s] : '#3B5675', border: `${hot ? 3 : 4}px solid white`,
          boxShadow: on ? `0 0 30px ${COL[s]}` : 'none' }} />
        {reached && s === 'done' && !hot && <div style={{ marginTop: 30, display: 'inline-block', transform: `rotate(-8deg) scale(${j < r ? 1 : bounce(f, 26)})`,
          border: `3px solid ${GREEN}`, color: GREEN, fontWeight: 900, fontSize: 15, padding: '1px 8px', borderRadius: 6 }}>DELIVERED</div>}
        {reached && s === 'hold' && <div style={{ marginTop: 26, display: 'flex', justifyContent: 'center' }}><Pause s={26} /></div>}
      </div>; })}
    <div style={{ position: 'absolute', left: x - 24, top: roadY(x) - 24, width: 48, height: 48, borderRadius: 24, background: 'white',
      boxShadow: `0 0 0 8px ${TEAL}66, 0 0 30px ${TEAL}`, display: 'grid', placeItems: 'center' }}><div style={{ width: 20, height: 20, borderRadius: 10, background: TEAL }} /></div>
  </>;
};

/* ---------- one animation per release ---------- */
const box = { position: 'relative', width: 980, height: 520 };
const STAGE = {
  0: ({ f, at }) => { const cg = at('cloud governance'), wf = at('declaration workflow');
    return <div style={box}>
      <In k={pop(f, cg)} style={{ position: 'absolute', left: 20, top: 30 }}><div style={{ padding: '14px 22px', borderRadius: 14, background: ADB, fontSize: 28, fontWeight: 900 }}>Cloud Governance</div></In>
      {[0, 1, 2].map(i => { const k = bounce(f, cg + 12 + i * 8);
        return <div key={i} style={{ position: 'absolute', left: 30 + i * 140, top: 140, opacity: f > cg + 12 + i * 8 ? 1 : 0, transform: `translateY(${(1 - k) * -200}px)` }}>
          <Site s={120} /><div style={{ fontSize: 20, textAlign: 'center', fontWeight: 700 }}>{['Site', 'Library', 'Library'][i]}</div></div>; })}
      <div style={{ position: 'absolute', left: 520, top: 120, display: 'flex', alignItems: 'center', gap: 26, opacity: ease(f, wf, 10) }}>
        <Doc s={110} c={BLUE} /><div style={{ fontSize: 60, color: TEAL }}>→</div><div style={{ transform: `scale(${bounce(f, wf + 20)})` }}><Doc s={130} c={GREEN} lock /></div></div>
      <In k={pop(f, at('official record'))} style={{ position: 'absolute', left: 560, top: 330 }}><div style={{ fontSize: 34, fontWeight: 900, color: GREEN }}>Document → official record</div></In>
    </div>; },
  1: ({ f, at }) => { const ch = at('changed');
    return <div style={box}>
      <div style={{ position: 'absolute', left: 60, top: 40, width: 560, padding: 26, borderRadius: 16, background: 'white', color: INK, boxShadow: '0 20px 40px rgba(0,0,0,.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 26, fontWeight: 900, color: f > ch + 20 ? TEAL : RED }}>
          <div style={{ width: 34, height: 34, borderRadius: 17, background: f > ch + 20 ? TEAL : RED, color: 'white', display: 'grid', placeItems: 'center' }}>!</div>Message</div>
        <div style={{ height: 18, borderRadius: 9, background: '#C9D6E3', margin: '22px 0 12px', width: f > ch + 20 ? '92%' : '70%' }} />
        <div style={{ height: 18, borderRadius: 9, background: '#C9D6E3', width: f > ch + 20 ? '60%' : '85%' }} /></div>
      <div style={{ position: 'absolute', left: 560, top: 10, opacity: f > ch && f < ch + 30 ? 1 : 0 }}><Wrench s={100} f={f} /></div>
      <In k={pop(f, ch + 20)} style={{ position: 'absolute', left: 90, top: 300 }}><Badge k={1} c={AMBER} icon={<Wrench s={34} />}>Hotfix 1.1.1, two weeks after go live</Badge></In>
      <In k={pop(f, at('responds'))} style={{ position: 'absolute', left: 90, top: 390 }}><div style={{ fontSize: 30, color: SOFT, fontWeight: 700 }}>Small fixes ship fast after go live</div></In>
    </div>; },
  2: ({ f, at }) => { const off = at('disabled'), lib = at('based on the library');
    return <div style={box}>
      {[['IMG', BLUE, 'images'], ['MP4', RED, 'videos'], ['MP3', PAPER, 'audio']].map(([e, c, p], j) => { const s = at(p);
        return <div key={e} style={{ position: 'absolute', left: 20 + j * 140, top: 40, opacity: ease(f, s - 4, 8), transform: `translateY(${(1 - bounce(f, s - 4)) * 150}px)` }}>
          <FileIcon ext={e} c={c} s={100} />{f > at('as records') + j * 6 && <div style={{ position: 'absolute', right: -14, bottom: 4, transform: `scale(${bounce(f, at('as records') + j * 6)})` }}><Lock /></div>}</div>; })}
      <In k={pop(f, at('native'))} style={{ position: 'absolute', left: 520, top: 30 }}><div style={{ width: 400, padding: 22, borderRadius: 16, background: 'rgba(255,255,255,.08)', fontSize: 26, fontWeight: 700 }}>
        SharePoint's native retention label
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 14 }}><div style={{ width: 110, height: 52, borderRadius: 26, background: f > off ? '#5A6B80' : GREEN, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 6, left: f > off ? 6 : 64, width: 40, height: 40, borderRadius: 20, background: 'white' }} /></div>
          <div style={{ fontSize: 34, fontWeight: 900, color: f > off ? SOFT : GREEN }}>{f > off ? 'OFF' : 'ON'}</div></div></div></In>
      <In k={pop(f, lib)} style={{ position: 'absolute', left: 60, top: 300 }}><div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '18px 26px', borderRadius: 16,
        background: 'rgba(62,155,58,.15)', border: `3px solid ${GREEN}`, fontSize: 30, fontWeight: 800 }}>Library <span style={{ color: TEAL, fontSize: 40 }}>→</span> retention label, the EDRMS way</div></In>
      <In k={pop(f, at('wrong one'))} style={{ position: 'absolute', left: 60, top: 420 }}><div style={{ fontSize: 28, color: SOFT, fontWeight: 700 }}>No more picking the wrong label by hand</div></In>
    </div>; },
  3: ({ f, at }) => { const one = at('one by one'), all = at('all at once');
    return <div style={box}>
      <div style={{ position: 'absolute', left: 20, top: 20, width: 560, display: 'flex', flexWrap: 'wrap', gap: 14 }}>
        {Array.from({ length: 10 }, (_, j) => { const locked = (f > one && f < all && j < Math.floor((f - one) / 12)) || f > all + j;
          return <div key={j} style={{ transform: `scale(${f > all + j ? 1 + 0.15 * Math.max(0, 1 - (f - all - j) / 10) : 1})` }}><Doc s={84} c={locked ? GREEN : BLUE} lock={locked} /></div>; })}</div>
      <In k={pop(f, one)} style={{ position: 'absolute', left: 620, top: 40 }}><div style={{ fontSize: 30, color: SOFT, fontWeight: 700, textDecoration: f > all ? 'line-through' : 'none' }}>One by one</div></In>
      <In k={pop(f, all)} style={{ position: 'absolute', left: 620, top: 110 }}><div style={{ fontSize: 70, fontWeight: 900, color: GREEN }}>All at once</div></In>
      <div style={{ position: 'absolute', left: 620, top: 250, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Badge k={pop(f, at('on schedule'))} icon={<Check s={34} />}>On schedule</Badge>
        <Badge k={pop(f, at('hotfix'))} c={AMBER} icon={<Wrench s={34} />}>Hotfix 2026.1.1, 23 Jan</Badge></div>
    </div>; },
  4: ({ f, at }) => { const c = at('central location'), bug = at('critical bug'), mv = at('was moved'), night = at('outside office');
    return <div style={box}>
      <div style={{ position: 'absolute', left: 10, top: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>{[0, 1, 2].map(i => <In key={i} k={pop(f, 4 + i * 5)}><Site s={100} /></In>)}</div>
      {[0, 1, 2].map(j => { const t = interpolate(f, [c + j * 8, c + 26 + j * 8], [0, 1], clamp);
        return <div key={j} style={{ position: 'absolute', left: 130 + t * 230, top: 40 + j * 90 + t * (110 - j * 90), opacity: t > 0 && t < 1 ? 1 : 0 }}><Doc s={48} c={GREEN} /></div>; })}
      <In k={pop(f, c)} style={{ position: 'absolute', left: 380, top: 60 }}><div style={{ textAlign: 'center' }}><DB s={140} /><div style={{ fontSize: 26, fontWeight: 800 }}>Central location</div></div></In>
      <div style={{ position: 'absolute', left: 600, top: 10, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <In k={pop(f, at('bumpy'))}><div style={{ fontSize: 34, fontWeight: 900, color: AMBER }}>A bumpy ride</div></In>
        <Badge k={pop(f, bug)} c={RED} icon={f > bug + 30 ? <Check s={34} /> : <Bug s={34} />}>Critical bug fixed</Badge>
        <Badge k={pop(f, mv)} c={AMBER} icon={<Cal s={34} />}>UAT moved at RAC's request</Badge>
        <Badge k={pop(f, night)} c={TEAL} icon={<Moon s={30} />}>Live 27 Mar, outside office hours</Badge></div>
    </div>; },
  5: ({ f, at }) => { const o = interpolate(f, [at('declare an email'), at('declare an email') + 25], [0, 1], clamp), fix = at('add in button');
    return <div style={box}>
      <div style={{ position: 'absolute', left: 20, top: 20, width: 300, padding: 16, borderRadius: 14, background: '#0F6CBD', fontSize: 24, fontWeight: 800 }}>Outlook
        <div style={{ marginTop: 10, position: 'relative', height: 160 }}><Mail s={150} />
          <div style={{ position: 'absolute', left: 50, top: 20 - o * 110, opacity: o }}><Doc s={70} c={GREEN} lock={o > 0.9} /></div></div></div>
      <div style={{ position: 'absolute', left: 340, top: 90, fontSize: 60, color: TEAL, opacity: ease(f, at('saved in'), 8) }}>→</div>
      <In k={pop(f, at('saved in'))} style={{ position: 'absolute', left: 420, top: 50 }}><div style={{ textAlign: 'center' }}><Site s={130} /><div style={{ fontSize: 22, fontWeight: 800 }}>EDRMS site you choose</div></div></In>
      <div style={{ position: 'absolute', left: 620, top: 10, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Badge k={pop(f, at('planned for april'))} c={SOFT} icon={<Cal s={34} />}>Planned: April</Badge>
        <Badge k={pop(f, fix)} c={AMBER} icon={<Wrench s={34} f={f} />}>Add-in button fixed first</Badge>
        <Badge k={pop(f, at('reset'))} c={BLUE} icon={<Check s={34} c={BLUE} />}>Testing reset</Badge>
        <Badge k={pop(f, at('eighteenth'))} icon={<Check s={34} />}>Live 18 Jun 2026, alpha</Badge></div>
    </div>; },
  6: ({ f }) => <div style={box}>
    <div style={{ position: 'absolute', left: 120, top: 40, display: 'flex', alignItems: 'center', gap: 40 }}>
      <div style={{ position: 'relative' }}><Mail s={200} /><div style={{ position: 'absolute', right: -40, top: -40 }}><Gear f={f} s={110} /></div></div>
      <div><div style={{ fontSize: 60, fontWeight: 900 }}>2026.3.1</div><div style={{ fontSize: 34, color: TEAL, fontWeight: 800 }}>Email enhancement</div>
        <div style={{ marginTop: 20, width: 380, height: 20, borderRadius: 10, background: 'rgba(255,255,255,.12)', overflow: 'hidden' }}>
          <div style={{ width: '40%', height: '100%', borderRadius: 10, background: TEAL, transform: `translateX(${((f * 6) % 600) - 160}px)` }} /></div>
        <div style={{ fontSize: 28, fontWeight: 800, marginTop: 12 }}>In progress</div></div></div></div>,
  7: ({ f, at }) => { const g = ease(f, at('for the first time'), 40);
    return <div style={box}>
      <div style={{ position: 'absolute', left: 10, top: 20, width: 560, height: 300, borderRadius: 18, background: 'white', padding: 20, display: 'flex', gap: 18, opacity: ease(f, 4, 10) }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{['Sites', 'Documents', 'Records'].map((t, j) => <div key={t} style={{ width: 150, padding: 12, borderRadius: 12, background: '#EAF3FB', color: INK }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{t}</div><div style={{ height: 12, marginTop: 8, borderRadius: 6, background: BLUE, width: `${(40 + j * 25) * g}%` }} /></div>)}</div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 12, borderBottom: '3px solid #C9D6E3' }}>
          {[0.5, 0.8, 0.35, 0.95, 0.6, 0.75].map((h, j) => <div key={j} style={{ flex: 1, height: `${h * 100 * ease(f, at('departments') + j * 4, 20)}%`, background: j === 3 ? TEAL : BLUE, borderRadius: '6px 6px 0 0' }} />)}</div></div>
      <div style={{ position: 'absolute', left: 620, top: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 40, fontWeight: 900, color: TEAL, opacity: 0.6 + 0.4 * Math.sin(f / 5) }}>● NOW</div>
        <Badge k={pop(f, at('requirements have been gathered'))} icon={<Check s={34} />}>Requirements gathered</Badge>
        <Badge k={pop(f, at('development is under way'))} c={TEAL} icon={<Gear f={f} s={34} />}>Development under way</Badge></div>
    </div>; },
  8: ({ f, at }) => <div style={box}>
    <div style={{ position: 'absolute', left: 30, top: 20, width: 360, height: 300, borderRadius: 16, background: '#8B6A3E', boxShadow: '0 20px 40px rgba(0,0,0,.4)', opacity: ease(f, 4, 10) }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 60, background: '#A9824D', borderRadius: '16px 16px 0 0' }} />
      {[0, 1, 2].map(i => <div key={i} style={{ position: 'absolute', left: 60 + i * 80, top: 90 - i * 10, transform: `rotate(${(i - 1) * 8}deg)` }}><Doc s={90} c={PAPER} paper /></div>)}
      <div style={{ position: 'absolute', left: 120, top: 230, fontSize: 26, fontWeight: 900 }}>Paper records</div></div>
    <div style={{ position: 'absolute', left: 300, top: 130, opacity: ease(f, at('on hold'), 6), transform: `scale(${bounce(f, at('on hold'))})` }}>
      <div style={{ width: 150, height: 150, borderRadius: 75, background: 'rgba(201,166,107,.25)', border: `6px solid ${PAPER}`, display: 'grid', placeItems: 'center' }}><Pause s={70} /></div></div>
    <div style={{ position: 'absolute', left: 520, top: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Badge k={pop(f, at('on hold'))} c={PAPER} icon={<Pause s={30} />}>On hold, at ADB's request</Badge>
      <Badge k={pop(f, at('discovery workshop'))} c={TEAL} icon={<User s={34} c={TEAL} />}>Discovery workshop next</Badge>
      <In k={pop(f, at('requirements are final'))}><div style={{ fontSize: 26, color: SOFT, fontWeight: 700, width: 420 }}>once the Utilization Report requirements are final</div></In></div>
  </div>,
};

const RelScene = ({ b, f, at, prev }) => {
  const [n, d, t, s] = R[b.r], S = STAGE[b.r], k = pop(f, 10);
  return <Back>
    <Road r={b.r} f={f} travelFrom={prev} />
    <div style={{ position: 'absolute', left: 70, top: 420, width: 640, padding: '30px 34px', borderRadius: 22, background: 'rgba(255,255,255,.07)', borderLeft: `12px solid ${COL[s]}`,
      opacity: k, transform: `translateX(${(1 - k) * -80}px)` }}>
      <div style={{ fontSize: 24, color: COL[s], fontWeight: 900, letterSpacing: 1 }}>{LABEL[s]} · {d}</div>
      <div style={{ fontSize: 64, fontWeight: 900, margin: '6px 0 10px' }}>{R[b.r][4] ? 'Hotfix ' : 'Release '}{n}</div>
      <div style={{ fontSize: 32, color: '#DCE6F0', lineHeight: 1.3 }}>{t}</div></div>
    <div style={{ position: 'absolute', left: 780, top: 400 }}><S f={f} at={at} /></div>
  </Back>;
};

/* ---------- full screen scenes ---------- */
const Hook = ({ f, at }) => {
  const day = at('april 2025'), today = at('today'), how = at('how did we get'), wel = at('welcome');
  const caps = [['Records', GREEN, 'first record'], ['Multimedia', RED, 'multimedia'], ['Many at once', BLUE, 'many documents'], ['Central', ADB, 'central records'], ['Outlook email', '#0F6CBD', 'emails']];
  return <Back>
    {f < wel && <>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center' }}>
        <div style={{ display: 'inline-block', padding: '12px 30px', borderRadius: 14, background: 'white', color: INK, fontSize: 56, fontWeight: 900, transform: `rotate(-3deg) scale(${3 - 2 * bounce(f, day)})`, opacity: ease(f, day, 6) }}>
          30 April 2025</div></div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', justifyContent: 'center', gap: 30 }}>
        {caps.map(([t, c, p], i) => { const s = i === 0 ? at(p) : Math.max(today, at(p)) - 6, k = bounce(f, s);
          return <div key={t} style={{ width: 280, height: 260, borderRadius: 22, background: c, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14,
            opacity: f > s ? 1 : 0, transform: `scale(${k}) rotate(${(1 - k) * 30}deg)`, boxShadow: '0 20px 40px rgba(0,0,0,.4)' }}>
            {i === 4 ? <Mail s={110} c="white" /> : <Doc s={100} c="white" lock={i === 0} />}<div style={{ fontSize: 32, fontWeight: 900 }}>{t}</div></div>; })}</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 660, textAlign: 'center', fontSize: 80, fontWeight: 900, color: TEAL, transform: `scale(${bounce(f, how)})`, opacity: f > how ? 1 : 0 }}>
        How did we get here?</div></>}
    {f >= wel && <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ fontSize: 44, color: TEAL, fontWeight: 800, opacity: ease(f, wel, 10) }}>EDRMS Knowledge Transfer</div>
      <div style={{ fontSize: 110, fontWeight: 900, transform: `scale(${3 - 2 * bounce(f, wel + 4)})`, opacity: ease(f, wel + 4, 6) }}>Part 2</div>
      <div style={{ fontSize: 66, fontWeight: 800, opacity: ease(f, wel + 14, 10) }}>The release journey</div></AbsoluteFill>}
  </Back>;
};

const WhatIs = ({ f, at }) => {
  const pkg = at('one package'), steps = [['Built', TEAL, 'built'], ['Tested by ADB', AMBER, 'tested'], ['Live', GREEN, 'goes live']];
  const yr = at('from 2026'), hf = at('hotfix'), num = f > yr ? '2026.1' : f > at('one point two') ? '1.2' : '1.1';
  return <Back>
    <div style={{ position: 'absolute', top: 60, width: '100%' }}><Title k={pop(f, 0)} size={70}>What is a release?</Title></div>
    <div style={{ position: 'absolute', left: 130, top: 220, transform: `scale(${bounce(f, pkg)})`, opacity: f > pkg ? 1 : 0 }}>
      <svg width="260" height="240" viewBox="0 0 130 120"><path d="M10 35 L65 10 L120 35 V95 L65 118 L10 95 Z" fill="#B88746" /><path d="M10 35 L65 60 L120 35" fill="none" stroke="#8B6A3E" strokeWidth="4" />
        <line x1="65" y1="60" x2="65" y2="118" stroke="#8B6A3E" strokeWidth="4" /></svg>
      <div style={{ textAlign: 'center', fontSize: 28, fontWeight: 800 }}>New capability</div></div>
    <div style={{ position: 'absolute', left: 520, top: 260, display: 'flex', gap: 24, alignItems: 'center' }}>{steps.map(([t, c, p], i) => <React.Fragment key={t}>
      {i > 0 && <div style={{ fontSize: 50, color: SOFT, opacity: ease(f, at(p), 8) }}>→</div>}
      <In k={pop(f, at(p))}><div style={{ padding: '22px 30px', borderRadius: 18, background: c, color: c === AMBER ? INK : 'white', fontSize: 36, fontWeight: 900 }}>{t}</div></In></React.Fragment>)}</div>
    <div style={{ position: 'absolute', left: 520, top: 480, display: 'flex', alignItems: 'center', gap: 30, opacity: ease(f, at('in 2025'), 10) }}>
      <div style={{ fontSize: 30, color: SOFT, fontWeight: 700, width: 220 }}>{f > yr ? 'From 2026' : 'In 2025'}</div>
      <div style={{ padding: '20px 40px', borderRadius: 18, background: 'white', color: INK, fontSize: 80, fontWeight: 900, minWidth: 320, textAlign: 'center',
        transform: `perspective(600px) rotateX(${f > yr ? (1 - ease(f, yr, 14)) * 90 : 0}deg)` }}>{num}</div>
      {f > yr && <In k={pop(f, yr + 10)}><div style={{ fontSize: 30, color: TEAL, fontWeight: 800 }}>numbered by year</div></In>}</div>
    <In k={pop(f, hf)} style={{ position: 'absolute', left: 520, top: 690 }}><div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '18px 26px', borderRadius: 16,
      background: 'rgba(242,169,0,.15)', border: `3px solid ${AMBER}` }}><Wrench s={50} f={f} /><div style={{ fontSize: 34, fontWeight: 900 }}>Hotfix: 2026.1<span style={{ color: AMBER }}>.1</span></div>
      <div style={{ fontSize: 26, color: SOFT, fontWeight: 700 }}>one more number</div></div></In>
  </Back>;
};

const Begin = ({ f }) => <Back><Road r={0} f={f} travelFrom={-0.4} />
  <div style={{ position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', fontSize: 90, fontWeight: 900, transform: `scale(${bounce(f, 6)})` }}>Let's start at the beginning</div></Back>;

const Next = ({ f }) => <Back><Road r={7} f={f + 60} />
  <div style={{ position: 'absolute', left: 0, right: 0, top: 520, textAlign: 'center' }}>
    <div style={{ fontSize: 120, fontWeight: 900, color: TEAL, transform: `scale(${3 - 2 * bounce(f, 4)})`, opacity: ease(f, 4, 6) }}>What comes next?</div></div></Back>;

const ROADMAP = [['Dual retention workflow', 'dual'], ['Retention label mapping', 'retention label mapping'], ['Scope note hover bubbles', 'scope note'], ['Related records concept', 'related records'],
  ['Event triggered records declaration', 'event triggered'], ['Records disposition', 'records disposition'], ['Site renewal and disposition', 'site renewal']];
const Roadmap = ({ f, at }) => {
  const pts = Array.from({ length: 60 }, (_, j) => { const x = 80 + j * 30; return `${x},${640 + 40 * Math.sin(j / 7)}`; }).join(' ');
  return <Back>
    <div style={{ position: 'absolute', top: 60, width: '100%' }}><Title k={pop(f, 0)} size={64}>The roadmap: 7 agreed enhancements</Title></div>
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}><polyline points={pts} fill="none" stroke="#2A4A72" strokeWidth="34" strokeLinecap="round" />
      <polyline points={pts} fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="3" strokeDasharray="16 14" /></svg>
    {ROADMAP.map(([t, p], i) => { const s = at(p), k = bounce(f, s), x = 120 + i * 245, y = 640 + 40 * Math.sin(((x - 80) / 30) / 7);
      return <div key={t} style={{ position: 'absolute', left: x, top: y - 330, width: 220, opacity: f > s ? 1 : 0, transform: `translateY(${(1 - k) * -120}px)` }}>
        <div style={{ padding: '18px 16px', borderRadius: 14, background: i % 2 ? TEAL : BLUE, minHeight: 150, boxShadow: '0 12px 30px rgba(0,0,0,.35)' }}>
          <div style={{ width: 54, height: 54, borderRadius: 27, background: 'white', color: INK, display: 'grid', placeItems: 'center', fontSize: 30, fontWeight: 900 }}>{i + 1}</div>
          <div style={{ fontSize: 25, fontWeight: 800, marginTop: 10, lineHeight: 1.2 }}>{t}</div></div>
        <div style={{ width: 8, height: 170, background: '#9FB6CC', margin: '0 auto' }} /></div>; })}
    <In k={pop(f, at('remember'))} style={{ position: 'absolute', left: 0, right: 0, top: 790 }}><div style={{ textAlign: 'center', fontSize: 34, fontWeight: 800, color: AMBER }}>
      The numbers show the order of work, not release numbers or dates</div></In>
  </Back>;
};

const Lanes = ({ f, at }) => {
  const L = [['MAS integration', 'ADB approval system', 'HIGH PRIORITY', RED, 'integration with', <Check s={44} c={RED} />],
    ['Classification and sensitivity labels', 'depends on the IT security team', 'DEPENDENCY', AMBER, 'classification', <Lock s={44} c={AMBER} />],
    ['Declaration in project sites', 'parked for now', 'PARKED', SOFT, 'project sites', <div style={{ width: 44, height: 44, borderRadius: 8, background: SOFT, color: INK, display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 30 }}>P</div>],
    ['RCHI workstream', 'waiting for direction from RAC', 'ON HOLD', PAPER, 'r c h i', <Pause s={40} />]];
  return <Back>
    <div style={{ position: 'absolute', top: 60, width: '100%' }}><Title k={pop(f, 0)} size={64}>Running alongside</Title></div>
    <div style={{ position: 'absolute', left: 120, right: 120, top: 220, display: 'flex', flexDirection: 'column', gap: 26 }}>
      {L.map(([t, sub, tag, c, p, icon], i) => { const s = at(p), k = ease(f, s, 14);
        return <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 26, padding: '22px 30px', borderRadius: 20, background: 'rgba(255,255,255,.07)', borderLeft: `12px solid ${c}`,
          opacity: k, transform: `translateX(${(1 - k) * 600}px)` }}>{icon}
          <div style={{ flex: 1 }}><div style={{ fontSize: 40, fontWeight: 900 }}>{t}</div><div style={{ fontSize: 28, color: SOFT, fontWeight: 600 }}>{sub}</div></div>
          <div style={{ padding: '10px 20px', borderRadius: 12, background: c, color: INK, fontSize: 26, fontWeight: 900, transform: `scale(${bounce(f, s + 10)})` }}>{tag}</div></div>; })}</div>
  </Back>;
};

const Outro = ({ f, at }) => {
  const n5 = Math.round(interpolate(f, [at('five'), at('five') + 20], [0, 5], clamp)), n2 = Math.round(interpolate(f, [at('two in progress'), at('two in progress') + 14], [0, 2], clamp));
  return <Back><Road r={8} f={f + 60} />
    <div style={{ position: 'absolute', left: 0, right: 0, top: 480, display: 'flex', justifyContent: 'center', gap: 60 }}>
      {[[n5, 'releases delivered', GREEN, 'five'], [n2, 'in progress', TEAL, 'two in progress']].map(([v, t, c, p]) => <In key={t} k={pop(f, at(p))}>
        <div style={{ width: 380, padding: 30, borderRadius: 24, background: 'rgba(255,255,255,.07)', border: `4px solid ${c}`, textAlign: 'center' }}>
          <div style={{ fontSize: 140, fontWeight: 900, color: c, lineHeight: 1 }}>{v}</div><div style={{ fontSize: 34, fontWeight: 800 }}>{t}</div></div></In>)}
      <In k={pop(f, at('road ahead'))}><div style={{ width: 380, padding: 30, borderRadius: 24, background: 'rgba(255,255,255,.07)', border: `4px solid ${AMBER}`, textAlign: 'center', height: 236,
        display: 'flex', flexDirection: 'column', justifyContent: 'center' }}><div style={{ fontSize: 90, color: AMBER }}>➜</div><div style={{ fontSize: 34, fontWeight: 800 }}>a clear road ahead</div></div></In></div>
  </Back>;
};

/* ---------- timeline, subtitles, audio ---------- */
const Subtitle = ({ text, f, n }) => {
  const parts = text.replace(/E D R M S/g, 'EDRMS').replace(/A D B/g, 'ADB').replace(/R A C/g, 'RAC').replace(/M A S/g, 'MAS').replace(/R C H I/g, 'RCHI')
    .replace(/[Rr]elease(s?) one point one/g, (m, s) => `${m[0]}elease${s} 1.1`).replace(/hotfix one point one point one/g, 'hotfix 1.1.1')
    .replace(/one point two point one/g, '1.2.1').replace(/one point two/g, '1.2').replace(/one point one/g, '1.1')
    .replace(/twenty twenty six point three point one/g, '2026.3.1').replace(/twenty twenty six point one point one/g, '2026.1.1')
    .replace(/twenty twenty six point (\w+)/g, (m, d) => '2026.' + ({ one: 1, two: 2, three: 3, four: 4, five: 5 })[d])
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

export const Part2 = () => {
  const f = useCurrentFrame();
  const i = START.findLastIndex(s => s <= f), b = BEATS[i], lf = f - START[i], n = len(b), p = BEATS[i - 1], nx = BEATS[i + 1];
  const roadish = x => x && ['rel', 'begin', 'next'].includes(x.mg);
  const fade = Math.min(roadish(p) && roadish(b) ? 1 : interpolate(lf, [0, 12], [0, 1], clamp), roadish(b) && roadish(nx) ? 1 : interpolate(lf, [n - 12, n], [1, 0], clamp));
  const at = atFor(i), prevR = p && p.mg === 'rel' ? p.r : p && p.mg === 'next' ? 7 : p && p.mg === 'begin' ? 0 : undefined;
  return (
    <AbsoluteFill style={{ background: INK }}>
      <AbsoluteFill style={{ opacity: fade }}>
        {b.mg === 'hook' && <Hook f={lf} at={at} />}
        {b.mg === 'whatis' && <WhatIs f={lf} at={at} />}
        {b.mg === 'begin' && <Begin f={lf} />}
        {b.mg === 'rel' && <RelScene b={b} f={lf} at={at} prev={prevR} />}
        {b.mg === 'next' && <Next f={lf} />}
        {b.mg === 'roadmap' && <Roadmap f={lf} at={at} />}
        {b.mg === 'lanes' && <Lanes f={lf} at={at} />}
        {b.mg === 'outro' && <Outro f={lf} at={at} />}
        <Subtitle text={b.t} f={lf} n={n} />
      </AbsoluteFill>
      <Audio src={staticFile('music.mp3')} loop volume={fr => 0.07 * interpolate(fr, [TOTAL - 60, TOTAL], [1, 0], clamp)} />
      {BEATS.map((x, j) => <Sequence key={j} from={START[j] + LEAD} durationInFrames={Math.ceil(x.seconds * FPS) + 2}><Audio src={staticFile(`vo/${j}.wav`)} /></Sequence>)}
    </AbsoluteFill>
  );
};
