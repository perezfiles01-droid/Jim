import React from 'react';
/* Motion graphics, one per script line. Each scene gets the beat's local frame
   `f`, its length `n`, and `at(phrase)`, the frame at which the voice reaches
   that phrase, so every element lands on the word that names it. */
import { AbsoluteFill, interpolate, spring } from 'remotion';

export const INK = '#10243E', BLUE = '#0072BC', TEAL = '#00A5A8', ADB = '#194F8E',
  GREEN = '#3E9B3A', SOFT = '#9DB8D2', PAPER = '#C9A66B', RED = '#C8102E';
export const FONT = 'Segoe UI, Helvetica, Arial, sans-serif';
const FPS = 30;

const pop = (f, s, d = 14) => spring({ frame: f - s, fps: FPS, config: { damping: d, stiffness: 120 } });
const ease = (f, s, len = 20) => interpolate(f, [s, s + len], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
const In = ({ k, children, y = 30, style }) => (
  <div style={{ opacity: Math.min(1, k * 1.4), transform: `translateY(${(1 - k) * y}px) scale(${0.85 + 0.15 * k})`, ...style }}>{children}</div>
);

/* ---------- icons ---------- */
const Doc = ({ s = 90, c = BLUE, lock, paper }) => (
  <svg width={s} height={s * 1.2} viewBox="0 0 100 120">
    {paper && <rect x="18" y="14" width="74" height="96" rx="6" fill={PAPER} transform="rotate(8 55 62)" />}
    <path d="M10 6h55l25 25v83a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6V12a6 6 0 0 1 6-6z" fill="white" stroke={c} strokeWidth="5" />
    <path d="M65 6v25h25" fill="none" stroke={c} strokeWidth="5" />
    {[48, 62, 76, 90].map(y => <rect key={y} x="18" y={y} width={y === 90 ? 34 : 56} height="6" rx="3" fill={c} opacity=".35" />)}
    {lock && <g transform="translate(58 72)"><circle r="26" fill={GREEN} /><rect x="-11" y="-3" width="22" height="16" rx="3" fill="white" />
      <path d="M-7 -3v-6a7 7 0 0 1 14 0v6" stroke="white" strokeWidth="4" fill="none" /></g>}
  </svg>
);
const User = ({ s = 80, c = TEAL }) => (
  <svg width={s} height={s} viewBox="0 0 100 100"><circle cx="50" cy="32" r="20" fill={c} /><path d="M12 92c4-24 20-34 38-34s34 10 38 34z" fill={c} /></svg>
);
const Site = ({ s = 130, c = BLUE }) => (
  <svg width={s} height={s * 0.78} viewBox="0 0 130 100"><rect x="3" y="3" width="124" height="94" rx="10" fill="white" stroke={c} strokeWidth="5" />
    <rect x="3" y="3" width="124" height="22" rx="10" fill={c} />{[12, 22, 32].map(x => <circle key={x} cx={x} cy="14" r="3.5" fill="white" />)}
    <rect x="16" y="38" width="44" height="46" rx="5" fill={c} opacity=".25" /><rect x="70" y="40" width="44" height="7" rx="3" fill={c} opacity=".4" />
    <rect x="70" y="56" width="36" height="7" rx="3" fill={c} opacity=".4" /><rect x="70" y="72" width="40" height="7" rx="3" fill={c} opacity=".4" /></svg>
);
const DB = ({ s = 100, c = ADB }) => (
  <svg width={s} height={s * 1.15} viewBox="0 0 100 115">
    <path d="M8 18v80c0 9 19 15 42 15s42-6 42-15V18" fill={c} />
    {[45, 72].map(y => <path key={y} d={`M8 ${y}c0 9 19 15 42 15s42-6 42-15`} fill="none" stroke="white" strokeWidth="3" opacity=".5" />)}
    <ellipse cx="50" cy="18" rx="42" ry="15" fill="#3C74B8" /></svg>
);
const Mail = ({ s = 100, c = BLUE }) => (
  <svg width={s} height={s * 0.72} viewBox="0 0 100 72"><rect x="3" y="3" width="94" height="66" rx="8" fill="white" stroke={c} strokeWidth="5" />
    <path d="M6 8l44 34 44-34" fill="none" stroke={c} strokeWidth="5" /></svg>
);
const Bank = ({ s = 110, c = 'white' }) => (
  <svg width={s} height={s} viewBox="0 0 100 100"><path d="M50 6L6 28h88z" fill={c} />{[16, 34, 52, 70].map(x => <rect key={x} x={x} y="34" width="12" height="42" fill={c} />)}
    <rect x="6" y="80" width="88" height="12" fill={c} /></svg>
);
const Cal = ({ s = 70, c = BLUE }) => (
  <svg width={s} height={s} viewBox="0 0 100 100"><rect x="6" y="14" width="88" height="80" rx="10" fill="white" stroke={c} strokeWidth="5" />
    <rect x="6" y="14" width="88" height="22" rx="10" fill={c} /><rect x="24" y="4" width="8" height="20" rx="4" fill={c} /><rect x="68" y="4" width="8" height="20" rx="4" fill={c} />
    {[0, 1, 2, 3].map(i => [0, 1, 2].map(j => <rect key={i + '' + j} x={18 + i * 18} y={46 + j * 15} width="11" height="9" rx="2" fill={c} opacity={i === 2 && j === 1 ? 1 : .3} />))}</svg>
);
const Badge = ({ label, c, s = 120 }) => (
  <svg width={s} height={s * 1.2} viewBox="0 0 100 120"><path d="M10 4h58l26 26v82a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6V10a6 6 0 0 1 6-6z" fill="white" stroke={c} strokeWidth="5" />
    <rect x="-2" y="56" width="74" height="38" rx="6" fill={c} /><text x="35" y="83" fill="white" fontSize="24" fontWeight="800" textAnchor="middle" fontFamily={FONT}>{label}</text></svg>
);
const Cursor = ({ x, y, click = 0 }) => (
  <div style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none' }}>
    {click > 0 && click < 1 && <div style={{ position: 'absolute', left: -30 * click, top: -30 * click, width: 60 * click, height: 60 * click,
      borderRadius: '50%', border: `4px solid ${TEAL}`, opacity: 1 - click }} />}
    <svg width="40" height="48" viewBox="0 0 40 48"><path d="M3 3l0 38 10-10 7 15 7-3-7-15h14z" fill="white" stroke={INK} strokeWidth="3" strokeLinejoin="round" /></svg>
  </div>
);
const Arrow = ({ w = 120, k = 1, c = SOFT, label }) => (
  <div style={{ position: 'relative', width: w, height: 60, display: 'flex', alignItems: 'center' }}>
    <svg width={w} height="24" viewBox={`0 0 ${w} 24`}><line x1="0" y1="12" x2={(w - 14) * k} y2="12" stroke={c} strokeWidth="5" strokeDasharray="10 8" />
      {k > 0.95 && <path d={`M${w - 16} 2l14 10-14 10z`} fill={c} />}</svg>
    {label && <div style={{ position: 'absolute', top: -22, left: 0, right: 0, textAlign: 'center', fontSize: 20, color: SOFT, opacity: k }}>{label}</div>}
  </div>
);
const Pill = ({ children, bg = 'rgba(255,255,255,0.1)', c = 'white', style }) => (
  <div style={{ background: bg, color: c, borderRadius: 999, padding: '10px 22px', fontSize: 24, fontWeight: 600, whiteSpace: 'nowrap', ...style }}>{children}</div>
);
const Label = ({ children, size = 26, c = 'white', w = 600 }) => <div style={{ fontSize: size, color: c, fontWeight: w, textAlign: 'center' }}>{children}</div>;

/* ---------- full screen scenes ---------- */
const Full = ({ children }) => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 30% 20%, #1B3A63 0%, ${INK} 60%)`, fontFamily: FONT, color: 'white' }}>{children}</AbsoluteFill>
);
const Dots = ({ f }) => (
  <AbsoluteFill style={{ opacity: 0.12 }}>
    <svg width="1920" height="1080">{Array.from({ length: 60 }, (_, i) => {
      const x = (i * 337) % 1920, y = ((i * 191) % 1080 + f * (0.3 + (i % 5) * 0.15)) % 1080;
      return <circle key={i} cx={x} cy={y} r={2 + (i % 3)} fill={TEAL} />;
    })}</svg>
  </AbsoluteFill>
);

