// Nosh brand palette, sampled from noshaiautomation.com (hero screenshot):
// pure-black page, a purple-black gradient card, the logo purple, the violet
// accent (menu icon) and the lavender steps used in the headline.
export const B = {
  black: "#000000",
  panelTop: "#180F24",
  panelMid: "#110B19",
  panelBot: "#08050C",
  plum: "#241438", // raised surfaces inside panels
  plumLine: "rgba(196,181,253,0.16)",
  purple: "#7C4DDE", // logo purple
  violet: "#8B5CF6", // accent
  lavender: "#A78BFA",
  lilac: "#C4B5FD",
  mist: "#DDD6FE",
  white: "#FFFFFF",
  dim: "rgba(221,214,254,0.66)",
  faint: "rgba(221,214,254,0.38)",
} as const;

// Headline tones used word-by-word, like the site's hero ("We don't just talk AI…")
export const TONES = [B.white, B.mist, B.lilac, B.lavender, B.violet] as const;

export const VW = 1080;
export const VH = 1920;
