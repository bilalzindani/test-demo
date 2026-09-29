import React from "react";
import { AbsoluteFill, random, staticFile, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import ENV from "../audioEnvelope.json";
import { F } from "../../lib/theme";
import { tw } from "../../lib/motion";
import { scramble, timecode } from "../../lib/text";
import { B } from "../theme";
import { V_TOTAL } from "../timeline";

// Audio envelope of the finished soundtrack (per frame, 0..1), exported by
// audio/generate_vertical_soundtrack.py — drives meters and audio-reactive bits.
const env = ENV as { rms: number[]; low: number[]; high: number[] };
export const level = (frame: number, band: "rms" | "low" | "high" = "rms") => env[band][Math.max(0, Math.min(env[band].length - 1, frame))] ?? 0;

// The site's hero card: black page, rounded purple-black gradient panel.
export const Panel: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const gx = 50 + noise2D("pgx", t * 0.07, 0) * 24;
  const gy = 30 + noise2D("pgy", 0, t * 0.06) * 14;
  return (
    <AbsoluteFill style={{ background: B.black }}>
      <div
        style={{
          position: "absolute",
          left: 18,
          top: 18,
          right: 18,
          bottom: 18,
          borderRadius: 46,
          overflow: "hidden",
          background: `linear-gradient(180deg, ${B.panelTop} 0%, ${B.panelMid} 48%, ${B.panelBot} 100%)`,
          boxShadow: `inset 0 0 0 1.5px ${B.plumLine}`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at ${gx}% ${gy}%, rgba(139,92,246,0.22), transparent 46%), radial-gradient(circle at ${100 - gx}% ${80 - gy * 0.3}%, rgba(124,77,222,0.14), transparent 40%)`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const VGrain: React.FC<{ opacity?: number }> = ({ opacity = 0.07 }) => {
  const frame = useCurrentFrame();
  const k = Math.floor(frame / 2); // 15 fps grain — filmic, and kinder to the encoder
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${staticFile(`textures/grain-${Math.floor(random(`vg${k}`) * 8)}.png`)})`,
        backgroundSize: "256px 256px",
        backgroundPosition: `${Math.floor(random(`vgx${k}`) * 256)}px ${Math.floor(random(`vgy${k}`) * 256)}px`,
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

type Chapter = { from: number; to: number; label: string };
const CHAPTERS: Chapter[] = [
  { from: 0, to: 120, label: "00 — TAKE ONE" },
  { from: 120, to: 247, label: "✦ — NOSH VIDEO EDITING" },
  { from: 247, to: 600, label: "01 — VIDEO EDITING" },
  { from: 600, to: 840, label: "02 — AI VIDEO EDITING" },
  { from: 840, to: 1080, label: "03 — AI UGC ADS" },
  { from: 1080, to: 1395, label: "04 — AI FILMS & SHORTS" },
  { from: 1395, to: 1590, label: "05 — LET'S EDIT" },
];
const HIDE: [number, number][] = [
  [114, 132], // clap flash
  [596, 606], // iris closed
  [1076, 1090], // film-burn flash
];

const Bracket: React.FC<{ x: "l" | "r"; y: "t" | "b" }> = ({ x, y }) => (
  <div
    style={{
      position: "absolute",
      width: 46,
      height: 46,
      [x === "l" ? "left" : "right"]: 52,
      [y === "t" ? "top" : "bottom"]: 52,
      borderColor: "rgba(221,214,254,0.7)",
      borderStyle: "solid",
      borderWidth: 0,
      [y === "t" ? "borderTopWidth" : "borderBottomWidth"]: 3,
      [x === "l" ? "borderLeftWidth" : "borderRightWidth"]: 3,
    }}
  />
);

// Camera-viewfinder HUD
export const Viewfinder: React.FC = () => {
  const frame = useCurrentFrame();
  const hide = HIDE.reduce((m, [a, b]) => Math.max(m, frame >= a && frame < b ? 1 : 0), 0);
  const opacity = tw(frame, [4, 16]) * (1 - tw(frame, [V_TOTAL - 36, V_TOTAL - 16])) * (1 - hide);
  if (opacity <= 0) return null;
  const ch = CHAPTERS.find((c) => frame >= c.from && frame < c.to) ?? CHAPTERS[0];
  const label = scramble(ch.label, tw(frame - ch.from, [0, 14], [0, 1], (t) => t), frame, ch.label);
  const recOn = Math.floor(frame / 15) % 2 === 0;
  const txt: React.CSSProperties = { position: "absolute", fontFamily: F.mono, fontSize: 24, letterSpacing: "0.16em", color: B.mist, fontWeight: 600, whiteSpace: "pre" };
  const L = level(frame, "rms");
  const H = level(frame, "high");
  return (
    <AbsoluteFill style={{ opacity, pointerEvents: "none" }}>
      <Bracket x="l" y="t" />
      <Bracket x="r" y="t" />
      <Bracket x="l" y="b" />
      <Bracket x="r" y="b" />
      <div style={{ ...txt, left: 118, top: 74, display: "flex", alignItems: "center", gap: 12, color: B.white, fontWeight: 800 }}>
        <span style={{ width: 18, height: 18, borderRadius: 9, background: B.violet, boxShadow: `0 0 14px ${B.violet}`, opacity: recOn ? 1 : 0.25 }} />
        REC
      </div>
      <div style={{ ...txt, left: 118, top: 110, fontSize: 19, color: B.dim }}>Nosh / VIDEO EDITING</div>
      <div style={{ ...txt, right: 118, top: 74, textAlign: "right" }}>TC {timecode(frame)}</div>
      <div style={{ ...txt, right: 118, top: 110, fontSize: 19, color: B.dim, textAlign: "right" }}>1080×1920 · 30P</div>
      <div style={{ ...txt, left: 118, bottom: 80, fontSize: 21, color: B.white }}>{label}</div>
      {/* audio meters */}
      <div style={{ position: "absolute", right: 118, bottom: 78, display: "flex", gap: 8, alignItems: "flex-end", height: 96 }}>
        {[L, Math.min(1, L * 0.92 + H * 0.12)].map((v, i) => (
          <div key={i} style={{ width: 12, height: 96, background: "rgba(221,214,254,0.12)", borderRadius: 3, display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
            <div style={{ width: 12, height: `${Math.min(100, v * 100)}%`, background: `linear-gradient(0deg, ${B.purple}, ${B.lavender} 70%, ${B.mist})` }} />
          </div>
        ))}
      </div>
      <div style={{ ...txt, right: 158, bottom: 80, fontSize: 17, color: B.dim }}>L R</div>
    </AbsoluteFill>
  );
};
