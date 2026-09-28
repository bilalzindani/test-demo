import React from "react";
import { random, useCurrentFrame } from "remotion";
import { C, F, archivo } from "../lib/theme";
import { ease, sp, springs, tw } from "../lib/motion";

// A rich-text segment. Accent words switch to the italic serif in lime —
// the grotesk/serif contrast is the reel's typographic signature.
export type Seg = { t: string; accent?: boolean; color?: string; br?: boolean };

type WordToken = { word: string; accent?: boolean; color?: string; br?: boolean };

const tokenize = (segs: Seg[]): WordToken[] => {
  const out: WordToken[] = [];
  segs.forEach((s) => {
    if (s.br) {
      out.push({ word: "", br: true });
      return;
    }
    s.t.split(" ").filter(Boolean).forEach((w) => out.push({ word: w, accent: s.accent, color: s.color }));
  });
  return out;
};

export type WordMode = "rise" | "drop" | "blur" | "scale";

// Words reveal one after another. "rise" = slide up out of a mask (classic),
// "drop" = fall in with a spring, "blur" = focus-pull, "scale" = punch in.
export const Words: React.FC<{
  segs: Seg[];
  start: number;
  stagger?: number;
  dur?: number;
  mode?: WordMode;
  size: number;
  weight?: number;
  width?: number;
  color?: string;
  accentColor?: string;
  lineHeight?: number;
  tracking?: string;
  style?: React.CSSProperties;
  out?: number; // frame at which words exit (rise out)
}> = ({
  segs,
  start,
  stagger = 3,
  dur = 16,
  mode = "rise",
  size,
  weight = 800,
  width = 100,
  color = C.paper,
  accentColor = C.lime,
  lineHeight = 1.0,
  tracking = "-0.035em",
  style,
  out,
}) => {
  const frame = useCurrentFrame();
  const tokens = tokenize(segs);
  let wi = 0;
  const lines: WordToken[][] = [[]];
  tokens.forEach((t) => (t.br ? lines.push([]) : lines[lines.length - 1].push(t)));

  return (
    <div style={{ display: "flex", flexDirection: "column", ...style }}>
      {lines.map((line, li) => (
        <div key={li} style={{ display: "flex", flexWrap: "nowrap", alignItems: "baseline", lineHeight }}>
          {line.map((tok, i) => {
            const idx = wi++;
            const f = frame - start - idx * stagger;
            const p = tw(f, [0, dur], [0, 1], ease.expoOut);
            const exitP = out !== undefined ? tw(frame - out - idx * 1.5, [0, 12], [0, 1], ease.expoIn) : 0;
            const isAcc = !!tok.accent;
            const base: React.CSSProperties = isAcc
              ? {
                  fontFamily: F.serif,
                  fontStyle: "italic",
                  fontWeight: 400,
                  fontSize: size * 1.12,
                  letterSpacing: "-0.01em",
                  color: tok.color ?? accentColor,
                  paddingRight: "0.06em",
                }
              : {
                  fontFamily: F.display,
                  fontVariationSettings: archivo(weight, width),
                  fontWeight: weight,
                  fontSize: size,
                  letterSpacing: tracking,
                  color: tok.color ?? color,
                };
            let inner: React.CSSProperties = {};
            if (mode === "rise") {
              inner = { transform: `translateY(${(1 - p) * 110 + exitP * -110}%)` };
            } else if (mode === "drop") {
              const s = sp(f, springs.bouncy);
              inner = {
                transform: `translateY(${(1 - s) * -120}%) rotate(${(1 - s) * (random(`r${idx}`) - 0.5) * 30}deg)`,
                opacity: Math.min(1, f / 3),
              };
            } else if (mode === "blur") {
              inner = {
                filter: `blur(${(1 - p) * 18}px)`,
                opacity: p,
                transform: `translateY(${(1 - p) * 30}px) scale(${1.15 - 0.15 * p})`,
              };
            } else {
              const s = sp(f, springs.pop);
              inner = { transform: `scale(${s})`, opacity: f >= 0 ? 1 : 0 };
            }
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  overflow: mode === "rise" ? "hidden" : "visible",
                  paddingBottom: mode === "rise" ? "0.12em" : 0,
                  marginBottom: mode === "rise" ? "-0.12em" : 0,
                  marginRight: size * 0.26,
                }}
              >
                <span style={{ display: "inline-block", ...base, ...inner }}>{tok.word}</span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// Per-character renderer: caller decides the transform for each char.
export const Chars: React.FC<{
  text: string;
  style?: React.CSSProperties;
  charStyle: (i: number, n: number, ch: string) => React.CSSProperties;
}> = ({ text, style, charStyle }) => {
  const chars = text.split("");
  return (
    <div style={{ display: "flex", whiteSpace: "pre", ...style }}>
      {chars.map((ch, i) => (
        <span key={i} style={{ display: "inline-block", ...charStyle(i, chars.length, ch) }}>
          {ch === " " ? " " : ch}
        </span>
      ))}
    </div>
  );
};

// Small mono tag used for chapter labels: "01 ——— AI VOICE AGENTS"
export const ChapterTag: React.FC<{ idx: string; label: string; start: number; color?: string; dim?: string }> = ({
  idx,
  label,
  start,
  color = C.lime,
  dim = C.paperDim,
}) => {
  const frame = useCurrentFrame();
  const f = frame - start;
  const line = tw(f, [0, 14], [0, 1], ease.expoOut);
  const lab = tw(f, [4, 22], [0, 1], ease.linear);
  const shown = Math.floor(lab * label.length);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: F.mono, fontSize: 20, letterSpacing: "0.16em", fontWeight: 600 }}>
      <span style={{ color, opacity: f >= 0 ? 1 : 0 }}>{idx}</span>
      <span style={{ display: "inline-block", width: 64 * line, height: 2, background: color }} />
      <span style={{ color: dim }}>{label.slice(0, shown)}</span>
    </div>
  );
};
