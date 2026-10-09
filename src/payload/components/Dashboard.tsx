import Link from "next/link";
import { Gutter } from "@payloadcms/ui";
import type { ServerProps, Where } from "payload";
import { dayKey, daysAgoIso } from "../utils";
import { getOverview, umamiConfigured } from "@/lib/umami";
import { LEAD_STATUS } from "../collections/Leads";
import { activityLabel, DEAL_STAGES, OPEN_STAGES } from "../crm/stages";
import { TaskCheck } from "./crm/TaskCheck";
import { taskCode, taskStageLabel } from "../ops/stages";
import { aiConfigured } from "../chat/ai";
import { can, isAdminUser, type Module } from "../business/roles";

/**
 * Panel ana sayfası (Payload'un koleksiyon ızgarası yerine). Soru şu:
 * "Bugün ne yapmalıyım?" Önce bekleyen talep ve randevular, sonra sitenin
 * eksikleri (kendiliğinden işaretlenen liste), hızlı düzenleme bağlantıları,
 * son değişiklikler ve son 7 günün ziyaretçi özeti.
 */

type BookingRow = { id: number | string; name: string; date: string; time: string; status: string; topic?: string | null };
type LeadRow = { id: number | string; name: string; service?: string | null; status: string; createdAt: string };
type Recent = { label: string; kind: string; href: string; updatedAt: string };
type OpsRow = { id: number | string; seq?: number | null; title: string; stage: string; dueDate?: string | null; project?: { title: string } | null };
type TaskRow = { id: number | string; type: string; title: string; dueAt?: string | null; deal?: { id: number | string; title: string } | null; contact?: { id: number | string; name: string } | null };

