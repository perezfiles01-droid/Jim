import React from 'react';
/* KT Part 1: Introduction. Full screen motion graphics for the story beats, and
   for the 7 declaration steps the requester's recording (public/scene5.mp4) cut,
   zoomed and annotated on the left, with an animated explainer on the right and a
   step tracker on top. Every beat lasts as long as its voiceover. */
import { AbsoluteFill, Audio, Easing, Freeze, OffthreadVideo, Sequence, interpolate, spring,
  staticFile, useCurrentFrame } from 'remotion';
import BEATS from './beats.gen.json';
import { INK, BLUE, TEAL, ADB, GREEN, SOFT, PAPER, RED, FONT, pop, ease, In,
  Doc, User, Site, DB, Mail, Bank, Cal } from '../../src/MG';

const FPS = 30, W = 1920, H = 1080, LEAD = 10, TAIL = 16;
const len = b => LEAD + Math.ceil(b.seconds * FPS) + TAIL;
const START = BEATS.reduce((a, b, i) => [...a, i ? a[i - 1] + len(BEATS[i - 1]) : 0], []);
export const TOTAL = START.at(-1) + len(BEATS.at(-1));
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };
const AMBER = '#F2A900';

/* ---------- shared pieces ---------- */
const Back = ({ children, big = true }) => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 25% 15%, #1B3A63 0%, ${INK} 65%)`,
    fontFamily: FONT, color: 'white' }}><AbsoluteFill style={{ transform: `scale(${big ? 1.22 : 1})` }}>{children}</AbsoluteFill></AbsoluteFill>
);
const Title = ({ k, children, size = 64, color = 'white' }) => (
  <In k={k}><div style={{ fontSize: size, fontWeight: 700, color, textAlign: 'center' }}>{children}</div></In>
);
const Pill = ({ k, children, c = TEAL, on = true, size = 32 }) => (
  <In k={k}><div style={{ padding: '14px 28px', borderRadius: 40, fontSize: size, fontWeight: 600,
    background: on ? c : 'rgba(255,255,255,.08)', color: on ? 'white' : SOFT,
    border: `2px solid ${on ? c : 'rgba(255,255,255,.18)'}` }}>{children}</div></In>
);
const Row = ({ children, gap = 28, style }) => (
  <div style={{ display: 'flex', gap, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', ...style }}>{children}</div>
);
const Col = ({ children, gap = 40 }) => (
  <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', gap, paddingBottom: 90 }}>{children}</AbsoluteFill>
);
const Lock = ({ s = 60, c = GREEN }) => (
  <svg width={s} height={s} viewBox="-30 -30 60 60"><circle r="28" fill={c} /><rect x="-11" y="-3" width="22" height="16" rx="3" fill="white" />
    <path d="M-7 -3v-6a7 7 0 0 1 14 0v6" stroke="white" strokeWidth="4" fill="none" /></svg>
);
const Tag = ({ text, c = AMBER, dashed }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 18px 8px 14px', borderRadius: '8px 30px 30px 8px',
    background: dashed ? 'transparent' : c, border: `3px ${dashed ? 'dashed' : 'solid'} ${c}`, color: dashed ? c : INK, fontWeight: 800, fontSize: 26 }}>
    <span style={{ width: 12, height: 12, borderRadius: 6, background: dashed ? 'transparent' : INK, border: dashed ? `3px solid ${c}` : 'none' }} />{text}</div>
);
const FileIcon = ({ ext, c, s = 86 }) => (
  <div style={{ position: 'relative', width: s, textAlign: 'center' }}><Doc s={s} c={c} />
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 12, fontSize: s * 0.22, fontWeight: 800, color: c }}>{ext}</div></div>
);
const Spinner = ({ f, s = 70 }) => (
  <svg width={s} height={s} viewBox="0 0 50 50" style={{ transform: `rotate(${f * 12}deg)` }}>
    <circle cx="25" cy="25" r="20" stroke="rgba(255,255,255,.2)" strokeWidth="5" fill="none" />
    <path d="M25 5a20 20 0 0 1 20 20" stroke={TEAL} strokeWidth="5" fill="none" strokeLinecap="round" /></svg>
);
const Gear = ({ f, s = 70, c = TEAL, dir = 1 }) => (
  <svg width={s} height={s} viewBox="-50 -50 100 100" style={{ transform: `rotate(${dir * f * 4}deg)` }}>
    {Array.from({ length: 8 }, (_, i) => <rect key={i} x="-9" y="-48" width="18" height="22" rx="4" fill={c} transform={`rotate(${i * 45})`} />)}
    <circle r="32" fill={c} /><circle r="13" fill={INK} /></svg>
);
const Check = ({ s = 56, c = GREEN }) => (
  <svg width={s} height={s} viewBox="0 0 50 50"><circle cx="25" cy="25" r="24" fill={c} />
    <path d="M14 26l8 8 15-17" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

/* ---------- full screen scenes ---------- */
/* Intro: a hook. Documents pour in, three questions slam onto the screen,
   then everything collapses into the EDRMS answer. */
const rnd = i => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); };
const Slam = ({ f, s, children, c = 'white', size = 120, rot = 0 }) => {
  const k = spring({ frame: f - s, fps: FPS, config: { damping: 9, stiffness: 160 } });
  return <div style={{ fontSize: size, fontWeight: 900, color: c, opacity: f < s ? 0 : Math.min(1, k * 2),
    transform: `scale(${f < s ? 3 : 3 - 2 * k}) rotate(${rot}deg)`, textShadow: '0 10px 40px rgba(0,0,0,.5)' }}>{children}</div>;
};
const Intro = ({ f, at }) => {
  const ans = at('that is what'), wel = at('welcome'), col = ease(f, ans, 14);
  return (
    <Back big={false}>
      {Array.from({ length: 34 }, (_, i) => {
        const t0 = 2 + i * 1.6, k = spring({ frame: f - t0, fps: FPS, config: { damping: 12 } });
        const x = 80 + rnd(i) * 1720, y = 60 + rnd(i + 99) * 860, r = (rnd(i + 7) - 0.5) * 50;
        return <div key={i} style={{ position: 'absolute', left: x + (960 - x) * col, top: y + (480 - y) * col, opacity: f < t0 ? 0 : (1 - col) * 0.9,
          transform: `scale(${k * (1 - col * 0.8)}) rotate(${r * (1 - k * 0.5)}deg)` }}><Doc s={70} c={i % 4 === 0 ? GREEN : BLUE} /></div>;
      })}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: 1 - col }}>
        <div style={{ background: 'rgba(16,36,62,.85)', padding: '20px 50px', borderRadius: 24, textAlign: 'center', opacity: ease(f, 6, 10) }}>
          <div style={{ fontSize: 110, fontWeight: 900, color: TEAL, transform: `scale(${1 + 0.04 * Math.sin(f / 3)})` }}>Thousands</div>
          <div style={{ fontSize: 40, fontWeight: 700 }}>of documents, every day, at ADB</div></div>
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: 1 - col }}>
        <div style={{ position: 'absolute', left: 170, top: 140 }}><Slam f={f} s={at('kept?')} c={AMBER} rot={-8}>Keep?</Slam></div>
        <div style={{ position: 'absolute', right: 150, top: 170 }}><Slam f={f} s={at('how long')} c={TEAL} rot={6}>How long?</Slam></div>
        <div style={{ position: 'absolute', left: 760, bottom: 150 }}><Slam f={f} s={at('and how')} c="white" rot={-4}>How?</Slam></div>
      </AbsoluteFill>
      {f >= ans && <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: 200, border: `8px solid ${TEAL}`,
          transform: `scale(${1 + (f - ans) / 6})`, opacity: Math.max(0, 1 - (f - ans) / 24) }} />
        <Slam f={f} s={ans + 4} size={190} c="white">EDRMS</Slam>
        <div style={{ height: 6, width: 300 * ease(f, ans + 12, 12), background: TEAL, margin: '18px 0' }} />
        <In k={pop(f, wel)}><div style={{ fontSize: 50, fontWeight: 700, color: SOFT, textAlign: 'center' }}>Knowledge Transfer
          <div style={{ fontSize: 76, color: 'white', fontWeight: 900 }}>Part 1: Introduction</div></div></In>
      </AbsoluteFill>}
    </Back>
  );
};

