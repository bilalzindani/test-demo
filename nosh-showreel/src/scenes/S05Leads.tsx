import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { evolvePath, getLength, getPointAtLength } from "@remotion/paths";
import { Database, Flame, Globe, Hourglass, MessageCircle, Phone, Thermometer } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { C, F, archivo } from "../lib/theme";
import { ease, lerp, sp, springs, tw } from "../lib/motion";
import { LEADS } from "../lib/timeline";
import { ChapterTag, Words } from "../components/Kinetic";
import { DotGrid } from "../components/Backdrop";
import { Stripes } from "../components/Stripes";
import { Whip, whipCurve } from "../components/Whip";

// 02 — Lead Qualification System. Calls, WhatsApp and web forms feed an AI
// scoring core; every lead is scored, routed to a lane, and counted.

const SRC_Y = [480, 650, 820];
const LANE_Y = [480, 650, 820];
const CORE = { x: 975, y: 650, r: 108 };
const SRC_R = 430; // right edge of source cards
const LANE_L = 1400;

const SOURCES: { Icon: LucideIcon; label: string }[] = [
  { Icon: Phone, label: "Calls" },
  { Icon: MessageCircle, label: "WhatsApp" },
  { Icon: Globe, label: "Web forms" },
];
const LANES: { Icon: LucideIcon; label: string; to: string; color: string; text: string }[] = [
  { Icon: Flame, label: "HOT", to: "Book a sales call", color: C.lime, text: C.ink },
  { Icon: Thermometer, label: "WARM", to: "Nurture sequence", color: C.violet, text: C.paper },
  { Icon: Hourglass, label: "NURTURE", to: "Follow up in 30 days", color: "#5A6072", text: C.paper },
];

const inPath = (i: number) => `M ${SRC_R} ${SRC_Y[i]} C ${SRC_R + 230} ${SRC_Y[i]} ${CORE.x - 330} ${CORE.y} ${CORE.x - CORE.r} ${CORE.y}`;
const outPath = (j: number) => `M ${CORE.x + CORE.r} ${CORE.y} C ${CORE.x + 260} ${CORE.y} ${LANE_L - 230} ${LANE_Y[j]} ${LANE_L} ${LANE_Y[j]}`;
const IN = [0, 1, 2].map(inPath);
const OUT = [0, 1, 2].map(outPath);
const IN_LEN = IN.map((p) => getLength(p));
const OUT_LEN = OUT.map((p) => getLength(p));

const leadTimes = (l: (typeof LEADS.leads)[number]) => {
  const arrive = l.start + LEADS.travelIn;
  const leave = arrive + LEADS.hold;
  const land = leave + LEADS.travelOut;
  return { arrive, leave, land };
};

