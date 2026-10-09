import "server-only";
import { headers } from "next/headers";
import { cms } from "@/lib/cms";

/**
 * Gömülü çerçevenin işletmesi ve izni. Site anahtarı işletmeyi bulur; çerçeve
 * yalnız "Site bağlantısı"ndaki adreslerden (ve panelin kendi önizlemesinden)
 * açılır. Tarayıcı gönderen sayfayı bildirmezse (Referer yok) açılır: kesin
 * koruma uçlardaki hız ve aylık sınırlardır.
 */
export type EmbedContext = {
  tenantId: number;
  tenantName: string;
  key: string;
  accent: string;
  chat: { enabled: boolean; botName: string; greeting: string; suggestions: string[]; notice: string };
  form: { enabled: boolean; title: string; askPhone: boolean; topics: string[]; successText: string; consentText: string; privacyUrl: string };
};

export async function embedContext(key: string | undefined): Promise<EmbedContext | "izin-yok" | null> {
  if (!key || !/^[A-Za-z0-9_-]{16,40}$/.test(key)) return null;
  const payload = await cms();
  const conn = (await payload.find({ collection: "site-connection", where: { siteKey: { equals: key } }, limit: 1, depth: 0, overrideAccess: true })).docs[0];
  if (!conn?.tenant) return null;
  const tenantId = typeof conn.tenant === "object" ? conn.tenant.id : conn.tenant;
  const tenant = await payload.findByID({ collection: "tenants", id: tenantId, depth: 0, overrideAccess: true }).catch(() => null);
  if (!tenant || tenant.status === "askida") return null;

  const h = await headers();
  const ref = h.get("referer");
  const self = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("x-forwarded-host") ?? h.get("host")}`;
  const allowed = new Set([...(conn.allowedOrigins ?? []).map((o) => o.origin), self, "http://localhost:3000"]);
  if (ref) {
    try {
      if (!allowed.has(new URL(ref).origin)) return "izin-yok";
    } catch {
      return "izin-yok";
    }
  }

  const chat = (await payload.find({ collection: "chatbot-config", where: { tenant: { equals: tenantId } }, limit: 1, depth: 0, overrideAccess: true })).docs[0];
  const modules = tenant.modules ?? [];
  return {
    tenantId,
    tenantName: tenant.name,
    key,
    accent: conn.accentColor || "#011441",
    chat: {
      enabled: Boolean(chat?.enabled) && modules.includes("chat"),
      botName: chat?.botName || `${tenant.name} Asistanı`,
      greeting: chat?.greeting ?? "",
      suggestions: (chat?.suggestions ?? []).map((s) => s.text).filter(Boolean),
      notice: chat?.notice ?? "",
    },
    form: {
      enabled: conn.form?.enabled !== false && modules.includes("crm"),
      title: conn.form?.title ?? "",
      askPhone: conn.form?.askPhone !== false,
      topics: (conn.form?.topics ?? []).map((t) => t.text).filter(Boolean),
      successText: conn.form?.successText || "Teşekkürler, mesajınızı aldık.",
      consentText: conn.form?.consentText ?? "",
      privacyUrl: conn.form?.privacyUrl ?? "",
    },
  };
}
