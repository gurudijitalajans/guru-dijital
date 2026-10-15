"""Marka Tescil hero: cam kum saati, alt haznede mavi kum ve kumdan ® (Guru'nun kampanya görselinin
fikri), lacivert stüdyoda (Hikâyemiz ışık dili). Çıktı 1600x1000 oranında."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import importlib, g3d; importlib.reload(g3d)
from g3d import *
import bmesh
A = args(); f = lambda k, d: float(A.get(k, d))
sc = reset(1600, 1000, samples=int(A.get("s", 128)), pct=int(A.get("pct", 50)))
sc.cycles.volume_bounces = 1
sc.world.node_tree.nodes["Background"].inputs[1].default_value = f("amb", 0.08)
BACK = 7.0; H = f("halo", 1.0)
spots = [
    ((1.6, BACK, 2.4), (5.5, 9, 4.2), lin("#1747a8"), 0.55 * H, 1.5, 0),
    ((1.7, BACK, 2.4), (2.4, 9, 2.6), BLUE, 0.45 * H, 2.0, 0),
    ((0, -2, 0), (7, 6, 9), lin("#12419b"), 0.05 * H, 2.0, 0),
]
assign(cyclorama(back=BACK, r=4.5), lit_wall(NAVY, rough=f("floor", 0.16), spots=spots, wall_rough=0.7))
OX = f("ox", 1.55)

# Kum saati: profil (r, z) → çevrilerek cam gövde
def lathe(profile, name, seg=160):
    """Profil eksene (r=0) değen uçlarda tek noktaya sıkışmaz: uçlar düz çokgen kapakla kapanır (yıldız parlama olmasın)."""
    pts = [(r, z) for r, z in profile if r > 1e-6]
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    rings = [[bm.verts.new((r * math.cos(2 * math.pi * k / seg), r * math.sin(2 * math.pi * k / seg), z)) for r, z in pts] for k in range(seg)]
    for k in range(seg):
        r0, r1 = rings[k], rings[(k + 1) % seg]
        for i in range(len(pts) - 1):
            bm.faces.new((r0[i], r1[i], r1[i + 1], r0[i + 1]))
    caps = []
    if profile[0][0] <= 1e-6: caps.append(bm.faces.new([rings[k][0] for k in range(seg)]))
    if profile[-1][0] <= 1e-6: caps.append(bm.faces.new([rings[k][-1] for k in range(seg)]))
    bm.normal_update(); bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    for f_ in bm.faces: f_.smooth = f_ not in caps
    bm.to_mesh(me); bm.free()
    return link(bpy.data.objects.new(name, me))

# Klasik profil: kontrol noktaları (z, r) alt yarı; üst yarı aynası. Catmull-Rom ile yumuşatılır.
Hh = 4.2
CTRL = [(0.0, 0.92), (0.10, 1.10), (0.45, 1.27), (0.85, 1.22), (1.25, 0.95), (1.62, 0.52), (1.90, 0.20), (2.06, 0.115), (2.10, 0.11)]
def cr(p0, p1, p2, p3, t):
    return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3)
def half(n=24):
    pts = []; P = [CTRL[0]] + CTRL + [CTRL[-1]]
    for i in range(1, len(P) - 2):
        for k in range(n):
            t = k / n
            pts.append((cr(P[i - 1][0], P[i][0], P[i + 1][0], P[i + 2][0], t), cr(P[i - 1][1], P[i][1], P[i + 1][1], P[i + 2][1], t)))
    return pts + [CTRL[-1]]
LOW = half()
def radius_at(z):  # alt yarıda z için iç yarıçap
    zz = z if z <= Hh / 2 else Hh - z
    for (z0, r0), (z1, r1) in zip(LOW, LOW[1:]):
        if z0 <= zz <= z1: return r0 + (r1 - r0) * (zz - z0) / max(z1 - z0, 1e-6)
    return LOW[-1][1]
prof = [(0.0, 0.0)] + [(r, z) for z, r in LOW] + [(r, Hh - z) for z, r in reversed(LOW)] + [(0.0, Hh)]
glass_o = lathe(prof, "KumSaati")
sol = glass_o.modifiers.new("s", "SOLIDIFY"); sol.thickness = 0.03; sol.offset = 1
assign(glass_o, glass("Cam", tint=PALE, rough=0.0, absorb=lin("#9fd2ff"), density=0.12, disp=0.4))
glass_o.location = (OX, 0, 0)
glass_o.visible_shadow = False  # içerideki kum ve ® ışık alsın (kostik kapalıyken cam tam gölge düşürür)

# Kum: haznenin iç duvarına oturan döner gövdeler (alt tepe, üst huni), parlak kral mavisi, ince pürüz
sand = mat("Kum", lin(A.get("sand", "#2f6cff")), rough=0.9, spec=0.25)
nt = sand.node_tree; b = nt.nodes["Principled BSDF"]
nz = nt.nodes.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 700; nz.inputs["Detail"].default_value = 2
bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = 0.4
nt.links.new(nz.outputs["Fac"], bp.inputs["Height"]); nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
b.inputs["Sheen Weight"].default_value = 0.8; b.inputs["Sheen Tint"].default_value = lin("#bfe0ff")
b.inputs["Emission Color"].default_value = lin("#2f6cff"); b.inputs["Emission Strength"].default_value = f("glow", 0.12)
INSET = 0.975
z_fill = f("fill", 0.55); z_peak = z_fill + f("peak", 0.32)
lowsand = [(0.0, z_peak)] + [(radius_at(z_fill) * INSET * (i / 12), z_peak - (z_peak - z_fill) * (i / 12) ** 1.4) for i in range(1, 13)]
lowsand += [(radius_at(z) * INSET, z) for z in [z_fill - k * (z_fill - 0.05) / 16 for k in range(1, 17)]] + [(0.0, 0.05)]
o = lathe(lowsand, "KumAlt"); o.location = (OX, 0, 0); assign(o, sand)
z_top = f("topfill", 3.05)
topsand = [(0.0, Hh / 2 + 0.02)] + [(radius_at(z) * INSET, z) for z in [Hh / 2 + 0.02 + k * (z_top - Hh / 2 - 0.02) / 16 for k in range(1, 17)]]
topsand += [(radius_at(z_top) * INSET * (1 - i / 12), z_top - 0.22 * (1 - (1 - i / 12) ** 2)) for i in range(1, 13)]
o = lathe(topsand, "KumUst"); o.location = (OX, 0, 0); assign(o, sand)
bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.02, depth=Hh / 2 - z_peak + 0.1, location=(OX, 0, (Hh / 2 + z_peak) / 2))
assign(bpy.context.object, sand)

# ®: kalın halka + Outfit SemiBold "R", kumdan
RS = f("rs", 0.66); RZ = f("rz", 0.5)
bpy.ops.mesh.primitive_torus_add(major_radius=RS, minor_radius=0.1, major_segments=160, minor_segments=24, location=(OX, -0.05, RZ + RS * 0.82), rotation=(math.radians(90), 0, 0))
ring = bpy.context.object; ring.scale = (1, 1, 1.9); bpy.ops.object.shade_smooth()
assign(ring, sand)
cu = bpy.data.curves.new("R", "FONT"); cu.body = "R"
cu.font = bpy.data.fonts.load(os.path.join(ROOT, "src", "fonts", "Outfit-SemiBold.ttf"))
cu.size = RS * 1.45; cu.extrude = 0.13; cu.bevel_depth = 0.012; cu.align_x = "CENTER"; cu.align_y = "CENTER"
r_o = link(bpy.data.objects.new("R", cu)); r_o.location = (OX + 0.02, -0.05, RZ + RS * 0.82); r_o.rotation_euler = (math.radians(90), 0, 0)
assign(r_o, sand)
for o in (ring, r_o): o.rotation_euler.z = math.radians(f("rrot", -12))

# Işık: huzme, yansıma panoları, cam için arka pano
spot("Huzme", (OX + 3.6, 1.4, 9.0), (OX, 0.1, 1.6), energy=f("beam", 22000), color=ICE, angle=f("bang", 12), blend=0.35, radius=0.15)
softbox("PanoUst", (OX + 0.4, -1.4, 6.0), (OX, 0, 2.0), size=(4.0, 1.0), strength=f("sb1", 5))
softbox("PanoSol", (OX - 3.4, -1.8, 2.4), (OX, 0, 2.0), size=(0.6, 4.4), strength=f("sb2", 4), color=SKY)
softbox("PanoSag", (OX + 3.0, 1.8, 3.6), (OX, 0, 2.2), size=(0.5, 3.0), strength=f("sb3", 6))
softbox("PanoArka", (OX, 2.4, 2.1), (OX, -5, 2.1), size=(4.0, 5.0), strength=f("back", 1.4), color=SKY, glossy=False, gradient=1.3)
spot("Dolgu", (OX - 4.0, -6.5, 2.6), (OX, 0, 1.0), energy=f("fill2", 500), color=SKY, angle=26, blend=1.0, radius=1.4)
spot("KumIsigi", (OX - 1.5, -4.5, 5.5), (OX, 0, 1.3), energy=f("sandkey", 1800), color=ICE, angle=18, blend=1.0, radius=1.0)
if f("fog", 0.04) > 0: fog(density=f("fog", 0.04))

camera((0.15, -10.2, f("camz", 2.3)), (0.4, 0, f("tz", 2.0)), lens=f("lens", 42))
render(A.get("o", os.path.join(os.path.dirname(os.path.abspath(__file__)), "out", "tescil.png")))
