// Sound-design cue sheet, derived from the same timings the picture uses.
// scripts/export-cues.mjs compiles this to audio/cues.json for the synth.
import { CHAOS, CHAT, FINALE, FLOW, HOOK, IND, LEADS, LOGO, SCENES, TOTAL, VALUE, VOICE, BPM, FPS } from "./timeline";

export type Cue = { f: number; type: string; dur?: number; i?: number; v?: number };

export const buildCues = () => {
  const cues: Cue[] = [];
  const at = (s: keyof typeof SCENES, local: number) => SCENES[s].from + local;
  const add = (c: Cue) => cues.push(c);

  // 00 — hook
  add({ f: at("hook", HOOK.dotIn), type: "pop", v: 0.7 });
  HOOK.pulses.forEach((p) => add({ f: at("hook", p), type: "tick" }));
  HOOK.rings.forEach((r) => add({ f: at("hook", r), type: "ring", dur: HOOK.ringDur }));
  add({ f: at("hook", HOOK.type), type: "typing", dur: "A customer is calling.".length });
  add({ f: at("hook", 90), type: "typing", dur: "No one picks up.".length });
  add({ f: at("hook", HOOK.missed), type: "missed" });
  add({ f: at("hook", HOOK.morph[0]), type: "swoosh", dur: 26 });

  // 00 — chaos
  CHAOS.spawns.forEach((s, i) => add({ f: at("chaos", s), type: "notif", i }));
  CHAOS.words.forEach((w, i) => add({ f: at("chaos", w), type: "hit", i }));
  CHAOS.glitches.forEach((g) => add({ f: at("chaos", g), type: "glitch" }));
  add({ f: at("chaos", CHAOS.implode[0]) - 10, type: "suck", dur: CHAOS.implode[1] - CHAOS.implode[0] + 10 });

  // ✦ — logo
  add({ f: at("logo", LOGO.drop), type: "drop" });
  LOGO.letters.forEach((l, i) => add({ f: at("logo", l), type: "thock", i }));
  add({ f: at("logo", LOGO.subtitle[0]), type: "scramble", dur: LOGO.subtitle[1] - LOGO.subtitle[0] });
  add({ f: at("logo", LOGO.zoom[0]), type: "dive", dur: LOGO.zoom[1] - LOGO.zoom[0] });

  // 01 — voice
  add({ f: at("voice", 0), type: "assemble", dur: 24 });
  VOICE.lines.forEach((l) => add({ f: at("voice", l.start), type: l.who === "agent" ? "voiceAgent" : "voiceCaller", dur: l.end - l.start }));
  add({ f: at("voice", VOICE.booked), type: "success" });
  add({ f: at("voice", VOICE.whipOut[0]), type: "whip", dur: VOICE.whipOut[1] - VOICE.whipOut[0] });

  // 02 — leads
  LEADS.leads.forEach((l) => {
    const arrive = l.start + LEADS.travelIn;
    add({ f: at("leads", arrive), type: "score", i: l.lane });
    add({ f: at("leads", arrive + LEADS.hold + LEADS.travelOut), type: "land", i: l.lane });
  });
  add({ f: at("leads", LEADS.stripes[0]), type: "stripes", dur: LEADS.stripes[1] - LEADS.stripes[0] });

  // 03 — chat
  (["center", "left", "right"] as const).forEach((k, pi) =>
    CHAT[k].forEach((ev) => {
      if ("who" in ev) add({ f: at("chat", ev.t), type: ev.who === "user" ? "bubbleUser" : "bubbleBot", i: pi });
      if ("chips" in ev) ev.chips.forEach((_, ci) => add({ f: at("chat", ev.t + ci * 4), type: "chip", i: ci }));
    }),
  );
  add({ f: at("chat", CHAT.zoom[0]), type: "dive", dur: CHAT.zoom[1] - CHAT.zoom[0] });

  // 04 — workflow
  Object.values(FLOW.activate)
    .sort((a, b) => a - b)
    .forEach((t, i) => add({ f: at("workflow", t), type: "node", i }));
  add({ f: at("workflow", 136), type: "swoosh", dur: 40 });

  // 05 — industries
  IND.land.forEach((l, i) => add({ f: at("industries", l), type: "slam", i }));
  IND.beats.forEach((b, i) => add({ f: at("industries", b), type: "tick", i }));
  IND.flip.forEach((fl, i) => add({ f: at("industries", fl), type: "flip", i }));

  // 06 — value
  VALUE.cards.forEach((c, i) => add({ f: at("value", c), type: "hit", i: 10 + i }));
  add({ f: at("value", VALUE.cards[1]), type: "clockspin", dur: 26 });

  // 07 — finale
  add({ f: at("finale", FINALE.line1), type: "hit", i: 20 });
  add({ f: at("finale", FINALE.line2), type: "hit", i: 21 });
  add({ f: at("finale", FINALE.collapse[0]) - 4, type: "suck", dur: FINALE.collapse[1] - FINALE.collapse[0] + 4 });
  add({ f: at("finale", FINALE.logo), type: "drop", i: 1 });
  add({ f: at("finale", FINALE.url[0]), type: "typing", dur: FINALE.url[1] - FINALE.url[0] });
  add({ f: at("finale", FINALE.cta), type: "pop", v: 0.9 });
  add({ f: at("finale", FINALE.click), type: "click" });
  add({ f: at("finale", FINALE.outro[1] + 1), type: "tick", v: 0.8 });

  cues.sort((a, b) => a.f - b.f);
  return { fps: FPS, bpm: BPM, totalFrames: TOTAL, scenes: SCENES, cues };
};
