import type { Metadata } from "next";
import Link from "next/link";
import { requireModule } from "@/panel/context";
import { cms } from "@/lib/cms";
import { PageHeader } from "@/panel/ui/page-header";
import { Card, CardHeader, Empty, Stat } from "@/panel/ui/card";
import { BarList, PeriodLinks } from "@/panel/ui/period";
import { usageThisMonth } from "@/payload/channels/usage";
import { chatConfigOf } from "@/payload/chat/collections";
import { daysAgoIso } from "@/payload/utils";

export const metadata: Metadata = { title: "Sohbet raporu" };
export const dynamic = "force-dynamic";

const PERIODS = [7, 30, 90];
const nf = new Intl.NumberFormat("tr-TR");
const stamp = new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const dur = (ms: number) => {
  const m = Math.round(ms / 60000);
  return m < 60 ? `${m} dk` : `${Math.floor(m / 60)} sa ${m % 60} dk`;
};
const pct = (a: number, b: number) => (b ? `%${Math.round((a / b) * 100)}` : "Veri yok");
const idOf = (v: unknown) => (v && typeof v === "object" ? (v as { id: number }).id : (v as number));

/**
 * Sohbet raporu (mevcut raporla aynı hesap): sohbet sayısı, asistanın tek
 * başına yürüttüğü oran, talebe ve randevuya dönenler, ekibin ilk yanıt süresi,
 * konular ve asistanın yanıtlayamadığı sorular; bu ayın kullanımı.
 */
export default async function ChatReportPage({ searchParams }: { searchParams: Promise<{ gun?: string }> }) {
  const ctx = await requireModule("chat");
  const sp = await searchParams;
  const days = PERIODS.find((d) => String(d) === sp.gun) ?? 30;
  const since = daysAgoIso(days);
  const payload = await cms();
  const [convs, unanswered, usage, cfg] = await Promise.all([
    ctx.find("conversations", { where: { createdAt: { greater_than_equal: since } }, limit: 5000, select: { topic: true, lead: true, booking: true, handedOffAt: true, firstTeamReplyAt: true } }),
    ctx.find("chat-messages", { where: { and: [{ unanswered: { equals: true } }, { createdAt: { greater_than_equal: since } }] }, sort: "-createdAt", limit: 20 }),
    usageThisMonth(payload, ctx.tenant.id),
    chatConfigOf(payload, ctx.tenant.id),
  ]);
  type C = { topic?: string | null; lead?: unknown; booking?: unknown; handedOffAt?: string | null; firstTeamReplyAt?: string | null };
  const all = convs.docs as C[];
  const handed = all.filter((c) => c.handedOffAt);
  const botOnly = all.length - handed.length;
  const leads = all.filter((c) => c.lead).length;
  const bookings = all.filter((c) => c.booking).length;
  /* Yalnız asistanın aktardıkları: ekibin kendiliğinden devraldığı sohbet (aktarım = ilk yanıt) süreyi sıfıra çekmesin */
  const replyTimes = handed.filter((c) => c.firstTeamReplyAt && c.firstTeamReplyAt !== c.handedOffAt).map((c) => Date.parse(c.firstTeamReplyAt!) - Date.parse(c.handedOffAt!)).filter((v) => v >= 0);
  const avgReply = replyTimes.length ? replyTimes.reduce((a, b) => a + b, 0) / replyTimes.length : null;
  const waiting = handed.filter((c) => !c.firstTeamReplyAt).length;
  const topics = new Map<string, { value: number; converted: number }>();
  for (const c of all) {
    const k = c.topic || "Etiketsiz";
    const row = topics.get(k) ?? { value: 0, converted: 0 };
    row.value++;
    if (c.lead || c.booking) row.converted++;
    topics.set(k, row);
  }
  const topicRows = [...topics.entries()].map(([label, v]) => ({ label, value: v.value, note: v.converted ? `${v.converted} tanesi talebe ya da randevuya döndü` : "talebe dönen yok" })).sort((a, b) => b.value - a.value);
  const limit = cfg.monthlyLimit ?? 0;
  const used = usage?.conversations ?? 0;
  const tokens = Math.round(((usage?.inputTokens ?? 0) + (usage?.outputTokens ?? 0)) / 1000);

  return (
    <>
      <PageHeader title="Sohbet raporu" description={`Son ${days} gün, sitedeki sohbet balonu.`} actions={<PeriodLinks base="/panel/sohbet-raporu" options={PERIODS} current={days} />} />
      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat label="Sohbet" value={nf.format(all.length)} hint={`son ${days} gün`} />
        <Stat label="Asistanda çözülen" value={pct(botOnly, all.length)} hint={`${nf.format(botOnly)} sohbet ekibe aktarılmadı`} />
        <Stat label="Talebe ya da randevuya dönen" value={nf.format(leads + bookings)} hint={`${nf.format(leads)} talep, ${nf.format(bookings)} randevu`} />
        <Stat label="Ekibin ilk yanıtı" value={avgReply === null ? "Veri yok" : dur(avgReply)} hint={waiting ? `${nf.format(waiting)} aktarılan sohbet yanıt bekliyor` : "ortalama, aktarıldıktan sonra"} />
      </div>
      <Card className="mb-4 px-4 py-3.5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="font-medium text-ink">Bu ayın kullanımı</span>
          <span className="tabular text-[14px] text-muted">
            {nf.format(used)} sohbet{limit ? ` / ${nf.format(limit)} sınır` : ""} · {nf.format(usage?.aiCalls ?? 0)} yapay zekâ yanıtı · {nf.format(tokens)} bin token
          </span>
        </div>
        {limit ? (
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-sunken" role="img" aria-label={`Aylık sınırın %${Math.round((used / limit) * 100)} kadarı`}>
            <div className={used >= limit ? "h-full rounded-full bg-bad" : used / limit > 0.85 ? "h-full rounded-full bg-warn" : "h-full rounded-full bg-accent"} style={{ width: `${Math.min(100, (used / limit) * 100)}%` }} />
          </div>
        ) : null}
        {limit && used >= limit ? <p className="mt-2 mb-0 text-[13px] text-bad">Aylık sınıra ulaşıldı: asistan susar, yeni mesajlar doğrudan ekibe düşer.</p> : null}
      </Card>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader title="Konular" />
          <BarList rows={topicRows} empty="Bu dönemde sohbet yok." note={(r) => r.note} />
        </Card>
        <Card>
          <CardHeader title="Asistanın Yanıtlayamadıkları" action={<Link href="/admin/collections/knowledge/create" prefetch={false} className="text-[14px] text-accent">Bilgi ekle</Link>} />
          {unanswered.docs.length ? (
            <ul className="m-0 list-none p-0">
              {(unanswered.docs as { id: number; text: string; createdAt: string; conversation: unknown }[]).map((m) => (
                <li key={m.id} className="border-b border-line last:border-0">
                  <Link href={`/panel/gelen?f=tumu&s=s${idOf(m.conversation)}`} className="block px-4 py-2.5 no-underline hover:bg-sunken">
                    <span className="block text-[14px] break-words text-ink">{m.text}</span>
                    <span className="block text-[12px] text-muted">{stamp.format(new Date(m.createdAt))}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Asistanın bilgi tabanında bulamadığı soru yok.</Empty>
          )}
        </Card>
      </div>
    </>
  );
}
