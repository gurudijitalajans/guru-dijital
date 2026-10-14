"use client";

import { useEffect } from "react";
import * as CC from "vanilla-cookieconsent";
import "vanilla-cookieconsent/dist/cookieconsent.css";
import legal from "@/content/legal.json";

/**
 * Çerez onayı: vanilla-cookieconsent v3 (orestbida, MIT). KVKK Çerez Rehberi'ne
 * uygun: önceden işaretli kutu yok, "Yalnız zorunlu" ve "Tümünü kabul et" aynı
 * ağırlıkta, tercih her zaman footer'daki bağlantıdan değiştirilebilir.
 * Ziyaretçi analitiği (Umami) çerez kullanmaz; ziyaretçi analitiği reddederse
 * yine de sayım kapatılır (umami.disabled). Pazarlama etiketi şu an yok;
 * eklendiğinde yalnız "pazarlama" onayıyla yüklenmeli (CC.acceptedCategory).
 */
const B = (legal as unknown as { _banner: { title: string; text: string; acceptAll: string; rejectAll: string; prefs: string; save: string; categories: Record<string, { title: string; desc: string }> } })._banner;

function syncAnalytics() {
  try {
    if (CC.acceptedCategory("analitik")) localStorage.removeItem("umami.disabled");
    else localStorage.setItem("umami.disabled", "1");
  } catch {
    /* depolama kapalı */
  }
}

export function CookieConsentBanner() {
  useEffect(() => {
    void CC.run({
      revision: 1,
      cookie: { name: "guru-cerez-tercihi", expiresAfterDays: 180 },
      guiOptions: {
        consentModal: { layout: "box", position: "bottom left", equalWeightButtons: true, flipButtons: false },
        preferencesModal: { layout: "box", equalWeightButtons: true },
      },
      onConsent: syncAnalytics,
      onChange: syncAnalytics,
      categories: {
        zorunlu: { enabled: true, readOnly: true },
        analitik: {},
        pazarlama: {},
      },
      language: {
        default: "tr",
        translations: {
          tr: {
            consentModal: {
              title: B.title,
              description: `${B.text} <a href="/yasal/cerez-politikasi">Çerez Politikası</a>`,
              acceptAllBtn: B.acceptAll,
              acceptNecessaryBtn: B.rejectAll,
              showPreferencesBtn: B.prefs,
            },
            preferencesModal: {
              title: "Çerez tercihleri",
              acceptAllBtn: B.acceptAll,
              acceptNecessaryBtn: B.rejectAll,
              savePreferencesBtn: B.save,
              closeIconLabel: "Kapat",
              sections: [
                { description: `Hangi depolama araçlarına izin verdiğinizi seçin. Ayrıntılar <a href="/yasal/cerez-politikasi">Çerez Politikası</a> ve <a href="/yasal/kvkk-aydinlatma-metni">KVKK Aydınlatma Metni</a>'nde.` },
                { title: B.categories.zorunlu.title, description: B.categories.zorunlu.desc, linkedCategory: "zorunlu" },
                { title: B.categories.analitik.title, description: B.categories.analitik.desc, linkedCategory: "analitik" },
                { title: B.categories.pazarlama.title, description: B.categories.pazarlama.desc, linkedCategory: "pazarlama" },
              ],
            },
          },
        },
      },
    });
  }, []);
  return null;
}

/** Footer'daki "Çerez tercihleri" bağlantısı */
export function CookiePrefsButton({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => CC.showPreferences()}>
      Çerez tercihleri
    </button>
  );
}
