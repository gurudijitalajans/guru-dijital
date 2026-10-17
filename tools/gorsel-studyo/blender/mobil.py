"""Mobil Uygulama: iPhone ve Android 3B (titanyum ve grafit kasa, cam ön yüz, ekranda örnek uygulama dokusu),
lacivert stüdyoda (Hikâyemiz ışık dili). Sahne: --scene hero | kapak | tek. Ekran dokuları:
out/ekran-mobil2-*.png (render.mjs, DPR=3).
  Blender -b -noaudio --python mobil.py -- --scene hero --s 96 --pct 50 --o out/mobil-hero.png"""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import importlib, g3d; importlib.reload(g3d)
from g3d import *

A = args(); f = lambda k, d: float(A.get(k, d))
SCENE = A.get("scene", "hero")
SIZES = {"hero": (1600, 1000), "kapak": (1200, 1500), "tek": (900, 1500)}
W, H = SIZES[SCENE]
sc = reset(W, H, samples=int(A.get("s", 128)), pct=int(A.get("pct", 50)))
sc.cycles.volume_bounces = 1
sc.world.node_tree.nodes["Background"].inputs[1].default_value = f("amb", 0.08)
SCR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "out")

def rr(w, h, r, n=14):
    """Köşeleri yuvarlatılmış dikdörtgen (merkezde), saat yönünün tersine noktalar."""
    pts = []
    for cx, cz, a0 in ((w / 2 - r, h / 2 - r, 0), (-w / 2 + r, h / 2 - r, 90), (-w / 2 + r, -h / 2 + r, 180), (w / 2 - r, -h / 2 + r, 270)):
        for i in range(n + 1):
            a = math.radians(a0 + 90 * i / n)
            pts.append((cx + r * math.cos(a), cz + r * math.sin(a)))
    return pts

def screen_mat(name, img):
    """Ekran: görüntü dokusu ışık verir, üstünde ince parlak cam katmanı (yansımalar)."""
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; L = nt.links
    b = N["Principled BSDF"]
    b.inputs["Base Color"].default_value = (0, 0, 0, 1); b.inputs["Roughness"].default_value = 0.05; b.inputs["Specular IOR Level"].default_value = f("spec", 0.5)
    b.inputs["Coat Weight"].default_value = f("coat", 0.35); b.inputs["Coat Roughness"].default_value = 0.02
    tx = N.new("ShaderNodeTexImage"); tx.image = bpy.data.images.load(img); tx.interpolation = "Cubic"
    uv = N.new("ShaderNodeUVMap"); uv.uv_map = "UV"; L.new(uv.outputs["UV"], tx.inputs["Vector"])  # UV: unwrap() ekranın sınır kutusundan
    bc = N.new("ShaderNodeBrightContrast"); bc.inputs["Contrast"].default_value = f("con", 0.22); bc.inputs["Bright"].default_value = f("bri", -0.02)
    L.new(tx.outputs["Color"], bc.inputs["Color"]); L.new(bc.outputs[0], b.inputs["Emission Color"])
    b.inputs["Emission Strength"].default_value = f("scr", 1.0)
    return m

def unwrap(o):
    """Düz levhanın yerel XY sınır kutusundan UV (görüntü ekranı tam kaplar)."""
    me = o.data; xs = [v.co.x for v in me.vertices]; ys = [v.co.y for v in me.vertices]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    for l in list(me.uv_layers): me.uv_layers.remove(l)
    uvl = me.uv_layers.new(name="UV"); me.uv_layers.active = uvl; uvl.active_render = True
    for lp in me.loops:
        c = me.vertices[lp.vertex_index].co
        uvl.data[lp.index].uv = ((c.x - x0) / (x1 - x0), (c.y - y0) / (y1 - y0))

def phone(kind, img, loc, yaw=0.0, tilt=0.0, scale=1.0):
    """Gövde XZ düzleminde ayakta, ön yüz -Y'ye bakar. kind: ios | android"""
    w, h, t = (0.715, 1.47, 0.082) if kind == "ios" else (0.70, 1.50, 0.085)
    rad = 0.115 if kind == "ios" else 0.085
    parts = []
    frame = profile_solid(rr(w, h, rad), t, bevel=0.03 if kind == "ios" else 0.018, name=f"{kind}-kasa", res=8)
    frame_col = lin("#a7acb5") if kind == "ios" else lin("#3a3e46")
    assign(frame, mat(f"{kind}-kasa", frame_col, rough=0.22 if kind == "ios" else 0.3, metal=1.0))
    parts.append(frame)
    # Ön cam (siyah çerçeve): kasanın ön yüzüne yapışık ince levha
    bez = 0.012
    front = profile_solid(rr(w - bez * 2, h - bez * 2, rad - bez), 0.004, bevel=0.0015, name=f"{kind}-cam")
    front.location.y = -t / 2 - 0.001
    assign(front, mat(f"{kind}-cam", lin("#050608"), rough=0.04, coat=1.0))
    parts.append(front)
    # Ekran: siyah çerçevenin içinde, görüntü dokulu
    sb = 0.022 if kind == "ios" else 0.016
    sw, sh = w - bez * 2 - sb * 2, h - bez * 2 - sb * 2
    scr = profile_solid(rr(sw, sh, rad - bez - sb + 0.01), 0.002, bevel=0.0, name=f"{kind}-ekran", res=2)
    scr.location.y = -t / 2 - 0.0035
    unwrap(scr)
    assign(scr, screen_mat(f"{kind}-ekran", img))
    parts.append(scr)
    # Kamera: iOS'ta dinamik ada, Android'de delik
    if kind == "ios":
        isl = profile_solid(rr(0.19, 0.055, 0.0275), 0.002, bevel=0.0, name="ada", res=2)
        isl.location = (0, -t / 2 - 0.005, sh / 2 - 0.05)
    else:
        isl = profile_solid(rr(0.034, 0.034, 0.017), 0.002, bevel=0.0, name="delik", res=2)
        isl.location = (0, -t / 2 - 0.005, sh / 2 - 0.035)
    assign(isl, mat("kamera", lin("#020203"), rough=0.1, coat=1.0))
    parts.append(isl)
    # Yan tuşlar
    for z0, ln in ((0.22, 0.16), (0.42, 0.09)) if kind == "ios" else ((0.25, 0.2), (0.48, 0.1)):
        bt = rbox(0.012, 0.03, ln, (w / 2 + 0.003, 0, z0), bevel=0.005, seg=4, name="tus")
        assign(bt, mat("tus", frame_col, rough=0.25, metal=1.0)); parts.append(bt)
    # Ebeveyn boş nesneye bağla, konumla
    e = bpy.data.objects.new(f"{kind}-telefon", None); link(e)
    for p in parts: p.parent = e
    e.location = (loc[0], loc[1], loc[2] + h / 2 * scale); e.rotation_euler = (math.radians(tilt), 0, math.radians(yaw)); e.scale = (scale,) * 3
    return e

