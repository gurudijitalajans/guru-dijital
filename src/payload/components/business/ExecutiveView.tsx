import Link from "next/link";
import { redirect } from "next/navigation";
import { DefaultTemplate } from "@payloadcms/next/templates";
import { Gutter } from "@payloadcms/ui";
import type { AdminViewServerProps } from "payload";
import { isAdminUser } from "../../business/roles";
import { change, money, periodMetrics, periodOf, snapshot } from "../../business/metrics";
import { SummaryButton } from "./SummaryButton";

/**
 * Panel > Yönetici panosu (/admin/yonetici), yalnız yönetici. İşletmenin
 * nabzı tek ekranda: dört ana gösterge (önceki döneme göre), modül özetleri,
 * aylık hedef, gelir kaynağı ve ortak aktivite akışı (işlem geçmişi).
 */
const PERIODS = [
  { key: "bu-ay", label: "Bu ay" },
  { key: "gecen-ay", label: "Geçen ay" },
  { key: "30-gun", label: "Son 30 gün" },
];
const nf = new Intl.NumberFormat("tr-TR");
const stamp = new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

function Delta({ now, before, label = "önceki döneme göre" }: { now: number; before: number; label?: string }) {
  const c = change(now, before);
  if (c === null) return <span className="guru-home__hint">önceki dönemde veri yok</span>;
  if (c === 0) return <span className="guru-home__hint">önceki dönemle aynı</span>;
  return (
    <span className={`guru-exec__delta ${c > 0 ? "is-up" : "is-down"}`}>
      {c > 0 ? "↑" : "↓"} %{Math.abs(c)} {label}
    </span>
  );
}

