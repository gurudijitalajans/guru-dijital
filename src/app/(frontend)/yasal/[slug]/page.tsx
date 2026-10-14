import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import legal from "@/content/legal.json";
import { LEGAL_PAGES } from "@/lib/legal";
import { pageMetadata } from "@/lib/seo";

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
    <article className="pb-12 pt-8 md:pb-14 md:pt-10">
      <div className="container-g">
        <header className="max-w-[820px] border-b border-[rgb(1_20_65/0.08)] pb-6">
          <p className="text-[13px] font-medium text-muted">Yasal</p>
          <h1 className="mt-2 text-[30px] font-medium leading-tight tracking-[-0.02em] text-heading md:text-[36px]">{doc.title}</h1>
          <p className="mt-2 text-[14px] text-muted">Son güncelleme: {fmt.format(new Date(doc.updated))}</p>
        </header>
        <div className="legal mt-8 max-w-[820px] text-[15.5px] leading-[1.75] text-body">
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
              <div key={i} className="my-5 overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-left text-[14.5px]">
                  <thead>
                    <tr className="border-b border-[rgb(1_20_65/0.15)]">
                      {b.head.map((h) => (
                        <th key={h} className="py-2.5 pr-4 font-semibold text-heading">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((r, j) => (
                      <tr key={j} className="border-b border-[rgb(1_20_65/0.07)] align-top">
                        {r.map((c, k) => (
                          <td key={k} className="py-2.5 pr-4">
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
        </div>
        <nav aria-label="Diğer yasal metinler" className="mt-12 max-w-[820px] border-t border-[rgb(1_20_65/0.08)] pt-5 text-[14px]">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {LEGAL_PAGES.filter((p) => p.slug !== slug).map((p) => (
              <li key={p.slug}>
                <Link href={`/yasal/${p.slug}`} className="inline-flex min-h-9 items-center text-brand underline-offset-2 hover:underline">
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </article>
  );
}
