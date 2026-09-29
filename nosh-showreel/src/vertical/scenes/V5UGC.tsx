import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import { Bookmark, Heart, MessageCircle, Send } from "lucide-react";
import { F, archivo } from "../../lib/theme";
import { ease, lerp, sp, springs, tw } from "../../lib/motion";
import { B } from "../theme";
import { UGCV } from "../timeline";
import { KWord, ToneLine, VTag, fit } from "../components/DType";
import { Shot } from "../shots/Shots";

// 03 — AI UGC ads: an AI creator ad plays in a social UI (lip-sync, karaoke
// captions, product card), then multiplies into four hook variants; one wins.

const HOOKS = ["I tried this so you don't have to…", "3 reasons I switched…", "POV: your new favorite", "Nobody talks about this…"];


const Phone: React.FC<{ f: number; look: number; hook?: string; amp: number; product: number; w: number }> = ({ f, look, hook, amp, product, w }) => {
  const k = w / 500; // UI scale
  return (
    <div style={{ position: "absolute", inset: 0, borderRadius: 54 * k, overflow: "hidden", background: "#000", boxShadow: `0 0 0 ${8 * k}px #16101F, 0 0 0 ${10 * k}px ${B.plumLine}` }}>
      <div style={{ position: "absolute", inset: 0 }}>
        <Shot name="creator" t={f + look * 11} amp={amp} product={product} look={look} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 22%, transparent 62%, rgba(0,0,0,0.7) 100%)" }} />
      {/* right rail */}
      <div style={{ position: "absolute", right: 16 * k, bottom: 170 * k, display: "flex", flexDirection: "column", gap: 22 * k, alignItems: "center" }}>
        {[
          [Heart, "24.1K"],
          [MessageCircle, "1,208"],
          [Bookmark, "3,452"],
          [Send, "Share"],
        ].map(([Icon, n], i) => {
          const I = Icon as typeof Heart;
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 * k }}>
              <I size={40 * k} color={B.white} fill={i === 0 && f % 90 > 60 ? B.violet : "none"} strokeWidth={2.2} />
              <span style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 16 * k, color: B.white }}>{n as string}</span>
            </div>
          );
        })}
      </div>
      {/* bottom meta */}
      <div style={{ position: "absolute", left: 22 * k, bottom: 38 * k, right: 90 * k, fontFamily: F.ui, color: B.white }}>
        <div style={{ fontWeight: 800, fontSize: 22 * k }}>@glowdaily</div>
        <div style={{ fontSize: 17 * k, opacity: 0.85, marginTop: 4 * k }}>Sponsored · Glow Serum ✦</div>
      </div>
      <div style={{ position: "absolute", left: 0, bottom: 0, height: 5 * k, width: `${(f % 240) / 2.4}%`, background: B.violet }} />
      {hook && (
        <div style={{ position: "absolute", left: 18 * k, right: 18 * k, top: 90 * k, textAlign: "center", fontFamily: F.display, fontVariationSettings: archivo(900, 100), fontSize: 40 * k, lineHeight: 1.1, color: B.white, textShadow: "0 3px 0 #000, 0 0 16px rgba(0,0,0,0.7)" }}>
          {hook}
        </div>
      )}
    </div>
  );
};

