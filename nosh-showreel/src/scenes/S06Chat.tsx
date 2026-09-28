import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Globe, MessageCircle, Phone } from "lucide-react";
import { C, F } from "../lib/theme";
import { ease, lerp, sp, tw } from "../lib/motion";
import { CHAT } from "../lib/timeline";
import { ChapterTag, Words } from "../components/Kinetic";
import { ChatPhone, PHONE_H, PHONE_W } from "../components/ChatPhone";
import { Stripes } from "../components/Stripes";

// 03 — AI Chatbots. Three live conversations on three channels, in a real
// CSS-3D rig that slowly orbits. Exit: zoom-through into the thread.

const RIG_X = 1265;
const RIG_Y = 560;

const PHONES = [
  { key: "left", x: -470, z: -320, ry: 24, events: CHAT.left, channel: "Messenger", Icon: MessageCircle, tag: "RESTAURANT", accent: C.violetSoft, delay: -12 },
  { key: "right", x: 470, z: -320, ry: -24, events: CHAT.right, channel: "WhatsApp", Icon: Phone, tag: "HOME SERVICES", accent: C.cyan, delay: -8 },
  { key: "center", x: 0, z: 0, ry: 0, events: CHAT.center, channel: "Website chat", Icon: Globe, tag: "E-COMMERCE", accent: C.lime, delay: -16 },
];

export const Chat: React.FC = () => {
  const f = useCurrentFrame();
  const ry = lerp(14, -10, tw(f, [0, 210], [0, 1], ease.inOut));
  const rx = lerp(10, 5, tw(f, [0, 210], [0, 1], ease.inOut));
  const z = tw(f, CHAT.zoom, [0, 1], ease.expoIn);
  const zoomS = Math.exp(Math.log(7) * z);

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          transformOrigin: `${RIG_X}px ${RIG_Y + 230}px`,
          transform: `scale(${zoomS})`,
          opacity: 1 - tw(f, [CHAT.zoom[1] - 12, CHAT.zoom[1] - 1]),
          filter: z > 0.02 ? `blur(${z * 12}px)` : undefined,
        }}
      >
        {/* glow behind rig */}
        <div
          style={{
            position: "absolute",
            left: RIG_X - 700,
            top: RIG_Y - 600,
            width: 1400,
            height: 1200,
            background: "radial-gradient(ellipse at center, rgba(124,92,255,0.22), transparent 60%)",
          }}
        />
        <div style={{ position: "absolute", left: RIG_X, top: RIG_Y, perspective: 2100 }}>
          <div style={{ transformStyle: "preserve-3d", transform: `scale(1.1) rotateX(${rx}deg) rotateY(${ry}deg)` }}>
            {PHONES.map((p) => {
              const s = sp(f, { damping: 20, stiffness: 110, mass: 1 }, p.delay);
              return (
                <div
                  key={p.key}
                  style={{
                    position: "absolute",
                    left: -PHONE_W / 2,
                    top: -PHONE_H / 2,
                    transform: `translate3d(${p.x}px, ${(1 - s) * 1100}px, ${p.z}px) rotateY(${p.ry + (1 - s) * 30}deg)`,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: -58,
                      left: 0,
                      right: 0,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        padding: "8px 16px",
                        borderRadius: 999,
                        border: `1.5px solid ${p.accent}`,
                        color: p.accent,
                        fontFamily: F.mono,
                        fontSize: 15,
                        letterSpacing: "0.2em",
                        fontWeight: 700,
                        background: "rgba(7,8,12,0.6)",
                      }}
                    >
                      {p.tag}
                    </div>
                  </div>
                  <ChatPhone f={f} events={p.events} channel={p.channel} ChannelIcon={p.Icon} accent={p.accent} />
                </div>
              );
            })}
          </div>
        </div>

        {/* headline */}
        <div style={{ position: "absolute", left: 150, top: 300 }}>
          <ChapterTag idx="03" label="AI CHATBOTS" start={10} />
        </div>
        <Words
          segs={[{ t: "Chatbots" }, { br: true, t: "" }, { t: "that" }, { t: "convert.", accent: true }]}
          start={16}
          stagger={4}
          size={104}
          lineHeight={1.04}
          style={{ position: "absolute", left: 146, top: 356 }}
        />
        <div style={{ position: "absolute", left: 150, top: 600, width: 470, opacity: tw(f, [34, 46]), transform: `translateY(${(1 - tw(f, [34, 50], [0, 1], ease.expoOut)) * 20}px)` }}>
          <div style={{ fontFamily: F.mono, fontSize: 18, letterSpacing: "0.2em", color: C.lime, fontWeight: 700 }}>WEBSITE · MESSENGER · WHATSAPP</div>
          <div style={{ fontFamily: F.ui, fontSize: 27, color: C.paperDim, marginTop: 14, lineHeight: 1.4 }}>
            Answers FAQs, qualifies leads and drives conversions, instantly.
          </div>
        </div>
      </AbsoluteFill>

      <Stripes f={f} phase="out" start={CHAT.reveal[0]} dur={CHAT.reveal[1] - CHAT.reveal[0]} />
    </AbsoluteFill>
  );
};