const Intro = ({ f, at }) => {
  const t = pop(f, 0, 200), r = pop(f, at('Release'), 12), clock = ease(f, at('four minutes'), 60);
  return (<Full><Dots f={f} />
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', gap: 34 }}>
      <div style={{ display: 'flex', gap: 28, alignItems: 'center', transform: `translateY(${(1 - t) * 40}px)`, opacity: t }}>
        <Doc s={110} lock /><div style={{ fontSize: 96, fontWeight: 800, letterSpacing: -1 }}>EDRMS Utilization Report</div>
      </div>
      <div style={{ width: 900 * t, height: 6, background: TEAL, borderRadius: 3 }} />
      <div style={{ display: 'flex', gap: 30, alignItems: 'center' }}>
        <In k={r}><Pill bg={ADB} style={{ fontSize: 40, padding: '14px 36px' }}>Release 2026.4</Pill></In>
        <In k={pop(f, at('four minutes'))}>
          <div style={{ position: 'relative', width: 110, height: 110 }}>
            <svg width="110" height="110"><circle cx="55" cy="55" r="46" stroke="rgba(255,255,255,.15)" strokeWidth="10" fill="none" />
              <circle cx="55" cy="55" r="46" stroke={TEAL} strokeWidth="10" fill="none" strokeLinecap="round"
                strokeDasharray={289} strokeDashoffset={289 * (1 - clock)} transform="rotate(-90 55 55)" /></svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 800 }}>4 min</div>
          </div>
        </In>
        <In k={pop(f, at('how to read'))}><Pill>Bank-wide Oversight · Department Insights</Pill></In>
      </div>
    </AbsoluteFill></Full>);
};

