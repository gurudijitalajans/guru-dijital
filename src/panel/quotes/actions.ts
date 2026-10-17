"use server";

import { getPanelContext } from "../context";
import { sessionLost } from "../errors";

/**
 * Teklif kaydı. Toplamlar, teklif numarası (işletme ön eki-yıl-sıra) ve
 * durum değişince fırsatın aşaması koleksiyon kancalarında hesaplanır.
 */
export type QuoteItemInput = { description: string; qty: number; unit: string; unitPrice: number; vatRate: string };
export type QuoteInput = { title: string; deal?: number | null; contact?: number | null; company?: number | null; items: QuoteItemInput[]; notes?: string; terms?: string; issueDate?: string; validUntil?: string; status?: string };
type Result = { ok: boolean; error?: string; id?: number };
const VAT = ["20", "10", "1", "0"];
const STATUS = ["taslak", "gonderildi", "kabul", "red"];
const day = (v?: string) => (v && /^\d{4}-\d{2}-\d{2}/.test(v) ? `${v.slice(0, 10)}T12:00:00.000Z` : undefined);

export async function saveQuote(id: number | null, d: QuoteInput): Promise<Result> {
  const ctx = await getPanelContext();
  if (!ctx.has("crm")) return { ok: false, error: "Yetki yok." };
  if (!d.title?.trim()) return { ok: false, error: "Teklif konusunu yazın." };
  const items = (d.items ?? [])
    .map((i) => ({ description: String(i.description ?? "").trim().slice(0, 300), qty: Math.max(0, Number(i.qty) || 0), unit: String(i.unit ?? "").trim().slice(0, 30) || "Adet", unitPrice: Math.max(0, Number(i.unitPrice) || 0), vatRate: VAT.includes(String(i.vatRate)) ? String(i.vatRate) : "20" }))
    .filter((i) => i.description);
  if (!items.length) return { ok: false, error: "En az bir kalem ekleyin." };
  /* Bağlı kayıtlar seçili işletmenin olmalı */
  for (const [col, v] of [["deals", d.deal], ["contacts", d.contact], ["companies", d.company]] as const) {
    if (v && !(await ctx.findByID(col, v, 0))) return { ok: false, error: "Bağlı kayıt bulunamadı." };
  }
  const data = {
    title: d.title.trim().slice(0, 200),
    deal: d.deal || null,
    contact: d.contact || null,
    company: d.company || null,
    items,
    notes: d.notes?.trim().slice(0, 4000) || null,
    terms: d.terms?.trim().slice(0, 4000) || null,
    ...(day(d.issueDate) ? { issueDate: day(d.issueDate) } : {}),
    ...(day(d.validUntil) ? { validUntil: day(d.validUntil) } : {}),
    ...(d.status && STATUS.includes(d.status) ? { status: d.status } : {}),
  };
  try {
    if (id) return (await ctx.update("quotes", id, data)) ? { ok: true, id } : { ok: false, error: "Teklif bulunamadı." };
    const doc = (await ctx.create("quotes", { ...data, owner: ctx.user.id })) as { id: number };
    return { ok: true, id: doc.id };
  } catch (e) {
    const lost = sessionLost(e);
    if (lost) return lost as never;
    return { ok: false, error: e instanceof Error && e.message ? e.message : "Kaydedilemedi." };
  }
}

export async function setQuoteStatus(id: number, status: string): Promise<Result> {
  const ctx = await getPanelContext();
  if (!ctx.has("crm") || !STATUS.includes(status)) return { ok: false, error: "Geçersiz işlem." };
  try {
    return (await ctx.update("quotes", id, { status })) ? { ok: true, id } : { ok: false, error: "Teklif bulunamadı." };
  } catch (e) {
    const lost = sessionLost(e);
    if (lost) return lost as never;
    return { ok: false, error: e instanceof Error && e.message ? e.message : "Kaydedilemedi." };
  }
}

/** Teklifi kalıcı siler (yalnız işletme yöneticisi) */
export async function deleteQuote(id: number): Promise<Result> {
  const ctx = await getPanelContext();
  if (!ctx.has("crm")) return { ok: false, error: "Yetki yok." };
  if (!ctx.isTenantAdmin) return { ok: false, error: "Teklifi yalnız işletme yöneticisi silebilir." };
  try {
    return (await ctx.remove("quotes", id)) ? { ok: true } : { ok: false, error: "Teklif bulunamadı." };
  } catch (e) {
    const lost = sessionLost(e);
    if (lost) return lost as never;
    return { ok: false, error: e instanceof Error && e.message ? e.message : "Silinemedi." };
  }
}

/** Teklifin taslak kopyası: aynı kalemler ve bağlantılar, yeni numara, bugünün tarihi */
export async function duplicateQuote(id: number): Promise<Result> {
  const ctx = await getPanelContext();
  if (!ctx.has("crm")) return { ok: false, error: "Yetki yok." };
  const q = (await ctx.findByID("quotes", id, 0)) as null | { title: string; deal?: unknown; contact?: unknown; company?: unknown; items?: QuoteItemInput[] | null; notes?: string | null; terms?: string | null };
  if (!q) return { ok: false, error: "Teklif bulunamadı." };
  const rel = (v: unknown) => (v && typeof v === "object" ? (v as { id: number }).id : (v as number | null | undefined)) ?? null;
  return saveQuote(null, {
    title: `${q.title} (kopya)`.slice(0, 200),
    deal: rel(q.deal),
    contact: rel(q.contact),
    company: rel(q.company),
    items: (q.items ?? []).map((i) => ({ description: i.description, qty: i.qty, unit: i.unit, unitPrice: i.unitPrice, vatRate: String(i.vatRate) })),
    notes: q.notes ?? undefined,
    terms: q.terms ?? undefined,
    issueDate: new Date().toISOString().slice(0, 10),
    status: "taslak",
  });
}

