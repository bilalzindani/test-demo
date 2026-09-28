import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import { C, F, archivo } from "../lib/theme";
import { ease, lerp, sp, tw } from "../lib/motion";
import { CHAOS } from "../lib/timeline";
import { scramble } from "../lib/text";
import { NOTIF_H, NOTIF_W, NotifCard } from "../components/NotifCard";
import { planCards } from "./chaosData";

// 00 — The problem. Camera pulls back from the missed call to reveal the
// backlog flooding in. Beat-synced kinetic words, escalating shake, glitch
// slices, then everything implodes into a single lime dot.

const PLANS = planCards(CHAOS.spawns);
const WORDS = [
  { text: "MISSED CALLS", size: 176, mode: "rise" },
  { text: "SLOW REPLIES", size: 150, mode: "stretch" },
  { text: "LOST LEADS", size: 176, mode: "drop" },
  { text: "MANUAL EVERYTHING", size: 138, mode: "glitch" },
] as const;

const Word: React.FC<{ f: number }> = ({ f }) => {
  let k = -1;
  CHAOS.words.forEach((w, i) => {
    if (f >= w) k = i;
  });
  if (k < 0) return null;
  const lf = f - CHAOS.words[k];
  const w = WORDS[k];
  const chars = (w.text + ".").split("");
  const n = chars.length;
  const base: React.CSSProperties = {
    fontFamily: F.display,
    fontSize: w.size,
    lineHeight: 1,
    letterSpacing: "-0.03em",
    color: C.paper,
    whiteSpace: "pre",
  };
  const period = (i: number) => (i === n - 1 ? C.coral : undefined);

  if (w.mode === "rise") {
    return (
      <div style={{ ...base, fontVariationSettings: archivo(900, 100), display: "flex", overflow: "hidden", paddingBottom: 8 }}>
        {chars.map((ch, i) => (
          <span key={i} style={{ display: "inline-block", color: period(i), transform: `translateY(${tw(lf - i * 1.1, [0, 12], [108, 0], ease.expoOut)}%)` }}>
            {ch}
          </span>
        ))}
      </div>
    );
  }
  if (w.mode === "stretch") {
    const p = tw(lf, [0, 14], [0, 1], ease.expoOut);
    return (
      <div
        style={{
          ...base,
          fontVariationSettings: archivo(900, lerp(62, 125, p)),
          letterSpacing: `${lerp(0.14, -0.02, p)}em`,
          transform: `scaleX(${lerp(0.55, 1, p)})`,
          transformOrigin: "left center",
          opacity: tw(lf, [0, 3]),
        }}
      >
        {w.text}
        <span style={{ color: C.coral }}>.</span>
      </div>
    );
  }
  if (w.mode === "drop") {
    return (
      <div style={{ ...base, fontVariationSettings: archivo(900, 100), display: "flex" }}>
        {chars.map((ch, i) => {
          const s = sp(lf - i * 1.4, { damping: 12, stiffness: 210, mass: 0.8 });
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                color: period(i),
                opacity: lf - i * 1.4 >= 0 ? 1 : 0,
                transform: `translateY(${(1 - s) * -520}px) rotate(${(1 - s) * (random(`dr${i}`) - 0.5) * 70}deg)`,
              }}
            >
              {ch === " " ? " " : ch}
            </span>
          );
        })}
      </div>
    );
  }
  // glitch
  const p = tw(lf, [0, 12], [0, 1], ease.linear);
  const txt = scramble(w.text, p, f, "manual");
  const off = (1 - p) * 18 + (lf % 7 === 0 ? 10 : 0);
  const layer = (color: string, dx: number, blend?: React.CSSProperties["mixBlendMode"]) => (
    <div style={{ ...base, position: "absolute", left: dx, top: 0, color, mixBlendMode: blend, fontVariationSettings: archivo(900, 78) }}>
      {txt}
      <span style={{ color: blend ? color : C.coral }}>.</span>
    </div>
  );
  return (
    <div style={{ position: "relative", height: w.size }}>
      {layer(C.coral, -off, "screen")}
      {layer(C.cyan, off, "screen")}
      {layer(C.paper, 0)}
    </div>
  );
};