const Context = ({ f, at }) => {
  const u = pop(f, 0), up = ease(f, at('upload'), 25), site = pop(f, at('SharePoint')), dec = pop(f, at('declare them'), 10),
    mail = pop(f, at('emails')), mailA = ease(f, at('saved in'), 25), db = pop(f, at('database')), dbA = ease(f, at('database') - 10, 25);
  const qs = [['Are users uploading?', at('Are users uploading')], ['Are they declaring?', at('Are they declaring')], ['Which departments need support?', at('which departments')]];
  return (<Full><Dots f={f} />
    <div style={{ position: 'absolute', left: 120, top: 250, right: 120, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <In k={u}><div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}><User s={110} /><Label>Users</Label></div></In>
      <Arrow w={170} k={up} label="upload" />
      <In k={site}><div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, position: 'relative' }}>
        <Site s={190} /><Label>EDRMS SharePoint site</Label>
        <div style={{ position: 'absolute', left: 120, top: -40, transform: `scale(${dec})` }}><Doc s={80} lock /></div>
        <div style={{ position: 'absolute', top: -80, left: 0, right: 0, opacity: dec }}><Label c={GREEN} size={24}>declared as a record</Label></div>
      </div></In>
      <Arrow w={170} k={dbA} label="kept in" />
      <In k={db}><div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}><DB s={120} /><Label>EDRMS database</Label></div></In>
    </div>
    <div style={{ position: 'absolute', left: 300, top: 560, display: 'flex', alignItems: 'center', gap: 20 }}>
      <In k={mail}><div style={{ display: 'flex', alignItems: 'center', gap: 16 }}><Mail s={110} /><div><Label size={30}>Outlook</Label><Label size={22} c={SOFT}>emails declared as records</Label></div></div></In>
      <svg width="260" height="140" style={{ opacity: mail }}><path d="M10 110 C120 110 160 60 250 10" stroke={SOFT} strokeWidth="5" fill="none" strokeDasharray="10 8"
        strokeDashoffset={0} pathLength="1" style={{ strokeDasharray: `${mailA} 1` }} /></svg>
    </div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 800, display: 'flex', justifyContent: 'center', gap: 28 }}>
      {qs.map(([q, s]) => <In key={q} k={pop(f, s)}><Pill bg="rgba(0,165,168,0.18)" style={{ fontSize: 30, border: `2px solid ${TEAL}` }}>{q}</Pill></In>)}
    </div>
  </Full>);
};

const DEPTS = ['ITD', 'SARD', 'FIN', 'HRD', 'EARD', 'OGC', 'CWRD', 'BRM'];
const Scope = ({ f, at }) => {
  const a = pop(f, at('Bank-wide')), b = pop(f, at('Department Insights')), ch = at('departments you choose');
  return (<Full><Dots f={f} />
    <AbsoluteFill style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 80, paddingBottom: 120 }}>
      <In k={a} y={80}><div style={{ width: 640, height: 460, borderRadius: 24, background: ADB, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, boxShadow: '0 30px 80px rgba(0,0,0,.35)' }}>
        <Bank s={150} /><Label size={44} w={800}>Bank-wide Oversight</Label><Pill>The whole Bank</Pill></div></In>
      <In k={b} y={80}><div style={{ width: 640, height: 460, borderRadius: 24, background: 'white', color: INK, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, boxShadow: '0 30px 80px rgba(0,0,0,.35)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, width: 480, justifyContent: 'center' }}>
          {DEPTS.map((d, i) => { const on = pop(f, ch + i * 4) > 0.5 && i % 3 !== 2;
            return <div key={d} style={{ padding: '10px 18px', borderRadius: 10, fontSize: 24, fontWeight: 700, border: `3px solid ${BLUE}`,
              background: on ? BLUE : 'white', color: on ? 'white' : BLUE }}>{on ? '✓ ' : ''}{d}</div>; })}
        </div>
        <Label size={44} w={800} c={INK}>Department Insights</Label><Pill bg="rgba(0,114,188,.12)" c={BLUE}>The departments you choose</Pill></div></In>
    </AbsoluteFill></Full>);
};

