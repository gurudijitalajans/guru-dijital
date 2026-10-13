import type { Payload } from "payload";
import { chatConfigOf } from "../chat/collections";
import { siteConnectionOf } from "../channels/collections";
import { aiConfigured } from "../chat/ai";
import { umamiConfigured } from "@/lib/umami";
import type { Module } from "../business/roles";

/**
 * Kurulum listeleri: her madde verinin kendisinden ya da ortam ayarından
 * okunur, elle işaretlenmez.
 *   onboardingSteps  yeni müşteri işletmesinin "Kuruluma başlayın" adımları
 *   siteChecklist    Guru Dijital sitesinin eksikleri (yalnız Guru)
 */
export type CheckItem = { done: boolean; title: string; detail: string; href: string | null };

export async function onboardingSteps(payload: Payload, tenantId: number, open: (m: Module) => boolean): Promise<CheckItem[]> {
  const t = { tenant: { equals: tenantId } };
  const [conn, chat, knowledge, members, contacts, used] = await Promise.all([
    siteConnectionOf(payload, tenantId),
    open("chat") ? chatConfigOf(payload, tenantId) : Promise.resolve(null),
    payload.count({ collection: "knowledge", where: t, overrideAccess: true }),
    payload.count({ collection: "users", where: { "tenants.tenant": { equals: tenantId } }, overrideAccess: true }),
    payload.count({ collection: "contacts", where: t, overrideAccess: true }),
    payload.count({ collection: "usage", where: { and: [t, { or: [{ conversations: { greater_than: 0 } }, { formLeads: { greater_than: 0 } }] }] }, overrideAccess: true }),
  ]);
  const origins = (conn.allowedOrigins ?? []).filter((o) => o.origin).length;
  const channel = open("chat") || open("crm");
  return [
    channel && { done: origins > 0, title: "Site adresinizi ekleyin", detail: origins ? `${origins} adres kayıtlı` : "Sohbet balonu ve form yalnız kayıtlı adreslerde çalışır", href: "/admin/collections/site-connection" },
    channel && { done: used.totalDocs > 0, title: "Kodu sitenize yerleştirin", detail: used.totalDocs > 0 ? "Sitenizden ilk sohbet ya da talep geldi" : "Site bağlantısı sayfasındaki tek satırlık kodu sitenizin altına ekleyin", href: "/admin/collections/site-connection" },
    open("chat") && { done: knowledge.totalDocs > 0, title: "Asistana işletmenizi anlatın", detail: knowledge.totalDocs ? `${knowledge.totalDocs} bilgi kaydı var` : "Sitenizi taratın ya da fiyat listesi, SSS gibi bir belge yükleyin", href: "/admin/collections/knowledge" },
    open("chat") && { done: Boolean(chat?.enabled), title: "Sohbet balonunu açın", detail: chat?.enabled ? "Balon sitenizde açık" : "Sohbet asistanı ayarlarından karşılama metnini yazıp balonu açın", href: "/admin/collections/chatbot-config" },
    open("crm") && { done: contacts.totalDocs > 0, title: "Müşteri listenizi aktarın", detail: contacts.totalDocs ? `${contacts.totalDocs} kişi kayıtlı` : "Excel ya da CSV dosyanızdaki kişi, firma ve fırsatları tek seferde alın", href: "/admin/veri-aktar" },
    { done: members.totalDocs > 1, title: "Ekibinizi davet edin", detail: members.totalDocs > 1 ? `Panelde ${members.totalDocs} kişi var` : "Her çalışan kendi hesabıyla girsin; yalnız gereken modülleri görsün", href: "/admin/ekip" },
  ].filter(Boolean) as CheckItem[];
}

const PLACEHOLDER_NAMES = new Set(["", "ad soyad"]);

