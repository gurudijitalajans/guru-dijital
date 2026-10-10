import Link from "next/link";
import type { Payload } from "payload";
import { chatConfigOf } from "../../chat/collections";
import { siteConnectionOf } from "../../channels/collections";
import type { Module } from "../../business/roles";

/**
 * Yeni işletmenin panosunda "Kuruluma başlayın" listesi. Her madde verinin
 * kendisinden okunur; açık olmayan modülün maddesi görünmez. Hepsi bitince
 * liste kendiliğinden kalkar.
 */
export async function Onboarding({ payload, tenantId, has }: { payload: Payload; tenantId: number; has: (m: Module) => boolean }) {
  const t = { tenant: { equals: tenantId } };
  /* Guru yöneticisi her modüle yetkili; liste işletmenin açık modüllerine göre */
  const tenant = await payload.findByID({ collection: "tenants", id: tenantId, depth: 0, overrideAccess: true });
  const open = (m: Module) => has(m) && (tenant.modules ?? []).includes(m as never);
  const [conn, chat, knowledge, members, contacts, used] = await Promise.all([
    siteConnectionOf(payload, tenantId),
    open("chat") ? chatConfigOf(payload, tenantId) : Promise.resolve(null),
    payload.count({ collection: "knowledge", where: t }),
    payload.count({ collection: "users", where: { "tenants.tenant": { equals: tenantId } }, overrideAccess: true }),
    payload.count({ collection: "contacts", where: t }),
    payload.count({ collection: "usage", where: { and: [t, { or: [{ conversations: { greater_than: 0 } }, { formLeads: { greater_than: 0 } }] }] } }),
  ]);
  const origins = (conn.allowedOrigins ?? []).filter((o) => o.origin).length;
  const steps = [
    {
      show: open("chat") || open("crm"),
      done: origins > 0,
      title: "Site adresinizi ekleyin",
      detail: origins ? `${origins} adres kayıtlı` : "Sohbet balonu ve form yalnız kayıtlı adreslerde çalışır",
      href: "/admin/collections/site-connection",
    },
    {
      show: open("chat") || open("crm"),
      done: used.totalDocs > 0,
      title: "Kodu sitenize yerleştirin",
      detail: used.totalDocs > 0 ? "Sitenizden ilk sohbet ya da talep geldi" : "Site bağlantısı sayfasındaki tek satırlık kodu sitenizin altına ekleyin",
      href: "/admin/collections/site-connection",
    },
    {
      show: open("chat"),
      done: knowledge.totalDocs > 0,
      title: "Asistana işletmenizi anlatın",
      detail: knowledge.totalDocs ? `${knowledge.totalDocs} bilgi kaydı var` : "Sitenizi taratın ya da fiyat listesi, SSS gibi bir belge yükleyin",
      href: "/admin/collections/knowledge",
    },
    {
      show: open("chat"),
      done: Boolean(chat?.enabled),
      title: "Sohbet balonunu açın",
      detail: chat?.enabled ? "Balon sitenizde açık" : "Chatbot ayarlarından karşılama metnini yazıp balonu açın",
      href: "/admin/collections/chatbot-config",
    },
    {
      show: open("crm"),
      done: contacts.totalDocs > 0,
      title: "Müşteri listenizi aktarın",
      detail: contacts.totalDocs ? `${contacts.totalDocs} kişi kayıtlı` : "Excel ya da CSV dosyanızdaki kişi, firma ve fırsatları tek seferde alın",
      href: "/admin/veri-aktar",
    },
    {
      show: true,
      done: members.totalDocs > 1,
      title: "Ekibinizi davet edin",
      detail: members.totalDocs > 1 ? `Panelde ${members.totalDocs} kişi var` : "Her çalışan kendi hesabıyla girsin; yalnız gereken modülleri görsün",
      href: "/admin/ekip",
    },
  ].filter((s) => s.show);
  const doneCount = steps.filter((s) => s.done).length;
  if (!steps.length || doneCount === steps.length) return null;

  return (
    <section className="guru-home__panel">
      <div className="guru-home__panel-head">
        <h2>Kuruluma Başlayın</h2>
        <span className="guru-home__progress-label">
          {doneCount}/{steps.length} tamam
        </span>
      </div>
      <div className="guru-home__progress" aria-hidden>
        <span style={{ width: `${(doneCount / steps.length) * 100}%` }} />
      </div>
      <ul className="guru-home__checks">
        {steps.map((s) => (
          <li key={s.title} className={s.done ? "is-done" : undefined}>
            <span className="sr-only">{s.done ? "Tamamlandı: " : "Bekliyor: "}</span>
            <Link href={s.href}>
              <span className={`guru-home__tick${s.done ? " is-done" : ""}`} aria-hidden>
                {s.done ? "✓" : ""}
              </span>
              <span className="guru-home__check-text">
                <b>{s.title}</b>
                <span>{s.detail}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
