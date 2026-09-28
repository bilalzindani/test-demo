import React from "react";
import type { LucideIcon } from "lucide-react";
import { C, F } from "../lib/theme";

export type NotifSpec = { Icon: LucideIcon; tone: string; title: string; sub: string; meta: string };

export const NOTIF_W = 560;
export const NOTIF_H = 124;
export const NOTIF_ICON = 64; // icon disc diameter
export const NOTIF_ICON_X = 28; // disc left inset

export const cardBg = "rgba(22,25,37,0.96)";
export const cardBorder = "1px solid rgba(243,241,234,0.14)";

// Glassy OS-style notification. Position/transform are supplied by caller.
export const NotifCard: React.FC<{
  spec: NotifSpec;
  style?: React.CSSProperties;
  tint?: number;
  hideIcon?: boolean;
  contentOpacity?: number;
  contentShift?: number;
}> = ({ spec, style, tint = 0, hideIcon = false, contentOpacity = 1, contentShift = 0 }) => {
  const { Icon, tone, title, sub, meta } = spec;
  return (
    <div
      style={{
        position: "absolute",
        width: NOTIF_W,
        height: NOTIF_H,
        borderRadius: 26,
        background: cardBg,
        border: cardBorder,
        boxShadow: "0 30px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
        overflow: "hidden",
        ...style,
      }}
    >
      {!hideIcon && <div
        style={{
          position: "absolute",
          left: NOTIF_ICON_X,
          top: (NOTIF_H - NOTIF_ICON) / 2,
          width: NOTIF_ICON,
          height: NOTIF_ICON,
          borderRadius: "50%",
          background: tone,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={30} color={C.ink} strokeWidth={2.4} />
      </div>}
      <div style={{ position: "absolute", left: 112 + contentShift, top: 28, width: NOTIF_W - 200, fontFamily: F.ui, opacity: contentOpacity }}>
        <div style={{ fontSize: 26, fontWeight: 650, color: C.paper, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>{title}</div>
        <div style={{ fontSize: 19, fontWeight: 450, color: C.muted, marginTop: 6, whiteSpace: "nowrap" }}>{sub}</div>
      </div>
      <div style={{ position: "absolute", left: NOTIF_W - 80 + contentShift, width: 54, textAlign: "right", top: 30, fontFamily: F.mono, fontSize: 15, color: C.muted, opacity: contentOpacity }}>{meta}</div>
      {tint > 0 && <div style={{ position: "absolute", inset: 0, background: C.lime, opacity: tint }} />}
    </div>
  );
};