export const VUGC: React.FC = () => {
  const f = useCurrentFrame();
  const speaking = UGCV.lines.find((l) => f >= l.start && f < l.end);
  const amp = speaking ? 0.2 + 0.8 * Math.abs(noise2D("ugc", f * 0.35, 0)) * (0.5 + 0.5 * Math.abs(Math.sin(f * 0.95))) : 0.04;
  const product = tw(f, [UGCV.product - 8, UGCV.product + 8], [0, 1], ease.out);
  const [g0, g1] = UGCV.grid;
  const gridP = tw(f, [g0, g1], [0, 1], ease.inOut);
  const [e0, e1] = UGCV.exit;
  const exitP = tw(f, [e0, e1], [0, 1], ease.expoIn);

  // hero phone → slot 0 of a row of four
  const heroW = lerp(500, 230, gridP);
  const heroH = heroW * (16 / 9);
  const slotX = (i: number) => 50 + i * 250 + 115;
  const heroCX = lerp(540, slotX(0), gridP);
  const heroCY = lerp(1060, 1080, gridP);
  const winnerIdx: number = 2;
  const win = f >= UGCV.winner;

  const cap = (() => {
    if (!speaking) return null;
    const words = speaking.text.split(" ");
    const span = (speaking.end - speaking.start) * 0.9;
    return (
      <div style={{ position: "absolute", left: 30, right: 30, top: "58%", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px 12px" }}>
        {words.map((w, i) => {
          const at = speaking.start + (i * span) / words.length;
          const on = f >= at;
          const active = on && f < at + span / words.length;
          return (
            <span key={i} style={{ fontFamily: F.display, fontVariationSettings: archivo(900, 100), fontSize: 46, color: active ? B.lilac : B.white, opacity: on ? 1 : 0, textShadow: "0 4px 0 #000, 0 0 14px rgba(0,0,0,0.8)", transform: `scale(${active ? 1.1 : 1})` }}>
              {w}
            </span>
          );
        })}
      </div>
    );
  })();

  return (
    <AbsoluteFill style={{ transform: `scale(${1 + exitP * 0.12})`, opacity: 1 - exitP * 0.9 }}>
      <VTag idx="03" label="AI UGC ADS" f={f} start={4} y={296} />
      <KWord text="AI UGC ADS" f={f} start={UGCV.headline} mode="slam" size={Math.min(180, fit("AI UGC ADS", 880))} y={346} color={B.white} />
      <ToneLine
        words={[
          { t: "that", c: B.mist },
          { t: "feel", c: B.lilac },
          { t: "real.", c: B.lavender },
        ]}
        f={f}
        start={UGCV.headline + 10}
        size={80}
        y={346 + Math.min(180, fit("AI UGC ADS", 880)) + 4}
      />

      {/* hero phone */}
      <div style={{ position: "absolute", left: heroCX - heroW / 2, top: heroCY - heroH / 2, width: heroW, height: heroH, opacity: win && winnerIdx !== 0 ? 0.5 : 1 }}>
        <Phone f={f} look={0} amp={amp} product={product} w={heroW} hook={gridP > 0.5 ? HOOKS[0] : undefined} />
        {gridP < 0.4 && cap}
        {gridP < 0.3 && product > 0 && (
          <div
            style={{
              position: "absolute",
              left: 22,
              right: 96,
              bottom: 104,
              padding: "14px 16px",
              borderRadius: 18,
              background: "rgba(255,255,255,0.94)",
              display: "flex",
              alignItems: "center",
              gap: 14,
              transform: `translateY(${(1 - sp(f, springs.pop, UGCV.product)) * 60}px)`,
              opacity: 1 - gridP * 3,
            }}
          >
            <div style={{ width: 54, height: 54, borderRadius: 12, background: `linear-gradient(135deg, ${B.purple}, ${B.lavender})` }} />
            <div style={{ flex: 1, fontFamily: F.ui }}>
              <div style={{ fontWeight: 800, fontSize: 20, color: "#1A1028" }}>Glow Serum</div>
              <div style={{ fontSize: 15, color: "#5B4A7A" }}>Free shipping today</div>
            </div>
            <div style={{ padding: "10px 16px", borderRadius: 999, background: B.violet, color: B.white, fontFamily: F.ui, fontWeight: 800, fontSize: 17 }}>Shop now</div>
          </div>
        )}
      </div>

      {/* variants */}
      {[1, 2, 3].map((i) => {
        const p = sp(f, { damping: 18, stiffness: 140, mass: 0.9 }, g0 + 10 + i * 5);
        if (f < g0 + 10 + i * 5) return null;
        const W = 230;
        const Hh = W * (16 / 9);
        const isWin = win && i === winnerIdx;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: slotX(i) - W / 2,
              top: 1080 - Hh / 2 + (1 - p) * 700,
              width: W,
              height: Hh,
              opacity: win && !isWin ? 0.5 : 1,
              transform: `scale(${isWin ? 1 + 0.08 * sp(f, springs.bouncy, UGCV.winner) : 1})`,
            }}
          >
            <Phone f={f + i * 13} look={i} amp={amp * 0.8} product={product} w={W} hook={HOOKS[i]} />
            {isWin && <div style={{ position: "absolute", inset: -8, borderRadius: 34, border: `5px solid ${B.violet}`, boxShadow: `0 0 40px ${B.violet}` }} />}
          </div>
        );
      })}
      {/* variant labels */}
      {gridP > 0.6 &&
        [0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: slotX(i) - 115,
              width: 230,
              top: 1080 - (230 * 16) / 18 - 60,
              textAlign: "center",
              fontFamily: F.mono,
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: "0.16em",
              color: win && i === winnerIdx ? B.white : B.lilac,
              opacity: tw(f, [g1 - 8 + i * 3, g1 + i * 3]),
            }}
          >
            {win && i === winnerIdx ? "✦ WINNER" : `HOOK ${"ABCD"[i]}`}
          </div>
        ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1552, textAlign: "center", fontFamily: F.display, fontVariationSettings: archivo(700, 100), fontSize: 46, color: B.mist, opacity: tw(f, [g1, g1 + 8]) }}>
        {win ? "Test hooks. Keep the winner." : "Endless variations, on brand."}
      </div>
    </AbsoluteFill>
  );
};
