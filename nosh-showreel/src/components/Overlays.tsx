import React from "react";
import { AbsoluteFill, random, staticFile, useCurrentFrame } from "remotion";
import { C, F } from "../lib/theme";
import { tw } from "../lib/motion";
import { scramble, timecode } from "../lib/text";
import { TOTAL } from "../lib/timeline";

// ── Film grain: 8 pre-baked tiles, re-picked and re-offset every frame ──
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.075 }) => {
  const frame = useCurrentFrame();
  const tile = Math.floor(random(`g${frame}`) * 8);
  const ox = Math.floor(random(`gx${frame}`) * 256);
  const oy = Math.floor(random(`gy${frame}`) * 256);
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${staticFile(`textures/grain-${tile}.png`)})`,
        backgroundSize: "256px 256px",
        backgroundPosition: `${ox}px ${oy}px`,
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.5 }) => {
  const frame = useCurrentFrame();
  const s = isLight(frame) ? strength * 0.4 : strength;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 75% 70% at 50% 50%, transparent 55%, rgba(0,0,0,${s}) 100%)`,
        pointerEvents: "none",
      }}
    />
  );
};

// ── HUD ──────────────────────────────────────────────────────────────
type Chapter = { from: number; to: number; idx: string; label: string };
const CHAPTERS: Chapter[] = [
  { from: 0, to: 150, idx: "00", label: "INCOMING CALL" },
  { from: 150, to: 355, idx: "00", label: "THE PROBLEM" },
  { from: 355, to: 480, idx: "✦", label: "NOSH AI AUTOMATION" },
  { from: 480, to: 705, idx: "01", label: "AI VOICE AGENTS" },
  { from: 705, to: 900, idx: "02", label: "LEAD QUALIFICATION" },
  { from: 900, to: 1125, idx: "03", label: "AI CHATBOTS" },
  { from: 1125, to: 1335, idx: "04", label: "WORKFLOW AUTOMATION" },
  { from: 1335, to: 1500, idx: "05", label: "BUILT FOR YOUR INDUSTRY" },
  { from: 1500, to: 1620, idx: "06", label: "THE OUTCOME" },
  { from: 1620, to: 1800, idx: "07", label: "LET'S BUILD" },
];

// Frames where the backdrop is light (lime/paper) → HUD switches to ink.
const LIGHT_RANGES: [number, number][] = [
  [361, 452], // logo on lime
  [1500, 1530], // 24/7 on lime
  [1560, 1590], // paper card
];
const isLight = (f: number) => LIGHT_RANGES.some(([a, b]) => f >= a && f < b);

// Ranges where the HUD steps aside (full-bleed panels, the zoom through the "o").
const HIDE_RANGES: [number, number][] = [
  [444, 488],
  [1303, 1502],
];
const hudHidden = (f: number) =>
  HIDE_RANGES.reduce((m, [a, b]) => Math.max(m, tw(f, [a, a + 6]) * (1 - tw(f, [b - 6, b]))), 0);

const Corner: React.FC<{ x: "l" | "r"; y: "t" | "b"; color: string }> = ({ x, y, color }) => {
  const s = 26;
  const inset = 36;
  return (
    <div
      style={{
        position: "absolute",
        width: s,
        height: s,
        [x === "l" ? "left" : "right"]: inset,
        [y === "t" ? "top" : "bottom"]: inset,
        borderColor: color,
        borderStyle: "solid",
        borderWidth: 0,
        [y === "t" ? "borderTopWidth" : "borderBottomWidth"]: 2,
        [x === "l" ? "borderLeftWidth" : "borderRightWidth"]: 2,
      }}
    />
  );
};

export const HUD: React.FC = () => {
  const frame = useCurrentFrame();
  const light = isLight(frame);
  const fg = light ? "rgba(7,8,12,0.78)" : "rgba(243,241,234,0.62)";
  const accent = light ? C.ink : C.lime;
  const opacity = tw(frame, [18, 40]) * (1 - tw(frame, [1748, 1772])) * (1 - hudHidden(frame));
  if (opacity <= 0) return null;

  const ch = CHAPTERS.find((c) => frame >= c.from && frame < c.to) ?? CHAPTERS[0];
  const since = frame - ch.from;
  const label = scramble(`${ch.idx} — ${ch.label}`, tw(since, [0, 14], [0, 1], (t) => t), frame, ch.label);
  const progress = frame / (TOTAL - 1);
  const blink = Math.floor(frame / 15) % 2 === 0;

  const text: React.CSSProperties = {
    position: "absolute",
    fontFamily: F.mono,
    fontSize: 15,
    letterSpacing: "0.14em",
    color: fg,
    fontWeight: 500,
    whiteSpace: "pre",
  };

  return (
    <AbsoluteFill style={{ opacity, pointerEvents: "none" }}>
      <Corner x="l" y="t" color={fg} />
      <Corner x="r" y="t" color={fg} />
      <Corner x="l" y="b" color={fg} />
      <Corner x="r" y="b" color={fg} />

      <div style={{ ...text, left: 78, top: 40 }}>
        <span style={{ color: accent }}>●</span> NOSH / AI AUTOMATION
      </div>
      <div style={{ ...text, left: 78, top: 62, opacity: 0.6 }}>SHOWREEL — 2026</div>

      <div style={{ ...text, right: 78, top: 40, textAlign: "right" }}>
        <span style={{ opacity: blink ? 1 : 0.25, color: accent }}>■</span> TC {timecode(frame)}
      </div>
      <div style={{ ...text, right: 78, top: 62, opacity: 0.6, textAlign: "right" }}>
        30 FPS · 1920×1080 · F{String(frame).padStart(4, "0")}
      </div>

      <div style={{ ...text, left: 78, bottom: 42, color: light ? C.ink : C.paper, fontWeight: 600 }}>{label}</div>

      <div style={{ position: "absolute", right: 78, bottom: 48, width: 260 }}>
        <div style={{ ...text, position: "relative", textAlign: "right", marginBottom: 10 }}>NOSHAIAUTOMATION.COM</div>
        <div style={{ height: 2, background: light ? "rgba(7,8,12,0.2)" : "rgba(243,241,234,0.16)" }}>
          <div style={{ height: 2, width: `${progress * 100}%`, background: accent }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
