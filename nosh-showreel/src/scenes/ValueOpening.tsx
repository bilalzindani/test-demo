import React from "react";
import { AbsoluteFill } from "remotion";
import { C, F, archivo } from "../lib/theme";
import { lerp, tw } from "../lib/motion";

// First card of "The outcome": lime field, giant 24/7. Rendered both on the
// back faces of the industry panels (flip transition) and as the real scene,
// so the hand-off is pixel-identical.
export const ValueOpening: React.FC<{ f: number }> = ({ f }) => {
  const wdth = lerp(100, 116, tw(f, [0, 30]));
  const label = "ALWAYS ON · EVERY CALL, CHAT & LEAD";
  const n = Math.floor(tw(f, [4, 22]) * label.length);
  return (
    <AbsoluteFill style={{ background: C.lime }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 180,
          textAlign: "center",
          fontFamily: F.display,
          fontVariationSettings: archivo(900, wdth),
          fontSize: 560,
          lineHeight: 1,
          letterSpacing: "-0.05em",
          color: C.ink,
        }}
      >
        24/7
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 820,
          textAlign: "center",
          fontFamily: F.mono,
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: "0.3em",
          color: C.ink,
        }}
      >
        {label.slice(0, n)}
        <span style={{ opacity: n < label.length ? 1 : 0 }}>▌</span>
      </div>
    </AbsoluteFill>
  );
};
