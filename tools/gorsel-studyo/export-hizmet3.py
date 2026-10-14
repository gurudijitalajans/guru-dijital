"""Hizmet görselleri v3: render.mjs çıktısını (2x PNG) sitedeki boyutlara çevirir.
  DPR=2 node tools/gorsel-studyo/render.mjs hizmet3- && python3 tools/gorsel-studyo/export-hizmet3.py

public/services/v3/
  <slug>-hero.webp     1600x1000  hizmet kartı ve galeri ana karesi (16:10)
  <slug>-kart.webp     1200x900   Seçili İşler kartı (hero'nun ortası, 4:3)
  <slug>-1..6.webp     1200x900   öne çıkan işler
  <slug>-kapak.webp    1200x1500  kapak (4:5)
  <slug>-og.jpg        1200x630   paylaşım görseli
guru-video/public/h3/  video için 2x ekranlar (hizmet3-raw-*) ve görseller
"""
import glob
import os
import shutil

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out")
DST = os.path.join(HERE, "..", "..", "public", "services", "v3")
VIDEO = os.path.normpath(os.path.join(HERE, "..", "..", "..", "guru-video", "public", "h3"))
os.makedirs(DST, exist_ok=True)
SLUGS = ["dijital-reklam-yonetimi", "web-tasarim", "seo", "ozel-yazilim", "mobil-uygulama", "marka-tescil", "e-ticaret-yonetimi", "grafik-tasarim", "sosyal-medya-yonetimi"]
Q = 86


def src(name):
    return Image.open(os.path.join(OUT, f"hizmet3-{name}.png")).convert("RGB")


def webp(im, size, name):
    im.resize(size, Image.LANCZOS).save(os.path.join(DST, name), "WEBP", quality=Q, method=6)


for slug in SLUGS:
    h = src(f"{slug}-hero")
    webp(h, (1600, 1000), f"{slug}-hero.webp")
    w = round(h.height * 4 / 3)
    x = (h.width - w) // 2
    webp(h.crop((x, 0, x + w, h.height)), (1200, 900), f"{slug}-kart.webp")
    for i in range(1, 7):
        webp(src(f"{slug}-{i}"), (1200, 900), f"{slug}-{i}.webp")
    webp(src(f"{slug}-kapak"), (1200, 1500), f"{slug}-kapak.webp")
    src(f"{slug}-og").resize((1200, 630), Image.LANCZOS).save(os.path.join(DST, f"{slug}-og.jpg"), "JPEG", quality=88, optimize=True, progressive=True)

if os.path.isdir(os.path.dirname(VIDEO)):
    os.makedirs(VIDEO, exist_ok=True)
    for p in glob.glob(os.path.join(OUT, "hizmet3-*.png")):
        name = os.path.basename(p)[len("hizmet3-"):]
        if name.endswith("-og.png"):
            continue
        im = Image.open(p).convert("RGB")
        im.save(os.path.join(VIDEO, name[:-4] + ".jpg"), "JPEG", quality=92)
print("tamam")

# Blog kapakları v2: out/blog2-<slug>.png → public/blog/v2/<slug>.webp (1600x900)
BLOG = os.path.join(HERE, "..", "..", "public", "blog", "v2")
os.makedirs(BLOG, exist_ok=True)
for p in glob.glob(os.path.join(OUT, "blog2-*.png")):
    slug = os.path.basename(p)[len("blog2-"):-4]
    Image.open(p).convert("RGB").resize((1600, 900), Image.LANCZOS).save(os.path.join(BLOG, f"{slug}.webp"), "WEBP", quality=Q, method=6)
