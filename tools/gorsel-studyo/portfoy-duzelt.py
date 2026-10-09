"""Portföy görsellerinde tek seferlik temizlik ve kırpımlar (public/work).

- instagram-post-kare: üst kenardaki koyu leke boyanır, soldaki yabancı kenar şeridi kırpılır.
- instagram-postlar: soldaki şablon gönderi (müşteri işi değil, Almanca yer tutucu
  afiş) çıkarılır; kalan dört gerçek gönderi şerit olarak kalır.
- instagram-postlar-ikili: aynı şeritten son iki gönderi (yan kare için ~1,6:1).
- logo-tasarimlari: üst ve alttaki boş zemin kırpılır (yeşil parıltı yesil-mavi.py ile).

Her adım yalnız görsel hâlâ özgün boyutundaysa çalışır; tekrar çalıştırmak güvenlidir.
Kullanım: python3 tools/gorsel-studyo/portfoy-duzelt.py
"""
import os

import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
WORK = os.path.join(HERE, "..", "..", "public", "work")


def path(name):
    return os.path.join(WORK, f"{name}.webp")


def save(im, name):
    im.save(path(name), "WEBP", quality=90, method=6)
    print(f"{name:26s} {im.size[0]}x{im.size[1]}")


def post_kare():
    im = Image.open(path("instagram-post-kare")).convert("RGB")
    if im.size != (1600, 1131):
        return
    a = np.asarray(im).copy()
    a[0:16, 740:892] = a[18:19, 740:892]  # üst kenardaki koyu leke
    save(Image.fromarray(a).crop((20, 0, 1600, 1131)), "instagram-post-kare")


def postlar():
    src = Image.open(path("instagram-postlar")).convert("RGB")
    if src.size != (1600, 471):
        return
    # gönderi kutuları: x 346-636, 658-947, 965-1256, 1280-1570; y 37-398 (13px zemin payı)
    save(src.crop((952, 24, 1583, 411)), "instagram-postlar-ikili")
    save(src.crop((333, 24, 1583, 411)), "instagram-postlar")


def logolar():
    im = Image.open(path("logo-tasarimlari")).convert("RGB")
    if im.size != (1600, 620):
        return
    # logolar y 134-428 arasında; yanlardaki ~72px payla aynı boşluk üstte ve altta da kalır
    save(im.crop((0, 60, 1600, 500)), "logo-tasarimlari")


if __name__ == "__main__":
    post_kare()
    postlar()
    logolar()
