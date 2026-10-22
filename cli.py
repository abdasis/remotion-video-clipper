#!/usr/bin/env python3
"""
Remotion Video Clipper
Auto Best Moment + Auto Face Tracking (9:16) + Multi-Style Animated Subtitles
"""

import argparse
import json
import os
import random
import subprocess
import sys
from pathlib import Path

from pipeline.best_moment import find_best_moments, extract_video_id, fetch_snippets
from pipeline.downloader import download_segment
from pipeline.face_tracker import track_faces
from pipeline.subtitle_builder import build_subtitles

ROOT_DIR = Path(__file__).resolve().parent
PUBLIC_DIR = ROOT_DIR / "public"
OUT_DIR = ROOT_DIR / "out"

AVAILABLE_STYLES = ["hormozi", "captions", "gadzhi", "beast", "neon"]

def run_cmd(cmd, cwd=None):
    res = subprocess.run(cmd, cwd=cwd or str(ROOT_DIR), capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Error executing command: {' '.join(cmd)}", file=sys.stderr)
        print(res.stderr, file=sys.stderr)
        raise RuntimeError(res.stderr)
    return res.stdout

def main():
    parser = argparse.ArgumentParser(
        description="Auto Video Clipper for YouTube Shorts / TikTok / Reels with Face Tracking & Animated Subtitles"
    )
    parser.add_argument("url", help="YouTube video URL or Video ID")
    parser.add_argument("--style", choices=AVAILABLE_STYLES + ["auto"], default="auto",
                        help="Subtitle animation style (default: auto)")
    parser.add_argument("--start", type=float, default=None, help="Clip start in seconds (optional)")
    parser.add_argument("--end", type=float, default=None, help="Clip end in seconds (optional)")
    parser.add_argument("--top-n", type=int, default=5, help="Number of candidate moments to scan (default: 5)")
    parser.add_argument("--select-moment", type=int, default=1, help="Moment index to use (1-based, default: 1)")
    parser.add_argument("--still-frames", type=str, default="30,90,150,300",
                        help="Comma-separated frame numbers to render as still previews (default: 30,90,150,300)")
    parser.add_argument("--reuse-clip", action="store_true", help="Reuse existing public/clip.mp4 if present")
    parser.add_argument("--render", action="store_true", help="Render full MP4 video output")
    parser.add_argument("--output-name", type=str, default="short_clip", help="Output file basename")

    args = parser.parse_args()

    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    # 1. Best Moment Detection
    video_id = extract_video_id(args.url)
    print(f"\n==================================================")
    print(f"[1/5] Menganalisis Video: {video_id}")
    print(f"==================================================")

    snippets = fetch_snippets(video_id, languages=["id", "id-orig", "en"])
    print(f"✓ Berhasil memuat {len(snippets)} baris transcript")

    if args.start is not None and args.end is not None:
        clip_start = args.start
        clip_end = args.end
        print(f"✓ Menggunakan waktu manual: {clip_start:.2f}s - {clip_end:.2f}s (Durasi: {clip_end - clip_start:.2f}s)")
    else:
        print("\nMemindai momen terbaik (hook, emosi, pacing)...")
        moments = find_best_moments(video_id, top_n=args.top_n)
        if not moments:
            raise RuntimeError("Tidak ditemukan momen dengan skor yang cukup")

        print(f"\nTop {len(moments)} Best Moments Ditemukan:")
        for idx, m in enumerate(moments, start=1):
            marker = " -> [DIPILIH]" if idx == args.select_moment else ""
            print(f"  #{idx} [Skor {m['score']:.1f}] {m['start']}s - {m['end']}s ({m['duration']}s){marker}")
            print(f"      \"{m['text']}\"\n")

        selected = moments[args.select_moment - 1]
        clip_start = selected["start"]
        clip_end = selected["end"]

    # 2. Download Segment
    print(f"==================================================")
    print(f"[2/5] Menyiapkan Segmen Video ({clip_start:.2f}s - {clip_end:.2f}s)...")
    print(f"==================================================")
    clip_mp4_path = str(PUBLIC_DIR / "clip.mp4")
    if args.reuse_clip and os.path.exists(clip_mp4_path) and os.path.getsize(clip_mp4_path) > 100000:
        print(f"✓ Menggunakan klip yang sudah ada di: {clip_mp4_path}")
        # inspect probe info
        cmd_probe = [
            "ffprobe", "-v", "error",
            "-select_streams", "v:0",
            "-show_entries", "stream=width,height,duration,r_frame_rate",
            "-of", "json", clip_mp4_path
        ]
        res_probe = subprocess.run(cmd_probe, capture_output=True, text=True)
        info = json.loads(res_probe.stdout).get("streams", [{}])[0]
        fps_str = info.get("r_frame_rate", "30/1")
        fps = round(eval(fps_str), 2) if "/" in fps_str else float(fps_str)
        dur = float(info.get("duration", clip_end - clip_start))
        media_info = {
            "path": clip_mp4_path,
            "width": int(info.get("width", 1280)),
            "height": int(info.get("height", 720)),
            "fps": fps,
            "duration": dur,
            "totalFrames": int(round(dur * fps)),
            "total_frames": int(round(dur * fps))
        }
    else:
        media_info = download_segment(args.url, clip_start, clip_end, clip_mp4_path)
    print(f"✓ Video: {media_info['width']}x{media_info['height']} @ {media_info['fps']} fps ({media_info['total_frames']} frames)")

    # 3. Auto Face Tracking
    print(f"\n==================================================")
    print(f"[3/5] Melacak Wajah (Auto Face Tracking 9:16)...")
    print(f"==================================================")
    tracking_json_path = str(PUBLIC_DIR / "tracking.json")
    tracking_data = track_faces(clip_mp4_path, tracking_json_path, sample_interval=4, alpha=0.09)
    print(f"✓ Face tracking selesai. Tersimpan di: {tracking_json_path}")
    print(f"✓ {len(tracking_data['trackingX'])} frame tersinkronisasi dan di-smooth")

    # 4. Generate Animated Subtitles
    print(f"\n==================================================")
    print(f"[4/5] Membangun Subtitle Bertempo Kata...")
    print(f"==================================================")
    subtitles_json_path = str(PUBLIC_DIR / "subtitles.json")
    subtitles_data = build_subtitles(
        snippets=snippets,
        clip_start=clip_start,
        clip_end=clip_end,
        fps=media_info["fps"],
        out_json_path=subtitles_json_path
    )
    print(f"✓ Subtitle selesai: {len(subtitles_data['phrases'])} frase tersimpan di {subtitles_json_path}")

    # Determine Style
    chosen_style = args.style
    if chosen_style == "auto":
        chosen_style = random.choice(AVAILABLE_STYLES)
    print(f"✓ Style Subtitle yang dipilih: [{chosen_style.upper()}] (pilihan: {', '.join(AVAILABLE_STYLES)})")

    # Save Props for Remotion
    props = {
        "videoSrc": "clip.mp4",
        "subtitleStyle": chosen_style,
        "trackingData": tracking_data,
        "subtitlesData": subtitles_data,
        "enableVignette": True,
        "enableProgressBar": True,
    }
    props_json_path = str(PUBLIC_DIR / "props.json")
    with open(props_json_path, "w", encoding="utf-8") as f:
        json.dump(props, f, indent=2)

    # 5. Render Stills or Full Video
    print(f"\n==================================================")
    print(f"[5/5] Render Pratinjau (Still Frames 1080x1920)...")
    print(f"==================================================")

    frames_to_render = [int(f.strip()) for f in args.still_frames.split(",") if f.strip().isdigit()]
    # Clamp frames within video total frames
    max_frame = max(media_info["total_frames"] - 1, 1)
    frames_to_render = [min(f, max_frame) for f in frames_to_render]

    print("Membuat bundle Remotion teroptimasi...")
    run_cmd(["bun", "x", "remotion", "bundle", "src/index.ts"])

    stills_output = []
    for f in frames_to_render:
        still_filename = f"{args.output_name}_f{f}.png"
        still_path = str(OUT_DIR / still_filename)
        cmd_still = [
            "bun", "x", "remotion", "still",
            "build", "ShortVideo",
            still_path,
            f"--frame={f}",
            f"--props={props_json_path}",
            "--overwrite"
        ]
        print(f"Rendering still frame {f} -> {still_filename}...")
        run_cmd(cmd_still)
        stills_output.append(still_path)
        print(f"  ✓ Berhasil: {still_path}")

    if args.render:
        video_filename = f"{args.output_name}_{chosen_style}.mp4"
        video_path = str(OUT_DIR / video_filename)
        print(f"\nRendering FULL video output: {video_filename}...")
        cmd_render = [
            "bun", "x", "remotion", "render",
            "src/index.ts", "ShortVideo",
            video_path,
            f"--props={props_json_path}",
            "--codec=h264",
            "--crf=18",
            "--overwrite"
        ]
        run_cmd(cmd_render)
        print(f"  ✓ Video selesai: {video_path}")

    print(f"\n==================================================")
    print(f"PROSES SELESAI!")
    print(f"Pilihan style: {chosen_style}")
    print(f"Still frames tersimpan di: {OUT_DIR}")
    for s in stills_output:
        print(f"  - {s}")
    print(f"==================================================")

if __name__ == "__main__":
    main()
