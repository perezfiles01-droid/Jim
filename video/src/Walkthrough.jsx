import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile,
  useCurrentFrame } from 'remotion';
import BEATS from './beats.gen.json';
import { FULL, SIDE } from './MG';

const INK = '#10243E', BLUE = '#0072BC', TEAL = '#00A5A8';
const FONT = 'Segoe UI, Helvetica, Arial, sans-serif';
const FPS = 30, W = 1920, H = 1080, GAP = 14, CARD_PAD = 30;
const PAGE_H = { bw: 3884, dp: 3020 };

/* Timeline: each beat lasts as long as its voiceover plus a breath. */
const len = b => Math.ceil(b.seconds * FPS) + GAP + (b.dash ? 0 : 2 * CARD_PAD);
const START = BEATS.reduce((a, b, i) => [...a, i ? a[i - 1] + len(BEATS[i - 1]) : 0], []);
export const TOTAL = START.at(-1) + len(BEATS.at(-1));

/* Camera for a beat: zoom so its element fills most of the frame, centred,
   without showing past the edges of the page. */
const shot = r => {
  const s = Math.max(0.8, Math.min(2.4, (0.84 * W) / r.w, (0.66 * H) / r.h)) / 1.045; // room for the push-in
  const vw = W / s, vh = H / s, ph = PAGE_H[r.dash];
  const cx = Math.min(Math.max(r.x + r.w / 2, vw / 2), W - vw / 2);
  const cy = Math.min(Math.max(r.y + r.h / 2 + 30 / s, vh / 2), Math.max(vh / 2, ph - vh / 2));
  return { s, cx, cy };
};
const wide = dash => ({ s: 1, cx: W / 2, cy: H / 2, dash });
const mix = (a, b, k) => a + (b - a) * k;

const Card = ({ title, sub, f, n }) => {
  const s = spring({ frame: f, fps: FPS, config: { damping: 200 } });
  const out = interpolate(f, [n - 15, n], [1, 0], { extrapolateLeft: 'clamp' });
  return (
    <AbsoluteFill style={{ background: INK, justifyContent: 'center', alignItems: 'center',
      fontFamily: FONT, color: 'white', opacity: Math.min(s, out) }}>
      <div style={{ fontSize: 92, fontWeight: 700, transform: `translateY(${(1 - s) * 40}px)` }}>{title}</div>
      <div style={{ width: 180 * s, height: 6, background: TEAL, margin: '32px 0' }} />
      <div style={{ fontSize: 40, color: '#9DB8D2' }}>{sub}</div>
    </AbsoluteFill>
  );
};

/* The page under a moving camera. The spotlight lives in page coordinates,
   so it stays locked to the element while the camera travels. */
const Stage = ({ f }) => {
  let i = START.findLastIndex(s => s <= f); const b = BEATS[i], lf = f - START[i];
  const cur = { ...shot({ ...b.rect, dash: b.dash }), dash: b.dash };
  const p = BEATS[i - 1], prevSame = p && p.dash === b.dash;
  const prev = prevSame ? { ...shot({ ...p.rect, dash: p.dash }), dash: p.dash } : wide(b.dash);
  const k = spring({ frame: lf, fps: FPS, config: { damping: 22, mass: 0.9, stiffness: 70 } });
  const push = interpolate(lf, [0, len(b)], [1, 1.045]);
  const s = mix(prev.s, cur.s, k) * push, cx = mix(prev.cx, cur.cx, k), cy = mix(prev.cy, cur.cy, k);
  const pr = prevSame ? p.rect : b.rect;
  const r = { x: mix(pr.x, b.rect.x, k), y: mix(pr.y, b.rect.y, k), w: mix(pr.w, b.rect.w, k), h: mix(pr.h, b.rect.h, k) };
  const glow = prevSame ? 1 : interpolate(lf, [10, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeIn = prevSame ? 1 : interpolate(lf, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  const nx = BEATS[i + 1], fadeOut = nx && nx.dash === b.dash ? 1
    : interpolate(lf, [len(b) - 12, len(b)], [1, 0], { extrapolateLeft: 'clamp' });
  return (
    <AbsoluteFill style={{ background: '#E9EEF4', overflow: 'hidden', opacity: Math.min(fadeIn, fadeOut) }}>
      <div style={{ position: 'absolute', left: W / 2 - cx * s, top: H / 2 - cy * s,
        transform: `scale(${s})`, transformOrigin: 'top left' }}>
        <Img src={staticFile(`${b.dash}.png`)} style={{ display: 'block', width: W }} />
        <div style={{ position: 'absolute', left: r.x - 10, top: r.y - 10, width: r.w + 20, height: r.h + 20,
          borderRadius: 12, border: `${4 / s}px solid ${TEAL}`, opacity: glow,
          boxShadow: `0 0 0 6000px rgba(16,36,62,${0.5 * glow}), 0 0 ${30 / s}px rgba(0,165,168,0.6)` }} />
      </div>
    </AbsoluteFill>
  );
};

const Chip = ({ dash, sec, f, fresh }) => {
  const k = fresh ? spring({ frame: f - 6, fps: FPS, config: { damping: 200 } }) : 1;
  return (
    <div style={{ position: 'absolute', left: 50, top: 18, display: 'flex', alignItems: 'center',
      background: 'rgba(16,36,62,0.94)', color: 'white', fontFamily: FONT, padding: '10px 26px 10px 20px',
      borderRadius: 10, borderLeft: `7px solid ${BLUE}`, transform: `translateX(${(k - 1) * 600}px)`,
      boxShadow: '0 8px 30px rgba(0,0,0,0.25)' }}>
      <div>
        <div style={{ fontSize: 18, color: TEAL, fontWeight: 600 }}>
          {dash === 'bw' ? 'Bank-wide Oversight' : 'Department Insights'}</div>
        <div style={{ fontSize: 30, fontWeight: 700 }}>{sec}</div>
      </div>
    </div>
  );
};

/* Subtitles in short phrases, paced across the clip by length. */
const Subtitle = ({ text, f, n }) => {
  const parts = text.replace(/E D R M S/g, 'EDRMS').replace(/A D B/g, 'ADB').replace(/R A C/g, 'RAC')
    .replace(/R M/g, 'RM').replace(/R O/g, 'RO').match(/(?:[^.?!]|\.(?=\d))+[.?!]*/g).map(s => s.trim()).filter(Boolean);
  const tot = parts.reduce((a, s) => a + s.length, 0), span = n - GAP;
  let acc = 0, cur = parts[0];
  for (const s of parts) { if ((acc / tot) * span <= f) cur = s; acc += s.length; }
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 40, display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: 1500, background: 'rgba(16,36,62,0.88)', color: 'white', fontFamily: FONT,
        fontSize: 32, lineHeight: 1.3, padding: '12px 28px', borderRadius: 10, textAlign: 'center' }}>{cur}</div>
    </div>
  );
};

