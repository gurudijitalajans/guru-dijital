"""Ürün uygulama simgesi (3D): renkli cam yuvarlatılmış kare, üstünde beyaz seramik işaret, şeffaf zemin.
   --urun chatbot … (renk ve işaret ürüne göre). Önizleme: --s 64 --pct 50"""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import importlib, g3d; importlib.reload(g3d)
from g3d import *
A = args(); f = lambda k, d: float(A.get(k, d))
sc = reset(1024, 1024, samples=int(A.get("s", 128)), pct=int(A.get("pct", 50)))
sc.render.film_transparent = True
sc.render.image_settings.color_mode = "RGBA"
W = sc.world.node_tree.nodes["Background"]; W.inputs[0].default_value = lin("#cfe6ff"); W.inputs[1].default_value = f("amb", 0.5)

URUN = {
    "chatbot": {"tint": "#2f7be6", "top": "#6fb8ff", "glyph": "g-silhouette.svg", "dots": True},
}[A.get("urun", "chatbot")]

# Cam kare: ince eksen Z, yüz +Z
S, T = 2.0, f("thick", 0.42)
slab = rbox(S, S, T, (0, 0, 0), bevel=f("bevel", 0.46), seg=20, name="Kare")
assign(slab, glass("KareCam", tint=lin("#e6f2ff"), rough=f("rough", 0.06), absorb=lin(URUN["tint"]), density=f("dens", 1.4), disp=0.3))
# Camın içinden görünen alt yüz: hafif gradyanlı parlak zemin (renk derinliği)
bpy.ops.mesh.primitive_plane_add(size=S * 0.9, location=(0, 0, 0.02))
base = bpy.context.object
m = mat("Taban", lin(URUN["tint"]), rough=0.35)
nt = m.node_tree; N = nt.nodes; Lk = nt.links; bsdf = N["Principled BSDF"]
tc = N.new("ShaderNodeTexCoord"); sep = N.new("ShaderNodeSeparateXYZ"); Lk.new(tc.outputs["Object"], sep.inputs[0])
mr = N.new("ShaderNodeMapRange"); mr.inputs["From Min"].default_value = -0.5; mr.inputs["From Max"].default_value = 0.5; Lk.new(sep.outputs["Y"], mr.inputs["Value"])
mix = N.new("ShaderNodeMix"); mix.data_type = "RGBA"; Lk.new(mr.outputs[0], mix.inputs["Factor"])
mix.inputs[6].default_value = lin(URUN.get("bottom", "#1846b8")); mix.inputs[7].default_value = lin(URUN["top"])
Lk.new(mix.outputs[2], bsdf.inputs["Base Color"]); Lk.new(mix.outputs[2], bsdf.inputs["Emission Color"]); bsdf.inputs["Emission Strength"].default_value = f("glow", 0.45)
assign(base, m)

# İşaret: SVG siluet, düz yatar (+Z'ye uzar), kare üstüne oturur
before = set(bpy.data.objects)
bpy.ops.import_curve.svg(filepath=os.path.join(ICONS, URUN["glyph"]))
objs = [o for o in bpy.data.objects if o not in before]
for c in list(bpy.data.collections):
    for o in objs:
        if o.name in c.objects: c.objects.unlink(o)
for o in objs: link(o)
g = objs[0]; cu = g.data
pts = [p.co for sp in cu.splines for p in sp.bezier_points]
mn = Vector((min(p.x for p in pts), min(p.y for p in pts))); mx = Vector((max(p.x for p in pts), max(p.y for p in pts)))
GH = f("gh", 1.18); k = GH / (mx.y - mn.y); cx = (mn.x + mx.x) / 2; cy = (mn.y + mx.y) / 2
for sp in cu.splines:
    sp.use_smooth = True
    for p in sp.bezier_points:
        for at in ("co", "handle_left", "handle_right"):
            v = getattr(p, at); setattr(p, at, Vector(((v.x - cx) * k, (v.y - cy) * k, 0)))
cu.dimensions = "2D"; cu.fill_mode = "BOTH"; cu.resolution_u = 48
GD = f("gd", 0.12); cu.extrude = GD / 2 - 0.025; cu.bevel_depth = 0.025; cu.bevel_resolution = 6
bpy.ops.object.select_all(action="DESELECT"); g.select_set(True); bpy.context.view_layer.objects.active = g
bpy.ops.object.convert(target="MESH")
g.location = (f("gx", 0.03), f("gy", 0.0), T + GD / 2 - 0.01)
assign(g, mat("Seramik", (1.0, 1.0, 1.0, 1), rough=0.22, coat=1.0, spec=0.6, emit=(1, 1, 1, 1), estr=f("white", 0.5)))
if URUN["dots"]:
    # Göz merkezi viewBox'ta (187,264); siluet kutusu 121.8..260.1 × 218.7..357 → nesne koordinatı
    unit = GH / 138.3
    for x_svg in (166, 187, 208):
        x = (x_svg - 190.95) * unit; y = (287.85 - 264) * unit
        bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=6.4 * unit, depth=GD * 3, location=(g.location.x + x, g.location.y + y, g.location.z))
        cyl = bpy.context.object; cyl.display_type = "WIRE"; cyl.hide_render = True
        bm = g.modifiers.new("delik", "BOOLEAN"); bm.operation = "DIFFERENCE"; bm.object = cyl; bm.solver = "EXACT"

# Işık: tepeden geniş pano (yansıma şeridi), sol üstten anahtar, alttan kenar
softbox("Tepe", (-0.6, 1.2, 4.2), (0, 0, 0), size=(3.6, 1.6), strength=f("sb1", 4), gradient=1.4)
if f("sb2", 0) > 0: softbox("Yan", (-3.2, -1.0, 2.0), (0, 0, 0.3), size=(0.8, 3.0), strength=f("sb2", 0), color=SKY)
area("Anahtar", (-2.0, -2.4, 4.0), (0, 0, 0.3), size=(2.4, 2.4), energy=f("key", 260), color=ICE).visible_glossy = False  # kenarda sert parlama çizgisi bırakmasın
area("Arka", (2.4, 2.6, 1.4), (0, 0, 0.3), size=(3.0, 0.4), energy=f("rim", 160), color=SKY)

tilt = math.radians(f("tilt", 14))
camera((0, -math.sin(tilt) * 9, math.cos(tilt) * 9), (0, 0, T * 0.6), lens=f("lens", 140))
render(A.get("o", os.path.join(os.path.dirname(os.path.abspath(__file__)), "out", f"ikon-{A.get('urun', 'chatbot')}.png")))
