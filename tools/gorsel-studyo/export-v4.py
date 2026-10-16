"""Hizmet görselleri v4 (gerçek işler, h3/real.mjs): render.mjs çıktısını sitedeki boyutlara çevirir.
  DPR=2 node tools/gorsel-studyo/render.mjs real-<slug> && python3 tools/gorsel-studyo/export-v4.py <slug> [<slug> ...] [--sadece=hero,kapak,og]

public/services/v4/
  <slug>-hero.webp   1600x1000  galeri ana karesi       <slug>-kart.webp  1200x900  hero'nun ortası (4:3; KART'takiler galeri karesi)
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


# Kartı hero'nun ortası yerine galeri karesinden alan hizmetler (Web Tasarım: Aska Hotels karesi)
KART = {"web-tasarim": "1"}
# --sadece=hero,kapak,og: yalnız bu kareler (hero kartı da üretir); varsayılan hepsi
only = next((a.split("=", 1)[1].split(",") for a in sys.argv[1:] if a.startswith("--sadece=")), None)
want = lambda k: only is None or k in only
for slug in [a for a in sys.argv[1:] if not a.startswith("--")]:
    if want("hero"):
        h = src(f"{slug}-hero")
        webp(h, (1600, 1000), f"{slug}-hero.webp")
        w = round(h.height * 4 / 3)
        x = (h.width - w) // 2
        if slug not in KART:
            webp(h.crop((x, 0, x + w, h.height)), (1200, 900), f"{slug}-kart.webp")
    if want("kapak"):
        webp(src(f"{slug}-kapak"), (1200, 1500), f"{slug}-kapak.webp")
    for i in range(1, 7):
        if want(str(i)):
            webp(src(f"{slug}-{i}"), (1200, 900), f"{slug}-{i}.webp")
            if KART.get(slug) == str(i):
                webp(src(f"{slug}-{i}"), (1200, 900), f"{slug}-kart.webp")
    if want("og"):
        src(f"{slug}-og").resize((1200, 630), Image.LANCZOS).save(os.path.join(DST, f"{slug}-og.jpg"), "JPEG", quality=88, optimize=True, progressive=True)
    print("ok", slug)
