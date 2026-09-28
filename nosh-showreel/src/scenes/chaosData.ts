import {
  CalendarX,
  ClipboardList,
  FileSpreadsheet,
  Mail,
  MessageCircle,
  MessageSquare,
  Package,
  PhoneMissed,
  RotateCcw,
  ShoppingCart,
  Stethoscope,
  Voicemail,
  Wrench,
} from "lucide-react";
import { random } from "remotion";
import { C } from "../lib/theme";
import type { NotifSpec } from "../components/NotifCard";

export const MISSED_CALL: NotifSpec = {
  Icon: PhoneMissed,
  tone: C.coral,
  title: "Missed call",
  sub: "New customer · 2:47 AM",
  meta: "now",
};

// The backlog every small business knows — one per Nosh industry.
const TEMPLATES: NotifSpec[] = [
  { Icon: MessageCircle, tone: C.lime, title: "WhatsApp · 12 unread", sub: "“Is this still available?”", meta: "1m" },
  { Icon: ShoppingCart, tone: C.violet, title: "Cart abandoned", sub: "$248.00 · 3 items", meta: "4m" },
  { Icon: CalendarX, tone: C.coral, title: "Booking request", sub: "Table for 6 on Friday?", meta: "6m" },
  { Icon: Mail, tone: C.cyan, title: "New lead · no reply", sub: "Waiting 2 days", meta: "2d" },
  { Icon: Package, tone: C.violet, title: "Where's my order?", sub: "Order #4471 · 3rd message", meta: "9m" },
  { Icon: Wrench, tone: C.lime, title: "Quote request", sub: "AC not cooling. Urgent!", meta: "12m" },
  { Icon: Voicemail, tone: C.coral, title: "Voicemail (3)", sub: "Callback requested", meta: "15m" },
  { Icon: ClipboardList, tone: C.cyan, title: "Follow up: Sarah K.", sub: "Overdue · 5 days", meta: "5d" },
  { Icon: RotateCcw, tone: C.violet, title: "Return request", sub: "Order #3920", meta: "22m" },
  { Icon: Stethoscope, tone: C.lime, title: "Reschedule appointment", sub: "Is Dr. Lee free Tuesday?", meta: "31m" },
  { Icon: FileSpreadsheet, tone: C.cyan, title: "Update CRM", sub: "47 records pending", meta: "1h" },
  { Icon: PhoneMissed, tone: C.coral, title: "Missed call", sub: "Unknown · 3:12 AM", meta: "now" },
  { Icon: MessageSquare, tone: C.lime, title: "Website chat", sub: "“Do you deliver on Sundays?”", meta: "2m" },
];

export type CardPlan = {
  spec: NotifSpec;
  t: number;
  x: number;
  y: number;
  rot: number;
  fromX: number;
  fromY: number;
  fromRot: number;
  mode: "fly" | "drop";
};

// Jittered 8×6 grid for the first wave, then a dense pile toward the centre.
export const planCards = (spawns: number[]): CardPlan[] => {
  const cols = 8;
  const rows = 6;
  const cells: { x: number; y: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({ x: -1450 + (c + 0.5) * (2900 / cols), y: -800 + (r + 0.5) * (1600 / rows) });
    }
  }
  // seeded shuffle
  const order = cells.map((_, i) => i).sort((a, b) => random(`cell${a}`) - random(`cell${b}`));

  const plans: CardPlan[] = [
    { spec: MISSED_CALL, t: -100, x: 0, y: 0, rot: 0, fromX: 0, fromY: 0, fromRot: 0, mode: "drop" },
  ];
  spawns.forEach((t, i) => {
    let x: number;
    let y: number;
    if (i < 30) {
      const cell = cells[order[i]];
      x = cell.x + (random(`jx${i}`) - 0.5) * 220;
      y = cell.y + (random(`jy${i}`) - 0.5) * 140;
    } else {
      const a = random(`pa${i}`) * Math.PI * 2;
      const d = 120 + random(`pd${i}`) * 620;
      x = Math.cos(a) * d * 1.5;
      y = Math.sin(a) * d * 0.8;
    }
    const len = Math.hypot(x, y) || 1;
    const dirA = Math.atan2(y, x) + (random(`da${i}`) - 0.5) * 0.9;
    const mode = i % 3 === 1 ? "drop" : "fly";
    plans.push({
      spec: TEMPLATES[i % TEMPLATES.length],
      t,
      x,
      y,
      rot: (random(`rot${i}`) - 0.5) * 14,
      fromX: mode === "fly" ? x + Math.cos(dirA) * (1500 + len * 0.3) : x,
      fromY: mode === "fly" ? y + Math.sin(dirA) * (1100 + len * 0.3) : y,
      fromRot: (random(`fr${i}`) - 0.5) * (mode === "fly" ? 70 : 20),
      mode,
    });
  });
  return plans;
};
