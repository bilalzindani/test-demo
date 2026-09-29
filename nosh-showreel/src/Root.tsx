import React from "react";
import { Composition } from "remotion";
import { Showreel } from "./Showreel";
import { loadAllFonts } from "./lib/fonts";
import { FPS, TOTAL } from "./lib/timeline";
import { ShotsTest } from "./vertical/ShotsTest";
import { NoshVertical } from "./vertical/NoshVertical";
import { V_FPS, V_TOTAL } from "./vertical/timeline";

loadAllFonts();

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="NoshShowreel" component={Showreel} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />
    <Composition id="NoshVideoEditingVertical" component={NoshVertical} durationInFrames={V_TOTAL} fps={V_FPS} width={1080} height={1920} />
    <Composition id="ShotsTest" component={ShotsTest} durationInFrames={300} fps={30} width={1920} height={720} />
  </>
);
