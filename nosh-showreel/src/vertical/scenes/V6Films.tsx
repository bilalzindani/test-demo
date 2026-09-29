import React from "react";
import { AbsoluteFill, random, staticFile, useCurrentFrame } from "remotion";
import { Sparkles } from "lucide-react";
import { F, archivo } from "../../lib/theme";
import { ease, lerp, tw } from "../../lib/motion";
import { B } from "../theme";
import { FILMV } from "../timeline";
import { ToneLine, VTag } from "../components/DType";
import { FilmBurn } from "../components/Transitions";
import { Shot, ShotName } from "../shots/Shots";

// 04 — AI films & short films: a prompt is typed and generated; the frame
// "diffuses" out of noise into a letterboxed cinematic shot (resolving on
// the music accent); subtitle, film title card, film strip.

const FRAME = { y: 930, h: 452 }; // 2.39:1 across the full width
const STRIP: ShotName[] = ["astro", "dunes", "peaks", "city", "ocean", "astro", "peaks", "dunes"];

export const VFilms: React.FC = () => {
  const f = useCurrentFrame();
  const burn = 1 - tw(f, FILMV.flash, [0, 1], ease.out);
  const n = Math.max(0, Math.min(FILMV.prompt.length, Math.floor((f - FILMV.typeStart) * 1.05)));
  const typing = f >= FILMV.typeStart && n < FILMV.prompt.length;
  const press = f >= FILMV.generate && f < FILMV.generate + 8 ? 1 - Math.sin(((f - FILMV.generate) / 8) * Math.PI) * 0.08 : 1;
  const [d0, d1] = FILMV.diffuse;
  const dz = tw(f, [d0, d1], [0, 1], ease.inOut);
  const revealed = f >= d0;
  const step = Math.min(30, Math.max(1, Math.round(dz * 30)));
  const push = tw(f, [d1, 330], [0, 1], ease.linear);
  const [t0, t1] = FILMV.title;
  const titleP = tw(f, [t0, t0 + 24], [0, 1], ease.out) * (1 - tw(f, [t1 + 30, t1 + 44]));
  const [st0] = FILMV.strip;
  const stripIn = tw(f, [st0, st0 + 14], [0, 1], ease.expoOut);
  const flashAt = f >= d1 && f < d1 + 6 ? 1 - (f - d1) / 6 : 0;
  const m = tw(f, [t0 - 12, t0 + 6], [0, 1], ease.inOut); // prompt card → prompt bar
  const cardBody = 1 - tw(m, [0, 0.45]);
  const barIn = tw(m, [0.55, 1]);

  return (
    <AbsoluteFill>
      <VTag idx="04" label="AI FILMS & SHORT FILMS" f={f} start={8} y={296} out={176} />
      <ToneLine
        words={[
          { t: "AI", c: B.lavender },
          { t: "films", c: B.white },
          { t: "&", c: B.mist },
          { t: "short", c: B.lilac },
          { t: "films.", c: B.violet },
        ]}
        f={f}
        start={FILMV.headline}
        size={100}
        y={346}
        width={1000}
        x={40}
        out={172}
      />
      <ToneLine
        words={[
          { t: "From", c: B.white },
          { t: "prompt", c: B.lilac },
          { t: "to", c: B.white },
          { t: "premiere.", c: B.violet },
        ]}
        f={f}
        start={184}
        size={100}
        y={346}
        width={1000}
        x={40}
      />

      {/* prompt card */}
      <div
        style={{
          position: "absolute",
          left: 60,
          top: lerp(600, 776, m),
          width: 960,
          height: lerp(290, 84, m),
          borderRadius: lerp(30, 42, m),
          overflow: "hidden",
          background: "rgba(10,6,18,0.9)",
          border: `2px solid ${f >= FILMV.generate ? B.violet : B.plumLine}`,
          boxShadow: f >= FILMV.generate ? `0 0 40px rgba(139,92,246,0.35)` : undefined,
          opacity: tw(f, [10, 20]),
          transform: `translateY(${(1 - tw(f, [10, 26], [0, 1], ease.expoOut)) * 40}px)`,
        }}
      >
        {/* condensed: one-line prompt bar that stays above the film it made */}
        {barIn > 0 && (
          <div style={{ position: "absolute", left: 28, right: 24, top: 0, bottom: 0, display: "flex", alignItems: "center", gap: 16, opacity: barIn }}>
            <Sparkles size={28} color={B.lavender} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0, fontFamily: F.ui, fontSize: 30, fontWeight: 500, color: B.mist, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{FILMV.prompt}</div>
            <div style={{ flexShrink: 0, padding: "10px 20px", borderRadius: 999, background: B.violet, color: B.white, fontFamily: F.mono, fontWeight: 800, fontSize: 20, letterSpacing: "0.14em" }}>RENDERED ✓</div>
          </div>
        )}
        <div style={{ position: "absolute", inset: 0, opacity: cardBody }}>
        <div style={{ position: "absolute", left: 30, top: 24, display: "flex", alignItems: "center", gap: 10, fontFamily: F.mono, fontSize: 21, fontWeight: 700, letterSpacing: "0.16em", color: B.lavender }}>
          <Sparkles size={22} color={B.lavender} /> PROMPT
        </div>
        <div style={{ position: "absolute", left: 30, right: 30, top: 70, fontFamily: F.ui, fontSize: 36, lineHeight: 1.36, color: B.mist, fontWeight: 500 }}>
          {FILMV.prompt.slice(0, n)}
          {(typing || (f < FILMV.generate && Math.floor(f / 8) % 2 === 0)) && <span style={{ display: "inline-block", width: 4, height: 38, background: B.lavender, marginLeft: 4, verticalAlign: "middle" }} />}
        </div>
        <div
          style={{
            position: "absolute",
            right: 26,
            bottom: 22,
            padding: "14px 26px",
            borderRadius: 999,
            background: f >= FILMV.generate ? B.violet : "rgba(139,92,246,0.25)",
            color: B.white,
            fontFamily: F.mono,
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: "0.14em",
            transform: `scale(${press})`,
          }}
        >
          {f >= FILMV.generate && f < d1 ? `GENERATING ${Math.round(dz * 100)}%` : "GENERATE ▸"}
        </div>
        </div>
      </div>

      {/* cinematic frame */}
      {revealed && (
        <div style={{ position: "absolute", left: 0, top: FRAME.y, width: 1080, height: FRAME.h, overflow: "hidden", background: "#000", opacity: tw(f, [d0, d0 + 4]) }}>
          <div style={{ position: "absolute", inset: 0, filter: dz < 1 ? `blur(${(1 - dz) * 34}px) saturate(${dz})` : undefined }}>
            <Shot name="astro" t={f - d0} zoom={lerp(1, 1.14, push)} focusX={lerp(800, 860, push)} focusY={lerp(450, 470, push)} />
          </div>
          {dz < 1 && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${staticFile(`textures/grain-${Math.floor(random(`df${f}`) * 8)}.png`)})`,
                backgroundSize: "96px 96px",
                opacity: 1 - dz,
                mixBlendMode: "screen",
                filter: "contrast(2.2)",
              }}
            />
          )}
          {dz < 1 && (
            <div style={{ position: "absolute", left: 20, top: 16, fontFamily: F.mono, fontSize: 18, letterSpacing: "0.14em", color: B.mist, textShadow: "0 1px 4px #000" }}>
              DENOISING · STEP {step}/30
            </div>
          )}
          {/* subtitle */}
          {f >= FILMV.subtitle[0] && f < FILMV.subtitle[1] && (
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 30, textAlign: "center", fontFamily: F.ui, fontSize: 30, fontWeight: 500, color: B.white, textShadow: "0 2px 6px #000", opacity: tw(f, [FILMV.subtitle[0], FILMV.subtitle[0] + 4]) * (1 - tw(f, [FILMV.subtitle[1] - 4, FILMV.subtitle[1]])) }}>
              …and the signal was still out there.
            </div>
          )}
          {/* title card */}
          {titleP > 0 && (
            <>
              <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, rgba(0,0,0,0) 28%, rgba(0,0,0,${0.5 * titleP}) 100%)` }} />
              <div style={{ position: "absolute", right: 56, top: 88, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 16 }}>
                <div style={{ fontFamily: F.display, fontVariationSettings: archivo(300, 112), fontSize: 48, color: B.mist, letterSpacing: `${lerp(0.32, 0.18, titleP)}em`, marginRight: `${-lerp(0.32, 0.18, titleP)}em`, opacity: titleP, whiteSpace: "nowrap", textShadow: "0 2px 18px rgba(0,0,0,0.6)" }}>THE LAST SIGNAL</div>
                <div style={{ fontFamily: F.mono, fontSize: 17, letterSpacing: "0.3em", marginRight: "-0.3em", color: B.lavender, opacity: titleP, whiteSpace: "nowrap" }}>AN AI SHORT FILM · MADE WITH Nosh</div>
              </div>
            </>
          )}
          {flashAt > 0 && <div style={{ position: "absolute", inset: 0, background: B.white, opacity: flashAt * 0.7 }} />}
        </div>
      )}
      {/* letterbox rails */}
      {revealed && (
        <>
          <div style={{ position: "absolute", left: 40, right: 40, top: FRAME.y - 3, height: 2, background: B.plumLine }} />
          <div style={{ position: "absolute", left: 40, right: 40, top: FRAME.y + FRAME.h + 1, height: 2, background: B.plumLine }} />
          <div style={{ position: "absolute", left: 60, top: FRAME.y - 40, fontFamily: F.mono, fontSize: 18, letterSpacing: "0.16em", color: B.dim }}>2.39:1 · SC 12 · SH 03</div>
          <div style={{ position: "absolute", right: 60, top: FRAME.y - 40, fontFamily: F.mono, fontSize: 18, letterSpacing: "0.16em", color: B.lavender }}>● AI GENERATED</div>
        </>
      )}

      {/* film strip */}
      {stripIn > 0 && (
        <div style={{ position: "absolute", left: 0, width: 1080, top: 1430, height: 176, overflow: "hidden", opacity: stripIn, transform: `translateY(${(1 - stripIn) * 50}px)` }}>
          <div style={{ position: "absolute", left: -((f - st0) * 5) % 230, top: 0, height: 176, display: "flex", gap: 0 }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{ width: 230, height: 176, background: "#07040C", position: "relative", flexShrink: 0 }}>
                {[0, 1, 2, 3, 4].map((k) => (
                  <React.Fragment key={k}>
                    <div style={{ position: "absolute", left: 14 + k * 44, top: 8, width: 22, height: 14, borderRadius: 4, background: "#1E1530" }} />
                    <div style={{ position: "absolute", left: 14 + k * 44, bottom: 8, width: 22, height: 14, borderRadius: 4, background: "#1E1530" }} />
                  </React.Fragment>
                ))}
                <div style={{ position: "absolute", left: 10, right: 10, top: 30, bottom: 30, borderRadius: 6, overflow: "hidden" }}>
                  <Shot name={STRIP[i % STRIP.length]} t={f + i * 30} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <FilmBurn p={burn} />
      {f >= FILMV.generate && f < FILMV.generate + 14 && (
        <div
          style={{
            position: "absolute",
            left: 880 - (f - FILMV.generate) * 8,
            top: 830 - (f - FILMV.generate) * 8,
            width: (f - FILMV.generate) * 16,
            height: (f - FILMV.generate) * 16,
            borderRadius: "50%",
            border: `3px solid ${B.lavender}`,
            opacity: 1 - (f - FILMV.generate) / 14,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
