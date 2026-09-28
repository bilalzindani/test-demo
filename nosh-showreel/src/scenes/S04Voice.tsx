import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import { CalendarCheck } from "lucide-react";
import { C, F } from "../lib/theme";
import { ease, lerp, sp, springs, tw } from "../lib/motion";
import { VOICE } from "../lib/timeline";
import { ChapterTag, Words } from "../components/Kinetic";
import { Spectrum, VoiceOrb } from "../components/VoiceOrb";
import { Whip, whipCurve } from "../components/Whip";

// 01 — AI Voice Agents. The orb is the agent: it listens (low, reactive)
// while the caller speaks and swells when it answers. Captions stream word
// by word; the booking lands; whip-pan out.

const OX = 1270;
const OY = 500;
const R = 200;

export const voiceAmp = (f: number) => {
  let amp = 0.14 + 0.04 * Math.sin(f * 0.2);
  VOICE.lines.forEach((l) => {
    const env = tw(f, [l.start - 2, l.start + 4]) * (1 - tw(f, [l.end - 4, l.end + 4]));
    if (env <= 0) return;
    const n = Math.abs(noise2D(`va${l.start}`, f * 0.45, 0));
    const syl = 0.55 + 0.45 * Math.pow(Math.sin(f * 0.85), 2);
    amp += env * (l.who === "agent" ? 0.95 * (0.35 + 0.65 * n) * syl : 0.3 * (0.4 + 0.6 * n));
  });
  return amp;
};

