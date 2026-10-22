export type SubtitleStyleType = "hormozi" | "captions" | "gadzhi" | "beast" | "neon";

export interface SubtitleWord {
  text: string;
  startSec: number;
  endSec: number;
  startFrame: number;
  endFrame: number;
  isHighlight?: boolean;
}

export interface SubtitlePhrase {
  startFrame: number;
  endFrame: number;
  text: string;
  words: SubtitleWord[];
}

export interface SubtitlesData {
  fps: number;
  clipStart: number;
  clipEnd: number;
  duration: number;
  totalFrames: number;
  phrases: SubtitlePhrase[];
}

export interface TrackingData {
  width: number;
  height: number;
  fps: number;
  totalFrames: number;
  trackingX: number[];
  trackingY: number[];
}

export interface ShortVideoProps {
  videoSrc: string;
  subtitleStyle: SubtitleStyleType;
  trackingData: TrackingData;
  subtitlesData: SubtitlesData;
  enableVignette?: boolean;
  enableProgressBar?: boolean;
}
