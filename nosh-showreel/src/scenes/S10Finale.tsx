import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { ArrowRight } from "lucide-react";
import { C, F, archivo } from "../lib/theme";
import { ease, impactShake, lerp, sp, springs, tw } from "../lib/motion";
import { FINALE } from "../lib/timeline";
import { scramble } from "../lib/text";
import { WM, Wordmark, wordmarkGeometry } from "../components/Wordmark";

// 07 — Finale. Words fly in from depth, collapse into the dot, and the dot
// unpacks into the wordmark. CTA gets clicked. Everything leaves except the
// dot, which returns to centre and blinks out — so the reel loops.

const SIZE = 290;
const BASE = 520;
const G = wordmarkGeometry(SIZE, 960, BASE);

const DepthWord: React.FC<{ text: string; f: number; at: number; accent?: boolean; size: number }> = ({ text, f, at, accent, size }) => {
  const p = tw(f, [at, at + 16], [0, 1], ease.expoOut);
  return (
    <span
      style={{
        display: "inline-block",
        marginRight: size * 0.26,
        transform: `translateZ(${lerp(-1800, 0, p)}px) rotateX(${lerp(40, 0, p)}deg)`,
        opacity: tw(f, [at, at + 4]),
        filter: p < 0.95 ? `blur(${(1 - p) * 14}px)` : undefined,
        ...(accent
          ? { fontFamily: F.serif, fontStyle: "italic", fontWeight: 400, fontSize: size * 1.16, color: C.lime, letterSpacing: "-0.01em" }
          : { fontFamily: F.display, fontVariationSettings: archivo(800, 100), fontSize: size, color: C.paper, letterSpacing: "-0.035em" }),
      }}
    >
      {text}
    </span>
  );
};

const Cursor: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <svg width={48} height={60} viewBox="0 0 24 30" style={{ position: "absolute", left: x, top: y, transform: `scale(${s})`, transformOrigin: "0 0", filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.5))" }}>
    <path d="M2 2 L2 23 L8 17.5 L12 27 L16 25.3 L12 16 L20 16 Z" fill={C.paper} stroke={C.ink} strokeWidth={1.6} strokeLinejoin="round" />
  </svg>
);

