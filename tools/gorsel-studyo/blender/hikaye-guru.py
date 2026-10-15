import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import importlib, g3d; importlib.reload(g3d)
from g3d import *
A = args(); f = lambda k, d: float(A.get(k, d))
sc = reset(1000, 1600, samples=int(A.get("s", 128)), pct=int(A.get("pct", 50)))
sc.cycles.volume_bounces = 1
sc.world.node_tree.nodes["Background"].inputs[1].default_value = f("amb", 0.08)
BACK = 7.0
H = f("halo", 1.0)
spots = [
    ((0, BACK, 2.2), (5.0, 9, 4.2), lin("#1747a8"), 0.55 * H, 1.5, 0),   # geniş lacivert-mavi fon
    ((0.1, BACK, 2.3), (2.4, 9, 2.4), BLUE, 0.45 * H, 2.0, 0),          # hale
    ((0, -2, 0), (6, 6, 9), lin("#12419b"), 0.05 * H, 2.0, 0),           # zemin
]
assign(cyclorama(back=BACK, r=4.5), lit_wall(NAVY, rough=f("floor", 0.16), spots=spots))

g = mark(height=2.1, depth=f("depth", 0.62), bevel=0.09, res=10)
g.rotation_euler.z = math.radians(f("rz", -30))
assign(g, glass("Cam", tint=PALE, rough=0.0, absorb=lin("#3d8bf2"), density=f("dens", 1.1), disp=0.6))

# Görünür huzme: sağ üstten işarete düşen dar spot (sisle)
spot("Huzme", (f("bx", 4.2), f("by", 1.2), f("bz", 8.5)), (0.1, 0.2, 0.9), energy=f("beam", 20000), color=ICE, angle=f("bang", 13), blend=0.35, radius=0.15)
# Yansıma panoları: tepede uzun yatay, solda dikey, sağ arkada dikey şerit
softbox("PanoUst", (0.6, -1.2, 5.0), (0, 0, 1.0), size=(4.0, 1.0), strength=f("sb1", 5))
softbox("PanoSol", (-3.4, -1.6, 1.8), (0, 0, 1.1), size=(0.6, 3.6), strength=f("sb2", 4), color=SKY)
softbox("PanoSag", (3.0, 1.8, 1.8), (0, 0, 1.1), size=(0.5, 3.6), strength=f("sb3", 6))
if f("back", 1.9) > 0:
    softbox("PanoArka", (0.2, 2.0, 1.25), (0.2, -5, 1.25), size=(3.6, 3.8), strength=f("back", 1.9), color=SKY, glossy=False, gradient=1.3)
spot("Dolgu", (-3.5, -6.0, 2.4), (0, 0, 1.0), energy=f("fill", 300), color=SKY, angle=22, blend=1.0, radius=1.2)
if f("fog", 0.045) > 0: fog(density=f("fog", 0.045))

camera((0.0, -9.8, f("camz", 2.2)), (0.0, 0, f("tz", 1.25)), lens=f("lens", 56))
render(A.get("o", os.path.join(os.path.dirname(os.path.abspath(__file__)), "out", "hikaye-guru.png")))
