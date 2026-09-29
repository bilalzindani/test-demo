import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import { Sparkles } from "lucide-react";
import { F, archivo } from "../../lib/theme";
import { ease, lerp, tw } from "../../lib/motion";
import { B } from "../theme";
import { AIV } from "../timeline";
import { KWord, ToneLine, VTag, fit } from "../components/DType";
import { Iris } from "../components/Transitions";
import { Shot } from "../shots/Shots";

// 02 — AI video editing: karaoke auto-captions → silence/filler removal →
// auto-reframe (the card itself morphs 16:9 → 9:16). Glitch cut out.

const CAP_WORDS = ["Wait…", "these", "captions", "are", "automatic?!"];
const speech = (f: number, start: number, end: number) => {
  if (f < start || f > end) return 0.05;
  return Math.max(0, 0.25 + 0.75 * Math.abs(noise2D("sp", f * 0.35, start)) * (0.5 + 0.5 * Math.abs(Math.sin(f * 0.9))));
};

const Label: React.FC<{ text: string; f: number; at: number }> = ({ text, f, at }) => (
  <div
    style={{
      position: "absolute",
      left: 24,
      top: 22,
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 16px",
      borderRadius: 999,
      background: "rgba(10,6,18,0.78)",
      border: `1.5px solid ${B.lavender}`,
      fontFamily: F.mono,
      fontSize: 20,
      fontWeight: 700,
      letterSpacing: "0.14em",
      color: B.mist,
      opacity: tw(f, [at, at + 6]),
      transform: `translateY(${(1 - tw(f, [at, at + 10], [0, 1], ease.expoOut)) * -16}px)`,
      zIndex: 3,
    }}
  >
    <Sparkles size={20} color={B.lavender} /> {text}
  </div>
);

