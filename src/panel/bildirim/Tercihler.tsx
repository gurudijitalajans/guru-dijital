"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { saveNotifyPrefs, type NotifyPrefs } from "./actions";

/* E-posta sütunu yalnız kişiye gelen bildirimlerde; talep, randevu ve sohbet e-postası işletmenin bildirim adresine gider */
const ROWS: [string, string, boolean][] = [
  ["talep", "Yeni talep", false],
  ["randevu", "Yeni randevu", false],
  ["sohbet", "Ekibe aktarılan sohbet", false],
  ["gorev", "Bana atanan görev", true],
  ["kontrol", "Kontrol bekleyen iş", true],
  ["bahsetme", "Notta benden bahsedilmesi", true],
];

/** Hesabım > Bildirimler: tür başına panel ve e-posta tercihi */
export function Tercihler({ initial }: { initial: NotifyPrefs }) {
  const [prefs, setPrefs] = useState<NotifyPrefs>(initial);
  const [pending, start] = useTransition();
  const on = (k: string) => prefs[k] !== false;
  const save = () =>
    start(async () => {
      const r = await saveNotifyPrefs(prefs);
      if (!r.ok) return void toast.error(r.error ?? "Kaydedilemedi.");
      toast.success("Bildirim tercihleri kaydedildi.");
    });
  return (
    <section id="bildirimler" className="mt-6 rounded-card border border-line bg-surface p-4 sm:p-5">
      <h2 className="m-0 text-[17px] font-semibold text-ink">Bildirimler</h2>
      <p className="mt-1 mb-4 text-[14px] text-muted">Hangi olaylarda panelde (zil) ve e-postayla haber alacağınızı seçin. Talep, randevu ve sohbet e-postaları işletmenin bildirim adresine gider.</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-[14px]">
          <thead>
            <tr className="text-left text-[12px] text-muted">
              <th className="py-2 pr-3 font-semibold">Olay</th>
              <th className="w-24 py-2 text-center font-semibold">Panel</th>
              <th className="w-24 py-2 text-center font-semibold">E-posta</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([k, label, mail]) => (
              <tr key={k} className="border-t border-line">
                <td className="py-2.5 pr-3 text-ink">{label}</td>
                <td className="py-2.5 text-center">
                  <input type="checkbox" id={`tercih-${k}-panel`} aria-label={`${label}: panel`} checked={on(`${k}Panel`)} onChange={(e) => setPrefs({ ...prefs, [`${k}Panel`]: e.target.checked })} className="size-4 accent-[var(--accent)]" />
                </td>
                <td className="py-2.5 text-center">
                  {mail ? (
                    <input type="checkbox" id={`tercih-${k}-eposta`} aria-label={`${label}: e-posta`} checked={on(`${k}Eposta`)} onChange={(e) => setPrefs({ ...prefs, [`${k}Eposta`]: e.target.checked })} className="size-4 accent-[var(--accent)]" />
                  ) : (
                    <span className="text-[12px] text-muted">İşletme adresi</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button className="mt-4" variant="primary" disabled={pending} onClick={save}>
        Kaydet
      </Button>
    </section>
  );
}
