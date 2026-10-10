import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import BEATS from './beats.gen.json';

/* A printed-report version of the walkthrough: one A4 landscape page per
   section, each frame of the composition being one page. The section is
   cropped from the dashboard screenshot, every beat gets a numbered marker,
   and the matching numbered note explains it. */
const INK = '#10243E', BLUE = '#0072BC', TEAL = '#00A5A8', GREY = '#5B6B7F';
const SERIF = 'Georgia, "Times New Roman", serif', SANS = 'Segoe UI, Helvetica, Arial, sans-serif';
export const PW = 1754, PH = 1240;
const NAME = { bw: 'Bank-wide Oversight', dp: 'Department Insights' };

const tidy = t => t.replace(/E D R M S/g, 'EDRMS').replace(/A D B/g, 'ADB').replace(/R A C/g, 'RAC')
  .replace(/\bR M\b/g, 'RM').replace(/\bR O\b/g, 'RO');

export const SECTIONS = BEATS.reduce((a, b) => {
  if (!b.dash) return a;
  const last = a.at(-1);
  if (last && last.sec === b.sec && last.dash === b.dash) last.beats.push(b);
  else a.push({ dash: b.dash, sec: b.sec, beats: [b] });
  return a;
}, []).reduce((a, s, i, all) => {
  // A dashboard's one-line overview beat opens the next section rather than taking a thin page of its own.
  if (s.sec === NAME[s.dash]) all[i + 1].beats.unshift(...s.beats); else a.push(s);
  return a;
}, []);
export const PAGES = SECTIONS.length + 1;

const Crop = ({ s, maxW, maxH }) => {
  const rs = s.beats.map(b => b.rect), pad = 24;
  const x = Math.max(0, Math.min(...rs.map(r => r.x)) - pad), y = Math.max(0, Math.min(...rs.map(r => r.y)) - pad);
  const w = Math.min(1920 - x, Math.max(...rs.map(r => r.x + r.w)) + pad - x);
  const h = Math.max(...rs.map(r => r.y + r.h)) + pad - y;
  const k = Math.min(maxW / w, maxH / h, 1.6);
  return (
    <div style={{ width: w * k, height: h * k, position: 'relative', overflow: 'hidden',
      border: '1px solid #C9D3DE', boxShadow: '0 2px 10px rgba(16,36,62,0.12)', background: 'white' }}>
      <Img src={staticFile(`${s.dash}.png`)} style={{ position: 'absolute', width: 1920 * k,
        left: -x * k, top: -y * k }} />
      {s.beats.map((b, i) => {
        const r = b.rect, single = s.beats.length === 1;
        return (
          <div key={i}>
            {!single && <div style={{ position: 'absolute', left: (r.x - x - 4) * k, top: (r.y - y - 4) * k,
              width: (r.w + 8) * k, height: (r.h + 8) * k, border: `2.5px solid ${TEAL}`, borderRadius: 6 }} />}
            <div style={{ position: 'absolute', left: (r.x - x) * k - 16, top: (r.y - y) * k - 16, width: 34, height: 34,
              borderRadius: 17, background: BLUE, color: 'white', font: `700 19px ${SANS}`, display: 'flex',
              alignItems: 'center', justifyContent: 'center', border: '2.5px solid white',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>{i + 1}</div>
          </div>
        );
      })}
    </div>
  );
};

const Notes = ({ s, cols }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '22px 44px' }}>
    {s.beats.map((b, i) => (
      <div key={i} style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: '0 0 34px', height: 34, borderRadius: 17, background: BLUE, color: 'white',
          font: `700 19px ${SANS}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</div>
        <div style={{ font: `400 21px/1.55 ${SERIF}`, color: '#24364D' }}>{tidy(b.t)}</div>
      </div>
    ))}
  </div>
);

const Frame = ({ children, n }) => (
  <AbsoluteFill style={{ background: '#FBFAF6', padding: '64px 84px 0', fontFamily: SANS }}>
    {children}
    <div style={{ position: 'absolute', left: 84, right: 84, bottom: 40, display: 'flex',
      justifyContent: 'space-between', borderTop: '1px solid #D5DCE4', paddingTop: 14,
      font: `400 16px ${SANS}`, color: GREY }}>
      <span>EDRMS Utilization Report · Dashboard walkthrough</span><span>Page {n} of {PAGES}</span>
    </div>
  </AbsoluteFill>
);

const Cover = () => (
  <Frame n={1}>
    <div style={{ marginTop: 200, borderLeft: `10px solid ${BLUE}`, paddingLeft: 44 }}>
      <div style={{ font: `600 26px ${SANS}`, color: TEAL, letterSpacing: 3, textTransform: 'uppercase' }}>
        Asian Development Bank</div>
      <div style={{ font: `700 84px/1.1 ${SERIF}`, color: INK, margin: '18px 0 26px' }}>
        EDRMS Utilization Report<br />Dashboard Walkthrough</div>
      <div style={{ font: `400 30px ${SERIF}`, color: GREY }}>Bank-wide Oversight and Department Insights, section by section</div>
    </div>
    <div style={{ marginTop: 110, marginLeft: 54, font: `400 22px/1.9 ${SANS}`, color: '#24364D' }}>
      {SECTIONS.map((s, i) => (
        <div key={i}><span style={{ color: BLUE, fontWeight: 700, display: 'inline-block', width: 60 }}>{i + 2}</span>
          {NAME[s.dash]} · {s.sec}</div>
      ))}
    </div>
  </Frame>
);

export const Paper = () => {
  const f = useCurrentFrame();
  if (f === 0) return <Cover />;
  const s = SECTIONS[f - 1], idx = SECTIONS.filter((x, i) => i < f && x.dash === s.dash).length;
  const rs = s.beats.map(b => b.rect);
  const w = Math.max(...rs.map(r => r.x + r.w)) - Math.min(...rs.map(r => r.x));
  const h = Math.max(...rs.map(r => r.y + r.h)) - Math.min(...rs.map(r => r.y));
  const side = w / h < 2.4;  // tall-ish crops sit beside the notes, wide strips above them
  return (
    <Frame n={f + 1}>
      <div style={{ font: `600 20px ${SANS}`, color: TEAL, letterSpacing: 2, textTransform: 'uppercase' }}>
        {NAME[s.dash]} · Section {idx}</div>
      <div style={{ font: `700 50px ${SERIF}`, color: INK, margin: '6px 0 10px' }}>
        {s.sec}</div>
      <div style={{ width: 90, height: 5, background: BLUE, marginBottom: 34 }} />
      {side
        ? <div style={{ display: 'flex', gap: 54, alignItems: 'flex-start' }}>
            <Crop s={s} maxW={930} maxH={880} />
            <div style={{ flex: 1 }}><Notes s={s} cols={1} /></div>
          </div>
        : <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
              <Crop s={s} maxW={1586} maxH={600} />
            </div>
            <Notes s={s} cols={s.beats.length > 2 ? 2 : 1} />
          </div>}
    </Frame>
  );
};
