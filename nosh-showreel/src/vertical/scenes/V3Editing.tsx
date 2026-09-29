import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import { Scissors } from "lucide-react";
import { F, archivo } from "../../lib/theme";
import { ease, lerp, sp, springs, tw } from "../../lib/motion";
import { timecode } from "../../lib/text";
import { B } from "../theme";
import { EDITV, VS } from "../timeline";
import { KWord, VTag, fit } from "../components/DType";
import { level } from "../components/Frame";
import { Iris, VWhip, vWhipCurve } from "../components/Transitions";
import { LOG_FILTER, Shot, ShotName } from "../shots/Shots";

// 01 — Video editing, shown as a working NLE: razor cuts ripple-delete the
// junk, the timeline zooms to fit, playback cuts shots on the beat, a log→
// graded wipe with scopes, beat markers + SFX, keyframed title. Iris out.

const MON = { x: 60, y: 520, w: 960, h: 540 };
const TLX = 40;
const TLY = 1112;
const TLW = 1000;
const X0 = 140;
const AREA = 880;
const TRK = { V2: 1172, V1: 1260, A1: 1348, A2: 1436 };
const CLIPS: { shot: ShotName; name: string; grad: string }[] = [
  { shot: "dunes", name: "A001_DUNES", grad: "linear-gradient(180deg,#3E1A7E,#A04FD0 70%,#2C1257)" },
  { shot: "city", name: "A002_CITY", grad: "linear-gradient(180deg,#06030E,#1C0B38 55%,#4A2388)" },
  { shot: "ocean", name: "A003_OCEAN", grad: "linear-gradient(180deg,#6A2FB8,#F4A6DA 46%,#4B2084 56%,#0C0520)" },
  { shot: "peaks", name: "A004_PEAKS", grad: "linear-gradient(180deg,#04020B,#3B1D72 62%,#1A0C33)" },
  { shot: "astro", name: "B001_ASTRO", grad: "linear-gradient(180deg,#07020F,#5A2AA6 70%,#0C0519)" },
  { shot: "creator", name: "C001_TALENT", grad: "linear-gradient(180deg,#2A1545,#8B5CF6 62%,#120A22)" },
];
const G0 = 110;
const J0 = 45;
const SEG = AREA / CLIPS.length;

const layout = (f: number) => {
  const fitP = tw(f, [80, 92], [0, 1], ease.inOut);
  const gw = lerp(G0, SEG, fitP);
  const out: { x: number; w: number; junk: boolean; k: number }[] = [];
  let x = X0;
  CLIPS.forEach((_, k) => {
    out.push({ x, w: gw, junk: false, k });
    x += gw;
    if (k < 4) {
      const cut = EDITV.cuts[k];
      const jw = J0 * (1 - tw(f, [cut + 2, cut + 10], [0, 1], ease.inOut));
      if (jw > 0.5) out.push({ x, w: jw, junk: true, k });
      x += jw;
    }
  });
  return out;
};

