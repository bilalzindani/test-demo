import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Check, Package, ShoppingBag, Stethoscope, UtensilsCrossed, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { C, F, archivo } from "../lib/theme";
import { ease, lerp, sp, springs, tw } from "../lib/motion";
import { IND } from "../lib/timeline";
import { ValueOpening } from "./ValueOpening";

// 05 — Built for your industry. Four panels slam in from four edges, each
// with its own micro-animation, beat-synced highlights, then a staggered 3D
// card flip whose back faces assemble the next scene's first frame.

const M = 24;
const G = 16;
const PW = (1920 - 2 * M - G) / 2;
const PH = (1080 - 2 * M - G) / 2;
const POS = [
  { x: M, y: M },
  { x: M + PW + G, y: M },
  { x: M, y: M + PH + G },
  { x: M + PW + G, y: M + PH + G },
];
const FROM = [
  { x: -1100, y: 0, r: -8 },
  { x: 0, y: -700, r: 6 },
  { x: 0, y: 700, r: -6 },
  { x: 1100, y: 0, r: 8 },
];

type Theme = { bg: string; fg: string; dim: string; accent: string; accentFg: string };
const THEMES: Theme[] = [
  { bg: C.ink3, fg: C.paper, dim: C.paperDim, accent: C.lime, accentFg: C.ink },
  { bg: C.lime, fg: C.ink, dim: "rgba(7,8,12,0.66)", accent: C.ink, accentFg: C.lime },
  { bg: C.violet, fg: C.paper, dim: "rgba(243,241,234,0.78)", accent: C.lime, accentFg: C.ink },
  { bg: C.paper, fg: C.ink, dim: "rgba(7,8,12,0.62)", accent: C.violet, accentFg: C.paper },
];
const PANELS: { idx: string; name: string; Icon: LucideIcon; desc: string }[] = [
  { idx: "01", name: "Healthcare", Icon: Stethoscope, desc: "Appointment scheduling, follow-ups & patient FAQs." },
  { idx: "02", name: "Restaurants", Icon: UtensilsCrossed, desc: "Reservations, updates, cancellations & menu questions." },
  { idx: "03", name: "E-commerce", Icon: ShoppingBag, desc: "Order tracking, returns, upsells & cart recovery." },
  { idx: "04", name: "Home Services", Icon: Wrench, desc: "Quote requests, job booking & reminders." },
];

// ── micro-animations ────────────────────────────────────────────────
const Ecg: React.FC<{ f: number; t: Theme }> = ({ f, t }) => {
  const W = 380;
  const pts: string[] = [];
  for (let x = 0; x <= W; x += 3) {
    const u = (((x + f * 7) % 190) + 190) % 190;
    let y = 0;
    if (u > 60 && u < 72) y = -Math.sin(((u - 60) / 12) * Math.PI) * 14;
    else if (u > 82 && u < 88) y = ((u - 82) / 6) * 20;
    else if (u >= 88 && u < 96) y = 20 - ((u - 88) / 8) * 110;
    else if (u >= 96 && u < 104) y = -90 + ((u - 96) / 8) * 120;
    else if (u >= 104 && u < 110) y = 30 - ((u - 104) / 6) * 30;
    else if (u > 126 && u < 146) y = -Math.sin(((u - 126) / 20) * Math.PI) * 22;
    pts.push(`${x},${110 + y}`);
  }
  return (
    <div style={{ position: "absolute", right: 48, top: 70, width: W }}>
      <svg width={W} height={200} style={{ maskImage: "linear-gradient(90deg, transparent, black 20%, black 80%, transparent)" }}>
        <polyline points={pts.join(" ")} fill="none" stroke={t.accent} strokeWidth={4} strokeLinejoin="round" />
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 6, alignItems: "flex-end" }}>
        <Chip t={t} f={f} at={40} text="HIPAA-conscious" />
        <Chip t={t} f={f} at={52} text="Reminder sent · Tue 9:30" solid />
      </div>
    </div>
  );
};

const Chip: React.FC<{ t: Theme; f: number; at: number; text: string; solid?: boolean }> = ({ t, f, at, text, solid }) => {
  const s = sp(f, springs.pop, at);
  return (
    <div
      style={{
        padding: "10px 16px",
        borderRadius: 999,
        border: `2px solid ${t.accent}`,
        background: solid ? t.accent : "transparent",
        color: solid ? t.accentFg : t.accent,
        fontFamily: F.ui,
        fontSize: 19,
        fontWeight: 650,
        whiteSpace: "nowrap",
        transform: `scale(${s})`,
        opacity: f >= at ? 1 : 0,
      }}
    >
      {text}
    </div>
  );
};

