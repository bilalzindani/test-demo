import React from "react";
import { F, archivo } from "../../lib/theme";

// "Nosh" (capital N) in Archivo 900 / wdth 112; the "o" is a REC ring + dot.
// Positions in font units (1000/em), from fontTools metrics of the variable font.
export const NM = {
  N: { x: 0, cx: 458, cy: 344 },
  s: { x: 1499, cx: 1837, cy: 263 },
  h: { x: 2150, cx: 2513, cy: 362 },
  ring: { cx: 1198, cy: 264, rOuter: 276, stroke: 150, dot: 62 },
  inkL: 74,
  inkR: 2816,
  top: 725,
};
const INK_CX = (NM.inkL + NM.inkR) / 2;

export const markGeo = (size: number, cx: number, baseline: number) => {
  const k = size / 1000;
  const x0 = cx - INK_CX * k;
  return { k, x0, ringX: x0 + NM.ring.cx * k, ringY: baseline - NM.ring.cy * k, left: x0 + NM.inkL * k, right: x0 + NM.inkR * k, top: baseline - NM.top * k };
};

export type Fx = { dx?: number; dy?: number; scale?: number; opacity?: number };

export const NoshMark: React.FC<{
  size: number;
  cx: number;
  baseline: number;
  color?: string;
  ring?: string;
  dot?: string;
  letters?: Partial<Record<"N" | "s" | "h", Fx>>;
  ringDraw?: number;
  ringScale?: number;
  dotScale?: number;
  dotGlow?: number;
}> = ({ size, cx, baseline, color = "#fff", ring = "#8B5CF6", dot = "#DDD6FE", letters = {}, ringDraw = 1, ringScale = 1, dotScale = 1, dotGlow = 0 }) => {
  const g = markGeo(size, cx, baseline);
  const r = (NM.ring.rOuter - NM.ring.stroke / 2) * g.k;
  const circ = 2 * Math.PI * r;
  const style: React.CSSProperties = { fontFamily: F.display, fontVariationSettings: archivo(900, 112), fontWeight: 900, fontSize: size };
  const L = (ch: "N" | "s" | "h") => {
    const fx = letters[ch] ?? {};
    const pcx = g.x0 + NM[ch].cx * g.k;
    const pcy = baseline - NM[ch].cy * g.k;
    return (
      <text
        x={g.x0 + NM[ch].x * g.k}
        y={baseline}
        fill={color}
        opacity={fx.opacity ?? 1}
        style={style}
        transform={`translate(${(fx.dx ?? 0) + pcx} ${(fx.dy ?? 0) + pcy}) scale(${fx.scale ?? 1}) translate(${-pcx} ${-pcy})`}
      >
        {ch}
      </text>
    );
  };
  return (
    <g>
      {L("N")}
      {L("s")}
      {L("h")}
      <g transform={`translate(${g.ringX} ${g.ringY}) scale(${ringScale})`}>
        <circle r={r} fill="none" stroke={ring} strokeWidth={NM.ring.stroke * g.k} strokeDasharray={circ} strokeDashoffset={circ * (1 - ringDraw)} transform="rotate(-90)" />
        {dotGlow > 0 && <circle r={NM.ring.dot * g.k * 2.6} fill={ring} opacity={0.35 * dotGlow} />}
        <circle r={NM.ring.dot * g.k * dotScale} fill={dot} />
      </g>
    </g>
  );
};