BACK = 7.0; HAL = f("halo", 1.0)
spots = [
    ((2.2, BACK, 3.0), (6.5, 9, 4.6), lin("#2a4fd0"), 0.55 * HAL, 1.5, 0),
    ((2.4, BACK, 2.8), (2.8, 9, 2.8), BLUE, 0.4 * HAL, 2.0, 0),
    ((0, -2, 0), (7, 6, 9), lin("#12419b"), 0.05 * HAL, 2.0, 0),
]
if SCENE != "tek":
    assign(cyclorama(back=BACK, r=4.5), lit_wall(NAVY, rough=f("floor", 0.14), spots=spots, wall_rough=0.7))
else:
    sc.render.film_transparent = True  # tek telefon: saydam zemin, HTML karesine yerleşir

IOS = os.path.join(SCR, "ekran-mobil2-ios.png"); AND = os.path.join(SCR, "ekran-mobil2-android.png")
S = f("ps", 2.0)  # telefon ölçeği (sahne birimi)
if SCENE == "hero":
    OX = f("ox", 1.25)
    phone("android", AND, (OX + 1.25, 0.7, 0), yaw=f("ya", -18), scale=S)
    phone("ios", IOS, (OX - 0.2, -0.2, 0), yaw=f("yi", 14), scale=S * 1.06)
    tgt = (OX + 0.5, 0, 1.5)
    softbox("PanoUst", (OX, -2.4, 5.2), tgt, size=(4.0, 1.2), strength=f("sb1", 4))
    softbox("PanoSol", (OX - 3.2, -2.6, 2.2), tgt, size=(0.7, 4.0), strength=f("sb2", 3.2), color=SKY)
    softbox("PanoSag", (OX + 3.4, -1.2, 2.6), tgt, size=(0.6, 3.6), strength=f("sb3", 4.5))
    area("Anahtar", (OX - 2.0, -4.0, 4.0), tgt, size=(3, 3), energy=f("key", 260), color=ICE)
    if f("fog", 0.012) > 0: fog(density=f("fog", 0.012))
    camera((f("cx", 0.2), -9.0, f("camz", 1.9)), (f("tx", 0.75), 0, f("tz", 1.5)), lens=f("lens", 44))
elif SCENE == "kapak":
    phone("android", AND, (0.55, 0.45, 0), yaw=-12, scale=S)
    phone("ios", IOS, (-0.45, -0.2, 0), yaw=10, scale=S * 1.06)
    tgt = (0, 0, 1.2)
    softbox("PanoUst", (0, -2.4, 5.2), tgt, size=(4.0, 1.2), strength=f("sb1", 4))
    softbox("PanoSol", (-3.0, -2.6, 2.2), tgt, size=(0.7, 4.0), strength=f("sb2", 3.2), color=SKY)
    softbox("PanoSag", (3.2, -1.2, 2.6), tgt, size=(0.6, 3.6), strength=f("sb3", 4.5))
    area("Anahtar", (-2.0, -4.0, 4.0), tgt, size=(3, 3), energy=f("key", 260), color=ICE)
    if f("fog", 0.035) > 0: fog(density=f("fog", 0.035))
    camera((0, -9.0, f("camz", 2.6)), (0, 0, f("tz", 2.15)), lens=f("lens", 44))

elif SCENE == "tek":
    img = os.path.join(SCR, f"ekran-mobil2-{A.get('img', 'ios')}.png")
    kind = A.get("kind", "ios")
    phone(kind, img, (0, 0, 0), yaw=f("yaw", 12), scale=S)
    tgt = (0, 0, 1.5)
    softbox("PanoUst", (0, -2.4, 5.2), tgt, size=(4.0, 1.2), strength=f("sb1", 4))
    softbox("PanoSol", (-3.0, -2.6, 2.2), tgt, size=(0.7, 4.0), strength=f("sb2", 3.2), color=SKY)
    softbox("PanoSag", (3.2, -1.2, 2.6), tgt, size=(0.6, 3.6), strength=f("sb3", 4.5))
    area("Anahtar", (-2.0, -4.0, 4.0), tgt, size=(3, 3), energy=f("key", 260), color=ICE)
    sc.world.node_tree.nodes["Background"].inputs[0].default_value = lin("#1b2a6b")
    sc.world.node_tree.nodes["Background"].inputs[1].default_value = f("amb", 0.5)
    camera((0, -9.0, 1.5), (0, 0, 1.5), lens=f("lens", 70))

render(A.get("o", os.path.join(os.path.dirname(os.path.abspath(__file__)), "out", f"mobil-{SCENE}.png")))
