/** Sayfa sunucudan gelirken: başlık ve kart iskeletleri (menü yerinde kalır, tıklamanın işlendiği görülür) */
export default function PanelLoading() {
  const bar = "animate-pulse rounded-[10px] bg-sunken";
  return (
    <div aria-busy="true" aria-label="Yükleniyor">
      <div className={`${bar} h-8 w-56`} />
      <div className={`${bar} mt-3 h-4 w-80 max-w-full`} />
      <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`${bar} h-24`} />
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className={`${bar} h-80`} />
        <div className={`${bar} h-80`} />
      </div>
    </div>
  );
}
