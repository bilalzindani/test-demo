import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ease, impactShake, lerp, sp, tw } from "../../lib/motion";
import { B } from "../theme";
import { HOOKV } from "../timeline";
import { KWord, fit, measure } from "../components/DType";
import { Clapper } from "../components/Transitions";
import { LOG_FILTER, Shot, ShotName } from "../shots/Shots";

// 00 — "Great videos aren't shot. They're EDITED." over a wall of raw (log)
// clips; EDITED gets razor-sliced; a clapperboard claps on the first impact.

const TILES: ShotName[] = ["dunes", "city", "ocean", "peaks", "astro", "creator"];

export const VHook: React.FC = () => {
  const f = useCurrentFrame();
  const graded = tw(f, [HOOKV.edited, HOOKV.edited + 6]);
  const wallDim = 1 - tw(f, [HOOKV.clapper[0], HOOKV.clapper[0] + 12]) * 0.7;
  const wallOpacity = lerp(0.2, 0.42, graded) * wallDim;

  // type metrics
  const s1 = Math.min(170, fit("GREAT VIDEOS", 900));
  const s2 = Math.min(170, fit("AREN'T SHOT.", 900));
  const s3 = fit("EDITED.", 900, 900, 125, -0.03);
  const y1 = 540;
  const y2 = y1 + s1 * 1.02;
  const y3 = 960;
  const y4 = y3 + 92;
  const slice = tw(f, [HOOKV.slice, HOOKV.slice + 6], [0, 1], ease.expoOut) - tw(f, [HOOKV.slice + 12, HOOKV.slice + 20], [0, 1], ease.inOut);
  const slicing = f >= HOOKV.slice && f < HOOKV.slice + 22;
  const w3 = measure("EDITED.", s3, 900, 125, -0.03);
  const blade = tw(f, [HOOKV.slice - 3, HOOKV.slice + 3], [0, 1], ease.inOut);
  const textOut = HOOKV.clapper[0] - 2;

  // clapper
  const [c0, c1] = HOOKV.clapper;
  const drop = sp(f, { damping: 16, stiffness: 150, mass: 1 }, c0);
  const arm = 1 - tw(f, [c1 - 5, c1 - 1], [0, 1], ease.expoIn);
  const shake = impactShake(f, c1 - 1, 14, 6, "clap");

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* wall of raw clips */}
      <div
        style={{
          position: "absolute",
          left: 42,
          top: 300 - f * 0.9,
          width: 996,
          display: "grid",
          gridTemplateColumns: "repeat(3, 320px)",
          gap: 18,
          opacity: wallOpacity,
          transform: `scale(${1.04 - graded * 0.04})`,
        }}
      >
        {Array.from({ length: 21 }).map((_, i) => (
          <div key={i} style={{ width: 320, height: 180, borderRadius: 14, overflow: "hidden" }}>
            <Shot name={TILES[(i * 5) % TILES.length]} t={f + i * 17} filter={graded < 1 ? LOG_FILTER : undefined} amp={0.3} />
          </div>
        ))}
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 45% at 50% 50%, rgba(0,0,0,0.72), rgba(0,0,0,0.2))" }} />

      <KWord text="GREAT VIDEOS" f={f} start={HOOKV.line1} mode="rise" size={s1} y={y1} out={textOut} />
      <KWord text="AREN'T SHOT." f={f} start={HOOKV.line2} mode="rise" size={s2} y={y2} color={B.lilac} out={textOut} />
      <KWord text="THEY'RE" f={f} start={HOOKV.theyre} mode="decode" size={64} wght={700} wdth={125} tracking={0.3} y={y3} color={B.mist} out={textOut} />
      {!slicing ? (
        <KWord text="EDITED." f={f} start={HOOKV.edited} mode="slam" size={s3} wdth={125} tracking={-0.03} y={y4} color={B.violet} glow="rgba(139,92,246,0.55)" out={textOut} />
      ) : (
        <KWord text="EDITED." f={f} start={HOOKV.edited} mode="slice" slice={slice} size={s3} wdth={125} tracking={-0.03} y={y4} color={B.violet} />
      )}
      {/* razor blade streak along the cut */}
      {blade > 0 && blade < 1 && (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <line
            x1={540 - w3 / 2 - 40}
            y1={y4 + s3 * 0.66}
            x2={540 - w3 / 2 - 40 + (w3 + 80) * blade}
            y2={y4 + s3 * 0.66 - (s3 * 0.28) * blade}
            stroke={B.white}
            strokeWidth={5}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 12px ${B.lilac})` }}
          />
        </svg>
      )}

      {f >= c0 && (
        <div style={{ position: "absolute", inset: 0, transform: `translate(${shake.x}px, ${shake.y}px)` }}>
          <Clapper x={540} y={lerp(-700, 1000, drop)} arm={arm} scale={1.12} rot={lerp(-10, -2, drop)} />
        </div>
      )}
    </AbsoluteFill>
  );
};
