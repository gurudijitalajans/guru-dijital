"use server";

import type { Where } from "payload";
import { getPanelContext } from "../context";
import type { Tone } from "../ui/badge";
import { sessionLost } from "../errors";
import { kanalAdi } from "@/lib/analiz/kanal";
import { headers } from "next/headers";
import type { PayloadRequest } from "payload";
import { cms } from "@/lib/cms";
import { brandedEmail, emailConfigured, inApp } from "@/payload/notify";

/**
 * Gelen kutusu: sitedeki sohbetler, form talepleri ve randevular tek listede.
 * Her işlem seçili işletmede ve kullanıcının yetkisiyle çalışır; sohbetler
 * Chatbot, talep ve randevular CRM modülü ister.
 */

export type InboxFilter = "bekleyen" | "benim" | "sohbet" | "talep" | "randevu" | "kapanan" | "ertelenen" | "spam" | "tumu";
export type InboxKind = "sohbet" | "talep" | "randevu";
export type InboxItem = { key: string; kind: InboxKind; title: string; preview: string; at: string; tone: Tone; label: string; waiting: boolean; assignee?: string; snoozed?: string };
export type InboxPage = { items: InboxItem[]; more: boolean };
/** Liste sayfa boyu; istemcideki Inbox aynı değeri kullanır */
const INBOX_PAGE = 40;

const TZ = "Europe/Istanbul";
const dateFmt = new Intl.DateTimeFormat("tr-TR", { timeZone: TZ, day: "numeric", month: "long", weekday: "long" });

const CONV: Record<string, [Tone, string]> = { bot: ["plain", "Asistanda"], ekip: ["info", "Ekipte"], kapali: ["plain", "Kapandı"] };
const LEAD: Record<string, [Tone, string]> = { yeni: ["info", "Yeni"], iletisim: ["plain", "İletişime geçildi"], teklif: ["warn", "Teklif verildi"], kazanildi: ["good", "Kazanıldı"], kaybedildi: ["plain", "Kaybedildi"] };
const BOOK: Record<string, [Tone, string]> = { bekliyor: ["warn", "Onay bekliyor"], onaylandi: ["good", "Onaylandı"], tamamlandi: ["plain", "Tamamlandı"], iptal: ["plain", "İptal"] };