/* ADB: a globe with Manila pinned, then the missions pop up around it. */
const Adb = ({ f, at }) => {
  const m = at('manila'), r = at('resident');
  const pins = [[-170, -60], [150, -110], [210, 60], [-90, 130], [60, 160], [-230, 40], [260, -20]];
  return (
    <Back big={false}><AbsoluteFill style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 90, paddingBottom: 80 }}>
      <div style={{ position: 'relative', width: 560, height: 560, transform: `scale(${pop(f, 0)})` }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: 300, background: `radial-gradient(circle at 35% 30%, #2D6CB0, ${ADB} 70%)`,
          boxShadow: `0 0 80px ${BLUE}88` }} />
        {[0, 1, 2, 3].map(j => <div key={j} style={{ position: 'absolute', left: 280 - 280 * Math.cos(((j + f / 60) % 4) / 4 * Math.PI), top: 0, bottom: 0,
          width: 560 * Math.cos(((j + f / 60) % 4) / 4 * Math.PI) || 1, borderRadius: '50%', border: '2px solid rgba(255,255,255,.18)' }} />)}
        {[0.3, 0.5, 0.7].map(y => <div key={y} style={{ position: 'absolute', left: 0, right: 0, top: `${y * 100}%`, borderTop: '2px solid rgba(255,255,255,.15)' }} />)}
        {pins.map(([x, y], j) => <div key={j} style={{ position: 'absolute', left: 280 + x - 9, top: 280 + y - 9, width: 18, height: 18, borderRadius: 9,
          background: TEAL, boxShadow: `0 0 16px ${TEAL}`, transform: `scale(${pop(f, r + j * 4)})` }} />)}
        {pins.map(([x, y], j) => <svg key={'l' + j} width="560" height="560" style={{ position: 'absolute', inset: 0 }}>
          <line x1="300" y1="250" x2={280 + x} y2={280 + y} stroke={TEAL} strokeWidth="2" strokeDasharray="6 6" opacity={ease(f, r + j * 4, 10) * 0.7} /></svg>)}
        <div style={{ position: 'absolute', left: 300 - 22, top: 250 - 58, transform: `translateY(${(1 - pop(f, m)) * -200}px)`, opacity: f > m ? 1 : 0 }}>
          <svg width="44" height="58" viewBox="0 0 44 58"><path d="M22 56C22 56 2 32 2 20a20 20 0 0 1 40 0c0 12-20 36-20 36z" fill={AMBER} /><circle cx="22" cy="20" r="8" fill="white" /></svg></div>
        <div style={{ position: 'absolute', left: 330, top: 200, fontSize: 30, fontWeight: 800, opacity: ease(f, m + 6, 10) }}>Manila</div>
      </div>
      <div style={{ width: 640 }}>
        <In k={pop(f, 4)}><div style={{ fontSize: 120, fontWeight: 900 }}>ADB</div></In>
        <In k={pop(f, 10)}><div style={{ fontSize: 52, fontWeight: 700, color: SOFT }}>Asian Development Bank</div></In>
        <div style={{ marginTop: 30, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Pill k={pop(f, m)} c={AMBER}>Headquarters in Manila</Pill>
          <Pill k={pop(f, r)}>Resident missions and offices worldwide</Pill></div>
      </div>
    </AbsoluteFill></Back>
  );
};

/* Records: a conveyor of documents; the important ones get stamped RECORD. */
const Records = ({ f, at }) => {
  const st = at('official'), safe = at('kept safe'), time = at('right length'), disp = at('disposed');
  return (
    <Back big={false}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 380, height: 16, background: '#2A4A72' }} />
      {Array.from({ length: 12 }, (_, i) => {
        const x = ((i * 190 + f * 6) % 2280) - 180, rec = i % 3 === 0, stamped = rec && f > st + (i % 4) * 3;
        return <div key={i} style={{ position: 'absolute', left: x, top: 240, transform: `scale(${stamped ? 1.12 : 1})` }}>
          <Doc s={100} c={stamped ? GREEN : BLUE} lock={stamped} />
          {stamped && <div style={{ position: 'absolute', left: -6, top: 30, transform: 'rotate(-14deg)', border: `4px solid ${RED}`, color: RED,
            fontWeight: 900, fontSize: 22, padding: '0 6px', background: 'rgba(255,255,255,.9)', borderRadius: 4 }}>RECORD</div>}</div>;
      })}
      <div style={{ position: 'absolute', top: 90, width: '100%', textAlign: 'center' }}>
        <Title k={pop(f, st)} size={68}>Documents → <span style={{ color: GREEN }}>Official records</span></Title></div>
      <div style={{ position: 'absolute', top: 520, width: '100%' }}><Row gap={40}>
        {[['Kept safe', safe, BLUE, <Lock s={70} c={BLUE} />], ['For the right time', time, TEAL, <Cal s={70} c={TEAL} />],
          ['Disposed when due', disp, PAPER, <svg width="70" height="70" viewBox="0 0 50 50"><rect x="12" y="14" width="26" height="32" rx="3" fill={PAPER} />
            <rect x="8" y="8" width="34" height="5" rx="2" fill={PAPER} /><rect x="20" y="3" width="10" height="5" rx="2" fill={PAPER} /></svg>]].map(([t, s0, c, ic]) =>
          <In key={t} k={pop(f, s0)}><div style={{ width: 360, padding: 26, borderRadius: 20, background: 'rgba(255,255,255,.07)', border: `3px solid ${c}`,
            display: 'flex', alignItems: 'center', gap: 20, fontSize: 34, fontWeight: 800 }}>{ic}{t}</div></In>)}
      </Row></div>
    </Back>
  );
};

