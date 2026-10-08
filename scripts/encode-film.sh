#!/usr/bin/env bash
# Encode a wedding film master into the web versions used on the site.
# Usage: scripts/encode-film.sh <master.mp4|mov> <slug> [poster-time-s] [crf1080] [crf720]
# Outputs (stable names, referenced by index.html + JSON-LD + sitemap):
#   public/films/<slug>-1080.mp4   H.264 high, 1920x1080, ~29.97 fps, AAC 128k, +faststart
#   public/films/<slug>-720.mp4    H.264 high, 1280x720 (served to small screens)
#   public/films/<slug>-poster.jpg 1920x1080 poster frame
# If the film length changes, update "duration" in index.html JSON-LD and <video:duration> in public/sitemap.xml.
set -euo pipefail
SRC="${1:?master video path}"; SLUG="${2:?slug}"; T="${3:-1}"; CRF1="${4:-23}"; CRF7="${5:-24}"
cd "$(dirname "$0")/.."
OUT="public/films/$SLUG"
mkdir -p public/films
enc() { # height crf out
  ffmpeg -y -v error -i "$SRC" \
    -vf "fps=30000/1001,scale=-2:$1:flags=lanczos,format=yuv420p" \
    -c:v libx264 -preset slow -crf "$2" -profile:v high -level 4.1 -g 60 \
    -c:a aac -b:a 128k -ac 2 -movflags +faststart "$3"
}
enc 1080 "$CRF1" "$OUT-1080.mp4"
enc 720 "$CRF7" "$OUT-720.mp4"
ffmpeg -y -v error -ss "$T" -i "$SRC" -frames:v 1 -vf "scale=1920:-2:flags=lanczos" -q:v 3 "$OUT-poster.jpg"
ls -la "$OUT"-*