const Reservations: React.FC<{ f: number; t: Theme }> = ({ f, t }) => (
  <div style={{ position: "absolute", right: 44, top: 56, width: 330, display: "flex", flexDirection: "column", gap: 12 }}>
    {[
      ["7:00 PM", "Party of 6", 40],
      ["7:30 PM", "Party of 2", 58],
      ["8:15 PM", "Party of 4", 76],
      ["8:45 PM", "Birthday · 8", 94],
    ].map(([time, who, at]) => {
      const p = tw(f, [at as number, (at as number) + 12], [0, 1], ease.expoOut);
      const ck = sp(f, springs.pop, (at as number) + 8);
      return (
        <div
          key={time as string}
          style={{
            height: 62,
            borderRadius: 18,
            background: "rgba(7,8,12,0.9)",
            display: "flex",
            alignItems: "center",
            padding: "0 18px",
            gap: 16,
            opacity: p,
            transform: `translateX(${(1 - p) * 60}px)`,
          }}
        >
          <div style={{ fontFamily: F.mono, fontSize: 19, color: C.lime, fontWeight: 700, width: 96 }}>{time}</div>
          <div style={{ fontFamily: F.ui, fontSize: 21, color: C.paper, flex: 1 }}>{who}</div>
          <div style={{ width: 34, height: 34, borderRadius: 17, background: C.lime, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${ck})` }}>
            <Check size={20} color={C.ink} strokeWidth={3.2} />
          </div>
        </div>
      );
    })}
  </div>
);

const Tracker: React.FC<{ f: number; t: Theme }> = ({ f, t }) => {
  const p = tw(f, [40, 128], [0, 1], ease.inOut);
  const W = 360;
  const steps = ["Ordered", "Packed", "Shipped", "Delivered"];
  return (
    <div style={{ position: "absolute", right: 58, top: 96, width: W }}>
      <div style={{ position: "relative", height: 90 }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 58, height: 6, borderRadius: 3, background: "rgba(243,241,234,0.25)" }} />
        <div style={{ position: "absolute", left: 0, width: W * p, top: 58, height: 6, borderRadius: 3, background: C.lime }} />
        {steps.map((s, i) => {
          const at = i / 3;
          const on = p >= at - 0.001;
          return <div key={s} style={{ position: "absolute", left: at * W - 11, top: 50, width: 22, height: 22, borderRadius: 11, background: on ? C.lime : C.violet, border: `3px solid ${on ? C.lime : "rgba(243,241,234,0.5)"}` }} />;
        })}
        <div style={{ position: "absolute", left: p * W - 24, top: 0, width: 48, height: 42, borderRadius: 12, background: C.paper, display: "flex", alignItems: "center", justifyContent: "center", transform: `translateY(${-Math.abs(Math.sin(f * 0.5)) * 4}px)` }}>
          <Package size={26} color={C.violet} strokeWidth={2.4} />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: F.mono, fontSize: 14, color: t.dim, marginTop: 6, letterSpacing: "0.06em" }}>
        {steps.map((s) => (
          <span key={s}>{s.toUpperCase()}</span>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 26 }}>
        <Chip t={t} f={f} at={100} text="Cart recovered · $248" solid />
      </div>
    </div>
  );
};

const gearPath = (r: number, teeth: number, depth: number) => {
  const pts: string[] = [];
  for (let i = 0; i < teeth * 4; i++) {
    const a = (i / (teeth * 4)) * Math.PI * 2;
    const rr = i % 4 < 2 ? r : r - depth;
    pts.push(`${Math.cos(a) * rr},${Math.sin(a) * rr}`);
  }
  return `M ${pts.join(" L ")} Z`;
};
const G1 = gearPath(78, 12, 16);
const G2 = gearPath(52, 8, 14);

const Gears: React.FC<{ f: number; t: Theme }> = ({ f, t }) => {
  const a = f * 2.4;
  return (
    <div style={{ position: "absolute", right: 48, top: 44, width: 380, height: 380 }}>
      <svg width={380} height={220}>
        <g transform={`translate(150 110) rotate(${a})`}>
          <path d={G1} fill={t.accent} />
          <circle r={24} fill={THEMES[3].bg} />
        </g>
        <g transform={`translate(262 70) rotate(${-a * 1.5 + 11})`}>
          <path d={G2} fill={t.fg} />
          <circle r={16} fill={THEMES[3].bg} />
        </g>
      </svg>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
        <Chip t={t} f={f} at={60} text="Job booked · Thu 10 AM" solid />
      </div>
    </div>
  );
};

const MOTIFS = [Ecg, Reservations, Tracker, Gears];

// ── scene ───────────────────────────────────────────────────────────
export const Industries: React.FC = () => {
  const f = useCurrentFrame();
  const close = tw(f, IND.close, [0, 1], ease.inOut);
  const badge = sp(f, springs.bouncy, 30) * (1 - tw(f, [IND.flip[0] - 6, IND.flip[0] + 2], [0, 1], ease.in));
  const beatIdx = IND.beats.reduce((acc, b, i) => (f >= b ? i : acc), -1);
  const order = [0, 1, 3, 2]; // clockwise

  return (
    <AbsoluteFill>
      {POS.map((pos, i) => {
        const t = THEMES[i];
        const P = PANELS[i];
        const Motif = MOTIFS[i];
        const inP = tw(f, [IND.land[i] - 18, IND.land[i]], [0, 1], ease.expoOut);
        const settle = sp(f, springs.bouncy, IND.land[i]);
        const pulse = beatIdx >= 0 && order[beatIdx % 4] === i ? Math.exp(-(f - IND.beats[beatIdx]) / 7) : 0;
        const flipP = tw(f, [IND.flip[i], IND.flip[i] + IND.flipDur], [0, 1], ease.inOut);
        // rect grows to close the gutters after the flip
        // 1px overlap at the seams so the closed grid is a single clean field
        const x = lerp(pos.x, pos.x === M ? 0 : 959, close);
        const y = lerp(pos.y, pos.y === M ? 0 : 539, close);
        const w = lerp(PW, 961, close);
        const h = lerp(PH, 541, close);
        const radius = lerp(30, 0, close);
        const iconDraw = tw(f, [IND.land[i] + 2, IND.land[i] + 30], [0, 1], ease.out);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: w,
              height: h,
              perspective: 2400,
              transform: `translate(${(1 - inP) * FROM[i].x}px, ${(1 - inP) * FROM[i].y}px) rotate(${(1 - inP) * FROM[i].r}deg) scale(${(1 + 0.02 * pulse) * lerp(0.97, 1, settle)})`,
            }}
          >
            <div style={{ position: "relative", width: "100%", height: "100%", transformStyle: "preserve-3d", transform: `rotateY(${flipP * 180}deg)` }}>
              {/* front */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: radius,
                  background: t.bg,
                  overflow: "hidden",
                  backfaceVisibility: "hidden",
                  boxShadow: pulse > 0.05 ? `inset 0 0 0 ${3 * pulse + 1}px ${t.accent}` : "inset 0 0 0 1px rgba(243,241,234,0.08)",
                }}
              >
                <div style={{ position: "absolute", left: 48, top: 40, fontFamily: F.mono, fontSize: 18, fontWeight: 700, letterSpacing: "0.22em", color: t.dim }}>
                  {P.idx} / INDUSTRY
                </div>
                <div style={{ position: "absolute", left: 44, top: 96 }}>
                  <P.Icon size={104} color={t.accent === C.ink ? C.ink : t.accent} strokeWidth={1.6} style={{ strokeDasharray: 100, strokeDashoffset: 100 * (1 - iconDraw) }} />
                </div>
                <div
                  style={{
                    position: "absolute",
                    left: 46,
                    top: 250,
                    fontFamily: F.display,
                    fontVariationSettings: archivo(800, 100),
                    fontSize: 70,
                    letterSpacing: "-0.035em",
                    color: t.fg,
                    lineHeight: 1,
                  }}
                >
                  {P.name}
                </div>
                <div style={{ position: "absolute", left: 48, top: 350, width: 420, fontFamily: F.ui, fontSize: 26, lineHeight: 1.4, color: t.dim }}>{P.desc}</div>
                <Motif f={f} t={t} />
              </div>
              {/* back: slice of the next scene's first frame */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: radius,
                  overflow: "hidden",
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                {flipP > 0.3 && (
                  <div style={{ position: "absolute", left: -x, top: -y, width: 1920, height: 1080 }}>
                    <ValueOpening f={0} />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* centre badge with circular type */}
      {badge > 0.01 && (
        <div style={{ position: "absolute", left: 960 - 118, top: 540 - 118, width: 236, height: 236, transform: `scale(${badge})` }}>
          <svg width={236} height={236} viewBox="-118 -118 236 236">
            <circle r={116} fill={C.ink} stroke={C.lime} strokeWidth={3} />
            <defs>
              <path id="badge-ring" d="M 0 -84 A 84 84 0 1 1 -0.01 -84" />
            </defs>
            <g transform={`rotate(${f * 1.6})`}>
              <text style={{ fontFamily: F.mono, fontSize: 17, fontWeight: 700, letterSpacing: "0.26em" }} fill={C.paper}>
                <textPath href="#badge-ring">BUILT FOR YOUR INDUSTRY ✦ BUILT FOR YOUR INDUSTRY ✦</textPath>
              </text>
            </g>
            <circle r={18 + 6 * Math.exp(-(((f % 15) + 15) % 15) / 4)} fill={C.lime} />
          </svg>
        </div>
      )}
    </AbsoluteFill>
  );
};
