import type { CollectionConfig, PayloadRequest } from "payload";
import { isLoggedIn } from "../access";
import { tenantAdminAccess } from "../business/roles";
import { DEAL_STAGES, stageLabel } from "./stages";
import { isClosedDay } from "../../lib/tatiller";

/**
 * Aşama otomasyonları (Kommo'daki "Digital Pipeline"ın sade hali): fırsat bir
 * aşamaya girince görev açılır, sorumlu değişir, kişiye e-posta gider ya da
 * ekibe bildirim düşer. İşletme yöneticisi Ayarlar'dan kurar.
 */
export const DEADLINES = [
  { label: "Hemen", value: "hemen" },
  { label: "Gün sonu", value: "gun-sonu" },
  { label: "1 iş günü sonra", value: "1" },
  { label: "3 iş günü sonra", value: "3" },
  { label: "Hafta sonuna kadar (cuma)", value: "hafta" },
];
export const AUTO_ACTIONS = [
  { label: "Görev aç", value: "gorev" },
  { label: "Sorumluyu değiştir", value: "sorumlu" },
  { label: "Kişiye e-posta gönder", value: "eposta" },
  { label: "Ekibe bildirim", value: "bildirim" },
];

export const Automations: CollectionConfig = {
  slug: "automations",
  labels: { singular: "Otomasyon", plural: "Otomasyonlar" },
  admin: { useAsTitle: "name", group: "Guru CRM", defaultColumns: ["name", "stage", "action", "active"] },
  access: { read: isLoggedIn, create: tenantAdminAccess, update: tenantAdminAccess, delete: tenantAdminAccess },
  fields: [
    { name: "name", type: "text", label: "Ad", required: true, admin: { placeholder: "Teklif aşamasında 2 gün sonra ara" } },
    { name: "active", type: "checkbox", label: "Açık", defaultValue: true },
    {
      type: "row",
      fields: [
        { name: "stage", type: "select", label: "Fırsat bu aşamaya girince", required: true, options: [...DEAL_STAGES], admin: { width: "50%" } },
        { name: "action", type: "select", label: "Ne yapılsın", required: true, defaultValue: "gorev", options: AUTO_ACTIONS, admin: { width: "50%" } },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "taskType",
          type: "select",
          label: "Görev türü",
          defaultValue: "arama",
          options: [
            { label: "Arama", value: "arama" },
            { label: "Toplantı", value: "toplanti" },
            { label: "E-posta", value: "eposta" },
            { label: "Görev", value: "gorev" },
          ],
          admin: { width: "33%", condition: (d) => d?.action === "gorev" },
        },
        { name: "deadline", type: "select", label: "Ne zamana", defaultValue: "1", options: DEADLINES, admin: { width: "33%", condition: (d) => d?.action === "gorev" } },
        {
          name: "taskTitle",
          type: "text",
          label: "Görev",
          admin: { width: "34%", condition: (d) => d?.action === "gorev", placeholder: "Teklifi konuşmak için {ad} ara" },
        },
      ],
    },
    {
      name: "assignTo",
      type: "relationship",
      relationTo: "users",
      label: "Kime",
      admin: { condition: (d) => d?.action === "gorev" || d?.action === "sorumlu", description: "Görevde boş bırakılırsa fırsatın sorumlusuna atanır." },
    },
    { name: "emailSubject", type: "text", label: "E-posta konusu", admin: { condition: (d) => d?.action === "eposta", placeholder: "Teklifimiz hakkında" } },
    {
      name: "emailBody",
      type: "textarea",
      label: "E-posta metni",
      admin: {
        condition: (d) => d?.action === "eposta" || d?.action === "bildirim",
        description: "{ad}, {firma} ve {firsat} yer tutucuları kişinin adı, firması ve fırsat adıyla dolar. Kişinin e-postası yoksa gönderilmez.",
      },
    },
  ],
};

/**
 * İş günü sonu ve sonraki iş günleri (İstanbul saatiyle 18:00 / 10:00). Gün İstanbul'a göre
 * hesaplanır; hafta sonu ve resmi tatiller atlanır; geçmişe düşen saat sonraki iş gününe kayar.
 */
function dueFor(deadline: string, now = new Date()): string {
  /* d: İstanbul yerel tarihini UTC alanlarında taşıyan tarih (Türkiye'de yaz saati yok, +3) */
  const local = new Date(now.getTime() + 3 * 3600000);
  const atTr = (d: Date, h: number) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), h - 3, 0));
  const closed = (d: Date) => isClosedDay(d.toISOString().slice(0, 10));
  const nextOpen = (d: Date) => {
    do d.setUTCDate(d.getUTCDate() + 1);
    while (closed(d));
    return d;
  };
  if (deadline === "hemen") return now.toISOString();
  if (deadline === "gun-sonu") {
    const d = new Date(local);
    if (closed(d) || atTr(d, 18) <= now) nextOpen(d);
    return atTr(d, 18).toISOString();
  }
  if (deadline === "hafta") {
    const d = new Date(local);
    d.setUTCDate(d.getUTCDate() + ((5 - d.getUTCDay() + 7) % 7));
    if (atTr(d, 17) <= now) d.setUTCDate(d.getUTCDate() + 7);
    return atTr(d, 17).toISOString();
  }
  const d = new Date(local);
  for (let left = Number(deadline) || 1; left > 0; left--) nextOpen(d);
  return atTr(d, 10).toISOString();
}

