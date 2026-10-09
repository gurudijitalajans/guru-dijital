"use client";

/**
 * Form sekmesinin başında küçük sayfa krokisi: düzenlenen alanların sitedeki
 * sayfanın neresinde olduğunu gösterir. Yalnız görsel yardım; veri tutmaz.
 */
const PAGES: Record<string, string[]> = {
  urun: [
    "Giriş",
    "Ürün turu videosu",
    "Öne çıkan ekranlar",
    "Ve daha fazlası",
    "Pakete dahil ürünler",
    "Bugün / Guru ile",
    "Nasıl çalışır",
    "Kullanım senaryoları",
    "Sayılar bandı",
    "Neler dahil",
    "Entegrasyonlar",
    "Sık sorulan sorular",
    "Demo talebi",
  ],
  "urun-dis": ["Ana sayfa ürün kartı", "Ürünler sayfası kartı", "Sosyal medya paylaşımı", "Arama sonucu"],
};

export function PageMap({ page, active, note }: { page: string; active: string[]; note?: string }) {
  const rows = PAGES[page] ?? [];
  return (
    <div className="guru-map">
      <p className="guru-map__title">{note ?? "Sayfada nerede"}</p>
      <ol className="guru-map__rows">
        {rows.map((r) => (
          <li key={r} className={active.includes(r) ? "is-active" : undefined}>
            <span aria-hidden />
            {r}
          </li>
        ))}
      </ol>
    </div>
  );
}
