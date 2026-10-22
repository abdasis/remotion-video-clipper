import cv2
import json
import numpy as np
from typing import List, Dict, Any

def track_faces(video_path: str, out_json_path: str, sample_interval: int = 4, alpha: float = 0.08) -> Dict[str, Any]:
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise RuntimeError(f"Gagal membuka video {video_path}")

    cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    face_cascade = cv2.CascadeClassifier(cascade_path)

    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    raw_cx = [None] * total_frames
    raw_cy = [None] * total_frames
    frame_idx = 0
    last_known_cx = 0.5
    last_known_cy = 0.40

    while cap.isOpened() and frame_idx < total_frames:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_idx % sample_interval == 0:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.15,
                minNeighbors=5,
                minSize=(int(height * 0.12), int(height * 0.12))
            )
            if len(faces) > 0:
                largest = max(faces, key=lambda b: b[2] * b[3])
                fx, fy, fw, fh = largest
                cx = (fx + fw / 2.0) / width
                cy = (fy + fh / 2.0) / height
                raw_cx[frame_idx] = float(cx)
                raw_cy[frame_idx] = float(cy)
                last_known_cx = float(cx)
                last_known_cy = float(cy)
            else:
                raw_cx[frame_idx] = last_known_cx
                raw_cy[frame_idx] = last_known_cy

        frame_idx += 1

    cap.release()
    actual_frames = frame_idx

    def interpolate_and_smooth(raw_arr, default_val):
        interpolated = []
        prev_idx = 0
        prev_val = raw_arr[0] if raw_arr[0] is not None else default_val

        for i in range(actual_frames):
            if raw_arr[i] is not None:
                cur_val = raw_arr[i]
                gap = i - prev_idx
                for k in range(gap):
                    ratio = k / gap if gap > 0 else 0
                    val = prev_val + ratio * (cur_val - prev_val)
                    interpolated.append(val)
                prev_idx = i
                prev_val = cur_val

        while len(interpolated) < actual_frames:
            interpolated.append(prev_val)

        smoothed = []
        cur_smooth = interpolated[0] if interpolated else default_val
        for val in interpolated:
            cur_smooth = alpha * val + (1.0 - alpha) * cur_smooth
            smoothed.append(round(float(cur_smooth), 4))
        return smoothed

    smooth_x = interpolate_and_smooth(raw_cx, 0.5)
    smooth_y = interpolate_and_smooth(raw_cy, 0.40)

    result_data = {
        "width": width,
        "height": height,
        "fps": round(fps, 2),
        "total_frames": actual_frames,
        "trackingX": smooth_x,
        "trackingY": smooth_y
    }

    with open(out_json_path, "w", encoding="utf-8") as f:
        json.dump(result_data, f, indent=2)

    return result_data
