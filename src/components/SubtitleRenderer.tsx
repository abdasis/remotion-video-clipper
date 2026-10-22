import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { SubtitlesData, SubtitleStyleType } from "../types";
import { HormoziStyle } from "./styles/HormoziStyle";
import { CaptionsStyle } from "./styles/CaptionsStyle";
import { GadzhiStyle } from "./styles/GadzhiStyle";
import { BeastStyle } from "./styles/BeastStyle";
import { NeonStyle } from "./styles/NeonStyle";
import { theme } from "../theme";

interface Props {
  subtitlesData: SubtitlesData;
  styleType: SubtitleStyleType;
}

export const SubtitleRenderer: React.FC<Props> = ({ subtitlesData, styleType }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!subtitlesData || !subtitlesData.phrases) {
    return null;
  }

  // Find active phrase
  const activePhrase = subtitlesData.phrases.find(
    (p) => frame >= p.startFrame && frame <= p.endFrame
  );

  if (!activePhrase) {
    return null;
  }

  // Smooth phrase-level exit animation (faster than entrance)
  const exitFrames = 8;
  const isExiting = frame >= activePhrase.endFrame - exitFrames;
  const exitProgress = isExiting
    ? interpolate(
        frame,
        [activePhrase.endFrame - exitFrames, activePhrase.endFrame],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      )
    : 0;

  const exitY = interpolate(exitProgress, [0, 1], [0, -28]);
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);
  const exitScale = interpolate(exitProgress, [0, 1], [1, 0.94]);

  const renderStyle = () => {
    switch (styleType) {
      case "captions":
        return <CaptionsStyle phrase={activePhrase} />;
      case "gadzhi":
        return <GadzhiStyle phrase={activePhrase} />;
      case "beast":
        return <BeastStyle phrase={activePhrase} />;
      case "neon":
        return <NeonStyle phrase={activePhrase} />;
      case "hormozi":
      default:
        return <HormoziStyle phrase={activePhrase} />;
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: "410px", // Safe zone for TikTok, IG Reels, and YouTube Shorts UI
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "none",
        zIndex: 40,
        transform: `translateY(${exitY}px) scale(${exitScale})`,
        opacity: exitOpacity,
      }}
    >
      {/* NO CARD / BOX CONTAINER - Pure floating motion text */}
      {renderStyle()}
    </div>
  );
};
