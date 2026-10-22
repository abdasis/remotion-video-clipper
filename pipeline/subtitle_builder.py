import re
import json
from typing import List, Dict, Any
from .best_moment import HOOK_KEYWORDS

def build_subtitles(
    snippets: List[Any],
    clip_start: float,
    clip_end: float,
    fps: float,
    out_json_path: str
) -> Dict[str, Any]:
    # Filter snippets intersecting with clip range
    clip_snippets = []
    for s in snippets:
        s_start = s.start if hasattr(s, 'start') else s['start']
        s_dur = s.duration if hasattr(s, 'duration') else s['duration']
        s_end = s_start + s_dur

        if s_end > clip_start and s_start < clip_end:
            clip_snippets.append({
                "start": max(s_start, clip_start),
                "end": min(s_end, clip_end),
                "duration": s_dur,
                "text": s.text if hasattr(s, 'text') else s['text']
            })

    # Sort snippets by start time
    clip_snippets.sort(key=lambda x: x['start'])

    # Build monotonic phrases
    phrases: List[Dict[str, Any]] = []

    for i, s in enumerate(clip_snippets):
        raw_text = s['text']
        cleaned = re.sub(r'\[.*?\]', '', raw_text).strip()
        if not cleaned:
            continue

        raw_words = cleaned.split()
        if not raw_words:
            continue

        # Effective time from current snippet start to next snippet start
        p_start_sec = s['start'] - clip_start
        if i + 1 < len(clip_snippets):
            next_start = clip_snippets[i + 1]['start'] - clip_start
            p_end_sec = max(next_start, p_start_sec + 0.6)
        else:
            p_end_sec = (s['end'] - clip_start)

        # Enforce minimum duration per word
        phrase_dur = max(p_end_sec - p_start_sec, 0.25 * len(raw_words))
        word_dur = phrase_dur / len(raw_words)

        phrase_words = []
        for w_idx, w in enumerate(raw_words):
            w_start_sec = p_start_sec + w_idx * word_dur
            w_end_sec = w_start_sec + word_dur
            clean_w_lower = re.sub(r'[^\w]', '', w.lower())
            is_highlight = clean_w_lower in HOOK_KEYWORDS or len(w) > 7 or w.isupper()

            phrase_words.append({
                "text": w,
                "startSec": round(w_start_sec, 3),
                "endSec": round(w_end_sec, 3),
                "startFrame": int(round(w_start_sec * fps)),
                "endFrame": int(round(w_end_sec * fps)),
                "isHighlight": is_highlight
            })

        start_f = phrase_words[0]["startFrame"]
        end_f = phrase_words[-1]["endFrame"] + 4 # tiny hold before transition

        phrases.append({
            "startFrame": start_f,
            "endFrame": end_f,
            "text": cleaned,
            "words": phrase_words
        })

    clip_duration = clip_end - clip_start
    data = {
        "fps": round(fps, 2),
        "clipStart": round(clip_start, 2),
        "clipEnd": round(clip_end, 2),
        "duration": round(clip_duration, 2),
        "totalFrames": int(round(clip_duration * fps)),
        "phrases": phrases
    }

    with open(out_json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    return data
