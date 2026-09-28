import React from "react";
import { Composition } from "remotion";
import { Showreel } from "./Showreel";
import { loadAllFonts } from "./lib/fonts";
import { FPS, TOTAL } from "./lib/timeline";

loadAllFonts();

export const RemotionRoot: React.FC = () => (
  <Composition
    id="NoshShowreel"
    component={Showreel}
    durationInFrames={TOTAL}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
