import React from "react";
import { AbsoluteFill, interpolateColors, random, useCurrentFrame } from "remotion";
import { Phone, PhoneMissed } from "lucide-react";
import { C, F, archivo } from "../lib/theme";
import { ease, lerp, sp, springs, tw } from "../lib/motion";
import { HOOK } from "../lib/timeline";
import { scramble } from "../lib/text";
import { NOTIF_H, NOTIF_ICON, NOTIF_ICON_X, NOTIF_W, NotifCard } from "../components/NotifCard";
import { MISSED_CALL } from "./chaosData";

// 00 — 2:47 AM. A single lime dot (the "always-on" motif) becomes a ringing
// call that nobody answers, then morphs into a notification card.

const CENTER = { x: 960, y: 540 };
const ORB = { x: 1420, y: 540 };
const CARD_L = 960 - NOTIF_W / 2;
const ICON_C = { x: CARD_L + NOTIF_ICON_X + NOTIF_ICON / 2, y: 540 };
const RIPPLES = [15, 30, 45, 50, 55, 75, 80, 85];

const Typewriter: React.FC<{ text: string; start: number; color: string; caret: boolean; f: number }> = ({ text, start, color, caret, f }) => {
  const n = Math.max(0, Math.min(text.length, Math.floor(f - start)));
  if (f < start) return null;
  const typing = n < text.length;
  const showCaret = caret && (typing || Math.floor(f / 8) % 2 === 0);
  return (
    <div style={{ display: "flex", alignItems: "center", height: 66, color }}>
      <span>{text.slice(0, n)}</span>
      {showCaret && <span style={{ display: "inline-block", width: 5, height: 52, background: C.lime, marginLeft: 6 }} />}
    </div>
  );
};

