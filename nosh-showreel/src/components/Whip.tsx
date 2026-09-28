import React from "react";
import { AbsoluteFill } from "remotion";

// One continuous camera move shared by both sides of a whip transition.
// t = frames since the whip started, over `dur` frames.
export const whipCurve = (t: number, dur: number) => {
  const u = Math.min(1, Math.max(0, t / dur));
  // smootherstep: accelerate hard, decelerate hard, symmetric
  const q = u * u * u * (u * (u * 6 - 15) + 10);
  const travel = 2150;
  return { out: -q * travel, in: (1 - q) * travel, blur: Math.sin(Math.PI * u) * 80 };
};

// Whip-pan wrapper: translates its content horizontally and applies a real
// directional (x-only) Gaussian motion blur via an inline SVG filter.
export const Whip: React.FC<{ id: string; x: number; blur: number; children: React.ReactNode }> = ({ id, x, blur, children }) => (
  <AbsoluteFill style={{ transform: `translateX(${x}px)`, filter: blur > 0.5 ? `url(#${id})` : undefined }}>
    {blur > 0.5 && (
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs>
          <filter id={id} x="-20%" y="0%" width="140%" height="100%" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation={`${blur} 0`} />
          </filter>
        </defs>
      </svg>
    )}
    {children}
  </AbsoluteFill>
);
