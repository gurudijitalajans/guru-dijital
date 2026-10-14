"""Kontak baskısı: python3 sheet.py <önek> <çıktı.jpg> [genişlik]"""
import glob, sys
from PIL import Image
pre, out = sys.argv[1], sys.argv[2]
cw = int(sys.argv[3]) if len(sys.argv) > 3 else 700
fs = sorted(f for f in glob.glob(f"out/{pre}*.png"))
ths = []
for f in fs:
    im = Image.open(f).convert("RGB")
    ths.append(im.resize((cw, round(im.height * cw / im.width))))
cols = 3
g = 10
rows = [ths[i:i + cols] for i in range(0, len(ths), cols)]
H = sum(max(t.height for t in r) for r in rows) + g * (len(rows) + 1)
sh = Image.new("RGB", (cols * cw + g * (cols + 1), H), (200, 205, 215))
y = g
for r in rows:
    x = g
    for t in r:
        sh.paste(t, (x, y)); x += cw + g
    y += max(t.height for t in r) + g
sh.save(out, quality=85)
print(len(fs), "görsel")