const Terms = ({ f, at }) => {
  const items = [['Document', 'Any file saved in EDRMS', <Doc s={130} />, at('A document')],
    ['Record', "Declared as the Bank's official version", <Doc s={130} lock />, at('A record')],
    ['Physical counterpart', 'A record that also exists on paper', <Doc s={130} lock paper />, at('physical counterpart is')]];
  return (<Full><Dots f={f} />
    <div style={{ position: 'absolute', top: 110, left: 0, right: 0, opacity: pop(f, 0) }}><Label size={56} w={800}>Three words to know</Label></div>
    <AbsoluteFill style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 60, paddingBottom: 60 }}>
      {items.map(([t, s, ic, st], i) => { const k = pop(f, st, 12);
        return <div key={t} style={{ width: 460, height: 470, borderRadius: 24, background: 'white', color: INK, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 22, opacity: k, transform: `perspective(900px) rotateY(${(1 - k) * 90}deg)`, boxShadow: '0 30px 80px rgba(0,0,0,.35)' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: TEAL }}>{i + 1}</div>{ic}
          <div style={{ fontSize: 40, fontWeight: 800 }}>{t}</div><div style={{ fontSize: 26, color: '#4A5D75', width: 360, textAlign: 'center' }}>{s}</div></div>; })}
    </AbsoluteFill></Full>);
};

