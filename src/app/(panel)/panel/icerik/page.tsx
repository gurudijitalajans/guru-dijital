import type { Metadata } from "next";
import type { CollectionSlug } from "payload";
import { requireModule } from "@/panel/context";
import { PageHeader } from "@/panel/ui/page-header";
import { ContentView, type PageCard, type PublishRow, type SimpleRow } from "@/panel/content/ContentView";
import { PUBLISHABLE, SIMPLE, type PublishKey, type SimpleKey } from "@/panel/content/kinds";
import { cms } from "@/lib/cms";

export const metadata: Metadata = { title: "Site içeriği" };
export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "short", year: "numeric" });
const TABS = ["sayfalar", ...Object.keys(PUBLISHABLE), ...Object.keys(SIMPLE)] as const;
type Tab = (typeof TABS)[number];

type SP = Promise<{ tur?: string; kayit?: string }>;
type Doc = Record<string, unknown> & { id: number; updatedAt: string };
const thumbOf = (v: unknown) => {
  const m = v as { sizes?: { thumbnail?: { url?: string | null } }; thumbnailURL?: string | null; url?: string | null } | null;
  return m && typeof m === "object" ? m.sizes?.thumbnail?.url || m.thumbnailURL || m.url || "" : "";
};

/**
 * Site içeriğinin tek sayfası. Sayfa metinleri, hizmet, ürün ve blog yazısı
 * canlı önizlemeli içerik ekranında düzenlenir (burada liste, durum ve yayın
 * düğmesi); ekip, referans, yorum ve vaka burada düzenlenir.
 */
export default async function ContentPage({ searchParams }: { searchParams: SP }) {
  const ctx = await requireModule("site");
  const sp = await searchParams;
  const tab: Tab = (TABS as readonly string[]).includes(sp.tur ?? "") ? (sp.tur as Tab) : "sayfalar";
  const payload = await cms();
  const opts = { user: ctx.user, overrideAccess: false } as const;

  const counts = Object.fromEntries(
    await Promise.all(
      [...Object.entries(PUBLISHABLE), ...Object.entries(SIMPLE)].map(async ([k, v]) => [k, (await payload.count({ collection: v.collection as CollectionSlug, ...opts })).totalDocs] as const),
    ),
  ) as Record<string, number>;

  let pages: PageCard[] = [];
  let publish: PublishRow[] = [];
  let simple: SimpleRow[] = [];

  if (tab === "sayfalar") {
    const [home, about] = await Promise.all([
      payload.findGlobal({ slug: "home-page", depth: 0, ...opts }),
      payload.findGlobal({ slug: "about-page", depth: 0, ...opts }),
    ]);
    const upd = (g: { updatedAt?: string | null }) => (g.updatedAt ? dateFmt.format(new Date(g.updatedAt)) : "Henüz kaydedilmedi");
    pages = [
      { title: "Ana Sayfa", detail: "Bölüm başlıkları, açıklamalar, hangi bölümün görüneceği", updated: upd(home), edit: "/panel/duzenle/home-page", view: "/" },
      { title: "Hakkımızda", detail: "Hikâye, değerler, ödüller", updated: upd(about), edit: "/panel/duzenle/about-page", view: "/hakkimizda" },
      ...(ctx.isGuruAdmin ? [{ title: "Site Ayarları", detail: "İletişim bilgileri, sosyal hesaplar, duyuru bandı, analiz", updated: "", edit: "/panel/duzenle/site-settings", view: null }] : []),
    ];
  } else if (tab in PUBLISHABLE) {
    const k = PUBLISHABLE[tab as PublishKey];
    const sort = tab === "blog" ? "-publishedAt" : "order";
    const [main, latest] = await Promise.all([
      payload.find({ collection: k.collection, sort, limit: 300, depth: 0, pagination: false, ...opts }),
      payload.find({ collection: k.collection, sort, limit: 300, depth: 0, pagination: false, draft: true, ...opts }),
    ]);
    const draftOf = new Map((latest.docs as unknown as Doc[]).map((d) => [d.id, d]));
    publish = (main.docs as unknown as Doc[]).map((d) => {
      const l = draftOf.get(d.id) ?? d;
      const published = d._status === "published";
      return {
        id: d.id,
        title: String(l[k.titleField] ?? d[k.titleField] ?? "Adsız"),
        status: published ? (l._status === "draft" ? "degisiklik" : "yayinda") : "taslak",
        updated: dateFmt.format(new Date(l.updatedAt)),
        order: typeof d.order === "number" ? d.order : null,
        view: published && d.slug ? `${k.base}/${d.slug}` : null,
        edit: `/panel/duzenle/${k.collection}/${d.id}`,
      };
    });
  } else {
    const k = SIMPLE[tab as SimpleKey];
    const r = await payload.find({ collection: k.collection, sort: "order", limit: 300, depth: 1, pagination: false, ...opts });
    simple = (r.docs as unknown as Doc[]).map((d) => {
      const values: Record<string, unknown> = {};
      for (const f of k.fields) {
        const v = d[f.name];
        values[f.name] = f.type === "media" ? (v && typeof v === "object" ? { id: (v as { id: number }).id, alt: (v as { alt?: string }).alt ?? "", thumb: thumbOf(v) } : null) : (v ?? null);
      }
      return { id: d.id, values, thumb: k.media ? thumbOf(d[k.media]) : "" };
    });
  }

  return (
    <>
      <PageHeader title="Site içeriği" description="Sayfa metinleri ve blog canlı önizlemeli editörde açılır; ekip, referans, yorum ve vakalar burada düzenlenir." />
      <ContentView tab={tab} counts={counts} pages={pages} publish={publish} simple={simple} open={sp.kayit ?? null} canDelete={ctx.isGuruAdmin} clientUpload={Boolean(process.env.BLOB_READ_WRITE_TOKEN)} />
    </>
  );
}
