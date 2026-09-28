import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "../lib/theme";
import { ease, tw } from "../lib/motion";

// Diagonal stripe wipe. phase "in": stripes sweep in from the left until they
// tile the frame. phase "out": they continue off to the right, uncovering.
const COUNT = 9;
const SPACING = 300;
const WIDTH = 360;

export const Stripes: React.FC<{ f: number; phase: "in" | "out"; start: number; dur?: number }> = ({ f, phase, start, dur = 16 }) => (
  <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
    {Array.from({ length: COUNT }).map((_, k) => {
      // stagger + per-stripe duration fit exactly inside [start, start + dur]
      const stag = 1.2;
      const d = dur - (COUNT - 1) * stag;
      const s0 = start + k * stag;
      const base = -420 + k * SPACING;
      let x: number;
      if (phase === "in") {
        const p = tw(f, [s0, s0 + d], [0, 1], ease.expoOut);
        x = base - (1 - p) * 2600;
      } else {
        const p = tw(f, [s0, s0 + d], [0, 1], ease.expoIn);
        x = base + p * 2600;
      }
      return (
        <div
          key={k}
          style={{
            position: "absolute",
            top: -20,
            left: x,
            width: WIDTH,
            height: 1120,
            background: k % 2 === 0 ? C.lime : C.violet,
            transform: "skewX(-20deg)",
          }}
        />
      );
    })}
  </AbsoluteFill>
);
