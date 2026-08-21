"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * AuroraCanvas — ham WebGL (three.js yok) fragment shader aurora arka planı.
 *
 * - 3 oktav simplex fbm + domain warp ile koyu zeminde çok yavaş akan
 *   aurora perdeleri; palet siyah → koyu teal → guru-deep → marka yeşili
 *   (#10d86c). Kenarlar vinyet ile koyulaşır, dither ile banding kırılır.
 * - interactive: fare pozisyonu lerp ile yumuşak gecikmeli akar, aurora'yı
 *   lokal büker/parlatır; son 5 fare noktası exp-blend metaball alanı olarak
 *   "gooey" bir iz bırakır.
 * - HYDRATION GÜVENLİĞİ: ilk render'da HERKESE statik CSS fallback div
 *   basılır (SSR = istemci ilk kare). WebGL yalnız mount sonrası, ince
 *   işaretçi + motion-serbest + WebGL destekli ortamda state ile açılır.
 * - Performans: DPR ≤ 1.5, ResizeObserver, IntersectionObserver ile ekran
 *   dışında rAF durur, karede alloc yok (önceden ayrılmış Float32Array).
 * - webglcontextlost → preventDefault + döngü durur; restored → program ve
 *   buffer yeniden kurulur. Cleanup'ta program/buffer silinir ve
 *   WEBGL_lose_context varsa loseContext çağrılır.
 */

export type AuroraCanvasProps = {
  className?: string;
  /** Genel parlaklık ölçeği (0–1). Varsayılan: 0.6 */
  intensity?: number;
  /** Fare bükmesi + gooey metaball izi. Varsayılan: true */
  interactive?: boolean;
};

const TRAIL_COUNT = 5;

/* Basit fullscreen üçgen — vertex başına yalnız clip-space pozisyon. */
const VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

/*
 * Fragment shader: simplex gürültü (Ashima türevi) + fbm, domain warp ile
 * perde biçimi; fare gauss etkisiyle lokal bükme/parlatma; u_trail exp-blend
 * metaball alanı; vinyet, yoğunluk ölçeği ve zamansal dither.
 */
const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform float u_time;
uniform vec2  u_res;
uniform vec2  u_mouse;                 // 0–1 normalize, y yukarı
uniform vec3  u_trail[${TRAIL_COUNT}]; // xy: 0–1 konum, z: güç (0–1)
uniform float u_intensity;             // 0–1 parlaklık ölçeği

/* ---- 2D simplex gürültü (Ashima Arts, kamu malı türev) ---- */
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

/* 3 oktav fbm — perde dokusu için yeterli, ucuz. */
float fbm(vec2 p) {
  float f = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    f += a * snoise(p);
    p = p * 2.03 + vec2(19.7, -7.3);
    a *= 0.5;
  }
  return f;
}

