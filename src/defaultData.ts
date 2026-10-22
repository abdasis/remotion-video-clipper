import { TrackingData, SubtitlesData, ShortVideoProps } from "./types";

export const defaultTracking: TrackingData = {
  width: 1280,
  height: 720,
  fps: 30,
  totalFrames: 900,
  trackingX: new Array(900).fill(0.5),
  trackingY: new Array(900).fill(0.40),
};

export const defaultSubtitles: SubtitlesData = {
  fps: 30,
  clipStart: 0,
  clipEnd: 30,
  duration: 30,
  totalFrames: 900,
  phrases: [
    {
      startFrame: 15,
      endFrame: 75,
      text: "Selamat Datang di Remotion Clipper",
      words: [
        { text: "Selamat", startSec: 0.5, endSec: 1.0, startFrame: 15, endFrame: 30 },
        { text: "Datang", startSec: 1.0, endSec: 1.5, startFrame: 30, endFrame: 45 },
        { text: "di", startSec: 1.5, endSec: 1.8, startFrame: 45, endFrame: 54 },
        { text: "Remotion", startSec: 1.8, endSec: 2.2, startFrame: 54, endFrame: 66, isHighlight: true },
        { text: "Clipper", startSec: 2.2, endSec: 2.5, startFrame: 66, endFrame: 75, isHighlight: true },
      ],
    },
  ],
};

export const defaultShortVideoProps: ShortVideoProps = {
  videoSrc: "clip.mp4",
  subtitleStyle: "hormozi",
  trackingData: defaultTracking,
  subtitlesData: defaultSubtitles,
  enableVignette: true,
  enableProgressBar: true,
};
