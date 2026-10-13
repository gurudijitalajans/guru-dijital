import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AdminViewServerProps } from "payload";

/**
 * Payload'un ana sayfası (/admin): her şey yeni panelde, buraya gelen panele
 * gider. Yalnız acil durum kapısı açıkken (/klasik, "guru-klasik" çerezi)
 * içerik ekranının bölümleri listelenir.
 */
export async function Dashboard({ initPageResult }: AdminViewServerProps) {
  if (!(await cookies()).get("guru-klasik")) redirect("/panel");
  const { collections, globals } = initPageResult.req.payload.config;
  const label = (l: unknown, fallback: string) => (typeof l === "string" ? l : l && typeof l === "object" ? String((l as Record<string, unknown>).tr ?? fallback) : fallback);
  return (
    <div style={{ padding: "32px 48px", maxWidth: 900 }}>
      <h1 style={{ marginTop: 0 }}>Klasik içerik ekranı</h1>
      <p>
        Acil durum için açıldı; bu tarayıcıda bir gün geçerli. Günlük iş için <Link href="/panel">panele dönün</Link>, kapatmak için{" "}
        <Link href="/klasik?kapat=1" prefetch={false}>
          kapıyı kapatın
        </Link>
        .
      </p>
      <h2>Sayfalar</h2>
      <ul>
        {globals.map((g) => (
          <li key={g.slug}>
            <Link href={`/admin/globals/${g.slug}`}>{label(g.label, g.slug)}</Link>
          </li>
        ))}
      </ul>
      <h2>Kayıtlar</h2>
      <ul>
        {collections
          .filter((c) => !c.admin?.hidden && !c.slug.startsWith("payload-"))
          .map((c) => (
            <li key={c.slug}>
              <Link href={`/admin/collections/${c.slug}`}>{label(c.labels?.plural, c.slug)}</Link>
            </li>
          ))}
      </ul>
    </div>
  );
}
