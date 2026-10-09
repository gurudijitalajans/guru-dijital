import type { PayloadHandler } from "payload";
import { brandOf } from "./brand";

/**
 * GET /api/quotes/:id/yazdir: teklifin müşteriye gidecek belgesi. Tarayıcıda
 * açılır ve yazdırma penceresini kendisi açar; "PDF olarak kaydet" ile PDF
 * olur. Yalnız panele giriş yapmış kullanıcı görebilir.
 */

const esc = (v: unknown) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
const money = (n: number | null | undefined) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 2 }).format(n ?? 0);
const date = (v: string | null | undefined) =>
  v ? new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "long", year: "numeric" }).format(new Date(v)) : "";
const lines = (v: string | null | undefined) => esc(v).replace(/\n/g, "<br>");

type Rel = { name?: string; email?: string | null; phone?: string | null; address?: string | null; taxOffice?: string | null; taxNumber?: string | null; title?: string | null } | number | string | null | undefined;
const obj = (r: Rel) => (r && typeof r === "object" ? r : null);

export const quotePrint: PayloadHandler = async (req) => {
  if (!req.user) return new Response("Bu belgeyi görmek için panele giriş yapın.", { status: 401 });
  const id = req.routeParams?.id as string;
  /* Yetkiye tabi okuma: kullanıcı yalnız kendi işletmesinin teklifini açabilir */
  const q = await req.payload.findByID({ collection: "quotes", id, depth: 1, req, overrideAccess: false }).catch(() => null);
  if (!q) return new Response("Teklif bulunamadı.", { status: 404 });
  /* Teklifi veren: teklifin işletmesi (Guru Dijital ya da müşteri işletmesi) */
  const brand = await brandOf(req, q.tenant);
  const company = obj(q.company as Rel);
  const contact = obj(q.contact as Rel);
  const from = [brand.email, brand.phone, brand.address, brand.tax].filter(Boolean);

  const rows = (q.items ?? [])
    .map((it, i) => {
      const line = (it.qty ?? 0) * (it.unitPrice ?? 0);
      return `<tr><td>${i + 1}</td><td>${esc(it.description)}</td><td class="n">${esc(it.qty)} ${esc(it.unit)}</td><td class="n">${money(it.unitPrice)}</td><td class="n">%${esc(it.vatRate)}</td><td class="n">${money(line)}</td></tr>`;
    })
    .join("");

  const html = `<!doctype html>
<html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Teklif ${esc(q.number)} · ${esc(company?.name ?? contact?.name ?? q.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 16mm 14mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Outfit, system-ui, sans-serif; color: #011441; font-size: 13px; line-height: 1.5; background: #f4f7fb; }
  .page { max-width: 820px; margin: 24px auto; background: #fff; padding: 40px 44px; border-radius: 12px; }
  header { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; border-bottom: 2px solid #011441; padding-bottom: 18px; }
  header img { height: 34px; }
  .meta { text-align: right; }
  .meta h1 { margin: 0 0 4px; font-size: 22px; font-weight: 600; }
  .muted { color: #6b7487; }
  .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 22px 0; }
  .parties h2 { font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: #6b7487; margin: 0 0 6px; font-weight: 500; }
  .subject { font-size: 16px; font-weight: 600; margin: 0 0 12px; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; font-weight: 500; color: #6b7487; font-size: 11px; text-transform: uppercase; letter-spacing: .06em; border-bottom: 1px solid #dfe5ee; padding: 8px 6px; }
  td { border-bottom: 1px solid #eef3fa; padding: 10px 6px; vertical-align: top; }
  .n { text-align: right; white-space: nowrap; }
  .totals { margin: 14px 0 0 auto; width: 300px; }
  .totals div { display: flex; justify-content: space-between; padding: 4px 6px; }
  .totals .grand { border-top: 2px solid #011441; margin-top: 4px; padding-top: 8px; font-size: 16px; font-weight: 600; }
  .block { margin-top: 24px; }
  .block h2 { font-size: 13px; margin: 0 0 4px; }
  footer { margin-top: 36px; padding-top: 14px; border-top: 1px solid #dfe5ee; font-size: 11px; color: #6b7487; display: flex; justify-content: space-between; gap: 16px; }
  .bar { max-width: 820px; margin: 16px auto 0; display: flex; gap: 8px; justify-content: flex-end; padding: 0 16px; }
  .bar button { font: inherit; border: 0; border-radius: 999px; background: #011441; color: #fff; padding: 10px 18px; min-height: 44px; cursor: pointer; }
  @media (max-width: 640px) { .page { padding: 24px 18px; margin: 12px; } .parties { grid-template-columns: 1fr; } header { flex-direction: column; } .meta { text-align: left; } .totals { width: 100%; } table { font-size: 12px; } }
  @media print { body { background: #fff; } .page { margin: 0; padding: 0; max-width: none; border-radius: 0; } .bar { display: none; } }
</style></head>
<body>
<div class="bar"><button onclick="window.print()">Yazdır / PDF olarak kaydet</button></div>
<main class="page">
  <header>
    ${brand.logo ? `<img src="${esc(brand.logo)}" alt="${esc(brand.name)}">` : `<b style="font-size:20px">${esc(brand.name)}</b>`}
    <div class="meta"><h1>Teklif</h1><div>No: <b>${esc(q.number)}</b></div><div class="muted">Tarih: ${date(q.issueDate)}</div><div class="muted">Geçerlilik: ${date(q.validUntil)}</div></div>
  </header>
  <section class="parties">
    <div><h2>Teklifi veren</h2><b>${esc(brand.name)}</b><br>${from.map(lines).join("<br>")}</div>
    <div><h2>Teklif sunulan</h2>
      ${company ? `<b>${esc(company.name)}</b><br>` : ""}
      ${contact ? `${esc(contact.name)}${contact.title ? `, ${esc(contact.title)}` : ""}<br>` : ""}
      ${company?.address ? `${lines(company.address)}<br>` : ""}
      ${company?.taxOffice || company?.taxNumber ? `<span class="muted">${esc([company?.taxOffice, company?.taxNumber].filter(Boolean).join(" / "))}</span><br>` : ""}
      ${contact?.email ? `${esc(contact.email)}<br>` : ""}${contact?.phone ? esc(contact.phone) : ""}
    </div>
  </section>
  <p class="subject">${esc(q.title)}</p>
  <table>
    <thead><tr><th>#</th><th>Açıklama</th><th class="n">Miktar</th><th class="n">Birim fiyat</th><th class="n">KDV</th><th class="n">Tutar</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="totals">
    <div><span>Ara toplam</span><span>${money(q.subtotal)}</span></div>
    <div><span>KDV</span><span>${money(q.vatTotal)}</span></div>
    <div class="grand"><span>Genel toplam</span><span>${money(q.total)}</span></div>
  </div>
  ${q.notes ? `<div class="block"><h2>Açıklama</h2><p>${lines(q.notes)}</p></div>` : ""}
  ${q.terms ? `<div class="block"><h2>Koşullar</h2><p class="muted">${lines(q.terms)}</p></div>` : ""}
  <footer><span>${esc(brand.name)}</span><span>${esc(brand.website.replace(/^https?:\/\//, ""))}</span></footer>
</main>
<script>if (location.search.includes("yazdir=1")) addEventListener("load", () => setTimeout(() => print(), 300));</script>
</body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
};
