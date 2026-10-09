import type { Payload, PayloadRequest } from "payload";
import { defaultTenantId } from "../crm/tenant";

/**
 * Başlangıç şablonları: Guru'nun iki sık işi. Sorumlu boş bırakılır (işin
 * sorumlusuna atanır); adımlar, süreler ve saatler panelden düzenlenir.
 * Hiç şablon yoksa eklenir; tekrar çalıştırmak güvenlidir.
 */
const TEMPLATES = [
  {
    name: "Web sitesi projesi",
    description: "Başlangıç şablonu. Adımları, süreleri ve sorumluları kendi işleyişinize göre düzenleyin.",
    steps: [
      { title: "Keşif ve brief", offset: 0, duration: 2, hours: 4, checklist: ["Hedefler ve hedef kitle netleşti", "Sayfa listesi çıkarıldı", "İçerik ve görsel sorumluları belirlendi"] },
      { title: "Site haritası ve tel kafes", offset: 2, duration: 3, hours: 8, checklist: ["Site haritası müşteriyle paylaşıldı"] },
      { title: "Tasarım", offset: 5, duration: 5, hours: 24, checklist: ["Ana sayfa tasarımı", "İç sayfa şablonları", "Mobil görünüm"] },
      { title: "Tasarım onayı", offset: 10, duration: 2, hours: 2, checklist: ["Müşteri onayı yazılı alındı"] },
      { title: "Geliştirme", offset: 12, duration: 8, hours: 40, checklist: [] },
      { title: "İçerik girişi", offset: 16, duration: 3, hours: 8, checklist: ["Metinler girildi", "Görseller optimize edildi"] },
      { title: "Test ve yayın", offset: 20, duration: 2, hours: 6, checklist: ["Mobil ve tarayıcı testi", "Form ve bildirim testi", "Alan adı ve SSL", "Analitik kurulumu"] },
    ],
  },
  {
    name: "Sosyal medya aylık içerik",
    description: "Başlangıç şablonu. Her ay için bir iş açın; adımları kendi takviminize göre düzenleyin.",
    steps: [
      { title: "İçerik takvimi", offset: 0, duration: 2, hours: 4, checklist: ["Önemli günler ve kampanyalar işlendi", "Takvim müşteriyle paylaşıldı"] },
      { title: "Metinler", offset: 2, duration: 3, hours: 8, checklist: [] },
      { title: "Tasarımlar", offset: 3, duration: 4, hours: 16, checklist: ["Gönderi tasarımları", "Hikâye ve kapak tasarımları"] },
      { title: "Müşteri onayı", offset: 7, duration: 2, hours: 1, checklist: ["Onay alındı"] },
      { title: "Planlama ve yayın", offset: 9, duration: 1, hours: 2, checklist: ["Gönderiler zamanlandı"] },
      { title: "Aylık rapor", offset: 19, duration: 1, hours: 3, checklist: ["Rapor müşteriye gönderildi"] },
    ],
  },
];

export async function seedTemplates(payload: Payload, req?: PayloadRequest) {
  const { totalDocs } = await payload.count({ collection: "templates", where: { "tenant.slug": { equals: "guru" } }, req, overrideAccess: true });
  if (totalDocs > 0) return 0;
  const tenant = req ? await defaultTenantId(req) : (await payload.find({ collection: "tenants", where: { slug: { equals: "guru" } }, limit: 1, depth: 0 })).docs[0]?.id;
  for (const t of TEMPLATES) {
    await payload.create({
      collection: "templates",
      data: { ...t, tenant, steps: t.steps.map((s) => ({ ...s, priority: "normal" as const, checklist: s.checklist.map((text) => ({ text })) })) },
      req,
      overrideAccess: true,
    });
  }
  return TEMPLATES.length;
}