export const Finale: React.FC = () => {
  const f = useCurrentFrame();
  const col = tw(f, FINALE.collapse, [0, 1], ease.expoIn);
  const L = FINALE.logo;

  // dot travels from the collapse point into the ring's centre
  const dotTravel = tw(f, [L - 4, L + 6], [0, 1], ease.inOut);
  const shake = impactShake(f, L, 20, 16, "fin");

  // outro: everything but the dot fades; dot returns to centre, blinks out
  const [o0, o1] = FINALE.outro;
  const out = tw(f, [o0, o0 + 14], [0, 1], ease.inOut);
  const home = tw(f, [o0 + 6, o1], [0, 1], ease.inOut);
  const blink = tw(f, [o1 + 1, o1 + 5], [0, 1], ease.in);

  const ringS = sp(f, springs.bouncy, L);
  // letters start stacked behind the ring and slide out to their seats
  const slide = (ch: "n" | "s" | "h", k: number) => {
    const p = tw(f, [L + 2 + k * 2, L + 20 + k * 2], [0, 1], ease.expoOut);
    const fromRing = G.ringX - (G.x0 + WM[ch].cx * G.k);
    return { dx: fromRing * (1 - p), opacity: tw(f, [L + 2 + k * 2, L + 6 + k * 2]), scale: lerp(0.6, 1, p) };
  };

  const ctaIn = sp(f, springs.bouncy, FINALE.cta);
  const [c0, c1] = FINALE.cursor;
  const cp = tw(f, [c0, c1], [0, 1], ease.inOut);
  const clickF = f - FINALE.click;
  const press = clickF >= 0 && clickF < 8 ? 1 - Math.sin((clickF / 8) * Math.PI) * 0.06 : 1;
  const url = "noshaiautomation.com";
  const urlN = Math.floor(tw(f, FINALE.url, [0, 1], ease.linear) * url.length);

  const dotX = lerp(lerp(960, G.ringX, dotTravel), 960, home);
  const dotY = lerp(lerp(540, G.ringY, dotTravel), 540, home);
  const dotR = f < L - 6 ? tw(f, [FINALE.collapse[1] - 8, FINALE.collapse[1]], [0, 9], ease.expoOut) : lerp(lerp(9, 54 * G.k, dotTravel), 9, home) * (1 - blink);

  return (
    <AbsoluteFill>
      {/* lines */}
      {f < FINALE.collapse[1] && (
        <AbsoluteFill style={{ transformOrigin: "960px 540px", transform: `scale(${1 - col})`, opacity: 1 - tw(f, [FINALE.collapse[1] - 5, FINALE.collapse[1]]) }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", perspective: 1200 }}>
            <div style={{ transformStyle: "preserve-3d", lineHeight: 1.1 }}>
              {["Automate", "the", "busywork."].map((w, i) => (
                <DepthWord key={w} text={w} f={f} at={FINALE.line1 + i * 4} size={122} />
              ))}
            </div>
            <div style={{ transformStyle: "preserve-3d", lineHeight: 1.1, marginTop: 8 }}>
              <DepthWord text="Keep" f={f} at={FINALE.line2} size={122} />
              <DepthWord text="the" f={f} at={FINALE.line2 + 4} size={122} />
              <DepthWord text="growth." f={f} at={FINALE.line2 + 8} size={122} accent />
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* lockup */}
      {f >= L && (
        <AbsoluteFill style={{ opacity: 1 - out, transform: `translate(${shake.x}px, ${shake.y}px)` }}>
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            {[L, L + 5].map((t0, i) => {
              const p = tw(f, [t0, t0 + 30], [0, 1], ease.out);
              if (p <= 0 || p >= 1) return null;
              return <circle key={i} cx={G.ringX} cy={G.ringY} r={40 + p * 900} fill="none" stroke={C.lime} strokeWidth={lerp(8, 1, p)} opacity={0.5 * (1 - p)} />;
            })}
            <Wordmark
              size={SIZE}
              cx={960}
              baseline={BASE}
              color={C.paper}
              ringColor={C.lime}
              dotColor="transparent"
              ringScale={ringS}
              letters={{ n: slide("n", 0), s: slide("s", 1), h: slide("h", 2) }}
            />
            <text
              x={960 + 9}
              y={BASE + 84}
              textAnchor="middle"
              fill={C.paperDim}
              style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 28, letterSpacing: "0.58em" }}
            >
              {scramble("AI AUTOMATION", tw(f, FINALE.subtitle, [0, 1], ease.linear), f, "fin-ai")}
            </text>
          </svg>

          {/* CTA */}
          <div style={{ position: "absolute", left: 0, right: 0, top: 706, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "24px 40px",
                borderRadius: 999,
                background: C.lime,
                color: C.ink,
                fontFamily: F.ui,
                fontSize: 32,
                fontWeight: 700,
                letterSpacing: "-0.01em",
                transform: `scale(${ctaIn * press})`,
                boxShadow: `0 0 ${50 + (clickF >= 0 ? 40 * Math.exp(-clickF / 8) : 0)}px rgba(200,255,46,0.35)`,
              }}
            >
              Let's automate your business
              <span style={{ display: "inline-flex", transform: `translateX(${clickF >= 0 ? Math.sin(Math.min(1, clickF / 10) * Math.PI) * 10 : 0}px)` }}>
                <ArrowRight size={34} color={C.ink} strokeWidth={2.6} />
              </span>
            </div>
            <div style={{ fontFamily: F.mono, fontSize: 30, letterSpacing: "0.12em", color: C.paper, fontWeight: 600, height: 40 }}>
              {url.slice(0, urlN)}
              <span style={{ color: C.lime, opacity: f >= FINALE.url[0] && (urlN < url.length || Math.floor(f / 8) % 2 === 0) ? 1 : 0 }}>▌</span>
            </div>
          </div>

          {/* click ripple + cursor */}
          {clickF >= 0 && clickF < 26 && (
            <div
              style={{
                position: "absolute",
                left: 1182 - clickF * 5,
                top: 754 - clickF * 5,
                width: clickF * 10,
                height: clickF * 10,
                borderRadius: "50%",
                border: `3px solid ${C.lime}`,
                opacity: 1 - clickF / 26,
              }}
            />
          )}
          {f >= c0 && <Cursor x={lerp(1560, 1182, cp)} y={lerp(1010, 754, cp)} s={clickF >= 0 && clickF < 6 ? 0.86 : 1} />}
        </AbsoluteFill>
      )}

      {/* ambient dust */}
      {f >= L &&
        Array.from({ length: 36 }).map((_, i) => {
          const x = random(`dx${i}`) * 1920;
          const y = 1080 - ((random(`dy${i}`) * 1080 + (f - L) * (0.6 + random(`dv${i}`) * 1.4)) % 1080);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: 3,
                height: 3,
                borderRadius: 2,
                background: i % 3 === 0 ? C.lime : C.paper,
                opacity: 0.35 * tw(f, [L, L + 20]) * (1 - out),
              }}
            />
          );
        })}

      {/* the dot */}
      {dotR > 0.2 && (
        <>
          <div
            style={{
              position: "absolute",
              left: dotX - dotR * 9,
              top: dotY - dotR * 9,
              width: dotR * 18,
              height: dotR * 18,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(200,255,46,0.4), transparent 62%)",
            }}
          />
          <div style={{ position: "absolute", left: dotX - dotR, top: dotY - dotR, width: dotR * 2, height: dotR * 2, borderRadius: "50%", background: C.lime }} />
        </>
      )}
    </AbsoluteFill>
  );
};