const stampFmt = new Intl.DateTimeFormat("tr-TR", { timeZone: TZ, day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
type Conv = { id: number; snoozedUntil?: string | null; spam?: boolean | null; label?: string | null; name?: string | null; email?: string | null; phone?: string | null; topic?: string | null; page?: string | null; channel?: string | null; lastText?: string | null; lastMessageAt?: string | null; status: string; needsReply?: boolean | null; contact?: unknown; lead?: unknown; booking?: unknown; assignee?: unknown; createdAt: string; updatedAt: string };
type Lead = { id: number; snoozedUntil?: string | null; spam?: boolean | null; name: string; email: string; phone?: string | null; service?: string | null; subject?: string | null; message: string; status: string; source?: string | null; contact?: unknown; deal?: unknown; kaynak?: { kanal?: string | null; utmCampaign?: string | null; utmSource?: string | null; ref?: string | null; giris?: string | null } | null; createdAt: string; updatedAt: string };
type Booking = { id: number; name: string; email: string; phone?: string | null; date: string; time: string; topic?: string | null; note?: string | null; status: string; contact?: unknown; deal?: unknown; kaynak?: { kanal?: string | null; utmCampaign?: string | null; utmSource?: string | null; ref?: string | null; giris?: string | null } | null; createdAt: string; updatedAt: string };
const idOf = (v: unknown) => (v && typeof v === "object" ? (v as { id?: number }).id : (v as number | undefined)) ?? null;

/** Arama: kelimeler alanlardan birinde geçmeli (büyük küçük harf duyarsız) */
const textWhere = (q: string, fields: string[]): Where | undefined => {
  const words = q.trim().split(/\s+/).filter(Boolean).slice(0, 5);
  if (!words.length) return undefined;
  return { and: words.map((w) => ({ or: fields.map((f) => ({ [f]: { like: w } })) })) };
};
const both = (a?: Where, b?: Where): Where | undefined => (a && b ? { and: [a, b] } : (a ?? b));

/**
 * Liste: süzgeç, arama ve sayfa boyu. Her türden `limit` kadar okunur, tarihe
 * göre birleştirilir; "Daha fazla" sayfa boyunu büyüterek ilerler.
 */
export async function listInbox(filter: InboxFilter, opts: { q?: string; limit?: number } = {}): Promise<InboxPage> {
  const ctx = await getPanelContext();
  const chat = ctx.has("chat");
  const crm = ctx.has("crm");
  const limit = Math.min(Math.max(Number(opts.limit) || INBOX_PAGE, INBOX_PAGE), 400);
  const q = (opts.q ?? "").slice(0, 80);
  const mine = filter === "benim";
  const snoozedF = filter === "ertelenen";
  const spamF = filter === "spam";
  /* Ertelenen ve spam yalnız sohbet ve talepte; randevu ertelenmez */
  const want = (k: InboxKind) => (mine ? k === "sohbet" : snoozedF || spamF ? k !== "randevu" : filter === "tumu" || filter === "bekleyen" || filter === "kapanan" || filter === k);
  const closed = filter === "kapanan";
  const waiting = filter === "bekleyen";
  const now = new Date().toISOString();
  const notSpam: Where = { or: [{ spam: { equals: false } }, { spam: { exists: false } }] };
  const awake: Where = { or: [{ snoozedUntil: { exists: false } }, { snoozedUntil: { less_than_equal: now } }] };
  /* Süzgece göre ek koşul: spam yalnız Spam'de, ertelenen kayıt Bekleyen'de görünmez */
  const extra: Where = spamF ? { spam: { equals: true } } : snoozedF ? { and: [notSpam, { snoozedUntil: { greater_than: now } }] } : waiting ? { and: [notSpam, awake] } : notSpam;
  const convBase: Where | undefined = mine ? { assignee: { equals: ctx.user.id } } : waiting ? { needsReply: { equals: true } } : closed ? { status: { equals: "kapali" } } : filter === "tumu" || snoozedF || spamF ? undefined : { status: { not_equals: "kapali" } };
  const leadBase: Where | undefined = waiting ? { status: { equals: "yeni" } } : closed ? { status: { in: ["kazanildi", "kaybedildi"] } } : filter === "tumu" || snoozedF || spamF ? undefined : { status: { in: ["yeni", "iletisim", "teklif"] } };
  const convWhere = both(convBase, extra);
  const leadWhere = both(leadBase, extra);
  const bookWhere: Where | undefined = waiting ? { status: { equals: "bekliyor" } } : closed ? { status: { in: ["tamamlandi", "iptal"] } } : filter === "tumu" ? undefined : { status: { in: ["bekliyor", "onaylandi"] } };
  const snoozeLabel = (v?: string | null) => (v && v > now ? stampFmt.format(new Date(v)) : undefined);
  const none = Promise.resolve({ docs: [] as unknown[], totalDocs: 0 });
  const [convs, leads, books] = await Promise.all([
    chat && want("sohbet") ? ctx.find("conversations", { where: both(convWhere, textWhere(q, ["label", "name", "email", "phone", "lastText"])), sort: "-lastMessageAt", limit }) : none,
    crm && want("talep") ? ctx.find("leads", { where: both(leadWhere, textWhere(q, ["name", "email", "phone", "message", "subject", "service"])), sort: "-createdAt", limit }) : none,
    crm && want("randevu") ? ctx.find("bookings", { where: both(bookWhere, textWhere(q, ["name", "email", "phone", "topic", "note"])), sort: "-createdAt", limit }) : none,
  ]);
  const who = await ctx.names();
  const items: InboxItem[] = [
    ...(convs.docs as Conv[]).map((c) => {
      const [tone, label] = c.needsReply ? (["bad", "Yanıt bekliyor"] as [Tone, string]) : (CONV[c.status] ?? ["plain", c.status]);
      const via = c.channel === "whatsapp" ? "WhatsApp · " : c.channel === "instagram" ? "Instagram · " : "";
      return { key: `s${c.id}`, kind: "sohbet" as const, title: c.label || c.name || "Ziyaretçi", preview: `${via}${c.lastText ?? ""}`, at: c.lastMessageAt ?? c.updatedAt, tone, label, waiting: Boolean(c.needsReply), assignee: c.assignee ? who(c.assignee) || undefined : undefined, snoozed: snoozeLabel(c.snoozedUntil) };
    }),
    ...(leads.docs as Lead[]).map((l) => {
      const [tone, label] = LEAD[l.status] ?? ["plain", l.status];
      return { key: `t${l.id}`, kind: "talep" as const, title: l.name, preview: [l.service || l.subject, l.message].filter(Boolean).join(" · "), at: l.createdAt, tone, label, waiting: l.status === "yeni", snoozed: snoozeLabel(l.snoozedUntil) };
    }),
    ...(books.docs as Booking[]).map((b) => {
      const [tone, label] = BOOK[b.status] ?? ["plain", b.status];
      return { key: `r${b.id}`, kind: "randevu" as const, title: b.name, preview: `${dateFmt.format(new Date(b.date))} ${b.time}${b.topic ? ` · ${b.topic}` : ""}`, at: b.createdAt, tone, label, waiting: b.status === "bekliyor" };
    }),
  ];
  const total = convs.totalDocs + leads.totalDocs + books.totalDocs;
  return { items: items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit), more: total > limit };
}

export type ThreadMessage = { id: number | string; role: "ziyaretci" | "bot" | "ekip" | "sistem" | "not"; text: string; at: string; author?: string; unanswered?: boolean; deliveryError?: string };
export type Thread = {
  key: string;
  kind: InboxKind;
  id: number;
  title: string;
  subtitle: string;
  tone: Tone;
  label: string;
  status: string;
  messages: ThreadMessage[];
  fields: [string, string][];
  contact: { id: number; name: string; email: string; phone: string } | null;
  deals: { id: number; title: string; stage: string; value: number }[];
  links: { label: string; href: string }[];
  canned: { label: string; text: string }[];
  /** Sohbetin sorumlusu (yalnız sohbet) ve ekip (atama ve @bahsetme) */
  assignee: number | null;
  team: { id: number; name: string }[];
  snoozedUntil: string | null;
  spam: boolean;
  /** Aynı e-posta ya da telefonla CRM'de duran başka kişiler (bağlamak için) */
  duplicates: { id: number; name: string; detail: string }[];
  /** E-postayla yanıtın gideceği adres (talep ve randevu) */
  replyTo: string;
};

const digits = (v?: string | null) => (v ?? "").replace(/\D/g, "").slice(-10);
/** Aynı e-posta ya da telefon numarasının son 10 hanesiyle eşleşen diğer kişiler */
async function duplicatesOf(contactId: number | null, email?: string | null, phone?: string | null) {
  const ctx = await getPanelContext();
  if (!ctx.has("crm") || (!email && digits(phone).length < 10)) return [];
  /* Telefon boşluklu ya da +90'lı saklanabilir: son iki haneyle adaylar okunur, eşleşme rakamlarla yapılır */
  const or: Where[] = [...(email ? [{ email: { equals: email.toLowerCase() } }] : []), ...(digits(phone).length === 10 ? [{ phone: { like: digits(phone).slice(-2) } }] : [])];
  const r = await ctx.find("contacts", { where: { and: [{ or }, ...(contactId ? [{ id: { not_equals: contactId } }] : [])] }, limit: 300, depth: 1 });
  return (r.docs as { id: number; name: string; email?: string | null; phone?: string | null; company?: { name?: string } | number | null }[])
    .filter((c) => (email && c.email?.toLowerCase() === email.toLowerCase()) || (digits(c.phone).length === 10 && digits(c.phone) === digits(phone)))
    .slice(0, 5)
    .map((c) => ({ id: c.id, name: c.name, detail: [typeof c.company === "object" ? c.company?.name : null, c.email, c.phone].filter(Boolean).join(" · ") }));
}

/** Talep ve randevuya panelden yazılan notlar ve gönderilen e-postalar */
async function activityMessages(field: "lead" | "booking", id: number): Promise<ThreadMessage[]> {
  const ctx = await getPanelContext();
  const [r, who] = await Promise.all([ctx.find("activities", { where: { and: [{ [field]: { equals: id } }, { type: { in: ["not", "eposta"] } }] }, sort: "createdAt", limit: 200 }), ctx.names()]);
  return (r.docs as { id: number; type: string; title: string; body?: string | null; owner?: unknown; createdAt: string }[]).map((a) => ({
    id: `a${a.id}`,
    role: a.type === "not" ? ("not" as const) : ("ekip" as const),
    text: a.type === "eposta" ? `E-posta: ${a.title}\n\n${a.body ?? ""}` : (a.body ?? a.title),
    at: a.createdAt,
    author: who(a.owner) || "Ekip",
  }));
}

const STAGE: Record<string, string> = { aday: "Aday", gorusme: "Görüşme", teklif: "Teklif", kazanildi: "Kazanıldı", kaybedildi: "Kaybedildi" };

async function contactBlock(contactId: number | null) {
  const ctx = await getPanelContext();
  if (!contactId || !ctx.has("crm")) return { contact: null, deals: [] };
  const c = (await ctx.findByID("contacts", contactId, 0)) as { id: number; name: string; email?: string | null; phone?: string | null } | null;
  if (!c) return { contact: null, deals: [] };
  const deals = await ctx.find("deals", { where: { contact: { equals: c.id } }, sort: "-updatedAt", limit: 5 });
  return {
    contact: { id: c.id, name: c.name, email: c.email ?? "", phone: c.phone ?? "" },
    deals: (deals.docs as { id: number; title: string; stage: string; value?: number | null }[]).map((d) => ({ id: d.id, title: d.title, stage: STAGE[d.stage] ?? d.stage, value: d.value ?? 0 })),
  };
}

/** "Google Ads · kampanya: ekim-web · giriş: /hizmetler/web-tasarim" */
function kaynakText(k?: { kanal?: string | null; utmCampaign?: string | null; utmSource?: string | null; ref?: string | null; giris?: string | null } | null) {
  if (!k?.kanal) return "";
  return [kanalAdi(k.kanal), k.utmCampaign ? `kampanya: ${k.utmCampaign}` : k.utmSource ? `kaynak: ${k.utmSource}` : k.ref ? k.ref : null, k.giris ? `giriş: ${k.giris}` : null].filter(Boolean).join(" · ");
}

/** Hazır yanıtlar (Ayarlar > Sohbet asistanı); talep ve randevu e-postasında da kullanılır */
async function cannedOf() {
  const ctx = await getPanelContext();
  if (!ctx.has("chat")) return [];
  const cfg = await ctx.find("chatbot-config", { limit: 1 });
  return ((cfg.docs[0] as { cannedReplies?: { label: string; text: string }[] | null } | undefined)?.cannedReplies ?? []).map((r) => ({ label: r.label, text: r.text }));
}

export async function getThread(key: string): Promise<Thread | null> {
  const ctx = await getPanelContext();
  /* "t12" ve eski e-postalardaki "t:12" biçimi */
  const m = /^([str]):?(\d+)$/.exec(key);
  if (!m) return null;
  const kind = m[1];
  const id = Number(m[2]);

  if (kind === "s" && ctx.has("chat")) {
    const c = (await ctx.findByID("conversations", id, 0)) as Conv | null;
    if (!c) return null;
    const [msgs, cfg] = await Promise.all([
      /* En yeni 300 mesaj (uzun WhatsApp yazışmalarında eskiler değil yeniler görünsün) */
      ctx.find("chat-messages", { where: { conversation: { equals: c.id } }, sort: "-createdAt", limit: 300, depth: 0 }),
      ctx.find("chatbot-config", { limit: 1 }),
    ]);
    const who = await ctx.names();
    msgs.docs.reverse();
    const block = await contactBlock(idOf(c.contact));
    const [tone, label] = c.needsReply ? (["bad", "Yanıt bekliyor"] as [Tone, string]) : (CONV[c.status] ?? ["plain", c.status]);
    const canned = ((cfg.docs[0] as { cannedReplies?: { label: string; text: string }[] | null } | undefined)?.cannedReplies ?? []).map((r) => ({ label: r.label, text: r.text }));
    return {
      key, kind: "sohbet", id: c.id, title: c.label || c.name || "Ziyaretçi",
      subtitle:
        [c.channel === "whatsapp" ? "WhatsApp" : c.channel === "instagram" ? "Instagram" : null, c.email, c.phone, c.page && c.channel === "web" ? `Sayfa: ${c.page}` : null].filter(Boolean).join(" · ") ||
        "Ziyaretçi henüz bilgi bırakmadı",
      tone, label, status: c.status,
      messages: (msgs.docs as { id: number; role: ThreadMessage["role"]; text: string; createdAt: string; author?: unknown; unanswered?: boolean | null; deliveryError?: string | null }[]).map((m) => ({
        id: m.id, role: m.role, text: m.text, at: m.createdAt, unanswered: Boolean(m.unanswered),
        ...((m.role === "ekip" || m.role === "not") && m.author ? { author: who(m.author) || "Ekip" } : {}),
        ...(m.deliveryError ? { deliveryError: m.deliveryError } : {}),
      })),
      fields: [["Konu", c.topic ?? ""], ["E-posta", c.email ?? ""], ["Telefon", c.phone ?? ""]],
      ...block,
      links: [
        ...(idOf(c.lead) ? [{ label: "Talep", href: `/panel/gelen?s=t${idOf(c.lead)}` }] : []),
        ...(idOf(c.booking) ? [{ label: "Randevu", href: `/panel/gelen?s=r${idOf(c.booking)}` }] : []),
      ],
      canned,
      assignee: idOf(c.assignee),
      team: (await ctx.team()).map((t) => ({ id: t.id, name: t.name })),
      snoozedUntil: c.snoozedUntil ?? null,
      spam: Boolean(c.spam),
      duplicates: await duplicatesOf(idOf(c.contact), c.email, c.phone),
      replyTo: "",
    };
  }
  if (kind === "t" && ctx.has("crm")) {
    const l = (await ctx.findByID("leads", id, 0)) as Lead | null;
    if (!l) return null;
    const block = await contactBlock(idOf(l.contact));
    const [tone, label] = LEAD[l.status] ?? ["plain", l.status];
    return {
      key, kind: "talep", id: l.id, title: l.name, subtitle: [l.email, l.phone].filter(Boolean).join(" · "), tone, label, status: l.status,
      messages: [
        { id: 0, role: "sistem", text: `Site formundan talep${l.source ? ` · ${l.source}` : ""}`, at: l.createdAt },
        { id: 1, role: "ziyaretci", text: [l.subject, l.message].filter(Boolean).join("\n\n"), at: l.createdAt },
        ...(await activityMessages("lead", l.id)),
      ],
      fields: [["Hizmet", l.service ?? ""], ["E-posta", l.email], ["Telefon", l.phone ?? ""], ["Kaynak", kaynakText(l.kaynak)]],
      ...block,
      links: [{ label: "Tüm alanları düzenle", href: `/panel/duzenle/leads/${l.id}` }],
      canned: await cannedOf(),
      assignee: null,
      team: (await ctx.team()).map((t) => ({ id: t.id, name: t.name })),
      snoozedUntil: l.snoozedUntil ?? null,
      spam: Boolean(l.spam),
      duplicates: await duplicatesOf(idOf(l.contact), l.email, l.phone),
      replyTo: l.email,
    };
  }
  if (kind === "r" && ctx.has("crm")) {
    const b = (await ctx.findByID("bookings", id, 0)) as Booking | null;
    if (!b) return null;
    const block = await contactBlock(idOf(b.contact));
    const [tone, label] = BOOK[b.status] ?? ["plain", b.status];
    return {
      key, kind: "randevu", id: b.id, title: b.name, subtitle: [b.email, b.phone].filter(Boolean).join(" · "), tone, label, status: b.status,
      messages: [{ id: 0, role: "sistem", text: `Randevu talebi · ${dateFmt.format(new Date(b.date))} ${b.time}${b.topic ? ` · ${b.topic}` : ""}`, at: b.createdAt }, ...(b.note ? [{ id: 1, role: "ziyaretci" as const, text: b.note, at: b.createdAt }] : []), ...(await activityMessages("booking", b.id))],
      fields: [["Tarih", `${dateFmt.format(new Date(b.date))} ${b.time}`], ["Konu", b.topic ?? ""], ["E-posta", b.email], ["Telefon", b.phone ?? ""], ["Kaynak", kaynakText(b.kaynak)]],
      ...block,
      links: [{ label: "Tüm alanları düzenle", href: `/panel/duzenle/bookings/${b.id}` }],
      canned: await cannedOf(),
      assignee: null,
      team: (await ctx.team()).map((t) => ({ id: t.id, name: t.name })),
      snoozedUntil: null,
      spam: false,
      duplicates: await duplicatesOf(idOf(b.contact), b.email, b.phone),
      replyTo: b.email,
    };
  }
  return null;
}

type Result = { ok: boolean; error?: string };
const fail = (e: unknown): Result => ({ ok: false, error: e instanceof Error && e.message ? e.message : "İşlem yapılamadı." });

/** Ekip yanıtı: sohbet ekibe geçer, asistan susar (koleksiyon kancaları) */
export async function replyChat(id: number, text: string): Promise<Result> {
  const ctx = await getPanelContext();
  const body = text.trim().slice(0, 4000);
  if (!ctx.has("chat") || !body) return { ok: false, error: "Yanıt boş." };
  if (!(await ctx.findByID("conversations", id, 0))) return { ok: false, error: "Sohbet bulunamadı." };
  try {
    await ctx.create("chat-messages", { conversation: id, role: "ekip", text: body });
    return { ok: true };
  } catch (e) {
    const lost = sessionLost(e);
    if (lost) return lost as never;
    return fail(e);
  }
}

/** Sohbeti ekipten birine atar ya da atamayı kaldırır (null) */
export async function assignConversation(id: number, userId: number | null): Promise<Result> {
  const ctx = await getPanelContext();
  if (!ctx.has("chat")) return { ok: false, error: "Yetki yok." };
  if (userId !== null && !(await ctx.team()).some((t) => t.id === userId)) return { ok: false, error: "Bu kişi ekipte değil." };
  try {
    return (await ctx.update("conversations", id, { assignee: userId })) ? { ok: true } : { ok: false, error: "Sohbet bulunamadı." };
  } catch (e) {
    const lost = sessionLost(e);
    if (lost) return lost as never;
    return fail(e);
  }
}

export async function setConversation(id: number, action: "devral" | "asistan" | "kapat" | "ac" | "bana"): Promise<Result> {
  const ctx = await getPanelContext();
  if (!ctx.has("chat")) return { ok: false, error: "Yetki yok." };
  const data =
    action === "devral" ? { status: "ekip", needsReply: true }
    : action === "asistan" ? { status: "bot", needsReply: false }
    : action === "kapat" ? { status: "kapali", needsReply: false }
    : action === "ac" ? { status: "ekip", needsReply: true }
    : { assignee: ctx.user.id };
  try {
    return (await ctx.update("conversations", id, data)) ? { ok: true } : { ok: false, error: "Sohbet bulunamadı." };
  } catch (e) {
    const lost = sessionLost(e);
    if (lost) return lost as never;
    return fail(e);
  }
}

const LEAD_STATUS = ["yeni", "iletisim", "teklif", "kazanildi", "kaybedildi"];
const BOOK_STATUS = ["bekliyor", "onaylandi", "tamamlandi", "iptal"];

/** Talep ve randevu durumu: bağlı fırsat ve takvim kayıtları kancalarla güncellenir */
export async function setStatus(kind: "talep" | "randevu", id: number, status: string): Promise<Result> {
  const ctx = await getPanelContext();
  if (!ctx.has("crm")) return { ok: false, error: "Yetki yok." };
  const allowed = kind === "talep" ? LEAD_STATUS : BOOK_STATUS;
  if (!allowed.includes(status)) return { ok: false, error: "Geçersiz durum." };
  try {
    return (await ctx.update(kind === "talep" ? "leads" : "bookings", id, { status })) ? { ok: true } : { ok: false, error: "Kayıt bulunamadı." };
  } catch (e) {
    const lost = sessionLost(e);
    if (lost) return lost as never;
    return fail(e);
  }
}

/**
 * Sohbet, talep ya da randevuyu kalıcı siler (yalnız işletme yöneticisi).
 * Sohbetin mesajları da silinir; talebe bağlı kişi ve fırsat CRM'de kalır.
 */
export async function deleteInboxItem(kind: InboxKind, id: number): Promise<Result> {
  const ctx = await getPanelContext();
  if (!ctx.isTenantAdmin) return { ok: false, error: "Kaydı yalnız işletme yöneticisi silebilir." };
  if (!ctx.has(kind === "sohbet" ? "chat" : "crm")) return { ok: false, error: "Yetki yok." };
  try {
    if (kind === "sohbet") {
      if (!(await ctx.findByID("conversations", id, 0))) return { ok: false, error: "Sohbet bulunamadı." };
      const msgs = await ctx.find("chat-messages", { where: { conversation: { equals: id } }, limit: 2000, select: { id: true } });
      for (const m of msgs.docs) await ctx.remove("chat-messages", m.id);
    }
    const ok = await ctx.remove(kind === "sohbet" ? "conversations" : kind === "talep" ? "leads" : "bookings", id);
    return ok ? { ok: true } : { ok: false, error: "Kayıt bulunamadı." };
  } catch (e) {
    const lost = sessionLost(e);
    if (lost) return lost as never;
    return fail(e);
  }
}

/* ---------- Gelen Kutusu 2.0: erteleme, okunmadı, spam, toplu işlem ---------- */

const parseKey = (key: string): { kind: InboxKind; id: number } | null => {
  const m = /^([str]):?(\d+)$/.exec(key);
  return m ? { kind: m[1] === "s" ? "sohbet" : m[1] === "t" ? "talep" : "randevu", id: Number(m[2]) } : null;
};
const COLL = { sohbet: "conversations", talep: "leads", randevu: "bookings" } as const;
const guard = async (fn: () => Promise<Result>): Promise<Result> => {
  try {
    return await fn();
  } catch (e) {
    const lost = sessionLost(e);
    if (lost) return lost as never;
    return fail(e);
  }
};

/** Erteleme: until boşsa erteleme kalkar. Sohbet ve talepte; yeni mesaj gelince sohbet ertelemesi kendiliğinden kalkar */
export async function snoozeItems(keys: string[], until: string | null): Promise<Result> {
  return guard(async () => {
    const ctx = await getPanelContext();
    const at = until ? new Date(until) : null;
    if (at && (Number.isNaN(at.getTime()) || at.getTime() < Date.now())) return { ok: false, error: "Erteleme zamanı ileride olmalı." };
    let n = 0;
    for (const k of keys.slice(0, 200)) {
      const p = parseKey(k);
      if (!p || p.kind === "randevu" || !ctx.has(p.kind === "sohbet" ? "chat" : "crm")) continue;
      if (await ctx.update(COLL[p.kind], p.id, { snoozedUntil: at ? at.toISOString() : null })) n++;
    }
    return n ? { ok: true } : { ok: false, error: "Ertelenecek sohbet ya da talep seçilmedi." };
  });
}

/** Okunmadı: sohbet yeniden "Yanıt bekliyor" olur ve Bekleyen'e düşer */
export async function markUnread(keys: string[]): Promise<Result> {
  return guard(async () => {
    const ctx = await getPanelContext();
    if (!ctx.has("chat")) return { ok: false, error: "Yetki yok." };
    for (const k of keys.slice(0, 200)) {
      const p = parseKey(k);
      if (p?.kind === "sohbet") await ctx.update("conversations", p.id, { needsReply: true, snoozedUntil: null });
    }
    return { ok: true };
  });
}

/**
 * Spam: kayıt listelerden çıkar. Talep spam ise kendiliğinden açılan "Aday"
 * fırsatı ve görevleri silinir; kişinin başka kaydı yoksa kişi de silinir.
 * Geri alınınca (spam=false) talep listeye döner; CRM kaydı yeniden açılmaz.
 */
export async function setSpam(keys: string[], spam: boolean): Promise<Result> {
  return guard(async () => {
    const ctx = await getPanelContext();
    for (const k of keys.slice(0, 200)) {
      const p = parseKey(k);
      if (!p || p.kind === "randevu" || !ctx.has(p.kind === "sohbet" ? "chat" : "crm")) continue;
      if (p.kind === "sohbet") {
        await ctx.update("conversations", p.id, { spam, ...(spam ? { needsReply: false, status: "kapali" } : {}) });
        continue;
      }
      const lead = (await ctx.findByID("leads", p.id, 0)) as Lead | null;
      if (!lead) continue;
      await ctx.update("leads", p.id, { spam, ...(spam ? { contact: null, deal: null } : {}) });
      if (!spam) continue;
      const dealId = idOf(lead.deal);
      const deal = dealId ? ((await ctx.findByID("deals", dealId, 0)) as { id: number; stage: string } | null) : null;
      if (deal && deal.stage === "aday") {
        const acts = await ctx.find("activities", { where: { deal: { equals: deal.id } }, limit: 200, select: { id: true } });
        for (const a of acts.docs) await ctx.purge("activities", a.id);
        await ctx.purge("deals", deal.id);
      }
      const contactId = idOf(lead.contact);
      if (contactId && !(await contactInUse(contactId))) await ctx.purge("contacts", contactId);
    }
    return { ok: true };
  });
}

/** Kişinin başka talep, randevu, sohbet, fırsat, teklif ya da projesi var mı */
async function contactInUse(contactId: number) {
  const ctx = await getPanelContext();
  const where = { contact: { equals: contactId } };
  const counts = await Promise.all((["leads", "bookings", "conversations", "deals", "quotes", "projects"] as const).map((c) => ctx.count(c, where).catch(() => 0)));
  return counts.some((n) => n > 0);
}

/** Toplu işlem: ata (sohbet), kapat (sohbet), sil (işletme yöneticisi) */
export async function bulkInbox(keys: string[], action: "ata" | "kapat" | "sil", userId?: number | null): Promise<Result> {
  return guard(async () => {
    const ctx = await getPanelContext();
    const list = keys.map(parseKey).filter((p): p is { kind: InboxKind; id: number } => Boolean(p)).slice(0, 200);
    if (action === "sil") {
      if (!ctx.isTenantAdmin) return { ok: false, error: "Kaydı yalnız işletme yöneticisi silebilir." };
      for (const p of list) {
        const r = await deleteInboxItem(p.kind, p.id);
        if (!r.ok) return r;
      }
      return { ok: true };
    }
    if (!ctx.has("chat")) return { ok: false, error: "Yetki yok." };
    if (action === "ata" && userId && !(await ctx.team()).some((t) => t.id === userId)) return { ok: false, error: "Bu kişi ekipte değil." };
    for (const p of list.filter((x) => x.kind === "sohbet")) {
      await ctx.update("conversations", p.id, action === "ata" ? { assignee: userId ?? null } : { status: "kapali", needsReply: false });
    }
    return { ok: true };
  });
}

/* ---------- Yazı kutusu: iç not, @bahsetme, e-postayla yanıt ---------- */

async function notifyMentions(ids: number[], title: string, path: string, text: string) {
  const ctx = await getPanelContext();
  const team = new Set((await ctx.team()).map((t) => t.id));
  const users = [...new Set(ids)].filter((id) => team.has(id) && id !== ctx.user.id);
  if (!users.length) return;
  const payload = await cms();
  const req = { payload, user: ctx.user, headers: await headers() } as unknown as PayloadRequest;
  await inApp(req, { subject: `${ctx.user.name ?? "Bir ekip arkadaşınız"} sizden bahsetti: ${title}`, intro: text.slice(0, 280), path, tenant: ctx.tenant.id, kind: "bahsetme" }, users);
}

/** İç not: müşteriye gitmez, yalnız ekip görür; bahsedilen kişilere bildirim gider */
export async function addInternalNote(key: string, text: string, mentions: number[] = []): Promise<Result> {
  return guard(async () => {
    const ctx = await getPanelContext();
    const p = parseKey(key);
    const body = text.trim().slice(0, 4000);
    if (!p || !body) return { ok: false, error: "Not boş." };
    let title = "";
    if (p.kind === "sohbet") {
      if (!ctx.has("chat")) return { ok: false, error: "Yetki yok." };
      const c = (await ctx.findByID("conversations", p.id, 0)) as Conv | null;
      if (!c) return { ok: false, error: "Sohbet bulunamadı." };
      await ctx.create("chat-messages", { conversation: p.id, role: "not", text: body });
      title = c.label || c.name || "Sohbet";
    } else {
      if (!ctx.has("crm")) return { ok: false, error: "Yetki yok." };
      const r = (await ctx.findByID(COLL[p.kind], p.id, 0)) as { id: number; name: string; contact?: unknown; deal?: unknown } | null;
      if (!r) return { ok: false, error: "Kayıt bulunamadı." };
      await ctx.create("activities", { type: "not", title: body.slice(0, 120), body, [p.kind === "talep" ? "lead" : "booking"]: p.id, contact: idOf(r.contact), deal: idOf(r.deal), done: true });
      title = r.name;
    }
    await notifyMentions(mentions, title, `/panel/gelen?f=tumu&s=${key}`, body);
    return { ok: true };
  });
}

/**
 * Talep ve randevuya e-postayla yanıt: markalı şablon, yanıt adresi yazan ekip
 * üyesi. Gönderilen e-posta kişinin ve fırsatın geçmişine de yazılır.
 */
export async function replyByEmail(key: string, subject: string, text: string): Promise<Result> {
  return guard(async () => {
    const ctx = await getPanelContext();
    const p = parseKey(key);
    const body = text.trim().slice(0, 6000);
    const subj = subject.trim().slice(0, 160);
    if (!p || p.kind === "sohbet" || !ctx.has("crm")) return { ok: false, error: "Yetki yok." };
    if (!body || !subj) return { ok: false, error: "Konu ve mesaj yazın." };
    if (!emailConfigured()) return { ok: false, error: "E-posta servisi bağlı değil (RESEND_API_KEY)." };
    const r = (await ctx.findByID(COLL[p.kind], p.id, 0)) as { id: number; name: string; email: string; contact?: unknown; deal?: unknown } | null;
    if (!r?.email) return { ok: false, error: "Kaydın e-posta adresi yok." };
    const payload = await cms();
    const base = process.env.NEXT_PUBLIC_SERVER_URL || "";
    const html = brandedEmail({ title: subj, intro: body, rows: [], link: null, base });
    try {
      await payload.sendEmail({ to: r.email, subject: subj, html, text: body, replyTo: ctx.user.email });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      /* Resend, alan adı doğrulanmadan yalnız hesap sahibine gönderir */
      return { ok: false, error: /verify a domain|testing emails|own email/i.test(msg) ? "Gönderen alan adı Resend'de doğrulanmadığı için müşteriye e-posta gidemiyor." : msg || "E-posta gönderilemedi." };
    }
    await ctx.create("activities", { type: "eposta", title: subj, body, [p.kind === "talep" ? "lead" : "booking"]: p.id, contact: idOf(r.contact), deal: idOf(r.deal), done: true });
    if (p.kind === "talep") {
      const lead = (await ctx.findByID("leads", p.id, 0)) as Lead | null;
      if (lead?.status === "yeni") await ctx.update("leads", p.id, { status: "iletisim" });
    }
    return { ok: true };
  });
}

/** WhatsApp ya da Instagram'a gidemeyen mesajı yeniden gönderir */
export async function retryDelivery(messageId: number): Promise<Result> {
  return guard(async () => {
    const ctx = await getPanelContext();
    if (!ctx.has("chat")) return { ok: false, error: "Yetki yok." };
    const m = (await ctx.findByID("chat-messages", messageId, 0)) as { id: number; role: string; text: string; conversation: unknown } | null;
    if (!m) return { ok: false, error: "Mesaj bulunamadı." };
    const payload = await cms();
    const req = { payload, user: ctx.user, headers: await headers() } as unknown as PayloadRequest;
    const { deliverOutbound } = await import("@/payload/channels/meta");
    const error = await deliverOutbound(req, m);
    return error ? { ok: false, error: `Yine gönderilemedi: ${error}` } : { ok: true };
  });
}

/**
 * Mükerrer kişiyi birleştir: kaydın kişisi seçilen mevcut kişi olur; eski
 * kişinin talep, randevu, sohbet, fırsat, teklif, proje ve etkinlikleri ona
 * taşınır, boş kalan eski kişi silinir.
 */
export async function linkToContact(key: string, targetId: number): Promise<Result> {
  return guard(async () => {
    const ctx = await getPanelContext();
    const p = parseKey(key);
    if (!p || !ctx.has("crm")) return { ok: false, error: "Yetki yok." };
    const target = await ctx.findByID("contacts", targetId, 0);
    if (!target) return { ok: false, error: "Kişi bulunamadı." };
    const rec = (await ctx.findByID(COLL[p.kind], p.id, 0)) as { contact?: unknown } | null;
    if (!rec) return { ok: false, error: "Kayıt bulunamadı." };
    const old = idOf(rec.contact);
    await ctx.update(COLL[p.kind], p.id, { contact: targetId });
    if (old && old !== targetId) {
      for (const c of ["leads", "bookings", "conversations", "deals", "quotes", "projects", "activities"] as const) {
        const r = await ctx.find(c, { where: { contact: { equals: old } }, limit: 500, select: { id: true } }).catch(() => ({ docs: [] as { id: number }[] }));
        for (const d of r.docs) await ctx.update(c, d.id, { contact: targetId });
      }
      if (!(await contactInUse(old))) await ctx.purge("contacts", old);
    }
    return { ok: true };
  });
}
