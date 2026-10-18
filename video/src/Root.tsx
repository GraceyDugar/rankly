import React from "react";
import { Composition } from "remotion";
import { HOW_FRAMES, HowItWorks } from "./HowItWorks";
import { Intro, INTRO_FRAMES } from "./Intro";
import { Launch, LAUNCH_FRAMES } from "./Launch";
import { FPS } from "./theme";

export const Root: React.FC = () => (
  <>
    <Composition id="Intro" component={Intro} durationInFrames={INTRO_FRAMES} fps={FPS} width={1920} height={1080} defaultProps={{ music: undefined as string | undefined }} />
    <Composition id="Launch" component={Launch} durationInFrames={LAUNCH_FRAMES} fps={FPS} width={1920} height={1080} defaultProps={{ music: "music/launch-track.m4a" as string | undefined }} />
    <Composition id="LaunchReel" component={Launch} durationInFrames={LAUNCH_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{ music: "music/launch-track.m4a" as string | undefined, vertical: true }} />
    <Composition id="HowItWorks" component={HowItWorks} durationInFrames={HOW_FRAMES} fps={FPS} width={1920} height={1080} />
  </>
);
