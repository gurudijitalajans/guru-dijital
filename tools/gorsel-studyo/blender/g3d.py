"""Guru 3D sahneleri için ortak yardımcılar (Blender 5.2, Cycles/Metal).

Çalıştırma:
  /Applications/Blender.app/Contents/MacOS/Blender -b -noaudio --python hikaye-guru.py -- --s 640 --pct 110 --o out/guru.png
Önizleme: --s 96 --pct 50. Dışa aktarma: python export.py out/guru.png ../../../public/work/<ad>.webp 1000 1600 [yakınlaştırma]
(export.py: opencv-python-headless + numpy + Pillow gerekir). İkonlar: node icons.mjs <proje kökü> icons
Işık dili: lacivert fon + duvarda hale (lit_wall), sağ üstten sisli huzme (spot + fog),
yansıma panoları (softbox) ve camı içten aydınlatan, kameraya görünmez arka pano."""
import bpy, math, sys, os
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", ".."))
MARK = os.path.join(ROOT, "public", "brand", "mark-navy.svg")

def args():
    a = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    o = {}
    for i in range(0, len(a) - 1, 2): o[a[i].lstrip("-")] = a[i + 1]
    return o

def lin(h):
    h = h.lstrip("#"); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c) + (1.0,)

NAVY, DEEP, BLUE, SKY, ICE, PALE = (lin(x) for x in ("#011441", "#12419b", "#3d8bf2", "#9fd2ff", "#d9efff", "#eef4ff"))

def reset(w, h, samples=256, pct=100):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    p = bpy.context.preferences.addons["cycles"].preferences
    p.compute_device_type = "METAL"; p.get_devices()
    for d in p.devices: d.use = d.type == "METAL"
    sc.cycles.device = "GPU"
    sc.cycles.samples = samples
    sc.cycles.use_denoising = True
    sc.cycles.max_bounces = 16; sc.cycles.transmission_bounces = 16; sc.cycles.glossy_bounces = 8
    sc.cycles.caustics_reflective = False; sc.cycles.caustics_refractive = False
    sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = w, h, pct
    sc.render.image_settings.file_format = "PNG"; sc.render.image_settings.color_depth = "16"
    sc.view_settings.view_transform = "AgX"; sc.view_settings.look = "AgX - Medium High Contrast"
    world = bpy.data.worlds.new("W"); sc.world = world; world.use_nodes = True
    world.node_tree.nodes["Background"].inputs[0].default_value = NAVY
    world.node_tree.nodes["Background"].inputs[1].default_value = 0.6
    return sc

def mat(name, base, rough=0.3, metal=0.0, coat=0.0, trans=0.0, ior=1.45, emit=None, estr=0.0, disp=0.0, spec=0.5):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = base
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    b.inputs["Coat Weight"].default_value = coat
    b.inputs["Coat Roughness"].default_value = 0.03
    b.inputs["Transmission Weight"].default_value = trans
    b.inputs["IOR"].default_value = ior
    b.inputs["Specular IOR Level"].default_value = spec
    if "Dispersion" in b.inputs: b.inputs["Dispersion"].default_value = disp
    if emit:
        b.inputs["Emission Color"].default_value = emit; b.inputs["Emission Strength"].default_value = estr
    return m

def glass(name, tint=ICE, rough=0.02, absorb=None, density=0.6, disp=0.2):
    m = mat(name, tint, rough=rough, trans=1.0, ior=1.5, disp=disp)
    if absorb:
        nt = m.node_tree
        v = nt.nodes.new("ShaderNodeVolumeAbsorption")
        v.inputs["Color"].default_value = absorb; v.inputs["Density"].default_value = density
        nt.links.new(v.outputs[0], nt.nodes["Material Output"].inputs["Volume"])
    return m

def link(o):
    if o.name not in bpy.context.scene.collection.objects: bpy.context.scene.collection.objects.link(o)
    return o

def assign(o, m):
    o.data.materials.clear(); o.data.materials.append(m); return o

