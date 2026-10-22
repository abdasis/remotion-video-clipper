import re
from typing import List, Dict, Any, Tuple
from youtube_transcript_api import YouTubeTranscriptApi

HOOK_KEYWORDS = {
    # Indonesian
    'kenapa', 'mengapa', 'bagaimana', 'apakah', 'siapa', 'sadar', 'dunia',
    'tuhan', 'surga', 'neraka', 'adil', 'rahasia', 'hidup', 'mati', 'dosa',
    'makanya', 'justru', 'padahal', 'intinya', 'sebenarnya', 'ingat', 'sukses',
    'masalah', 'uang', 'amal', 'pahala', 'takut', 'hati', 'manusia', 'kunci',
    'bahaya', 'kesalahan', 'penting', 'fakta', 'mustahil', 'hukum', 'alasan',
    # English
    'why', 'how', 'what', 'secret', 'truth', 'mistake', 'never', 'always',
    'money', 'life', 'god', 'death', 'reality', 'remember', 'stop'
}

def extract_video_id(url_or_id: str) -> str:
    if 'v=' in url_or_id:
        return url_or_id.split('v=')[1].split('&')[0]
    elif 'youtu.be/' in url_or_id:
        return url_or_id.split('youtu.be/')[1].split('?')[0]
    return url_or_id.strip()

def fetch_snippets(video_id: str, languages: List[str] = None) -> List[Any]:
    if languages is None:
        languages = ['id', 'id-orig', 'en']
    try:
        api = YouTubeTranscriptApi()
        return api.fetch(video_id, languages=languages)
    except Exception:
        try:
            return YouTubeTranscriptApi.get_transcript(video_id, languages=languages)
        except Exception as e:
            raise RuntimeError(f"Gagal mengambil transcript untuk video {video_id}: {e}")

def score_window(snippets: List[Any], start_idx: int, end_idx: int) -> Tuple[float, str]:
    sub_snippets = snippets[start_idx:end_idx + 1]
    raw_texts = [s.text if hasattr(s, 'text') else s['text'] for s in sub_snippets]
    clean_texts = [re.sub(r'\[.*?\]', '', t).strip() for t in raw_texts]
    clean_texts = [t for t in clean_texts if t]
    
    full_text = ' '.join(clean_texts)
    words = full_text.lower().split()
    word_count = len(words)
    if word_count < 30:
        return 0.0, full_text

    t_start = sub_snippets[0].start if hasattr(sub_snippets[0], 'start') else sub_snippets[0]['start']
    last_s = sub_snippets[-1]
    t_end = (last_s.start + last_s.duration) if hasattr(last_s, 'start') else (last_s['start'] + last_s['duration'])
    dur = max(t_end - t_start, 1.0)

    # 1. Hook score (first 2-3 snippets or first 15 words)
    hook_segment = ' '.join(clean_texts[:3]).lower()
    hook_matches = sum(1 for w in HOOK_KEYWORDS if w in hook_segment)
    hook_score = min(hook_matches * 4.0, 16.0)

    # Question hook bonus
    q_bonus = 6.0 if ('?' in hook_segment or any(q in hook_segment for q in ['kenapa', 'mengapa', 'apakah', 'kok', 'why', 'how'])) else 0.0

    # 2. Keyword density
    keyword_matches = sum(1 for w in words if w in HOOK_KEYWORDS)
    density_score = min(keyword_matches * 1.5, 15.0)

    # 3. Pacing: ideal 2.5 - 3.8 words/sec
    wps = word_count / dur
    pace_score = max(0.0, 8.0 - abs(wps - 3.0) * 3.0)

    # 4. Total score
    total = hook_score + q_bonus + density_score + pace_score
    return round(total, 2), full_text

def find_best_moments(
    url_or_id: str,
    min_dur: float = 28.0,
    max_dur: float = 50.0,
    top_n: int = 5,
    languages: List[str] = None
) -> List[Dict[str, Any]]:
    video_id = extract_video_id(url_or_id)
    snippets = fetch_snippets(video_id, languages)
    n = len(snippets)
    candidates = []

    # Step through snippets with step=3 for comprehensive coverage
    for i in range(0, n - 5, 3):
        t_start = snippets[i].start if hasattr(snippets[i], 'start') else snippets[i]['start']
        for j in range(i + 5, min(i + 50, n)):
            s_j = snippets[j]
            t_end = (s_j.start + s_j.duration) if hasattr(s_j, 'start') else (s_j['start'] + s_j['duration'])
            dur = t_end - t_start
            if dur > max_dur:
                break
            if dur >= min_dur:
                score, text = score_window(snippets, i, j)
                if score > 10.0:
                    candidates.append({
                        'start': round(t_start, 2),
                        'end': round(t_end, 2),
                        'duration': round(dur, 2),
                        'score': score,
                        'text': text[:140] + ('...' if len(text) > 140 else '')
                    })

    # Sort descending by score
    candidates.sort(key=lambda x: x['score'], reverse=True)

    # Deduplicate closely overlapping moments (>20s overlap)
    unique: List[Dict[str, Any]] = []
    for c in candidates:
        overlap = False
        for u in unique:
            if abs(c['start'] - u['start']) < 25.0:
                overlap = True
                break
        if not overlap:
            unique.append(c)
        if len(unique) >= top_n:
            break

    return unique
