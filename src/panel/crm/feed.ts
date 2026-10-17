import type { Where } from "payload";
import { getPanelContext } from "../context";
import { activityLabel } from "@/payload/crm/stages";

/**
 * Birleşik akış: bir fırsatın, kişinin ya da firmanın notları, görevleri,
 * aşama ve alan değişiklikleri, talepleri, randevuları, sohbetleri ve
 * teklifleri tek listede. Açık görevler ayrıca "Yapılacak" olarak döner.
 */
export type FeedTarget = { deal?: number; contact?: number; company?: number };
export type FeedItem = {
  id: string;
  /** aktivite: CRM etkinliği; diğerleri bağlı kayıt */
  kind: "aktivite" | "talep" | "randevu" | "sohbet" | "teklif";
  type: string;
  typeLabel: string;
  title: string;
  body: string;
  result: string;
  at: string;
  due: string | null;
  open: boolean;
  late: boolean;
  owner: string;
  activityId: number | null;
  href: string | null;
  /** Kendi notu (ya da işletme yöneticisi): düzenlenip silinebilir */
  editable: boolean;
};

const TASK_TYPES = ["gorev", "arama", "toplanti", "eposta"];
const QUOTE: Record<string, string> = { taslak: "Taslak", gonderildi: "Gönderildi", kabul: "Kabul edildi", red: "Reddedildi" };
const LEAD: Record<string, string> = { yeni: "Yeni", iletisim: "İletişime geçildi", teklif: "Teklif verildi", kazanildi: "Kazanıldı", kaybedildi: "Kaybedildi" };
const BOOK: Record<string, string> = { bekliyor: "Onay bekliyor", onaylandi: "Onaylandı", tamamlandi: "Tamamlandı", iptal: "İptal" };
const idOf = (v: unknown) => (v && typeof v === "object" ? ((v as { id?: number }).id ?? null) : ((v as number | null | undefined) ?? null));

