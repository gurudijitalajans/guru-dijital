import type { Metadata } from "next";
import type { Where } from "payload";
import { requireModule } from "@/panel/context";
import { PageHeader } from "@/panel/ui/page-header";
import { MediaView, type MediaItem, type MediaDetail } from "@/panel/media/MediaView";
import { findMediaUsage } from "@/payload/media-usage";
import { cms } from "@/lib/cms";
import type { Media } from "@/payload-types";

export const metadata: Metadata = { title: "Medya" };
export const dynamic = "force-dynamic";

const PAGE = 48;
const dateFmt = new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "long", year: "numeric" });
const idOf = (v: unknown) => (v && typeof v === "object" ? (v as { id: number }).id : ((v as number | null | undefined) ?? null));
const thumb = (m: Media) => m.sizes?.thumbnail?.url || m.thumbnailURL || m.url || "";

type SP = Promise<{ q?: string; klasor?: string; sayfa?: string; gorsel?: string }>;

/** Sitenin görselleri: arama, klasörler, yükleme; görsele tıklayınca sağdan ayrıntı ve kullanıldığı yerler */
export default async function MediaPage({ searchParams }: { searchParams: SP }) {
  const ctx = await requireModule("site");
  const sp = await searchParams;
  const payload = await cms();
  const opts = { user: ctx.user, overrideAccess: false } as const;
  const q = (sp.q ?? "").trim().slice(0, 80);
  const folder = sp.klasor === "yok" ? "yok" : Number(sp.klasor) || null;
  const page = Math.max(1, Number(sp.sayfa) || 1);

  const and: Where[] = [];
  if (q) and.push({ or: [{ alt: { like: q } }, { filename: { like: q } }] });
  if (folder === "yok") and.push({ folder: { exists: false } });
  else if (folder) and.push({ folder: { equals: folder } });

  const [list, folders, all] = await Promise.all([
    payload.find({ collection: "media", where: and.length ? { and } : undefined, sort: "-createdAt", limit: PAGE, page, depth: 0, ...opts }),
    payload.find({ collection: "payload-folders", sort: "name", limit: 200, depth: 0, pagination: false, ...opts }),
    payload.count({ collection: "media", ...opts }),
  ]);

  const items: MediaItem[] = list.docs.map((m) => ({ id: m.id, alt: m.alt, filename: m.filename ?? "", thumb: thumb(m), width: m.width ?? 0, height: m.height ?? 0 }));

  let selected: MediaDetail | null = null;
  const sid = Number(sp.gorsel);
  if (sid) {
    const m = await payload.findByID({ collection: "media", id: sid, depth: 0, ...opts }).catch(() => null);
    if (m) {
      const uses = await findMediaUsage(payload, m.id);
      selected = {
        id: m.id,
        alt: m.alt,
        filename: m.filename ?? "",
        preview: m.sizes?.card?.url || m.url || "",
        url: m.url ?? "",
        size: m.filesize ?? 0,
        width: m.width ?? 0,
        height: m.height ?? 0,
        created: dateFmt.format(new Date(m.createdAt)),
        folder: idOf(m.folder),
        focalX: m.focalX ?? null,
        focalY: m.focalY ?? null,
        uses,
      };
    }
  }

  return (
    <>
      <PageHeader title="Medya" description={`${all.totalDocs.toLocaleString("tr-TR")} görsel · ${folders.docs.length} klasör`} />
      <MediaView
        items={items}
        total={list.totalDocs}
        page={page}
        pages={Math.max(1, list.totalPages)}
        q={q}
        folder={folder}
        folders={folders.docs.map((f) => ({ id: f.id, name: f.name }))}
        selected={selected}
        canDelete={ctx.isGuruAdmin}
        clientUpload={Boolean(process.env.BLOB_READ_WRITE_TOKEN)}
      />
    </>
  );
}
