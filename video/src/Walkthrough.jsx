import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile,
  useCurrentFrame, useVideoConfig } from 'remotion';
import SCENES from './scenes.gen.json';

const INK = '#10243E', BLUE = '#0072BC', TEAL = '#00A5A8';
const FONT = 'Segoe UI, Helvetica, Arial, sans-serif';
const FPS = 30, PAD = 24, BAR = 120, AREA = 1080 - BAR;

/* Each scene lasts as long as its voiceover plus a short pause either side. */
const frames = s => Math.ceil(s.seconds * FPS) + 2 * PAD;
const starts = SCENES.reduce((a, s, i) => [...a, i ? a[i - 1] + frames(SCENES[i - 1]) : 0], []);
export const TOTAL = starts.at(-1) + frames(SCENES.at(-1));

const Card = ({ title, sub }) => {
  const s = spring({ frame: useCurrentFrame(), fps: FPS, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ background: INK, justifyContent: 'center', alignItems: 'center',
      fontFamily: FONT, color: 'white', opacity: s }}>
      <div style={{ fontSize: 96, fontWeight: 700, transform: `translateY(${(1 - s) * 40}px)` }}>{title}</div>
      <div style={{ width: 160 * s, height: 6, background: TEAL, margin: '32px 0' }} />
      <div style={{ fontSize: 40, color: '#9DB8D2' }}>{sub}</div>
    </AbsoluteFill>
  );
};

/* Frames one section of the full-page screenshot: fits it to the area under
   the title bar, dims everything else, and drifts slowly through it. */
const Section = ({ s, len }) => {
  const f = useCurrentFrame();
  const { top, bottom } = s.crop, h = bottom - top + 32;
  const scale = Math.min(1, AREA / h);
  const overflow = Math.max(0, h * scale - AREA);
  const drift = interpolate(f, [PAD, len - PAD], [0, overflow + 12], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const y = BAR + 24 - (top - 16) * scale - drift;
  const fade = interpolate(f, [0, 10, len - 10, len], [0, 1, 1, 0]);
  return (
    <AbsoluteFill style={{ background: '#E9EEF4', opacity: fade, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: (1920 - 1920 * scale) / 2, top: y,
        transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <Img src={staticFile(`${s.dash}.png`)} style={{ display: 'block', width: 1920 }} />
        <div style={{ position: 'absolute', left: 245, right: 4, top: top - 8, height: h - 16,
          boxShadow: '0 0 0 4000px rgba(16,36,62,0.55)', border: `4px solid ${TEAL}`, borderRadius: 10 }} />
      </div>
      <div style={{ position: 'absolute', inset: '0 0 auto 0', height: BAR, background: INK,
        display: 'flex', alignItems: 'center', padding: '0 60px', fontFamily: FONT, color: 'white' }}>
        <div style={{ width: 8, height: 64, background: BLUE, marginRight: 28 }} />
        <div>
          <div style={{ fontSize: 24, color: TEAL, fontWeight: 600 }}>
            {s.dash === 'bw' ? 'Bank-wide Oversight' : 'Department Insights'}</div>
          <div style={{ fontSize: 44, fontWeight: 700 }}>{s.title.split(': ').at(-1).replace(/^./, c => c.toUpperCase())}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Walkthrough = () => (
  <AbsoluteFill style={{ background: INK }}>
    {SCENES.map((s, i) => (
      <Sequence key={s.id} from={starts[i]} durationInFrames={frames(s)}>
        {s.dash ? <Section s={s} len={frames(s)} />
          : <Card title={s.title} sub={s.id === 'intro'
              ? 'Bank-wide Oversight and Department Insights' : 'perezfiles01-droid.github.io/Jim'} />}
        <Sequence from={PAD}><Audio src={staticFile(`vo/${s.id}.wav`)} /></Sequence>
      </Sequence>
    ))}
  </AbsoluteFill>
);
