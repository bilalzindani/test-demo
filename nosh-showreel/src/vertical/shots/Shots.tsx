import React from "react";
import { random } from "remotion";
import { noise2D } from "@remotion/noise";

// Procedural "footage": animated vector shots (viewBox 1600×900, 16:9) that
// the edit can cut, grade, reframe and diffuse. `t` = frames since shot start.
export type ShotName = "dunes" | "city" | "ocean" | "peaks" | "astro" | "creator";

const W = 1600;
const H = 900;

const ridge = (seed: string, baseY: number, amp: number, width = 3400, n = 9) => {
  const pts = Array.from({ length: n + 1 }, (_, i) => ({
    x: -200 + (i / n) * width,
    y: baseY + (random(`${seed}${i}`) - 0.5) * 2 * amp,
  }));
  let d = `M ${pts[0].x} ${H + 40} L ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < n; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const mx = (a.x + b.x) / 2;
    d += ` C ${mx} ${a.y} ${mx} ${b.y} ${b.x} ${b.y}`;
  }
  return d + ` L ${pts[n].x} ${H + 40} Z`;
};
const jagged = (seed: string, baseY: number, amp: number, n = 22) => {
  let d = `M -50 ${H + 40}`;
  for (let i = 0; i <= n; i++) {
    const x = -50 + (i / n) * (W + 100);
    const y = baseY - (i % 2 === 0 ? random(`${seed}${i}`) * amp : random(`${seed}${i}`) * amp * 0.35);
    d += ` L ${x} ${y}`;
  }
  return d + ` L ${W + 50} ${H + 40} Z`;
};

const Stars: React.FC<{ t: number; count: number; maxY: number; seed: string }> = ({ t, count, maxY, seed }) => (
  <g>
    {Array.from({ length: count }).map((_, i) => {
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.05 + random(`${seed}p${i}`) * 6.28));
      return <circle key={i} cx={random(`${seed}x${i}`) * W} cy={random(`${seed}y${i}`) * maxY} r={0.8 + random(`${seed}r${i}`) * 1.8} fill="#EFEAFF" opacity={tw * 0.9} />;
    })}
  </g>
);

const Dust: React.FC<{ t: number; count: number; seed: string; color?: string; dir?: number }> = ({ t, count, seed, color = "#F3E8FF", dir = -1 }) => (
  <g>
    {Array.from({ length: count }).map((_, i) => {
      const x = (((random(`${seed}dx${i}`) * W + dir * t * (0.6 + random(`${seed}dv${i}`) * 1.4)) % W) + W) % W;
      const y = 380 + random(`${seed}dy${i}`) * 520 + Math.sin(t * 0.03 + i) * 6;
      return <circle key={i} cx={x} cy={y} r={1 + random(`${seed}ds${i}`) * 2.2} fill={color} opacity={0.18 + random(`${seed}do${i}`) * 0.35} />;
    })}
  </g>
);

const Dunes: React.FC<{ t: number }> = ({ t }) => {
  const sunY = 540 + t * 0.07;
  return (
    <g>
      <defs>
        <linearGradient id="dn-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#120626" />
          <stop offset="0.45" stopColor="#3E1A7E" />
          <stop offset="0.78" stopColor="#A04FD0" />
          <stop offset="1" stopColor="#F2B6E6" />
        </linearGradient>
        <radialGradient id="dn-glow">
          <stop offset="0" stopColor="#FFE9F7" stopOpacity="0.95" />
          <stop offset="0.35" stopColor="#F5A8E8" stopOpacity="0.45" />
          <stop offset="1" stopColor="#F5A8E8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#dn-sky)" />
      <circle cx={1080} cy={sunY} r={330} fill="url(#dn-glow)" />
      <circle cx={1080} cy={sunY} r={104} fill="#FFEAF7" />
      <path d={ridge("dnf", 610, 40)} fill="#4A2080" transform={`translate(${-t * 0.18} 0)`} />
      <path d={ridge("dnm", 690, 55)} fill="#2C1257" transform={`translate(${-t * 0.4} 0)`} />
      <path d={ridge("dnn", 790, 60)} fill="#150830" transform={`translate(${-t * 0.8} 0)`} />
      <Dust t={t} count={40} seed="dn" />
    </g>
  );
};

const City: React.FC<{ t: number }> = ({ t }) => {
  const layers = [
    { seed: "cf", y: 560, hMin: 120, hMax: 300, fill: "#2A1850", win: 0 },
    { seed: "cm", y: 700, hMin: 180, hMax: 420, fill: "#170C2E", win: 0.28 },
    { seed: "cn", y: 900, hMin: 240, hMax: 560, fill: "#0A0514", win: 0.34 },
  ];
  return (
    <g>
      <defs>
        <linearGradient id="ct-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#06030E" />
          <stop offset="0.55" stopColor="#1C0B38" />
          <stop offset="1" stopColor="#4A2388" />
        </linearGradient>
        <linearGradient id="ct-haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8B5CF6" stopOpacity="0" />
          <stop offset="0.6" stopColor="#8B5CF6" stopOpacity="0.35" />
          <stop offset="1" stopColor="#8B5CF6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ct-trail" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#C4B5FD" stopOpacity="0" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="1" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#ct-sky)" />
      <Stars t={t} count={50} maxY={380} seed="cts" />
      <circle cx={1330} cy={160} r={46} fill="#EDE7FF" opacity={0.95} />
      <circle cx={1350} cy={148} r={42} fill="#140A2A" />
      <rect y={420} width={W} height={260} fill="url(#ct-haze)" />
      {layers.map((L, li) => {
        const shift = -t * (0.08 + li * 0.14);
        let x = -120;
        const blds: React.ReactNode[] = [];
        let k = 0;
        while (x < W + 200) {
          const w = 60 + random(`${L.seed}w${k}`) * 130;
          const h = L.hMin + random(`${L.seed}h${k}`) * (L.hMax - L.hMin);
          const top = L.y - h;
          blds.push(<rect key={`b${k}`} x={x} y={top} width={w} height={h + 400} fill={L.fill} />);
          if (L.win > 0) {
            for (let wy = top + 18; wy < L.y - 10; wy += 30) {
              for (let wx = x + 12; wx < x + w - 14; wx += 22) {
                const r = random(`${L.seed}${k}-${wx}-${wy}`);
                if (r < L.win) {
                  const flick = random(`${L.seed}fl${k}-${wx}-${wy}-${Math.floor(t / 24)}`) < 0.06 ? 0.25 : 1;
                  blds.push(<rect key={`w${k}-${wx}-${wy}`} x={wx} y={wy} width={9} height={14} fill={r < L.win * 0.3 ? "#FFFFFF" : r < L.win * 0.65 ? "#C4B5FD" : "#8B5CF6"} opacity={0.85 * flick} />);
                }
              }
            }
          }
          x += w + 6 + random(`${L.seed}g${k}`) * 14;
          k++;
        }
        return (
          <g key={li} transform={`translate(${shift} 0)`}>
            {blds}
          </g>
        );
      })}
      {Array.from({ length: 7 }).map((_, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        const sp = 9 + random(`tr${i}`) * 8;
        const x = ((((random(`trx${i}`) * 2200 + dir * t * sp) % 2200) + 2200) % 2200) - 300;
        const y = 842 + (i % 3) * 16;
        return <rect key={i} x={x} y={y} width={260} height={4} fill="url(#ct-trail)" transform={dir < 0 ? `rotate(180 ${x + 130} ${y + 2})` : undefined} opacity={0.9} />;
      })}
    </g>
  );
};

const Ocean: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <defs>
      <linearGradient id="oc-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#170A30" />
        <stop offset="0.6" stopColor="#6A2FB8" />
        <stop offset="1" stopColor="#F4A6DA" />
      </linearGradient>
      <linearGradient id="oc-sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#4B2084" />
        <stop offset="1" stopColor="#0C0520" />
      </linearGradient>
      <radialGradient id="oc-glow">
        <stop offset="0" stopColor="#FFE3F4" stopOpacity="0.9" />
        <stop offset="1" stopColor="#F4A6DA" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width={W} height={540} fill="url(#oc-sky)" />
    <circle cx={800} cy={520} r={300} fill="url(#oc-glow)" />
    <circle cx={800} cy={500} r={92} fill="#FFE7F5" />
    <rect y={520} width={W} height={380} fill="url(#oc-sea)" />
    {Array.from({ length: 26 }).map((_, i) => {
      const y = 532 + i * 14;
      const w = (150 - i * 3.5) * (0.6 + 0.4 * Math.abs(Math.sin(t * 0.09 + i * 1.7)));
      return <rect key={i} x={800 - w / 2 + Math.sin(t * 0.07 + i) * 8} y={y} width={Math.max(8, w)} height={4} rx={2} fill="#FFD9F2" opacity={0.85 - i * 0.028} />;
    })}
    {Array.from({ length: 7 }).map((_, i) => {
      const y = 580 + i * 48;
      let d = `M -40 ${y}`;
      for (let x = -40; x <= W + 40; x += 40) d += ` L ${x} ${y + Math.sin(x * 0.012 + t * 0.06 + i) * (4 + i * 1.5)}`;
      return <path key={i} d={d} fill="none" stroke="#C4B5FD" strokeOpacity={0.18} strokeWidth={2} />;
    })}
  </g>
);

const Peaks: React.FC<{ t: number }> = ({ t }) => {
  let aur = "M -50 260";
  for (let x = -50; x <= W + 50; x += 50) aur += ` L ${x} ${230 + Math.sin(x * 0.006 + t * 0.02) * 60 + Math.sin(x * 0.017 - t * 0.03) * 20}`;
  return (
    <g>
      <defs>
        <linearGradient id="pk-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#04020B" />
          <stop offset="0.6" stopColor="#1D0D3D" />
          <stop offset="1" stopColor="#3B1D72" />
        </linearGradient>
        <linearGradient id="pk-aur" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C4B5FD" stopOpacity="0" />
          <stop offset="0.5" stopColor="#A78BFA" stopOpacity="0.55" />
          <stop offset="1" stopColor="#8B5CF6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="pk-mist" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8B5CF6" stopOpacity="0" />
          <stop offset="1" stopColor="#8B5CF6" stopOpacity="0.28" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#pk-sky)" />
      <Stars t={t} count={120} maxY={560} seed="pks" />
      <path d={aur} fill="none" stroke="url(#pk-aur)" strokeWidth={120} strokeLinecap="round" opacity={0.8} />
      <path d={jagged("pkf", 560, 260)} fill="#2B1650" transform={`translate(${-t * 0.1} 0)`} />
      <rect y={480} width={W} height={200} fill="url(#pk-mist)" />
      <path d={jagged("pkm", 680, 240, 16)} fill="#1A0C33" transform={`translate(${-t * 0.25} 0)`} />
      <path d={jagged("pkn", 800, 200, 12)} fill="#0B0517" transform={`translate(${-t * 0.5} 0)`} />
    </g>
  );
};

const Astronaut: React.FC<{ x: number; y: number; t: number; s?: number }> = ({ x, y, t, s = 1 }) => {
  const ph = t * 0.2;
  const leg = Math.sin(ph) * 24;
  const arm = -Math.sin(ph) * 20;
  const bob = Math.abs(Math.cos(ph)) * -4;
  const suit = "#ECE8F7";
  const shade = "#B9B0D6";
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
      <ellipse cx={-70} cy={4} rx={120} ry={10} fill="#05020B" opacity={0.45} />
      {/* back leg / arm */}
      <g transform={`rotate(${-leg} 0 -70)`}>
        <rect x={-13} y={-72} width={26} height={74} rx={12} fill={shade} />
      </g>
      <g transform={`rotate(${-arm} 0 -150)`}>
        <rect x={-10} y={-150} width={20} height={64} rx={10} fill={shade} />
      </g>
      {/* backpack + torso */}
      <rect x={-52} y={-176} width={34} height={78} rx={10} fill={shade} />
      <rect x={-30} y={-178} width={62} height={112} rx={24} fill={suit} />
      <rect x={-20} y={-150} width={30} height={16} rx={4} fill="#8B5CF6" opacity={0.85} />
      {/* helmet */}
      <circle cx={2} cy={-202} r={34} fill={suit} />
      <path d="M -6 -214 Q 22 -222 30 -200 Q 26 -182 4 -184 Q -8 -196 -6 -214 Z" fill="#241438" />
      <path d="M 6 -212 Q 20 -214 25 -204" fill="none" stroke="#C4B5FD" strokeWidth={4} strokeLinecap="round" />
      {/* front leg / arm */}
      <g transform={`rotate(${leg} 0 -70)`}>
        <rect x={-13} y={-72} width={26} height={74} rx={12} fill={suit} />
        <rect x={-15} y={-8} width={34} height={14} rx={6} fill={shade} />
      </g>
      <g transform={`rotate(${arm} 0 -150)`}>
        <rect x={-10} y={-150} width={20} height={64} rx={10} fill={suit} />
      </g>
      {/* rim light */}
      <path d="M 32 -170 Q 36 -120 30 -80" fill="none" stroke="#C4B5FD" strokeWidth={3} opacity={0.8} />
    </g>
  );
};

const Astro: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <defs>
      <linearGradient id="as-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#07020F" />
        <stop offset="0.6" stopColor="#1E0C3E" />
        <stop offset="1" stopColor="#5A2AA6" />
      </linearGradient>
      <radialGradient id="as-moon" cx="0.4" cy="0.35">
        <stop offset="0" stopColor="#F6F2FF" />
        <stop offset="1" stopColor="#B8A5EE" />
      </radialGradient>
      <radialGradient id="as-halo">
        <stop offset="0" stopColor="#C4B5FD" stopOpacity="0.35" />
        <stop offset="1" stopColor="#C4B5FD" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width={W} height={H} fill="url(#as-sky)" />
    <Stars t={t} count={110} maxY={600} seed="ass" />
    <circle cx={470} cy={260 + t * 0.03} r={330} fill="url(#as-halo)" />
    <circle cx={470} cy={260 + t * 0.03} r={150} fill="url(#as-moon)" />
    {[
      [420, 220, 22],
      [520, 300, 15],
      [455, 330, 10],
      [540, 210, 9],
    ].map(([cx, cy, r], i) => (
      <circle key={i} cx={cx} cy={cy + t * 0.03} r={r} fill="#A796DD" opacity={0.45} />
    ))}
    <circle cx={1190} cy={170} r={52} fill="#8B5CF6" />
    <circle cx={1206} cy={160} r={48} fill="#1B0B35" opacity={0.55} />
    <path d={ridge("asf", 640, 35)} fill="#2A134F" transform={`translate(${-t * 0.12} 0)`} />
    <path d={ridge("asm", 720, 40)} fill="#1A0B35" transform={`translate(${-t * 0.3} 0)`} />
    <Astronaut x={540 + t * 1.1} y={742} t={t} s={1.05} />
    <path d={ridge("asn", 830, 42)} fill="#0C0519" transform={`translate(${-t * 0.7} 0)`} />
    <Dust t={t} count={50} seed="as" />
  </g>
);

// Four AI "talents" for UGC variants: skin, hair, hoodie and room colours.
const LOOKS = [
  { skin: "#C98E6E", shade: "#AE7456", hair: "#1C1028", hoodA: "#A78BFA", hoodB: "#7C4DDE", roomA: "#2A1545", roomB: "#120A22" },
  { skin: "#8D5A3B", shade: "#744629", hair: "#120A12", hoodA: "#F0A5D8", hoodB: "#C2549E", roomA: "#3A1438", roomB: "#16091A" },
  { skin: "#EBC2A2", shade: "#D1A283", hair: "#6B3A1E", hoodA: "#8FA2FF", hoodB: "#4C5BD6", roomA: "#16183F", roomB: "#0A0B22" },
  { skin: "#B07A55", shade: "#95613F", hair: "#2B1B12", hoodA: "#C4B5FD", hoodB: "#8B5CF6", roomA: "#241438", roomB: "#0E0818" },
];

// UGC creator avatar — flat illustration, lip-synced to `amp`, blinking.
const Creator: React.FC<{ t: number; amp: number; product: number; subjectX: number; look: number }> = ({ t, amp, product, subjectX, look }) => {
  const x = subjectX;
  const lk = LOOKS[look % LOOKS.length];
  const id = (s: string) => `${s}-${look}`;
  const blink = t % 84 > 80 ? 0.1 : 1;
  const tilt = Math.sin(t * 0.07) * 2.4 + noise2D("cr", t * 0.03, 0) * 1.5;
  const nod = amp * 6;
  const skin = lk.skin;
  const skinShade = lk.shade;
  const hair = lk.hair;
  return (
    <g>
      <defs>
        <linearGradient id={id("cr-room")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={lk.roomA} />
          <stop offset="1" stopColor={lk.roomB} />
        </linearGradient>
        <radialGradient id={id("cr-bokeh")}>
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("cr-hoodie")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={lk.hoodA} />
          <stop offset="1" stopColor={lk.hoodB} />
        </linearGradient>
        <linearGradient id={id("cr-bottle")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5B35B0" />
          <stop offset="0.45" stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#4A2A94" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id("cr-room")})`} />
      <rect y={0} width={W} height={10} fill="#8B5CF6" opacity={0.9} />
      <rect y={10} width={W} height={120} fill="#8B5CF6" opacity={0.08} />
      {[
        [220, 260, 90, "#A78BFA"],
        [1380, 220, 120, "#F0A5D8"],
        [1240, 520, 70, "#FFC98A"],
        [330, 620, 60, "#8B5CF6"],
        [1480, 700, 90, "#C4B5FD"],
      ].map(([cx, cy, r, c], i) => (
        <g key={i} opacity={0.5 + 0.2 * Math.sin(t * 0.05 + i)}>
          <circle cx={cx as number} cy={cy as number} r={r as number} fill={c as string} opacity={0.35} />
          <circle cx={cx as number} cy={cy as number} r={(r as number) * 1.6} fill={`url(#${id("cr-bokeh")})`} opacity={0.25} />
        </g>
      ))}
      <rect x={120} y={430} width={300} height={10} rx={5} fill="#3B2360" />
      <path d="M 170 430 q 20 -90 60 -110 q -10 60 -30 110 Z M 230 430 q 30 -60 80 -70 q -30 40 -50 70 Z" fill="#2E1A4A" />
      {/* torso */}
      <g transform={`translate(${x} 0)`}>
        <path d="M -270 900 C -260 690 -180 612 -64 596 L 64 596 C 180 612 260 690 270 900 Z" fill={`url(#${id("cr-hoodie")})`} />
        <path d="M -40 616 L -30 740 M 40 616 L 30 740" stroke="#EDE7FF" strokeWidth={6} strokeLinecap="round" />
        <path d="M -74 598 Q 0 668 74 598" fill="none" stroke={lk.hoodB} strokeWidth={14} />
        {/* neck */}
        <rect x={-40} y={512} width={80} height={96} rx={30} fill={skinShade} />
        {/* head */}
        <g transform={`rotate(${tilt} 0 560) translate(0 ${nod})`}>
          <ellipse cx={-104} cy={420} rx={18} ry={28} fill={skinShade} />
          <ellipse cx={104} cy={420} rx={18} ry={28} fill={skinShade} />
          <circle cx={-104} cy={452} r={6} fill="#C4B5FD" />
          <ellipse cx={0} cy={410} rx={104} ry={128} fill={skin} />
          <path d="M -112 390 C -130 250 -40 230 0 232 C 60 230 140 262 114 396 C 100 330 60 300 10 300 C -40 300 -86 330 -112 390 Z" fill={hair} />
          <path d="M -116 400 C -140 470 -128 540 -104 560 L -96 420 Z M 116 400 C 140 470 128 540 104 560 L 96 420 Z" fill={hair} />
          <ellipse cx={-40} cy={400} rx={10} ry={13 * blink} fill={hair} />
          <ellipse cx={40} cy={400} rx={10} ry={13 * blink} fill={hair} />
          <path d={`M -62 ${372 - amp * 6} q 22 -10 44 0 M 18 ${372 - amp * 6} q 22 -10 44 0`} stroke={hair} strokeWidth={7} strokeLinecap="round" fill="none" />
          <path d="M -4 420 q 8 26 -6 34" stroke={skinShade} strokeWidth={5} fill="none" strokeLinecap="round" />
          <circle cx={-66} cy={446} r={16} fill="#F28FB0" opacity={0.3} />
          <circle cx={66} cy={446} r={16} fill="#F28FB0" opacity={0.3} />
          <ellipse cx={0} cy={478} rx={26 + amp * 4} ry={5 + amp * 15} fill="#5A1E3A" />
          <rect x={-16} y={473 - amp * 11} width={32} height={amp > 0.2 ? 6 : 0} rx={3} fill="#FFFFFF" opacity={0.9} />
        </g>
      </g>
      {/* hand + product */}
      {product > 0 && (
        <g transform={`translate(${x + 190} ${560 + (1 - product) * 460}) rotate(${-8 + (1 - product) * 20})`}>
          <rect x={-46} y={-190} width={92} height={210} rx={26} fill={`url(#${id("cr-bottle")})`} />
          <rect x={-24} y={-230} width={48} height={48} rx={8} fill="#EDE7FF" />
          <rect x={-34} y={-120} width={68} height={70} rx={10} fill="#EDE7FF" opacity={0.95} />
          <text x={0} y={-78} textAnchor="middle" style={{ fontFamily: "Archivo", fontWeight: 900, fontSize: 22 }} fill="#5B35B0">
            GLOW
          </text>
          <path d="M -60 0 C -70 -40 -40 -70 -10 -60 L 60 -40 C 80 -30 70 20 40 30 L -40 40 Z" fill={skin} />
        </g>
      )}
    </g>
  );
};

export const LOG_FILTER = "saturate(0.3) contrast(0.68) brightness(1.14) sepia(0.12)";

export const Shot: React.FC<{
  name: ShotName;
  t: number;
  style?: React.CSSProperties;
  filter?: string;
  amp?: number;
  product?: number;
  subjectX?: number;
  zoom?: number;
  focusX?: number;
  focusY?: number;
  look?: number;
}> = ({ name, t, style, filter, amp = 0, product = 0, subjectX = 800, zoom = 1, focusX = 800, focusY = 450, look = 0 }) => (
  <svg
    viewBox={`${focusX - W / 2 / zoom} ${focusY - H / 2 / zoom} ${W / zoom} ${H / zoom}`}
    preserveAspectRatio="xMidYMid slice"
    style={{ width: "100%", height: "100%", display: "block", filter, ...style }}
  >
    {name === "dunes" && <Dunes t={t} />}
    {name === "city" && <City t={t} />}
    {name === "ocean" && <Ocean t={t} />}
    {name === "peaks" && <Peaks t={t} />}
    {name === "astro" && <Astro t={t} />}
    {name === "creator" && <Creator t={t} amp={amp} product={product} subjectX={subjectX} look={look} />}
  </svg>
);
