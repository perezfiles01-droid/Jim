import React from 'react';
/* KT Part 1: Introduction. Full screen motion graphics for the story beats,
   and cut, zoomed clips of the declaration recording (public/scene5.mp4) for
   the step by step beats. Every beat lasts as long as its voiceover. */
import { AbsoluteFill, Audio, Freeze, OffthreadVideo, Sequence, interpolate, spring,
  staticFile, useCurrentFrame } from 'remotion';
import BEATS from './beats.gen.json';
import { INK, BLUE, TEAL, ADB, GREEN, SOFT, PAPER, FONT, pop, ease, In,
  Doc, User, Site, DB, Mail, Bank, Cal } from '../../src/MG';

const FPS = 30, W = 1920, H = 1080, LEAD = 10, TAIL = 16;
const len = b => LEAD + Math.ceil(b.seconds * FPS) + TAIL;
const START = BEATS.reduce((a, b, i) => [...a, i ? a[i - 1] + len(BEATS[i - 1]) : 0], []);
export const TOTAL = START.at(-1) + len(BEATS.at(-1));
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };

/* ---------- shared pieces ---------- */
const Back = ({ children }) => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 25% 15%, #1B3A63 0%, ${INK} 65%)`,
    fontFamily: FONT, color: 'white' }}>{children}</AbsoluteFill>
);
const Title = ({ k, children, size = 64, color = 'white' }) => (
  <In k={k}><div style={{ fontSize: size, fontWeight: 700, color, textAlign: 'center' }}>{children}</div></In>
);
const Pill = ({ k, children, c = TEAL, on = true }) => (
  <In k={k}><div style={{ padding: '14px 28px', borderRadius: 40, fontSize: 32, fontWeight: 600,
    background: on ? c : 'rgba(255,255,255,.08)', color: on ? 'white' : SOFT,
    border: `2px solid ${on ? c : 'rgba(255,255,255,.18)'}` }}>{children}</div></In>
);
const Row = ({ children, gap = 28, style }) => (
  <div style={{ display: 'flex', gap, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', ...style }}>{children}</div>
);
const Col = ({ children, gap = 40 }) => (
  <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', gap, paddingBottom: 90 }}>{children}</AbsoluteFill>
);

/* ---------- full screen scenes ---------- */
const Intro = ({ f, at }) => (
  <Back><Col>
    <Title k={pop(f, 0)} size={44} color={TEAL}>EDRMS Knowledge Transfer</Title>
    <Title k={pop(f, 8)} size={96}>Part 1: Introduction</Title>
    <div style={{ width: 220 * ease(f, 14), height: 6, background: TEAL }} />
    <Row>{[['What ADB is', 'what a d b'], ['The EDRMS project', 'project'], ['Declaring a record', 'declared'],
      ['Who is involved', 'involved'], ['Releases', 'releases']].map(([t, p]) =>
      <Pill key={t} k={pop(f, at(p))}>{t}</Pill>)}</Row>
  </Col></Back>
);

const Adb = ({ f, at }) => (
  <Back><Col gap={34}>
    <In k={pop(f, 0)}><Bank s={150} /></In>
    <Title k={pop(f, 6)} size={80}>Asian Development Bank</Title>
    <In k={pop(f, at('manila'))}><div style={{ fontSize: 40, color: SOFT }}>📍 Headquarters in Manila</div></In>
    <Row gap={36}>{[['Departments at headquarters', 'departments', BLUE], ['Resident missions', 'resident', TEAL],
      ['Representative offices', 'representative', GREEN]].map(([t, p, c]) =>
      <Pill key={t} k={pop(f, at(p))} c={c}>{t}</Pill>)}</Row>
  </Col></Back>
);

const Records = ({ f, at }) => {
  const r = at('some of these'), steps = [['Stored safely', 'stored'], ['Kept for the right time', 'right length'], ['Disposed of when due', 'disposed']];
  return (
    <Back><Col gap={60}>
      <Row gap={22}>{Array.from({ length: 10 }, (_, i) =>
        <In key={i} k={pop(f, 4 + i * 3)}><Doc s={92} c={i % 3 === 1 ? GREEN : BLUE} lock={i % 3 === 1 && f > r + i * 2} /></In>)}</Row>
      <In k={pop(f, r)}><div style={{ fontSize: 46, fontWeight: 700 }}>
        <span style={{ color: SOFT }}>Documents</span>  →  <span style={{ color: GREEN }}>Official records</span></div></In>
      <Row gap={30}>{steps.map(([t, p], i) => <Pill key={t} k={pop(f, at(p))} c={[BLUE, TEAL, PAPER][i]}>{t}</Pill>)}</Row>
    </Col></Back>
  );
};

const Edrms = ({ f, at }) => {
  const layer = (t, c, p, w) => (
    <In key={t} k={pop(f, at(p))} y={-40}><div style={{ width: w, padding: '22px 0', borderRadius: 14, background: c,
      fontSize: 38, fontWeight: 700, textAlign: 'center', boxShadow: '0 12px 30px rgba(0,0,0,.35)' }}>{t}</div></In>
  );
  return (
    <Back><Col gap={30}>
      <Title k={pop(f, 0)} size={120}>EDRMS</Title>
      <In k={pop(f, at('electronic'))}><div style={{ fontSize: 40, color: SOFT }}>Electronic Document and Records Management System</div></In>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginTop: 20 }}>
        {layer('EDRMS by AvePoint', TEAL, 'avepoint', 620)}
        {layer('SharePoint', BLUE, 'sharepoint', 780)}
        {layer('Microsoft 365', ADB, 'microsoft', 940)}
      </div>
    </Col></Back>
  );
};

