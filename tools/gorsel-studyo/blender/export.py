"""16-bit PNG → hedef boy, ince titreşimli (bantlanma olmasın) WebP."""
import sys, cv2, numpy as np
from PIL import Image
src, dst, w, h = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
im = cv2.imread(src, cv2.IMREAD_UNCHANGED)[:, :, :3][:, :, ::-1].astype(np.float32) / 65535.0
z = float(sys.argv[5]) if len(sys.argv) > 5 else 1.0      # >1: ortadan yakınlaştır
if z > 1:
    H, W = im.shape[:2]; ch, cw = int(H / z), int(W / z); y0, x0 = (H - ch) // 2, (W - cw) // 2
    im = im[y0:y0 + ch, x0:x0 + cw]
im = cv2.resize(im, (w, h), interpolation=cv2.INTER_AREA)
rng = np.random.default_rng(7)
im = im * 255.0 + rng.normal(0, 0.9, im.shape).astype(np.float32)
Image.fromarray(np.clip(np.round(im), 0, 255).astype(np.uint8)).save(dst, "WEBP", quality=90, method=6)
print(dst, w, h)