def mark(height=2.0, depth=0.36, bevel=0.035, res=8, name="Mark"):
    """SVG işaretini içe al, ortala, ayağa kaldır (yüzü -Y), mesh'e çevir."""
    before = set(bpy.data.objects)
    bpy.ops.import_curve.svg(filepath=MARK)
    objs = [o for o in bpy.data.objects if o not in before]
    for c in list(bpy.data.collections):
        for o in objs:
            if o.name in c.objects: c.objects.unlink(o)
    for o in objs: link(o)
    o = objs[0]
    cu = o.data
    pts = [p.co for s in cu.splines for p in s.bezier_points]
    mn = Vector((min(p.x for p in pts), min(p.y for p in pts))); mx = Vector((max(p.x for p in pts), max(p.y for p in pts)))
    s = height / (mx.y - mn.y)
    cx, cy = (mn.x + mx.x) / 2, mn.y
    for sp in cu.splines:
        sp.use_smooth = True
        for p in sp.bezier_points:
            for attr in ("co", "handle_left", "handle_right"):
                v = getattr(p, attr); setattr(p, attr, Vector(((v.x - cx) * s, (v.y - cy) * s, 0)))
    cu.dimensions = "2D"; cu.fill_mode = "BOTH"
    cu.extrude = depth / 2 - bevel; cu.bevel_depth = bevel; cu.bevel_resolution = res; cu.offset = 0
    cu.resolution_u = 48
    o.location = (0, 0, 0); o.scale = (1, 1, 1); o.rotation_euler = (math.radians(90), 0, 0)
    bpy.ops.object.select_all(action="DESELECT"); o.select_set(True); bpy.context.view_layer.objects.active = o
    bpy.ops.object.convert(target="MESH")
    o.name = name
    o.location.z = depth / 2 * 0  # taban z=0
    return o

def plane(size, loc=(0, 0, 0), rot=(0, 0, 0), name="Plane"):
    bpy.ops.mesh.primitive_plane_add(size=size, location=loc, rotation=rot); o = bpy.context.object; o.name = name; return o

def area(name, loc, target, size=(2, 2), energy=500, color=(1, 1, 1), shape="RECTANGLE", visible=False, spread=180):
    d = bpy.data.lights.new(name, "AREA"); d.energy = energy; d.color = color[:3]; d.shape = shape
    d.size, d.size_y = size; d.spread = math.radians(spread)
    o = link(bpy.data.objects.new(name, d)); o.location = loc
    o.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    o.visible_camera = visible
    return o

def spot(name, loc, target, energy=1000, color=(1, 1, 1), angle=40, blend=0.8, radius=0.2):
    d = bpy.data.lights.new(name, "SPOT"); d.energy = energy; d.color = color[:3]
    d.spot_size = math.radians(angle); d.spot_blend = blend; d.shadow_soft_size = radius
    o = link(bpy.data.objects.new(name, d)); o.location = loc
    o.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    return o

def camera(loc, target, lens=85, fstop=None, focus=None, shift=(0, 0)):
    d = bpy.data.cameras.new("Cam"); d.lens = lens; d.shift_x, d.shift_y = shift
    if fstop:
        d.dof.use_dof = True; d.dof.aperture_fstop = fstop; d.dof.focus_distance = focus or (Vector(target) - Vector(loc)).length
    o = link(bpy.data.objects.new("Cam", d)); o.location = loc
    o.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    bpy.context.scene.camera = o
    return o

def cyclorama(back=4.0, front=-20, w=40, h=20, r=5, name="Cyc"):
    """Sonsuz fon: zemin (z=0) + y=back'te kavisle yükselen arka duvar."""
    import bmesh
    prof = [(front, 0)] + [(back - r + r * math.sin(a), r - r * math.cos(a)) for a in [i / 24 * math.pi / 2 for i in range(25)]] + [(back, h)]
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    rows = [[bm.verts.new((x, y, z)) for y, z in prof] for x in (-w / 2, w / 2)]
    for i in range(len(prof) - 1):
        bm.faces.new((rows[0][i], rows[1][i], rows[1][i + 1], rows[0][i + 1]))
    bm.normal_update(); bm.to_mesh(me); bm.free()
    o = link(bpy.data.objects.new(name, me))
    for p in o.data.polygons: p.use_smooth = True
    return o

