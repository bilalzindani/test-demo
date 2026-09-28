import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { C, F } from "../lib/theme";
import { ease, impactShake, lerp, sp, springs, tw } from "../lib/motion";
import { LOGO } from "../lib/timeline";
import { scramble } from "../lib/text";
import { Words } from "../components/Kinetic";
import { Spark, Wordmark, wordmarkGeometry } from "../components/Wordmark";

// The drop. The dot holds its breath, detonates into a lime field, the
// wordmark slams in letter by letter, then the camera dives through the
// "o" — straight into the dot — and out the other side into the next scene.

const SIZE = 340;
const BASE = 560;
const G = wordmarkGeometry(SIZE, 960, BASE);

export const Logo: React.FC = () => {
  const f = useCurrentFrame();
  const d = LOGO.drop;

  // anticipation → detonation
  const pre = tw(f, [0, d], [0, 1], ease.in);
  const dotR = lerp(8, 5, pre);
  const flood = tw(f, [d, d + 10], [0, 1], ease.expoOut);
  const floodR = lerp(5, 1250, flood);

  const shake = impactShake(f, d, 26, 16, "drop");
  const bumps = LOGO.letters.map((t, i) => impactShake(f, t, 7, 7, `bump${i}`));
  const sx = shake.x + bumps.reduce((a, b) => a + b.x, 0);
  const sy = shake.y + bumps.reduce((a, b) => a + b.y, 0);

  const slam = (t: number) => {
    const p = tw(f, [t, t + 9], [0, 1], ease.expoOut);
    return { scale: lerp(2.6, 1, p), opacity: tw(f, [t, t + 2]), dy: lerp(-30, 0, p) };
  };

  // zoom through the ring's dot
  const z = tw(f, LOGO.zoom, [0, 1], ease.expoIn);
  const S = Math.exp(Math.log(95) * z);
  const tx = lerp(G.ringX, 960, z);
  const ty = lerp(G.ringY, 540, z);
  const zoomT = `translate(${tx} ${ty}) scale(${S}) translate(${-G.ringX} ${-G.ringY})`;

  const subP = tw(f, LOGO.subtitle, [0, 1], ease.linear);
  const sparkIn = sp(f, springs.pop, 18);
  const specIn = tw(f, [22, 40], [0, 1], ease.expoOut);
  const w = G.right - G.left;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* pre-drop dot */}
      {f < d + 2 && (
        <>
          <div
            style={{
              position: "absolute",
              left: 960 - 90,
              top: 540 - 90,
              width: 180,
              height: 180,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(200,255,46,0.45), transparent 62%)",
            }}
          />
          <div style={{ position: "absolute", left: 960 - dotR, top: 540 - dotR, width: dotR * 2, height: dotR * 2, borderRadius: "50%", background: C.lime }} />
        </>
      )}

      {/* lime flood */}
      {f >= d && (
        <div
          style={{
            position: "absolute",
            left: 960 - floodR,
            top: 540 - floodR,
            width: floodR * 2,
            height: floodR * 2,
            borderRadius: "50%",
            background: C.lime,
          }}
        />
      )}

      {f >= d && (
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {/* shockwaves */}
          {[d, d + 5].map((t0, i) => {
            const p = tw(f, [t0, t0 + 26], [0, 1], ease.out);
            if (p <= 0 || p >= 1) return null;
            return <circle key={i} cx={960} cy={540} r={p * 1500} fill="none" stroke={C.ink} strokeWidth={lerp(16, 1, p)} opacity={0.3 * (1 - p)} />;
          })}

          <g transform={`translate(${sx} ${sy})`}>
            <g transform={zoomT}>
              {/* spec marks */}
              <g opacity={0.45 * specIn} stroke={C.ink} strokeWidth={2}>
                <line x1={G.left} y1={G.top - 46} x2={G.left + w * specIn} y2={G.top - 46} />
                <line x1={G.left} y1={G.top - 56} x2={G.left} y2={G.top - 36} />
                <line x1={G.right} y1={G.top - 56} x2={G.right} y2={G.top - 36} opacity={specIn >= 0.99 ? 1 : 0} />
                {[
                  [G.left - 34, G.top - 10],
                  [G.right + 34, G.top - 10],
                  [G.left - 34, BASE + 26],
                  [G.right + 34, BASE + 26],
                ].map(([x, y], i) => (
                  <g key={i}>
                    <line x1={x - 14 * specIn} y1={y} x2={x + 14 * specIn} y2={y} />
                    <line x1={x} y1={y - 14 * specIn} x2={x} y2={y + 14 * specIn} />
                  </g>
                ))}
              </g>
              <text
                x={960}
                y={G.top - 58}
                textAnchor="middle"
                fill={C.ink}
                opacity={0.55 * tw(f, [30, 38])}
                style={{ fontFamily: F.mono, fontSize: 16, letterSpacing: "0.2em" }}
              >
                {`${Math.round(w)} PX · ARCHIVO 900 / WDTH 112`}
              </text>

              <Wordmark
                size={SIZE}
                cx={960}
                baseline={BASE}
                color={C.ink}
                ringColor={C.ink}
                dotColor={C.ink}
                letters={{ n: slam(LOGO.letters[0]), s: slam(LOGO.letters[2]), h: slam(LOGO.letters[3]) }}
                ringDraw={tw(f, [LOGO.letters[1], LOGO.letters[1] + 12], [0, 1], ease.expoOut)}
                dotScale={sp(f, springs.pop, LOGO.letters[1] + 6)}
              />
              <Spark x={G.right + 46} y={G.top + 6} size={46} color={C.ink} rot={f * 3} scale={sparkIn} />

              <text
                x={960 + 11}
                y={BASE + 96}
                textAnchor="middle"
                fill={C.ink}
                style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 38, letterSpacing: "0.58em" }}
              >
                {scramble("AI AUTOMATION", subP, f, "aiauto")}
              </text>
            </g>
          </g>

          {/* speed lines as we dive */}
          {Array.from({ length: 40 }).map((_, i) => {
            const a = (i / 40) * Math.PI * 2 + random(`zl${i}`) * 0.15;
            const t = tw(f, [LOGO.zoom[0] + 8 + random(`zt${i}`) * 8, LOGO.zoom[1] - 2], [0, 1], ease.in);
            if (t <= 0 || t >= 1) return null;
            const r0 = lerp(120, 1100, t);
            return (
              <line
                key={i}
                x1={960 + Math.cos(a) * r0}
                y1={540 + Math.sin(a) * r0}
                x2={960 + Math.cos(a) * (r0 + 180 + 300 * t)}
                y2={540 + Math.sin(a) * (r0 + 180 + 300 * t)}
                stroke={C.ink}
                strokeWidth={2.5}
                opacity={0.5 * Math.sin(Math.PI * t)}
              />
            );
          })}
        </svg>
      )}

      {/* tagline */}
      {f >= d && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: BASE + 150,
            display: "flex",
            justifyContent: "center",
            transform: `translate(${sx}px, ${sy}px) translateY(${z * 900}px) scale(${1 + z * 3})`,
            opacity: 1 - tw(f, [LOGO.zoom[0], LOGO.zoom[0] + 14]),
          }}
        >
          <Words
            segs={[{ t: "Your" }, { t: "always-on", accent: true, color: C.ink }, { t: "AI workforce." }]}
            start={LOGO.tagline[0]}
            stagger={3}
            size={54}
            weight={700}
            width={100}
            color={C.ink}
            tracking="-0.02em"
          />
        </div>
      )}
    </AbsoluteFill>
  );
};
