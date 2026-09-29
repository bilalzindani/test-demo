import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { ArrowRight } from "lucide-react";
import { F } from "../../lib/theme";
import { ease, impactShake, lerp, sp, springs, tw } from "../../lib/motion";
import { B } from "../theme";
import { FINV } from "../timeline";
import { KWord, ToneLine, fit } from "../components/DType";
import { NM, NoshMark, markGeo } from "../components/NoshMark";

// 05 — EDIT. ENHANCE. GENERATE. on the beat, collapse into the REC dot; the
// dot unpacks into the Nosh lock-up on the track's final hit; CTA + URL;
// the REC light switches off → loop.

const SIZE = 300;
const BASE = 880;
const G = markGeo(SIZE, 540, BASE);

export const VFinale: React.FC = () => {
  const f = useCurrentFrame();
  const L = FINV.lock;
  const [c0, c1] = FINV.collapse;
  const col = tw(f, [c0, c1], [0, 1], ease.expoIn);
  const shake = impactShake(f, L, 22, 14, "vfin");
  const [o0, o1] = FINV.outro;
  const out = tw(f, [o0, o0 + 14], [0, 1], ease.inOut);
  const home = tw(f, [o0 + 6, o1 - 4], [0, 1], ease.inOut);
  const off = tw(f, [o1 - 2, o1 + 2], [0, 1], ease.in);

  const ringS = sp(f, springs.bouncy, L);
  const slide = (ch: "N" | "s" | "h", k: number) => {
    const p = tw(f, [L + 2 + k * 2, L + 18 + k * 2], [0, 1], ease.expoOut);
    const fromRing = G.ringX - (G.x0 + NM[ch].cx * G.k);
    return { dx: fromRing * (1 - p), opacity: tw(f, [L + 2 + k * 2, L + 6 + k * 2]), scale: lerp(0.6, 1, p) };
  };

  // the REC dot: born from the collapse, rides into the ring, finally blinks off
  const dotTravel = tw(f, [L - 3, L + 6], [0, 1], ease.inOut);
  const dotX = lerp(lerp(540, G.ringX, dotTravel), 540, home);
  const dotY = lerp(lerp(960, G.ringY, dotTravel), 960, home);
  const dotR = f < L - 3 ? tw(f, [c1 - 6, c1], [0, 12], ease.expoOut) : lerp(lerp(12, NM.ring.dot * G.k, dotTravel), 12, home) * (1 - off);
  const blink = f >= o1 - 12 && f < o1 - 2 ? (Math.floor(f / 3) % 2 === 0 ? 1 : 0.25) : 1;

  const words = [
    { t: "EDIT.", c: B.white, mode: "stretch" as const },
    { t: "ENHANCE.", c: B.lilac, mode: "slam" as const },
    { t: "GENERATE.", c: B.violet, mode: "stretch" as const },
  ];
  const wi = f < FINV.words[1] ? 0 : f < FINV.words[2] ? 1 : 2;
  const w = words[wi];
  const ws = Math.min(260, fit(w.t, 900, 900, wi === 0 ? 125 : 100));

  const ctaIn = sp(f, springs.bouncy, FINV.cta);
  const url = "noshaiautomation.com";
  const urlN = Math.floor(tw(f, FINV.url, [0, 1], ease.linear) * url.length);
  const shimmer = tw(f, [FINV.shimmer, FINV.shimmer + 18], [-30, 130], ease.inOut);

  return (
    <AbsoluteFill style={{ background: tw(f, [0, 2]) > 0 ? B.black : undefined }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 48%, rgba(139,92,246,${f >= L ? 0.3 * (1 - out) : 0.18}), transparent 55%)` }} />

      {/* beat words */}
      {f < c1 && (
        <AbsoluteFill style={{ transformOrigin: "540px 960px", transform: `scale(${1 - col})`, opacity: 1 - tw(f, [c1 - 3, c1]) }}>
          <KWord key={wi} text={w.t} f={f} start={FINV.words[wi]} mode={w.mode} size={ws} wdth={wi === 0 ? 125 : 100} y={960 - ws / 2} color={w.c} stagger={0.7} glow={wi === 2 ? "rgba(139,92,246,0.5)" : undefined} />
        </AbsoluteFill>
      )}

      {/* lock-up */}
      {f >= L && (
        <AbsoluteFill style={{ opacity: 1 - out, transform: `translate(${shake.x}px, ${shake.y}px)` }}>
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            {[L, L + 5, L + 10].map((t0, i) => {
              const p = tw(f, [t0, t0 + 32], [0, 1], ease.out);
              if (p <= 0 || p >= 1) return null;
              return <circle key={i} cx={G.ringX} cy={G.ringY} r={40 + p * 1100} fill="none" stroke={i === 1 ? B.mist : B.violet} strokeWidth={lerp(9, 1, p)} opacity={0.55 * (1 - p)} />;
            })}
            <NoshMark size={SIZE} cx={540} baseline={BASE} color={B.white} ring={B.violet} dot="transparent" ringScale={ringS} letters={{ N: slide("N", 0), s: slide("s", 1), h: slide("h", 2) }} />
          </svg>
          <KWord text="VIDEO EDITING" f={f} start={FINV.sub[0]} mode="decode" size={54} wght={700} wdth={125} tracking={0.42} y={BASE + 44} color={B.lilac} />
          <ToneLine
            words={[
              { t: "From", c: B.white },
              { t: "raw", c: B.mist },
              { t: "to", c: B.lilac },
              { t: "remarkable.", c: B.violet },
            ]}
            f={f}
            start={FINV.tagline}
            size={80}
            y={BASE + 170}
          />
          {/* CTA */}
          <div style={{ position: "absolute", left: 0, right: 0, top: 1270, display: "flex", justifyContent: "center" }}>
            <div
              style={{
                position: "relative",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                gap: 18,
                padding: "30px 52px",
                borderRadius: 999,
                background: B.violet,
                color: B.white,
                fontFamily: F.ui,
                fontWeight: 800,
                fontSize: 46,
                transform: `scale(${ctaIn})`,
                boxShadow: `0 0 60px rgba(139,92,246,0.55)`,
              }}
            >
              Book your edit
              <ArrowRight size={48} color={B.white} strokeWidth={2.8} />
              <div style={{ position: "absolute", top: 0, bottom: 0, left: `${shimmer}%`, width: "22%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)", transform: "skewX(-20deg)" }} />
            </div>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1420, textAlign: "center", fontFamily: F.mono, fontSize: 38, fontWeight: 600, letterSpacing: "0.1em", color: B.mist }}>
            {url.slice(0, urlN)}
            <span style={{ color: B.violet, opacity: f >= FINV.url[0] && (urlN < url.length || Math.floor(f / 8) % 2 === 0) ? 1 : 0 }}>▌</span>
          </div>
        </AbsoluteFill>
      )}

      {/* ambient dust after the hit */}
      {f >= L &&
        Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: random(`fd${i}`) * 1080,
              top: 1920 - ((random(`fy${i}`) * 1920 + (f - L) * (0.8 + random(`fv${i}`) * 1.6)) % 1920),
              width: 4,
              height: 4,
              borderRadius: 2,
              background: i % 3 === 0 ? B.violet : B.mist,
              opacity: 0.35 * (1 - out),
            }}
          />
        ))}

      {/* the REC dot */}
      {dotR > 0.3 && (
        <>
          <div style={{ position: "absolute", left: dotX - dotR * 7, top: dotY - dotR * 7, width: dotR * 14, height: dotR * 14, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.55), transparent 62%)", opacity: blink }} />
          <div style={{ position: "absolute", left: dotX - dotR, top: dotY - dotR, width: dotR * 2, height: dotR * 2, borderRadius: "50%", background: B.mist, opacity: blink }} />
        </>
      )}
    </AbsoluteFill>
  );
};
