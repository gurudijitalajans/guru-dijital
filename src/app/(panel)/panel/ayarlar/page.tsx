import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { getPanelContext } from "@/panel/context";
import { PageHeader } from "@/panel/ui/page-header";
import { Card } from "@/panel/ui/card";
import { Checklist } from "@/panel/ui/checklist";
import { DemoBox } from "@/panel/setup/DemoBox";
import { siteChecklist } from "@/payload/setup/checklists";
import { cms } from "@/lib/cms";

export const metadata: Metadata = { title: "Ayarlar" };
export const dynamic = "force-dynamic";

type Item = { title: string; detail: string; href: string };

/**
 * Bütün ayarlar tek sayfada: günlük listelerin arasına karışmaz. Kullanıcının
 * rolüne ve işletmenin açık modüllerine göre görünür; ayar ekranları
 * şimdilik mevcut panelde açılır.
 */
export default async function SettingsPage() {
  const ctx = await getPanelContext();
  const groups: { title: string; items: (Item | false)[] }[] = [
    {
      title: "İşletme",
      items: [
        ctx.isTenantAdmin && { title: "Ekip ve yetkiler", detail: "Kişi davet edin, rol ve modül verin.", href: "/admin/ekip" },
        ctx.isGuruAdmin && { title: "İşletme bilgileri", detail: "Unvan, logo, teklif belgesinde görünen bilgiler, açık modüller.", href: `/admin/collections/tenants/${ctx.tenant.id}` },
        ctx.has("business") && ctx.isTenantAdmin && { title: "Yönetim özeti ayarları", detail: "Aylık hedef ve sabah özeti e-postası.", href: "/admin/collections/business-config" },
      ],
    },
    {
      title: "Müşteri kanalları",
      items: [
        (ctx.has("crm") || ctx.has("chat")) && { title: "Site bağlantısı", detail: "Sitenize eklenecek tek satırlık kod, izinli adresler, talep formu.", href: "/admin/collections/site-connection" },
        ctx.has("chat") && { title: "Sohbet asistanı", detail: "Karşılama metni, hazır sorular, hazır yanıtlar, aylık sınır.", href: "/admin/collections/chatbot-config" },
        ctx.has("chat") && { title: "Bilgi tabanı", detail: "Asistanın bildikleri: site taraması, belgeler, elle yazılanlar.", href: "/admin/collections/knowledge" },
      ],
    },
    {
      title: "Veri ve süreçler",
      items: [
        ctx.has("crm") && { title: "Veri aktarma", detail: "Excel ya da CSV dosyasından kişi, firma ve fırsat.", href: "/admin/veri-aktar" },
        ctx.has("ops") && { title: "Süreç şablonları", detail: "Projeye açılınca görev olan adımlar, süreler, sorumlular.", href: "/admin/collections/templates" },
      ],
    },
    {
      title: "Guru Dijital",
      items: [
        ctx.isGuruAdmin && { title: "İşletmeler", detail: "Müşteri işletmeleri, modüller, durum, demo işletmesi.", href: "/admin/collections/tenants" },
        ctx.isGuruAdmin && { title: "Kullanıcılar", detail: "Tüm hesaplar ve hesap türleri.", href: "/admin/collections/users" },
        ctx.isGuruAdmin && { title: "Kullanım", detail: "İşletme başına aylık sohbet ve yapay zekâ kullanımı.", href: "/admin/collections/usage" },
        ctx.isGuruAdmin && { title: "İşlem geçmişi", detail: "Kim neyi ne zaman değiştirdi.", href: "/admin/collections/audit-log" },
        ctx.isGuruAdmin && ctx.isGuruTenant && { title: "Site ayarları", detail: "İletişim bilgileri, duyuru bandı, ziyaretçi analizi.", href: "/admin/globals/site-settings" },
      ],
    },
  ];
  const visible = groups.map((g) => ({ ...g, items: g.items.filter(Boolean) as Item[] })).filter((g) => g.items.length);
  /* Guru'ya özel: sitenin eksikleri (Guru Dijital seçiliyken) ve satış sunumu için demo işletmesi */
  const payload = await cms();
  const [site, demo] = ctx.isGuruAdmin
    ? await Promise.all([
        ctx.isGuruTenant ? siteChecklist(payload, ctx.tenant.id) : Promise.resolve(null),
        payload.find({ collection: "tenants", where: { slug: { equals: "demo" } }, limit: 1, depth: 0, overrideAccess: true }).then((r) => r.docs[0]?.id ?? null),
      ])
    : [null, null];

  return (
    <>
      <PageHeader title="Ayarlar" description={`${ctx.tenant.name} için. Ayar ekranları şimdilik mevcut panelde açılır.`} />
      <div className="grid gap-6">
        {site ? <Checklist title="Siteyi Tamamla" items={site} note="Guru Dijital sitesinin eksikleri; her madde kendiliğinden işaretlenir." /> : null}
        {ctx.isGuruAdmin ? (
          <Card className="px-4 py-4">
            <h2 className="mt-0 mb-1 text-[16px] font-semibold text-ink">Demo İşletmesi</h2>
            <p className="mt-0 mb-3 text-[14px] text-muted">Satış görüşmesinde paneli gerçek veri göstermeden tanıtmak için: örnek firma, kişi, fırsat, teklif, proje ve sohbetlerle dolu, kurmaca bir işletme. Sunumdan sonra sıfırlayın.</p>
            <DemoBox demoId={demo} />
          </Card>
        ) : null}
        {visible.map((g) => (
          <section key={g.title}>
            <h2 className="mt-0 mb-2.5 text-[13px] font-semibold uppercase tracking-[0.07em] text-muted">{g.title}</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {g.items.map((it) => (
                <a key={it.title} href={it.href} className="group flex min-h-20 items-center gap-3 rounded-card border border-line bg-surface px-4 py-3.5 no-underline hover:border-accent">
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-ink">{it.title}</span>
                    <span className="block text-[14px] text-muted">{it.detail}</span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-muted group-hover:text-accent" aria-hidden />
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
