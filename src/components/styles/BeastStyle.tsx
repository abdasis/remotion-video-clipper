import React from "react";
import { spring, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SubtitlePhrase } from "../../types";
import { theme } from "../../theme";

interface Props {
  phrase: SubtitlePhrase;
}

const BEAST_COLORS = ["#FFE500", "#39FF14", "#00D8FF", "#FF3366", "#FF9900"];

export const BeastStyle: React.FC<Props> = ({ phrase }) => {
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
        const colorIndex = idx % BEAST_COLORS.length;
        const activeColor = BEAST_COLORS[colorIndex];

        // Snappy bouncy entrance
        const entrance = spring({
          frame: frame - word.startFrame,
          fps,
          config: theme.spring.bouncy,
        });

        const activeBounce = spring({
          frame: frame - word.startFrame,
          fps,
          config: theme.spring.pop,
        });

        const translateY = interpolate(entrance, [0, 1], [36, 0]);
        const baseScale = interpolate(entrance, [0, 1], [0.75, 1]);
        const scale = isActive ? baseScale * (1 + activeBounce * 0.22) : baseScale;
        const opacity = interpolate(entrance, [0, 0.3], [0, 1]);

        const color = isActive ? activeColor : theme.colors.white;

        if (!isVisible) {
          return null;
        }

        return (
          <span
            key={idx}
            style={{
              fontFamily: theme.fonts.bebasNeue,
              fontSize: "76px",
              letterSpacing: "3px",
              color,
              opacity,
              transform: `translateY(${translateY}px) scale(${scale})`,
              display: "inline-block",
              WebkitTextStroke: "6px #000000",
              paintOrder: "stroke fill",
              textShadow:
                "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 6px 0 #000, 0 14px 26px rgba(0,0,0,1)",
              filter: isActive
                ? `drop-shadow(0 0 20px ${activeColor}99)`
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