/* EDRMS: five letters fly in and unfold into their words, then the stack drops. */
const Edrms = ({ f, at }) => {
  const un = at('electronic'), words = ['Electronic', 'Document', 'and Records', 'Management', 'System'];
  const layer = (t, c, p, w) => { const k = spring({ frame: f - at(p), fps: FPS, config: { damping: 10, stiffness: 140 } });
    return <div key={t} style={{ width: w, padding: '20px 0', borderRadius: 14, background: c, fontSize: 36, fontWeight: 800, textAlign: 'center',
      boxShadow: '0 12px 30px rgba(0,0,0,.35)', opacity: f > at(p) ? 1 : 0, transform: `translateY(${(1 - k) * -300}px)` }}>{t}</div>; };
  return (
    <Back big={false}><Col gap={30}>
      <div style={{ display: 'flex', gap: 22, alignItems: 'flex-end' }}>{'EDRMS'.split('').map((L, i) => {
        const k = spring({ frame: f - i * 4, fps: FPS, config: { damping: 11 } }), u = ease(f, un + i * 6, 12);
        return <div key={i} style={{ textAlign: 'center', transform: `translateY(${(1 - k) * 400}px) rotate(${(1 - k) * (i % 2 ? 40 : -40)}deg)` }}>
          <div style={{ fontSize: 170 - 60 * u, fontWeight: 900, color: i % 2 ? TEAL : 'white', lineHeight: 1 }}>{L}</div>
          <div style={{ fontSize: 30, color: SOFT, fontWeight: 700, opacity: u, maxWidth: 260 * u, overflow: 'hidden', whiteSpace: 'nowrap' }}>{words[i]}</div></div>;
      })}</div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 30 }}>
        {layer('Built by AvePoint', TEAL, 'avepoint', 600)}
        {layer('on SharePoint', BLUE, 'sharepoint', 760)}
        {layer('and Microsoft 365', ADB, 'microsoft', 920)}
      </div>
    </Col></Back>
  );
};

const STEPS = ['Open the EDRMS site', 'Choose library / folder', 'Create or upload', 'Sensitivity label', 'Physical counterpart', 'Submit', 'Check the records'];
const HowTo = ({ f, at }) => (
  <Back><Col gap={40}>
    <Title k={pop(f, 0)} size={78}>Document → Record</Title>
    <In k={pop(f, at('seven'))}><div style={{ fontSize: 40, color: TEAL, fontWeight: 700 }}>in 7 simple steps</div></In>
    <Row gap={16} style={{ maxWidth: 1500 }}>{STEPS.map((s, i) =>
      <In key={s} k={pop(f, at('seven') + 6 + i * 5)}><div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 22px',
        borderRadius: 12, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.18)', fontSize: 28 }}>
        <span style={{ width: 44, height: 44, borderRadius: 22, background: TEAL, display: 'grid', placeItems: 'center',
          fontWeight: 800 }}>{i + 1}</span>{s}</div></In>)}</Row>
  </Col></Back>
);

const Recap = ({ f, at }) => (
  <Back><Col gap={40}>
    <Row gap={14} style={{ maxWidth: 1500 }}>{STEPS.map((s, i) =>
      <In key={s} k={pop(f, 4 + i * 4)}><div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px',
        borderRadius: 12, background: 'rgba(62,155,58,.18)', border: `2px solid ${GREEN}`, fontSize: 26 }}>
        <Check s={34} />{s}</div></In>)}</Row>
    <In k={pop(f, at('official'))}><div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
      <Doc s={130} c={GREEN} lock /><div style={{ fontSize: 64, fontWeight: 800 }}>Official ADB record</div></div></In>
  </Col></Back>
);

const Series = ({ f, at }) => {
  const add = at('adds'), test = at('tested'), live = at('goes live');
  return (
    <Back><Col gap={60}>
      <Title k={pop(f, 0)} size={72}>Delivered as a series of releases</Title>
      <Row gap={30}>{[0, 1, 2, 3, 4].map(i => {
        const k = pop(f, add + i * 6);
        return <In key={i} k={k}><div style={{ width: 220, height: 200, borderRadius: 18, background: 'rgba(255,255,255,.07)',
          border: `2px solid ${f > live + i * 8 ? GREEN : 'rgba(255,255,255,.2)'}`, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 14, fontSize: 28 }}>
          <div style={{ fontWeight: 700 }}>Release {i + 1}</div>
          <div style={{ color: f > test + i * 8 ? TEAL : 'transparent' }}>✔ Tested by ADB</div>
          <div style={{ color: f > live + i * 8 ? GREEN : 'transparent', fontWeight: 700 }}>● Live</div>
        </div></In>;
      })}</Row>
      <In k={pop(f, at('step by step'))}><div style={{ fontSize: 40, color: SOFT }}>Value step by step, not one big launch</div></In>
    </Col></Back>
  );
};

