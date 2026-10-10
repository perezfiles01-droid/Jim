import { AbsoluteFill, Img, Sequence, interpolate, spring, staticFile,
  useCurrentFrame, useVideoConfig } from 'remotion';

const INK = '#10243E', BLUE = '#0072BC', TEAL = '#00A5A8';
const FONT = 'Segoe UI, Helvetica, Arial, sans-serif';

/* One scene per dashboard, in nav order. Captions describe what each
   dashboard is for; they carry no figures, so they cannot go stale. */
const SCENES = [
  ['bw', 'Bank-wide Oversight', 'Adoption and compliance across the whole Bank'],
  ['dp', 'Department Insights', 'How each department is using the EDRMS'],
  ['pj', 'Project Insights', 'Project sites and their records activity'],
  ['fp', 'Institutional File Plan', 'Content organised against the file plan'],
  ['rd', 'Retention & Disposal', 'Retention labels and what is due for disposal'],
  ['ra', 'Records & Archive Holdings', 'Physical and digital archive holdings'],
];
const TITLE = 90, SCENE = 150, OUTRO = 90;
export const TOTAL = TITLE + SCENES.length * SCENE + OUTRO;

const Card = ({ title, sub }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ background: INK, justifyContent: 'center', alignItems: 'center',
      fontFamily: FONT, color: 'white', opacity: s }}>
      <div style={{ fontSize: 96, fontWeight: 700, transform: `translateY(${(1 - s) * 40}px)` }}>{title}</div>
      <div style={{ width: 160 * s, height: 6, background: TEAL, margin: '32px 0' }} />
      <div style={{ fontSize: 40, color: '#9DB8D2' }}>{sub}</div>
    </AbsoluteFill>
  );
};

const Scene = ({ id, name, desc, n }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const zoom = interpolate(f, [0, SCENE], [1, 1.08]);
  const fade = interpolate(f, [0, 12, SCENE - 12, SCENE], [0, 1, 1, 0]);
  const slide = spring({ frame: f - 8, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ background: INK, opacity: fade }}>
      <Img src={staticFile(`${id}.png`)} style={{ width: '100%', transform: `scale(${zoom})`,
        transformOrigin: 'top left' }} />
      <div style={{ position: 'absolute', left: 60, bottom: 60, fontFamily: FONT,
        background: 'rgba(16,36,62,0.92)', color: 'white', padding: '28px 40px',
        borderLeft: `8px solid ${BLUE}`, borderRadius: 6,
        transform: `translateX(${(slide - 1) * 700}px)` }}>
        <div style={{ fontSize: 26, color: TEAL, fontWeight: 600 }}>Dashboard {n} of {SCENES.length}</div>
        <div style={{ fontSize: 56, fontWeight: 700 }}>{name}</div>
        <div style={{ fontSize: 30, color: '#C9D8E6' }}>{desc}</div>
      </div>
    </AbsoluteFill>
  );
};

export const Walkthrough = () => (
  <AbsoluteFill style={{ background: INK }}>
    <Sequence durationInFrames={TITLE}>
      <Card title="EDRMS Utilization Report" sub="Prototype walkthrough" />
    </Sequence>
    {SCENES.map(([id, name, desc], i) => (
      <Sequence key={id} from={TITLE + i * SCENE} durationInFrames={SCENE}>
        <Scene id={id} name={name} desc={desc} n={i + 1} />
      </Sequence>
    ))}
    <Sequence from={TITLE + SCENES.length * SCENE} durationInFrames={OUTRO}>
      <Card title="Live prototype" sub="perezfiles01-droid.github.io/Jim" />
    </Sequence>
  </AbsoluteFill>
);
