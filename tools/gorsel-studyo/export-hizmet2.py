"""Hizmet görselleri v2: render.mjs çıktısını (2x PNG) sitedeki boyutlara çevirir.
  node tools/gorsel-studyo/render.mjs hizmet2- && python3 tools/gorsel-studyo/export-hizmet2.py

public/services/v2/ (eski public/services dosyalarına dokunmaz)
  <slug>-hero.webp   1600x1000  hizmet kartı ve galeri ana karesi (16:10)
  <slug>-kart.webp   1200x900   Seçili İşler ve ana sayfa kartı (4:3)
  <slug>-1/2/3.webp  1200x900   öne çıkan ekranlar
  <slug>-kapak.webp  1200x1500  App Store tarzı kapak (4:5)
  <slug>-og.jpg      1200x630   paylaşım görseli
guru-video/public/screens/ (ürünlerle aynı biçim: 2x PNG)
  <slug>.png, <slug>-2.png, <slug>-3.png  2880x1800 masaüstü ekranları
  <slug>-mobile.png (ve mobil uygulamada -mobile-2, -mobile-3)  780x1688
  <slug>-kapak.png   2400x3000
Ardından out/ altına türe göre önizleme sayfaları (HTML) ve kontak baskıları (JPG) yazar.
"""
import os
import shutil

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out")
DST = os.path.join(HERE, "..", "..", "public", "services", "v2")
VIDEO = os.path.normpath(os.path.join(HERE, "..", "..", "..", "guru-video", "public", "screens"))
os.makedirs(DST, exist_ok=True)

SLUGS = [
    ("dijital-reklam-yonetimi", "Dijital Reklam Yönetimi"),
    ("web-tasarim", "Web Tasarım"),
    ("seo", "SEO"),
    ("ozel-yazilim", "Özel Yazılım"),
    ("mobil-uygulama", "Mobil Uygulama"),
    ("marka-tescil", "Marka Tescil"),
    ("e-ticaret-yonetimi", "E-Ticaret Yönetimi"),
    ("grafik-tasarim", "Grafik Tasarım"),
    ("sosyal-medya-yonetimi", "Sosyal Medya Yönetimi"),
]
Q = 86


def src(name):
    return Image.open(os.path.join(OUT, f"hizmet2-{name}.png")).convert("RGB")


def webp(im, size, name):
    im.resize(size, Image.LANCZOS).save(os.path.join(DST, name), "WEBP", quality=Q, method=6)


for slug, _ in SLUGS:
    webp(src(f"{slug}-hero"), (1600, 1000), f"{slug}-hero.webp")
    webp(src(f"{slug}-kart"), (1200, 900), f"{slug}-kart.webp")
    for i in (1, 2, 3):
        webp(src(f"{slug}-{i}"), (1200, 900), f"{slug}-{i}.webp")
    webp(src(f"{slug}-kapak"), (1200, 1500), f"{slug}-kapak.webp")
    src(f"{slug}-og").resize((1200, 630), Image.LANCZOS).save(os.path.join(DST, f"{slug}-og.jpg"), "JPEG", quality=88, optimize=True, progressive=True)

    # Video ekranları (render 2x olduğundan doğrudan kopyalanır)
    if os.path.isdir(VIDEO):
        for suffix in ["", "-2", "-3", "-mobile", "-mobile-2", "-mobile-3"]:
            p = os.path.join(OUT, f"hizmet2-raw-{slug}{suffix}.png")
            if os.path.exists(p):
                shutil.copyfile(p, os.path.join(VIDEO, f"{slug}{suffix}.png"))
        shutil.copyfile(os.path.join(OUT, f"hizmet2-{slug}-kapak.png"), os.path.join(VIDEO, f"{slug}-kapak.png"))

# Önizleme sayfaları ve kontak baskıları
KINDS = [("hero", "-hero.webp", 3, 640), ("kart", "-kart.webp", 3, 560), ("feature", None, 3, 560), ("kapak", "-kapak.webp", 5, 400), ("og", "-og.jpg", 3, 640)]
for kind, ext, cols, cw in KINDS:
    files = []
    for slug, title in SLUGS:
        if kind == "feature":
            files += [(f"{slug}-{i}.webp", f"{title} · {i}") for i in (1, 2, 3)]
        else:
            files.append((slug + ext, title))
    rel = os.path.relpath(DST, OUT)
    cells = "".join(f'<figure><img src="{rel}/{f}"><figcaption>{t}</figcaption></figure>' for f, t in files)
    with open(os.path.join(OUT, f"hizmet2-onizleme-{kind}.html"), "w") as fh:
        fh.write(f'<!doctype html><meta charset="utf-8"><title>Hizmet v2 · {kind}</title><style>body{{margin:24px;font:14px system-ui;background:#cfd6e2}}main{{display:grid;grid-template-columns:repeat({cols},1fr);gap:16px}}img{{width:100%;display:block;border-radius:6px}}figure{{margin:0}}figcaption{{padding:6px 2px;color:#334}}</style><main>{cells}</main>')
    ims = [Image.open(os.path.join(DST, f)).convert("RGB") for f, _ in files]
    ths = [im.resize((cw, round(im.height * cw / im.width)), Image.LANCZOS) for im in ims]
    g = 12
    rows = [ths[i:i + cols] for i in range(0, len(ths), cols)]
    H = sum(max(t.height for t in r) for r in rows) + g * (len(rows) + 1)
    sheet = Image.new("RGB", (cols * cw + g * (cols + 1), H), (205, 212, 224))
    y = g
    for r in rows:
        x = g
        for t in r:
            sheet.paste(t, (x, y))
            x += cw + g
        y += max(t.height for t in r) + g
    sheet.save(os.path.join(OUT, f"hizmet2-onizleme-{kind}.jpg"), "JPEG", quality=88)
print("tamam")
