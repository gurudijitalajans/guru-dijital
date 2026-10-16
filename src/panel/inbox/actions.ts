"use server";

import type { Where } from "payload";
import { getPanelContext } from "../context";
import type { Tone } from "../ui/badge";
import { sessionLost } from "../errors";
import { kanalAdi } from "@/lib/analiz/kanal";

/**
 * Gelen kutusu: sitedeki sohbetler, form talepleri ve randevular tek listede.
 * Her işlem seçili işletmede ve kullanıcının yetkisiyle çalışır; sohbetler
 * Chatbot, talep ve randevular CRM modülü ister.
 */

export type InboxFilter = "bekleyen" | "sohbet" | "talep" | "randevu" | "kapanan" | "tumu";
export type InboxKind = "sohbet" | "talep" | "randevu";
export type InboxItem = { key: string; kind: InboxKind; title: string; preview: string; at: string; tone: Tone; label: string; waiting: boolean };

const TZ = "Europe/Istanbul";
const dateFmt = new Intl.DateTimeFormat("tr-TR", { timeZone: TZ, day: "numeric", month: "long", weekday: "long" });

const CONV: Record<string, [Tone, string]> = { bot: ["plain", "Asistanda"], ekip: ["info", "Ekipte"], kapali: ["plain", "Kapandı"] };
const LEAD: Record<string, [Tone, string]> = { yeni: ["info", "Yeni"], iletisim: ["plain", "İletişime geçildi"], teklif: ["warn", "Teklif verildi"], kazanildi: ["good", "Kazanıldı"], kaybedildi: ["plain", "Kaybedildi"] };
const BOOK: Record<string, [Tone, string]> = { bekliyor: ["warn", "Onay bekliyor"], onaylandi: ["good", "Onaylandı"], tamamlandi: ["plain", "Tamamlandı"], iptal: ["plain", "İptal"] };

type Conv = { id: number; label?: string | null; name?: string | null; email?: string | null; phone?: string | null; topic?: string | null; page?: string | null; channel?: string | null; lastText?: string | null; lastMessageAt?: string | null; status: string; needsReply?: boolean | null; contact?: unknown; lead?: unknown; booking?: unknown; assignee?: unknown; createdAt: string; updatedAt: string };
type Lead = { id: number; name: string; email: string; phone?: string | null; service?: string | null; subject?: string | null; message: string; status: string; source?: string | null; contact?: unknown; deal?: unknown; kaynak?: { kanal?: string | null; utmCampaign?: string | null; utmSource?: string | null; ref?: string | null; giris?: string | null } | null; createdAt: string; updatedAt: string };
type Booking = { id: number; name: string; email: string; phone?: string | null; date: string; time: string; topic?: string | null; note?: string | null; status: string; contact?: unknown; deal?: unknown; kaynak?: { kanal?: string | null; utmCampaign?: string | null; utmSource?: string | null; ref?: string | null; giris?: string | null } | null; createdAt: string; updatedAt: string };
const idOf = (v: unknown) => (v && typeof v === "object" ? (v as { id?: number }).id : (v as number | undefined)) ?? null;