/* Music sits under the voice and lifts on the title cards. */
const musicVol = f => {
  const i = START.findLastIndex(s => s <= f), b = BEATS[i];
  const target = b.dash ? 0.1 : 0.32, lf = f - START[i];
  const p = BEATS[i - 1], from = !p ? 0 : p.dash ? 0.1 : 0.32;
  const end = interpolate(f, [TOTAL - 60, TOTAL], [1, 0], { extrapolateLeft: 'clamp' });
  return mix(from, target, Math.min(1, lf / 20)) * end;
};

/* The frame, within beat j, at which the voice reaches a phrase. */
const atFor = j => phrase => {
  const b = BEATS[j], i = b.t.toLowerCase().indexOf(phrase.toLowerCase());
  return (b.dash ? 4 : CARD_PAD) + (i < 0 ? 0 : (i / b.t.length) * b.seconds * FPS);
};

const SC = 0.68, SX = 50, SY = 120;
const Layout = ({ f, i }) => {
  const b = BEATS[i], lf = f - START[i], p = BEATS[i - 1], nx = BEATS[i + 1];
  const Side = SIDE[b.mg];
  const inK = p && p.dash ? 1 : interpolate(lf, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  const outK = nx && nx.dash ? 1 : interpolate(lf, [len(b) - 12, len(b)], [1, 0], { extrapolateLeft: 'clamp' });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 20% 10%, #1B3A63 0%, ${INK} 65%)`, opacity: Math.min(inK, outK) }}>
      <div style={{ position: 'absolute', left: SX, top: SY, width: W * SC, height: H * SC, borderRadius: 18, overflow: 'hidden',
        boxShadow: '0 30px 80px rgba(0,0,0,.45)', border: '1px solid rgba(255,255,255,.12)' }}>
        <div style={{ width: W, height: H, transform: `scale(${SC})`, transformOrigin: 'top left' }}><Stage f={f} /></div>
      </div>
      <div style={{ position: 'absolute', left: SX + W * SC + 34, top: SY, width: W - (SX + W * SC + 34) - 50, height: H * SC }}>
        {Side && <Side key={i} f={lf} n={len(b)} at={atFor(i)} />}
      </div>
      <Chip dash={b.dash} sec={b.sec} f={lf} fresh={!p || p.sec !== b.sec} />
      <Subtitle text={b.t} f={lf} n={len(b)} />
    </AbsoluteFill>
  );
};

export const Walkthrough = () => {
  const f = useCurrentFrame();
  const i = START.findLastIndex(s => s <= f), b = BEATS[i], lf = f - START[i];
  const Full = FULL[b.mg];
  const fade = Math.min(interpolate(lf, [0, 12], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(lf, [len(b) - 12, len(b)], [1, 0], { extrapolateLeft: 'clamp' }));
  return (
    <AbsoluteFill style={{ background: INK }}>
      {b.dash ? <Layout f={f} i={i} />
        : <AbsoluteFill style={{ opacity: fade }}><Full f={lf} n={len(b)} at={atFor(i)} /><Subtitle text={b.t} f={lf - CARD_PAD} n={len(b)} /></AbsoluteFill>}
      <Audio src={staticFile('music.mp3')} volume={musicVol} />
      {BEATS.map((b, j) => (
        <Sequence key={j} from={START[j] + (b.dash ? 4 : CARD_PAD)} durationInFrames={Math.ceil(b.seconds * FPS) + 2}>
          <Audio src={staticFile(`vo/${j}.wav`)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
