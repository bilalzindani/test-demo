// Single source of truth for timing. Picture AND sound read from here
// (scripts/export-cues.mjs compiles this file to audio/cues.json).
//
// Grid: 120 BPM @ 30 fps  ->  1 beat = 15 frames, 1 bar = 60 frames.

export const FPS = 30;
export const BPM = 120;
export const BEAT = 15;
export const BAR = 60;
export const TOTAL = 1800; // 60 seconds

export type Range = { from: number; dur: number };

export const SCENES = {
  hook: { from: 0, dur: 150 },
  chaos: { from: 150, dur: 205 },
  logo: { from: 355, dur: 125 }, // the drop lands at global 360
  voice: { from: 480, dur: 225 },
  leads: { from: 690, dur: 210 },
  chat: { from: 900, dur: 225 },
  workflow: { from: 1110, dur: 225 },
  industries: { from: 1305, dur: 195 },
  value: { from: 1500, dur: 120 },
  finale: { from: 1620, dur: 180 },
} satisfies Record<string, Range>;

// ── Scene-local timings ────────────────────────────────────────────────

export const HOOK = {
  dotIn: 8,
  pulses: [15, 30],
  move: [30, 52] as [number, number],
  rings: [45, 75], // ring bursts
  ringDur: 16,
  type: 58,
  missed: 105,
  morph: [118, 150] as [number, number],
};

const CHAOS_CARDS = 46;
export const CHAOS = {
  pullBack: [0, 50] as [number, number],
  // accelerating notification spawns
  spawns: Array.from({ length: CHAOS_CARDS }, (_, i) =>
    Math.round(6 + 158 * Math.pow(i / (CHAOS_CARDS - 1), 0.78)),
  ),
  words: [60, 90, 120, 150],
  glitches: [162, 169, 174, 178],
  implode: [180, 205] as [number, number],
};

export const LOGO = {
  drop: 5,
  letters: [7, 10, 13, 16],
  subtitle: [24, 50] as [number, number],
  tagline: [50, 74] as [number, number],
  zoom: [92, 121] as [number, number],
};

export type Line = { who: "caller" | "agent"; text: string; start: number; end: number };
export const VOICE = {
  orbIn: [0, 24] as [number, number],
  label: 6,
  headline: 14,
  lines: [
    { who: "caller", text: "Hi, do you have anything open Friday evening?", start: 34, end: 76 },
    { who: "agent", text: "I do! 4:30 or 6:00 PM. Which works best?", start: 82, end: 124 },
    { who: "caller", text: "6 works.", start: 130, end: 144 },
  ] as Line[],
  booked: 154,
  whipOut: [210, 225] as [number, number],
};

const LEAD_COUNT = 16;
const INITIALS = ["JM", "AK", "SR", "TL", "PD", "MN", "RB", "CW", "EH", "LO", "VG", "DS", "NK", "FA", "YT", "BZ"];
// lane: 0 = hot, 1 = warm, 2 = nurture
const LANES = [0, 1, 0, 2, 1, 0, 1, 2, 0, 1, 0, 2, 1, 0, 2, 0];
const SCORES = [92, 71, 88, 34, 66, 95, 58, 41, 90, 63, 84, 28, 74, 97, 38, 86];
export const LEADS = {
  whipIn: [0, 15] as [number, number],
  pathsDraw: [8, 40] as [number, number],
  words: [15, 30, 45],
  travelIn: 30,
  hold: 8,
  travelOut: 28,
  leads: Array.from({ length: LEAD_COUNT }, (_, i) => ({
    start: Math.round(30 + i * 6.5),
    source: i % 3,
    lane: LANES[i],
    score: SCORES[i],
    initials: INITIALS[i],
  })),
  stripes: [192, 210] as [number, number],
};

export type ChatEvent =
  | { t: number; who: "user" | "bot"; text: string; tracker?: boolean }
  | { t: number; typing: number }
  | { t: number; chips: string[] };

export const CHAT = {
  reveal: [0, 16] as [number, number],
  center: [
    { t: 16, who: "user", text: "Where's my order #4471?" },
    { t: 27, typing: 44 },
    { t: 44, who: "bot", text: "Out for delivery. Arriving today by 5 PM.", tracker: true },
    { t: 76, who: "user", text: "Can I return the blue one?" },
    { t: 86, typing: 100 },
    { t: 100, who: "bot", text: "Absolutely. Your return label is on its way." },
    { t: 126, chips: ["Track another order", "Talk to a human", "New arrivals"] },
  ] as ChatEvent[],
  left: [
    { t: 24, who: "user", text: "Table for 6 on Friday?" },
    { t: 38, typing: 54 },
    { t: 54, who: "bot", text: "Booked for 7:00 PM. See you then!" },
    { t: 110, who: "user", text: "Can we add a birthday cake?" },
    { t: 122, typing: 136 },
    { t: 136, who: "bot", text: "Done. The kitchen has a note." },
  ] as ChatEvent[],
  right: [
    { t: 34, who: "user", text: "Our AC stopped cooling" },
    { t: 46, typing: 64 },
    { t: 64, who: "bot", text: "A technician can come Thu at 10 AM. Confirm?" },
    { t: 96, who: "user", text: "Yes please" },
    { t: 108, typing: 120 },
    { t: 120, who: "bot", text: "Confirmed. Reminder set for Wed." },
  ] as ChatEvent[],
  zoom: [196, 225] as [number, number],
};

export const FLOW = {
  fadeIn: [0, 16] as [number, number],
  // node id -> activation frame (packet arrives, node lights up)
  activate: { trigger: 20, ai: 44, crm: 68, whatsapp: 74, calendar: 80, team: 104, sheet: 110, report: 134 } as Record<string, number>,
};

export const IND = {
  panelsIn: [0, 30] as [number, number],
  land: [18, 22, 26, 30],
  beats: [45, 60, 75, 90, 105, 120, 135, 150],
  flip: [162, 166, 170, 174],
  flipDur: 14,
  close: [186, 195] as [number, number],
};

export const VALUE = {
  cards: [0, 30, 60, 90],
};

export const FINALE = {
  line1: 0,
  line2: 30,
  collapse: [46, 60] as [number, number],
  logo: 60,
  subtitle: [70, 92] as [number, number],
  url: [84, 104] as [number, number],
  cta: 96,
  cursor: [102, 124] as [number, number],
  click: 124,
  outro: [150, 174] as [number, number],
};

export const at = (scene: keyof typeof SCENES, local: number) => SCENES[scene].from + local;