export const Chaos: React.FC = () => {
  const f = useCurrentFrame();
  const [i0, i1] = CHAOS.implode;

  // camera
  const pull = tw(f, CHAOS.pullBack, [0, 1], ease.expoOut);
  const camS = lerp(1, 0.7, pull) * lerp(1, 0.94, tw(f, [50, 180], [0, 1], ease.inOut));
  const camR = lerp(0, -2.5, tw(f, [0, 180], [0, 1], ease.inOut));
  const shakeAmp = 16 * tw(f, [135, 180], [0, 1], ease.in) * (1 - tw(f, [i0, i0 + 6]));
  const camX = noise2D("cx", f * 0.35, 0) * shakeAmp;
  const camY = noise2D("cy", 0, f * 0.35) * shakeAmp;

  const anxiety = 2 + 7 * tw(f, [90, 180]);
  const implodeWorld = (i: number) => tw(f, [i0 + random(`id${i}`) * 7, i1 - 3], [0, 1], ease.expoIn);

  const world = (
    <div style={{ position: "absolute", left: 960, top: 540, transform: `translate(${camX}px, ${camY}px) scale(${camS}) rotate(${camR}deg)` }}>
      {PLANS.map((p, i) => {
        const lf = f - p.t;
        if (lf < 0) return null;
        const s = i === 0 ? 1 : sp(lf, { damping: 15, stiffness: 140, mass: 0.9 });
        const e = implodeWorld(i);
        if (e >= 1) return null;
        const jx = noise2D(`j${i}`, f * 0.25, 1) * anxiety;
        const jy = noise2D(`j${i}`, 2, f * 0.25) * anxiety;
        const x = lerp(lerp(p.fromX, p.x, s) + jx, 0, e);
        const y = lerp(lerp(p.fromY, p.y, s) + jy, 0, e);
        const rot = lerp(p.fromRot, p.rot, s) + e * (random(`sr${i}`) - 0.5) * 400;
        const dropScale = p.mode === "drop" && i > 0 ? lerp(1.7, 1, s) : 1;
        const sc = dropScale * lerp(1, 0.04, e);
        return (
          <NotifCard
            key={i}
            spec={p.spec}
            tint={e * 0.9}
            style={{
              left: -NOTIF_W / 2,
              top: -NOTIF_H / 2,
              transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${sc})`,
              opacity: p.mode === "drop" && i > 0 ? Math.min(1, lf / 4) : 1,
            }}
          />
        );
      })}
    </div>
  );

  // glitch slices on escalation frames
  const glitchOn = CHAOS.glitches.some((g) => f >= g && f < g + 2);
  const bands = 6;

  // implosion + dot
  const wordCollapse = tw(f, [i0, i0 + 16], [0, 1], ease.expoIn);
  const dotR = tw(f, [i1 - 9, i1 - 1], [0, 8], ease.expoOut);
  const count = Math.round(1 + 246 * Math.pow(Math.min(1, Math.max(0, (f - 4) / 172)), 1.9));
  const countBump = CHAOS.spawns.reduce((m, t) => (f >= t ? Math.max(m, Math.exp(-(f - t) / 3)) : m), 0);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* rising coral tension */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 55%, rgba(255,77,46,${0.22 * tw(f, [40, 180]) * (1 - tw(f, [i0, i0 + 14]))}), transparent 60%)`,
        }}
      />
      {glitchOn
        ? Array.from({ length: bands }).map((_, b) => (
            <AbsoluteFill
              key={b}
              style={{
                clipPath: `inset(${(b / bands) * 100}% 0 ${100 - ((b + 1) / bands) * 100}% 0)`,
                transform: `translateX(${(random(`band${b}-${f}`) - 0.5) * 120}px)`,
              }}
            >
              {world}
            </AbsoluteFill>
          ))
        : world}

      {/* speed lines into the singularity */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 56 }).map((_, i) => {
          const a = (i / 56) * Math.PI * 2 + random(`sl${i}`) * 0.1;
          const t = tw(f, [i0 + 2 + random(`st${i}`) * 8, i1 - 2], [0, 1], ease.expoIn);
          if (t <= 0 || t >= 1) return null;
          const d = lerp(1250, 10, t);
          const len = 80 + 260 * Math.sin(Math.PI * t);
          return (
            <line
              key={i}
              x1={960 + Math.cos(a) * d}
              y1={540 + Math.sin(a) * d}
              x2={960 + Math.cos(a) * (d + len)}
              y2={540 + Math.sin(a) * (d + len)}
              stroke={i % 5 === 0 ? C.lime : C.paper}
              strokeWidth={i % 5 === 0 ? 3 : 1.5}
              opacity={0.75 * Math.sin(Math.PI * t)}
            />
          );
        })}
      </svg>

      {/* scrim + kinetic word */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 560,
          background: "linear-gradient(to top, rgba(7,8,12,0.94) 0%, rgba(7,8,12,0.75) 45%, transparent 100%)",
          opacity: 1 - wordCollapse,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 104,
          top: 770,
          transformOrigin: "856px -230px",
          transform: `scale(${1 - wordCollapse})`,
          opacity: 1 - tw(f, [i0 + 10, i0 + 16]),
        }}
      >
        <Word f={f} />
      </div>

      {/* unanswered counter */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: 900,
          height: 520,
          background: "radial-gradient(ellipse at 100% 0%, rgba(7,8,12,0.95) 0%, rgba(7,8,12,0.7) 38%, transparent 70%)",
          opacity: tw(f, [20, 30]) * (1 - wordCollapse),
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 110,
          top: 130,
          textAlign: "right",
          opacity: tw(f, [20, 30]) * (1 - wordCollapse),
          transform: `scale(${1 - wordCollapse * 0.9})`,
          transformOrigin: "-500px 400px",
        }}
      >
        <div style={{ fontFamily: F.mono, fontSize: 20, letterSpacing: "0.22em", color: C.paperDim, fontWeight: 600 }}>UNANSWERED</div>
        <div
          style={{
            fontFamily: F.display,
            fontVariationSettings: archivo(900, 70),
            fontSize: 150,
            lineHeight: 0.95,
            color: C.coral,
            transform: `scale(${1 + 0.06 * countBump})`,
            transformOrigin: "right center",
          }}
        >
          {String(count).padStart(3, "0")}
        </div>
      </div>

      {/* the dot */}
      {dotR > 0 && (
        <>
          <div
            style={{
              position: "absolute",
              left: 960 - 90,
              top: 540 - 90,
              width: 180,
              height: 180,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(200,255,46,0.45), transparent 62%)",
            }}
          />
          <div style={{ position: "absolute", left: 960 - dotR, top: 540 - dotR, width: dotR * 2, height: dotR * 2, borderRadius: "50%", background: C.lime }} />
        </>
      )}

      {/* coral flash at peak */}
      <AbsoluteFill style={{ background: C.coral, opacity: 0.16 * (tw(f, [172, 176]) - tw(f, [177, 181])), mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};
