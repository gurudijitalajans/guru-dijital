import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import importlib, g3d; importlib.reload(g3d)
from g3d import *
A = args(); f = lambda k, d: float(A.get(k, d))
sc = reset(1250, 1000, samples=int(A.get("s", 128)), pct=int(A.get("pct", 50)))
sc.cycles.volume_bounces = 1
sc.world.node_tree.nodes["Background"].inputs[1].default_value = f("amb", 0.08)
BACK = 7.0; H = f("halo", 1.0)
spots = [
    ((0.6, BACK, 2.0), (6.5, 9, 4.0), lin("#1747a8"), 0.55 * H, 1.5, 0),
    ((0.8, BACK, 2.2), (2.8, 9, 2.4), BLUE, 0.45 * H, 2.0, 0),
    ((0, -2, 0), (7, 6, 9), lin("#12419b"), 0.05 * H, 2.0, 0),
]
assign(cyclorama(back=BACK, r=4.5), lit_wall(NAVY, rough=f("floor", 0.14), spots=spots, wall_rough=0.7))

# Büyüme: beş yuvarlak cam sütun (hap), kısadan uzuna buz mavisinden maviye; zirvede parlayan küre
HS = [0.7, 1.15, 1.65, 2.25, 2.95]
TINTS = ["#d9efff", "#9fd2ff", "#6fb2f7", "#3d8bf2", "#2a6aca"]
R, STEP = f("r", 0.36), f("step", 0.98)
root = bpy.data.objects.new("Basamak", None); link(root)
for i, (h, t) in enumerate(zip(HS, TINTS)):
    x = (i - 2) * STEP
    o = column(R, h, (x, 0, 0), top_round=f("round", 0.92), name=f"sutun{i}")
    assign(o, glass(f"Cam{i}", tint=PALE, rough=f("frost", 0.02), absorb=lin(t), density=f("dens", 2.2), disp=0.5))
    o.parent = root
bpy.ops.mesh.primitive_uv_sphere_add(segments=96, ring_count=48, radius=0.27, location=(2 * STEP, 0, HS[-1] + 0.27 + 0.02))
s = bpy.context.object; bpy.ops.object.shade_smooth(); s.parent = root
assign(s, mat("Kure", ICE, rough=0.04, coat=1.0, emit=SKY, estr=f("ball", 0.5)))
root.rotation_euler.z = math.radians(f("rz", -22))
root.location.x = f("ox", 0.0)

spot("Huzme", (f("bx", 5.2), f("by", 1.8), f("bz", 8.8)), (2 * STEP * 0.9, 0.2, HS[-1]), energy=f("beam", 16000), color=ICE, angle=f("bang", 11), blend=0.35, radius=0.15)
softbox("PanoUst", (0.0, -1.6, 5.6), (0, 0, 1.0), size=(5.0, 1.0), strength=f("sb1", 4))
softbox("PanoSol", (-4.2, -1.6, 2.4), (0, 0, 1.2), size=(0.6, 3.0), strength=f("sb2", 3), color=SKY)
if f("sb3", 0) > 0: softbox("PanoSag", (3.8, 2.4, 3.2), (0, 0, 1.4), size=(0.5, 2.6), strength=f("sb3", 0))
# Arka ışık panosu: kameraya ve zemin yansımasına görünmez, yalnız camın içinden görünür
softbox("PanoArka", (0.3, 2.2, 1.6), (0.3, -5, 1.6), size=(8.0, 4.4), strength=f("back", 2.0), color=SKY, glossy=False, gradient=1.2)
spot("Dolgu", (-4.0, -6.5, 2.6), (0, 0, 1.0), energy=f("fill", 300), color=SKY, angle=24, blend=1.0, radius=1.2)
if f("fog", 0.04) > 0: fog(density=f("fog", 0.04))

camera((0.3, -11.0, f("camz", 2.2)), (0.25, 0.2, f("tz", 1.3)), lens=f("lens", 46))
render(A.get("o", os.path.join(os.path.dirname(os.path.abspath(__file__)), "out", "hikaye-buyume.png")))