const STEPS = ['Open the library', 'Upload', 'Declare as record', 'Physical counterpart', 'Submit', 'Locked as a record', 'Record details'];
const HowTo = ({ f }) => (
  <Back><Col gap={40}>
    <Title k={pop(f, 0)} size={84}>How a record is declared</Title>
    <Row gap={18} style={{ maxWidth: 1600 }}>{STEPS.map((s, i) =>
      <In key={s} k={pop(f, 8 + i * 5)}><div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 24px',
        borderRadius: 12, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.18)', fontSize: 30 }}>
        <span style={{ width: 44, height: 44, borderRadius: 22, background: TEAL, display: 'grid', placeItems: 'center',
          fontWeight: 800 }}>{i + 1}</span>{s}</div></In>)}</Row>
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

const GROUPS = [
  ['RAC', 'Records team at ADB', 'Owns the requirements and confirms each release', ADB],
  ['ITD', 'IT department at ADB', 'Supports the rollout. TCS QA tests every release', BLUE],
  ['AvePoint', 'Delivery team', 'BAs write requirements, developers build, QA tests first', TEAL],
];
const Groups = ({ f, idx, first }) => (
  <Back><Col gap={50}>
    <Title k={first ? pop(f, 0) : 1} size={72}>Three groups behind the project</Title>
    <Row gap={36}>{GROUPS.map(([n, r, d, c], i) => {
      const shown = i <= idx, on = i === idx, k = i < idx ? 1 : i === idx ? pop(f, 6) : 0;
      return <In key={n} k={shown ? k : 0}><div style={{ width: 470, minHeight: 330, padding: 34, borderRadius: 20,
        background: on ? c : 'rgba(255,255,255,.07)', border: `2px solid ${c}`, opacity: on ? 1 : 0.55,
        transform: `scale(${on ? 1.04 : 1})`, boxShadow: on ? '0 20px 50px rgba(0,0,0,.4)' : 'none' }}>
        <div style={{ fontSize: 64, fontWeight: 800 }}>{n}</div>
        <div style={{ fontSize: 30, fontWeight: 600, margin: '10px 0 18px' }}>{r}</div>
        <div style={{ fontSize: 27, lineHeight: 1.35, color: on ? 'white' : SOFT }}>{d}</div>
      </div></In>;
    })}</Row>
  </Col></Back>
);

