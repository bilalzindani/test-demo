// Sound-design cue sheet for the vertical reel, derived from its timeline.
// scripts/export-cues.mjs compiles this to audio/vertical-cues.json.
import { AIV, BRANDV, EDITV, FILMV, FINV, HOOKV, UGCV, V_FINAL_HIT, V_FPS, V_HITS, V_TOTAL, VS } from "./timeline";

export type Cue = { f: number; type: string; dur?: number; i?: number; v?: number };

export const buildCues = () => {
  const cues: Cue[] = [];
  const at = (s: keyof typeof VS, local: number) => VS[s].from + local;
  const add = (c: Cue) => cues.push(c);

  // 00 — hook
  add({ f: 6, type: "tick", v: 0.9 });
  add({ f: at("hook", HOOKV.line1), type: "swish", dur: 10 });
  add({ f: at("hook", HOOKV.line2), type: "swish", dur: 10 });
  add({ f: at("hook", HOOKV.theyre), type: "scramble", dur: 14 });
  add({ f: at("hook", HOOKV.edited), type: "hit" });
  add({ f: at("hook", HOOKV.slice) - 3, type: "razor" });
  add({ f: at("hook", HOOKV.clapper[0]), type: "whoosh", dur: 16 });
  add({ f: at("hook", HOOKV.clapper[1]) - 1, type: "clap" });

  // ✦ — brand
  BRANDV.letters.forEach((l, i) => add({ f: at("brand", l), type: "thock", i }));
  add({ f: at("brand", BRANDV.sub[0]), type: "scramble", dur: 24 });
  add({ f: at("brand", BRANDV.whip[0]), type: "whip", dur: 15 });

  // 01 — editing
  add({ f: at("editing", EDITV.words[0]), type: "hit", v: 0.7 });
  EDITV.cuts.forEach((c) => {
    add({ f: at("editing", c), type: "snip" });
    add({ f: at("editing", c + 3), type: "swish", dur: 8, v: 0.5 });
  });
  add({ f: at("editing", 80), type: "swish", dur: 12, v: 0.6 });
  add({ f: at("editing", EDITV.playhead[0]), type: "tick" });
  add({ f: at("editing", EDITV.grade[0]), type: "sweep", dur: EDITV.grade[1] - EDITV.grade[0] });
  add({ f: at("editing", EDITV.words[2]), type: "thump" });
  for (let k = 0; k < 6; k++) add({ f: at("editing", EDITV.beatMarks + k * 9), type: "blip", i: k });
  [200, 214, 228].forEach((t, i) => add({ f: at("editing", t), type: "pop", i }));
  add({ f: at("editing", EDITV.words[3]), type: "whoosh", dur: 14 });
  for (let k = 0; k < 4; k++) add({ f: at("editing", EDITV.keyframes + 6 + k * 6), type: "blip", i: 6 + k });
  for (let k = 0; k < 7; k++) add({ f: at("editing", EDITV.chips + k * 3), type: "pop", i: 3 + k, v: 0.6 });
  add({ f: at("editing", EDITV.iris[0]), type: "iris", dur: EDITV.iris[1] - EDITV.iris[0] });

  // 02 — AI editing
  add({ f: at("aiEdit", 0), type: "shutter" });
  add({ f: at("aiEdit", AIV.headline), type: "swish", dur: 12 });
  for (let k = 0; k < 5; k++) add({ f: at("aiEdit", AIV.captions[0] + 6 + k * 11), type: "blip", i: k });
  add({ f: at("aiEdit", AIV.silence[0] + 2), type: "swish", dur: 12 });
  add({ f: at("aiEdit", AIV.silence[0] + 30), type: "zip", dur: 20 });
  add({ f: at("aiEdit", AIV.silence[0] + 48), type: "pop" });
  add({ f: at("aiEdit", AIV.reframe[0]), type: "whoosh", dur: 12 });
  add({ f: at("aiEdit", AIV.reframe[0] + 8), type: "beep" });
  add({ f: at("aiEdit", AIV.reframe[0] + 32), type: "swish", dur: 20 });
  add({ f: at("aiEdit", AIV.glitch[0]), type: "glitch" });

  // 03 — UGC
  add({ f: at("ugc", UGCV.headline), type: "hit", v: 0.6 });
  add({ f: at("ugc", UGCV.product), type: "pop" });
  [1, 2, 3].forEach((i) => add({ f: at("ugc", UGCV.grid[0] + 10 + i * 5), type: "swish", dur: 10, v: 0.6 }));
  add({ f: at("ugc", UGCV.winner), type: "success" });
  add({ f: at("ugc", UGCV.exit[0]), type: "whoosh", dur: 14 });

  // 04 — films
  add({ f: at("films", FILMV.typeStart), type: "typing", dur: Math.ceil(FILMV.prompt.length / 1.05) });
  add({ f: at("films", FILMV.generate), type: "click" });
  add({ f: at("films", FILMV.diffuse[0]), type: "riser", dur: FILMV.diffuse[1] - FILMV.diffuse[0] });
  add({ f: at("films", FILMV.diffuse[1]), type: "sparkle" });
  add({ f: at("films", FILMV.title[0]), type: "swell", dur: 24 });
  add({ f: at("films", FILMV.strip[0]), type: "projector", dur: 70 });

  // 05 — finale
  FINV.words.forEach((w, i) => add({ f: at("finale", w), type: "hit", v: 0.8, i }));
  add({ f: at("finale", FINV.collapse[0]) - 2, type: "suck", dur: FINV.collapse[1] - FINV.collapse[0] + 2 });
  add({ f: at("finale", FINV.lock), type: "drop" });
  add({ f: at("finale", FINV.sub[0]), type: "scramble", dur: 20 });
  add({ f: at("finale", FINV.cta), type: "pop", v: 0.9 });
  add({ f: at("finale", FINV.url[0]), type: "typing", dur: FINV.url[1] - FINV.url[0] });
  add({ f: at("finale", FINV.shimmer), type: "sparkle", v: 0.6 });
  add({ f: at("finale", FINV.outro[1] - 2), type: "tick", v: 0.8 });

  cues.sort((a, b) => a.f - b.f);
  return { fps: V_FPS, totalFrames: V_TOTAL, hits: V_HITS, finalHit: V_FINAL_HIT, scenes: VS, cues };
};
