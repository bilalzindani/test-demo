import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ease, lerp, sp, springs, tw } from "../../lib/motion";
import { B } from "../theme";
import { BRANDV } from "../timeline";
import { KWord, ToneLine } from "../components/DType";
import { NoshMark, markGeo } from "../components/NoshMark";
import { Flash, VWhip, vWhipCurve } from "../components/Transitions";

// ✦ — The clap cuts to the brand: Nosh / VIDEO EDITING slams in, a safe-frame
// guide draws around it, tagline in the site's white→violet tones; whip up.

const SIZE = 300;
const BASE = 930;
const G = markGeo(SIZE, 540, BASE);

export const VBrand: React.FC = () => {
  const f = useCurrentFrame();
  const slam = (t: number) => {
    const p = tw(f, [t, t + 9], [0, 1], ease.expoOut);
    return { scale: lerp(1.8, 1, p), opacity: tw(f, [t, t + 2]), dy: lerp(-24, 0, p) };
  };
  const pulse = Math.exp(-(((f - 8) % 15) + 15) % 15 / 4);
  const punch = f >= BRANDV.accent ? Math.exp(-(f - BRANDV.accent) / 6) : 0;
  const whip = vWhipCurve(f - BRANDV.whip[0], BRANDV.whip[1] - BRANDV.whip[0]);
  const guide = tw(f, [14, 40], [0, 1], ease.inOut);
  const gw = G.right - G.left + 120;
  const gh = 520;
  const gx = 540 - gw / 2;
  const gy = G.top - 110;
  const per = 2 * (gw + gh);

  return (
    <AbsoluteFill>
      <VWhip id="whip-brand" y={whip.out} blur={whip.blur}>
        <AbsoluteFill style={{ transform: `scale(${1 + punch * 0.035})` }}>
          <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 44%, rgba(139,92,246,${0.28 + punch * 0.2}), transparent 48%)` }} />
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            {[0, 4].map((t0, i) => {
              const p = tw(f, [t0, t0 + 26], [0, 1], ease.out);
              if (p <= 0 || p >= 1) return null;
              return <circle key={i} cx={G.ringX} cy={G.ringY} r={60 + p * 900} fill="none" stroke={B.lavender} strokeWidth={lerp(10, 1, p)} opacity={0.5 * (1 - p)} />;
            })}
            {/* safe-frame guide */}
            <rect x={gx} y={gy} width={gw} height={gh} rx={28} fill="none" stroke={B.lilac} strokeOpacity={0.35} strokeWidth={2} strokeDasharray={per} strokeDashoffset={per * (1 - guide)} />
            {[
              [gx, gy],
              [gx + gw, gy],
              [gx, gy + gh],
              [gx + gw, gy + gh],
            ].map(([x, y], i) => (
              <g key={i} opacity={guide} stroke={B.lavender} strokeWidth={3}>
                <line x1={x - 16} x2={x + 16} y1={y} y2={y} />
                <line x1={x} x2={x} y1={y - 16} y2={y + 16} />
              </g>
            ))}
            <text x={gx + 18} y={gy - 16} fill={B.lilac} opacity={0.7 * guide} style={{ fontFamily: "JetBrains Mono", fontSize: 18, letterSpacing: "0.2em" }}>
              SAFE AREA · 9:16
            </text>
            <NoshMark
              size={SIZE}
              cx={540}
              baseline={BASE}
              color={B.white}
              ring={B.violet}
              dot={B.mist}
              letters={{ N: slam(BRANDV.letters[0]), s: slam(BRANDV.letters[2]), h: slam(BRANDV.letters[3]) }}
              ringDraw={tw(f, [BRANDV.letters[1], BRANDV.letters[1] + 10], [0, 1], ease.expoOut)}
              dotScale={sp(f, springs.pop, BRANDV.letters[1] + 6) * (1 + 0.15 * pulse)}
              dotGlow={pulse}
            />
          </svg>
          <KWord text="VIDEO EDITING" f={f} start={BRANDV.sub[0]} mode="decode" size={54} wght={700} wdth={125} tracking={0.42} y={BASE + 44} color={B.lilac} />
          <ToneLine
            words={[
              { t: "Human", c: B.white },
              { t: "craft.", c: B.mist },
              { t: "AI", c: B.lavender },
              { t: "speed.", c: B.violet },
            ]}
            f={f}
            start={BRANDV.tagline}
            size={86}
            y={BASE + 190}
          />
        </AbsoluteFill>
      </VWhip>
      <Flash f={f} at={0} dur={9} color={B.mist} />
    </AbsoluteFill>
  );
};
