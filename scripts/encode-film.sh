#!/usr/bin/env bash
# Re-encode a wedding film master into the web version used on the site.
# Usage: scripts/encode-film.sh <master.mp4|mov> [poster-time-seconds]
# Output (stable names — HTML/JSON-LD need no changes):
#   public/films/dejeu-crew-wedding-highlight.mp4         (H.264, ≤720p, faststart)
#   public/films/dejeu-crew-wedding-highlight-poster.jpg  (poster frame)
# After swapping in a new master, update "duration" in index.html JSON-LD if the length changed.
set -euo pipefail
SRC="${1:?master video path}"; T="${2:-0.4}"
cd "$(dirname "$0")/.."
OUT=public/films/dejeu-crew-wedding-highlight
ffmpeg -y -v error -i "$SRC" \
  -vf "scale='min(1280,iw)':-2:flags=lanczos,format=yuv420p" \
  -c:v libx264 -preset slow -crf 24 -profile:v high -level 4.0 \
  -c:a aac -b:a 128k -ac 2 -movflags +faststart "$OUT.mp4"
ffmpeg -y -v error -ss "$T" -i "$SRC" -frames:v 1 \
  -vf "scale='min(1280,iw)':-2:flags=lanczos" -q:v 3 "$OUT-poster.jpg"
ffprobe -v error -show_entries format=duration,size:stream=width,height -of compact "$OUT.mp4"
