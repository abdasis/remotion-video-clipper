import React from "react";
import { Composition } from "remotion";
import { ShortVideo } from "./ShortVideo";
import { defaultShortVideoProps } from "./defaultData";
import { ShortVideoProps } from "./types";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition<ShortVideoProps>
      id="ShortVideo"
      component={ShortVideo}
      durationInFrames={900}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={defaultShortVideoProps}
      calculateMetadata={async ({ props }) => {
        const frames =
          props?.subtitlesData?.totalFrames ||
          props?.trackingData?.totalFrames ||
          900;
        return {
          durationInFrames: Math.max(frames, 30),
          fps: Math.round(props?.subtitlesData?.fps || 30),
        };
      }}
    />
  );
};
