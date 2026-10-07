/**
 * Tek seferlik düzeltme: panelde kayıtlı hizmet etiketlerini büyük harfle
 * başlatır (Türkçe kuralıyla: "içerik planı" → "İçerik planı"). Sitede
 * otomatik büyük harf kaldırıldığı için mevcut kayıtlar bir kez düzeltilir.
 * Çalıştırma: npm run payload run src/payload/fix-keywords.ts
 */
import { getPayload } from "payload";
import config from "@payload-config";

const payload = await getPayload({ config });
const cap = (t: string) => (t ? t.charAt(0).toLocaleUpperCase("tr-TR") + t.slice(1) : t);
const { docs } = await payload.find({ collection: "services", limit: 100, depth: 0, pagination: false });
let changed = 0;
for (const s of docs) {
  const keywords = (s.keywords ?? []).map((k) => ({ ...k, text: cap(k.text) }));
  if (JSON.stringify(keywords) !== JSON.stringify(s.keywords ?? [])) {
    await payload.update({ collection: "services", id: s.id, data: { keywords, _status: "published" } });
    changed++;
  }
}
payload.logger.info(`etiket düzeltme: ${changed} hizmet güncellendi`);
process.exit(0);
