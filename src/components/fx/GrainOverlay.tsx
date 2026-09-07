const GRAIN_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`;

const GRAIN_URL = `url("data:image/svg+xml,${encodeURIComponent(GRAIN_SVG)}")`;

/**
 * Sabit tam ekran film grain katmanı.
 * Saf CSS/div: SVG feTurbulence data-URI arka plan; canvas yok, JS yok.
 * Server component olarak render edilebilir.
 * Küçük ekranlarda (md altı) hiç basılmaz: tam ekran mix-blend-overlay
 * katmanı dokunmatik cihazlarda görsel kazanç vermeden kompozit maliyeti üretir.
 */
export function GrainOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[90] hidden opacity-[0.06] mix-blend-overlay md:block"
      style={{
        backgroundImage: GRAIN_URL,
        backgroundRepeat: "repeat",
        backgroundSize: "160px 160px",
      }}
    />
  );
}