const Demo = ({ f, at }) => {
  const s = pop(f, 6, 9), k = ease(f, 0, 30), sub = pop(f, at('They show'));
  return (<Full><Dots f={f} />
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: 760, height: 380, background: 'white', borderRadius: 20, padding: 40, boxSizing: 'border-box', display: 'flex', alignItems: 'flex-end', gap: 26, opacity: k, filter: 'grayscale(.4)' }}>
        {[0.4, 0.55, 0.5, 0.7, 0.65, 0.85, 0.95].map((h, i) => <div key={i} style={{ flex: 1, height: `${h * 100 * ease(f, 4 + i * 3, 20)}%`, background: GREEN, borderRadius: 6, opacity: .6 }} />)}
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%,-50%) rotate(-12deg) scale(${3 - 2 * s})`, opacity: Math.min(1, s * 2),
          border: `10px solid ${RED}`, color: RED, borderRadius: 18, padding: '14px 44px', fontSize: 96, fontWeight: 900, letterSpacing: 6, background: 'rgba(255,255,255,.85)' }}>DEMO DATA</div>
      </div>
      <In k={sub} style={{ marginTop: 50 }}><Label size={38}>Shows how the report works, not actual EDRMS usage</Label></In>
    </AbsoluteFill></Full>);
};

const Outro = ({ f, at }) => {
  const a = pop(f, 0), b = pop(f, at('Department Insights')), c = pop(f, at('Click any card')), d = pop(f, at('check the date')), t = pop(f, at('Thanks'), 12);
  return (<Full><Dots f={f} />
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', gap: 50 }}>
      <div style={{ display: 'flex', gap: 40 }}>
        <In k={a}><Pill bg={ADB} style={{ fontSize: 36, padding: '22px 40px' }}>Bank-wide Oversight</Pill></In>
        <In k={b}><Pill bg="white" c={INK} style={{ fontSize: 36, padding: '22px 40px' }}>Department Insights</Pill></In>
      </div>
      <div style={{ display: 'flex', gap: 40 }}>
        <In k={c}><Pill style={{ fontSize: 30, border: `2px solid ${TEAL}` }}>👆 Click any card</Pill></In>
        <In k={d}><Pill style={{ fontSize: 30, border: `2px solid ${TEAL}` }}>📅 Check the data as of date</Pill></In>
      </div>
      <div style={{ fontSize: 110, fontWeight: 800, opacity: t, transform: `scale(${0.7 + 0.3 * t})`, marginTop: 30 }}>Thanks for watching</div>
      <div style={{ width: 600 * t, height: 6, background: TEAL, borderRadius: 3 }} />
    </AbsoluteFill></Full>);
};

/* ---------- side panel scenes (beside the dashboard) ---------- */
const Panel = ({ title, children, f }) => (
  <div style={{ width: '100%', height: '100%', borderRadius: 22, background: 'linear-gradient(160deg,#173458,#0E1F36)', border: '1px solid rgba(255,255,255,.1)',
    boxShadow: '0 30px 70px rgba(0,0,0,.4)', fontFamily: FONT, color: 'white', padding: 34, boxSizing: 'border-box', position: 'relative', overflow: 'hidden' }}>
    <div style={{ fontSize: 22, color: TEAL, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', opacity: ease(f, 0, 12) }}>{title}</div>
    <div style={{ position: 'absolute', left: 34, right: 34, top: 90, bottom: 34, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22 }}>{children}</div>
  </div>
);
const Row = ({ k, icon, text, sub, hi }) => (
  <In k={k} y={20}><div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '14px 18px', borderRadius: 14,
    background: hi ? 'rgba(62,155,58,.25)' : 'rgba(255,255,255,.06)', border: hi ? `2px solid ${GREEN}` : '2px solid transparent' }}>
    <div style={{ width: 64, display: 'flex', justifyContent: 'center' }}>{icon}</div>
    <div><div style={{ fontSize: 28, fontWeight: 700 }}>{text}</div>{sub && <div style={{ fontSize: 20, color: SOFT }}>{sub}</div>}</div></div></In>
);
const Bar = ({ label, v, k, c = BLUE, val }) => (
  <div><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 22, marginBottom: 6 }}><span>{label}</span><span style={{ color: SOFT }}>{val}</span></div>
    <div style={{ height: 22, borderRadius: 11, background: 'rgba(255,255,255,.08)' }}><div style={{ width: `${v * k * 100}%`, height: '100%', borderRadius: 11, background: c }} /></div></div>
);

/* The four headline cards, shared by the two Bank-wide opening lines so they
   stay on screen across both. Each card lights up when the voice names it. */
const HEAD = [['Active EDRMS sites', '1,032', <Site s={44} />, 'Active'], ['EDRMS users', '11,800', <User s={40} />, 'E D R M S users'],
  ['Documents in EDRMS', '3.47M', <Doc s={32} />, 'Documents'], ['Records declared', '21,646', <Doc s={32} lock />, 'records declared']];
const HeadGrid = ({ f, at, enter, live }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
    {HEAD.map(([l, v, ic, ph], i) => {
      const k = enter ? pop(f, 8 + i * 4, 14) : 1, on = live && f >= at(ph);
      const nxt = live && i < 3 ? f >= at(HEAD[i + 1][3]) : false, hot = on && !nxt;
      const star = live && i === 3 && f >= at('matters most');
      return <In key={l} k={k} y={20}><div style={{ height: 112, borderRadius: 14, background: 'white', color: INK, padding: '12px 14px', boxSizing: 'border-box',
        borderLeft: `8px solid ${star ? GREEN : TEAL}`, boxShadow: hot || star ? `0 0 0 4px ${star ? GREEN : TEAL}, 0 10px 30px rgba(0,165,168,.45)` : 'none',
        transform: `scale(${hot ? 1.05 : 1})`, opacity: live && !on ? 0.55 : 1, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 46 }}>{ic}<div style={{ fontSize: 17, fontWeight: 700, color: '#4A5D75', lineHeight: 1.1 }}>{l}</div></div>
        <div style={{ fontSize: 34, fontWeight: 800, marginTop: 4 }}>{v}</div>
        {star && <div style={{ position: 'absolute', top: -14, right: -8, background: GREEN, color: 'white', fontSize: 15, fontWeight: 800, borderRadius: 999, padding: '4px 10px' }}>★ Matters most</div>}
      </div></In>;
    })}
  </div>
);
const BwIntro = ({ f, at }) => (
  <Panel title="Bank-wide Oversight" f={f}>
    <In k={pop(f, 0)}><div style={{ display: 'flex', justifyContent: 'center' }}><Bank s={110} /></div></In>
    <In k={pop(f, 4)}><Label size={30} w={800}>The whole Bank, one page</Label></In>
    <HeadGrid f={f} at={at} enter />
    <In k={pop(f, at('four cards'))}><Label size={26} c={TEAL}>4 headline cards</Label></In>
  </Panel>
);
const Cards = ({ f, at }) => {
  const cur = [...HEAD].reverse().find(h => f >= at(h[3]));
  return (<Panel title="Bank-wide Oversight" f={99}>
    <div style={{ display: 'flex', justifyContent: 'center' }}><Bank s={110} /></div>
    <Label size={30} w={800}>The whole Bank, one page</Label>
    <HeadGrid f={f} at={at} live />
    <Label size={26} c={TEAL}>{cur ? cur[0] : '4 headline cards'}</Label>
  </Panel>);
};
const Click = ({ f, at }) => {
  const mv = ease(f, 4, 22), clk = ease(f, at('Click one'), 14), open = pop(f, at('breakdown opens'), 16), rate = pop(f, at('declaration rate'), 12);
  const users = at('users card');
  return (<Panel title="Every card is clickable" f={f}>
    <div style={{ position: 'relative', height: 90 }}>
      <div style={{ height: 90, borderRadius: 14, background: 'white', color: INK, display: 'flex', alignItems: 'center', padding: '0 22px', gap: 14,
        boxShadow: clk > 0 ? `0 0 0 ${4}px ${TEAL}` : 'none' }}><User s={46} /><div style={{ fontSize: 26, fontWeight: 700 }}>EDRMS users</div>
        <div style={{ marginLeft: 'auto', fontSize: 18, color: BLUE }}>View breakdown ›</div></div>
      <Cursor x={interpolate(mv, [0, 1], [380, 300])} y={interpolate(mv, [0, 1], [130, 45])} click={clk} />
    </div>
    <div style={{ overflow: 'hidden', maxHeight: 260 * open, display: 'flex', flexDirection: 'column', gap: 14, padding: '6px 4px' }}>
      <Bar label="Active, last 180 days" v={0.72} k={ease(f, users, 25)} c={TEAL} />
      <Bar label="No access" v={0.28} k={ease(f, at('no access'), 25)} c={SOFT} />
      <Bar label="Completed training" v={0.55} k={ease(f, at('completed training'), 25)} c={GREEN} />
    </div>
    <In k={rate}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, fontSize: 28, fontWeight: 700, background: 'rgba(255,255,255,.06)', borderRadius: 14, padding: 18 }}>
      <Doc s={34} lock /> Records <span style={{ color: TEAL }}>÷</span> <Doc s={34} /> Documents <span style={{ color: TEAL }}>=</span> Rate</div></In>
  </Panel>);
};
const Physical = ({ f, at }) => {
  const k = ease(f, 6, 40), share = 0.177, C = 2 * Math.PI * 90;
  return (<Panel title="Physical counterparts" f={f}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 26, justifyContent: 'center' }}>
      <svg width="230" height="230" viewBox="0 0 230 230"><circle cx="115" cy="115" r="90" stroke="#B9D4EE" strokeWidth="38" fill="none" />
        <circle cx="115" cy="115" r="90" stroke={BLUE} strokeWidth="38" fill="none" strokeDasharray={`${C * share * k} ${C}`} transform="rotate(-90 115 115)" />
        <text x="115" y="125" textAnchor="middle" fill="white" fontSize="34" fontWeight="800" fontFamily={FONT}>{Math.round(share * 1000 * k) / 10}%</text></svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}><In k={pop(f, at('paper version'))}><Doc s={70} lock paper /></In><Label size={22} c={SOFT}>also on paper</Label></div>
    </div>
    {['FIN', 'ITD', 'HRD'].map((d, i) => <Bar key={d} label={d} v={[0.24, 0.18, 0.16][i] / 0.25} k={ease(f, at('department by department') + i * 6, 20)} c={PAPER} val={['24%', '18%', '16%'][i]} />)}
  </Panel>);
};
const Compare = ({ f, at }) => {
  const h = at('headcount'), d = at('documents or records');
  return (<Panel title="Comparison" f={f}>
    <div style={{ display: 'flex', gap: 20, fontSize: 22 }}><span style={{ color: GREEN }}>■ Headcount</span><span style={{ color: BLUE }}>■ Documents or records</span></div>
    {[['ITD', 1, 1], ['SARD', .86, .81], ['FIN', .79, .47], ['HRD', .57, .32], ['OGC', .43, .16]].map(([n, a, b], i) => (
      <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 14 }}><div style={{ width: 70, fontSize: 24, fontWeight: 700 }}>{n}</div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ height: 18, width: `${a * 100 * ease(f, h + i * 4, 20)}%`, background: GREEN, borderRadius: 9 }} />
          <div style={{ height: 18, width: `${b * 100 * ease(f, d + i * 4, 20)}%`, background: BLUE, borderRadius: 9 }} /></div></div>))}
    <In k={pop(f, at('matches its size'))}><Label size={28} c={TEAL}>Is use in proportion to size?</Label></In>
  </Panel>);
};
const Trend = ({ f, at }) => {
  const vals = [0.35, 0.4, 0.45, 0.5, 0.48, 0.6, 0.66, 0.7, 0.73, 0.72, 0.82, 0.9], line = ease(f, at('running total'), 50);
  const presets = ['3M', '6M', '12M', 'YTD', 'All'], ps = at('preset'), pi = Math.max(0, Math.min(4, Math.floor((f - ps) / 8)));
  let cum = 0; const pts = vals.map((v, i) => { cum += v; return [20 + i * 34, 250 - (cum / 7.1) * 220]; });
  return (<Panel title="Records declaration trend" f={f}>
    <svg width="430" height="270" viewBox="0 0 430 270">
      {vals.map((v, i) => <rect key={i} x={8 + i * 34} y={250 - v * 120 * ease(f, 4 + i * 2, 15)} width="24" height={v * 120 * ease(f, 4 + i * 2, 15)} rx="4" fill={GREEN} />)}
      <polyline points={pts.map(p => p.join(',')).join(' ')} fill="none" stroke="#5FB4F0" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" pathLength="1"
        style={{ strokeDasharray: `${line} 1` }} />
    </svg>
    <div style={{ display: 'flex', gap: 10, opacity: ease(f, ps, 12) }}>{presets.map((p, i) => <Pill key={p} bg={f >= ps && i === pi ? TEAL : 'rgba(255,255,255,.08)'} style={{ fontSize: 20, padding: '8px 16px' }}>{p}</Pill>)}</div>
    <In k={pop(f, at('rising line'))}><Label size={28} c={TEAL}>↗ Rising line = adoption taking hold</Label></In>
  </Panel>);
};
const DpIntro = ({ f, at }) => {
  const m = ease(f, 6, 40);
  return (<Panel title="Department Insights" f={f}>
    <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
      {DEPTS.map((d, i) => { const on = f > at('departments you choose') + i * 3 && i % 3 !== 2;
        return <div key={d} style={{ padding: '10px 16px', borderRadius: 10, fontSize: 22, fontWeight: 700, border: `3px solid ${on ? TEAL : 'rgba(255,255,255,.25)'}`,
          background: on ? TEAL : 'transparent' }}>{d}</div>; })}
      <svg width="120" height="120" viewBox="0 0 120 120" style={{ position: 'absolute', left: interpolate(m, [0, 1], [-20, 300]), top: 10 + Math.sin(m * 6) * 20 }}>
        <circle cx="48" cy="48" r="34" stroke="white" strokeWidth="9" fill="rgba(255,255,255,.12)" /><line x1="74" y1="74" x2="108" y2="108" stroke="white" strokeWidth="12" strokeLinecap="round" /></svg>
    </div>
    <In k={pop(f, at('closer look'))}><Label size={34} w={800}>A closer look at the departments you choose</Label></In>
  </Panel>);
};
const Profile = ({ f, at }) => {
  const opts = [['One department', at('one department')], ['Several', at('several')], ['All of them', at('all of them')]];
  return (<Panel title="Department profile" f={f}>
    <div style={{ background: 'white', color: INK, borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 20, color: '#4A5D75' }}>Department / Office / RM / RO ▾</div>
      {opts.map(([o, s]) => <div key={o} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, fontWeight: 600, opacity: ease(f, s - 6, 10) }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, border: `3px solid ${BLUE}`, background: f > s ? BLUE : 'white', color: 'white', fontSize: 20, textAlign: 'center', lineHeight: '24px' }}>{f > s ? '✓' : ''}</div>{o}</div>)}
    </div>
    <Row k={pop(f, at('went live'))} icon={<Cal s={54} />} text="Go-Live date" />
    <Row k={pop(f, at('naming convention'))} icon={<div style={{ fontSize: 44 }}>🔗</div>} text="Site naming convention" />
    <Row k={pop(f, at('Site filter'))} icon={<svg width="50" height="50" viewBox="0 0 50 50"><path d="M4 6h42L29 26v16l-8 4V26z" fill={TEAL} /></svg>} text="Site filter" sub="Narrow to the sites you choose" />
  </Panel>);
};
const Five = ({ f, at }) => {
  const icons = [[<Site s={58} />, 'Sites'], [<User s={52} />, 'Visitors'], [<Doc s={40} />, 'Docs'], [<Doc s={40} lock />, 'Records'], [<Doc s={40} lock paper />, 'Paper']];
  const st = at('Sites,'), vs = at('Site visitors shows');
  return (<Panel title="Five cards" f={f}>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>{icons.map(([ic, l], i) => <In key={l} k={pop(f, st + i * 9, 11)} y={-30}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: 80 }}><div style={{ height: 66, display: 'flex', alignItems: 'center' }}>{ic}</div><div style={{ fontSize: 16, fontWeight: 700 }}>{l}</div></div></In>)}</div>
    <In k={pop(f, at('site by site'))}><div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{['ITD Records Site', 'ITD Advisory Site', 'ITD Archive Site'].map((s, i) =>
      <div key={s} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 22, padding: '10px 16px', borderRadius: 10, background: 'rgba(255,255,255,.06)', opacity: ease(f, at('owner') + i * 5, 12) }}>
        <span>{s}</span><span style={{ color: SOFT }}>owner · created</span></div>)}</div></In>
    <In k={pop(f, vs)}><div style={{ display: 'flex', gap: 8, justifyContent: 'center', transform: 'scale(.82)' }}>
      <Pill bg="rgba(0,165,168,.25)" style={{ opacity: ease(f, at('internal users'), 10) }}>Internal users</Pill>
      <Pill bg="rgba(201,166,107,.3)" style={{ opacity: ease(f, at('external guests'), 10) }}>External guests</Pill>
      <Pill bg={BLUE} style={{ opacity: ease(f, at('ten most'), 10) }}>Top 10</Pill></div></In>
  </Panel>);
};
const Library = ({ f, at }) => {
  const deep = at('one level deeper'), nodes = [['Department', <Bank s={46} c={TEAL} />], ['Site', <Site s={60} />], ['Library', <svg width="56" height="50" viewBox="0 0 56 50"><rect x="2" y="8" width="52" height="40" rx="6" fill={PAPER} /><path d="M2 14V6a4 4 0 0 1 4-4h14l6 6" fill={PAPER} /></svg>]];
  return (<Panel title="Library usage" f={f}>
    {nodes.map(([l, ic], i) => <div key={l} style={{ marginLeft: i * 60 }}>
      <In k={pop(f, deep + i * 10)}><div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 28, fontWeight: 700 }}>
        {i > 0 && <div style={{ width: 28, height: 40, borderLeft: `4px solid ${SOFT}`, borderBottom: `4px solid ${SOFT}`, marginTop: -40, borderBottomLeftRadius: 10 }} />}{ic}{l}</div></In></div>)}
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>{['Documents', 'Records', 'Active users'].map((m, i) =>
      <In key={m} k={pop(f, at('showing documents') + i * 6)}><Pill bg="rgba(255,255,255,.1)">{m}</Pill></In>)}</div>
    <In k={pop(f, at('really used'))}><Label size={28} c={TEAL}>Which libraries are really used for recordkeeping?</Label></In>
  </Panel>);
};
const Export = ({ f, at }) => {
  const x = pop(f, at('Excel'), 12), p = pop(f, at('PDF'), 12), c = pop(f, at('data as of'), 10);
  const pulse = 1 + 0.06 * Math.sin(Math.max(0, f - at('data as of')) / 4);
  return (<Panel title="Export and data date" f={f}>
    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: 220 }}>
      <div style={{ transform: `translateY(${(1 - x) * 120}px) rotate(${(1 - x) * -20}deg)`, opacity: x, textAlign: 'center' }}><Badge label="XLSX" c="#1D7A45" /><Label size={22}>Every table</Label></div>
      <div style={{ transform: `translateY(${(1 - p) * 120}px) rotate(${(1 - p) * 20}deg)`, opacity: p, textAlign: 'center' }}><Badge label="PDF" c={RED} /><Label size={22}>Every dashboard</Label></div>
    </div>
    <In k={c}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, background: 'white', color: INK, borderRadius: 16, padding: '18px 22px', transform: `scale(${pulse})` }}>
      <Cal s={60} /><div><div style={{ fontSize: 20, color: '#4A5D75' }}>● Data as of</div><div style={{ fontSize: 34, fontWeight: 800 }}>Check before you quote</div></div></div></In>
  </Panel>);
};

export const FULL = { intro: Intro, context: Context, scope: Scope, terms: Terms, demo: Demo, outro: Outro };
export const SIDE = { bwIntro: BwIntro, cards: Cards, click: Click, physical: Physical, compare: Compare, trend: Trend,
  dpIntro: DpIntro, profile: Profile, five: Five, library: Library, export: Export };
