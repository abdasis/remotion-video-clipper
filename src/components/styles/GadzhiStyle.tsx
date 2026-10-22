import React from "react";
import { spring, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SubtitlePhrase } from "../../types";
import { theme } from "../../theme";

interface Props {
  phrase: SubtitlePhrase;
}

export const GadzhiStyle: React.FC<Props> = ({ phrase }) => {
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

        const entrance = spring({
          frame: frame - word.startFrame,
          fps,
          config: theme.spring.smooth,
        });

        const translateY = interpolate(entrance, [0, 1], [22, 0]);
        const opacity = interpolate(entrance, [0, 0.4], [0, 1]);

        const color = isActive
          ? theme.colors.gold // Warm Luxury Gold
          : theme.colors.white;

        if (!isVisible) {
          return null;
        }

        return (
          <span
            key={idx}
            style={{
              fontFamily: theme.fonts.syne,
              fontSize: "52px",
              fontWeight: 800,
              color,
              opacity,
              transform: `translateY(${translateY}px)`,
              letterSpacing: "1px",
              display: "inline-block",
              WebkitTextStroke: "5px #000000",
              paintOrder: "stroke fill",
              textShadow:
                "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 6px 18px rgba(0,0,0,0.95)",
              filter: isActive
                ? "drop-shadow(0 0 16px rgba(245, 197, 24, 0.55))"
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
