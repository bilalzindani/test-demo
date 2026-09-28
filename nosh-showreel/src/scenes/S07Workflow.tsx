import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { evolvePath, getLength, getPointAtLength } from "@remotion/paths";
import { BarChart3, Bell, Bot, CalendarCheck, Check, Database, FileSpreadsheet, MessageCircle, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { C, F, archivo } from "../lib/theme";
import { ease, kf, lerp, sp, springs, tw } from "../lib/motion";
import { FLOW } from "../lib/timeline";
import { ChapterTag, Words } from "../components/Kinetic";

// 04 — Workflow Automation. A node graph on a tilted infinite canvas. The
// camera rides the execution: packets race along connectors, nodes light up
// and tick; then we pull back to reveal the scale — dozens of workflows.

const NW = 310;
const NH = 112;
type Node = { id: string; x: number; y: number; Icon: LucideIcon; title: string; sub: string };
const NODES: Node[] = [
  { id: "trigger", x: 0, y: 0, Icon: Zap, title: "New lead captured", sub: "WEBHOOK · CALL / FORM" },
  { id: "ai", x: 440, y: 0, Icon: Bot, title: "AI qualifies & scores", sub: "NOSH AI · SCORE + ROUTE" },
  { id: "crm", x: 880, y: -235, Icon: Database, title: "Create CRM contact", sub: "CRM · UPSERT" },
  { id: "whatsapp", x: 880, y: 0, Icon: MessageCircle, title: "WhatsApp follow-up", sub: "WHATSAPP · TEMPLATE" },
  { id: "calendar", x: 880, y: 235, Icon: CalendarCheck, title: "Book the call", sub: "CALENDAR · AUTO-SLOT" },
  { id: "team", x: 1320, y: -118, Icon: Bell, title: "Notify sales team", sub: "ZAPIER · ALERT" },
  { id: "sheet", x: 1320, y: 118, Icon: FileSpreadsheet, title: "Update the sheet", sub: "MAKE · SYNC ROW" },
  { id: "report", x: 1760, y: 0, Icon: BarChart3, title: "Weekly report", sub: "AUTO · EVERY MONDAY" },
];
const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));
const EDGES: [string, string][] = [
  ["trigger", "ai"],
  ["ai", "crm"],
  ["ai", "whatsapp"],
  ["ai", "calendar"],
  ["crm", "team"],
  ["whatsapp", "team"],
  ["whatsapp", "sheet"],
  ["calendar", "sheet"],
  ["team", "report"],
  ["sheet", "report"],
];
const edgePath = (a: Node, b: Node) => {
  const x1 = a.x + NW / 2;
  const x2 = b.x - NW / 2;
  const mx = (x1 + x2) / 2;
  return `M ${x1} ${a.y} C ${mx} ${a.y} ${mx} ${b.y} ${x2} ${b.y}`;
};
const PATHS = EDGES.map(([a, b]) => {
  const d = edgePath(byId[a], byId[b]);
  return { a, b, d, len: getLength(d) };
});

// ghost workflows around the main graph, revealed on the pull-back
const GHOSTS = Array.from({ length: 46 }, (_, i) => {
  let x = 0;
  let y = 0;
  for (let k = 0; k < 20; k++) {
    x = -1500 + random(`gx${i}-${k}`) * 4800;
    y = -1500 + random(`gy${i}-${k}`) * 3000;
    const inMain = x > -380 && x < 2140 && y > -420 && y < 420;
    if (!inMain) break;
  }
  return { x, y, w: 180 + random(`gw${i}`) * 120, lit: random(`gl${i}`) < 0.45 };
});