const TZ = "Europe/Istanbul";
const dayFmt = new Intl.DateTimeFormat("tr-TR", { timeZone: TZ, day: "numeric", month: "long", weekday: "long" });
const shortFmt = new Intl.DateTimeFormat("tr-TR", { timeZone: TZ, day: "numeric", month: "short", weekday: "short" });
const stampFmt = new Intl.DateTimeFormat("tr-TR", { timeZone: TZ, day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const BOOKING_LABEL: Record<string, string> = { bekliyor: "Onay bekliyor", onaylandi: "Onaylandı" };
const LEAD_LABEL = Object.fromEntries(LEAD_STATUS.map((s) => [s.value, s.label]));
const PLACEHOLDER_NAMES = new Set(["", "ad soyad"]);

function greeting(now: Date) {
  const hour = Number(new Intl.DateTimeFormat("tr-TR", { timeZone: TZ, hour: "numeric", hourCycle: "h23" }).format(now));
  if (hour < 11) return "Günaydın";
  if (hour < 18) return "İyi günler";
  return "İyi akşamlar";
}

export async function Dashboard({ payload, user }: ServerProps) {
  const now = new Date();
  const today = dayKey(now);
  const upcomingWhere: Where = { and: [{ slot: { greater_than_equal: today } }, { status: { in: ["bekliyor", "onaylandi"] } }] };
  const todayWhere: Where = { and: [{ slot: { like: today } }, { status: { in: ["bekliyor", "onaylandi"] } }] };
  const draftWhere: Where = { and: [{ latest: { equals: true } }, { "version._status": { equals: "draft" } }] };

  const weekAgo = daysAgoIso(7);
  const endOfToday = new Date(`${today}T23:59:59+03:00`).toISOString();
  const taskWhere: Where = { and: [{ done: { equals: false } }, { dueAt: { less_than_equal: endOfToday } }] };
  const startOfToday = `${today}T00:00:00.000Z`;
  const [tasks, openDeals, myOps, opsOpen, opsLate, opsReview, activeProjects, chatWaiting, chatSettings] = await Promise.all([
    payload.find({ collection: "activities", where: taskWhere, sort: "dueAt", limit: 8, depth: 1 }),
    payload.find({ collection: "deals", where: { stage: { in: OPEN_STAGES } }, limit: 500, depth: 0, pagination: false, select: { stage: true, value: true } }),
    user
      ? payload.find({ collection: "tasks", where: { and: [{ assignee: { equals: user.id } }, { stage: { not_equals: "tamam" } }] }, sort: "dueDate", limit: 6, depth: 1 })
      : Promise.resolve({ docs: [], totalDocs: 0 }),
    payload.count({ collection: "tasks", where: { stage: { not_equals: "tamam" } } }),
    payload.count({ collection: "tasks", where: { and: [{ stage: { not_equals: "tamam" } }, { dueDate: { less_than: startOfToday } }] } }),
    payload.count({ collection: "tasks", where: { stage: { equals: "kontrol" } } }),
    payload.count({ collection: "projects", where: { status: { equals: "aktif" } } }),
    payload.count({ collection: "conversations", where: { needsReply: { equals: true } } }),
    payload.findGlobal({ slug: "chatbot-settings", depth: 0 }),
  ]);
  const [settings, newLeads, todayBookings, upcoming, nextBookings, lastLeads, draftCounts, team, refs, quotes, users, recent, weekLeads] =
    await Promise.all([
      payload.findGlobal({ slug: "site-settings", depth: 0 }),
      payload.count({ collection: "leads", where: { status: { equals: "yeni" } } }),
      payload.count({ collection: "bookings", where: todayWhere }),
      payload.count({ collection: "bookings", where: upcomingWhere }),
      payload.find({ collection: "bookings", where: upcomingWhere, sort: "slot", limit: 5, depth: 0 }),
      payload.find({ collection: "leads", sort: "-createdAt", limit: 5, depth: 0 }),
      Promise.all(
        (["posts", "services", "products"] as const).map((c) =>
          payload.countVersions({ collection: c, where: draftWhere }).then((r) => r.totalDocs).catch(() => 0)
        )
      ),
      payload.find({ collection: "team", limit: 100, depth: 0, pagination: false }),
      payload.find({ collection: "references", limit: 200, depth: 0, pagination: false }),
      payload.count({ collection: "testimonials", where: { and: [{ consent: { equals: true } }, { quote: { exists: true } }] } }),
      payload.find({ collection: "users", limit: 50, depth: 0, pagination: false }),
      recentChanges(payload),
      payload.count({ collection: "leads", where: { createdAt: { greater_than_equal: weekAgo } } }),
    ]);
  const overview = await getOverview(settings.analytics?.websiteId ?? "", 7);
  const nf = new Intl.NumberFormat("tr-TR");
  const drafts = draftCounts.reduce((a, b) => a + b, 0);
  const firstName = (user as { name?: string } | null)?.name?.split(" ")[0];

  const pipeTotal = openDeals.docs.reduce((sum, d) => sum + (d.value ?? 0), 0);
  const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
  const has = (m: Module) => can(user, m);
  const cards = [
    { mod: "crm" as Module, label: "Yeni talep", value: newLeads.totalDocs, hint: "yanıt bekliyor", href: "/admin/collections/leads?where[status][equals]=yeni" },
    { mod: "chat" as Module, label: "Bekleyen sohbet", value: chatWaiting.totalDocs, hint: "ekipten yanıt bekliyor", href: "/admin/sohbetler" },
    { mod: "crm" as Module, label: "Bugünkü iş", value: tasks.totalDocs, hint: "görev ve arama", href: "/admin/collections/activities?where[done][equals]=false&sort=dueAt" },
    { mod: "crm" as Module, label: "Randevu", value: upcoming.totalDocs, hint: `${todayBookings.totalDocs} tanesi bugün`, href: "/admin/collections/bookings" },
    { mod: "crm" as Module, label: "Açık fırsat", value: openDeals.docs.length, hint: `${money.format(pipeTotal)} satış hattında`, href: "/admin/satis-hatti" },
    { mod: "site" as Module, label: "Taslak", value: drafts, hint: "yayınlanmayı bekliyor", href: "/admin/collections/posts?where[_status][equals]=draft" },
  ].filter((c) => has(c.mod));
  const stageSummary = DEAL_STAGES.filter((s) => OPEN_STAGES.includes(s.value)).map((s) => {
    const list = openDeals.docs.filter((d) => d.stage === s.value);
    return { label: s.label, count: list.length, total: list.reduce((sum, d) => sum + (d.value ?? 0), 0) };
  });
  const nowIso = now.toISOString();

  /* Siteyi tamamla: her madde verinin kendisinden ya da ortam ayarından okunur */
  const teamDocs = team.docs as { name?: string; photo?: unknown }[];
  const teamNamed = teamDocs.filter((m) => !PLACEHOLDER_NAMES.has((m.name ?? "").trim().toLocaleLowerCase("tr-TR"))).length;
  const teamPhotos = teamDocs.filter((m) => Boolean(m.photo)).length;
  const refDocs = refs.docs as { logo?: unknown }[];
  const refLogos = refDocs.filter((r) => Boolean(r.logo)).length;
  const realAdmin = (users.docs as { email?: string }[]).some((u) => u.email && !/\.test$/i.test(u.email));
  const serverURL = process.env.NEXT_PUBLIC_SERVER_URL ?? "";
  const checklist = [
    { done: teamDocs.length > 0 && teamNamed === teamDocs.length, title: "Ekip isimleri", detail: `${teamNamed}/${teamDocs.length} kişinin adı girildi`, href: "/admin/collections/team" },
    { done: teamDocs.length > 0 && teamPhotos === teamDocs.length, title: "Ekip fotoğrafları", detail: `${teamPhotos}/${teamDocs.length} fotoğraf yüklendi`, href: "/admin/collections/team" },
    { done: refDocs.length > 0 && refLogos === refDocs.length, title: "Referans logoları", detail: `${refLogos}/${refDocs.length} markanın logosu var; logosuz marka adıyla görünür`, href: "/admin/collections/references" },
    { done: quotes.totalDocs > 0, title: "Müşteri yorumları", detail: quotes.totalDocs > 0 ? `${quotes.totalDocs} yorum yayında` : "İzinli yorum yok; bölüm sitede gizli", href: "/admin/collections/testimonials" },
    { done: realAdmin, title: "Yönetici e-postası", detail: realAdmin ? "Gerçek adres tanımlı" : "Hesap deneme adresinde; şifre sıfırlama e-postası gelmez", href: "/admin/account" },
    { done: Boolean(process.env.RESEND_API_KEY), title: "Bildirim e-postası", detail: process.env.RESEND_API_KEY ? "Yeni talepler e-postayla geliyor" : "Vercel'e RESEND_API_KEY eklenince talepler e-postayla da gelir", href: null },
    {
      done: aiConfigured() && Boolean(chatSettings.enabled),
      title: "Sohbet asistanı",
      detail: !aiConfigured()
        ? "Vercel'e ANTHROPIC_API_KEY eklenince asistan yanıt verir; şimdilik sohbetler doğrudan ekibe düşer"
        : chatSettings.enabled
          ? "Sitede sohbet balonu açık"
          : "Chatbot ayarlarından sohbet balonunu açın",
      href: "/admin/globals/chatbot-settings",
    },
    {
      done: Boolean(process.env.CRON_SECRET),
      title: "Sabah özeti",
      detail: process.env.CRON_SECRET ? "Hafta içi her sabah yöneticilere özet e-postası gidiyor" : "Vercel'e CRON_SECRET eklenince hafta içi her sabah özet e-postası gider",
      href: "/admin/globals/business-settings",
    },
    { done: umamiConfigured(), title: "Ziyaretçi analizi", detail: umamiConfigured() ? "Umami bağlı" : "Vercel'e UMAMI_API_KEY eklenince bu panoda ziyaretçi sayıları görünür", href: "/admin/analiz" },
    { done: /gurudijital\.com\.tr/.test(serverURL), title: "Alan adı", detail: /gurudijital\.com\.tr/.test(serverURL) ? "gurudijital.com.tr bağlı" : "Site şimdilik vercel.app adresinde", href: null },
    { done: false, title: "KVKK aydınlatma metni", detail: "Metin gelince formların altına bağlantısı eklenir", href: null },
  ];
  const doneCount = checklist.filter((c) => c.done).length;

  const quick = [
    { title: "Ana Sayfa", desc: "Giriş, bölüm başlıkları, SSS", href: "/admin/globals/home-page" },
    { title: "Hakkımızda", desc: "Hikâye, ilkeler, ödüller, ekip", href: "/admin/globals/about-page" },
    { title: "Hizmetler", desc: "Altı hizmetin sayfaları", href: "/admin/collections/services" },
    { title: "Ürünler", desc: "Dört ürünün sayfaları", href: "/admin/collections/products" },
    { title: "Yeni blog yazısı", desc: "Taslak olarak başlar", href: "/admin/collections/posts/create" },
    { title: "Görsel yükle", desc: "Medya kütüphanesine", href: "/admin/collections/media/create" },
  ];

  return (
    <Gutter className="guru-home">
      <header className="guru-home__head">
        <p className="guru-home__date">{dayFmt.format(now)}</p>
        <h1>
          {greeting(now)}
          {firstName ? ` ${firstName}` : ""}
        </h1>
      </header>

      <div className="guru-home__cards">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="guru-home__card">
            <span className="guru-home__value">{nf.format(c.value)}</span>
            <span className="guru-home__label">{c.label}</span>
            <span className="guru-home__hint">{c.hint}</span>
          </Link>
        ))}
      </div>

      <div className="guru-home__cols">
        {has("crm") && (
        <section className="guru-home__panel">
          <div className="guru-home__panel-head">
            <h2>Bugünkü işler</h2>
            <Link href="/admin/collections/activities?where[done][equals]=false&sort=dueAt">Tümü</Link>
          </div>
          {tasks.docs.length === 0 ? (
            <p className="guru-home__empty">Bugün için açık görev yok. Talep gelince &ldquo;İlk dönüşü yapın&rdquo; görevi kendiliğinden eklenir.</p>
          ) : (
            <ul className="guru-home__rows guru-home__tasks">
              {(tasks.docs as unknown as TaskRow[]).map((t) => (
                <li key={t.id}>
                  <TaskCheck id={t.id} title={t.title} />
                  <Link href={t.deal ? `/admin/collections/deals/${t.deal.id}` : `/admin/collections/activities/${t.id}`}>
                    <span className="guru-home__who">{t.title}</span>
                    <span className="guru-home__meta">
                      {[activityLabel(t.type), t.dueAt ? stampFmt.format(new Date(t.dueAt)) : null, t.contact?.name].filter(Boolean).join(" · ")}
                    </span>
                    {t.dueAt && t.dueAt < nowIso ? <span className="guru-home__pill guru-home__pill--gecikti">Gecikti</span> : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        )}
        {has("ops") && (
        <section className="guru-home__panel">
          <div className="guru-home__panel-head">
            <h2>Görevlerim</h2>
            <Link href="/admin/operasyon">Görev panosu</Link>
          </div>
          {myOps.docs.length === 0 ? (
            <p className="guru-home__empty">Size atanmış açık görev yok. Operasyon görevleri Görev panosunda.</p>
          ) : (
            <ul className="guru-home__rows">
              {(myOps.docs as unknown as OpsRow[]).map((t) => (
                <li key={t.id}>
                  <Link href={`/admin/collections/tasks/${t.id}`}>
                    <span className="guru-home__who">
                      {taskCode(t.seq)} {t.title}
                    </span>
                    <span className="guru-home__meta">
                      {[taskStageLabel(t.stage), t.dueDate ? shortFmt.format(new Date(t.dueDate)) : null, t.project?.title].filter(Boolean).join(" · ")}
                    </span>
                    {t.dueDate && t.dueDate < startOfToday ? <span className="guru-home__pill guru-home__pill--gecikti">Gecikti</span> : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        )}
      </div>

      <div className="guru-home__cols">
        {has("crm") && (
        <section className="guru-home__panel">
          <div className="guru-home__panel-head">
            <h2>Satış hattı</h2>
            <Link href="/admin/satis-hatti">Panoyu aç</Link>
          </div>
          <ul className="guru-home__stages">
            {stageSummary.map((s) => (
              <li key={s.label}>
                <span>{s.label}</span>
                <b>{s.count}</b>
                <small>{money.format(s.total)}</small>
              </li>
            ))}
          </ul>
          <p className="guru-home__meta">Kazanılan ve kaybedilenler panoda son 30 günle görünür.</p>
        </section>
        )}
        {has("ops") && (
        <section className="guru-home__panel">
          <div className="guru-home__panel-head">
            <h2>Operasyon</h2>
            <Link href="/admin/ekip-plani">Ekip planı</Link>
          </div>
          <ul className="guru-home__stages">
            <li>
              <span>Süren iş</span>
              <b>{activeProjects.totalDocs}</b>
              <small>{opsOpen.totalDocs} açık görev</small>
            </li>
            <li>
              <span>Geciken</span>
              <b className={opsLate.totalDocs ? "guru-home__bad" : undefined}>{opsLate.totalDocs}</b>
              <small>teslim tarihi geçti</small>
            </li>
            <li>
              <span>Onay bekleyen</span>
              <b>{opsReview.totalDocs}</b>
              <small>Kontrol aşamasında</small>
            </li>
          </ul>
          <p className="guru-home__meta">Kazanılan fırsatı, fırsat sayfasındaki &ldquo;Operasyon işi aç&rdquo; düğmesiyle işe dönüştürün.</p>
        </section>
        )}
      </div>

      <div className="guru-home__cols">
        {has("crm") && (
        <section className="guru-home__panel">
          <div className="guru-home__panel-head">
            <h2>Son talepler</h2>
            <Link href="/admin/collections/leads">Tümü</Link>
          </div>
          {lastLeads.docs.length === 0 ? (
            <p className="guru-home__empty">Henüz talep yok. Sitedeki formlardan gelen talepler burada listelenir.</p>
          ) : (
            <ul className="guru-home__rows">
              {(lastLeads.docs as unknown as LeadRow[]).map((l) => (
                <li key={l.id}>
                  <Link href={`/admin/collections/leads/${l.id}`}>
                    <span className="guru-home__who">{l.name}</span>
                    <span className="guru-home__meta">{[l.service, stampFmt.format(new Date(l.createdAt))].filter(Boolean).join(" · ")}</span>
                    <span className={`guru-home__pill guru-home__pill--${l.status}`}>{LEAD_LABEL[l.status] ?? l.status}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        )}
        {has("crm") && (
        <section className="guru-home__panel">
          <div className="guru-home__panel-head">
            <h2>Sıradaki randevular</h2>
            <Link href="/admin/collections/bookings">Tümü</Link>
          </div>
          {nextBookings.docs.length === 0 ? (
            <p className="guru-home__empty">Bekleyen randevu yok. İletişim sayfasındaki toplantı formundan gelenler burada görünür.</p>
          ) : (
            <ul className="guru-home__rows">
              {(nextBookings.docs as unknown as BookingRow[]).map((b) => (
                <li key={b.id}>
                  <Link href={`/admin/collections/bookings/${b.id}`}>
                    <span className="guru-home__who">{b.name}</span>
                    <span className="guru-home__meta">
                      {shortFmt.format(new Date(b.date))} · {b.time}
                      {b.topic ? ` · ${b.topic}` : ""}
                    </span>
                    <span className={`guru-home__pill guru-home__pill--${b.status}`}>{BOOKING_LABEL[b.status] ?? b.status}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        )}
      </div>

      {isAdminUser(user) && (
      <section className="guru-home__panel">
        <div className="guru-home__panel-head">
          <h2>Siteyi tamamla</h2>
          <span className="guru-home__progress-label">
            {doneCount}/{checklist.length} tamam
          </span>
        </div>
        <div className="guru-home__progress" aria-hidden>
          <span style={{ width: `${(doneCount / checklist.length) * 100}%` }} />
        </div>
        <ul className="guru-home__checks">
          {checklist.map((c) => {
            const body = (
              <>
                <span className={`guru-home__tick${c.done ? " is-done" : ""}`} aria-hidden>
                  {c.done ? "✓" : ""}
                </span>
                <span className="guru-home__check-text">
                  <b>{c.title}</b>
                  <span>{c.detail}</span>
                </span>
              </>
            );
            return (
              <li key={c.title} className={c.done ? "is-done" : undefined}>
                <span className="sr-only">{c.done ? "Tamamlandı: " : "Bekliyor: "}</span>
                {c.href ? <Link href={c.href}>{body}</Link> : <div>{body}</div>}
              </li>
            );
          })}
        </ul>
      </section>
      )}

      {has("site") && (
      <section className="guru-home__panel">
        <div className="guru-home__panel-head">
          <h2>Hızlı düzenle</h2>
        </div>
        <div className="guru-home__quick">
          {quick.map((q) => (
            <Link key={q.title} href={q.href}>
              <b>{q.title}</b>
              <span>{q.desc}</span>
            </Link>
          ))}
        </div>
      </section>
      )}

      <div className="guru-home__cols">
        {has("site") && (
        <section className="guru-home__panel">
          <div className="guru-home__panel-head">
            <h2>Son değişiklikler</h2>
          </div>
          {recent.length === 0 ? (
            <p className="guru-home__empty">Henüz değişiklik yok.</p>
          ) : (
            <ul className="guru-home__rows">
              {recent.map((r) => (
                <li key={r.href}>
                  <Link href={r.href}>
                    <span className="guru-home__who">{r.label}</span>
                    <span className="guru-home__meta">
                      {r.kind} · {stampFmt.format(new Date(r.updatedAt))}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        )}
        {has("site") && (
        <Link href="/admin/analiz?gun=7" className="guru-home__panel guru-home__week">
          <div className="guru-home__panel-head">
            <h2>Son 7 gün</h2>
          </div>
          {overview.ok ? (
            <p>
              <b>{nf.format(overview.data.totals.visitors)}</b> ziyaretçi · <b>{nf.format(overview.data.totals.pageviews)}</b> sayfa görüntüleme
            </p>
          ) : (
            <p className="guru-home__empty">
              Ziyaretçi sayıları için Umami bağlantısı {overview.reason === "not-configured" ? "henüz kurulmadı" : "şu an yanıt vermiyor"}. Ayrıntı için tıklayın.
            </p>
          )}
          <p className="guru-home__meta">Son 7 günde {nf.format(weekLeads.totalDocs)} talep geldi</p>
        </Link>
        )}
      </div>
    </Gutter>
  );
}

/** Sayfa içeriklerinde son kaydedilenler (hizmet, ürün, blog, ana sayfa, hakkımızda) */
async function recentChanges(payload: ServerProps["payload"]): Promise<Recent[]> {
  const [services, products, posts, home, about] = await Promise.all([
    payload.find({ collection: "services", sort: "-updatedAt", limit: 3, depth: 0 }),
    payload.find({ collection: "products", sort: "-updatedAt", limit: 3, depth: 0 }),
    payload.find({ collection: "posts", sort: "-updatedAt", limit: 3, depth: 0, draft: true }),
    payload.findGlobal({ slug: "home-page", depth: 0 }),
    payload.findGlobal({ slug: "about-page", depth: 0 }),
  ]);
  const rows: Recent[] = [
    ...services.docs.map((d) => ({ label: d.title, kind: "Hizmet", href: `/admin/collections/services/${d.id}`, updatedAt: d.updatedAt })),
    ...products.docs.map((d) => ({ label: d.name, kind: "Ürün", href: `/admin/collections/products/${d.id}`, updatedAt: d.updatedAt })),
    ...posts.docs.map((d) => ({ label: d.title, kind: "Blog yazısı", href: `/admin/collections/posts/${d.id}`, updatedAt: d.updatedAt })),
    ...(home.updatedAt ? [{ label: "Ana Sayfa", kind: "Sayfa", href: "/admin/globals/home-page", updatedAt: home.updatedAt }] : []),
    ...(about.updatedAt ? [{ label: "Hakkımızda", kind: "Sayfa", href: "/admin/globals/about-page", updatedAt: about.updatedAt }] : []),
  ];
  return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);
}