const RELS = [
  ['1.1', 'Apr 2025', 'Site and library creation, records declaration, Cloud Governance', 'done'],
  ['1.2.1', 'Nov 2025', 'Multimedia records declaration, native retention label disabled', 'done'],
  ['2026.1', 'Jan 2026', 'Multiple records declaration', 'done'],
  ['2026.2', 'Mar 2026', 'Centralized records declaration', 'done'],
  ['2026.3', 'Jun 2026', 'Email records declaration from Outlook. 2026.3.1 in progress', 'done'],
  ['2026.4', 'Dec 2026', 'EDRMS Utilization Report', 'now'],
  ['Next', 'TBC', 'Physical records (on hold), retention label mapping, disposition, site renewal', 'next'],
];
const Rel = ({ f, idx, first }) => {
  const col = s => s === 'done' ? GREEN : s === 'now' ? TEAL : PAPER;
  return (
    <Back>
      <div style={{ position: 'absolute', top: 70, width: '100%', textAlign: 'center' }}>
        <Title k={first ? pop(f, 0) : 1} size={64}>Releases so far</Title></div>
      <div style={{ position: 'absolute', left: 120, right: 120, top: 330, height: 6, background: 'rgba(255,255,255,.15)' }}>
        <div style={{ height: 6, background: TEAL, width: `${((idx + ease(f, 4, 25)) / RELS.length) * 100}%` }} /></div>
      {RELS.map(([n, d, t, s], i) => {
        const x = 120 + (i + 0.5) * ((W - 240) / RELS.length), shown = i <= idx, on = i === idx;
        const k = i < idx ? 1 : on ? pop(f, 4) : 0;
        return <div key={n} style={{ position: 'absolute', left: x - 110, top: 250, width: 220, textAlign: 'center',
          opacity: shown ? Math.min(1, k * 1.4) * (on ? 1 : 0.6) : 0.18 }}>
          <div style={{ fontSize: 24, color: SOFT, marginBottom: 24 }}>{d}</div>
          <div style={{ width: on ? 46 : 30, height: on ? 46 : 30, borderRadius: 30, margin: '0 auto', background: col(s),
            border: '4px solid white', boxShadow: on ? `0 0 30px ${col(s)}` : 'none' }} />
          <div style={{ fontSize: on ? 40 : 32, fontWeight: 800, marginTop: 20 }}>{n}</div>
        </div>;
      })}
      {(() => { const [n, d, t, s] = RELS[idx]; const k = pop(f, 10);
        return <div style={{ position: 'absolute', left: 260, right: 260, top: 560, opacity: k,
          transform: `translateY(${(1 - k) * 30}px)`, padding: '34px 44px', borderRadius: 22,
          background: 'rgba(255,255,255,.07)', borderLeft: `10px solid ${col(s)}` }}>
          <div style={{ fontSize: 26, color: col(s), fontWeight: 700 }}>
            {s === 'done' ? 'DELIVERED' : s === 'now' ? 'CURRENT RELEASE' : 'WHAT COMES NEXT'} · {d}</div>
          <div style={{ fontSize: 50, fontWeight: 800, margin: '8px 0 10px' }}>{n === 'Next' ? 'After 2026.4' : `Release ${n}`}</div>
          <div style={{ fontSize: 34, color: '#DCE6F0', lineHeight: 1.35 }}>{t}</div>
        </div>; })()}
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

const FULL = { intro: Intro, adb: Adb, records: Records, edrms: Edrms, howto: HowTo, series: Series, groups: Groups, rel: Rel, outro: Outro };

/* ---------- the recording ---------- */
const VW = 1600, VH = Math.round(VW * 964 / 1724), VX = (W - VW) / 2, VY = 112, SRC_W = 1724, SRC_H = 964;
const Clip = ({ v, n }) => {
  const f = useCurrentFrame();
  const segs = v.segs, raw = segs.map(([a, b]) => b - a), tot = raw.reduce((a, b) => a + b, 0);
  const alloc = raw.map(r => Math.round((r / tot) * n));
  let from = 0;
  const z = spring({ frame: f - 6, fps: FPS, config: { damping: 200 } }), s = 1 + (v.s - 1) * z;
  const k = VW / SRC_W, cx = SRC_W / 2 + (v.c[0] - SRC_W / 2) * z, cy = SRC_H / 2 + (v.c[1] - SRC_H / 2) * z;
  const tx = Math.min(0, Math.max(VW - SRC_W * k * s, VW / 2 - cx * k * s));
  const ty = Math.min(0, Math.max(VH - SRC_H * k * s, VH / 2 - cy * k * s));
  return (
    <div style={{ position: 'absolute', left: VX, top: VY, width: VW, height: VH, overflow: 'hidden', borderRadius: 16,
      boxShadow: '0 30px 80px rgba(0,0,0,.5)', border: '1px solid rgba(255,255,255,.15)', background: 'white' }}>
      <div style={{ position: 'absolute', left: tx, top: ty, width: SRC_W * k * s, height: SRC_H * k * s }}>
        {segs.map(([a, b], i) => {
          const d = alloc[i], rate = Math.max(0.45, Math.min(2, (b - a) * FPS / d)), play = Math.min(d, Math.floor((b - a) * FPS / rate));
          const at = from; from += d;
          return <Sequence key={i} from={at} durationInFrames={d} layout="none">
            <OffthreadVideo src={staticFile('scene5.mp4')} muted startFrom={Math.round(a * FPS)} playbackRate={rate}
              style={{ width: '100%', height: '100%', display: f - at < play ? 'block' : 'none' }} />
            {play < d && <Freeze frame={play - 1}><OffthreadVideo src={staticFile('scene5.mp4')} muted
              startFrom={Math.round(a * FPS)} playbackRate={rate}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: f - at >= play ? 'block' : 'none' }} /></Freeze>}
          </Sequence>;
        })}
      </div>
    </div>
  );
};

