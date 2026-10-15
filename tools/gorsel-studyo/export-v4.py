"""Hizmet görselleri v4 (gerçek işler, h3/real.mjs): render.mjs çıktısını sitedeki boyutlara çevirir.
  DPR=2 node tools/gorsel-studyo/render.mjs real-<slug> && python3 tools/gorsel-studyo/export-v4.py <slug> [<slug> ...]

public/services/v4/
  <slug>-hero.webp   1600x1000  galeri ana karesi       <slug>-kart.webp  1200x900  hero'nun ortası (4:3)
  <slug>-kapak.webp  1200x1500  kapak (4:5)            <slug>-1..6.webp  1200x900  öne çıkan işler
  <slug>-og.jpg      1200x630   paylaşım görseli (real-<slug>-og)
"""
import os
import sys

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out")
DST = os.path.join(HERE, "..", "..", "public", "services", "v4")
os.makedirs(DST, exist_ok=True)
Q = 86


def src(name):
    return Image.open(os.path.join(OUT, f"real-{name}.png")).convert("RGB")


def webp(im, size, name):
    im.resize(size, Image.LANCZOS).save(os.path.join(DST, name), "WEBP", quality=Q, method=6)


for slug in sys.argv[1:]:
    h = src(f"{slug}-hero")
    webp(h, (1600, 1000), f"{slug}-hero.webp")
    w = round(h.height * 4 / 3)
    x = (h.width - w) // 2
    webp(h.crop((x, 0, x + w, h.height)), (1200, 900), f"{slug}-kart.webp")
    webp(src(f"{slug}-kapak"), (1200, 1500), f"{slug}-kapak.webp")
    for i in range(1, 7):
        webp(src(f"{slug}-{i}"), (1200, 900), f"{slug}-{i}.webp")
    src(f"{slug}-og").resize((1200, 630), Image.LANCZOS).save(os.path.join(DST, f"{slug}-og.jpg"), "JPEG", quality=88, optimize=True, progressive=True)
    print("ok", slug)
