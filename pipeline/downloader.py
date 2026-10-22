import subprocess
import json
import os
import glob
from typing import Dict, Any

def download_segment(url: str, start_sec: float, end_sec: float, out_path: str) -> Dict[str, Any]:
    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    temp_dir = "/tmp/clipper_temp"
    os.makedirs(temp_dir, exist_ok=True)
    
    # Clean previous temp files in temp_dir
    for old_file in glob.glob(f"{temp_dir}/*"):
        try:
            os.remove(old_file)
        except OSError:
            pass

    raw_template = f"{temp_dir}/segment.%(ext)s"
    section_arg = f"*{start_sec:.2f}-{end_sec:.2f}"
    
    cmd_dl = [
        "yt-dlp",
        "--download-sections", section_arg,
        "-f", "bestvideo[height<=720]+bestaudio/best[height<=720]/best",
        "--force-keyframes-at-cuts",
        "-o", raw_template,
        "--no-playlist",
        url
    ]
    
    proc = subprocess.run(cmd_dl, capture_output=True, text=True)
    if proc.returncode != 0:
        # Fallback to general best format if 1080 fails
        cmd_dl_fallback = [
            "yt-dlp",
            "--download-sections", section_arg,
            "-f", "best",
            "-o", raw_template,
            url
        ]
        proc = subprocess.run(cmd_dl_fallback, capture_output=True, text=True)
        if proc.returncode != 0:
            raise RuntimeError(f"yt-dlp gagal download video: {proc.stderr}")

    downloaded_files = [f for f in glob.glob(f"{temp_dir}/segment.*") if not f.endswith(".part")]
    if not downloaded_files:
        raise RuntimeError("File hasil unduhan yt-dlp tidak ditemukan di direktori sementara")
    raw_file = downloaded_files[0]

    # Standardize to clean H.264 / AAC MP4 for Remotion OffthreadVideo
    cmd_transcode = [
        "ffmpeg", "-v", "error", "-y",
        "-i", raw_file,
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
        "-c:a", "aac", "-b:a", "192k",
        "-pix_fmt", "yuv420p",
        out_path
    ]
    proc_tc = subprocess.run(cmd_transcode, capture_output=True, text=True)

    # Clean temp files
    for f in glob.glob(f"{temp_dir}/*"):
        try:
            os.remove(f)
        except OSError:
            pass

    if proc_tc.returncode != 0:
        raise RuntimeError(f"FFmpeg transcode gagal: {proc_tc.stderr}")

    # Inspect media info via ffprobe
    cmd_probe = [
        "ffprobe", "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "stream=width,height,duration,r_frame_rate,nb_frames",
        "-of", "json", out_path
    ]
    res_probe = subprocess.run(cmd_probe, capture_output=True, text=True)
    info = json.loads(res_probe.stdout).get("streams", [{}])[0]

    fps_str = info.get("r_frame_rate", "30/1")
    if "/" in fps_str:
        num, den = fps_str.split("/")
        fps = round(float(num) / float(den), 2)
    else:
        fps = float(fps_str)

    width = int(info.get("width", 1280))
    height = int(info.get("height", 720))
    duration = float(info.get("duration", end_sec - start_sec))

    return {
        "path": out_path,
        "width": width,
        "height": height,
        "fps": fps,
        "duration": duration,
        "total_frames": int(round(duration * fps))
    }