const StepChip = ({ v, f, fresh }) => {
  const k = fresh ? spring({ frame: f - 4, fps: FPS, config: { damping: 200 } }) : 1;
  return (
    <div style={{ position: 'absolute', left: VX, top: 22, display: 'flex', gap: 18, alignItems: 'center',
      fontFamily: FONT, color: 'white', transform: `translateX(${(k - 1) * 500}px)`, opacity: k }}>
      <div style={{ background: TEAL, borderRadius: 10, padding: '8px 18px', fontSize: 26, fontWeight: 800 }}>Step {v.step} of 7</div>
      <div style={{ fontSize: 40, fontWeight: 700 }}>{v.sec}</div>
    </div>
  );
};

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
  const same = (a, c) => a && c && (a.mg ? a.mg === c.mg : !!c.vid) && (a.mg || c.vid) && !!a.mg === !!c.mg;
  const fade = Math.min(same(p, b) ? 1 : interpolate(lf, [0, 12], [0, 1], clamp),
    same(b, nx) ? 1 : interpolate(lf, [n - 12, n], [1, 0], clamp));
  const idx = BEATS.slice(0, i + 1).filter(x => x.mg === b.mg).length - 1;
  const Full = FULL[b.mg];
  return (
    <AbsoluteFill style={{ background: INK }}>
      <AbsoluteFill style={{ opacity: fade }}>
        {b.mg ? <Full f={lf} n={n} at={atFor(i)} idx={idx} first={!p || p.mg !== b.mg} />
          : <Back><Sequence from={START[i]} durationInFrames={n} layout="none"><Clip v={b.vid} n={n} /></Sequence>
            <StepChip v={b.vid} f={lf} fresh={!p || !p.vid || p.vid.sec !== b.vid.sec} /></Back>}
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