export async function ExecutiveView({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req, permissions, visibleEntities, locale } = initPageResult;
  if (!req.user) redirect("/admin/login?redirect=%2Fadmin%2Fyonetici");
  if (!isAdminUser(req.user)) redirect("/admin");

  const key = PERIODS.some((p) => p.key === searchParams?.donem) ? String(searchParams?.donem) : "bu-ay";
  const p = periodOf(key);
  const q = { payload: req.payload, req };
  const [m, prev, s, settings, feed] = await Promise.all([
    periodMetrics(q, p),
    periodMetrics(q, p.prev),
    snapshot(q),
    req.payload.findGlobal({ slug: "business-settings", depth: 0, req }),
    req.payload.find({ collection: "audit-log", sort: "-createdAt", limit: 14, depth: 1, req }),
  ]);
  const target = key !== "30-gun" ? (settings.monthlyTarget ?? 0) : 0;
  const reportMonth = new Date(Date.parse(p.from) + 5 * 86400000).toISOString().slice(0, 7);
  const maxSource = Math.max(1, ...m.revenueBySource.map((r) => r.value));

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={locale}
      params={params}
      payload={req.payload}
      permissions={permissions}
      searchParams={searchParams}
      user={req.user ?? undefined}
      visibleEntities={visibleEntities}
    >
      <Gutter>
        <div className="guru-pipe guru-plan guru-exec">
          <header className="guru-pipe__head">
            <div>
              <h1>Yönetici panosu</h1>
              <p>{p.label} · tutarlar KDV hariç, CRM&apos;de kazanılan fırsatlardan</p>
            </div>
            <nav className="guru-pipe__tools" aria-label="Dönem ve rapor">
              {PERIODS.map((x) => (
                <Link key={x.key} href={`/admin/yonetici?donem=${x.key}`} className={`guru-plan__nav${x.key === key ? " is-on" : ""}`} aria-current={x.key === key ? "page" : undefined}>
                  {x.label}
                </Link>
              ))}
              <a className="guru-plan__nav" href={`/api/yonetici/rapor?ay=${reportMonth}`} target="_blank" rel="noopener">
                Ay sonu raporu
              </a>
              <SummaryButton />
            </nav>
          </header>

          <div className="guru-home__cards guru-chat__cards">
            <div className="guru-home__card">
              <span className="guru-home__value">{money(m.wonValue)}</span>
              <span className="guru-home__label">Kazanılan iş</span>
              <Delta now={m.wonValue} before={prev.wonValue} />
            </div>
            <div className="guru-home__card">
              <span className="guru-home__value">{nf.format(m.leads + m.bookings)}</span>
              <span className="guru-home__label">Talep ve randevu</span>
              <Delta now={m.leads + m.bookings} before={prev.leads + prev.bookings} />
            </div>
            <Link href="/admin/collections/projects?where[status][equals]=aktif" className="guru-home__card">
              <span className="guru-home__value">{nf.format(s.activeCustomers)}</span>
              <span className="guru-home__label">Aktif müşteri</span>
              <span className="guru-home__hint">{s.activeProjects} süren iş</span>
            </Link>
            <div className="guru-home__card">
              <span className="guru-home__value">{m.botResolvedPct === null ? "Yok" : `%${m.botResolvedPct}`}</span>
              <span className="guru-home__label">Asistanda çözülen sohbet</span>
              {m.conversations ? <span className="guru-home__hint">{m.conversations} sohbetten {m.conversations - m.handoffs}</span> : <span className="guru-home__hint">bu dönemde sohbet yok</span>}
            </div>
          </div>

          {target ? (
            <section className="guru-home__panel">
              <div className="guru-home__panel-head">
                <h2>Aylık hedef</h2>
                <span className="guru-home__meta">
                  {money(m.wonValue)} / {money(target)} · %{Math.round((m.wonValue / target) * 100)}
                </span>
              </div>
              <div className="guru-plan__bar guru-exec__target" aria-hidden>
                <span style={{ width: `${Math.min(100, (m.wonValue / target) * 100)}%` }} />
              </div>
            </section>
          ) : (
            <p className="guru-home__meta">
              Aylık hedef girilmedi. <Link href="/admin/globals/business-settings">Yönetici ayarlarından</Link> ekleyince ilerleme burada görünür.
            </p>
          )}

          <div className="guru-exec__modules">
            <Link href="/admin/sohbetler" className="guru-home__panel guru-exec__module">
              <h2>Guru Chatbot</h2>
              <p>
                <b>{m.conversations}</b> sohbet · <b>{s.waitingChats}</b> yanıt bekliyor
              </p>
              <small>
                {m.chatConverted} sohbet talebe ya da randevuya döndü · {m.handoffs} ekibe aktarıldı
              </small>
            </Link>
            <Link href="/admin/satis-hatti" className="guru-home__panel guru-exec__module">
              <h2>Guru CRM</h2>
              <p>
                <b>{s.openDeals}</b> açık fırsat · <b>{money(s.openPipeline)}</b>
              </p>
              <small>
                {s.pendingQuotes} teklif yanıt bekliyor ({money(s.pendingQuotesValue)}) · {m.wonCount} kazanılan, {m.lostCount} kaybedilen
              </small>
            </Link>
            <Link href="/admin/ekip-plani" className="guru-home__panel guru-exec__module">
              <h2>Guru Operation</h2>
              <p>
                <b>{s.openTasks}</b> açık görev · <b className={s.lateTasks ? "guru-home__bad" : undefined}>{s.lateTasks}</b> geciken
              </p>
              <small>
                Zamanında biten {m.onTimePct === null ? "veri yok" : `%${m.onTimePct}`} · {m.projectsDone} iş teslim edildi
                {m.avgDeliveryDays !== null ? `, ortalama ${m.avgDeliveryDays} gün` : ""}
              </small>
            </Link>
          </div>

          <div className="guru-home__cols">
            <section className="guru-home__panel">
              <div className="guru-home__panel-head">
                <h2>Gelir kaynağı</h2>
                <span className="guru-home__meta">kazanılan işin kişinin geldiği yere göre dağılımı</span>
              </div>
              {m.revenueBySource.length === 0 ? (
                <p className="guru-home__empty">Bu dönemde kazanılan iş yok.</p>
              ) : (
                <ul className="guru-plan__cap">
                  {m.revenueBySource.map((r) => (
                    <li key={r.label}>
                      <span className="guru-plan__who">{r.label}</span>
                      <span className="guru-plan__bar" aria-hidden>
                        <span style={{ width: `${(r.value / maxSource) * 100}%` }} />
                      </span>
                      <span className="guru-plan__pct">%{Math.round((r.value / Math.max(1, m.wonValue)) * 100)}</span>
                      <small>
                        {money(r.value)} · {r.count} iş
                      </small>
                    </li>
                  ))}
                </ul>
              )}
              <p className="guru-home__meta">
                Talepler: {m.leadsFromForm} site formu, {m.leadsFromChat} sohbet, {m.bookings} toplantı talebi
              </p>
            </section>
            <section className="guru-home__panel">
              <div className="guru-home__panel-head">
                <h2>Son aktiviteler</h2>
                <Link href="/admin/collections/audit-log">İşlem geçmişi</Link>
              </div>
              {feed.docs.length === 0 ? (
                <p className="guru-home__empty">Henüz kayıt yok. Paneldeki değişiklikler ve girişler burada görünür.</p>
              ) : (
                <ul className="guru-home__rows">
                  {feed.docs.map((a) => (
                    <li key={a.id}>
                      <div className="guru-exec__feed">
                        <span className="guru-home__who">{a.summary}</span>
                        <span className="guru-home__meta">
                          {[a.user && typeof a.user === "object" ? a.user.name : null, stamp.format(new Date(a.createdAt)), a.fields ? `Değişen: ${a.fields}` : null].filter(Boolean).join(" · ")}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {m.wonDeals.length > 0 && (
            <section className="guru-home__panel">
              <div className="guru-home__panel-head">
                <h2>Kazanılan işler</h2>
              </div>
              <ul className="guru-home__rows">
                {m.wonDeals.slice(0, 10).map((d) => (
                  <li key={d.id}>
                    <Link href={`/admin/collections/deals/${d.id}`}>
                      <span className="guru-home__who">{d.title}</span>
                      <span className="guru-home__meta">{[d.who, d.source].filter(Boolean).join(" · ")}</span>
                      <span className="guru-home__pill guru-home__pill--kazanildi">{money(d.value)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </Gutter>
    </DefaultTemplate>
  );
}
