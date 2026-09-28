import React from "react";
import { F, archivo } from "../lib/theme";

// "nosh" wordmark set in Archivo 900 / wdth 112, with the "o" replaced by a
// geometric ring + dot (the always-on indicator). Metrics in font units
// (1000/em), measured from the variable font with fontTools.
export const WM = {
  wdth: 112,
  n: { x: 0, cx: 363 },
  s: { x: 1327, cx: 1665 },
  h: { x: 1978, cx: 2341 },
  ring: { cx: 1026, cy: 264, rOuter: 276, stroke: 160, dot: 54 },
  inkLeft: 60,
  inkRight: 2644,
  top: 725,
  xMid: 263,
};
const INK_CX = (WM.inkLeft + WM.inkRight) / 2;

export type LetterFx = { dx?: number; dy?: number; scale?: number; opacity?: number; rot?: number };

export const wordmarkGeometry = (size: number, cx: number, baseline: number) => {
  const k = size / 1000;
  const x0 = cx - INK_CX * k;
  return {
    k,
    x0,
    ringX: x0 + WM.ring.cx * k,
    ringY: baseline - WM.ring.cy * k,
    left: x0 + WM.inkLeft * k,
    right: x0 + WM.inkRight * k,
    top: baseline - WM.top * k,
  };
};

export const Wordmark: React.FC<{
  size: number;
  cx: number;
  baseline: number;
  color: string;
  ringColor: string;
  dotColor: string;
  letters?: Partial<Record<"n" | "s" | "h", LetterFx>>;
  ringDraw?: number; // 0..1 stroke draw-on
  ringScale?: number;
  dotScale?: number;
}> = ({ size, cx, baseline, color, ringColor, dotColor, letters = {}, ringDraw = 1, ringScale = 1, dotScale = 1 }) => {
  const g = wordmarkGeometry(size, cx, baseline);
  const { k, x0 } = g;
  const r = (WM.ring.rOuter - WM.ring.stroke / 2) * k;
  const circ = 2 * Math.PI * r;
  const style: React.CSSProperties = {
    fontFamily: F.display,
    fontVariationSettings: archivo(900, WM.wdth),
    fontWeight: 900,
    fontSize: size,
  };
  const letter = (ch: "n" | "s" | "h") => {
    const fx = letters[ch] ?? {};
    const lx = x0 + WM[ch].x * k;
    const pcx = x0 + WM[ch].cx * k;
    const pcy = baseline - (ch === "h" ? 362 : WM.xMid) * k;
    const s = fx.scale ?? 1;
    return (
      <text
        x={lx}
        y={baseline}
        fill={color}
        opacity={fx.opacity ?? 1}
        style={style}
        transform={`translate(${(fx.dx ?? 0) + pcx} ${(fx.dy ?? 0) + pcy}) rotate(${fx.rot ?? 0}) scale(${s}) translate(${-pcx} ${-pcy})`}
      >
        {ch}
      </text>
    );
  };
  return (
    <g>
      {letter("n")}
      {letter("s")}
      {letter("h")}
      <g transform={`translate(${g.ringX} ${g.ringY}) scale(${ringScale})`}>
        <circle
          r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth={WM.ring.stroke * k}
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - ringDraw)}
          transform="rotate(-90)"
        />
        <circle r={WM.ring.dot * k * dotScale} fill={dotColor} />
      </g>
    </g>
  );
};

// Four-point spark used as a secondary brand glyph.
export const Spark: React.FC<{ x: number; y: number; size: number; color: string; rot?: number; scale?: number }> = ({
  x,
  y,
  size,
  color,
  rot = 0,
  scale = 1,
}) => {
  const s = size / 2;
  const w = s * 0.22;
  const d = `M 0 ${-s} C ${w} ${-w} ${w} ${-w} ${s} 0 C ${w} ${w} ${w} ${w} 0 ${s} C ${-w} ${w} ${-w} ${w} ${-s} 0 C ${-w} ${-w} ${-w} ${-w} 0 ${-s} Z`;
  return <path d={d} fill={color} transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`} />;
};