export async function siteChecklist(payload: Payload, guruTenant: number): Promise<CheckItem[]> {
  const [team, refs, quotes, users, chat] = await Promise.all([
    payload.find({ collection: "team", limit: 100, depth: 0, pagination: false }),
    payload.find({ collection: "references", limit: 200, depth: 0, pagination: false }),
    payload.count({ collection: "testimonials", where: { and: [{ consent: { equals: true } }, { quote: { exists: true } }] } }),
    payload.find({ collection: "users", where: { role: { equals: "admin" } }, limit: 50, depth: 0, pagination: false, overrideAccess: true }),
    chatConfigOf(payload, guruTenant),
  ]);
  const teamDocs = team.docs as { name?: string; photo?: unknown }[];
  const named = teamDocs.filter((m) => !PLACEHOLDER_NAMES.has((m.name ?? "").trim().toLocaleLowerCase("tr-TR"))).length;
  const photos = teamDocs.filter((m) => Boolean(m.photo)).length;
  const refDocs = refs.docs as { logo?: unknown }[];
  const logos = refDocs.filter((r) => Boolean(r.logo)).length;
  const realAdmin = (users.docs as { email?: string }[]).some((u) => u.email && !/\.test$/i.test(u.email));
  const serverURL = process.env.NEXT_PUBLIC_SERVER_URL ?? "";
  const domain = /gurudijital\.com\.tr/.test(serverURL);
  return [
    { done: teamDocs.length > 0 && named === teamDocs.length, title: "Ekip isimleri", detail: `${named}/${teamDocs.length} kişinin adı girildi`, href: "/admin/collections/team" },
    { done: teamDocs.length > 0 && photos === teamDocs.length, title: "Ekip fotoğrafları", detail: `${photos}/${teamDocs.length} fotoğraf yüklendi`, href: "/admin/collections/team" },
    { done: refDocs.length > 0 && logos === refDocs.length, title: "Referans logoları", detail: `${logos}/${refDocs.length} markanın logosu var; logosuz marka adıyla görünür`, href: "/admin/collections/references" },
    { done: quotes.totalDocs > 0, title: "Müşteri yorumları", detail: quotes.totalDocs > 0 ? `${quotes.totalDocs} yorum yayında` : "İzinli yorum yok; bölüm sitede gizli", href: "/admin/collections/testimonials" },
    { done: realAdmin, title: "Yönetici e-postası", detail: realAdmin ? "Gerçek adres tanımlı" : "Hesap deneme adresinde; şifre sıfırlama e-postası gelmez", href: "/admin/account" },
    { done: Boolean(process.env.RESEND_API_KEY), title: "Bildirim e-postası", detail: process.env.RESEND_API_KEY ? "Yeni talepler ve davetler e-postayla gidiyor" : "Vercel'e RESEND_API_KEY eklenince talepler ve ekip davetleri e-postayla gider", href: null },
    {
      done: aiConfigured() && Boolean(chat.enabled),
      title: "Sohbet asistanı",
      detail: !aiConfigured() ? "Vercel'e ANTHROPIC_API_KEY eklenince asistan yanıt verir; şimdilik sohbetler doğrudan ekibe düşer" : chat.enabled ? "Sitede sohbet balonu açık" : "Sohbet asistanı ayarlarından balonu açın",
      href: "/admin/collections/chatbot-config",
    },
    { done: Boolean(process.env.CRON_SECRET), title: "Sabah özeti", detail: process.env.CRON_SECRET ? "Hafta içi her sabah yöneticilere özet e-postası gidiyor" : "Vercel'e CRON_SECRET eklenince hafta içi her sabah özet e-postası gider", href: "/admin/collections/business-config" },
    { done: umamiConfigured(), title: "Ziyaretçi analizi", detail: umamiConfigured() ? "Umami bağlı" : "Vercel'e UMAMI_API_KEY eklenince ziyaretçi sayıları görünür", href: "/panel/ziyaretci" },
    { done: domain, title: "Alan adı", detail: domain ? "gurudijital.com.tr bağlı" : "Site şimdilik vercel.app adresinde", href: null },
    { done: false, title: "KVKK aydınlatma metni", detail: "Metin gelince formların altına bağlantısı eklenir", href: null },
  ];
}
