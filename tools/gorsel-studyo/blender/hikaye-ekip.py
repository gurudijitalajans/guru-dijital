import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import importlib, g3d; importlib.reload(g3d)
from g3d import *
A = args(); f = lambda k, d: float(A.get(k, d))
sc = reset(1250, 1000, samples=int(A.get("s", 128)), pct=int(A.get("pct", 50)))
sc.cycles.volume_bounces = 1
sc.world.node_tree.nodes["Background"].inputs[1].default_value = f("amb", 0.08)
H = f("halo", 1.0)
spots = [
    ((0, 0.6, 0), (6.5, 5.0, 9), lin("#1747a8"), 0.30 * H, 1.5, 0),
    ((0, 0.3, 0), (3.2, 2.8, 9), BLUE, 0.22 * H, 2.0, 0),
]
assign(cyclorama(back=14, r=5), lit_wall(NAVY, rough=f("floor", 0.2), spots=spots, wall_rough=0.7))

NAMES = ["megaphone", "monitor", "search", "code", "smartphone", "badge-check", "shopping-cart", "palette", "share-2"]
K, GAP, KH = 1.5, f("gap", 0.2), 0.5
hi = int(A.get("hi", 4))
root = bpy.data.objects.new("Izgara", None); link(root)
neon = mat("Neon", ICE, rough=0.2, emit=ICE, estr=f("neon", 6))
neon_dim = mat("NeonSoluk", SKY, rough=0.25, emit=SKY, estr=f("neon2", 1.3))
for i, n in enumerate(NAMES):
    r, c = divmod(i, 3)
    x, y = (c - 1) * (K + GAP), (1 - r) * (K + GAP)
    lift = f("lift", 0.22) if i == hi else 0.0
    k = rbox(K, K, KH, (x, y, lift), bevel=0.24, seg=14, name=f"tus-{n}")
    tint = "#3d8bf2" if i == hi else "#1747a8"
    assign(k, glass(f"Tus{i}", tint=PALE, rough=f("krough", 0.04), absorb=lin(tint), density=f("kd", 0.9) * (0.5 if i == hi else 1), disp=0.4))
    ic = icon(n, size=0.82, tube=0.038)
    ic.location = (x, y, lift + KH - f("sink", 0.16))      # camın içinde, üst yüzeyin hemen altında
    assign(ic, neon if i == hi else neon_dim)
    for o in (k, ic): o.parent = root
    if i == hi:
        d = bpy.data.lights.new("Ic", "POINT"); d.energy = f("inner", 30); d.color = SKY[:3]; d.shadow_soft_size = 0.5
        L = link(bpy.data.objects.new("Ic", d)); L.location = (x, y, lift + 0.12); L.parent = root
root.rotation_euler.z = math.radians(f("rz", 28))

# Altta, yalnız camın içinden görünen ışık panosu (klavye arka ışığı gibi)
softbox("PanoAlt", (0, 0, 0.01), (0, 0, 5), size=(6.0, 6.0), strength=f("under", 0.9), color=BLUE, glossy=False, gradient=1.4)
softbox("PanoUst", (1.0, -2.0, 6.5), (0, 0, 0), size=(6.0, 1.4), strength=f("sb1", 4))
softbox("PanoSol", (-6.0, 1.5, 3.0), (0, 0, 0.3), size=(1.0, 6.0), strength=f("sb2", 2.5), color=SKY)
spot("Key", (3.0, -3.0, 7.0), (0, 0, 0), energy=f("key", 600), color=ICE, angle=70, blend=1.0, radius=2.0)
spot("Huzme", (f("bx", 6.5), f("by", 5.5), f("bz", 7.5)), (0, 0, 0.4), energy=f("beam", 14000), color=ICE, angle=f("bang", 12), blend=0.35, radius=0.15)
if f("fog", 0.03) > 0: fog(density=f("fog", 0.03), size=(30, 30, 12), center=(0, 0, 5.5))

elev = math.radians(f("elev", 48)); dist = f("dist", 17)
camera((0, -dist * math.cos(elev), dist * math.sin(elev)), (0, 0.2, 0.2), lens=f("lens", 60), fstop=f("f", 3.2))
render(A.get("o", os.path.join(os.path.dirname(os.path.abspath(__file__)), "out", "hikaye-ekip.png")))
