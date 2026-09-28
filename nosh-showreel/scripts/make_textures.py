"""Generate film-grain tiles for the grain overlay (public/textures/grain-N.png).

Grayscale noise, slightly clumped (two octaves) so it reads as film grain
rather than digital static. Deterministic (fixed seed).
"""
import os
import struct
import zlib

import numpy as np

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "textures")
SIZE = 256
TILES = 8


def write_png_gray_alpha(path, gray, alpha):
    h, w = gray.shape
    raw = bytearray()
    for y in range(h):
        raw.append(0)  # filter: none
        row = np.stack([gray[y], alpha[y]], axis=-1).astype(np.uint8).tobytes()
        raw.extend(row)

    def chunk(tag, data):
        c = struct.pack(">I", len(data)) + tag + data
        return c + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    ihdr = struct.pack(">IIBBBBB", w, h, 8, 4, 0, 0, 0)  # 8-bit gray+alpha
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr)
    png += chunk(b"IDAT", zlib.compress(bytes(raw), 9)) + chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(png)


def main():
    os.makedirs(OUT, exist_ok=True)
    rng = np.random.default_rng(2026)
    for i in range(TILES):
        fine = rng.normal(0, 1, (SIZE, SIZE))
        coarse = rng.normal(0, 1, (SIZE // 2, SIZE // 2)).repeat(2, 0).repeat(2, 1)
        n = 0.75 * fine + 0.35 * coarse
        n = (n - n.mean()) / n.std()
        gray = np.clip(128 + n * 52, 0, 255)
        alpha = np.clip(np.abs(n) * 150, 0, 255)
        write_png_gray_alpha(os.path.join(OUT, f"grain-{i}.png"), gray, alpha)
    print(f"wrote {TILES} grain tiles to {os.path.abspath(OUT)}")


if __name__ == "__main__":
    main()
