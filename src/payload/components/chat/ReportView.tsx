import Link from "next/link";
import { redirect } from "next/navigation";
import { scopeOf } from "../tenant-scope";
import { canReq } from "../../business/roles";
import { DefaultTemplate } from "@payloadcms/next/templates";
import { Gutter } from "@payloadcms/ui";
import type { AdminViewServerProps } from "payload";
import { daysAgoIso } from "../../utils";

/**
 * Panel > Sohbet raporu (/admin/sohbet-raporu): son 30 günde sohbet sayısı,
 * asistanın tek başına yürüttüğü oran, ekibe aktarılanlar, talebe ve randevuya
 * dönenler, ekibin ilk yanıt süresi, konular ve asistanın yanıtlayamadığı sorular.
 */
const nf = new Intl.NumberFormat("tr-TR");
const stamp = new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const dur = (ms: number) => {
  const m = Math.round(ms / 60000);
  return m < 60 ? `${m} dk` : `${Math.floor(m / 60)} sa ${m % 60} dk`;
};

export async function ReportView({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req, permissions, visibleEntities, locale } = initPageResult;
  if (!req.user) redirect("/admin/login?redirect=%2Fadmin%2Fsohbet-raporu");
  /* Modülü olmayan kullanıcı panoya döner */
  if (!canReq(req, "chat")) redirect("/admin");
  /* İşletmeye bağlı sorgular seçili işletmeyle süzülür */
  const scope = await scopeOf(req.payload, req.user);
  const { w } = scope;
  const since = daysAgoIso(30);
  const [convs, unanswered] = await Promise.all([
    req.payload.find({ collection: "conversations", where: w({ createdAt: { greater_than_equal: since } }), limit: 5000, depth: 0, pagination: false, req }),
    req.payload.find({ collection: "chat-messages", where: w({ and: [{ unanswered: { equals: true } }, { createdAt: { greater_than_equal: since } }] }), sort: "-createdAt", limit: 20, depth: 0, req }),
  ]);
  const all = convs.docs;
  const handed = all.filter((c) => c.handedOffAt);
  const botOnly = all.length - handed.length;
  const leads = all.filter((c) => c.lead).length;
  const bookings = all.filter((c) => c.booking).length;
  /* Yalnız asistanın aktardığı sohbetler: ekibin kendiliğinden devraldıkları (aktarım = ilk yanıt) süreyi sıfıra çekmesin */
  const replyTimes = handed.filter((c) => c.firstTeamReplyAt && c.firstTeamReplyAt !== c.handedOffAt).map((c) => Date.parse(c.firstTeamReplyAt!) - Date.parse(c.handedOffAt!)).filter((v) => v >= 0);
  const avgReply = replyTimes.length ? replyTimes.reduce((a, b) => a + b, 0) / replyTimes.length : null;
  const waiting = handed.filter((c) => !c.firstTeamReplyAt).length;
  const topics = new Map<string, { n: number; converted: number }>();
  for (const c of all) {
    const k = c.topic || "Etiketsiz";
    const row = topics.get(k) ?? { n: 0, converted: 0 };
    row.n++;
    if (c.lead || c.booking) row.converted++;
    topics.set(k, row);
  }
  const topicRows = [...topics.entries()].sort((a, b) => b[1].n - a[1].n);
  const pct = (a: number, b: number) => (b ? `%${Math.round((a / b) * 100)}` : "Yok");

  const cards = [
    { label: "Sohbet", value: nf.format(all.length), hint: "son 30 gün" },
    { label: "Asistanda çözülen", value: pct(botOnly, all.length), hint: `${botOnly} sohbet ekibe aktarılmadı` },
    { label: "Talebe ya da randevuya dönen", value: nf.format(leads + bookings), hint: `${leads} talep, ${bookings} randevu` },
    { label: "Ekibin ilk yanıtı", value: avgReply === null ? "Yok" : dur(avgReply), hint: waiting ? `${waiting} aktarılan sohbet yanıt bekliyor` : "ortalama, aktarıldıktan sonra" },
  ];

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
        <div className="guru-pipe guru-plan">
          <header className="guru-pipe__head">
            <div>
              <h1>Sohbet raporu</h1>
              <p>Son 30 gün, sitedeki sohbet balonu</p>
            </div>
            <nav className="guru-pipe__tools" aria-label="Sohbet bağlantıları">
              <Link className="guru-plan__nav" href="/admin/sohbetler">
                Sohbetler
              </Link>
              <Link className="guru-plan__nav" href="/admin/collections/knowledge">
                Bilgi tabanı
              </Link>
            </nav>
          </header>
          <div className="guru-home__cards guru-chat__cards">
            {cards.map((c) => (
              <div key={c.label} className="guru-home__card">
                <span className="guru-home__value">{c.value}</span>
                <span className="guru-home__label">{c.label}</span>
                <span className="guru-home__hint">{c.hint}</span>
              </div>
            ))}
          </div>
          <div className="guru-home__cols">
            <section className="guru-home__panel">
              <div className="guru-home__panel-head">
                <h2>Konular</h2>
              </div>
              {topicRows.length === 0 ? (
                <p className="guru-home__empty">Henüz sohbet yok.</p>
              ) : (
                <ul className="guru-plan__cap">
                  {topicRows.map(([k, v]) => (
                    <li key={k}>
                      <span className="guru-plan__who">{k}</span>
                      <span className="guru-plan__bar" aria-hidden>
                        <span style={{ width: `${(v.n / topicRows[0][1].n) * 100}%` }} />
                      </span>
                      <span className="guru-plan__pct">{v.n}</span>
                      <small>{v.converted ? `${v.converted} tanesi talebe ya da randevuya döndü` : "talebe dönen yok"}</small>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className="guru-home__panel">
              <div className="guru-home__panel-head">
                <h2>Asistanın yanıtlayamadıkları</h2>
                <Link href="/admin/collections/knowledge/create">Bilgi ekle</Link>
              </div>
              {unanswered.docs.length === 0 ? (
                <p className="guru-home__empty">Asistanın bilgi tabanında bulamadığı soru yok.</p>
              ) : (
                <ul className="guru-home__rows">
                  {unanswered.docs.map((m) => (
                    <li key={m.id}>
                      <Link href={`/admin/sohbetler?id=${typeof m.conversation === "object" ? m.conversation.id : m.conversation}`}>
                        <span className="guru-home__who">{m.text}</span>
                        <span className="guru-home__meta">{stamp.format(new Date(m.createdAt))}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <p className="guru-home__meta">Bu soruların yanıtını Bilgi tabanına eklerseniz asistan bir dahakine kendisi yanıtlar.</p>
            </section>
          </div>
        </div>
      </Gutter>
    </DefaultTemplate>
  );
}