export const Leads: React.FC = () => {
  const f = useCurrentFrame();
  const whip = whipCurve(f - LEADS.whipIn[0], LEADS.whipIn[1] - LEADS.whipIn[0]);
  const [d0, d1] = LEADS.pathsDraw;

  // lead currently being scored at the core
  const scoring = [...LEADS.leads].reverse().find((l) => {
    const { arrive, leave } = leadTimes(l);
    return f >= arrive && f < leave + 6;
  });
  const scoreP = scoring ? tw(f, [leadTimes(scoring).arrive, leadTimes(scoring).leave], [0, 1], ease.out) : 0;
  const counts = [0, 1, 2].map((j) => LEADS.leads.filter((l) => l.lane === j && f >= leadTimes(l).land).length);
  const lastLand = [0, 1, 2].map((j) =>
    LEADS.leads.filter((l) => l.lane === j && f >= leadTimes(l).land).reduce((m, l) => Math.max(m, leadTimes(l).land), -99),
  );
  const qualified = counts[0] + counts[1] + counts[2];

  return (
    <AbsoluteFill>
      <Whip id="whip-leads" x={whip.in} blur={whip.blur}>
        <AbsoluteFill style={{ opacity: 0.8 }}>
          <DotGrid gap={44} opacity={0.08} />
        </AbsoluteFill>

        {/* header */}
        <div style={{ position: "absolute", left: 150, top: 150 }}>
          <ChapterTag idx="02" label="LEAD QUALIFICATION SYSTEM" start={4} />
        </div>
        <div style={{ position: "absolute", left: 146, top: 196, display: "flex", gap: 0 }}>
          <Words segs={[{ t: "Qualify." }]} start={LEADS.words[0]} size={96} mode="rise" />
          <Words segs={[{ t: "Nurture." }]} start={LEADS.words[1]} size={96} mode="scale" />
          <Words segs={[{ t: "Follow up.", accent: true }]} start={LEADS.words[2]} size={96} mode="rise" stagger={2} />
        </div>
        <div
          style={{
            position: "absolute",
            right: 150,
            top: 170,
            textAlign: "right",
            fontFamily: F.mono,
            opacity: tw(f, [40, 50]),
          }}
        >
          <div style={{ fontSize: 17, letterSpacing: "0.22em", color: C.paperDim, fontWeight: 700 }}>LEADS QUALIFIED TODAY</div>
          <div style={{ fontFamily: F.display, fontVariationSettings: archivo(800, 80), fontSize: 92, color: C.paper, lineHeight: 1 }}>
            {String(1284 + qualified * 3).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </div>
        </div>

        {/* paths */}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {IN.map((p, i) => {
            const e = evolvePath(tw(f, [d0 + i * 4, d1 + i * 4], [0, 1], ease.inOut), p);
            return <path key={`i${i}`} d={p} fill="none" stroke={C.paper} strokeOpacity={0.22} strokeWidth={2.5} strokeDasharray={e.strokeDasharray} strokeDashoffset={e.strokeDashoffset} />;
          })}
          {OUT.map((p, j) => {
            const e = evolvePath(tw(f, [d0 + 10 + j * 4, d1 + 10 + j * 4], [0, 1], ease.inOut), p);
            return <path key={`o${j}`} d={p} fill="none" stroke={LANES[j].color} strokeOpacity={0.5} strokeWidth={2.5} strokeDasharray={e.strokeDasharray} strokeDashoffset={e.strokeDashoffset} />;
          })}
          {/* flowing dashes on top once drawn */}
          {[...IN, ...OUT].map((p, k) => (
            <path key={`fl${k}`} d={p} fill="none" stroke={k < 3 ? C.paper : LANES[k - 3].color} strokeOpacity={0.55 * tw(f, [d1 + 8, d1 + 18])} strokeWidth={2.5} strokeDasharray="3 16" strokeDashoffset={-f * 2.2} />
          ))}
        </svg>

        {/* sources */}
        {SOURCES.map((s, i) => {
          const p = sp(f, springs.smooth, -14 + i * 3);
          return (
            <div
              key={s.label}
              style={{
                position: "absolute",
                left: 150,
                top: SRC_Y[i] - 42,
                width: SRC_R - 150,
                height: 84,
                borderRadius: 22,
                background: "rgba(22,25,37,0.95)",
                border: "1px solid rgba(243,241,234,0.14)",
                display: "flex",
                alignItems: "center",
                gap: 16,
                paddingLeft: 20,
                opacity: p,
                transform: `translateX(${(1 - p) * -60}px)`,
              }}
            >
              <div style={{ width: 46, height: 46, borderRadius: 14, background: "rgba(243,241,234,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <s.Icon size={24} color={C.paper} strokeWidth={2.2} />
              </div>
              <div style={{ fontFamily: F.ui, fontSize: 25, fontWeight: 600, color: C.paper }}>{s.label}</div>
            </div>
          );
        })}

        {/* core */}
        <div
          style={{
            position: "absolute",
            left: CORE.x - CORE.r,
            top: CORE.y - CORE.r,
            width: CORE.r * 2,
            height: CORE.r * 2,
            borderRadius: "50%",
            background: "radial-gradient(circle, #1A1E2B 0%, #10131C 70%)",
            border: `2px solid ${C.lime}`,
            boxShadow: `0 0 60px rgba(200,255,46,${0.18 + 0.2 * scoreP})`,
            overflow: "hidden",
            transform: `scale(${sp(f, springs.bouncy, -12)})`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `conic-gradient(from ${f * 9}deg, rgba(200,255,46,0.38), rgba(200,255,46,0) 70deg, transparent 360deg)`,
            }}
          />
        </div>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <circle cx={CORE.x} cy={CORE.y} r={CORE.r + 22} fill="none" stroke={C.lime} strokeOpacity={0.35} strokeWidth={2} strokeDasharray="2 9" transform={`rotate(${-f * 1.5} ${CORE.x} ${CORE.y})`} />
          {scoring && (
            <circle
              cx={CORE.x}
              cy={CORE.y}
              r={CORE.r + 10}
              fill="none"
              stroke={LANES[scoring.lane].color === "#5A6072" ? C.paperDim : LANES[scoring.lane].color}
              strokeWidth={7}
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * (CORE.r + 10) * (scoring.score / 100) * scoreP} 9999`}
              transform={`rotate(-90 ${CORE.x} ${CORE.y})`}
            />
          )}
        </svg>
        <div style={{ position: "absolute", left: CORE.x - 100, top: CORE.y - 50, width: 200, textAlign: "center" }}>
          <div style={{ fontFamily: F.display, fontVariationSettings: archivo(800, 90), fontSize: 64, color: C.paper, lineHeight: 1 }}>
            {scoring ? Math.round(scoring.score * scoreP) : "AI"}
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 15, letterSpacing: "0.24em", color: C.lime, marginTop: 8, fontWeight: 700 }}>
            {scoring ? "LEAD SCORE" : "SCORING"}
          </div>
        </div>

        {/* lanes */}
        {LANES.map((l, j) => {
          const p = sp(f, springs.smooth, -10 + j * 3);
          const bump = f >= lastLand[j] ? Math.exp(-(f - lastLand[j]) / 5) : 0;
          return (
            <div
              key={l.label}
              style={{
                position: "absolute",
                left: LANE_L,
                top: LANE_Y[j] - 50,
                width: 400,
                height: 100,
                borderRadius: 22,
                background: "rgba(22,25,37,0.95)",
                border: `1.5px solid ${j === 2 ? "rgba(243,241,234,0.18)" : l.color}`,
                display: "flex",
                alignItems: "center",
                gap: 16,
                paddingLeft: 18,
                opacity: p,
                transform: `translateX(${(1 - p) * 60}px) scale(${1 + bump * 0.05})`,
                boxShadow: bump > 0.05 && j < 2 ? `0 0 ${40 * bump}px ${l.color}` : undefined,
              }}
            >
              <div style={{ width: 54, height: 54, borderRadius: 16, background: l.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <l.Icon size={28} color={l.text} strokeWidth={2.4} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: F.mono, fontSize: 18, letterSpacing: "0.2em", fontWeight: 800, color: j === 2 ? C.paperDim : l.color === C.violet ? C.violetSoft : l.color }}>{l.label}</div>
                <div style={{ fontFamily: F.ui, fontSize: 19, color: C.paperDim, marginTop: 4, whiteSpace: "nowrap" }}>→ {l.to}</div>
              </div>
              <div style={{ fontFamily: F.display, fontVariationSettings: archivo(800, 90), fontSize: 46, color: C.paper, marginRight: 22, minWidth: 40, textAlign: "right" }}>{counts[j]}</div>
            </div>
          );
        })}
        <div
          style={{
            position: "absolute",
            left: LANE_L,
            top: 925,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontFamily: F.mono,
            fontSize: 16,
            letterSpacing: "0.2em",
            color: C.paperDim,
            fontWeight: 700,
            opacity: tw(f, [30, 40]),
          }}
        >
          <Database size={18} color={C.lime} /> SYNCED TO YOUR CRM · REAL TIME
        </div>

        {/* leads in flight */}
        {LEADS.leads.map((l, i) => {
          const { arrive, leave, land } = leadTimes(l);
          if (f < l.start || f > land + 3) return null;
          let x: number;
          let y: number;
          let scale = 1;
          let bg: string = C.paper;
          let fg: string = C.ink;
          if (f < arrive) {
            const p = tw(f, [l.start, arrive], [0, 1], ease.inOut);
            const pt = getPointAtLength(IN[l.source], IN_LEN[l.source] * p) ?? { x: 0, y: 0 };
            x = pt.x;
            y = pt.y;
            scale = sp(f, springs.pop, l.start);
          } else if (f < leave) {
            x = CORE.x - CORE.r;
            y = CORE.y;
            scale = lerp(1, 0, tw(f, [arrive, arrive + 4]));
          } else {
            const p = tw(f, [leave, land], [0, 1], ease.inOut);
            const pt = getPointAtLength(OUT[l.lane], OUT_LEN[l.lane] * p) ?? { x: 0, y: 0 };
            x = pt.x;
            y = pt.y;
            scale = tw(f, [leave, leave + 4]) * (1 - tw(f, [land - 2, land + 3]));
            bg = LANES[l.lane].color;
            fg = LANES[l.lane].text;
          }
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x - 27,
                top: y - 27,
                width: 54,
                height: 54,
                borderRadius: "50%",
                background: bg,
                color: fg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: F.ui,
                fontWeight: 750,
                fontSize: 18,
                transform: `scale(${scale})`,
                boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
              }}
            >
              {l.initials}
            </div>
          );
        })}
      </Whip>
      <Stripes f={f} phase="in" start={LEADS.stripes[0]} dur={LEADS.stripes[1] - LEADS.stripes[0]} />
    </AbsoluteFill>
  );
};