/* ---------- Müşteriye gönderme: açık bağlantı, e-posta, Kabul / Red ---------- */

const linkOf = (token: string) => `${process.env.NEXT_PUBLIC_SERVER_URL || ""}/teklif/${token}`;

/** Teklifin müşteri bağlantısı: yoksa tahmin edilemez bir anahtar üretilir */
export async function quoteLink(id: number): Promise<{ ok: boolean; error?: string; url?: string }> {
  const ctx = await getPanelContext();
  if (!ctx.has("crm")) return { ok: false, error: "Yetki yok." };
  try {
    const q = (await ctx.findByID("quotes", id, 0)) as { id: number; status: string; publicToken?: string | null } | null;
    if (!q) return { ok: false, error: "Teklif bulunamadı." };
    let token = q.publicToken;
    if (!token) {
      const { randomBytes } = await import("node:crypto");
      token = randomBytes(24).toString("base64url");
    }
    /* Bağlantı müşteriye iletilmek için alınır: taslak teklif Gönderildi olur (taslak kabul edilemez) */
    if (token !== q.publicToken || q.status === "taslak") await ctx.update("quotes", id, { publicToken: token, ...(q.status === "taslak" ? { status: "gonderildi", sentAt: new Date().toISOString() } : {}) });
    return { ok: true, url: linkOf(token) };
  } catch (e) {
    const lost = sessionLost(e);
    if (lost) return lost as never;
    return { ok: false, error: e instanceof Error ? e.message : "Bağlantı oluşturulamadı." };
  }
}

/**
 * Müşteriye gönder: markalı e-posta ve "Teklifi görüntüle" düğmesi. Teklif
 * Gönderildi olur (fırsat Teklif aşamasına geçer), akışa yazılır. E-posta
 * gidemezse bağlantı yine döner; kullanıcı kopyalayıp WhatsApp'tan iletebilir.
 */
export async function sendQuote(id: number, to: string, message: string): Promise<{ ok: boolean; error?: string; url?: string }> {
  const ctx = await getPanelContext();
  if (!ctx.has("crm")) return { ok: false, error: "Yetki yok." };
  const email = to.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Geçerli bir e-posta adresi yazın." };
  const link = await quoteLink(id);
  if (!link.ok || !link.url) return link;
  try {
    const q = (await ctx.findByID("quotes", id, 1)) as { id: number; number?: string | null; title: string; total?: number | null; validUntil?: string | null; status: string; deal?: unknown; contact?: unknown; company?: unknown } | null;
    if (!q) return { ok: false, error: "Teklif bulunamadı." };
    const { cms } = await import("@/lib/cms");
    const { brandedEmail, emailConfigured } = await import("@/payload/notify");
    const { brandOf, emailSender } = await import("@/payload/crm/brand");
    if (!emailConfigured()) return { ok: false, error: "E-posta servisi bağlı değil; bağlantıyı kopyalayıp iletebilirsiniz.", url: link.url };
    const payload = await cms();
    const base = process.env.NEXT_PUBLIC_SERVER_URL || "";
    const day = (v?: string | null) => (v ? new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "long", year: "numeric" }).format(new Date(v)) : "");
    const total = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(q.total ?? 0);
    const html = brandedEmail({
      title: `Teklifimiz: ${q.title}`,
      intro: message.trim() || "Merhaba, konuştuğumuz işe dair teklifimizi aşağıdaki bağlantıda bulabilirsiniz. Teklifi inceleyip aynı sayfadan kabul edebilir ya da sorularınızı iletebilirsiniz.",
      rows: [
        ["Teklif no", q.number ?? ""],
        ["Genel toplam", total],
        ...(q.validUntil ? ([["Geçerlilik", day(q.validUntil)]] as [string, string][]) : []),
      ],
      link: link.url,
      base,
      button: "Teklifi görüntüle",
      sender: emailSender(await brandOf({ payload, user: ctx.user } as never, ctx.tenant.id)),
    });
    try {
      await payload.sendEmail({ to: email, subject: `Teklif ${q.number ?? ""}: ${q.title}`.replace(/\s+/g, " "), html, text: `${message.trim()}\n\nTeklif: ${link.url}`, replyTo: ctx.user.email });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      return { ok: false, url: link.url, error: /verify a domain|testing emails|own email/i.test(msg) ? "Gönderen alan adı Resend'de doğrulanmadığı için e-posta müşteriye gidemedi; bağlantıyı kopyalayıp iletebilirsiniz." : msg || "E-posta gönderilemedi." };
    }
    /* E-posta gitti: kayıt güncellemesi başarısız olsa da "gönderildi" denir (yoksa ikinci kez gönderilir) */
    try {
      await ctx.update("quotes", id, { sentAt: new Date().toISOString(), ...(q.status === "taslak" ? { status: "gonderildi" } : {}) });
      const rel = (v: unknown) => (v && typeof v === "object" ? (v as { id: number }).id : (v as number | null | undefined)) ?? null;
      await ctx.create("activities", { type: "eposta", title: `Teklif gönderildi: ${q.number ?? q.title}`, body: `${email}\n${message.trim()}`.trim(), deal: rel(q.deal), contact: rel(q.contact), company: rel(q.company), done: true, owner: ctx.user.id });
    } catch (e) {
      payload.logger.error({ err: e }, "Teklif gönderimi kaydedilemedi");
    }
    return { ok: true, url: link.url };
  } catch (e) {
    const lost = sessionLost(e);
    if (lost) return lost as never;
    return { ok: false, error: e instanceof Error ? e.message : "Gönderilemedi.", url: link.url };
  }
}