/* Groups: each has a living icon, and arrows show who hands what to whom. */
const Clipboard = ({ f }) => (
  <svg width="120" height="140" viewBox="0 0 100 120"><rect x="6" y="12" width="88" height="104" rx="10" fill="white" />
    <rect x="32" y="4" width="36" height="18" rx="5" fill={ADB} />
    {[0, 1, 2].map(i => { const k = interpolate(f, [20 + i * 18, 32 + i * 18], [0, 1], clamp);
      return <g key={i}><rect x="40" y={40 + i * 26} width="44" height="8" rx="4" fill={ADB} opacity=".35" />
        <path d={`M16 ${44 + i * 26}l6 6 10-12`} stroke={GREEN} strokeWidth="5" fill="none" strokeLinecap="round"
          strokeDasharray="30" strokeDashoffset={30 * (1 - k)} /></g>; })}</svg>
);
const Magnifier = ({ f }) => {
  const x = 50 + Math.sin(f / 12) * 22, y = 58 + Math.cos(f / 15) * 14;
  return <svg width="140" height="140" viewBox="0 0 120 120"><rect x="14" y="16" width="92" height="88" rx="10" fill="white" />
    {[34, 52, 70, 88].map(yy => <rect key={yy} x="26" y={yy} width="68" height="7" rx="3" fill={BLUE} opacity=".3" />)}
    <g transform={`translate(${x} ${y})`}><circle r="20" fill="rgba(0,165,168,.25)" stroke={TEAL} strokeWidth="6" />
      <rect x="14" y="14" width="10" height="26" rx="4" fill={TEAL} transform="rotate(-45 14 14)" /></g></svg>;
};
const GROUPS = [
  ['RAC', 'Records team at ADB', 'Owns the requirements and confirms each release', ADB, f => <Clipboard f={f} />],
  ['ITD', 'IT department at ADB', 'Supports the rollout. TCS QA tests every release', BLUE, f => <Magnifier f={f} />],
  ['AvePoint', 'Delivery team', 'BAs write requirements, developers build, QA tests first', TEAL,
    f => <div style={{ display: 'flex', alignItems: 'center' }}><Gear f={f} s={90} c="white" /><div style={{ marginLeft: -14, marginTop: 50 }}><Gear f={f} s={64} c="#BFE9EA" dir={-1.4} /></div></div>],
];
const Groups = ({ f, idx, first }) => (
  <Back><Col gap={46}>
    <Title k={first ? pop(f, 0) : 1} size={72}>Three groups behind the project</Title>
    <Row gap={20}>{GROUPS.map(([n, r, d, c, icon], i) => {
      const shown = i <= idx, on = i === idx, k = i < idx ? 1 : i === idx ? pop(f, 6) : 0;
      return <React.Fragment key={n}>
        {i > 0 && <div style={{ fontSize: 26, color: SOFT, textAlign: 'center', width: 90, opacity: i <= idx ? 1 : 0 }}>
          <div style={{ fontSize: 50, color: TEAL }}>{i === 1 ? '⇄' : '⇄'}</div>{i === 1 ? 'confirm' : 'test'}</div>}
        <In k={shown ? k : 0}><div style={{ width: 440, minHeight: 470, padding: 30, borderRadius: 22,
          background: on ? c : 'rgba(255,255,255,.07)', border: `2px solid ${c}`, opacity: on ? 1 : 0.55,
          transform: `scale(${on ? 1.04 : 1})`, boxShadow: on ? '0 20px 50px rgba(0,0,0,.4)' : 'none', textAlign: 'center' }}>
          <div style={{ height: 150, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{icon(on ? f : 0)}</div>
          <div style={{ fontSize: 60, fontWeight: 800 }}>{n}</div>
          <div style={{ fontSize: 28, fontWeight: 600, margin: '8px 0 14px' }}>{r}</div>
          <div style={{ fontSize: 25, lineHeight: 1.35, color: on ? 'white' : SOFT }}>{d}</div>
        </div></In>
      </React.Fragment>;
    })}</Row>
  </Col></Back>
);

/* ---------- release journey ---------- */
const RELS = [
  ['1.1', 'Apr 2025', 'Site and library creation, records declaration, Cloud Governance setup', 'done'],
  ['1.2.1', 'Nov 2025', 'Multimedia records declaration. Native retention label option disabled', 'done'],
  ['2026.1', 'Jan 2026', 'Multiple records declaration: many documents at once', 'done'],
  ['2026.2', 'Mar 2026', 'Centralized records declaration: records kept in one central place', 'done'],
  ['2026.3', 'Jun 2026', 'Email records declaration from Outlook. 2026.3.1 in progress', 'done'],
  ['2026.4', 'Dec 2026', 'EDRMS Utilization Report: how departments use EDRMS', 'now'],
  ['Next', 'Roadmap', 'Physical records on hold, then retention label mapping, disposition, site renewal', 'next'],
];
const col = s => s === 'done' ? GREEN : s === 'now' ? TEAL : PAPER;
const RX0 = 150, RX1 = 1770, roadY = x => 250 + 55 * Math.sin((x - RX0) / 260);
const mx = i => RX0 + (i / (RELS.length - 1)) * (RX1 - RX0);

const Stage = ({ i, f, at }) => {
  const k = j => pop(f, 14 + j * 7);
  const box = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 34, height: 300 };
  if (i === 0) return <div style={box}>
    {[0, 1, 2].map(j => <div key={j} style={{ width: 120, height: 90, borderRadius: 10, background: [BLUE, TEAL, ADB][j],
      transform: `translateY(${(1 - k(j)) * -260}px)`, opacity: k(j), display: 'grid', placeItems: 'center', fontSize: 22, fontWeight: 700 }}>
      {['Site', 'Library', 'Governance'][j]}</div>)}
    <div style={{ fontSize: 60, color: SOFT, opacity: k(3) }}>→</div>
    <In k={k(4)}><Doc s={110} c={GREEN} lock={f > 60} /></In></div>;
  if (i === 1) return <div style={box}>
    {[['IMG', BLUE], ['MP4', RED], ['MP3', PAPER]].map(([e, c], j) => <div key={e} style={{ position: 'relative',
      transform: `translateX(${(1 - k(j)) * 400}px)`, opacity: k(j) }}><FileIcon ext={e} c={c} s={96} />
      {f > 50 + j * 8 && <div style={{ position: 'absolute', right: -16, bottom: 6 }}><Lock s={46} /></div>}</div>)}
    <In k={k(4)}><div style={{ marginLeft: 40, padding: '16px 22px', borderRadius: 14, background: 'rgba(255,255,255,.08)', fontSize: 24 }}>
      Native retention label<div style={{ marginTop: 10, width: 110, height: 50, borderRadius: 25, background: f > at('disabled') ? '#5A6B80' : GREEN,
        position: 'relative' }}><div style={{ position: 'absolute', top: 5, left: f > at('disabled') ? 5 : 65, width: 40, height: 40, borderRadius: 20,
        background: 'white', transition: 'none' }} /></div><div style={{ marginTop: 6, fontWeight: 800 }}>{f > at('disabled') ? 'OFF' : 'ON'}</div></div></In></div>;
  if (i === 2) { const lockAt = at('many documents');
    return <div style={box}><div style={{ position: 'relative', width: 420, height: 230 }}>
      {Array.from({ length: 8 }, (_, j) => <div key={j} style={{ position: 'absolute', left: (j % 4) * 100, top: Math.floor(j / 4) * 115,
        opacity: k(j * 0.4) }}><Doc s={80} c={f > lockAt ? GREEN : BLUE} lock={f > lockAt + j} /></div>)}</div>
      <In k={pop(f, lockAt)}><div style={{ fontSize: 80, fontWeight: 900, color: GREEN }}>×8<div style={{ fontSize: 28 }}>at once</div></div></In></div>; }
  if (i === 3) return <div style={box}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{[0, 1, 2].map(j => <In key={j} k={k(j)}><Site s={110} /></In>)}</div>
    <div style={{ position: 'relative', width: 380, height: 260 }}>
      {[0, 1, 2].map(j => { const t = interpolate(f, [40 + j * 14, 70 + j * 14], [0, 1], clamp);
        return <div key={j} style={{ position: 'absolute', left: t * 300, top: 20 + j * 80 + t * (110 - (20 + j * 80)), opacity: t < 1 ? 1 : 0 }}>
          <Doc s={50} c={GREEN} /></div>; })}</div>
    <In k={k(3)}><div style={{ textAlign: 'center' }}><DB s={150} /><div style={{ fontSize: 30, fontWeight: 800, marginTop: 8 }}>Central location</div></div></In></div>;
  if (i === 4) { const o = interpolate(f, [30, 55], [0, 1], clamp);
    return <div style={box}><In k={k(0)}><div style={{ position: 'relative' }}><Mail s={190} />
      <div style={{ position: 'absolute', left: 52, top: -o * 120, opacity: o }}><Doc s={80} c={GREEN} lock={f > 70} /></div></div></In>
      <div style={{ fontSize: 60, color: SOFT, opacity: k(2) }}>→</div>
      <In k={k(3)}><div style={{ fontSize: 34, fontWeight: 800 }}>Email record</div></In>
      <In k={pop(f, at('enhancement'))}><div style={{ display: 'flex', alignItems: 'center', gap: 14, marginLeft: 30 }}>
        <Gear f={f} s={80} /><div style={{ fontSize: 28 }}>2026.3.1<br /><span style={{ color: TEAL, fontWeight: 800 }}>in progress</span></div></div></In></div>; }
  if (i === 5) { const g = ease(f, 20, 40);
    return <div style={box}><In k={k(0)}><div style={{ width: 640, height: 280, borderRadius: 18, background: 'white', padding: 22, display: 'flex', gap: 22 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{['Sites', 'Documents', 'Records'].map((t, j) =>
        <div key={t} style={{ width: 170, padding: 12, borderRadius: 12, background: '#EAF3FB', color: INK }}>
          <div style={{ fontSize: 20 }}>{t}</div><div style={{ height: 12, marginTop: 8, borderRadius: 6, background: BLUE, width: `${(40 + j * 25) * g}%` }} /></div>)}</div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 14, borderBottom: '3px solid #C9D6E3' }}>
        {[0.5, 0.8, 0.35, 0.95, 0.6, 0.75].map((h, j) => <div key={j} style={{ flex: 1, height: `${h * 100 * ease(f, 24 + j * 5, 25)}%`,
          background: j === 3 ? TEAL : BLUE, borderRadius: '6px 6px 0 0' }} />)}</div></div></In>
      <In k={pop(f, at('december'))}><div style={{ textAlign: 'center' }}><div style={{ fontSize: 34, fontWeight: 900, color: TEAL,
        opacity: 0.6 + 0.4 * Math.sin(f / 5) }}>● NOW</div><div style={{ fontSize: 28, marginTop: 10 }}>Go-live<br /><b>Dec 2026</b></div></div></In></div>; }
  return <div style={{ ...box, gap: 26 }}>
    {[['Physical records', 'ON HOLD', 'physical'], ['Retention label mapping', 'Roadmap', 'retention'], ['Records disposition', 'Roadmap', 'disposition'],
      ['Site renewal', 'Roadmap', 'renewal']].map(([t, s, p], j) => <In key={t} k={pop(f, at(p))}>
      <div style={{ width: 270, padding: '22px 20px', borderRadius: 16, background: j ? 'rgba(255,255,255,.08)' : 'rgba(201,166,107,.18)',
        border: `3px solid ${j ? 'rgba(255,255,255,.25)' : PAPER}`, textAlign: 'center' }}>
        {j === 0 && <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 12 }}>
          <div style={{ width: 16, height: 46, background: PAPER, borderRadius: 4 }} /><div style={{ width: 16, height: 46, background: PAPER, borderRadius: 4 }} /></div>}
        <div style={{ fontSize: 28, fontWeight: 800 }}>{t}</div><div style={{ fontSize: 22, color: j ? SOFT : PAPER, marginTop: 8, fontWeight: 700 }}>{s}</div></div></In>)}</div>;
};

