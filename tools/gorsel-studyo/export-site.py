"""render.mjs çıktısındaki site sahnelerini yerine yazar.
- out/blog-*.png  → public/work/blog-*.webp (2048x1152, blog kapakları)
- out/video-*.png → public/video/*.jpg (1920x1080, video kapak kareleri)
Panel kullanılıyorsa blog kapakları için ardından: npm run payload run src/payload/set-blog-covers.ts
"""
import glob
import os

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out")
PUBLIC = os.path.join(HERE, "..", "..", "public")
for png in sorted(glob.glob(os.path.join(OUT, "blog-*.png"))):
    name = os.path.splitext(os.path.basename(png))[0]
    Image.open(png).convert("RGB").save(os.path.join(PUBLIC, "work", f"{name}.webp"), "WEBP", quality=86, method=6)
    print(name)
for png in sorted(glob.glob(os.path.join(OUT, "video-*.png"))):
    name = os.path.splitext(os.path.basename(png))[0].removeprefix("video-")
    Image.open(png).convert("RGB").resize((1920, 1080), Image.LANCZOS).save(
        os.path.join(PUBLIC, "video", f"{name}.jpg"), "JPEG", quality=86, optimize=True, progressive=True
    )
    print(name)
