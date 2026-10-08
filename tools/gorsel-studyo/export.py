"""render.mjs çıktısını (2x PNG) sitedeki boyutlara küçültüp public/products altına yazar."""
import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
O = os.path.join(HERE, "out")
P = os.path.join(HERE, "..", "..", "public", "products")
os.makedirs(os.path.join(P, "screens"), exist_ok=True)
os.makedirs(os.path.join(P, "covers"), exist_ok=True)
V = os.path.join(HERE, "..", "..", "public", "video", "products")
for slug in ["guru-chatbot", "guru-crm", "guru-operation", "guru-business"]:
    for n, size in [("hero", (1600, 1200)), ("1", (1200, 900)), ("2", (1200, 900)), ("3", (1200, 900))]:
        Image.open(f"{O}/{slug}-{n}.png").convert("RGB").resize(size, Image.LANCZOS).save(f"{P}/visuals/{slug}-{n}.webp", "WEBP", quality=86, method=6)
    Image.open(f"{O}/{slug}-og.png").convert("RGB").resize((1200, 630), Image.LANCZOS).save(f"{P}/og/{slug}.jpg", "JPEG", quality=88, optimize=True, progressive=True)
    Image.open(f"{O}/raw-{slug.split('-')[1]}-desktop.png").convert("RGB").resize((1600, 1000), Image.LANCZOS).save(f"{P}/screens/{slug}.webp", "WEBP", quality=86, method=6)
    Image.open(f"{O}/{slug}-cover.png").convert("RGB").resize((1200, 1500), Image.LANCZOS).save(f"{P}/covers/{slug}.webp", "WEBP", quality=86, method=6)
    Image.open(f"{O}/{slug}-poster.png").convert("RGB").resize((1920, 1080), Image.LANCZOS).save(f"{V}/{slug}.jpg", "JPEG", quality=86, optimize=True, progressive=True)
print("tamam")
