"""Eski marka yeşili parıltıları marka mavisine çevirir (public/work).

Yalnız tanımlı bölgede çalışır; ürünün kendi yeşili (ambalaj, koltuk, Google
logosu) korunur. Geçişler yumuşaktır: ton, doygunluk eşiğine göre kademeli
karıştırılır. Kullanım: python3 tools/gorsel-studyo/yesil-mavi.py [dosya...]
"""
import os
import sys

import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
WORK = os.path.join(HERE, "..", "..", "public", "work")

# bölge: (x0, y0, x1, y1) oranları; "tum" = tüm görsel. koru: dokunulmayacak kutular
PLAN = {
    "ambalaj-etiket": {"bolge": [(0.74, 0.0, 1.0, 1.0)], "koru": []},
    "dijital-pazarlama": {"bolge": [(0.76, 0.0, 1.0, 1.0)], "koru": []},
    "katalog-brosur": {"bolge": [(0.70, 0.0, 1.0, 0.75)], "koru": []},
    "kurumsal-kimlik": {"bolge": ["tum"], "koru": []},
    "logo-tasarimlari": {"bolge": [(0.70, 0.45, 1.0, 1.0)], "koru": []},
    "odul-impact": {"bolge": ["tum"], "koru": [(0.66, 0.0, 0.96, 0.48)]},
    "odul-partner": {"bolge": ["tum"], "koru": [(0.38, 0.45, 0.62, 0.75)]},
    "sosyal-icerik-cita": {"bolge": ["tum"], "koru": []},
    "sosyal-medya-telefon": {"bolge": ["tum"], "koru": []},
    "web-laptop-kare": {"bolge": ["tum"], "koru": []},
    "web-siteleri": {"bolge": ["tum"], "koru": []},
    "web-siteleri-2": {"bolge": ["tum"], "koru": []},
}


def smooth(x, a, b):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def box_mask(h, w, boxes, feather):
    m = np.zeros((h, w), dtype=np.float32)
    yy, xx = np.mgrid[0:h, 0:w]
    for b in boxes:
        if b == "tum":
            return np.ones((h, w), dtype=np.float32)
        # görsel kenarına dayanan kutu kenarı dışarı uzatılır: kenarda yumuşatma olmasın
        x0, y0 = (-2 * feather if b[0] <= 0 else b[0] * w), (-2 * feather if b[1] <= 0 else b[1] * h)
        x1, y1 = (w + 2 * feather if b[2] >= 1 else b[2] * w), (h + 2 * feather if b[3] >= 1 else b[3] * h)
        dx = np.minimum(xx - x0, x1 - xx)
        dy = np.minimum(yy - y0, y1 - yy)
        d = np.minimum(dx, dy)
        m = np.maximum(m, smooth(d, -feather, feather))
    return m


def recolor(name):
    path = os.path.join(WORK, f"{name}.webp")
    im = Image.open(path).convert("RGB")
    w, h = im.size
    rgb = np.asarray(im).astype(np.float32) / 255.0
    hsv = np.asarray(im.convert("HSV")).astype(np.float32)
    hue = hsv[..., 0] * 360 / 255
    sat = hsv[..., 1] / 255
    val = hsv[..., 2] / 255

    # yeşil ağırlığı: ton penceresi (yumuşak kenar) x doygunluk x parlaklık
    win = smooth(hue, 70, 88) * (1 - smooth(hue, 184, 198))
    wgt = win * smooth(sat, 0.03, 0.12) * smooth(val, 0.12, 0.3)
    plan = PLAN[name]
    feather = 0.04 * max(w, h)
    wgt *= box_mask(h, w, plan["bolge"], feather)
    if plan["koru"]:
        wgt *= 1 - box_mask(h, w, plan["koru"], feather * 0.5)

    # hedef ton: 88-190 aralığı (yeşilden turkuaza) marka mavisine (202-222) sıkıştırılır
    new_h = 202 + (np.clip(hue, 88, 190) - 88) * (20 / 102)
    new_hsv = np.stack([new_h / 360 * 255, sat * 255, val * 255], axis=-1).clip(0, 255).astype(np.uint8)
    hsv_img = Image.merge("HSV", [Image.fromarray(new_hsv[..., i]) for i in range(3)])
    new_rgb = np.asarray(hsv_img.convert("RGB")).astype(np.float32) / 255.0
    out = rgb * (1 - wgt[..., None]) + new_rgb * wgt[..., None]
    Image.fromarray((out * 255).round().clip(0, 255).astype(np.uint8)).save(path, "WEBP", quality=88, method=6)
    return float(wgt.mean())


if __name__ == "__main__":
    names = sys.argv[1:] or list(PLAN)
    for n in names:
        print(f"{n:24s} etkilenen ortalama %{recolor(n) * 100:.1f}")