def render(path):
    sc = bpy.context.scene; sc.render.filepath = path
    bpy.ops.render.render(write_still=True)

def glow(name, loc, sx, sy, color, strength=4.0, power=2.0, rot=(math.radians(90), 0, 0), camera=True):
    """Yumuşak kenarlı ışık lekesi (CSS radial-gradient karşılığı): düzlem, eliptik düşüş."""
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc, rotation=rot)
    o = bpy.context.object; o.name = name; o.scale = (sx, sy, 1)
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; L = nt.links
    N.clear()
    tc = N.new("ShaderNodeTexCoord"); mp = N.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (2, 2, 2)
    gr = N.new("ShaderNodeTexGradient"); gr.gradient_type = "SPHERICAL"
    pw = N.new("ShaderNodeMath"); pw.operation = "POWER"; pw.inputs[1].default_value = power
    em = N.new("ShaderNodeEmission"); em.inputs["Color"].default_value = color; em.inputs["Strength"].default_value = strength
    tr = N.new("ShaderNodeBsdfTransparent"); mx = N.new("ShaderNodeMixShader"); out = N.new("ShaderNodeOutputMaterial")
    L.new(tc.outputs["Object"], mp.inputs["Vector"]); L.new(mp.outputs[0], gr.inputs[0]); L.new(gr.outputs["Fac"], pw.inputs[0])
    L.new(pw.outputs[0], mx.inputs[0]); L.new(tr.outputs[0], mx.inputs[1]); L.new(em.outputs[0], mx.inputs[2]); L.new(mx.outputs[0], out.inputs[0])
    o.data.materials.append(m)
    o.visible_camera = camera; o.visible_diffuse = False; o.visible_shadow = False
    return o

def lit_wall(base=NAVY, rough=0.35, spots=(), spec=0.4, wall_rough=None):
    """Fon malzemesi + dünya koordinatında yumuşak ışık lekeleri (eğrilikle uyumlu, kesik kenar yok).
    spots: (merkez, yarıçaplar(x,y,z), renk, güç, üs, z-ekseni dönüş derecesi XZ düzleminde)"""
    m = mat("Fon", base, rough=rough, spec=spec); nt = m.node_tree; N = nt.nodes; L = nt.links
    bsdf = N["Principled BSDF"]
    tc = N.new("ShaderNodeTexCoord")
    if wall_rough is not None:
        # Zemin parlak, duvar mat: pürüzlülük yüksekliğe göre (softbox duvarda yansımasın)
        sep = N.new("ShaderNodeSeparateXYZ"); L.new(tc.outputs["Object"], sep.inputs[0])
        mr = N.new("ShaderNodeMapRange"); mr.inputs["From Min"].default_value = 0.02; mr.inputs["From Max"].default_value = 0.8
        mr.inputs["To Min"].default_value = rough; mr.inputs["To Max"].default_value = wall_rough
        L.new(sep.outputs["Z"], mr.inputs["Value"]); L.new(mr.outputs[0], bsdf.inputs["Roughness"])
    total = None
    for c, r, col, strength, power, ang in spots:
        sub = N.new("ShaderNodeVectorMath"); sub.operation = "SUBTRACT"; sub.inputs[1].default_value = c
        L.new(tc.outputs["Object"], sub.inputs[0])
        v = sub.outputs[0]
        if ang:
            rot = N.new("ShaderNodeVectorRotate"); rot.rotation_type = "Y_AXIS"; rot.inputs["Angle"].default_value = math.radians(ang)
            L.new(v, rot.inputs["Vector"]); v = rot.outputs[0]
        sc = N.new("ShaderNodeVectorMath"); sc.operation = "MULTIPLY"; sc.inputs[1].default_value = tuple(1 / x for x in r)
        L.new(v, sc.inputs[0])
        ln = N.new("ShaderNodeVectorMath"); ln.operation = "LENGTH"; L.new(sc.outputs[0], ln.inputs[0])
        inv = N.new("ShaderNodeMapRange"); inv.inputs["To Min"].default_value = 1; inv.inputs["To Max"].default_value = 0
        L.new(ln.outputs["Value"], inv.inputs["Value"])
        pw = N.new("ShaderNodeMath"); pw.operation = "POWER"; pw.inputs[1].default_value = power; L.new(inv.outputs[0], pw.inputs[0])
        k = N.new("ShaderNodeMath"); k.operation = "MULTIPLY"; k.inputs[1].default_value = strength; L.new(pw.outputs[0], k.inputs[0])
        cm = N.new("ShaderNodeMix"); cm.data_type = "RGBA"; cm.blend_type = "MIX"
        cm.inputs["Factor"].default_value = 1.0; cm.inputs[7].default_value = col
        cmul = N.new("ShaderNodeVectorMath"); cmul.operation = "SCALE"
        L.new(cm.outputs[2], cmul.inputs[0]); L.new(k.outputs[0], cmul.inputs["Scale"])
        if total is None: total = cmul.outputs[0]
        else:
            add = N.new("ShaderNodeVectorMath"); add.operation = "ADD"; L.new(total, add.inputs[0]); L.new(cmul.outputs[0], add.inputs[1]); total = add.outputs[0]
    if total is not None:
        L.new(total, bsdf.inputs["Emission Color"]); bsdf.inputs["Emission Strength"].default_value = 1.0
    return m