const Chip: React.FC<{ text: string; f: number; at: number }> = ({ text, f, at }) => {
  // a tamed pop: the spring's overshoot moves the chip, never grows it into its neighbours
  const s = sp(f, springs.pop, at);
  return (
    <div
      style={{
        padding: "14px 24px",
        borderRadius: 999,
        border: `2px solid ${B.lavender}`,
        background: "rgba(139,92,246,0.14)",
        color: B.mist,
        fontFamily: F.ui,
        fontSize: 30,
        fontWeight: 650,
        transform: `translateY(${(1 - s) * 34}px) scale(${lerp(0.82, 1, Math.min(1, s))})`,
        opacity: tw(f, [at, at + 4]),
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};

export const VEditing: React.FC = () => {
  const f = useCurrentFrame();
  const g = VS.editing.from + f; // global frame (audio envelope)
  const whip = vWhipCurve(f, EDITV.whipIn[1]);
  const L = layout(f);
  const [p0, p1] = EDITV.playhead;
  const phX = X0 + AREA * tw(f, [p0, p1], [0, 1], ease.linear);
  const idx = Math.min(CLIPS.length - 1, Math.max(0, Math.floor((phX - X0) / SEG - 1e-6)));
  const shot = f < p0 ? CLIPS[0] : CLIPS[idx];
  const gradeP = tw(f, EDITV.grade, [0, 1], ease.inOut);
  const playing = f >= p0 && f < p1;
  const [w0, w1, w2, w3] = EDITV.words;
  const wordSize = (t: string) => Math.min(200, fit(t, 820, 900, 100, -0.02));
  const bladeK = EDITV.cuts.findIndex((c) => f < c + 4);
  const titleIn = tw(f, [EDITV.keyframes - 8, EDITV.keyframes + 4], [0, 1], ease.expoOut);
  const irisP = tw(f, EDITV.iris, [0, 1], ease.in);

  const preview = (filter?: string) => <Shot name={shot.shot} t={f + idx * 40} filter={filter} amp={0.4 + 0.4 * Math.sin(f * 0.7)} />;

  return (
    <AbsoluteFill>
      <VWhip id="whip-edit" y={whip.in} blur={whip.blur}>
        <AbsoluteFill style={{ transform: "translateY(70px)" }}>
        <VTag idx="01" label="VIDEO EDITING" f={f} start={4} y={226} out={w2 - 6} />

        {/* beat words */}
        <KWord text="CUT." f={f} start={w0} mode={f >= EDITV.cuts[0] && f < EDITV.cuts[0] + 12 ? "slice" : "slam"} slice={tw(f, [EDITV.cuts[0], EDITV.cuts[0] + 4]) - tw(f, [EDITV.cuts[0] + 6, EDITV.cuts[0] + 12])} size={wordSize("CUT.")} y={290} out={w1 - 6} />
        <KWord text="GRADE." f={f} start={w1} mode="outlineFill" fill={gradeP} size={wordSize("GRADE.")} y={290} color={B.lavender} stroke={B.lilac} out={w2 - 6} />
        <KWord
          text="SOUND."
          f={f}
          start={w2}
          mode="bounce"
          size={wordSize("SOUND.")}
          y={290}
          colors={[B.white, B.mist, B.lilac, B.lavender, B.violet, B.white]}
          amp={(i) => Math.min(1, level(g - i * 2, "low") * 1.2 + Math.abs(noise2D("snd", i, f * 0.3)) * 0.35)}
          out={w3 - 6}
        />
        <KWord text="MOTION." f={f} start={w3} mode="fly" size={wordSize("MOTION.")} y={290} color={B.white} out={EDITV.chips - 6} />
        <div style={{ position: "absolute", left: 60, width: 960, top: 318, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16 }}>
          {f >= EDITV.chips &&
            ["Reels & Shorts", "YouTube", "Ads", "Podcasts", "Brand films", "Color grading", "Sound design"].map((c, i) => (
              <Chip key={c} text={c} f={f} at={EDITV.chips + i * 3} />
            ))}
        </div>

        {/* monitor */}
        <div style={{ position: "absolute", left: MON.x, top: MON.y - 40, width: MON.w, display: "flex", justifyContent: "space-between", fontFamily: F.mono, fontSize: 20, letterSpacing: "0.14em", color: B.dim }}>
          <span>
            <span style={{ color: playing ? B.violet : B.faint }}>▶</span> PROGRAM · SEQ 01
          </span>
          <span style={{ color: B.mist }}>{timecode(Math.max(0, f - p0) * (f >= p0 ? 1 : 0))}</span>
        </div>
        <div style={{ position: "absolute", left: MON.x, top: MON.y, width: MON.w, height: MON.h, borderRadius: 22, overflow: "hidden", boxShadow: `0 0 0 3px ${B.plum}, 0 40px 80px rgba(0,0,0,0.6)` }}>
          <div style={{ position: "absolute", inset: 0 }}>{preview(LOG_FILTER)}</div>
          <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${(1 - gradeP) * 100}% 0 0)` }}>{preview()}</div>
          {gradeP > 0 && gradeP < 1 && (
            <>
              <div style={{ position: "absolute", top: 0, bottom: 0, left: MON.w * gradeP - 2, width: 4, background: B.white, boxShadow: `0 0 18px ${B.lavender}` }} />
              <div style={{ position: "absolute", top: MON.h / 2 - 26, left: MON.w * gradeP - 26, width: 52, height: 52, borderRadius: 26, background: B.white, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.mono, fontWeight: 800, color: B.purple, fontSize: 22 }}>⇆</div>
            </>
          )}
          {f >= EDITV.grade[0] - 6 && f < EDITV.grade[1] + 14 && (
            <>
              <div style={{ position: "absolute", left: 20, top: 18, padding: "6px 12px", borderRadius: 8, background: "rgba(0,0,0,0.55)", color: B.mist, fontFamily: F.mono, fontSize: 18, letterSpacing: "0.14em" }}>GRADED</div>
              <div style={{ position: "absolute", right: 20, top: 18, padding: "6px 12px", borderRadius: 8, background: "rgba(0,0,0,0.55)", color: B.dim, fontFamily: F.mono, fontSize: 18, letterSpacing: "0.14em" }}>LOG</div>
            </>
          )}
          {/* kinetic title overlay (motion phase) */}
          {titleIn > 0 && (
            <div style={{ position: "absolute", left: 0, right: 0, top: MON.h * 0.66, textAlign: "center" }}>
              <div style={{ display: "inline-flex", overflow: "hidden", fontFamily: F.display, fontVariationSettings: archivo(900, 125), fontSize: 92, color: B.white, letterSpacing: "0.06em" }}>
                {"NEW DROP".split("").map((ch, i) => (
                  <span key={i} style={{ display: "inline-block", transform: `translateY(${tw(f - EDITV.keyframes - i * 1.5, [0, 10], [110, 0], ease.expoOut)}%)` }}>
                    {ch === " " ? " " : ch}
                  </span>
                ))}
              </div>
              <div style={{ height: 6, width: 420 * titleIn, margin: "10px auto 0", background: B.violet }} />
            </div>
          )}
        </div>
        {/* scopes */}
        {f >= EDITV.grade[0] + 4 && f < EDITV.grade[1] + 22 && (
          <div
            style={{
              position: "absolute",
              left: 700,
              top: 890,
              width: 300,
              height: 150,
              borderRadius: 16,
              background: "rgba(10,6,18,0.82)",
              border: `1.5px solid ${B.plumLine}`,
              padding: 12,
              opacity: tw(f, [EDITV.grade[0] + 4, EDITV.grade[0] + 10]) * (1 - tw(f, [EDITV.grade[1] + 14, EDITV.grade[1] + 22])),
            }}
          >
            <div style={{ fontFamily: F.mono, fontSize: 14, color: B.dim, letterSpacing: "0.14em" }}>WAVEFORM · LUMA</div>
            <svg width={276} height={100}>
              {Array.from({ length: 60 }).map((_, i) => {
                const h = 30 + 50 * Math.abs(noise2D("scope", i * 0.12, f * 0.05)) * lerp(0.45, 1, gradeP);
                const y0 = 96 - h - 10 * lerp(1, 0, gradeP);
                return <line key={i} x1={i * 4.6 + 2} x2={i * 4.6 + 2} y1={96 - 6} y2={y0} stroke={i % 3 === 0 ? B.lilac : B.lavender} strokeOpacity={0.55} strokeWidth={2} />;
              })}
            </svg>
          </div>
        )}

        {/* timeline panel */}
        <div style={{ position: "absolute", left: TLX, top: TLY, width: TLW, height: 384, borderRadius: 22, background: "rgba(10,6,18,0.9)", border: `1.5px solid ${B.plumLine}` }} />
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          {Array.from({ length: 19 }).map((_, k) => {
            const x = X0 + k * (AREA / 18);
            return (
              <g key={k}>
                <line x1={x} x2={x} y1={TLY + 34} y2={TLY + (k % 3 === 0 ? 14 : 24)} stroke={B.faint} strokeWidth={2} />
                {k % 3 === 0 && (
                  <text x={x + 4} y={TLY + 26} fill={B.dim} style={{ fontFamily: "JetBrains Mono", fontSize: 15 }}>
                    {(k * 0.5).toFixed(1)}s
                  </text>
                )}
                {f >= EDITV.beatMarks + k * 3 && k < 18 && (
                  <path
                    d={`M ${x + AREA / 36 - 8} ${TLY + 36} L ${x + AREA / 36 + 8} ${TLY + 36} L ${x + AREA / 36} ${TLY + 50} Z`}
                    fill={B.violet}
                    transform={`translate(0 ${(1 - sp(f, springs.pop, EDITV.beatMarks + k * 3)) * -14})`}
                  />
                )}
              </g>
            );
          })}
        </svg>
        {(
          [
            ["V2", TRK.V2],
            ["V1", TRK.V1],
            ["A1", TRK.A1],
            ["A2", TRK.A2],
          ] as [string, number][]
        ).map(([n, y]) => (
          <div key={n} style={{ position: "absolute", left: TLX + 14, top: y, width: 72, height: n === "A2" ? 56 : 76, borderRadius: 12, background: B.plum, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.mono, fontWeight: 700, fontSize: 22, color: n[0] === "V" ? B.lilac : B.lavender }}>
            {n}
          </div>
        ))}
        {/* V1 clips + junk */}
        {L.map((c, i) =>
          c.junk ? (
            <div
              key={`j${i}`}
              style={{
                position: "absolute",
                left: c.x + 2,
                top: TRK.V1,
                width: Math.max(0, c.w - 4),
                height: 76,
                borderRadius: 10,
                background: "repeating-linear-gradient(135deg, rgba(221,214,254,0.16) 0 8px, rgba(221,214,254,0.05) 8px 16px)",
                border: `1.5px dashed ${B.faint}`,
                opacity: f >= EDITV.cuts[c.k] ? 0.4 : 1,
              }}
            />
          ) : (
            <div
              key={`c${i}`}
              style={{
                position: "absolute",
                left: c.x + 2,
                top: TRK.V1,
                width: c.w - 4,
                height: 76,
                borderRadius: 10,
                background: CLIPS[c.k].grad,
                border: `2px solid ${c.k === idx && playing ? B.white : "rgba(221,214,254,0.25)"}`,
                overflow: "hidden",
              }}
            >
              <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(90deg, transparent 0 34px, rgba(0,0,0,0.35) 34px 36px)" }} />
              <div style={{ position: "absolute", left: 8, bottom: 6, fontFamily: F.mono, fontSize: 13, color: B.white, textShadow: "0 1px 3px #000" }}>{CLIPS[c.k].name}</div>
            </div>
          ),
        )}
        {/* V2 title clip + keyframes */}
        {f >= EDITV.keyframes - 10 && (
          <div
            style={{
              position: "absolute",
              left: X0 + SEG * 3 + 20,
              top: TRK.V2,
              width: 300 * tw(f, [EDITV.keyframes - 10, EDITV.keyframes], [0, 1], ease.expoOut),
              height: 76,
              borderRadius: 10,
              background: `linear-gradient(90deg, ${B.purple}, ${B.violet})`,
              border: `2px solid ${B.lilac}`,
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", left: 10, top: 8, fontFamily: F.mono, fontSize: 14, color: B.white }}>TITLE · NEW DROP</div>
            {[0, 1, 2, 3].map((k) => (
              <div key={k} style={{ position: "absolute", left: 30 + k * 70, bottom: 12, width: 16, height: 16, background: B.mist, transform: `rotate(45deg) scale(${sp(f, springs.pop, EDITV.keyframes + 6 + k * 6)})` }} />
            ))}
          </div>
        )}
        {/* A1 music */}
        <div style={{ position: "absolute", left: X0 + 2, top: TRK.A1, width: AREA - 4, height: 76, borderRadius: 10, background: "rgba(124,77,222,0.22)", border: `1.5px solid rgba(167,139,250,0.5)`, overflow: "hidden" }}>
          <svg width={AREA} height={76}>
            {Array.from({ length: 110 }).map((_, i) => {
              const live = tw(f, [EDITV.words[2], EDITV.words[2] + 10]);
              const h = 8 + 50 * Math.abs(noise2D("wav", i * 0.25, live * f * 0.08)) * (0.5 + live * (0.5 + level(g - i, "rms")));
              return <rect key={i} x={i * 8 + 1} y={38 - h / 2} width={4} height={h} rx={2} fill={B.lavender} opacity={0.5 + 0.4 * live} />;
            })}
          </svg>
          <div style={{ position: "absolute", left: 10, top: 6, fontFamily: F.mono, fontSize: 13, color: B.mist }}>MUSIC · FINAL_STEP.wav</div>
        </div>
        {/* A2 sfx */}
        {[
          ["WHOOSH", 200, 60],
          ["HIT", 214, 330],
          ["RISER", 228, 560],
        ].map(([n, at, x]) =>
          f >= (at as number) ? (
            <div
              key={n as string}
              style={{
                position: "absolute",
                left: X0 + (x as number),
                top: TRK.A2,
                width: 120,
                height: 56,
                borderRadius: 10,
                background: "rgba(221,214,254,0.14)",
                border: `1.5px solid ${B.lilac}`,
                fontFamily: F.mono,
                fontSize: 15,
                color: B.mist,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `scale(${sp(f, springs.pop, at as number)})`,
              }}
            >
              {n}
            </div>
          ) : null,
        )}
        {/* razor blade cursor */}
        {bladeK >= 0 && f >= 20 && f < EDITV.cuts[3] + 6 && (() => {
          const target = L.find((c) => c.junk && c.k === bladeK);
          const tx = target ? target.x + target.w / 2 : X0;
          const prev = bladeK > 0 ? L.find((c) => c.junk && c.k === bladeK - 1) : undefined;
          const fromX = prev ? prev.x : X0 - 40;
          const mv = tw(f, [EDITV.cuts[bladeK] - 9, EDITV.cuts[bladeK] - 1], [0, 1], ease.inOut);
          const x = lerp(fromX, tx, mv);
          const hit = f >= EDITV.cuts[bladeK] && f < EDITV.cuts[bladeK] + 4;
          return (
            <>
              {hit && <div style={{ position: "absolute", left: tx - 2, top: TRK.V1 - 8, width: 4, height: 92, background: B.white, boxShadow: `0 0 20px ${B.lilac}` }} />}
              <div style={{ position: "absolute", left: x - 26, top: TRK.V1 - 64, width: 52, height: 52, borderRadius: 26, background: B.white, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(0,0,0,0.5)", transform: `scale(${hit ? 0.86 : 1})` }}>
                <Scissors size={28} color={B.purple} strokeWidth={2.6} />
              </div>
            </>
          );
        })()}
        {/* playhead */}
        <div style={{ position: "absolute", left: phX - 1.5, top: TLY + 30, width: 3, height: 352, background: B.violet, boxShadow: `0 0 12px ${B.violet}` }} />
        <div style={{ position: "absolute", left: phX - 12, top: TLY + 18, width: 24, height: 20, background: B.violet, clipPath: "polygon(0 0, 100% 0, 100% 55%, 50% 100%, 0 55%)" }} />
        </AbsoluteFill>
      </VWhip>
      <Iris p={irisP} />
    </AbsoluteFill>
  );
};
