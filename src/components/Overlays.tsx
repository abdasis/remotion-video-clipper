import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

interface Props {
  enableVignette?: boolean;
  enableProgressBar?: boolean;
}

export const Overlays: React.FC<Props> = ({
  enableVignette = true,
  enableProgressBar = true,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = Math.min(frame / (durationInFrames || 1), 1);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: 1080,
        height: 1920,
        pointerEvents: "none",
        zIndex: 30,
      }}
    >
      {/* Cinematic Vignette */}
      {enableVignette && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 48%, rgba(0,0,0,0.58) 100%)",
          }}
        />
      )}

      {/* Subtle lower-third cinematic contrast grade for cardless floating text */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "820px",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.42) 50%, rgba(0,0,0,0) 100%)",
        }}
      />

      {/* Progress Bar at Bottom */}
      {enableProgressBar && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "8px",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
          }}
        >
          <div
            style={{
              width: `${progress * 100}%`,
              height: "100%",
              backgroundColor: "#FFE600",
              boxShadow: "0 0 10px rgba(255, 230, 0, 0.8)",
            }}
          />
        </div>
      )}
    </div>
  );
};
