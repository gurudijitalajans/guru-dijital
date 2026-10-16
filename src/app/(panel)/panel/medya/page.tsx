import type { Metadata } from "next";
import type { Where } from "payload";
import { requireModule } from "@/panel/context";
import { PageHeader } from "@/panel/ui/page-header";
import { MediaView, type MediaItem, type MediaDetail } from "@/panel/media/MediaView";
import { mediaUsageMap } from "@/payload/media-usage";
import { cms } from "@/lib/cms";
import type { Media } from "@/payload-types";

export const metadata: Metadata = { title: "Medya" };
export const dynamic = "force-dynamic";

const PAGE = 48;
const dateFmt = new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "long", year: "numeric" });
const idOf = (v: unknown) => (v && typeof v === "object" ? (v as { id: number }).id : ((v as number | null | undefined) ?? null));
const thumb = (m: Media) => m.sizes?.thumbnail?.url || m.thumbnailURL || m.url || "";

type SP = Promise<{ q?: string; klasor?: string; sayfa?: string; gorsel?: string; gorunum?: string }>;
export type FolderNode = { id: number; name: string; parent: number | null; count: number; total: number; depth: number };

/** Sitenin görselleri: arama, klasörler, yükleme; görsele tıklayınca sağdan ayrıntı ve kullanıldığı yerler */
export default async function MediaPage({ searchParams }: { searchParams: SP }) {
  const ctx = await requireModule("site");
  const sp = await searchParams;
  const payload = await cms();
  const opts = { user: ctx.user, overrideAccess: false } as const;
  const q = (sp.q ?? "").trim().slice(0, 80);
  const folder = sp.klasor === "yok" ? "yok" : Number(sp.klasor) || null;
  const page = Math.max(1, Number(sp.sayfa) || 1);

  const view = sp.gorunum === "kullanilmayan" || sp.gorunum === "kopya" ? sp.gorunum : null;

  /* Tüm klasörler ve görsellerin klasörü tek sorguda (klasör başına ayrı sayım yerine) */
  const [folderRes, lite, all] = await Promise.all([
    payload.find({ collection: "payload-folders", sort: "name", limit: 500, depth: 0, pagination: false, ...opts }),
    payload.find({ collection: "media", limit: 5000, depth: 0, pagination: false, select: { folder: true, filesize: true, width: true, height: true }, ...opts }),
    payload.count({ collection: "media", ...opts }),
  ]);
  const raw = folderRes.docs as unknown as { id: number; name: string; folder?: number | { id: number } | null }[];
  const parentOf = new Map(raw.map((f) => [f.id, idOf(f.folder)]));
  const direct = new Map<number | "yok", number>();
  for (const m of lite.docs as unknown as { folder?: unknown }[]) {
    const k = idOf(m.folder) ?? "yok";
    direct.set(k, (direct.get(k) ?? 0) + 1);
  }
  /* Ağaç: üst klasör altında sıralı, girinti derinliği; toplam sayı alt klasörleri de içerir */
  const kids = (pid: number | null) => raw.filter((f) => (parentOf.get(f.id) ?? null) === pid).sort((a, b) => a.name.localeCompare(b.name, "tr"));
  const tree: FolderNode[] = [];
  const walk = (pid: number | null, depth: number): number => {
    let sum = 0;
    for (const f of kids(pid)) {
      const node: FolderNode = { id: f.id, name: f.name, parent: pid, count: direct.get(f.id) ?? 0, total: 0, depth };
      tree.push(node);
      node.total = node.count + walk(f.id, depth + 1);
      sum += node.total;
    }
    return sum;
  };
  walk(null, 0);
  const path: FolderNode[] = [];
  for (let cur = typeof folder === "number" ? folder : null; cur; cur = parentOf.get(cur) ?? null) {
    const n = tree.find((t) => t.id === cur);
    if (!n) break;
    path.unshift(n);
  }

  /* Akıllı görünümler: hiçbir yerde kullanılmayanlar ve birebir kopyalar (aynı boyut ve ölçü) */
  const usage = await mediaUsageMap(payload);
  const unused = (lite.docs as unknown as { id: number }[]).filter((m) => !usage.has(String(m.id))).map((m) => m.id);
  const groups = new Map<string, number[]>();
  for (const m of lite.docs as unknown as { id: number; filesize?: number | null; width?: number | null; height?: number | null }[]) {
    if (!m.filesize) continue;
    const k = `${m.filesize}:${m.width ?? 0}x${m.height ?? 0}`;
    groups.set(k, [...(groups.get(k) ?? []), m.id]);
  }
  const dupes = [...groups.values()].filter((g) => g.length > 1).flat();

  const and: Where[] = [];
  if (q) and.push({ or: [{ alt: { like: q } }, { filename: { like: q } }] });
  if (view === "kullanilmayan") and.push({ id: { in: unused.length ? unused : [0] } });
  else if (view === "kopya") and.push({ id: { in: dupes.length ? dupes : [0] } });
  else if (folder === "yok") and.push({ folder: { exists: false } });
  else if (folder) and.push({ folder: { equals: folder } });

  const list = await payload.find({ collection: "media", where: and.length ? { and } : undefined, sort: view === "kopya" ? "filesize" : "-createdAt", limit: PAGE, page, depth: 0, ...opts });
  const items: MediaItem[] = list.docs.map((m) => ({ id: m.id, alt: m.alt, filename: m.filename ?? "", thumb: thumb(m), width: m.width ?? 0, height: m.height ?? 0, used: usage.has(String(m.id)) }));

  let selected: MediaDetail | null = null;
  const sid = Number(sp.gorsel);
  if (sid) {
    const m = await payload.findByID({ collection: "media", id: sid, depth: 0, ...opts }).catch(() => null);
    if (m) {
      const uses = usage.get(String(m.id)) ?? [];
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
      <PageHeader title="Medya" description={`${all.totalDocs.toLocaleString("tr-TR")} görsel · ${tree.length} klasör · ${unused.length.toLocaleString("tr-TR")} kullanılmıyor`} />
      <MediaView
        items={items}
        total={list.totalDocs}
        page={page}
        pages={Math.max(1, list.totalPages)}
        q={q}
        folder={folder}
        view={view}
        tree={tree}
        path={path}
        folders={tree.map((f) => ({ id: f.id, name: `${"· ".repeat(f.depth)}${f.name}`, count: f.total }))}
        totalAll={all.totalDocs}
        looseCount={direct.get("yok") ?? 0}
        unusedCount={unused.length}
        dupeCount={dupes.length}
        selected={selected}
        canDelete={ctx.isGuruAdmin}
        clientUpload={Boolean(process.env.BLOB_READ_WRITE_TOKEN)}
      />
    </>
  );
}
