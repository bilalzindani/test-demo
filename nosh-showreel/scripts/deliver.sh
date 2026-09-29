#!/usr/bin/env bash
# Turn Remotion's master render into the shareable delivery file.
#
#  - Re-encodes video with x264 (CRF 27, slow, tune=grain): ~3.6 Mbps, visually
#    indistinguishable from the ~93 Mbps master at 100% (the film grain is what
#    makes the master huge).
#  - Converts full-range BT.601 (yuvj420p, from Remotion's JPEG frames) to
#    limited-range BT.709 yuv420p so every player shows the right colours.
#  - Re-muxes audio fresh from public/audio/soundtrack.wav: the master's AAC
#    stream carries 2048 samples (42.7 ms) of uncompensated encoder priming;
#    encoding from the WAV restores frame-accurate sync (verified 0.00 ms).
#
# Needs a full ffmpeg (Remotion's bundled one has no filters):
#   pip install imageio-ffmpeg   # or set FFMPEG=/path/to/ffmpeg
set -euo pipefail
cd "$(dirname "$0")/.."
FF="${FFMPEG:-$(python3 -c 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())')}"
IN="${1:-out/nosh-ai-automation-showreel.mp4}"
OUT="${2:-renders/nosh-ai-automation-showreel.mp4}"
mkdir -p "$(dirname "$OUT")"
"$FF" -v error -stats -y -i "$IN" -i public/audio/soundtrack.wav -map 0:v:0 -map 1:a:0 \
  -vf "scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p" \
  -c:v libx264 -preset slow -tune grain -crf 27 -profile:v high -level 4.1 -g 60 \
  -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:a aac -b:a 256k -ar 48000 -movflags +faststart \
  -metadata title="Nosh AI Automation — Showreel" \
  -metadata comment="noshaiautomation.com · Music: Take the Ride by Bryan Teoh (FreePD, CC0)" \
  "$OUT"
echo "wrote $OUT ($(du -h "$OUT" | cut -f1))"