export async function listInbox(filter: InboxFilter): Promise<InboxItem[]> {
  const ctx = await getPanelContext();
  const chat = ctx.has("chat");
  const crm = ctx.has("crm");
  const want = (k: InboxKind) => filter === "tumu" || filter === "bekleyen" || filter === "kapanan" || filter === k;
  const closed = filter === "kapanan";
  const waiting = filter === "bekleyen";
  const convWhere: Where | undefined = waiting ? { needsReply: { equals: true } } : closed ? { status: { equals: "kapali" } } : filter === "tumu" ? undefined : { status: { not_equals: "kapali" } };
  const leadWhere: Where | undefined = waiting ? { status: { equals: "yeni" } } : closed ? { status: { in: ["kazanildi", "kaybedildi"] } } : filter === "tumu" ? undefined : { status: { in: ["yeni", "iletisim", "teklif"] } };
  const bookWhere: Where | undefined = waiting ? { status: { equals: "bekliyor" } } : closed ? { status: { in: ["tamamlandi", "iptal"] } } : filter === "tumu" ? undefined : { status: { in: ["bekliyor", "onaylandi"] } };
  const none = Promise.resolve({ docs: [] as unknown[] });
  const [convs, leads, books] = await Promise.all([
    chat && want("sohbet") ? ctx.find("conversations", { where: convWhere, sort: "-lastMessageAt", limit: 60 }) : none,
    crm && want("talep") ? ctx.find("leads", { where: leadWhere, sort: "-createdAt", limit: 60 }) : none,
    crm && want("randevu") ? ctx.find("bookings", { where: bookWhere, sort: "-createdAt", limit: 60 }) : none,
  ]);
  const items: InboxItem[] = [
    ...(convs.docs as Conv[]).map((c) => {
      const [tone, label] = c.needsReply ? (["bad", "Yanıt bekliyor"] as [Tone, string]) : (CONV[c.status] ?? ["plain", c.status]);
      const via = c.channel === "whatsapp" ? "WhatsApp · " : c.channel === "instagram" ? "Instagram · " : "";
      return { key: `s${c.id}`, kind: "sohbet" as const, title: c.label || c.name || "Ziyaretçi", preview: `${via}${c.lastText ?? ""}`, at: c.lastMessageAt ?? c.updatedAt, tone, label, waiting: Boolean(c.needsReply) };
    }),
    ...(leads.docs as Lead[]).map((l) => {
      const [tone, label] = LEAD[l.status] ?? ["plain", l.status];
      return { key: `t${l.id}`, kind: "talep" as const, title: l.name, preview: [l.service || l.subject, l.message].filter(Boolean).join(" · "), at: l.createdAt, tone, label, waiting: l.status === "yeni" };
    }),
    ...(books.docs as Booking[]).map((b) => {
      const [tone, label] = BOOK[b.status] ?? ["plain", b.status];
      return { key: `r${b.id}`, kind: "randevu" as const, title: b.name, preview: `${dateFmt.format(new Date(b.date))} ${b.time}${b.topic ? ` · ${b.topic}` : ""}`, at: b.createdAt, tone, label, waiting: b.status === "bekliyor" };
    }),
  ];
  return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 80);
}

export type ThreadMessage = { id: number; role: "ziyaretci" | "bot" | "ekip" | "sistem"; text: string; at: string; author?: string; unanswered?: boolean };
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
};

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
      messages: (msgs.docs as { id: number; role: ThreadMessage["role"]; text: string; createdAt: string; author?: unknown; unanswered?: boolean | null }[]).map((m) => ({
        id: m.id, role: m.role, text: m.text, at: m.createdAt, unanswered: Boolean(m.unanswered),
        ...(m.role === "ekip" && m.author ? { author: who(m.author) || "Ekip" } : {}),
      })),
      fields: [["Konu", c.topic ?? ""], ["E-posta", c.email ?? ""], ["Telefon", c.phone ?? ""]],
      ...block,
      links: [
        ...(idOf(c.lead) ? [{ label: "Talep", href: `/panel/gelen?s=t${idOf(c.lead)}` }] : []),
        ...(idOf(c.booking) ? [{ label: "Randevu", href: `/panel/gelen?s=r${idOf(c.booking)}` }] : []),
      ],
      canned,
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
      ],
      fields: [["Hizmet", l.service ?? ""], ["E-posta", l.email], ["Telefon", l.phone ?? ""], ["Kaynak", kaynakText(l.kaynak)]],
      ...block,
      links: [{ label: "Tüm alanları düzenle", href: `/panel/duzenle/leads/${l.id}` }],
      canned: [],
    };
  }
  if (kind === "r" && ctx.has("crm")) {
    const b = (await ctx.findByID("bookings", id, 0)) as Booking | null;
    if (!b) return null;
    const block = await contactBlock(idOf(b.contact));
    const [tone, label] = BOOK[b.status] ?? ["plain", b.status];
    return {
      key, kind: "randevu", id: b.id, title: b.name, subtitle: [b.email, b.phone].filter(Boolean).join(" · "), tone, label, status: b.status,
      messages: [{ id: 0, role: "sistem", text: `Randevu talebi · ${dateFmt.format(new Date(b.date))} ${b.time}${b.topic ? ` · ${b.topic}` : ""}`, at: b.createdAt }, ...(b.note ? [{ id: 1, role: "ziyaretci" as const, text: b.note, at: b.createdAt }] : [])],
      fields: [["Tarih", `${dateFmt.format(new Date(b.date))} ${b.time}`], ["Konu", b.topic ?? ""], ["E-posta", b.email], ["Telefon", b.phone ?? ""], ["Kaynak", kaynakText(b.kaynak)]],
      ...block,
      links: [{ label: "Tüm alanları düzenle", href: `/panel/duzenle/bookings/${b.id}` }],
      canned: [],
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