export const Workflow: React.FC = () => {
  const f = useCurrentFrame();
  const act = FLOW.activate;

  // camera (world → screen), keyframed along the execution
  const T = [0, 22, 46, 82, 112, 136, 196, 225];
  const focusX = kf(f, T, [0, 60, 440, 880, 1320, 1600, 880, 880]);
  const focusY = kf(f, T, [0, 0, -20, -40, -35, -20, 40, 40]);
  const zoom = kf(f, T, [2.5, 2.05, 1.7, 1.35, 1.2, 1.05, 0.5, 0.46]);
  const tilt = kf(f, T, [0, 10, 14, 16, 18, 20, 38, 40]);
  const spin = kf(f, T, [0, 0, 0, -2, -3, -4, -9, -10]);
  const fadeIn = tw(f, FLOW.fadeIn);
  const ghostIn = tw(f, [128, 180], [0, 1], ease.out);
  const tasks = Math.floor(1284 + Object.values(act).filter((t) => f >= t).length * 17 + Math.max(0, f - 136) * 2.2);

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      {/* 3D plane */}
      <div style={{ position: "absolute", left: 960, top: 625, perspective: 1600 }}>
        <div
          style={{
            position: "absolute",
            transformStyle: "preserve-3d",
            transform: `rotateX(${tilt}deg) rotateZ(${spin}deg) scale(${zoom}) translate(${-focusX}px, ${-focusY}px)`,
          }}
        >
          {/* dot grid on the plane */}
          <div
            style={{
              position: "absolute",
              left: -2600,
              top: -2000,
              width: 6400,
              height: 4000,
              backgroundImage: "radial-gradient(rgba(243,241,234,0.16) 2px, transparent 2.4px)",
              backgroundSize: "56px 56px",
              maskImage: "radial-gradient(ellipse at 45% 50%, black 30%, transparent 70%)",
            }}
          />

          {/* ghost workflows */}
          {ghostIn > 0 &&
            GHOSTS.map((g, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: g.x - g.w / 2,
                  top: g.y - 40,
                  width: g.w,
                  height: 80,
                  borderRadius: 20,
                  border: `2px solid ${g.lit ? "rgba(200,255,46,0.55)" : "rgba(243,241,234,0.14)"}`,
                  background: "rgba(22,25,37,0.8)",
                  opacity: ghostIn * (0.65 + 0.35 * random(`go${i}`)),
                  transform: `scale(${lerp(0.6, 1, tw(ghostIn, [random(`gd${i}`) * 0.5, random(`gd${i}`) * 0.5 + 0.5], [0, 1], ease.backOut))})`,
                }}
              >
                <div style={{ position: "absolute", left: 16, top: 20, width: 40, height: 40, borderRadius: 12, background: g.lit ? C.lime : "rgba(243,241,234,0.1)" }} />
                <div style={{ position: "absolute", left: 70, top: 26, width: g.w - 100, height: 10, borderRadius: 5, background: "rgba(243,241,234,0.22)" }} />
                <div style={{ position: "absolute", left: 70, top: 46, width: (g.w - 100) * 0.6, height: 8, borderRadius: 4, background: "rgba(243,241,234,0.12)" }} />
              </div>
            ))}

          {/* connectors + packets */}
          <svg width={10} height={10} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
            {PATHS.map((p, i) => {
              const tEnd = act[p.b];
              const tStart = act[p.a];
              const drawP = tw(f, [tStart - 2, tStart + 10], [0, 1], ease.inOut);
              const e = evolvePath(drawP, p.d);
              const pk = tw(f, [tEnd - 16, tEnd], [0, 1], ease.inOut);
              const pt = pk > 0 && pk < 1 ? getPointAtLength(p.d, p.len * pk) : null;
              const trail = [0.06, 0.12, 0.18].map((dt) => (pk - dt > 0 && pk < 1 ? getPointAtLength(p.d, p.len * (pk - dt)) : null));
              const done = f >= tEnd;
              return (
                <g key={i}>
                  <path d={p.d} fill="none" stroke={done ? C.lime : "rgba(243,241,234,0.3)"} strokeOpacity={done ? 0.75 : 1} strokeWidth={3} strokeDasharray={e.strokeDasharray} strokeDashoffset={e.strokeDashoffset} />
                  {done && <path d={p.d} fill="none" stroke={C.lime} strokeWidth={3} strokeDasharray="4 18" strokeDashoffset={-f * 2.5} opacity={0.9} />}
                  {trail.map((tp, k) => tp && <circle key={k} cx={tp.x} cy={tp.y} r={9 - k * 2.4} fill={C.lime} opacity={0.5 - k * 0.14} />)}
                  {pt && (
                    <>
                      <circle cx={pt.x} cy={pt.y} r={24} fill={C.lime} opacity={0.25} />
                      <circle cx={pt.x} cy={pt.y} r={11} fill={C.lime} />
                    </>
                  )}
                </g>
              );
            })}
          </svg>

          {/* nodes */}
          {NODES.map((n, i) => {
            const on = f >= act[n.id];
            const flash = on ? Math.exp(-(f - act[n.id]) / 6) : 0;
            const badge = sp(f, springs.pop, act[n.id] + 2);
            const appear = sp(f, springs.smooth, act[n.id] - 26 - i);
            return (
              <div
                key={n.id}
                style={{
                  position: "absolute",
                  left: n.x - NW / 2,
                  top: n.y - NH / 2,
                  width: NW,
                  height: NH,
                  borderRadius: 26,
                  background: on ? "linear-gradient(180deg, #1D2230, #151924)" : "rgba(22,25,37,0.96)",
                  border: `2px solid ${on ? C.lime : "rgba(243,241,234,0.16)"}`,
                  boxShadow: on ? `0 0 ${30 + 60 * flash}px rgba(200,255,46,${0.25 + 0.35 * flash}), 0 24px 50px rgba(0,0,0,0.5)` : "0 24px 50px rgba(0,0,0,0.5)",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  paddingLeft: 18,
                  opacity: appear,
                  transform: `scale(${lerp(0.85, 1, appear) * (1 + 0.06 * flash)})`,
                }}
              >
                <div style={{ width: 62, height: 62, borderRadius: 18, background: on ? C.lime : "rgba(243,241,234,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <n.Icon size={32} color={on ? C.ink : C.paperDim} strokeWidth={2.3} />
                </div>
                <div>
                  <div style={{ fontFamily: F.ui, fontSize: 23, fontWeight: 650, color: C.paper, whiteSpace: "nowrap" }}>{n.title}</div>
                  <div style={{ fontFamily: F.mono, fontSize: 14, letterSpacing: "0.12em", color: on ? C.lime : C.muted, marginTop: 6, whiteSpace: "nowrap" }}>{n.sub}</div>
                </div>
                {on && (
                  <div
                    style={{
                      position: "absolute",
                      right: -14,
                      top: -14,
                      height: 34,
                      padding: "0 10px 0 6px",
                      borderRadius: 17,
                      background: C.lime,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontFamily: F.mono,
                      fontSize: 14,
                      fontWeight: 800,
                      color: C.ink,
                      transform: `scale(${badge})`,
                    }}
                  >
                    <Check size={18} color={C.ink} strokeWidth={3.2} /> {(0.2 + random(`ms${n.id}`) * 0.6).toFixed(1)}s
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* screen-space type */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(7,8,12,0.9) 0%, rgba(7,8,12,0.55) 26%, transparent 42%, transparent 76%, rgba(7,8,12,0.8) 100%)" }} />
      <div style={{ position: "absolute", left: 150, top: 150 }}>
        <ChapterTag idx="04" label="WORKFLOW AUTOMATION" start={10} />
      </div>
      <Words
        segs={[{ t: "Workflows that run" }, { t: "themselves.", accent: true }]}
        start={16}
        stagger={3}
        size={92}
        style={{ position: "absolute", left: 146, top: 196 }}
      />
      <div
        style={{
          position: "absolute",
          left: 150,
          bottom: 120,
          fontFamily: F.mono,
          fontSize: 18,
          letterSpacing: "0.2em",
          fontWeight: 700,
          color: C.paperDim,
          opacity: tw(f, [40, 52]),
        }}
      >
        <span style={{ color: C.lime }}>MAKE · ZAPIER · YOUR CRM</span> — SYNCED IN REAL TIME
      </div>
      <div style={{ position: "absolute", right: 150, bottom: 110, textAlign: "right", opacity: tw(f, [40, 52]) }}>
        <div style={{ fontFamily: F.mono, fontSize: 17, letterSpacing: "0.22em", color: C.paperDim, fontWeight: 700 }}>TASKS AUTOMATED TODAY</div>
        <div style={{ fontFamily: F.display, fontVariationSettings: archivo(800, 80), fontSize: 84, color: C.lime, lineHeight: 1 }}>
          {tasks.toLocaleString("en-US")}
        </div>
      </div>
    </AbsoluteFill>
  );
};
