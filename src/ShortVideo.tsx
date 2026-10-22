import React from "react";
import { AbsoluteFill } from "remotion";
import { ShortVideoProps } from "./types";
import { FaceTrackedVideo } from "./components/FaceTrackedVideo";
import { SubtitleRenderer } from "./components/SubtitleRenderer";
import { Overlays } from "./components/Overlays";

export const ShortVideo: React.FC<ShortVideoProps> = ({
  videoSrc,
  subtitleStyle,
  trackingData,
  subtitlesData,
  enableVignette = true,
  enableProgressBar = true,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      <FaceTrackedVideo videoSrc={videoSrc} trackingData={trackingData} />
      <Overlays
        enableVignette={enableVignette}
        enableProgressBar={enableProgressBar}
      />
      <SubtitleRenderer
        subtitlesData={subtitlesData}
        styleType={subtitleStyle}
      />
    </AbsoluteFill>
  );
};
