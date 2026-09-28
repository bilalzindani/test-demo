"""Tile rendered stills into a labelled contact sheet (frame number + timecode)."""
import glob
import os
import sys

from PIL import Image, ImageDraw

src, dst = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 3
files = sorted(glob.glob(os.path.join(src, "f*.png")))
if not files:
    sys.exit("no stills found")
thumbs = [Image.open(f).convert("RGB") for f in files]
w, h = thumbs[0].size
pad, label = 8, 26
rows = (len(thumbs) + cols - 1) // cols
sheet = Image.new("RGB", (cols * (w + pad) + pad, rows * (h + pad + label) + pad), (40, 40, 44))
draw = ImageDraw.Draw(sheet)
for i, (f, im) in enumerate(zip(files, thumbs)):
    x = pad + (i % cols) * (w + pad)
    y = pad + (i // cols) * (h + pad + label)
    sheet.paste(im, (x, y + label))
    fr = int(os.path.basename(f)[1:5])
    draw.text((x + 4, y + 6), f"F{fr}  {fr // 30:02d}s+{fr % 30:02d}f", fill=(230, 230, 230))
sheet.save(dst, quality=88)
print(f"sheet {dst} ({len(files)} frames, {sheet.size[0]}x{sheet.size[1]})")
