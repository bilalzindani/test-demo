import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// All fonts are SIL Open Font License (via Fontsource).
// loadFont() blocks rendering (delayRender) until each face is ready.
let started = false;

export const loadAllFonts = () => {
  if (started) return;
  started = true;
  loadFont({
    family: "Archivo",
    url: staticFile("fonts/archivo-wdth.woff2"),
    weight: "100 900",
    stretch: "62% 125%",
  });
  loadFont({
    family: "Instrument Serif",
    url: staticFile("fonts/instrument-serif-italic.woff2"),
    style: "italic",
    weight: "400",
  });
  loadFont({
    family: "Instrument Serif",
    url: staticFile("fonts/instrument-serif-regular.woff2"),
    style: "normal",
    weight: "400",
  });
  loadFont({
    family: "JetBrains Mono",
    url: staticFile("fonts/jetbrains-mono.woff2"),
    weight: "100 800",
  });
  loadFont({
    family: "Inter",
    url: staticFile("fonts/inter.woff2"),
    weight: "100 900",
  });
};