export async function buildFeed(target: FeedTarget): Promise<FeedItem[]> {
  const ctx = await getPanelContext();
  if (!ctx.has("crm")) return [];
  const who = await ctx.names();
  const now = Date.now();

  /* Hedefe bağlı kişi ve fırsat kimlikleri: kişinin fırsatlarındaki etkinlikler de kişinin akışında */
  let contactIds: number[] = target.contact ? [target.contact] : [];
  if (target.company) {
    const members = await ctx.find("contacts", { where: { company: { equals: target.company } }, limit: 200, select: { id: true } });
    contactIds = members.docs.map((c) => c.id as number);
  }
  let dealIds: number[] = target.deal ? [target.deal] : [];
  if (!target.deal) {
    const or: Where[] = [...(contactIds.length ? [{ contact: { in: contactIds } }] : []), ...(target.company ? [{ company: { equals: target.company } }] : [])];
    if (or.length) dealIds = (await ctx.find("deals", { where: { or }, limit: 200, select: { id: true } })).docs.map((d) => d.id as number);
  }
  const actOr: Where[] = [
    ...(dealIds.length ? [{ deal: { in: dealIds } }] : []),
    ...(contactIds.length ? [{ contact: { in: contactIds } }] : []),
    ...(target.company ? [{ company: { equals: target.company } }] : []),
  ];
  const relOr = (field: "contact" | "deal"): Where | null => {
    const ids = field === "contact" ? contactIds : dealIds;
    return ids.length ? { [field]: { in: ids } } : null;
  };
  const none = Promise.resolve({ docs: [] as unknown[] });
  const leadW = relOr("contact");
  const quoteOr: Where[] = [...(dealIds.length ? [{ deal: { in: dealIds } }] : []), ...(contactIds.length ? [{ contact: { in: contactIds } }] : []), ...(target.company ? [{ company: { equals: target.company } }] : [])];
  const [acts, leads, books, convs, quotes] = await Promise.all([
    actOr.length ? ctx.find("activities", { where: { or: actOr }, sort: "-createdAt", limit: 200 }) : none,
    !target.deal && leadW ? ctx.find("leads", { where: leadW, sort: "-createdAt", limit: 50 }) : none,
    !target.deal && leadW ? ctx.find("bookings", { where: leadW, sort: "-createdAt", limit: 50 }) : none,
    !target.deal && leadW && ctx.has("chat") ? ctx.find("conversations", { where: leadW, sort: "-lastMessageAt", limit: 50 }) : none,
    quoteOr.length ? ctx.find("quotes", { where: { or: quoteOr }, sort: "-createdAt", limit: 50 }) : none,
  ]);

  const items: FeedItem[] = [];
  for (const raw of acts.docs as { id: number; type: string; title: string; body?: string | null; result?: string | null; done?: boolean | null; dueAt?: string | null; owner?: unknown; createdAt: string }[]) {
    const open = TASK_TYPES.includes(raw.type) && !raw.done;
    items.push({
      id: `a${raw.id}`,
      kind: "aktivite",
      type: raw.type,
      typeLabel: activityLabel(raw.type),
      title: raw.title,
      body: raw.body && raw.body !== raw.title ? raw.body : "",
      result: raw.result ?? "",
      at: raw.createdAt,
      due: raw.dueAt ?? null,
      open,
      late: open && Boolean(raw.dueAt) && new Date(raw.dueAt!).getTime() < now,
      owner: who(raw.owner),
      activityId: raw.id,
      href: null,
      editable: raw.type === "not" && (idOf(raw.owner) === ctx.user.id || ctx.isTenantAdmin),
    });
  }
  const base = { body: "", result: "", due: null, open: false, late: false, activityId: null, editable: false };
  for (const l of leads.docs as { id: number; name: string; service?: string | null; message?: string | null; status: string; createdAt: string }[])
    items.push({ ...base, id: `t${l.id}`, kind: "talep", type: "talep", typeLabel: "Site formu", title: `Talep: ${l.service || l.name}`, body: (l.message ?? "").slice(0, 280), at: l.createdAt, owner: LEAD[l.status] ?? l.status, href: `/panel/gelen?f=tumu&s=t${l.id}` });
  for (const b of books.docs as { id: number; date: string; time: string; topic?: string | null; status: string; createdAt: string }[])
    items.push({ ...base, id: `r${b.id}`, kind: "randevu", type: "randevu", typeLabel: "Randevu", title: `Randevu: ${new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "long" }).format(new Date(b.date))} ${b.time}`, body: b.topic ?? "", at: b.createdAt, owner: BOOK[b.status] ?? b.status, href: `/panel/gelen?f=tumu&s=r${b.id}` });
  for (const c of convs.docs as { id: number; label?: string | null; lastText?: string | null; channel?: string | null; lastMessageAt?: string | null; createdAt: string }[])
    items.push({ ...base, id: `s${c.id}`, kind: "sohbet", type: "sohbet", typeLabel: c.channel === "whatsapp" ? "WhatsApp" : c.channel === "instagram" ? "Instagram" : "Sohbet", title: `Sohbet: ${c.label ?? "Ziyaretçi"}`, body: c.lastText ?? "", at: c.lastMessageAt ?? c.createdAt, owner: "", href: `/panel/gelen?f=tumu&s=s${c.id}` });
  for (const q of quotes.docs as { id: number; number?: string | null; title: string; status: string; total?: number | null; createdAt: string; respondedAt?: string | null; customerNote?: string | null }[])
    items.push({
      ...base,
      id: `q${q.id}`,
      kind: "teklif",
      type: "teklif",
      typeLabel: "Teklif",
      title: `Teklif ${q.number ?? ""}: ${q.title}`,
      body: [new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(q.total ?? 0), q.customerNote ? `Müşterinin notu: ${q.customerNote}` : ""].filter(Boolean).join(" · "),
      at: q.respondedAt ?? q.createdAt,
      owner: QUOTE[q.status] ?? q.status,
      href: `/panel/teklifler/${q.id}`,
    });
  return items.sort((a, b) => b.at.localeCompare(a.at));
}
