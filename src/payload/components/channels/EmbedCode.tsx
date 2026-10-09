"use client";

import { useState, useSyncExternalStore } from "react";
import { useFormFields } from "@payloadcms/ui";

/**
 * Site bağlantısı ekranının başında: işletmenin sitesine yapıştırılacak kod.
 * Tek satır betik sohbet balonunu açar; data-guru-form işaretli kutuya talep
 * formu yerleşir. Önizleme, kodu boş bir deneme sayfasında gösterir.
 */
const origin = () => window.location.origin;
const noop = () => () => {};

function Copy({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="guru-plan__nav"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        } catch {
          setDone(false);
        }
      }}
    >
      {done ? "Kopyalandı" : "Kopyala"}
    </button>
  );
}

export function EmbedCode() {
  const key = useFormFields(([f]) => f.siteKey?.value as string | undefined);
  const base = useSyncExternalStore(noop, origin, () => "");
  if (!key) return <p className="guru-crm__hint">Kaydedince site anahtarı üretilir ve kod burada görünür.</p>;
  const script = `<script src="${base}/guru-site.js" data-key="${key}" async></script>`;
  const form = `<div data-guru-form></div>`;
  return (
    <div className="guru-embed">
      <h3 className="guru-crm__h">Sitenize ekleyin</h3>
      <p className="guru-crm__hint">
        1. Bu satırı sitenizin her sayfasına, kapanış <code>&lt;/body&gt;</code> etiketinden önce ekleyin. Sağ altta sohbet balonu çıkar (Chatbot ayarlarında açıksa).
      </p>
      <div className="guru-embed__code">
        <code>{script}</code>
        <Copy text={script} />
      </div>
      <p className="guru-crm__hint">2. Talep formunun görüneceği yere bu kutuyu koyun. Gelen talepler CRM&apos;e kişi, fırsat ve ilk dönüş göreviyle düşer.</p>
      <div className="guru-embed__code">
        <code>{form}</code>
        <Copy text={form} />
      </div>
      <p className="guru-crm__hint">
        Aşağıya sitenizin adresini eklemeyi unutmayın: balon ve form yalnız oradan açılır.{" "}
        <a href={`/gomulu/onizleme?k=${encodeURIComponent(key)}`} target="_blank" rel="noopener">
          Deneme sayfasında önizleyin
        </a>
      </p>
    </div>
  );
}