type Deal = { id: number | string; title: string; stage: string; tenant?: unknown; owner?: unknown; contact?: unknown; company?: unknown };
const idOf = (v: unknown) => (v && typeof v === "object" ? ((v as { id?: number }).id ?? null) : ((v as number | null | undefined) ?? null));

/**
 * Fırsat bir aşamaya girince o aşamanın açık otomasyonları çalışır. Hata
 * fırsatın kaydını bozmaz; her çalışma fırsatın akışına "Otomasyon: …" olarak yazılır.
 */
export async function runStageAutomations(req: PayloadRequest, deal: Deal) {
  const tenant = idOf(deal.tenant);
  if (!tenant) return;
  const rules = await req.payload.find({ collection: "automations", where: { and: [{ tenant: { equals: tenant } }, { stage: { equals: deal.stage } }, { active: { equals: true } }] }, limit: 20, depth: 0, req, overrideAccess: true });
  if (!rules.docs.length) return;
  const { logActivity, quietly } = await import("./automation");
  /* Sorumlu değiştiren kural önce çalışır: aynı aşamadaki görev yeni sorumluya düşer */
  const ordered = [...rules.docs].sort((a, b) => Number(b.action === "sorumlu") - Number(a.action === "sorumlu"));
  let owner = idOf(deal.owner);
  /* Fırsat aynı aşamaya yeniden girerse aynı görev ve e-posta tekrar açılmaz */
  const already = async (title: string, open: boolean) =>
    (
      await req.payload.count({
        collection: "activities",
        where: { and: [{ deal: { equals: deal.id } }, { title: { equals: title } }, ...(open ? [{ done: { equals: false } }] : [])] },
        req,
        overrideAccess: true,
      })
    ).totalDocs > 0;
  const contact = idOf(deal.contact) ? await req.payload.findByID({ collection: "contacts", id: idOf(deal.contact)!, depth: 0, req, overrideAccess: true }).catch(() => null) : null;
  const company = idOf(deal.company) ? await req.payload.findByID({ collection: "companies", id: idOf(deal.company)!, depth: 0, req, overrideAccess: true }).catch(() => null) : null;
  const fill = (t: string) =>
    t
      .replace(/\{ad\}/gi, (contact?.name ?? "").split(/\s+/)[0] ?? "")
      .replace(/\{firma\}/gi, company?.name ?? "")
      .replace(/\{firsat\}/gi, deal.title);
  for (const r of ordered) {
    try {
      if (r.action === "gorev") {
        const title = fill(r.taskTitle || `${stageLabel(deal.stage)} aşamasında takip: ${deal.title}`).slice(0, 120);
        if (await already(title, true)) continue;
        await req.payload.create({
          collection: "activities",
          data: { type: r.taskType ?? "arama", title, deal: deal.id, contact: idOf(deal.contact), company: idOf(deal.company), dueAt: dueFor(r.deadline ?? "1"), done: false, owner: idOf(r.assignTo) ?? owner, tenant } as never,
          req,
          overrideAccess: true,
        });
      } else if (r.action === "sorumlu" && idOf(r.assignTo)) {
        await quietly(req, () => req.payload.update({ collection: "deals", id: deal.id, data: { owner: idOf(r.assignTo) } as never, req, overrideAccess: true, context: { crmSkip: true } }));
        owner = idOf(r.assignTo);
        await logActivity(req, { type: "sistem", title: `Otomasyon: sorumlu değişti (${r.name})`, deal: deal.id });
      } else if (r.action === "eposta" && contact?.email && !/\.test$/i.test(contact.email)) {
        const { brandedEmail, emailConfigured } = await import("../notify");
        if (!emailConfigured()) continue;
        const { brandOf, emailSender } = await import("./brand");
        const brand = await brandOf(req, tenant);
        const subject = fill(r.emailSubject || deal.title);
        const body = fill(r.emailBody || "");
        if (await already(`Otomasyon e-postası: ${subject}`, false)) continue;
        await req.payload.sendEmail({ to: contact.email, subject, html: brandedEmail({ title: subject, intro: body, rows: [], link: null, base: process.env.NEXT_PUBLIC_SERVER_URL || "", sender: emailSender(brand) }), text: body, ...(brand.email ? { replyTo: brand.email } : {}) });
        await logActivity(req, { type: "eposta", title: `Otomasyon e-postası: ${subject}`, body: `${contact.email}\n${body}`, deal: deal.id, contact: idOf(deal.contact) ?? undefined });
      } else if (r.action === "bildirim") {
        const { inApp } = await import("../notify");
        await inApp(req, { subject: `${deal.title}: ${stageLabel(deal.stage)}`, intro: fill(r.emailBody || `${r.name} otomasyonu çalıştı.`), path: `/panel/firsatlar?firsat=${deal.id}`, tenant });
      }
    } catch (err) {
      req.payload.logger.warn({ err, rule: r.id }, "Otomasyon çalışmadı");
    }
  }
}
