import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import { C } from "../lib/theme";

// Persistent world behind every scene: ink with two slow, drifting light
// pools (violet + lime). Scenes with their own full-bleed color cover it.
export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const ax = 30 + noise2D("bd-ax", t * 0.08, 0) * 18;
  const ay = 35 + noise2D("bd-ay", 0, t * 0.08) * 16;
  const bx = 72 + noise2D("bd-bx", t * 0.07, 3) * 16;
  const by = 70 + noise2D("bd-by", 5, t * 0.07) * 14;
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${ax}% ${ay}%, rgba(124,92,255,0.16), transparent 42%),
                       radial-gradient(circle at ${bx}% ${by}%, rgba(200,255,46,0.07), transparent 38%)`,
        }}
      />
    </AbsoluteFill>
  );
};

// Dot grid used by diagram scenes (leads, workflow).
export const DotGrid: React.FC<{ gap?: number; opacity?: number; color?: string; offsetX?: number; offsetY?: number }> = ({
  gap = 40,
  opacity = 0.12,
  color = "243,241,234",
  offsetX = 0,
  offsetY = 0,
}) => (
  <AbsoluteFill
    style={{
      backgroundImage: `radial-gradient(rgba(${color},${opacity}) 1.4px, transparent 1.6px)`,
      backgroundSize: `${gap}px ${gap}px`,
      backgroundPosition: `${offsetX}px ${offsetY}px`,
    }}
  />
);
