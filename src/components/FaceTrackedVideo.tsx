import React from "react";
import { OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { TrackingData } from "../types";

interface Props {
  videoSrc: string;
  trackingData: TrackingData;
}

export const FaceTrackedVideo: React.FC<Props> = ({ videoSrc, trackingData }) => {
  const frame = useCurrentFrame();

  const srcWidth = trackingData?.width || 1280;
  const srcHeight = trackingData?.height || 720;
  const trackingX = trackingData?.trackingX || [];
  const trackingY = trackingData?.trackingY || [];

  const faceX = trackingX[frame] !== undefined ? trackingX[frame] : 0.5;
  const faceY = trackingY[frame] !== undefined ? trackingY[frame] : 0.40;

  // 1080x1920 Canvas
  const canvasW = 1080;
  const canvasH = 1920;

  // Cinematic mobile zoom (1.18x) eliminates excess ceiling headroom
  const zoom = 1.18;
  const scale = (canvasH / srcHeight) * zoom;
  const scaledWidth = srcWidth * scale;
  const scaledHeight = srcHeight * scale;

  // Lock eye level / face center to upper third (approx 620px from top)
  const desiredFaceCanvasY = 620;
  const targetY = desiredFaceCanvasY - faceY * scaledHeight;
  const minY = canvasH - scaledHeight;
  const maxY = 0;
  const clampedY = Math.max(minY, Math.min(maxY, targetY));

  // Horizontal face centering
  const targetX = canvasW / 2 - faceX * scaledWidth;
  const minX = canvasW - scaledWidth;
  const maxX = 0;
  const clampedX = Math.max(minX, Math.min(maxX, targetX));

  return (
    <div
      style={{
        position: "absolute",
        width: canvasW,
        height: canvasH,
        overflow: "hidden",
        backgroundColor: "#000000",
      }}
    >
      {/* Background Layer: Deep blur + darkened backdrop */}
      <div
        style={{
          position: "absolute",
          width: canvasW,
          height: canvasH,
          overflow: "hidden",
          transform: "scale(1.1)",
          filter: "blur(32px) brightness(0.35)",
        }}
      >
        <OffthreadVideo
          src={staticFile(videoSrc)}
          muted
          style={{
            position: "absolute",
            width: scaledWidth,
            height: scaledHeight,
            left: (canvasW - scaledWidth) / 2,
            top: (canvasH - scaledHeight) / 2,
            objectFit: "cover",
          }}
        />
      </div>

      {/* Foreground Layer: Precision face-centered pan & optimal eye line */}
      <div
        style={{
          position: "absolute",
          width: canvasW,
          height: canvasH,
          overflow: "hidden",
        }}
      >
        <OffthreadVideo
          src={staticFile(videoSrc)}
          style={{
            position: "absolute",
            width: scaledWidth,
            height: scaledHeight,
            left: clampedX,
            top: clampedY,
          }}
        />
      </div>
    </div>
  );
};
