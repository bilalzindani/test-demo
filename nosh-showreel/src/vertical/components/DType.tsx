import React from "react";
import { random } from "remotion";
import M from "../archivoMetrics.json";
import { F, archivo } from "../../lib/theme";
import { ease, lerp, sp, springs, tw } from "../../lib/motion";
import { scramble } from "../../lib/text";
import { B } from "../theme";

// ── measurement (Archivo advances exported from the font with fontTools) ──
type Wght = 700 | 900;
const T = M.table as Record<string, Record<string, number>>;
const adv = (ch: string, wght: Wght, wdth: number) => {
  const lo = wdth <= 100 ? 62 : 100;
  const hi = wdth <= 100 ? 100 : 125;
  const t = (wdth - lo) / (hi - lo);
  const a = T[`${wght}-${lo}`][ch] ?? 600;
  const b = T[`${wght}-${hi}`][ch] ?? 600;
  return a + (b - a) * t;
};
export const measure = (text: string, size: number, wght: Wght = 900, wdth = 100, tracking = 0) =>
  (text.split("").reduce((s, ch) => s + adv(ch, wght, wdth), 0) / 1000) * size + tracking * size * (text.length - 1);
// font size so that `text` spans exactly `width` px
export const fit = (text: string, width: number, wght: Wght = 900, wdth = 100, tracking = 0) =>
  width / (measure(text, 1, wght, wdth, tracking) || 1);

export type KMode = "rise" | "stretch" | "slam" | "decode" | "outline" | "outlineFill" | "slice" | "bounce" | "fly";

