import React from "react";
import { Send, Sparkles, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { C, F } from "../lib/theme";
import { ease, lerp, sp, springs, tw } from "../lib/motion";
import type { ChatEvent } from "../lib/timeline";

export const PHONE_W = 380;
export const PHONE_H = 800;

const Bubble: React.FC<{ f: number; ev: Extract<ChatEvent, { who: string }> }> = ({ f, ev }) => {
  const lf = f - ev.t;
  const grow = tw(lf, [0, 8], [0, 1], ease.out);
  const s = sp(lf, springs.pop);
  const user = ev.who === "user";
  return (
    <div style={{ maxHeight: grow * 220, overflow: "visible", display: "flex", justifyContent: user ? "flex-end" : "flex-start", marginTop: 12 * grow }}>
      <div
        style={{
          maxWidth: "80%",
          padding: "12px 16px",
          borderRadius: user ? "20px 20px 6px 20px" : "20px 20px 20px 6px",
          background: user ? C.paper : "#232839",
          color: user ? C.ink : C.paper,
          fontFamily: F.ui,
          fontSize: 20,
          lineHeight: 1.36,
          fontWeight: 500,
          transform: `scale(${lerp(0.5, 1, s)})`,
          transformOrigin: user ? "100% 100%" : "0% 100%",
          opacity: Math.min(1, lf / 3),
        }}
      >
        {ev.text}
        {"tracker" in ev && ev.tracker && (
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(243,241,234,0.14)", overflow: "hidden" }}>
              <div style={{ width: `${tw(lf, [6, 26], [0, 78], ease.inOut)}%`, height: 6, background: C.lime }} />
            </div>
            <Truck size={20} color={C.lime} />
          </div>
        )}
      </div>
    </div>
  );
};

const Typing: React.FC<{ f: number; ev: Extract<ChatEvent, { typing: number }> }> = ({ f, ev }) => {
  const lf = f - ev.t;
  const grow = tw(lf, [0, 6], [0, 1], ease.out) * (1 - tw(f, [ev.typing - 1, ev.typing + 1]));
  return (
    <div style={{ maxHeight: grow * 80, marginTop: 12 * grow, opacity: grow, overflow: "hidden" }}>
      <div style={{ display: "inline-flex", gap: 7, padding: "16px 18px", borderRadius: "20px 20px 20px 6px", background: "#232839" }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              background: C.paper,
              opacity: 0.45 + 0.55 * Math.max(0, Math.sin((f - i * 4) * 0.45)),
              transform: `translateY(${-Math.max(0, Math.sin((f - i * 4) * 0.45)) * 5}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

const Chips: React.FC<{ f: number; ev: Extract<ChatEvent, { chips: string[] }> }> = ({ f, ev }) => {
  const lf = f - ev.t;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 * tw(lf, [0, 6]), maxHeight: tw(lf, [0, 8]) * 120 }}>
      {ev.chips.map((c, i) => {
        const s = sp(lf - i * 4, springs.pop);
        return (
          <div
            key={c}
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              border: `1.5px solid ${C.lime}`,
              color: C.lime,
              fontFamily: F.ui,
              fontSize: 16,
              fontWeight: 600,
              transform: `scale(${s})`,
              opacity: lf - i * 4 >= 0 ? 1 : 0,
            }}
          >
            {c}
          </div>
        );
      })}
    </div>
  );
};

export const ChatPhone: React.FC<{
  f: number;
  events: ChatEvent[];
  channel: string;
  ChannelIcon: LucideIcon;
  accent?: string;
}> = ({ f, events, channel, ChannelIcon, accent = C.lime }) => (
  <div
    style={{
      width: PHONE_W,
      height: PHONE_H,
      borderRadius: 58,
      padding: 11,
      background: "linear-gradient(160deg, #2A2F42 0%, #151823 55%, #0E1017 100%)",
      boxShadow: "0 60px 120px rgba(0,0,0,0.6), inset 0 0 0 1.5px rgba(255,255,255,0.08)",
    }}
  >
    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 47, overflow: "hidden", background: "#0A0C12" }}>
      {/* header */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 118,
          paddingTop: 44,
          paddingLeft: 20,
          display: "flex",
          alignItems: "center",
          gap: 13,
          background: "#10131B",
          borderBottom: "1px solid rgba(243,241,234,0.08)",
          zIndex: 2,
        }}
      >
        <div style={{ width: 46, height: 46, borderRadius: 23, background: accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Sparkles size={24} color={C.ink} strokeWidth={2.3} />
        </div>
        <div>
          <div style={{ fontFamily: F.ui, fontSize: 20, fontWeight: 650, color: C.paper }}>Nosh Assistant</div>
          <div style={{ fontFamily: F.mono, fontSize: 13, color: accent, marginTop: 3, display: "flex", alignItems: "center", gap: 6, letterSpacing: "0.06em" }}>
            <ChannelIcon size={13} color={accent} /> {channel} · online
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 13, left: "50%", width: 104, height: 30, marginLeft: -52, borderRadius: 15, background: "#000", zIndex: 3 }} />

      {/* thread (bottom-anchored: new messages push old ones up) */}
      <div
        style={{
          position: "absolute",
          top: 118,
          bottom: 84,
          left: 16,
          right: 16,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          overflow: "hidden",
          paddingBottom: 10,
        }}
      >
        {events.map((ev, i) => {
          if (f < ev.t) return null;
          if ("typing" in ev) return f < ev.typing + 1 ? <Typing key={i} f={f} ev={ev} /> : null;
          if ("chips" in ev) return <Chips key={i} f={f} ev={ev} />;
          return <Bubble key={i} f={f} ev={ev} />;
        })}
      </div>

      {/* composer */}
      <div style={{ position: "absolute", bottom: 16, left: 16, right: 16, height: 56, display: "flex", gap: 10, alignItems: "center" }}>
        <div
          style={{
            flex: 1,
            height: 52,
            borderRadius: 26,
            background: "#161A24",
            display: "flex",
            alignItems: "center",
            paddingLeft: 20,
            fontFamily: F.ui,
            fontSize: 17,
            color: "rgba(243,241,234,0.35)",
          }}
        >
          Type a message…
        </div>
        <div style={{ width: 52, height: 52, borderRadius: 26, background: accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Send size={22} color={C.ink} strokeWidth={2.4} />
        </div>
      </div>
    </div>
  </div>
);
