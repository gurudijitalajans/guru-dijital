import { PanelMark } from "../ui/panel-mark";

/** Giriş ekranlarının başı: panelin işareti ve adı */
export function Brand() {
  return (
    <div className="flex items-center justify-center gap-2.5 text-[20px] font-semibold text-ink">
      <PanelMark size={40} />
      Guru Panel
    </div>
  );
}
