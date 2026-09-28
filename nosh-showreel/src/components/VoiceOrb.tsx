import React from "react";
import { interpolateColors, random } from "remotion";
import { noise2D, noise3D } from "@remotion/noise";
import { C } from "../lib/theme";
import { lerp, sp } from "../lib/motion";

// A 3D point-cloud sphere, projected by hand (no WebGL): Fibonacci
// distribution, two-axis rotation, simplex-noise displacement driven by a
// voice amplitude, depth-cued size/opacity/colour, and an assembly intro.

const N = 720;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const PTS = Array.from({ length: N }, (_, i) => {
  const y = 1 - (i / (N - 1)) * 2;
  const r = Math.sqrt(1 - y * y);
  const th = GOLDEN * i;
  return { x: Math.cos(th) * r, y, z: Math.sin(th) * r };
});

export const VoiceOrb: React.FC<{
  f: number;
  cx: number;
  cy: number;
  R: number;
  amp: number;
  assembleAt?: number;
  collapse?: number; // 0..1 → particles stream out to the left
}> = ({ f, cx, cy, R, amp, assembleAt = 0, collapse = 0 }) => {
  const t = f / 30;
  const yaw = f * 0.016;
  const pitch = 0.42 + Math.sin(f * 0.021) * 0.12;
  const cyw = Math.cos(yaw);
  const syw = Math.sin(yaw);
  const cp = Math.cos(pitch);
  const spt = Math.sin(pitch);
  const FOC = 1500;

  const dots = PTS.map((p, i) => {
    // displacement (voice)
    const n = noise3D("orb", p.x * 1.5 + t * 0.7, p.y * 1.5, p.z * 1.5 + t * 0.35);
    const band = Math.sin(p.y * 9 - t * 10) * 0.5 + 0.5;
    const d = 1 + amp * (0.2 * n + 0.1 * band) + Math.sin(f * 0.12) * 0.012;
    let x = p.x * d;
    let y = p.y * d;
    let z = p.z * d;
    // rotate Y then X
    const x1 = x * cyw + z * syw;
    const z1 = -x * syw + z * cyw;
    const y2 = y * cp - z1 * spt;
    const z2 = y * spt + z1 * cp;
    x = x1;
    y = y2;
    z = z2;

    // assembly: rush in from far outside
    const delay = random(`od${i}`) * 14;
    const a = sp(f - assembleAt - delay, { damping: 18, stiffness: 90, mass: 0.8 });
    const far = 3.2 + random(`of${i}`) * 3;
    const ax = lerp(p.x * far * 1.6, x, a);
    const ay = lerp(p.y * far, y, a);
    const az = lerp(z, z, a);

    // collapse: stream out left with turbulence
    const cd = Math.max(0, Math.min(1, collapse * 1.6 - random(`oc${i}`) * 0.6));
    const sx = ax - cd * cd * (5 + random(`os${i}`) * 5);
    const sy = ay + cd * noise2D("ocs", i * 0.1, cd * 2) * 0.8;

    const persp = FOC / (FOC - az * R);
    const depth = (az + 1) / 2; // 0 back … 1 front
    return {
      X: cx + sx * R * persp,
      Y: cy + sy * R * persp,
      r: (0.8 + 1.9 * depth) * persp,
      o: (0.18 + 0.82 * depth) * Math.min(1, a * 1.4),
      c: interpolateColors(depth, [0, 0.55, 1], [C.violetSoft, C.lime, "#E8FF9A"]),
      depth,
    };
  });
  dots.sort((a, b) => a.depth - b.depth);

  return (
    <g>
      {dots.map((d, i) => (
        <circle key={i} cx={d.X} cy={d.Y} r={d.r} fill={d.c} opacity={d.o} />
      ))}
    </g>
  );
};

// Radial spectrum ring (voice bars)
export const Spectrum: React.FC<{ f: number; cx: number; cy: number; r: number; amp: number; bars?: number; opacity?: number }> = ({
  f,
  cx,
  cy,
  r,
  amp,
  bars = 96,
  opacity = 1,
}) => {
  const t = f / 30;
  return (
    <g opacity={opacity}>
      {Array.from({ length: bars }).map((_, i) => {
        const a = (i / bars) * Math.PI * 2 + t * 0.15;
        const n = Math.abs(noise2D("spec", i * 0.23, t * 2.4));
        const len = 5 + 70 * amp * (0.25 + 0.75 * n);
        return (
          <line
            key={i}
            x1={cx + Math.cos(a) * r}
            y1={cy + Math.sin(a) * r}
            x2={cx + Math.cos(a) * (r + len)}
            y2={cy + Math.sin(a) * (r + len)}
            stroke={i % 8 === 0 ? C.paper : C.lime}
            strokeWidth={3}
            strokeLinecap="round"
            opacity={0.35 + 0.55 * n}
          />
        );
      })}
    </g>
  );
};
