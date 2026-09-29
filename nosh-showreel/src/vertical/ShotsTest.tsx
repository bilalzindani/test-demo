import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Shot, ShotName } from "./shots/Shots";

// Dev-only: contact grid of every procedural shot.
const NAMES: ShotName[] = ["dunes", "city", "ocean", "peaks", "astro", "creator"];
export const ShotsTest: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#000", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: 8 }}>
      {NAMES.map((n) => (
        <div key={n} style={{ position: "relative", overflow: "hidden", borderRadius: 8 }}>
          <Shot name={n} t={f} amp={0.5 + 0.5 * Math.sin(f * 0.6)} product={n === "creator" ? 1 : 0} />
        </div>
      ))}
    </AbsoluteFill>
  );
};
