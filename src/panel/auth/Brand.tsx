/** Giriş ekranlarının başı: panelin işareti ve adı */
export function Brand() {
  return (
    <div className="flex items-center justify-center gap-2.5 text-[20px] font-semibold text-ink">
      <span className="grid size-9 place-items-center rounded-[10px] bg-accent text-[18px] font-bold text-white" aria-hidden>
        g
      </span>
      Guru Panel
    </div>
  );
}
