import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import legal from "@/content/legal.json";
import { PageIntro } from "@/components/site/PageIntro";
import { LEGAL_PAGES } from "@/lib/legal";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

type Block =
  | { type: "h2" | "h3" | "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "table"; head: string[]; rows: string[][] };
type Doc = { title: string; updated: string; blocks: Block[] };


const docOf = (slug: string) => (LEGAL_PAGES.some((p) => p.slug === slug) ? ((legal as unknown as Record<string, Doc>)[slug] ?? null) : null);

export const dynamicParams = false;
export function generateStaticParams() {
  return LEGAL_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = docOf(slug);
  if (!doc) return {};
  return pageMetadata({ title: doc.title, description: `Guru Dijital ${doc.title}: kişisel verileriniz, çerezler ve sitenin kullanımıyla ilgili bilgiler.`, path: `/yasal/${slug}` });
}

/* Metindeki **kalın** ve e-posta adreslerini işler */
function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*|[\w.+-]+@[\w-]+\.[\w.]+)/g).map((part, i) =>
        part.startsWith("**") ? (
          <b key={i} className="font-semibold text-heading">
            {part.slice(2, -2)}
          </b>
        ) : /@/.test(part) && /^[\w.+-]+@/.test(part) ? (
          <a key={i} href={`mailto:${part}`} className="text-brand underline-offset-2 hover:underline">
            {part}
          </a>
        ) : (
          part
        )
      )}
    </>
  );
}

const fmt = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" });

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = docOf(slug);
  if (!doc) notFound();
  return (
    <>
      <PageIntro eyebrow="Yasal" title={doc.title} lead={`Son güncelleme: ${fmt.format(new Date(doc.updated))}`} className="pb-8 md:pb-10" />
      <section className="pb-16 md:pb-[72px]">
        <div className="container-g grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-16">
          <nav aria-label="Yasal metinler" className="lg:sticky lg:top-28 lg:self-start">
            <ul className="flex flex-wrap gap-2 lg:grid lg:gap-1">
              {LEGAL_PAGES.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/yasal/${p.slug}`}
                    aria-current={p.slug === slug ? "page" : undefined}
                    className={cn(
                      "inline-flex min-h-11 items-center rounded-xl px-3.5 text-[14.5px] transition-colors lg:flex",
                      p.slug === slug ? "bg-navy font-medium text-white" : "bg-soft text-body hover:text-brand lg:bg-transparent lg:hover:bg-soft"
                    )}
                  >
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <article className="prose-guru min-w-0 max-w-[820px]">
            {doc.blocks.map((b, i) => {
              if (b.type === "h2") return <h2 key={i}>{b.text}</h2>;
              if (b.type === "h3") return <h3 key={i}>{b.text}</h3>;
              if (b.type === "p")
                return (
                  <p key={i}>
                    <Inline text={b.text} />
                  </p>
                );
              if (b.type === "ul")
                return (
                  <ul key={i}>
                    {b.items.map((t, j) => (
                      <li key={j}>
                        <Inline text={t} />
                      </li>
                    ))}
                  </ul>
                );
              if (b.type !== "table") return null;
              return (
                <div key={i} className="not-prose my-6 overflow-x-auto rounded-2xl shadow-[0_0_0_1px_rgb(1_20_65/0.08)]">
                  <table className="w-full min-w-[560px] border-collapse text-left text-[14.5px]">
                    <thead className="bg-soft text-heading">
                      <tr>
                        {b.head.map((h) => (
                          <th key={h} className="px-4 py-3 font-semibold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {b.rows.map((r, j) => (
                        <tr key={j} className="border-t border-[rgb(1_20_65/0.07)] align-top">
                          {r.map((c, k) => (
                            <td key={k} className="px-4 py-3 text-body">
                              <Inline text={c} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </article>
        </div>
      </section>
    </>
  );
}
