import React from "react";
import { spring, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SubtitlePhrase } from "../../types";
import { theme } from "../../theme";

interface Props {
  phrase: SubtitlePhrase;
}

export const HormoziStyle: React.FC<Props> = ({ phrase }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        columnGap: "18px",
        rowGap: "10px",
        maxWidth: "940px",
        padding: "0 20px",
        textAlign: "center",
      }}
    >
      {phrase.words.map((word, idx) => {
        const isVisible = frame >= word.startFrame;
        const isActive = frame >= word.startFrame && frame <= word.endFrame;

        // Smooth spring entrance (fade + rise + scale)
        const entrance = spring({
          frame: frame - word.startFrame,
          fps,
          config: theme.spring.snappy,
        });

        // Kinetic pop pulse for active word
        const activePop = spring({
          frame: frame - word.startFrame,
          fps,
          config: theme.spring.pop,
        });

        const translateY = interpolate(entrance, [0, 1], [30, 0]);
        const baseScale = interpolate(entrance, [0, 1], [0.85, 1]);
        const scale = isActive ? baseScale * (1 + activePop * 0.16) : baseScale;
        const opacity = interpolate(entrance, [0, 0.4], [0, 1]);

        const color = isActive
          ? word.isHighlight
            ? theme.colors.lime
            : theme.colors.yellow
          : theme.colors.white;

        if (!isVisible) {
          return null;
        }

        return (
          <span
            key={idx}
            style={{
              fontFamily: theme.fonts.nexa,
              fontSize: "68px",
              textTransform: "uppercase",
              color,
              opacity,
              transform: `translateY(${translateY}px) scale(${scale})`,
              display: "inline-block",
              WebkitTextStroke: "6px #000000",
              paintOrder: "stroke fill",
              textShadow:
                "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 6px 18px rgba(0,0,0,0.95), 0 12px 30px rgba(0,0,0,0.85)",
              letterSpacing: "2px",
              filter: isActive
                ? "drop-shadow(0 0 18px rgba(255, 230, 0, 0.7))"
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