const Rel = ({ f, idx, first, at }) => {
  const travel = ease(f, 0, 30), mxNow = idx === 0 ? mx(0) * travel + (RX0 - 80) * (1 - travel) : mx(idx - 1) + (mx(idx) - mx(idx - 1)) * travel;
  const flip = idx === 2 ? interpolate(f, [0, 20, 45, 60], [0, 1, 1, 0], clamp) : 0;
  const [n, d, t, s] = RELS[idx], ck = pop(f, 8);
  const pts = Array.from({ length: 60 }, (_, j) => { const x = RX0 + (j / 59) * (RX1 - RX0); return `${x},${roadY(x)}`; }).join(' ');
  return (
    <Back big={false}>
      <div style={{ position: 'absolute', top: 40, width: '100%', textAlign: 'center' }}>
        <Title k={first ? pop(f, 0) : 1} size={56}>The release journey</Title></div>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <polyline points={pts} fill="none" stroke="#2A4A72" strokeWidth="34" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={pts} fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="3" strokeDasharray="18 16" />
      </svg>
      {RELS.map(([rn, rd, , rs], j) => {
        const x = mx(j), y = roadY(x), passed = j < idx || (j === idx && travel > 0.95), on = j === idx;
        return <div key={rn} style={{ position: 'absolute', left: x - 90, top: y - 104, width: 180, textAlign: 'center', opacity: j <= idx ? 1 : 0.3 }}>
          <div style={{ fontSize: 22, color: SOFT }}>{rd}</div>
          <div style={{ fontSize: on ? 36 : 28, fontWeight: 800, marginBottom: 6 }}>{rn}</div>
          <div style={{ width: on ? 40 : 28, height: on ? 40 : 28, borderRadius: 30, margin: '0 auto', background: passed ? col(rs) : '#3B5675',
            border: '4px solid white', boxShadow: on ? `0 0 30px ${col(rs)}` : 'none' }} />
          {passed && rs === 'done' && <div style={{ marginTop: 36, display: 'inline-block', transform: `rotate(-8deg) scale(${j < idx ? 1 : pop(f, 24)})`,
            border: `3px solid ${GREEN}`, color: GREEN, fontWeight: 900, fontSize: 18, padding: '2px 10px', borderRadius: 6 }}>DELIVERED</div>}
        </div>;
      })}
      <div style={{ position: 'absolute', left: mxNow - 26, top: roadY(mxNow) - 26, width: 52, height: 52, borderRadius: 26, background: 'white',
        boxShadow: `0 0 0 8px ${TEAL}66, 0 0 30px ${TEAL}`, display: 'grid', placeItems: 'center' }}>
        <div style={{ width: 22, height: 22, borderRadius: 11, background: TEAL }} /></div>
      {flip > 0 && <div style={{ position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center', opacity: flip,
        transform: `perspective(800px) rotateX(${(1 - flip) * 90}deg)` }}>
        <div style={{ display: 'inline-block', padding: '24px 50px', borderRadius: 20, background: TEAL, fontSize: 64, fontWeight: 900 }}>
          2025 → 2026 <span style={{ fontSize: 34, fontWeight: 600 }}>numbered by year</span></div></div>}
      <div style={{ position: 'absolute', left: 120, right: 120, top: 430, opacity: ck * (1 - flip), transform: `translateY(${(1 - ck) * 40}px)`,
        display: 'flex', gap: 40, alignItems: 'center' }}>
        <div style={{ width: 560, padding: '30px 36px', borderRadius: 22, background: 'rgba(255,255,255,.07)', borderLeft: `10px solid ${col(s)}` }}>
          <div style={{ fontSize: 24, color: col(s), fontWeight: 800 }}>{s === 'done' ? 'DELIVERED' : s === 'now' ? 'CURRENT RELEASE' : 'WHAT COMES NEXT'} · {d}</div>
          <div style={{ fontSize: 50, fontWeight: 800, margin: '6px 0 10px' }}>{n === 'Next' ? 'After 2026.4' : `Release ${n}`}</div>
          <div style={{ fontSize: 30, color: '#DCE6F0', lineHeight: 1.35 }}>{t}</div>
        </div>
        <div style={{ flex: 1 }}><Stage i={idx} f={f} at={at} /></div>
      </div>
    </Back>
  );
};