export const VAIEdit: React.FC = () => {
  const f = useCurrentFrame();
  const [c0] = AIV.captions;
  const [s0, s1] = AIV.silence;
  const [r0] = AIV.reframe;
  const amp = speech(f, c0 + 4, c0 + 64) + (f > s0 && f < r0 ? speech(f, s0, s1) * 0.6 : 0);

  // card geometry: square → 16:9 (reframe start) → 9:16 (reframed)
  const toWide = tw(f, [r0, r0 + 10], [0, 1], ease.inOut);
  const toTall = tw(f, [r0 + 32, r0 + 52], [0, 1], ease.inOut);
  const cw = lerp(lerp(900, 900, toWide), 506, toTall);
  const ch = lerp(lerp(900, 506, toWide), 900, toTall);
  const cx = 540;
  const cy = 1070;
  const subjX = 1150 + Math.sin(f * 0.05) * 60;
  const focusX = lerp(800, subjX, toTall);
  const zoom = lerp(1, 1, toTall);
  const drawer = tw(f, [s0 + 2, s0 + 14], [0, 1], ease.expoOut) * (1 - tw(f, [r0 - 6, r0 + 4], [0, 1], ease.in));

  // glitch out
  const [gl0, gl1] = AIV.glitch;
  const glitchOn = f >= gl0 && f < gl1 && (f - gl0) % 3 !== 2;
  const bands = 7;

  const content = (
    <AbsoluteFill>
      <VTag idx="02" label="AI VIDEO EDITING" f={f} start={6} y={296} />
      <KWord text="AI-POWERED." f={f} start={AIV.headline} mode="stretch" size={Math.min(170, fit("AI-POWERED.", 900))} y={346} color={B.lavender} glow="rgba(139,92,246,0.4)" />
      <ToneLine
        words={[
          { t: "Human-directed.", c: B.mist },
        ]}
        f={f}
        start={AIV.headline + 10}
        size={74}
        y={346 + Math.min(170, fit("AI-POWERED.", 900)) + 6}
        stagger={4}
      />

      {/* stage card */}
      <div
        style={{
          position: "absolute",
          left: cx - cw / 2,
          top: cy - ch / 2,
          width: cw,
          height: ch,
          borderRadius: 36,
          overflow: "hidden",
          background: "#0B0714",
          boxShadow: `0 0 0 3px ${B.plum}, 0 40px 90px rgba(0,0,0,0.6)`,
        }}
      >
        <div style={{ position: "absolute", inset: 0 }}>
          <Shot
            name="creator"
            t={f}
            amp={amp}
            subjectX={f >= r0 ? subjX : 800}
            focusX={f >= r0 ? focusX : 800}
            zoom={zoom}
          />
        </div>

        {/* feature 1: karaoke captions */}
        {f >= c0 && f < s0 + 10 && (
          <div style={{ position: "absolute", left: 30, right: 30, bottom: 70, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 14px", opacity: 1 - tw(f, [s0, s0 + 8]) }}>
            {CAP_WORDS.map((w, i) => {
              const at = c0 + 6 + i * 11;
              const on = f >= at;
              const active = on && f < at + 11;
              return (
                <span
                  key={i}
                  style={{
                    fontFamily: F.display,
                    fontVariationSettings: archivo(900, 100),
                    fontSize: 64,
                    color: B.white,
                    padding: "2px 14px",
                    borderRadius: 14,
                    background: active ? B.violet : "transparent",
                    textShadow: active ? "none" : "0 4px 0 #000, 0 0 12px rgba(0,0,0,0.8)",
                    opacity: on ? 1 : 0,
                    transform: `scale(${active ? 1.08 : 1})`,
                  }}
                >
                  {w}
                </span>
              );
            })}
          </div>
        )}

        {/* feature 2: silence / filler removal drawer */}
        {drawer > 0 && (
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 300, transform: `translateY(${(1 - drawer) * 300}px)`, background: "rgba(8,5,12,0.92)", borderTop: `2px solid ${B.plumLine}` }}>
            <div style={{ position: "absolute", left: 30, top: 22, fontFamily: F.mono, fontSize: 20, color: B.dim, letterSpacing: "0.14em" }}>TRANSCRIPT WAVEFORM</div>
            <div style={{ position: "absolute", right: 30, top: 18, padding: "6px 14px", borderRadius: 999, background: B.violet, color: B.white, fontFamily: F.mono, fontWeight: 800, fontSize: 20, opacity: tw(f, [s0 + 48, s0 + 54]) }}>
              DEAD AIR · REMOVED
            </div>
            {(() => {
              // segments: speech / gap alternating; gaps collapse
              const segs = [
                { w: 150, gap: false },
                { w: 70, gap: true, tag: "silence" },
                { w: 190, gap: false },
                { w: 60, gap: true, tag: "um…" },
                { w: 160, gap: false },
                { w: 80, gap: true, tag: "silence" },
                { w: 140, gap: false },
              ];
              const col = tw(f, [s0 + 30, s0 + 50], [0, 1], ease.inOut);
              let x = 40;
              return segs.map((s, i) => {
                const w = s.gap ? s.w * (1 - col) : s.w;
                const el = s.gap ? (
                  <div key={i} style={{ position: "absolute", left: x, top: 90, width: Math.max(0, w - 4), height: 150, borderRadius: 12, border: `2px dashed ${B.lavender}`, background: "rgba(167,139,250,0.12)", overflow: "hidden" }}>
                    <div style={{ position: "absolute", left: 8, top: 8, fontFamily: F.mono, fontSize: 16, color: B.lilac, whiteSpace: "nowrap" }}>{s.tag}</div>
                  </div>
                ) : (
                  <svg key={i} width={w} height={150} style={{ position: "absolute", left: x, top: 90 }}>
                    {Array.from({ length: Math.floor(w / 9) }).map((_, k) => {
                      const h = 20 + 110 * Math.abs(noise2D(`w${i}`, k * 0.3, 0)) * (0.6 + 0.4 * random(`wr${i}-${k}`));
                      return <rect key={k} x={k * 9 + 2} y={75 - h / 2} width={5} height={h} rx={2.5} fill={B.lavender} />;
                    })}
                  </svg>
                );
                x += w;
                return el;
              });
            })()}
          </div>
        )}

        {/* feature 3: reframe crop box */}
        {f >= r0 + 8 && f < r0 + 34 && (
          <div
            style={{
              position: "absolute",
              top: 0,
              height: ch,
              width: ch * (9 / 16),
              left: ((subjX - 800) / 1600) * cw + cw / 2 - (ch * (9 / 16)) / 2,
              border: `4px solid ${B.white}`,
              boxShadow: "0 0 0 2000px rgba(0,0,0,0.5)",
              borderRadius: 8,
              opacity: tw(f, [r0 + 8, r0 + 12]),
            }}
          >
            <div style={{ position: "absolute", left: 8, top: 8, fontFamily: F.mono, fontSize: 16, color: B.white }}>9:16 · TRACKING</div>
          </div>
        )}

        <Label text="AUTO-CAPTIONS" f={f} at={c0} />
        {f >= s0 && <Label text="SMART CUTS" f={f} at={s0} />}
        {f >= r0 && <Label text="AUTO-REFRAME" f={f} at={r0} />}
      </div>

      {/* benefit line under the stage */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1552, textAlign: "center", fontFamily: F.display, fontVariationSettings: archivo(700, 100), fontSize: 46, color: B.mist }}>
        {f < s0 ? "Every word, synced." : f < r0 ? "Dead air, gone." : "One edit. Every format."}
      </div>
    </AbsoluteFill>
  );

  return (
    <AbsoluteFill>
      {glitchOn
        ? Array.from({ length: bands }).map((_, b) => (
            <AbsoluteFill key={b} style={{ clipPath: `inset(${(b / bands) * 100}% 0 ${100 - ((b + 1) / bands) * 100}% 0)`, transform: `translateX(${(random(`g${b}-${f}`) - 0.5) * 140}px)` }}>
              {content}
            </AbsoluteFill>
          ))
        : content}
      {glitchOn && <AbsoluteFill style={{ background: B.violet, opacity: 0.12, mixBlendMode: "screen" }} />}
      <Iris p={1 - tw(f, AIV.iris, [0, 1], ease.out)} />
    </AbsoluteFill>
  );
};