const Captions: React.FC<{ f: number }> = ({ f }) => {
  const idx = VOICE.lines.reduce((acc, l, i) => (f >= l.start ? i : acc), -1);
  if (idx < 0) return null;
  return (
    <>
      {VOICE.lines.map((l, i) => {
        if (i !== idx && i !== idx - 1) return null;
        const next = VOICE.lines[i + 1];
        const leaving = next ? tw(f, [next.start, next.start + 8], [0, 1], ease.expoOut) : 0;
        if (leaving >= 1) return null;
        const words = l.text.split(" ");
        const span = (l.end - l.start) * 0.85;
        const isAgent = l.who === "agent";
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: OX - 420,
              width: 840,
              top: 836,
              textAlign: "center",
              transform: `translateY(${-leaving * 70}px)`,
              opacity: 1 - leaving,
            }}
          >
            <div
              style={{
                fontFamily: F.mono,
                fontSize: 17,
                letterSpacing: "0.22em",
                fontWeight: 700,
                color: isAgent ? C.lime : C.paperDim,
                marginBottom: 14,
                opacity: tw(f, [l.start, l.start + 4]),
              }}
            >
              {isAgent ? "● NOSH AI AGENT" : "○ CALLER"}
            </div>
            <div style={{ fontFamily: F.ui, fontSize: 40, fontWeight: 520, letterSpacing: "-0.015em", lineHeight: 1.25 }}>
              {words.map((w, k) => {
                const at = l.start + (k * span) / words.length;
                const p = tw(f, [at, at + 5], [0, 1], ease.out);
                const hot = f - at < 8 && f >= at;
                return (
                  <span
                    key={k}
                    style={{
                      display: "inline-block",
                      marginRight: 11,
                      opacity: p,
                      transform: `translateY(${(1 - p) * 12}px)`,
                      filter: p < 1 ? `blur(${(1 - p) * 6}px)` : undefined,
                      color: hot && isAgent ? C.lime : C.paper,
                    }}
                  >
                    {w}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
};

const Confetti: React.FC<{ f: number; x: number; y: number }> = ({ f, x, y }) => {
  if (f < 0 || f > 40) return null;
  return (
    <>
      {Array.from({ length: 22 }).map((_, i) => {
        const a = -Math.PI / 2 + (random(`ca${i}`) - 0.5) * 2.4;
        const v = 9 + random(`cv${i}`) * 12;
        const px = x + Math.cos(a) * v * f;
        const py = y + Math.sin(a) * v * f + 0.55 * f * f;
        const col = [C.lime, C.violet, C.paper, C.cyan][i % 4];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: px,
              top: py,
              width: i % 3 === 0 ? 10 : 7,
              height: i % 3 === 0 ? 10 : 16,
              borderRadius: i % 3 === 0 ? 5 : 2,
              background: col,
              opacity: 1 - f / 40,
              transform: `rotate(${f * (random(`cr${i}`) * 30 - 15)}deg)`,
            }}
          />
        );
      })}
    </>
  );
};

export const Voice: React.FC = () => {
  const f = useCurrentFrame();
  const amp = voiceAmp(f);
  const [w0, w1] = VOICE.whipOut;
  const whip = whipCurve(f - w0, w1 - w0);

  const specIn = tw(f, [14, 30]);
  const orbitIn = tw(f, [18, 36], [0, 1], ease.expoOut);
  const booked = sp(f, springs.bouncy, VOICE.booked);
  const check = tw(f, [VOICE.booked + 6, VOICE.booked + 18], [0, 1], ease.out);
  const secs = 31 + Math.floor(f / 30);

  return (
    <Whip id="whip-voice" x={whip.out} blur={whip.blur}>
      <AbsoluteFill>
        {/* orb glow */}
        <div
          style={{
            position: "absolute",
            left: OX - 520,
            top: OY - 520,
            width: 1040,
            height: 1040,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(200,255,46,${0.1 + amp * 0.12}) 0%, rgba(124,92,255,0.08) 35%, transparent 62%)`,
            opacity: tw(f, [0, 20]),
          }}
        />
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {/* orbit rings */}
          {[
            { rot: -18, rx: 1.62, ry: 0.36, sp: 0.03 },
            { rot: 26, rx: 1.48, ry: 0.3, sp: -0.024 },
          ].map((o, i) => {
            const a = f * o.sp + i * 2;
            const ex = Math.cos(a) * R * o.rx * orbitIn;
            const ey = Math.sin(a) * R * o.ry * orbitIn;
            const rr = (o.rot * Math.PI) / 180;
            return (
              <g key={i} opacity={0.9 * orbitIn}>
                <ellipse
                  cx={OX}
                  cy={OY}
                  rx={R * o.rx * orbitIn}
                  ry={R * o.ry * orbitIn}
                  fill="none"
                  stroke={C.paper}
                  strokeOpacity={0.14}
                  strokeWidth={1.5}
                  strokeDasharray="4 10"
                  transform={`rotate(${o.rot} ${OX} ${OY})`}
                />
                <circle cx={OX + ex * Math.cos(rr) - ey * Math.sin(rr)} cy={OY + ex * Math.sin(rr) + ey * Math.cos(rr)} r={6} fill={i ? C.violetSoft : C.lime} />
              </g>
            );
          })}
          <Spectrum f={f} cx={OX} cy={OY} r={R * 1.34} amp={amp} opacity={specIn} />
          <VoiceOrb f={f} cx={OX} cy={OY} R={R} amp={amp} assembleAt={0} />
        </svg>

        {/* live call pill */}
        <div
          style={{
            position: "absolute",
            left: OX - 150,
            top: 150,
            width: 300,
            height: 52,
            borderRadius: 26,
            border: `1.5px solid rgba(200,255,46,0.45)`,
            background: "rgba(200,255,46,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            fontFamily: F.mono,
            fontSize: 19,
            fontWeight: 700,
            letterSpacing: "0.16em",
            color: C.lime,
            opacity: tw(f, [10, 20]),
            transform: `translateY(${(1 - tw(f, [10, 24], [0, 1], ease.expoOut)) * -20}px)`,
          }}
        >
          <span style={{ width: 11, height: 11, borderRadius: 6, background: C.lime, opacity: 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(f * 0.4)) }} />
          LIVE CALL · 00:{String(secs).padStart(2, "0")}
        </div>

        <Captions f={f} />

        {/* left column */}
        <div style={{ position: "absolute", left: 150, top: 250 }}>
          <ChapterTag idx="01" label="AI VOICE AGENTS" start={VOICE.label} />
        </div>
        <Words
          segs={[{ t: "Voice agents" }, { br: true, t: "" }, { t: "that" }, { t: "never", accent: true }, { br: true, t: "" }, { t: "miss a call." }]}
          start={VOICE.headline}
          stagger={3}
          size={104}
          weight={800}
          lineHeight={1.04}
          style={{ position: "absolute", left: 146, top: 310 }}
        />
        <div
          style={{
            position: "absolute",
            left: 150,
            top: 690,
            width: 560,
            opacity: tw(f, [40, 52]),
            transform: `translateY(${(1 - tw(f, [40, 56], [0, 1], ease.expoOut)) * 20}px)`,
          }}
        >
          <div style={{ fontFamily: F.mono, fontSize: 18, letterSpacing: "0.2em", color: C.lime, fontWeight: 700 }}>SALES · APPOINTMENTS · SUPPORT</div>
          <div style={{ fontFamily: F.ui, fontSize: 27, color: C.paperDim, marginTop: 14, lineHeight: 1.4 }}>
            Custom-trained on your business. Answers, qualifies and books around the clock.
          </div>
        </div>

        {/* booking confirmation */}
        {f >= VOICE.booked && (
          <div
            style={{
              position: "absolute",
              left: 1440,
              top: 612,
              width: 440,
              padding: "22px 24px",
              borderRadius: 24,
              background: "rgba(22,25,37,0.97)",
              border: `1.5px solid ${C.lime}`,
              boxShadow: "0 30px 70px rgba(0,0,0,0.5), 0 0 40px rgba(200,255,46,0.18)",
              display: "flex",
              gap: 18,
              alignItems: "center",
              transform: `translateY(${(1 - booked) * 80}px) scale(${lerp(0.7, 1, booked)}) rotate(${(1 - booked) * 8}deg)`,
              opacity: Math.min(1, booked * 2),
            }}
          >
            <div style={{ width: 62, height: 62, borderRadius: 18, background: C.lime, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <CalendarCheck size={34} color={C.ink} strokeWidth={2.4} />
            </div>
            <div style={{ fontFamily: F.ui }}>
              <div style={{ fontSize: 25, fontWeight: 700, color: C.paper, display: "flex", alignItems: "center", gap: 10 }}>
                Appointment booked
                <svg width={24} height={24} viewBox="0 0 24 24">
                  <path d="M4 12.5 L10 18 L20 6" fill="none" stroke={C.lime} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={30} strokeDashoffset={30 * (1 - check)} />
                </svg>
              </div>
              <div style={{ fontSize: 19, color: C.muted, marginTop: 5 }}>Fri · 6:00 PM · SMS confirmation sent</div>
            </div>
          </div>
        )}
        <Confetti f={f - VOICE.booked - 4} x={1490} y={640} />
      </AbsoluteFill>
    </Whip>
  );
};
