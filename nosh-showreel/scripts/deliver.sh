#!/usr/bin/env bash
# Turn Remotion's master render into the shareable delivery file.
#
#   bash scripts/deliver.sh            # showreel (16:9)
#   bash scripts/deliver.sh vertical   # Nosh Video Editing (9:16)
#
#  - Re-encodes video with x264 (CRF 27, slow, tune=grain): ~3.6 Mbps, visually
#    indistinguishable from the ~93 Mbps master at 100% (the film grain is what
#    makes the master huge).
#  - Converts full-range BT.601 (yuvj420p, from Remotion's JPEG frames) to
#    limited-range BT.709 yuv420p so every player shows the right colours.
#  - Re-muxes audio fresh from the soundtrack WAV: the master's AAC stream
#    carries 2048 samples (42.7 ms) of uncompensated encoder priming; encoding
#    from the WAV restores frame-accurate sync (verified 0.00 ms).
#
# Needs a full ffmpeg (Remotion's bundled one has no filters):
#   pip install imageio-ffmpeg   # or set FFMPEG=/path/to/ffmpeg
set -euo pipefail
cd "$(dirname "$0")/.."
FF="${FFMPEG:-$(python3 -c 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())')}"
case "${1:-showreel}" in
  showreel)
    NAME=nosh-ai-automation-showreel
    WAV=public/audio/soundtrack.wav
    TITLE="Nosh AI Automation — Showreel"
    COMMENT="noshaiautomation.com · Music: Take the Ride by Bryan Teoh (FreePD, CC0)"
    ;;
  vertical)
    NAME=nosh-video-editing-vertical
    WAV=public/audio/vertical-soundtrack.wav
    TITLE="Nosh Video Editing — Vertical"
    COMMENT="noshaiautomation.com · Music: Final Step by Rafael Krux (FreePD, CC0)"
    ;;
  *)
    echo "usage: $0 [showreel|vertical]" >&2
    exit 1
    ;;
esac
IN="out/$NAME.mp4"
OUT="renders/$NAME.mp4"
mkdir -p "$(dirname "$OUT")"
"$FF" -v error -stats -y -i "$IN" -i "$WAV" -map 0:v:0 -map 1:a:0 \
  -vf "scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p" \
  -c:v libx264 -preset slow -tune grain -crf 27 -profile:v high -level 4.1 -g 60 \
  -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:a aac -b:a 256k -ar 48000 -movflags +faststart \
  -metadata title="$TITLE" \
  -metadata comment="$COMMENT" \
  "$OUT"
echo "wrote $OUT ($(du -h "$OUT" | cut -f1))"