/* Dither için hızlı hash. */
float hash12(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  vec2 st = gl_FragCoord.xy / u_res;        // 0–1 ekran uzayı
  float aspect = u_res.x / max(u_res.y, 1.0);
  vec2 p = vec2(st.x * aspect, st.y);       // en-boy düzeltmeli uzay
  float t = u_time * 0.05;                  // çok yavaş zaman akışı

  /* Fare: gauss etki alanı — hem bükme hem parlatma için. */
  vec2 m = vec2(u_mouse.x * aspect, u_mouse.y);
  float md = distance(p, m);
  float minf = exp(-md * md * 7.0);

  /* Domain warp: q alanı perdeleri sürükler, fare lokal olarak büker. */
  vec2 wp = p * 1.35;
  vec2 q = vec2(
    fbm(wp + vec2(0.0, t * 0.9)),
    fbm(wp + vec2(4.7, -t * 0.6))
  );
  wp += (m - p) * minf * 0.5;
  float f = fbm(wp + q * 1.4 + vec2(t * 0.55, -t * 0.3));

  /* Perde bantları + geniş silik arka yıkama (derinlik hissi). */
  float curtain = smoothstep(-0.35, 0.9, f);
  curtain *= curtain;
  float wash = smoothstep(0.1, 1.0, fbm(p * 0.55 + vec2(t * 0.35, t * 0.2))) * 0.22;

  /* Dikey şekillendirme: üstte yoğun, alta doğru süzülür. */
  float veil = mix(0.4, 1.0, smoothstep(0.05, 0.95, st.y));

  /* Palet: siyah → koyu teal → guru-deep (#0ba955) → guru (#10d86c).
     Teal'in G kanalı B'den belirgin yüksek — cyan/mora kayma yok. */
  vec3 colTeal = vec3(0.016, 0.230, 0.168);
  vec3 colDeep = vec3(0.043, 0.663, 0.333);
  vec3 colGuru = vec3(0.063, 0.847, 0.424);

  float lum = clamp(curtain + wash, 0.0, 1.0);
  vec3 col = mix(vec3(0.0), colTeal, smoothstep(0.04, 0.45, lum));
  col = mix(col, colDeep, smoothstep(0.42, 0.78, lum));
  col = mix(col, colGuru, smoothstep(0.74, 1.0, lum) * 0.65);

  float alpha = lum * veil;

  /* Fare parlatması: perde üstünde daha güçlü. */
  col += colGuru * minf * (0.18 + 0.35 * curtain);
  alpha += minf * (0.10 + 0.22 * curtain);

  /* Gooey iz: son ${TRAIL_COUNT} noktanın exp-blend metaball alanı —
     alanlar toplandığı için bloblar birbirine yumuşakça kaynar. */
  float field = 0.0;
  for (int i = 0; i < ${TRAIL_COUNT}; i++) {
    vec2 tp = vec2(u_trail[i].x * aspect, u_trail[i].y);
    field += u_trail[i].z * exp(-distance(p, tp) * 13.0);
  }
  float goo = smoothstep(0.12, 0.85, 1.0 - exp(-field * 1.7));
  col += mix(colDeep, colGuru, goo) * goo * 0.45;
  alpha += goo * 0.30;

  /* Vinyet: kenarlar koyu (alfa eriyip alttaki koyu zemine karışır). */
  vec2 vc = st - 0.5;
  float vig = 1.0 - smoothstep(0.22, 0.85, dot(vc, vc) * 2.4);
  alpha *= vig;

  /* Yoğunluk ölçeği + banding kırıcı zamansal dither. */
  alpha *= u_intensity * 1.1;
  float dn = hash12(gl_FragCoord.xy + fract(u_time) * 61.7) - 0.5;
  alpha = clamp(alpha + dn * 0.004, 0.0, 1.0);
  col = clamp(col + dn * 0.006, 0.0, 1.0);

  /* Premultiplied alpha çıkışı — canvas sayfa üstüne doğal kompozit olur. */
  gl_FragColor = vec4(col * alpha, alpha);
}
`;

/** Shader derleme yardımcısı; hata durumunda null döner (fallback'e düşülür). */
function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function AuroraCanvas({
  className,
  intensity = 0.6,
  interactive = true,
}: AuroraCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // İlk render'da HERKESE fallback — WebGL yalnız mount sonrası açılır (hydration birebir).
  const [glActive, setGlActive] = useState(false);

  // Prop'lar ref üzerinden okunur ki ana GL efekti yeniden kurulmasın
  // (cleanup'taki loseContext, aynı canvas'ta yeniden kuruluma izin vermez).
  const intensityRef = useRef(intensity);
  const interactiveRef = useRef(interactive);
  useEffect(() => {
    intensityRef.current = intensity;
    interactiveRef.current = interactive;
  }, [intensity, interactive]);

  /* ---- kapı: ince işaretçi + motion-serbest + WebGL destekli ortam ---- */
  useEffect(() => {
    const reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fineMq = window.matchMedia("(pointer: fine)");

    const probeWebgl = (): boolean => {
      try {
        const c = document.createElement("canvas");
        const gl = c.getContext("webgl");
        if (!gl) return false;
        // Sondaj bağlamını hemen serbest bırak.
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        return true;
      } catch {
        return false;
      }
    };

    const update = () => {
      setGlActive(!reducedMq.matches && fineMq.matches && probeWebgl());
    };
    update();
    reducedMq.addEventListener("change", update);
    fineMq.addEventListener("change", update);
    return () => {
      reducedMq.removeEventListener("change", update);
      fineMq.removeEventListener("change", update);
    };
  }, []);

  /* ---- WebGL kurulumu — tamamen mount sonrası, yalnız glActive iken ---- */
  useEffect(() => {
    if (!glActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
    });
    if (!gl) {
      setGlActive(false);
      return;
    }

    let program: WebGLProgram | null = null;
    let buffer: WebGLBuffer | null = null;
    let uTime: WebGLUniformLocation | null = null;
    let uRes: WebGLUniformLocation | null = null;
    let uMouse: WebGLUniformLocation | null = null;
    let uTrail: WebGLUniformLocation | null = null;
    let uIntensity: WebGLUniformLocation | null = null;

    let rafId: number | null = null;
    let visible = true;
    let disposed = false;
    const start = performance.now();

    // Fare: hedef (tx,ty) ham işaretçi, (x,y) lerp'lenmiş akışkan konum.
    const mouse = { x: -10, y: -10, tx: -10, ty: -10, seen: false };
    // Son 5 iz noktası: [x, y, güç] × 5 — karede alloc yok.
    const trail = new Float32Array(TRAIL_COUNT * 3);

    /** Program + buffer + uniform konumları; context restore'da da çağrılır. */
    const setup = (): boolean => {
      const vs = compileShader(gl, gl.VERTEX_SHADER, VERT);
      const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
      if (!vs || !fs) {
        if (vs) gl.deleteShader(vs);
        if (fs) gl.deleteShader(fs);
        return false;
      }
      const prog = gl.createProgram();
      if (!prog) {
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        return false;
      }
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      // Link sonrası shader nesneleri programdan bağımsız silinebilir.
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        gl.deleteProgram(prog);
        return false;
      }
      program = prog;
      gl.useProgram(prog);

      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      // Fullscreen üçgen — clip-space'i tek üçgenle örter.
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        gl.STATIC_DRAW
      );
      const aPos = gl.getAttribLocation(prog, "a_pos");
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      uTime = gl.getUniformLocation(prog, "u_time");
      uRes = gl.getUniformLocation(prog, "u_res");
      uMouse = gl.getUniformLocation(prog, "u_mouse");
      uTrail =
        gl.getUniformLocation(prog, "u_trail[0]") ??
        gl.getUniformLocation(prog, "u_trail");
      uIntensity = gl.getUniformLocation(prog, "u_intensity");
      gl.clearColor(0, 0, 0, 0);
      return true;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5); // WebGL: DPR ≤ 1.5
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
      schedule();
    };

    const stop = () => {
      if (rafId != null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };
    const schedule = () => {
      if (rafId == null && visible && !disposed) {
        rafId = requestAnimationFrame(frame);
      }
    };

    function frame(now: number) {
      rafId = null;
      // gl `let` olduğundan (context restore'da yeniden kurulur) TS daralması
      // closure'a taşınmaz — yerel sabit üzerinden kullan.
      const g = gl;
      if (disposed || !visible || !g || g.isContextLost()) return;

      if (!interactiveRef.current) {
        // Etkileşim kapalıysa fare ekran dışına snap'lenir (sweep olmasın).
        mouse.x = mouse.tx = -10;
        mouse.y = mouse.ty = -10;
        mouse.seen = false;
      } else {
        // Yumuşak gecikme: fare uniform'a lerp ile akar.
        mouse.x += (mouse.tx - mouse.x) * 0.06;
        mouse.y += (mouse.ty - mouse.y) * 0.06;
      }
      // İz güçleri her karede sönümlenir — gooey iz eriyerek kaybolur.
      for (let i = 0; i < TRAIL_COUNT; i++) trail[i * 3 + 2] *= 0.94;

      g.uniform1f(uTime, (now - start) / 1000);
      g.uniform2f(uMouse, mouse.x, mouse.y);
      g.uniform3fv(uTrail, trail);
      g.uniform1f(uIntensity, clamp01(intensityRef.current));
      g.clear(g.COLOR_BUFFER_BIT);
      g.drawArrays(g.TRIANGLES, 0, 3);
      schedule();
    }

    /* ---- fare: normalize konum + mesafe eşikli iz kaydı ---- */
    const onPointerMove = (e: PointerEvent) => {
      if (!interactiveRef.current) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = 1 - (e.clientY - rect.top) / rect.height; // gl_FragCoord y yukarı
      mouse.tx = nx;
      mouse.ty = ny;
      if (!mouse.seen) {
        // İlk temasta snap — ekran dışından süpürme animasyonu olmasın.
        mouse.x = nx;
        mouse.y = ny;
        mouse.seen = true;
      }
      const dx = nx - trail[0];
      const dy = ny - trail[1];
      if (trail[2] <= 0.01 || dx * dx + dy * dy > 0.0009) {
        trail.copyWithin(3, 0, (TRAIL_COUNT - 1) * 3); // sağa kaydır
        trail[0] = nx;
        trail[1] = ny;
        trail[2] = 1;
      }
    };

    /* ---- bağlam kaybı: preventDefault + durdur; restore'da yeniden kur ---- */
    const onContextLost = (e: Event) => {
      e.preventDefault();
      stop();
    };
    const onContextRestored = () => {
      // Eski program/buffer bağlamla birlikte geçersizleşti — sıfırdan kur.
      if (setup()) {
        resize();
        schedule();
      } else {
        setGlActive(false);
      }
    };
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);

    /* ---- gözlemciler: görünmezken rAF tamamen durur ---- */
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
        if (visible) schedule();
        else stop();
      },
      { rootMargin: "120px" }
    );
    io.observe(canvas);

    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);

    window.addEventListener("pointermove", onPointerMove, { passive: true });

    if (!setup()) {
      // Derleme/link başarısızsa zarif fallback'e dön; bağlamı da bırak.
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      setGlActive(false);
      return;
    }
    resize();
    // İlk kareyi senkron çiz — fallback'ten geçişte boş canvas görünmesin.
    // (resize bir rAF kuyruklamış olabilir; çift döngü olmasın diye önce durdur.)
    stop();
    frame(performance.now());

    return () => {
      disposed = true;
      stop();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      if (buffer) gl.deleteBuffer(buffer);
      if (program) gl.deleteProgram(program);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [glActive]);

  /* Statik fallback: aynı boyutta radial-gradient yeşil glow kompozisyonu.
     intensity deterministik olduğundan SSR/istemci çıktısı birebir aynı. */
  const level = clamp01(intensity);
  const fallbackStyle: CSSProperties = {
    background: [
      `radial-gradient(52% 44% at 18% 24%, rgba(16, 216, 108, ${(0.16 * level).toFixed(3)}), transparent 68%)`,
      `radial-gradient(46% 40% at 78% 16%, rgba(11, 169, 85, ${(0.13 * level).toFixed(3)}), transparent 70%)`,
      `radial-gradient(64% 52% at 55% 88%, rgba(6, 64, 42, ${(0.3 * level).toFixed(3)}), transparent 75%)`,
    ].join(", "),
  };

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full overflow-hidden",
        className
      )}
    >
      {glActive ? (
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      ) : (
        <div className="absolute inset-0" style={fallbackStyle} />
      )}
    </div>
  );
}
