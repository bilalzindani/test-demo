import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ShieldCheck } from "lucide-react";
import { C, F, archivo } from "../lib/theme";
import { ease, lerp, sp, springs, tw } from "../lib/motion";
import { VALUE } from "../lib/timeline";
import { Words } from "../components/Kinetic";
import { ValueOpening } from "./ValueOpening";

// 06 — The outcome. Four statements, one per bar-half, each cut in with a
// different transition: (flip hand-off) → push → iris → split doors.

const Clock: React.FC<{ f: number }> = ({ f }) => {
  const p = tw(f, [0, 26], [0, 1], ease.expoOut);
  const minute = -720 * p;
  const hour = -60 * p;
  return (
    <svg width={420} height={420} viewBox="-210 -210 420 420">
      <circle r={196} fill="none" stroke={C.paper} strokeOpacity={0.18} strokeWidth={3} />
      <circle r={196} fill="none" stroke={C.lime} strokeWidth={6} strokeDasharray={`${1231 * p} 2000`} transform="rotate(-90)" strokeLinecap="round" />
      {Array.from({ length: 60 }).map((_, i) => {
        const a = (i / 60) * Math.PI * 2;
        const big = i % 5 === 0;
        return (
          <line
            key={i}
            x1={Math.cos(a) * (big ? 160 : 170)}
            y1={Math.sin(a) * (big ? 160 : 170)}
            x2={Math.cos(a) * 180}
            y2={Math.sin(a) * 180}
            stroke={C.paper}
            strokeOpacity={big ? 0.8 : 0.3}
            strokeWidth={big ? 4 : 2}
          />
        );
      })}
      <line x1={0} y1={0} x2={0} y2={-100} stroke={C.paper} strokeWidth={10} strokeLinecap="round" transform={`rotate(${hour})`} />
      <line x1={0} y1={0} x2={0} y2={-150} stroke={C.lime} strokeWidth={6} strokeLinecap="round" transform={`rotate(${minute})`} />
      <circle r={12} fill={C.lime} />
    </svg>
  );
};

export const Value: React.FC = () => {
  const f = useCurrentFrame();
  const [a, b, c, d] = VALUE.cards;

  const bIn = tw(f, [b, b + 8], [0, 1], ease.expoOut);
  const cIn = tw(f, [c, c + 10], [0, 1], ease.expoOut);
  const dIn = tw(f, [d, d + 8], [0, 1], ease.expoOut);
  const lb = f - b;
  const lc = f - c;
  const ld = f - d;

  return (
    <AbsoluteFill>
      {/* A — 24/7 (continues from the flip) */}
      {f < b + 8 && <ValueOpening f={f - a} />}

      {/* B — push up: hours back */}
      {f >= b && f < c + 10 && (
        <AbsoluteFill style={{ background: C.ink, transform: `translateY(${(1 - bIn) * 1080}px)` }}>
          <div style={{ position: "absolute", left: 250, top: 330 }}>
            <Clock f={lb} />
          </div>
          <div style={{ position: "absolute", left: 800, top: 360 }}>
            <Words segs={[{ t: "Hours back," }]} start={b + 2} size={132} mode="rise" style={{}} />
            <Words segs={[{ t: "every week.", accent: true }]} start={b + 8} size={132} mode="rise" style={{ marginTop: 6 }} />
            <div style={{ fontFamily: F.mono, fontSize: 22, letterSpacing: "0.26em", color: C.paperDim, marginTop: 30, fontWeight: 700, opacity: tw(f, [b + 12, b + 18]) }}>
              BUSYWORK, HANDLED BY AGENTS
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* C — iris: your IP */}
      {f >= c && f < d + 8 && (
        <AbsoluteFill style={{ background: C.paper, clipPath: `circle(${cIn * 120}% at 50% 50%)` }}>
          <div style={{ position: "absolute", left: 260, top: 330, transform: `scale(${sp(lc, springs.pop)})` }}>
            <ShieldCheck size={330} color={C.violet} strokeWidth={1.5} style={{ strokeDasharray: 100, strokeDashoffset: 100 * (1 - tw(lc, [2, 22], [0, 1], ease.out)) }} />
          </div>
          <div style={{ position: "absolute", left: 760, top: 330 }}>
            <Words segs={[{ t: "Your strategy." }]} start={c + 2} size={126} color={C.ink} mode="rise" />
            <Words segs={[{ t: "Your IP.", accent: true, color: C.violet }]} start={c + 7} size={126} color={C.ink} mode="rise" style={{ marginTop: 6 }} />
            <div style={{ fontFamily: F.mono, fontSize: 22, letterSpacing: "0.26em", color: "rgba(7,8,12,0.6)", marginTop: 30, fontWeight: 700, opacity: tw(f, [c + 12, c + 18]) }}>
              YOU STAY IN CONTROL
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* D — split doors: ROI, faster */}
      {f >= d && (
        <AbsoluteFill>
          {[0, 1].map((side) => (
            <AbsoluteFill
              key={side}
              style={{
                background: C.violet,
                clipPath: side === 0 ? "inset(0 50% 0 0)" : "inset(0 0 0 50%)",
                transform: `translateX(${(1 - dIn) * (side === 0 ? -980 : 980)}px)`,
              }}
            >
              <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <line key={i} x1={1060} x2={1760} y1={330 + i * 120} y2={330 + i * 120} stroke={C.paper} strokeOpacity={0.14} strokeWidth={2} />
                ))}
                {(() => {
                  const pts = [
                    [1060, 800],
                    [1200, 760],
                    [1320, 780],
                    [1440, 640],
                    [1560, 590],
                    [1680, 420],
                    [1760, 330],
                  ];
                  const draw = tw(ld, [2, 22], [0, 1], ease.out);
                  const len = 1100;
                  const tip = pts[pts.length - 1];
                  return (
                    <>
                      <polyline
                        points={pts.map((p) => p.join(",")).join(" ")}
                        fill="none"
                        stroke={C.lime}
                        strokeWidth={10}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        strokeDasharray={len}
                        strokeDashoffset={len * (1 - draw)}
                      />
                      <circle cx={tip[0]} cy={tip[1]} r={20 * sp(ld, springs.pop, 20)} fill={C.lime} />
                    </>
                  );
                })()}
              </svg>
              <div style={{ position: "absolute", left: 150, top: 300 }}>
                <div
                  style={{
                    fontFamily: F.display,
                    fontVariationSettings: archivo(900, lerp(125, 100, tw(ld, [0, 14], [0, 1], ease.expoOut))),
                    fontSize: 230,
                    letterSpacing: "-0.04em",
                    color: C.paper,
                    lineHeight: 1,
                  }}
                >
                  ROI,
                </div>
                <div
                  style={{
                    fontFamily: F.serif,
                    fontStyle: "italic",
                    fontSize: 250,
                    color: C.lime,
                    lineHeight: 0.95,
                    transform: `translateX(${(1 - tw(ld, [4, 18], [0, 1], ease.expoOut)) * 120}px)`,
                    opacity: tw(ld, [4, 8]),
                  }}
                >
                  faster.
                </div>
              </div>
            </AbsoluteFill>
          ))}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