ICONS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "icons")

def icon(name, size=1.0, tube=0.045):
    """Lucide çizgi ikonu → yuvarlak boru (24 birimlik kutu size'a ölçeklenir, ortalanır, XY düzleminde)."""
    before = set(bpy.data.objects)
    bpy.ops.import_curve.svg(filepath=os.path.join(ICONS, f"{name}.svg"))
    objs = [o for o in bpy.data.objects if o not in before]
    for c in list(bpy.data.collections):
        for o in objs:
            if o.name in c.objects: c.objects.unlink(o)
    for o in objs: link(o)
    allp = [p.co for o in objs for s in o.data.splines for p in (s.bezier_points if s.type == "BEZIER" else s.points)]
    mn = Vector((min(p.x for p in allp), min(p.y for p in allp))); mx = Vector((max(p.x for p in allp), max(p.y for p in allp)))
    # lucide kutusu 24 birim: ikonun kendi sınırlarından değil, kutudan ölçekle (ikonlar aynı görsel boyda kalsın)
    unit = max(mx.x - mn.x, mx.y - mn.y) / 20.0
    s = size / (24 * unit); c = (mn + mx) / 2
    for o in objs:
        cu = o.data; cu.dimensions = "3D"; cu.fill_mode = "FULL"; cu.bevel_depth = tube / s; cu.bevel_resolution = 6
        cu.use_fill_caps = True; cu.resolution_u = 24
        for sp in cu.splines: sp.use_smooth = True
        o.location = (-c.x * s, -c.y * s, 0); o.scale = (s, s, s)
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs: o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.convert(target="MESH")
    bpy.ops.object.join()
    o = bpy.context.object; o.name = f"ikon-{name}"
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    return o

def rbox(sx, sy, sz, loc, bevel=0.12, seg=10, name="Kutu"):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(loc[0], loc[1], loc[2] + sz / 2))
    o = bpy.context.object; o.name = name; o.scale = (sx, sy, sz)
    bpy.ops.object.transform_apply(scale=True)
    b = o.modifiers.new("b", "BEVEL"); b.width = bevel; b.segments = seg; b.limit_method = "NONE"
    bpy.ops.object.shade_smooth()
    return o