export const KWord: React.FC<{
  text: string;
  f: number;
  start: number;
  mode: KMode;
  size: number;
  wght?: Wght;
  wdth?: number;
  tracking?: number; // em
  color?: string;
  colors?: string[]; // per-character colours (cycled)
  stroke?: string;
  x?: number;
  y: number;
  width?: number; // box width for alignment (defaults to full frame)
  align?: "left" | "center" | "right";
  out?: number; // exit frame
  amp?: (i: number) => number; // bounce amplitude per char (0..1)
  slice?: number; // 0..1 razor split amount
  fill?: number; // 0..1 fill wipe for outlineFill
  glow?: string;
  stagger?: number; // per-character delay for rise/slam
}> = ({
  text,
  f,
  start,
  mode,
  size,
  wght = 900,
  wdth = 100,
  tracking = -0.02,
  color = B.white,
  colors,
  stroke = B.lavender,
  x = 0,
  y,
  width = 1080,
  align = "center",
  out,
  amp,
  slice = 0,
  fill = 1,
  glow,
  stagger,
}) => {
  const lf = f - start;
  if (lf < 0) return null;
  const exit = out !== undefined ? tw(f, [out, out + 8], [0, 1], ease.expoIn) : 0;
  if (exit >= 1) return null;
  const chars = text.split("");
  let wd = wdth;
  let trackEm = tracking;
  let wordT = "";
  let wordOpacity = 1;
  if (mode === "stretch") {
    const p = tw(lf, [0, 14], [0, 1], ease.expoOut);
    wd = lerp(62, wdth, p) + Math.sin(Math.min(1, lf / 14) * Math.PI) * 10;
    trackEm = lerp(0.25, tracking, p);
    wordOpacity = tw(lf, [0, 3]);
    wordT = `scaleX(${lerp(0.7, 1, p)})`;
  }
  const base: React.CSSProperties = {
    fontFamily: F.display,
    fontVariationSettings: archivo(wght, wd),
    fontWeight: wght,
    fontSize: size,
    lineHeight: 1,
    letterSpacing: `${trackEm}em`,
    whiteSpace: "pre",
  };
  const colorOf = (i: number) => (colors ? colors[i % colors.length] : color);
  const box: React.CSSProperties = {
    position: "absolute",
    left: x,
    top: y,
    width,
    display: "flex",
    justifyContent: align === "center" ? "center" : align === "left" ? "flex-start" : "flex-end",
    opacity: wordOpacity * (1 - exit),
    transform: `translateY(${-exit * 40}px) ${wordT}`,
    filter: exit > 0 ? `blur(${exit * 10}px)` : glow ? `drop-shadow(0 0 28px ${glow})` : undefined,
  };

  const charSpan = (ch: string, i: number, style: React.CSSProperties) => (
    <span key={i} style={{ display: "inline-block", ...style }}>
      {ch === " " ? " " : ch}
    </span>
  );

  if (mode === "stretch") {
    return (
      <div style={box}>
        <div style={{ ...base, color }}>{text}</div>
      </div>
    );
  }
  if (mode === "rise" || mode === "outline") {
    return (
      <div style={box}>
        <div style={{ ...base, display: "flex", overflow: "hidden", paddingBottom: size * 0.08, marginBottom: -size * 0.08 }}>
          {chars.map((ch, i) =>
            charSpan(ch, i, {
              transform: `translateY(${tw(lf - i * (stagger ?? 1.2), [0, 12], [108, 0], ease.expoOut)}%)`,
              color: mode === "outline" ? "transparent" : colorOf(i),
              WebkitTextStroke: mode === "outline" ? `${Math.max(2, size * 0.018)}px ${stroke}` : undefined,
            }),
          )}
        </div>
      </div>
    );
  }
  if (mode === "outlineFill") {
    return (
      <div style={box}>
        <div style={{ position: "relative" }}>
          <div style={{ ...base, color: "transparent", WebkitTextStroke: `${Math.max(2, size * 0.018)}px ${stroke}` }}>{text}</div>
          <div style={{ ...base, position: "absolute", left: 0, top: 0, color, clipPath: `inset(0 ${(1 - fill) * 100}% 0 0)` }}>{text}</div>
        </div>
      </div>
    );
  }
  if (mode === "slam") {
    return (
      <div style={box}>
        <div style={{ ...base, display: "flex" }}>
          {chars.map((ch, i) => {
            const c = lf - i * (stagger ?? 1.6);
            const p = tw(c, [0, 9], [0, 1], ease.expoOut);
            return charSpan(ch, i, {
              color: colorOf(i),
              opacity: c >= 0 ? Math.min(1, c / 2 + 0.3) : 0,
              transform: `scale(${lerp(2.1, 1, p)}) translateY(${lerp(-18, 0, p)}px)`,
              filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined,
            });
          })}
        </div>
      </div>
    );
  }
  if (mode === "decode") {
    const txt = scramble(text, tw(lf, [0, 16], [0, 1], ease.linear), f, text);
    return (
      <div style={box}>
        <div style={{ ...base, color }}>{txt}</div>
      </div>
    );
  }
  if (mode === "slice") {
    // razor split along a diagonal: two clipped copies pushed apart
    const d = slice * size * 0.13;
    const poly1 = "polygon(0 0, 100% 0, 100% 38%, 0 62%)";
    const poly2 = "polygon(0 62%, 100% 38%, 100% 100%, 0 100%)";
    return (
      <div style={box}>
        <div style={{ position: "relative" }}>
          <div style={{ ...base, color, clipPath: poly1, transform: `translate(${-d}px, ${-d * 0.35}px)` }}>{text}</div>
          <div style={{ ...base, color, position: "absolute", left: 0, top: 0, clipPath: poly2, transform: `translate(${d}px, ${d * 0.35}px)` }}>
            {text}
          </div>
        </div>
      </div>
    );
  }
  if (mode === "bounce") {
    return (
      <div style={box}>
        <div style={{ ...base, display: "flex", alignItems: "flex-end" }}>
          {chars.map((ch, i) => {
            const inP = sp(lf - i * 1.5, springs.pop);
            const a = amp ? amp(i) : 0;
            return charSpan(ch, i, {
              color: colorOf(i),
              transformOrigin: "50% 100%",
              transform: `scaleY(${inP * (1 + a * 0.55)}) scaleX(${1 - a * 0.08})`,
            });
          })}
        </div>
      </div>
    );
  }
  // fly: letters arrive along a curve, with motion trails
  return (
    <div style={box}>
      <div style={{ ...base, display: "flex" }}>
        {chars.map((ch, i) => {
          const c = lf - i * 1.4;
          const pos = (k: number) => {
            const p = tw(c - k * 1.5, [0, 14], [0, 1], ease.expoOut);
            const r = random(`fly${text}${i}`);
            return { x: (1 - p) * (r - 0.5) * 900, y: (1 - p) * (-420 - r * 300), rot: (1 - p) * (r - 0.5) * 90, p };
          };
          return (
            <span key={i} style={{ display: "inline-block", position: "relative", color: "transparent" }}>
              {ch === " " ? " " : ch}
              {[3, 2, 1, 0].map((k) => {
                const q = pos(k);
                if (c - k * 1.5 < 0) return null;
                return (
                  <span
                    key={k}
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      color: k === 0 ? colorOf(i) : B.violet,
                      opacity: k === 0 ? 1 : 0.28 - k * 0.06,
                      transform: `translate(${q.x}px, ${q.y}px) rotate(${q.rot}deg)`,
                    }}
                  >
                    {ch}
                  </span>
                );
              })}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// Multi-tone phrase (the site's hero style): each word its own tone, rising in.
export const ToneLine: React.FC<{
  words: { t: string; c: string }[];
  f: number;
  start: number;
  size: number;
  y: number;
  wght?: number;
  wdth?: number;
  stagger?: number;
  align?: "center" | "left";
  x?: number;
  width?: number;
  lineHeight?: number;
  out?: number;
}> = ({ words, f, start, size, y, wght = 700, wdth = 100, stagger = 3, align = "center", x = 0, width = 1080, lineHeight = 1.08, out }) => {
  const exit = out !== undefined ? tw(f, [out, out + 8], [0, 1], ease.expoIn) : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : "flex-start",
        columnGap: size * 0.26,
        lineHeight,
        opacity: 1 - exit,
        transform: `translateY(${-exit * 30}px)`,
      }}
    >
      {words.map((w, i) => {
        const p = tw(f - start - i * stagger, [0, 14], [0, 1], ease.expoOut);
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", paddingBottom: size * 0.12, marginBottom: -size * 0.12 }}>
            <span
              style={{
                display: "inline-block",
                fontFamily: F.display,
                fontVariationSettings: archivo(wght, wdth),
                fontWeight: wght,
                fontSize: size,
                letterSpacing: "-0.025em",
                color: w.c,
                transform: `translateY(${(1 - p) * 110}%)`,
              }}
            >
              {w.t}
            </span>
          </span>
        );
      })}
    </div>
  );
};

// Mono chapter tag: "02 ——— AI VIDEO EDITING"
export const VTag: React.FC<{ idx: string; label: string; f: number; start: number; y: number; out?: number }> = ({ idx, label, f, start, y, out }) => {
  const lf = f - start;
  if (lf < 0) return null;
  const exit = out !== undefined ? tw(f, [out, out + 6]) : 0;
  const line = tw(lf, [0, 12], [0, 1], ease.expoOut);
  const shown = Math.floor(tw(lf, [4, 20], [0, 1], ease.linear) * label.length);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: 1080,
        top: y,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 18,
        fontFamily: F.mono,
        fontSize: 26,
        fontWeight: 700,
        letterSpacing: "0.2em",
        opacity: 1 - exit,
      }}
    >
      <span style={{ color: B.violet }}>{idx}</span>
      <span style={{ width: 70 * line, height: 3, background: B.violet, display: "inline-block" }} />
      <span style={{ color: B.mist, minWidth: label.length * 18 }}>{label.slice(0, shown)}</span>
    </div>
  );
};