const Outro = ({ f }) => (
  <Back><Col gap={44}>
    <Title k={pop(f, 0)} size={84}>The big picture</Title>
    <Row>{['ADB and EDRMS', 'Declaring a record', 'RAC, ITD, AvePoint', 'Releases 1.1 to 2026.4'].map((t, i) =>
      <Pill key={t} k={pop(f, 8 + i * 6)}>{t}</Pill>)}</Row>
    <In k={pop(f, 50)}><div style={{ fontSize: 46, color: SOFT, marginTop: 30 }}>Next: Part 2, the releases in detail</div></In>
  </Col></Back>
);

const FULL = { intro: Intro, adb: Adb, records: Records, edrms: Edrms, howto: HowTo, recap: Recap, series: Series, groups: Groups, rel: Rel, outro: Outro };

/* ---------- side explainers for the 7 steps ---------- */
const Card = ({ k, children, style }) => (
  <In k={k}><div style={{ padding: '20px 24px', borderRadius: 18, background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.16)',
    fontSize: 28, ...style }}>{children}</div></In>
);
const SideCol = ({ children }) => <div style={{ display: 'flex', flexDirection: 'column', gap: 22, alignItems: 'stretch' }}>{children}</div>;
const SIDE = {
  site: ({ f, at }) => <SideCol>
    <Card k={pop(f, 6)} style={{ textAlign: 'center' }}><div style={{ position: 'relative', display: 'inline-block' }}><Site s={200} />
      <div style={{ position: 'absolute', left: 30, top: 50, background: 'white', color: ADB, fontWeight: 900, fontSize: 24, padding: '2px 8px', borderRadius: 4,
        border: `2px solid ${AMBER}` }}>EDRMS</div></div><div style={{ marginTop: 10, fontWeight: 700 }}>SharePoint site</div></Card>
    <Card k={pop(f, at('set up'))} style={{ display: 'flex', alignItems: 'center', gap: 16 }}><Check />Set up for records</Card>
    <Card k={pop(f, at('logo'))} style={{ display: 'flex', alignItems: 'center', gap: 16, borderColor: AMBER }}>
      <span style={{ fontSize: 40 }}>⬉</span>Look for the EDRMS logo</Card></SideCol>,
  cabinet: ({ f, at }) => { const dr = ease(f, at('drawer'), 18);
    return <SideCol>
      <Card k={pop(f, at('filing'))} style={{ textAlign: 'center' }}>
        <svg width="240" height="250" viewBox="0 0 240 250"><rect x="30" y="10" width="180" height="230" rx="10" fill="#5B7FA6" />
          {[0, 1, 2].map(j => <g key={j} transform={`translate(${j === 1 ? dr * 60 : 0} 0)`}>
            <rect x="42" y={24 + j * 72} width="156" height="62" rx="6" fill={j === 1 && dr > 0 ? TEAL : '#7FA2C8'} />
            <rect x="100" y={48 + j * 72} width="40" height="10" rx="5" fill="white" /></g>)}</svg>
        <div style={{ fontWeight: 800 }}>Library = filing cabinet</div>
        <div style={{ color: TEAL, fontWeight: 800, opacity: dr }}>Folder = drawer</div></Card>
      <Card k={pop(f, at('jim test 2'))} style={{ textAlign: 'center' }}>This example: folder <b>Jim Test 2</b></Card></SideCol>; },
  upload: ({ f, at }) => { const up = ease(f, at('choose your file'), 25);
    return <SideCol>
      <Card k={pop(f, 4)} style={{ textAlign: 'center', height: 330, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 20 }}><Site s={170} /></div>
        <div style={{ position: 'absolute', left: '50%', top: 10 + up * 150, transform: 'translateX(-50%)', opacity: 1 - ease(f, at('choose your file') + 25, 8) }}>
          <FileIcon ext="EML" c={BLUE} s={70} /></div>
        <div style={{ position: 'absolute', left: 30, top: 30, fontSize: 60, color: TEAL, opacity: up > 0 && up < 1 ? 1 : 0 }}>↓</div></Card>
      <Card k={pop(f, at('message'))} style={{ display: 'flex', alignItems: 'center', gap: 16 }}><Check />Upload confirmed</Card>
      <Card k={pop(f, at('new file'))} style={{ borderColor: TEAL }}>New file appears in the list</Card></SideCol>; },
  sens: ({ f, at }) => <SideCol>
    <Card k={pop(f, at('tells'))} style={{ textAlign: 'center' }}><Tag text="Confidential" /><div style={{ marginTop: 10, fontSize: 24, color: SOFT }}>
      How confidential a document is</div></Card>
    <Card k={pop(f, at('regular'))} style={{ display: 'flex', alignItems: 'center', gap: 14 }}><FileIcon ext="DOCX" c={BLUE} s={60} />
      <FileIcon ext="XLSX" c={GREEN} s={60} /><div><b>Needs a label</b><div style={{ fontSize: 22, color: SOFT }}>before declaring</div></div></Card>
    <Card k={pop(f, at('audiovisual'))} style={{ display: 'flex', alignItems: 'center', gap: 10, borderColor: f > at('our example') ? AMBER : undefined,
      boxShadow: f > at('our example') ? `0 0 0 4px ${AMBER}` : 'none' }}>
      <FileIcon ext="IMG" c={PAPER} s={54} /><FileIcon ext="MP4" c={RED} s={54} /><FileIcon ext="EML" c={TEAL} s={54} />
      <div><b>No label needed</b><div style={{ fontSize: 22, color: SOFT }}>audiovisual</div></div></Card></SideCol>,
  pc: ({ f, at }) => { const no = f > at('answer is no');
    return <SideCol>
      <Card k={pop(f, at('declare as record'))} style={{ textAlign: 'center' }}>⋯  →  <b>Declare as record</b></Card>
      <Card k={pop(f, at('one question'))} style={{ textAlign: 'center', fontWeight: 700 }}>Is there a paper copy?</Card>
      <div style={{ display: 'flex', gap: 18 }}>
        <Card k={pop(f, at('choose yes'))} style={{ flex: 1, textAlign: 'center', opacity: no ? 0.45 : 1 }}>
          <Doc s={70} c={BLUE} paper /><div style={{ fontWeight: 800, marginTop: 6 }}>Yes</div><div style={{ fontSize: 21, color: SOFT }}>paper copy exists</div></Card>
        <Card k={pop(f, at('choose no'))} style={{ flex: 1, textAlign: 'center', borderColor: no ? TEAL : undefined, boxShadow: no ? `0 0 0 4px ${TEAL}` : 'none' }}>
          <Doc s={70} c={BLUE} /><div style={{ fontWeight: 800, marginTop: 6 }}>No</div><div style={{ fontSize: 21, color: SOFT }}>electronic only</div></Card>
      </div></SideCol>; },
  submit: ({ f, at }) => { const done = at('successfully'), lock = at('lock icon');
    return <SideCol>
      <Card k={pop(f, 4)} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ background: BLUE, borderRadius: 8, padding: '8px 22px', fontWeight: 800, transform: `scale(${f > 14 && f < 22 ? 0.9 : 1})` }}>Submit</div>
        {f > 20 && f < done && <Spinner f={f} s={52} />}{f >= done && <Check />}</Card>
      <Card k={pop(f, done)} style={{ borderColor: GREEN }}><b style={{ color: GREEN }}>Successfully declared</b> as a record</Card>
      <Card k={pop(f, lock)} style={{ display: 'flex', alignItems: 'center', gap: 18 }}><Doc s={70} c={GREEN} lock />
        <div><b>Protected</b><div style={{ fontSize: 23, color: SOFT }}>can't be edited or deleted</div></div></Card></SideCol>; },
  check: ({ f, at }) => <SideCol>
    <Card k={pop(f, at('switch'))}><div style={{ fontSize: 22, color: SOFT }}>View</div>
      <div style={{ marginTop: 8, padding: '10px 16px', borderRadius: 10, background: TEAL, fontWeight: 800 }}>Record Management Review ▾</div></Card>
    <Card k={pop(f, at('two important'))} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>Check two columns:
      <Tag text="Retention label" c={GREEN} /><Tag text="Sensitivity label" c={AMBER} /></Card></SideCol>,
  ret: ({ f, at }) => { const ten = f > at('this library');
    return <SideCol>
      <Card k={pop(f, at('how long'))} style={{ display: 'flex', alignItems: 'center', gap: 18 }}><Cal s={80} />How long the record is kept</Card>
      <Card k={pop(f, at('depends'))} style={{ textAlign: 'center' }}>Library <span style={{ color: TEAL }}>→</span> retention label</Card>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {[['5 yrs', 'five'], ['7 yrs', 'seven'], ['10 yrs', 'ten years,'], ['Permanent', 'permanent']].map(([t, p]) =>
          <Pill key={t} k={pop(f, at(p))} c={t === '10 yrs' && ten ? GREEN : BLUE} on size={28}>{t}</Pill>)}</div>
      <Card k={pop(f, at('this library'))} style={{ borderColor: GREEN, textAlign: 'center' }}>This library: <b style={{ color: GREEN }}>10 years after declaration</b></Card>
    </SideCol>; },
  sensBlank: ({ f, at }) => <SideCol>
    <Card k={pop(f, 4)} style={{ display: 'flex', alignItems: 'center', gap: 18 }}><FileIcon ext="EML" c={TEAL} s={70} />
      <div><Tag text="blank" c={SOFT} dashed /><div style={{ marginTop: 8, fontSize: 24, color: GREEN, fontWeight: 800 }}>Expected for audiovisual</div></div></Card>
    <Card k={pop(f, at('word or excel'))} style={{ display: 'flex', alignItems: 'center', gap: 18 }}><FileIcon ext="DOCX" c={BLUE} s={70} />
      <div><Tag text="Confidential" /><div style={{ marginTop: 8, fontSize: 24, color: SOFT }}>Word or Excel shows its label</div></div></Card></SideCol>,
};

