"""render.mjs çıktısındaki hizmet sahnelerini sitedeki boyutlara küçültüp public/services altına yazar.
- out/hizmet-<slug>-kart.png   → public/services/<slug>.webp         (1600x1000)
- out/hizmet-<slug>-poster.png → public/services/<slug>-poster.webp  (1200x1500)
- Marka Tescil posteri müşterinin kendi gönderisidir: kaynak/marka-tescil-gonderi.jpg 4:5 kırpılır.
Ardından out/ altına önizleme sayfaları (HTML) ve gözden geçirme paftaları (JPG) üretir.
  node tools/gorsel-studyo/render.mjs hizmet- && python3 tools/gorsel-studyo/export-hizmet.py
"""
import os

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out")
DST = os.path.join(HERE, "..", "..", "public", "services")
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
Q = 84


def save(im, size, name):
    im.convert("RGB").resize(size, Image.LANCZOS).save(os.path.join(DST, name), "WEBP", quality=Q, method=6)


for slug, _ in SLUGS:
    save(Image.open(f"{OUT}/hizmet-{slug}-kart.png"), (1600, 1000), f"{slug}.webp")
    if slug == "marka-tescil":
        src = Image.open(os.path.join(HERE, "kaynak", "marka-tescil-gonderi.jpg"))
        w, h = src.size  # 2392x2923; 4:5 için yanlardan eşit kırp
        cw = round(h * 4 / 5)
        x0 = (w - cw) // 2
        save(src.crop((x0, 0, x0 + cw, h)), (1200, 1500), f"{slug}-poster.webp")
    else:
        save(Image.open(f"{OUT}/hizmet-{slug}-poster.png"), (1200, 1500), f"{slug}-poster.webp")
    print(slug)

# Önizleme sayfaları
rel = os.path.relpath(DST, OUT)
for kind, suffix, ratio, cols in [("kartlar", "", "16/10", 3), ("posterler", "-poster", "4/5", 3)]:
    items = "".join(
        f'<figure><img src="{rel}/{s}{suffix}.webp" alt="{t}"><figcaption>{t}<span>{s}{suffix}.webp</span></figcaption></figure>' for s, t in SLUGS
    )
    html = f"""<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>Hizmet {kind}</title>
<style>body{{margin:0;padding:32px;background:#e4e8ee;font-family:system-ui,sans-serif;color:#011441}}h1{{font-size:20px;margin:0 0 20px}}
.g{{display:grid;grid-template-columns:repeat({cols},1fr);gap:20px}}figure{{margin:0;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 10px 30px -18px rgb(1 20 65/.5)}}
img{{display:block;width:100%;aspect-ratio:{ratio};object-fit:cover}}figcaption{{padding:10px 14px;font-size:14px;font-weight:600;display:flex;justify-content:space-between}}figcaption span{{font-weight:400;color:#7f8aa3}}</style></head>
<body><h1>Hizmet görselleri · {kind}</h1><div class="g">{items}</div></body></html>"""
    open(os.path.join(OUT, f"onizleme-hizmet-{kind}.html"), "w").write(html)

# Gözden geçirme paftaları (3 sütun)
for kind, suffix, (tw, th) in [("kartlar", "", (800, 500)), ("posterler", "-poster", (600, 750))]:
    pad = 16
    sheet = Image.new("RGB", (3 * tw + 4 * pad, 3 * th + 4 * pad), (214, 220, 228))
    for i, (s, _) in enumerate(SLUGS):
        im = Image.open(os.path.join(DST, f"{s}{suffix}.webp")).convert("RGB").resize((tw, th), Image.LANCZOS)
        sheet.paste(im, (pad + (i % 3) * (tw + pad), pad + (i // 3) * (th + pad)))
    sheet.save(os.path.join(OUT, f"sheet-hizmet-{kind}.jpg"), quality=86)
print("tamam")
