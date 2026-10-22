import React from "react";
import { spring, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SubtitlePhrase } from "../../types";
import { theme } from "../../theme";

interface Props {
  phrase: SubtitlePhrase;
}

export const NeonStyle: React.FC<Props> = ({ phrase }) => {
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
          config: theme.spring.snappy,
        });

        const activePulse = spring({
          frame: frame - word.startFrame,
          fps,
          config: theme.spring.pop,
        });

        const translateY = interpolate(entrance, [0, 1], [28, 0]);
        const baseScale = interpolate(entrance, [0, 1], [0.85, 1]);
        const scale = isActive ? baseScale * (1 + activePulse * 0.16) : baseScale;
        const opacity = interpolate(entrance, [0, 0.4], [0, 1]);

        const color = isActive
          ? word.isHighlight
            ? theme.colors.magenta
            : theme.colors.cyan
          : "rgba(240, 248, 255, 0.95)";

        const glow = isActive
          ? word.isHighlight
            ? "0 0 16px #FF007F, 0 0 35px #FF007F, 0 0 60px #FF007F"
            : "0 0 16px #00F0FF, 0 0 35px #00F0FF, 0 0 60px #00F0FF"
          : "0 4px 14px rgba(0,0,0,0.9)";

        if (!isVisible) {
          return null;
        }

        return (
          <span
            key={idx}
            style={{
              fontFamily: theme.fonts.spaceGrotesk,
              fontSize: "58px",
              fontWeight: 800,
              textTransform: "uppercase",
              color,
              opacity,
              transform: `translateY(${translateY}px) scale(${scale})`,
              display: "inline-block",
              WebkitTextStroke: "5px #000000",
              paintOrder: "stroke fill",
              textShadow: `-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, ${glow}`,
              letterSpacing: "1.5px",
            }}
          >
            {word.text}
          </span>
        );
      })}
    </div>
  );
};