/* ---------- the recording ---------- */
const SRC_W = 1724, SRC_H = 964, VW = 1190, VH = Math.round(VW * SRC_H / SRC_W), VX = 40, VY = 150;
const plan = (v, n) => {
  const raw = v.segs.map(([a, b]) => b - a), wt = v.w || raw, tot = wt.reduce((x, y) => x + y, 0);  // w: share of the beat per segment, set to match the narration
  let from = 0;
  return v.segs.map(([a, b], i) => {
    const d = Math.round((wt[i] / tot) * n), rate = Math.max(0.45, Math.min(2, (b - a) * FPS / d)), play = Math.min(d, Math.floor((b - a) * FPS / rate));
    const s = { a, b, at: from, d, rate, play }; from += d; return s;
  });
};
const srcTime = (P, f) => { const s = P.findLast(x => x.at <= f) || P[0]; return s.a + Math.min(f - s.at, s.play - 1) * s.rate / FPS; };

const Mark = ({ h, sc, f, born }) => {
  const [x1, y1, x2, y2] = h.box.map(v => v * sc), k = interpolate(f - born, [0, 8], [0, 1], clamp), pulse = 0.5 + 0.5 * Math.sin(f / 4);
  const c = h.kind === 'click' ? AMBER : TEAL;
  return <>
    {h.kind === 'spot' && <div style={{ position: 'absolute', left: x1, top: y1, width: x2 - x1, height: y2 - y1, borderRadius: 10, opacity: k,
      boxShadow: `0 0 0 4000px rgba(16,36,62,.55)`, border: `4px solid ${TEAL}` }} />}
    {h.kind !== 'spot' && <div style={{ position: 'absolute', left: x1 - 8, top: y1 - 8, width: x2 - x1 + 16, height: y2 - y1 + 16, opacity: k,
      borderRadius: h.kind === 'box' ? 12 : 999, border: `5px solid ${c}`, boxShadow: `0 0 ${18 + 14 * pulse}px ${c}` }} />}
    {h.kind === 'click' && <div style={{ position: 'absolute', left: (x1 + x2) / 2 - 40, top: (y1 + y2) / 2 - 40, width: 80, height: 80, borderRadius: 40,
      border: `4px solid ${AMBER}`, opacity: (1 - ((f - born) % 24) / 24) * k, transform: `scale(${0.4 + ((f - born) % 24) / 24})` }} />}
    {h.label && <div style={{ position: 'absolute', left: x1, top: y1 > 70 ? y1 - 58 : y2 + 12, opacity: k, transform: `translateY(${(1 - k) * 10}px)`,
      background: c, color: INK, fontFamily: FONT, fontWeight: 800, fontSize: 26, padding: '6px 14px', borderRadius: 8, whiteSpace: 'nowrap',
      boxShadow: '0 6px 20px rgba(0,0,0,.35)' }}>{h.label}</div>}
  </>;
};

