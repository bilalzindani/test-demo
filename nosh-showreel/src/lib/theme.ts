// Design tokens for the Nosh AI Automation reel.
// One accent (signal lime) carries the brand; violet and coral are used sparingly.
export const C = {
  ink: "#07080C",
  ink2: "#0C0E15",
  ink3: "#141722",
  ink4: "#1C2030",
  line: "rgba(243,241,234,0.10)",
  lineStrong: "rgba(243,241,234,0.22)",
  paper: "#F3F1EA",
  paperDim: "rgba(243,241,234,0.62)",
  muted: "#8B909E",
  lime: "#C8FF2E",
  limeDeep: "#94C800",
  violet: "#7C5CFF",
  violetSoft: "#A996FF",
  coral: "#FF4D2E",
  cyan: "#33D6FF",
} as const;

export const F = {
  // Archivo variable: wght 100–900, wdth 62–125 (width axis is animated in places)
  display: "'Archivo', 'Helvetica Neue', Arial, sans-serif",
  serif: "'Instrument Serif', Georgia, serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
  ui: "'Inter', 'Helvetica Neue', Arial, sans-serif",
} as const;

// Font variation helper for Archivo: width 62–125, weight 100–900
export const archivo = (wght: number, wdth = 100) =>
  `'wght' ${Math.round(wght)}, 'wdth' ${wdth.toFixed(1)}`;

export const W = 1920;
export const H = 1080;
