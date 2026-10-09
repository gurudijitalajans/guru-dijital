import type { Endpoint, PayloadHandler, PayloadRequest } from "payload";
import { sendNotice } from "../notify";
import { dayOf } from "../ops/dates";
import { canReq, isAdminUser, isTenantAdminReq } from "./roles";
import { businessConfigOf } from "./collections";
import { currentTenantId, defaultTenantId } from "../crm/tenant";
import { brandOf } from "../crm/brand";
import { change, money, periodMetrics, periodOf, snapshot } from "./metrics";

/**
 * GET  /api/yonetici/rapor?ay=YYYY-MM   ay sonu raporu (yazdır / PDF olarak kaydet), yalnız yönetici
 * GET  /api/yonetici/sabah-ozeti        hafta içi 08:00 özet e-postası (Vercel Cron, CRON_SECRET ile)
 * POST /api/yonetici/sabah-ozeti        panelden "şimdi gönder" (yönetici)
 */

const esc = (v: unknown) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
const pct = (v: number | null) => (v === null ? "Yok" : `%${v}`);
const delta = (now: number, before: number) => {
  const c = change(now, before);
  return c === null ? "" : ` <span class="d">(${c > 0 ? "+" : ""}%${c} önceki aya göre)</span>`;
};

const report: PayloadHandler = async (req) => {
  if (!isAdminUser(req.user) && !(isTenantAdminReq(req) && canReq(req, "business"))) return new Response("Bu raporu yalnız yöneticiler görebilir.", { status: 403 });
  const tenant = await currentTenantId(req);
  if (!tenant) return new Response("İşletme seçili değil.", { status: 400 });
  const ay = req.searchParams.get("ay") ?? "";
  const p = periodOf(/^\d{4}-\d{2}$/.test(ay) ? `ay:${ay}` : "bu-ay");
  const q = { payload: req.payload, req, tenant };
  const [m, prev, settings, brand] = await Promise.all([periodMetrics(q, p), periodMetrics(q, p.prev), businessConfigOf(req.payload, tenant, req), brandOf(req, tenant)]);
  const target = settings.monthlyTarget ?? 0;
  const row = (k: string, v: string) => `<tr><td>${k}</td><td class="n">${v}</td></tr>`;

  const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(brand.shortName)} · ${esc(p.label)} raporu</title>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 16mm 14mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Outfit, system-ui, sans-serif; color: #011441; font-size: 13px; line-height: 1.5; background: #f4f7fb; }
  .page { max-width: 820px; margin: 24px auto; background: #fff; padding: 40px 44px; border-radius: 12px; }
  header { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; border-bottom: 2px solid #011441; padding-bottom: 16px; }
  header img { height: 32px; }
  h1 { margin: 0; font-size: 22px; font-weight: 600; }
  h2 { font-size: 15px; margin: 26px 0 8px; }
  .muted, .d { color: #6b7487; font-weight: 400; }
  .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 20px; }
  .kpi { background: #f4f7fb; border-radius: 10px; padding: 12px; }
  .kpi b { display: block; font-size: 20px; font-weight: 600; }
  .kpi span { font-size: 12px; color: #6b7487; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; font-weight: 500; color: #6b7487; font-size: 11px; text-transform: uppercase; letter-spacing: .06em; border-bottom: 1px solid #dfe5ee; padding: 7px 6px; }
  td { border-bottom: 1px solid #eef3fa; padding: 8px 6px; }
  .n { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
  .bar { height: 8px; background: #eef3fa; border-radius: 99px; overflow: hidden; margin-top: 6px; }
  .bar span { display: block; height: 100%; background: #2a6aca; }
  .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .tools { max-width: 820px; margin: 16px auto 0; display: flex; justify-content: flex-end; padding: 0 16px; }
  .tools button { font: inherit; border: 0; border-radius: 999px; background: #011441; color: #fff; padding: 10px 18px; min-height: 44px; cursor: pointer; }
  footer { margin-top: 30px; padding-top: 12px; border-top: 1px solid #dfe5ee; font-size: 11px; color: #6b7487; }
  @media (max-width: 640px) { .page { padding: 24px 18px; margin: 12px; } .kpis, .cols { grid-template-columns: 1fr 1fr; } .cols { grid-template-columns: 1fr; } }
  @media print { body { background: #fff; } .page { margin: 0; padding: 0; max-width: none; } .tools { display: none; } }
</style></head><body>
<div class="tools"><button onclick="print()">Yazdır / PDF olarak kaydet</button></div>
<main class="page">
  <header>${brand.logo ? `<img src="${esc(brand.logo)}" alt="${esc(brand.name)}">` : `<b style="font-size:20px">${esc(brand.name)}</b>`}<div style="text-align:right"><h1>${esc(p.label)} raporu</h1><div class="muted">Hazırlandı: ${new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date())}</div></div></header>
  <section class="kpis">
    <div class="kpi"><b>${money(m.wonValue)}</b><span>Kazanılan iş (KDV hariç)</span></div>
    <div class="kpi"><b>${m.wonCount}</b><span>Kazanılan fırsat · ${m.lostCount} kaybedilen</span></div>
    <div class="kpi"><b>${m.leads + m.bookings}</b><span>Talep ve randevu</span></div>
    <div class="kpi"><b>${pct(m.onTimePct)}</b><span>Zamanında biten görev</span></div>
  </section>
  ${target ? `<p>Aylık hedef ${money(target)} · gerçekleşen %${Math.round((m.wonValue / target) * 100)}</p><div class="bar"><span style="width:${Math.min(100, (m.wonValue / target) * 100)}%"></span></div>` : ""}
  <h2>Satış</h2>
  <table>${row("Kazanılan iş", money(m.wonValue) + delta(m.wonValue, prev.wonValue))}${row("Gönderilen teklif", `${m.quotesSent} teklif, ${money(m.quotesValue)}`)}${row("Kazanılan / kaybedilen", `${m.wonCount} / ${m.lostCount}`)}</table>
  ${m.wonDeals.length ? `<h2>Kazanılan işler</h2><table><thead><tr><th>İş</th><th>Müşteri</th><th>Kaynak</th><th class="n">Tutar</th></tr></thead><tbody>${m.wonDeals.map((d) => `<tr><td>${esc(d.title)}</td><td>${esc(d.who)}</td><td>${esc(d.source)}</td><td class="n">${money(d.value)}</td></tr>`).join("")}</tbody></table>` : ""}
  <div class="cols">
    <div><h2>Talepler kaynağa göre</h2><table>${row("Site formu", String(m.leadsFromForm) + delta(m.leadsFromForm, prev.leadsFromForm))}${row("Sohbet asistanı", String(m.leadsFromChat) + delta(m.leadsFromChat, prev.leadsFromChat))}${row("Toplantı talebi", String(m.bookings) + delta(m.bookings, prev.bookings))}</table></div>
    <div><h2>Gelir kaynağı</h2><table>${m.revenueBySource.length ? m.revenueBySource.map((s) => row(esc(s.label), `${money(s.value)} · ${s.count} iş`)).join("") : row("Bu ay kazanılan iş yok", "")}</table></div>
  </div>
  <div class="cols">
    <div><h2>Operasyon</h2><table>${row("Tamamlanan görev", String(m.tasksDone))}${row("Zamanında biten", pct(m.onTimePct))}${row("Teslim edilen iş", String(m.projectsDone))}${row("Ortalama teslim süresi", m.avgDeliveryDays === null ? "Yok" : `${m.avgDeliveryDays} gün`)}</table></div>
    <div><h2>Sohbetler</h2><table>${row("Sohbet", String(m.conversations))}${row("Asistanda çözülen", pct(m.botResolvedPct))}${row("Ekibe aktarılan", String(m.handoffs))}${row("Talebe ya da randevuya dönen", String(m.chatConverted))}</table></div>
  </div>
  <footer>${esc(brand.name)} · Guru Business ay sonu raporu. Tutarlar CRM'de kazanılan fırsatların KDV hariç tutarlarıdır.</footer>
</main></body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
};

/**
 * Sabah özeti e-postası, işletme başına. Alıcılar: Guru Dijital'de Guru
 * yöneticileri, müşteri işletmesinde işletme yöneticileri; ayrıca ayardaki
 * ek alıcılar. Deneme adresleri (.test) atlanır.
 */
export async function sendMorningSummary(req: PayloadRequest, tenant: number | string, opts: { cron?: boolean } = {}) {
  const settings = await businessConfigOf(req.payload, tenant, req);
  if (opts.cron && settings.summaryEnabled === false) return { sent: 0, reason: "kapalı" };
  const q = { payload: req.payload, req, tenant };
  const today = dayOf(new Date());
  const yesterday = { from: new Date(`${today}T00:00:00+03:00`).getTime() - 86400000, to: new Date(`${today}T00:00:00+03:00`).getTime() };
  const guru = String(await defaultTenantId(req));
  const [s, y, admins, brand] = await Promise.all([
    snapshot(q),
    periodMetrics(q, { from: new Date(yesterday.from).toISOString(), to: new Date(yesterday.to).toISOString() }),
    req.payload.find({
      collection: "users",
      where: String(tenant) === guru ? { role: { equals: "admin" } } : { "tenants.tenant": { equals: tenant } },
      depth: 0,
      limit: 50,
      pagination: false,
      req,
      overrideAccess: true,
    }),
    brandOf(req, tenant),
  ]);
  const managers = admins.docs.filter((u) => String(tenant) === guru || (u.tenants ?? []).some((r) => String(typeof r.tenant === "object" ? r.tenant?.id : r.tenant) === String(tenant) && r.role === "yonetici"));
  const to = new Set<string>([...managers.map((u) => u.email).filter((e) => e && !/\.test$/i.test(e)), ...(settings.summaryRecipients ?? []).map((r) => r.email)]);
  if (!to.size) return { sent: 0, reason: "Gerçek e-posta adresli yönetici ya da ek alıcı yok." };
  const rows: [string, string][] = [
    ["Dün gelen talep", `${y.leads} (${y.leadsFromChat} tanesi sohbetten), ${y.bookings} randevu`],
    ["Yanıt bekleyen", `${s.newLeads} yeni talep, ${s.waitingChats} sohbet`],
    ["Bugün", `${s.todayWork} iş ve görev, ${s.todayMeetings} toplantı`],
    ["Geciken görev", String(s.lateTasks)],
    ["Onay bekleyen", `${s.review} görev Kontrol aşamasında`],
    ["Satış hattı", `${s.openDeals} açık fırsat, ${money(s.openPipeline)}; ${s.pendingQuotes} teklif yanıt bekliyor`],
  ];
  for (const email of to) {
    await sendNotice(req, email, {
      subject: `Günaydın: ${s.newLeads + s.waitingChats} bekleyen, ${s.lateTasks} geciken`,
      intro: `${brand.name} sabah özeti (Guru Business).`,
      rows,
      adminPath: "/yonetici",
    });
  }
  return { sent: to.size };
}

const morning: PayloadHandler = async (req) => {
  const secret = process.env.CRON_SECRET;
  const fromCron = Boolean(secret) && req.headers.get("authorization") === `Bearer ${secret}`;
  if (fromCron) {
    /* Zamanlayıcı: Guru Dijital ve Business modülü açık her işletme */
    const tenants = await req.payload.find({ collection: "tenants", where: { or: [{ slug: { equals: "guru" } }, { modules: { contains: "business" } }] }, depth: 0, limit: 500, pagination: false, req, overrideAccess: true });
    let sent = 0;
    for (const t of tenants.docs) sent += (await sendMorningSummary(req, t.id, { cron: true })).sent;
    return Response.json({ ok: true, sent });
  }
  if (!isAdminUser(req.user) && !(isTenantAdminReq(req) && canReq(req, "business"))) return Response.json({ ok: false, error: "Yetki yok." }, { status: 401 });
  const tenant = await currentTenantId(req);
  if (!tenant) return Response.json({ ok: false, error: "İşletme seçili değil." }, { status: 400 });
  return Response.json({ ok: true, ...(await sendMorningSummary(req, tenant)) });
};

export const businessEndpoints: Endpoint[] = [
  { path: "/yonetici/rapor", method: "get", handler: report },
  { path: "/yonetici/sabah-ozeti", method: "get", handler: morning },
  { path: "/yonetici/sabah-ozeti", method: "post", handler: morning },
];
