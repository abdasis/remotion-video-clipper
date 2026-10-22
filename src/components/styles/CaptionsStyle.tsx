import React from "react";
import { spring, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SubtitlePhrase } from "../../types";
import { theme } from "../../theme";

interface Props {
  phrase: SubtitlePhrase;
}

export const CaptionsStyle: React.FC<Props> = ({ phrase }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        columnGap: "16px",
        rowGap: "10px",
        maxWidth: "920px",
        padding: "0 20px",
        textAlign: "center",
      }}
    >
      {phrase.words.map((word, idx) => {
        const isVisible = frame >= word.startFrame;
        const isActive = frame >= word.startFrame && frame <= word.endFrame;

        // Smooth fluid spring
        const entrance = spring({
          frame: frame - word.startFrame,
          fps,
          config: theme.spring.smooth,
        });

        const activeBounce = spring({
          frame: frame - word.startFrame,
          fps,
          config: theme.spring.snappy,
        });

        const translateY = interpolate(entrance, [0, 1], [24, 0]);
        const baseScale = interpolate(entrance, [0, 1], [0.88, 1]);
        const scale = isActive ? baseScale * (1 + activeBounce * 0.14) : baseScale;
        const opacity = interpolate(entrance, [0, 0.4], [0, 1]);

        const color = isActive
          ? theme.colors.cyan // Vibrant cyan accent
          : theme.colors.white;

        if (!isVisible) {
          return null;
        }

        return (
          <span
            key={idx}
            style={{
              fontFamily: theme.fonts.outfit,
              fontSize: "54px",
              fontWeight: 900,
              color,
              opacity,
              transform: `translateY(${translateY}px) scale(${scale})`,
              display: "inline-block",
              letterSpacing: "-0.5px",
              WebkitTextStroke: "5px #000000",
              paintOrder: "stroke fill",
              textShadow:
                "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 6px 18px rgba(0,0,0,0.95)",
              filter: isActive
                ? "drop-shadow(0 0 16px rgba(0, 240, 255, 0.6))"
                : "none",
            }}
          >
            {word.text}
          </span>
        );
      })}
    </div>
  );
};