const Clip = ({ v, n }) => {
  const f = useCurrentFrame(), P = plan(v, n), t = srcTime(P, f);
  const K = v.keys, tt = K.map(k => k[0] * n), o = { ...clamp, easing: Easing.inOut(Easing.cubic) };
  const cx = interpolate(f, tt, K.map(k => k[1]), o), cy = interpolate(f, tt, K.map(k => k[2]), o), s = interpolate(f, tt, K.map(k => k[3]), o);
  const k = VW / SRC_W, sc = k * s;
  const tx = Math.min(0, Math.max(VW - SRC_W * sc, VW / 2 - cx * sc)), ty = Math.min(0, Math.max(VH - SRC_H * sc, VH / 2 - cy * sc));
  const firstFrame = h => { for (let g = 0; g < n; g++) { const x = srcTime(P, g); if (x >= h.a && x <= h.b) return g; } return 0; };
  return (
    <div style={{ position: 'absolute', left: VX, top: VY, width: VW, height: VH, overflow: 'hidden', borderRadius: 16,
      boxShadow: '0 30px 80px rgba(0,0,0,.5)', border: '1px solid rgba(255,255,255,.15)', background: 'white' }}>
      <div style={{ position: 'absolute', left: tx, top: ty, width: SRC_W * sc, height: SRC_H * sc }}>
        {P.map((p, i) => <Sequence key={i} from={p.at} durationInFrames={p.d} layout="none">
          <OffthreadVideo src={staticFile('scene5.mp4')} muted startFrom={Math.round(p.a * FPS)} playbackRate={p.rate}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: f - p.at < p.play ? 'block' : 'none' }} />
          {p.play < p.d && <Freeze frame={p.play - 1}><OffthreadVideo src={staticFile('scene5.mp4')} muted startFrom={Math.round(p.a * FPS)}
            playbackRate={p.rate} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: f - p.at >= p.play ? 'block' : 'none' }} /></Freeze>}
        </Sequence>)}
        {v.hl.filter(h => t >= h.a && t <= h.b).map((h, j) => <Mark key={h.label + j} h={h} sc={sc} f={f} born={firstFrame(h)} />)}
      </div>
    </div>
  );
};

const Tracker = ({ step, f, fresh }) => (
  <div style={{ position: 'absolute', left: 40, right: 40, top: 26, display: 'flex', gap: 10, fontFamily: FONT }}>
    {STEPS.map((s, i) => { const on = i + 1 === step, done = i + 1 < step, k = on && fresh ? spring({ frame: f - 4, fps: FPS, config: { damping: 14 } }) : 1;
      return <div key={s} style={{ flex: on ? 1.7 : 1, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12,
        background: on ? TEAL : done ? 'rgba(62,155,58,.25)' : 'rgba(255,255,255,.07)', border: `2px solid ${on ? TEAL : done ? GREEN : 'rgba(255,255,255,.15)'}`,
        color: on ? 'white' : done ? '#CDEBCB' : SOFT, transform: `scale(${on ? 0.9 + 0.1 * k : 1})`, fontSize: on ? 26 : 19, fontWeight: on ? 800 : 600 }}>
        <span style={{ minWidth: 34, height: 34, borderRadius: 17, display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 20,
          background: on ? 'white' : done ? GREEN : 'rgba(255,255,255,.12)', color: on ? TEAL : 'white' }}>{done ? '✓' : i + 1}</span>
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s}</span></div>; })}
  </div>
);

const Subtitle = ({ text, f, n }) => {
  const parts = text.replace(/E D R M S/g, 'EDRMS').replace(/A D B/g, 'ADB').replace(/R A C/g, 'RAC').replace(/I T D/g, 'ITD')
    .replace(/T C S Q A/g, 'TCS QA').replace(/Q A/g, 'QA').replace(/document I D/g, 'document ID')
    .replace(/[Rr]elease one point one/g, 'Release 1.1').replace(/Release one point two point one/g, 'Release 1.2.1')
    .replace(/[Rr]elease twenty twenty six point three point one/g, 'release 2026.3.1')
    .replace(/(?:[Rr]elease )?twenty twenty six point (\w+)/g, (m, d) => (m.startsWith('R') ? 'Release ' : m.startsWith('r') ? 'release ' : '') + '2026.' + ({ one: 1, two: 2, three: 3, four: 4 })[d])
    .match(/(?:[^.?!,]|[.,](?=\d))+[.?!,]*/g).map(s => s.trim()).filter(Boolean);
  const merged = parts.reduce((a, s) => (a.length && (a.at(-1).length + s.length < 70) ? [...a.slice(0, -1), a.at(-1) + ' ' + s] : [...a, s]), []);
  const tot = merged.reduce((a, s) => a + s.length, 0), span = n - LEAD - TAIL;
  let acc = 0, cur = merged[0];
  for (const s of merged) { if (LEAD + (acc / tot) * span <= f) cur = s; acc += s.length; }
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 26, display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: 1560, background: 'rgba(16,36,62,0.9)', color: 'white', fontFamily: FONT,
        fontSize: 34, lineHeight: 1.3, padding: '10px 28px', borderRadius: 10, textAlign: 'center' }}>{cur.replace(/,$/, '')}</div>
    </div>
  );
};

const atFor = j => phrase => {
  const b = BEATS[j], i = b.t.toLowerCase().indexOf(phrase.toLowerCase());
  return LEAD + (i < 0 ? 0 : (i / b.t.length) * b.seconds * FPS);
};

export const Part1 = () => {
  const f = useCurrentFrame();
  const i = START.findLastIndex(s => s <= f), b = BEATS[i], lf = f - START[i], n = len(b);
  const p = BEATS[i - 1], nx = BEATS[i + 1];
  const same = (a, c) => !!(a && c) && ((a.mg && a.mg === c.mg) || (a.vid && c.vid));
  const fade = Math.min(same(p, b) ? 1 : interpolate(lf, [0, 12], [0, 1], clamp), same(b, nx) ? 1 : interpolate(lf, [n - 12, n], [1, 0], clamp));
  const idx = BEATS.slice(0, i + 1).filter(x => x.mg === b.mg).length - 1;
  const Full = FULL[b.mg], Side = b.vid && SIDE[b.vid.side];
  const sideFade = Math.min(interpolate(lf, [0, 10], [0, 1], clamp), interpolate(lf, [n - 8, n], [1, 0], clamp));
  return (
    <AbsoluteFill style={{ background: INK }}>
      <AbsoluteFill style={{ opacity: fade }}>
        {b.mg ? <Full f={lf} n={n} at={atFor(i)} idx={idx} first={!p || p.mg !== b.mg} />
          : <Back big={false}>
            <Sequence from={START[i]} durationInFrames={n} layout="none"><Clip v={b.vid} n={n} /></Sequence>
            <Tracker step={b.vid.step} f={lf} fresh={!p || !p.vid || p.vid.step !== b.vid.step} />
            <div style={{ position: 'absolute', left: VX + VW + 40, right: 40, top: VY, opacity: sideFade }}>
              <Side key={i} f={lf} n={n} at={atFor(i)} /></div>
          </Back>}
        <Subtitle text={b.t} f={lf} n={n} />
      </AbsoluteFill>
      <Audio src={staticFile('music.mp3')} loop volume={fr => 0.07 * interpolate(fr, [TOTAL - 60, TOTAL], [1, 0], clamp)} />
      {BEATS.map((x, j) => (
        <Sequence key={j} from={START[j] + LEAD} durationInFrames={Math.ceil(x.seconds * FPS) + 2}>
          <Audio src={staticFile(`vo/${j}.wav`)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