export const Hook: React.FC = () => {
  const f = useCurrentFrame();

  // ── Orb ───────────────────────────────────────────────────────────
  const move = tw(f, HOOK.move, [0, 1], ease.inOut);
  const morph = tw(f, [HOOK.morph[0], HOOK.morph[0] + 22], [0, 1], ease.inOut);
  const pop = sp(f, springs.pop, HOOK.dotIn);
  const grow = sp(f, springs.bouncy, HOOK.move[0] + 2);
  const pulse = Math.max(0, ...HOOK.pulses.map((p) => (f >= p ? Math.exp(-(f - p) / 4) : 0)));
  let r = lerp(9, 86, grow) * pop * (1 + 0.55 * pulse * (1 - grow));
  r = lerp(r, NOTIF_ICON / 2, morph);
  const missed = f >= HOOK.missed;
  const mT = tw(f, [HOOK.missed, HOOK.missed + 3], [0, 1], ease.linear);
  const orbColor = interpolateColors(mT, [0, 1], [C.lime, C.coral]);

  let rot = 0;
  let jx = 0;
  HOOK.rings.forEach((r0) => {
    const a = f - r0;
    if (a >= 0 && a <= HOOK.ringDur) {
      const env = Math.sin((Math.PI * a) / HOOK.ringDur);
      rot += Math.sin(a * 2.7) * 18 * env;
      jx += Math.sin(a * 3.1) * 5 * env;
    }
  });
  const mf = f - HOOK.missed;
  const missShake = mf >= 0 && mf < 10 ? (random(`ms${f}`) - 0.5) * 26 * (1 - mf / 10) : 0;

  const px = lerp(lerp(CENTER.x, ORB.x, move), ICON_C.x, morph) + jx + missShake;
  const py = CENTER.y;
  const iconIn = sp(f, springs.pop, 40);
  const iconSwap = missed ? 1 + 0.35 * Math.exp(-mf / 3) : 1;
  const glowOp = (1 - tw(f, [HOOK.morph[0], HOOK.morph[0] + 14])) * pop;

  // ── Left type block ───────────────────────────────────────────────
  const exit = tw(f, [HOOK.morph[0], HOOK.morph[0] + 16], [0, 1], ease.expoIn);
  const wdth = lerp(125, 100, tw(f, [34, 72], [0, 1], ease.expoOut));
  const roll = tw(f, [64, 72], [0, 1], ease.backOut);
  const glitch = mf >= 0 && mf < 8;
  const gx = glitch ? (random(`gx${f}`) - 0.5) * 30 : 0;
  const split = glitch ? 10 * (1 - mf / 8) : 0;

  const labelText = missed ? "MISSED CALL" : "INCOMING CALL";
  const labelP = missed ? tw(f, [HOOK.missed, HOOK.missed + 8], [0, 1], ease.linear) : tw(f, [36, 52], [0, 1], ease.linear);
  const label = scramble(labelText, labelP, f, labelText);

  const timeChars = ["2", ":", "4"];
  const charRise = (i: number) => tw(f - 34 - i * 3, [0, 16], [110, 0], ease.expoOut);

  const timeBlock = (color: string, dx = 0, blend?: React.CSSProperties["mixBlendMode"]) => (
    <div
      style={{
        position: "absolute",
        left: 150 + dx,
        top: 332,
        display: "flex",
        alignItems: "baseline",
        fontFamily: F.display,
        fontVariationSettings: archivo(900, wdth),
        fontSize: 300,
        lineHeight: 1,
        letterSpacing: "-0.04em",
        color,
        mixBlendMode: blend,
      }}
    >
      {timeChars.map((ch, i) => (
        <span key={i} style={{ display: "inline-block", overflow: "hidden", height: 300 }}>
          <span style={{ display: "inline-block", transform: `translateY(${charRise(i)}%)` }}>{ch}</span>
        </span>
      ))}
      <span style={{ display: "inline-block", overflow: "hidden", height: 300 }}>
        <span style={{ display: "flex", flexDirection: "column", transform: `translateY(${charRise(3)}%)` }}>
          <span style={{ display: "block", height: 300, transform: `translateY(${-roll * 300}px)` }}>6</span>
          <span style={{ display: "block", height: 300, transform: `translateY(${-roll * 300}px)` }}>7</span>
        </span>
      </span>
      <span
        style={{
          fontVariationSettings: archivo(700, 125),
          fontSize: 72,
          letterSpacing: "0.02em",
          marginLeft: 26,
          color: color === C.paper ? C.paperDim : color,
          opacity: tw(f, [46, 56]),
          transform: `translateX(${(1 - tw(f, [46, 60], [0, 1], ease.expoOut)) * -20}px)`,
        }}
      >
        AM
      </span>
    </div>
  );

  // ── Card body growing out of the orb (hands off to Chaos) ─────────
  const bodyW = lerp(NOTIF_ICON, NOTIF_W, tw(f, [126, 146], [0, 1], ease.expoOut));
  const bodyH = lerp(NOTIF_ICON, NOTIF_H, tw(f, [124, 136], [0, 1], ease.expoOut));
  const bodyOn = f >= 124;

  return (
    <AbsoluteFill>
      {/* glow */}
      <div
        style={{
          position: "absolute",
          left: px - r * 4,
          top: py - r * 4,
          width: r * 8,
          height: r * 8,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${missed ? "rgba(255,77,46,0.32)" : "rgba(200,255,46,0.30)"} 0%, transparent 62%)`,
          opacity: glowOp,
        }}
      />
      {/* ripples */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {RIPPLES.map((t0, i) => {
          const a = f - t0;
          if (a < 0 || a > 44 || missed) return null;
          const p = a / 44;
          const rr = r + ease.out(p) * (i < 2 ? 150 : 320);
          return (
            <circle key={i} cx={px} cy={py} r={rr} fill="none" stroke={C.lime} strokeWidth={lerp(3, 0.8, p)} opacity={Math.pow(1 - p, 1.6) * (i < 2 ? 0.55 : 0.8)} />
          );
        })}
      </svg>

      {/* left type block */}
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${exit * -160 + gx}px)`, opacity: 1 - exit, filter: exit > 0 ? `blur(${exit * 10}px)` : undefined }}>
        <div
          style={{
            position: "absolute",
            left: 156,
            top: 300,
            fontFamily: F.mono,
            fontSize: 24,
            fontWeight: 600,
            letterSpacing: "0.22em",
            color: missed ? C.coral : C.paperDim,
            display: "flex",
            alignItems: "center",
            gap: 14,
            opacity: f >= 36 ? 1 : 0,
          }}
        >
          <span style={{ width: 12, height: 12, borderRadius: 6, background: missed ? C.coral : C.lime, opacity: Math.floor(f / 8) % 2 === 0 ? 1 : 0.2 }} />
          {label}
        </div>
        {split > 0 && timeBlock(C.coral, -split, "screen")}
        {split > 0 && timeBlock(C.cyan, split, "screen")}
        {timeBlock(C.paper)}
        <div style={{ position: "absolute", left: 158, top: 676, fontFamily: F.display, fontVariationSettings: archivo(500, 100), fontSize: 54, letterSpacing: "-0.01em" }}>
          <Typewriter text="A customer is calling." start={HOOK.type} color={C.paper} caret={f < 90} f={f} />
          <Typewriter text="No one picks up." start={90} color={C.coral} caret f={f} />
        </div>
      </div>

      {/* card body (grows out of the orb) */}
      {bodyOn && (
        <NotifCard
          spec={MISSED_CALL}
          hideIcon
          contentOpacity={tw(f, [136, 146])}
          contentShift={(1 - tw(f, [136, 148], [0, 1], ease.expoOut)) * -14}
          style={{
            left: ICON_C.x - NOTIF_ICON / 2 - (NOTIF_ICON_X * (bodyW - NOTIF_ICON)) / (NOTIF_W - NOTIF_ICON),
            top: 540 - bodyH / 2,
            width: bodyW,
            height: bodyH,
            borderRadius: lerp(32, 26, tw(f, [124, 140])),
            opacity: tw(f, [124, 128]),
          }}
        />
      )}

      {/* orb */}
      <div
        style={{
          position: "absolute",
          left: px - r,
          top: py - r,
          width: r * 2,
          height: r * 2,
          borderRadius: "50%",
          background: orbColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `rotate(${rot}deg)`,
          boxShadow: morph < 1 ? `0 0 ${40 * (1 - morph)}px ${missed ? "rgba(255,77,46,0.5)" : "rgba(200,255,46,0.5)"}` : undefined,
        }}
      >
        {r > 20 && (
          <div style={{ transform: `scale(${iconIn * iconSwap})`, display: "flex" }}>
            {missed ? (
              <PhoneMissed size={r * 0.94} color={C.ink} strokeWidth={2.4} />
            ) : (
              <Phone size={r * 0.94} color={C.ink} strokeWidth={2.4} />
            )}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
