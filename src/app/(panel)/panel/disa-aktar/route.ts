import { getPanelContext } from "@/panel/context";
import { SOURCES, stageLabel } from "@/payload/crm/stages";

/**
 * CSV dışa aktarma: /panel/disa-aktar?tur=kisiler|firmalar|firsatlar.
 * Seçili işletmenin kayıtları, kullanıcının yetkisiyle. Türkçe Excel'in
 * doğrudan açması için noktalı virgül ayraçlı ve UTF-8 BOM'lu.
 */
export const dynamic = "force-dynamic";

const nameOf = (v: unknown) => (v && typeof v === "object" ? ((v as { name?: string; title?: string }).name ?? (v as { title?: string }).title ?? "") : "");
const day = (v?: string | null) => (v ? new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(v)) : "");
/* Hücre: ayraç, tırnak ya da satır sonu varsa tırnak içine; formül sanılmasın diye =, +, -, @ ile başlayan metne ' eklenir */
const cell = (v: unknown) => {
  let s = v === null || v === undefined ? "" : String(v);
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function GET(req: Request) {
  const ctx = await getPanelContext();
  if (!ctx.has("crm")) return new Response("Yetki yok.", { status: 403 });
  const tur = new URL(req.url).searchParams.get("tur") ?? "kisiler";
  const source = Object.fromEntries(SOURCES.map((s) => [s.value, s.label]));
  let head: string[] = [];
  let rows: unknown[][] = [];
  if (tur === "firmalar") {
    const r = await ctx.find("companies", { sort: "name", limit: 5000 });
    head = ["Firma", "Sektör", "E-posta", "Telefon", "Web sitesi", "Adres", "Vergi dairesi", "Vergi no", "Eklenme"];
    rows = (r.docs as { name: string; sector?: string | null; email?: string | null; phone?: string | null; website?: string | null; address?: string | null; taxOffice?: string | null; taxNumber?: string | null; createdAt: string }[]).map((c) => [c.name, c.sector, c.email, c.phone, c.website, c.address, c.taxOffice, c.taxNumber, day(c.createdAt)]);
  } else if (tur === "firsatlar") {
    const [r, who] = await Promise.all([ctx.find("deals", { sort: "-updatedAt", limit: 5000, depth: 1 }), ctx.names()]);
    head = ["Fırsat", "Aşama", "Tutar (TL, KDV hariç)", "Kişi", "Firma", "Hizmet", "Sorumlu", "Tahmini kapanış", "Kapanış", "Kayıp sebebi", "Açılış"];
    rows = (r.docs as { title: string; stage: string; value?: number | null; contact?: unknown; company?: unknown; service?: string | null; owner?: unknown; expectedClose?: string | null; closedAt?: string | null; lostReason?: string | null; createdAt: string }[]).map((d) => [
      d.title,
      stageLabel(d.stage),
      d.value ? String(d.value).replace(".", ",") : "",
      nameOf(d.contact),
      nameOf(d.company),
      d.service,
      who(d.owner),
      day(d.expectedClose),
      day(d.closedAt),
      d.lostReason,
      day(d.createdAt),
    ]);
  } else {
    const r = await ctx.find("contacts", { sort: "name", limit: 5000, depth: 1 });
    head = ["Ad Soyad", "Unvan", "Firma", "E-posta", "Telefon", "Kaynak", "Etiketler", "Eklenme"];
    rows = (r.docs as { name: string; title?: string | null; company?: unknown; email?: string | null; phone?: string | null; source?: string | null; tags?: string[] | null; createdAt: string }[]).map((c) => [c.name, c.title, nameOf(c.company), c.email, c.phone, c.source ? (source[c.source] ?? c.source) : "", (c.tags ?? []).join(", "), day(c.createdAt)]);
  }
  const csv = "﻿" + [head, ...rows].map((r) => r.map(cell).join(";")).join("\r\n");
  const name = `${ctx.tenant.slug || "guru"}-${tur}-${new Date().toISOString().slice(0, 10)}.csv`;
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${name}"`, "Cache-Control": "no-store" } });
}
