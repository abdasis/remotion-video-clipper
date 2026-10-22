# Remotion Video Clipper

AI-powered 9:16 Video Clipper for TikTok, Instagram Reels, and YouTube Shorts built with **Remotion (React + TypeScript)**, **OpenCV Auto Face Tracking**, **YouTube Transcript Hook Energy Analysis**, and **Cardless Smooth Motion Typography**.

## Fitur Utama

- **Auto Best Moment Detection**: Menganalisis transkrip YouTube untuk mendeteksi hook terbaik (kata tanya, bobot emosi/filosofis, speech pacing 2.5 - 3.8 words/sec) dan memotong segmen berdurasi 30–50 detik.
- **Auto Face Tracking (9:16 Portrait Framing)**: Menggunakan OpenCV untuk mendeteksi wajah pembicara dan melakukan auto-panning horizontal halus (Exponential Moving Average smoothing) serta mengunci eye-line ke sepertiga atas frame (*rule of thirds*).
- **Variasi Text Subtitle Berbeda per Video**:
  - `hormozi`: Tipografi Fontfabric **Nexa Bold**, spring entrance, highlight kata aktif kuning neon (`#FFE600`) / lime (`#00FF66`).
  - `captions`: Font **Outfit 900**, transisi fluid modern, highlight cyan elektrik (`#00F0FF`).
  - `beast`: Font **Bebas Neue**, bouncy spring physics, rotasi warna vibran (kuning, hijau lime, biru, merah).
  - `neon`: Font **Space Grotesk**, efek cyber neon magenta/cyan glowing bloom.
  - `gadzhi`: Font **Syne 800**, luxury typography dengan aksen warm gold (`#F5C518`).
- **Cardless Smooth Motion Design**: Teks mengambang dinamis langsung di atas video tanpa card box, dilengkapi cinematic lower contrast grade untuk keterbacaan tinggi di atas pakaian bermotif.
- **Still Frame Verification**: Preview frame instan untuk verifikasi framing dan tipografi sebelum full rendering.

## Struktur Project

```
├── cli.py                          # Main Python CLI pipeline orchestrator
├── pipeline/
│   ├── best_moment.py              # YouTube transcript analysis & hook scoring
│   ├── downloader.py               # yt-dlp section downloader & ffmpeg transcode
│   ├── face_tracker.py             # OpenCV face detection & EMA smoothing
│   └── subtitle_builder.py         # Word-by-word timed subtitle builder
├── src/
│   ├── index.ts                    # Remotion root entry
│   ├── Root.tsx                    # Composition definition (1080x1920 @ 30fps)
│   ├── ShortVideo.tsx              # Main composition
│   ├── theme.ts                    # Fonts & motion spring physics presets
│   └── components/
│       ├── FaceTrackedVideo.tsx    # 9:16 pan & zoom face tracking
│       ├── SubtitleRenderer.tsx    # Word reveal & exit animations
│       ├── Overlays.tsx            # Cinematic vignette, grade & progress bar
│       └── styles/                 # Subtitle styles (Hormozi, Captions, Beast, Neon, Gadzhi)
└── public/
    └── fonts/                      # Fontfabric Nexa-Bold & motion assets
```

## Prasyarat

- [Bun](https://bun.sh/) (atau Node.js 18+)
- Python 3.10+
- FFmpeg & ffprobe
- Dependensi Python:
  ```bash
  pip install opencv-python-headless pillow numpy youtube_transcript_api
  ```

## Instalasi

```bash
bun install
```

## Penggunaan

### 1. Pratinjau Still Frame (Cepat)
```bash
python3 cli.py "https://www.youtube.com/watch?v=CB8VcQW2XQ8" --still-frames="60,180,300"
```

### 2. Pilih Style Subtitle Tertentu
```bash
# Pilihan: hormozi | captions | beast | neon | gadzhi | auto
python3 cli.py "https://www.youtube.com/watch?v=CB8VcQW2XQ8" --style=hormozi --still-frames="180"
```

### 3. Render Full Video 9:16 (MP4)
```bash
python3 cli.py "https://www.youtube.com/watch?v=CB8VcQW2XQ8" --style=hormozi --render
```
Output tersimpan di folder `out/`.
