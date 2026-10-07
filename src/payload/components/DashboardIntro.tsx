import Link from "next/link";
import type { ServerProps, Where } from "payload";
import { dayKey, daysAgoIso } from "../utils";
import { getOverview } from "@/lib/umami";

type BookingRow = { id: number | string; name: string; date: string; time: string; status: string; topic?: string | null };

const STATUS_LABEL: Record<string, string> = { bekliyor: "Onay bekliyor", onaylandi: "Onaylandı" };
const dateFmt = new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "2-digit", month: "long", weekday: "short" });

/**
 * Panel ana sayfasının üstündeki özet: yeni talepler, yaklaşan randevular,
 * yayındaki yazılar, son 7 günün ziyaretçi özeti (Umami) ve sıradaki beş randevu.
 */
export async function DashboardIntro({ payload, user }: ServerProps) {
  const today = dayKey(new Date());
  const upcomingWhere: Where = {
    and: [{ slot: { greater_than_equal: today } }, { status: { in: ["bekliyor", "onaylandi"] } }],
  };
  const settings = await payload.findGlobal({ slug: "site-settings", depth: 0 });
  const weekAgo = daysAgoIso(7);
  const [newLeads, upcoming, published, drafts, next, week, weekLeads, weekBookings] = await Promise.all([
    payload.count({ collection: "leads", where: { status: { equals: "yeni" } } }),
    payload.count({ collection: "bookings", where: upcomingWhere }),
    payload.count({ collection: "posts", where: { _status: { equals: "published" } } }),
    payload.count({ collection: "posts", where: { _status: { equals: "draft" } } }),
    payload.find({ collection: "bookings", where: upcomingWhere, sort: "slot", limit: 5, depth: 0 }),
    getOverview(settings.analytics?.websiteId ?? "", 7),
    payload.count({ collection: "leads", where: { createdAt: { greater_than_equal: weekAgo } } }),
    payload.count({ collection: "bookings", where: { createdAt: { greater_than_equal: weekAgo } } }),
  ]);
  const nf = new Intl.NumberFormat("tr-TR");
  const conv = weekLeads.totalDocs + weekBookings.totalDocs;

  const name = (user as { name?: string } | null)?.name?.split(" ")[0];
  const cards = [
    { label: "Yeni talep", value: newLeads.totalDocs, href: "/admin/collections/leads?where[status][equals]=yeni" },
    { label: "Yaklaşan randevu", value: upcoming.totalDocs, href: "/admin/collections/bookings" },
    { label: "Yayındaki yazı", value: published.totalDocs, href: "/admin/collections/posts" },
    { label: "Taslak yazı", value: drafts.totalDocs, href: "/admin/collections/posts?where[_status][equals]=draft" },
  ];

  return (
    <section className="guru-dash">
      <div className="guru-dash__head">
        <h2>{name ? `Merhaba ${name}` : "Merhaba"}</h2>
        <p>Siteden gelen talepler, randevular ve blog yazıları tek yerde.</p>
      </div>
      <div className="guru-dash__cards">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="guru-dash__card">
            <span className="guru-dash__value">{c.value}</span>
            <span className="guru-dash__label">{c.label}</span>
          </Link>
        ))}
      </div>
      <Link href="/admin/analiz?gun=7" className="guru-dash__panel guru-dash__week">
        <h3>Son 7 gün</h3>
        {week.ok ? (
          <p>
            <b>{nf.format(week.data.totals.visitors)}</b> ziyaretçi · <b>{nf.format(week.data.totals.pageviews)}</b>{" "}
            görüntüleme · <b>{nf.format(conv)}</b> talep ve randevu
            {week.data.totals.visitors > 0 && (
              <>
                {" "}
                · dönüşüm{" "}
                <b>%{((conv / week.data.totals.visitors) * 100).toLocaleString("tr-TR", { maximumFractionDigits: 1 })}</b>
              </>
            )}
          </p>
        ) : (
          <p className="guru-dash__empty">
            <b>{nf.format(conv)}</b> talep ve randevu. Ziyaretçi sayıları için Umami bağlantısı{" "}
            {week.reason === "not-configured" ? "kurulmadı" : "şu an yanıt vermiyor"}; ayrıntı için tıklayın.
          </p>
        )}
      </Link>
      <div className="guru-dash__panel">
        <h3>Sıradaki randevular</h3>
        {next.docs.length === 0 ? (
          <p className="guru-dash__empty">Bekleyen randevu yok.</p>
        ) : (
          <ul>
            {(next.docs as unknown as BookingRow[]).map((b) => (
              <li key={b.id}>
                <Link href={`/admin/collections/bookings/${b.id}`}>
                  <span className="guru-dash__when">
                    {dateFmt.format(new Date(b.date))} · {b.time}
                  </span>
                  <span className="guru-dash__who">
                    {b.name}
                    {b.topic ? ` · ${b.topic}` : ""}
                  </span>
                  <span className={`guru-dash__pill guru-dash__pill--${b.status}`}>{STATUS_LABEL[b.status] ?? b.status}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
