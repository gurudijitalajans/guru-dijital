/** Giriş ekranlarının başı: ışık bandının üstünde beyaz guru logosu ve "Panel" etiketi */
export function Brand() {
  return (
    <div className="flex items-center justify-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element -- küçük SVG logo, optimize edilecek bir şey yok */}
      <img src="/brand/logo-white.svg" alt="Guru Dijital" width={112} height={49} className="h-[42px] w-auto" />
      <span className="rounded-full bg-white/12 px-2.5 py-0.5 text-[13px] font-medium text-white ring-1 ring-white/25">Panel</span>
    </div>
  );
}