def fog(size=(30, 30, 16), center=(0, 0, 4), density=0.02, color=None, aniso=0.55):
    """Sahne sisi: spot ışıkları görünür huzme olur, siyahlar laciverte kalkar."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=center)
    o = bpy.context.object; o.name = "Sis"; o.scale = size
    m = bpy.data.materials.new("Sis"); m.use_nodes = True; nt = m.node_tree; N = nt.nodes
    N.remove(N["Principled BSDF"])
    v = N.new("ShaderNodeVolumePrincipled")
    v.inputs["Density"].default_value = density
    v.inputs["Color"].default_value = color or (0.75, 0.85, 1.0, 1)
    v.inputs["Anisotropy"].default_value = aniso
    nt.links.new(v.outputs[0], N["Material Output"].inputs["Volume"])
    o.data.materials.append(m)
    o.visible_shadow = False
    return o

def softbox(name, loc, target, size=(3, 1), strength=6.0, color=ICE, glossy=True, gradient=None):
    """Kameraya görünmeyen, yansımada uzun temiz parlama veren emisyon panosu."""
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc)
    o = bpy.context.object; o.name = name; o.scale = (size[0], size[1], 1)
    o.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("Z", "Y").to_euler()
    m = bpy.data.materials.new(name); m.use_nodes = True; N = m.node_tree.nodes
    N.remove(N["Principled BSDF"]); e = N.new("ShaderNodeEmission")
    e.inputs["Color"].default_value = color; e.inputs["Strength"].default_value = strength
    m.node_tree.links.new(e.outputs[0], N["Material Output"].inputs["Surface"])
    o.data.materials.append(m)
    if gradient:
        # Dikey yumuşak düşüş: panonun ortası parlak, kenarlar sönük (cam içinde sert kenar olmasın)
        tc = N.new("ShaderNodeTexCoord"); mp = N.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (2, 2, 2)
        gr = N.new("ShaderNodeTexGradient"); gr.gradient_type = "SPHERICAL"
        pw = N.new("ShaderNodeMath"); pw.operation = "POWER"; pw.inputs[1].default_value = gradient
        mul = N.new("ShaderNodeMath"); mul.operation = "MULTIPLY"; mul.inputs[1].default_value = strength
        L = m.node_tree.links
        L.new(tc.outputs["Object"], mp.inputs[0]); L.new(mp.outputs[0], gr.inputs[0]); L.new(gr.outputs["Fac"], pw.inputs[0])
        L.new(pw.outputs[0], mul.inputs[0]); L.new(mul.outputs[0], e.inputs["Strength"])
    o.visible_camera = False; o.visible_diffuse = False; o.visible_shadow = False; o.visible_volume_scatter = False
    o.visible_glossy = glossy
    return o

def profile_solid(pts2d, thick, bevel=0.04, name="Profil", res=6):
    """XZ düzleminde kapalı çokgen (x,z) → Y yönünde 'thick' kalınlıkta, kenarları yuvarlatılmış katı."""
    cu = bpy.data.curves.new(name, "CURVE"); cu.dimensions = "2D"; cu.fill_mode = "BOTH"
    sp = cu.splines.new("POLY"); sp.points.add(len(pts2d) - 1)
    for p, (x, z) in zip(sp.points, pts2d): p.co = (x, z, 0, 1)
    sp.use_cyclic_u = True; sp.use_smooth = True
    cu.extrude = thick / 2 - bevel; cu.bevel_depth = bevel; cu.bevel_resolution = res
    o = link(bpy.data.objects.new(name, cu)); o.rotation_euler = (math.radians(90), 0, 0)
    bpy.ops.object.select_all(action="DESELECT"); o.select_set(True); bpy.context.view_layer.objects.active = o
    bpy.ops.object.convert(target="MESH")
    return bpy.context.object

def column(r, h, loc, top_round=0.9, bottom_round=0.06, verts=128, name="Sutun"):
    """Silindir sütun: üstü yuvarlak kubbe, tabanı hafif yuvarlatılmış (bevel ağırlığıyla)."""
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=h, location=(loc[0], loc[1], loc[2] + h / 2))
    o = bpy.context.object; o.name = name; me = o.data
    at = me.attributes.get("bevel_weight_edge") or me.attributes.new("bevel_weight_edge", "FLOAT", "EDGE")
    zt, zb = h / 2, -h / 2
    for e in me.edges:
        z0, z1 = me.vertices[e.vertices[0]].co.z, me.vertices[e.vertices[1]].co.z
        if abs(z0 - zt) < 1e-4 and abs(z1 - zt) < 1e-4: at.data[e.index].value = 1.0
        elif abs(z0 - zb) < 1e-4 and abs(z1 - zb) < 1e-4: at.data[e.index].value = bottom_round / top_round
    b = o.modifiers.new("b", "BEVEL"); b.limit_method = "WEIGHT"; b.width = r * top_round; b.segments = 18
    b.harden_normals = False
    bpy.ops.object.shade_smooth()
    return o
