import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import legal from "@/content/legal.json";
import { Glyph } from "@/components/site/Glyph";
import { iconBoxCls } from "@/components/site/styles";
import { LegalToc, type TocItem } from "@/components/pages/yasal/LegalToc";
import { getSiteInfo } from "@/lib/cms";
import { LEGAL_PAGES } from "@/lib/legal";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

type Block =
  | { type: "h2" | "h3" | "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "table"; head: string[]; rows: string[][] };
type Doc = { title: string; updated: string; blocks: Block[] };
type Section = TocItem & { blocks: Block[] };

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

/** "6. Kanun'un 11. maddesi…" → bölüm adresi "kanunun-11-maddesi…" */
const TR: Record<string, string> = { ç: "c", ğ: "g", ı: "i", İ: "i", ö: "o", ş: "s", ü: "u" };
const slugify = (s: string) =>
  s
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıİöşü]/g, (c) => TR[c] ?? c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Bloklar h2'lerden bölümlere ayrılır; ilk h2'den önceki paragraflar giriş olur */
function split(blocks: Block[]) {
  const intro: Block[] = [];
  const sections: Section[] = [];
  for (const b of blocks) {
    if (b.type === "h2") {
      const m = b.text.match(/^(\d+)\.\s*(.*)$/);
      const label = m ? m[2] : b.text;
      sections.push({ id: slugify(label), n: m ? m[1] : String(sections.length + 1), label, blocks: [] });
    } else if (sections.length) sections[sections.length - 1].blocks.push(b);
    else intro.push(b);
  }
  return { intro, sections };
}

/* Metindeki **kalın** ve e-posta adreslerini işler */
function Inline({ text }: { text: string }) {
  /* "(c bendi)" ve "md. 5" satır sonunda bölünmesin */
  const t = text.replace(/\((\p{L}) bendi\)/gu, "($1\u00a0bendi)").replace(/md\. (\d)/g, "md.\u00a0$1");
  return (
    <>
      {t.split(/(\*\*[^*]+\*\*|[\w.+-]+@[\w-]+\.[\w.]+)/g).map((part, i) =>
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

function BlockView({ b }: { b: Block }) {
  if (b.type === "h3") return <h3>{b.text}</h3>;
  if (b.type === "p")
    return (
      <p>
        <Inline text={b.text} />
      </p>
    );
  if (b.type === "ul")
    return (
      <ul>
        {b.items.map((t, j) => (
          <li key={j}>
            <Inline text={t} />
          </li>
        ))}
      </ul>
    );
  if (b.type !== "table") return null;
  /* Tablo: ince çerçeveli kutu, tonlu başlık satırı. Dar ekranda her satır bir kart (etiket: değer) */
  return (
    <>
      <ul className="my-6 grid gap-2.5 !pl-0 [list-style:none] md:hidden">
        {b.rows.map((r, j) => (
          <li key={j} className="!m-0 rounded-2xl bg-white p-4 shadow-[0_0_0_1px_rgb(1_20_65/0.09)]">
            <p className="!mb-2 text-[15px] font-medium text-heading">
              <Inline text={r[0]} />
            </p>
            <dl className="grid gap-1.5 text-[14px] leading-relaxed">
              {r.slice(1).map((c, k) => (
                <div key={k} className="grid gap-0.5 min-[400px]:grid-cols-[92px_minmax(0,1fr)] min-[400px]:gap-3">
                  <dt className="text-muted">{b.head[k + 1]}</dt>
                  <dd>
                    <Inline text={c} />
                  </dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
      <div className="my-6 hidden overflow-x-auto rounded-2xl shadow-[0_0_0_1px_rgb(1_20_65/0.09)] md:block">
        <table className="w-full min-w-[620px] border-collapse text-left text-[14.5px] leading-relaxed">
          <thead className="bg-soft">
            <tr>
              {b.head.map((h) => (
                <th key={h} className="px-5 py-3 text-[13.5px] font-semibold text-heading">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {b.rows.map((r, j) => (
              <tr key={j} className="border-t border-[rgb(1_20_65/0.07)] align-top">
                {r.map((c, k) => (
                  <td key={k} className={cn("px-5 py-3.5", k === 0 && "min-w-[150px] font-medium text-heading")}>
                    <Inline text={c} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

const fmt = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" });

/**
 * Yasal metin: üstte başlık bandı ve metinler arası sekmeler; solda yapışkan içindekiler,
 * sağda tam genişlikte numaralı bölümler; sonda başvuru kutusu ve diğer metinler.
 */
export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = docOf(slug);
  if (!doc) notFound();
  const info = await getSiteInfo();
  const { intro, sections } = split(doc.blocks);
  const others = LEGAL_PAGES.filter((p) => p.slug !== slug);

  return (
    <article>
      <header className="bg-soft">
        <div className="container-g pb-8 pt-8 md:pb-10 md:pt-12">
          <p className="text-[13.5px] font-medium text-muted">Yasal metinler</p>
          <h1 className="mt-2 text-[32px] font-normal leading-[1.1] tracking-[-0.03em] text-heading md:text-[44px]">{doc.title}</h1>
          <p className="mt-3 text-[14px] text-muted">Son güncelleme: {fmt.format(new Date(doc.updated))}</p>
          <nav aria-label="Yasal metinler" className="mt-7">
            <ul className="flex flex-wrap gap-2">
              {LEGAL_PAGES.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/yasal/${p.slug}`}
                    aria-current={p.slug === slug ? "page" : undefined}
                    className={cn(
                      "inline-flex min-h-10 items-center whitespace-nowrap rounded-full px-4 text-[14px] font-medium transition-colors",
                      p.slug === slug ? "bg-navy text-white" : "bg-white text-heading shadow-[0_0_0_1px_rgb(1_20_65/0.08)] hover:text-brand"
                    )}
                  >
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <div className="container-g grid gap-8 pb-16 pt-8 md:pb-[72px] md:pt-12 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-14">
        <aside className="min-w-0">
          <LegalToc items={sections.map(({ id, n, label }) => ({ id, n, label }))} />
        </aside>

        <div className="legal min-w-0 text-[16px] leading-[1.75] text-body">
          {intro.length > 0 && (
            <div className="text-[17px] leading-[1.7] text-heading/85">
              {intro.map((b, i) => (
                <BlockView key={i} b={b} />
              ))}
            </div>
          )}
          {sections.map((s) => (
            <section
              key={s.id}
              id={s.id}
              className="mt-10 scroll-mt-[calc(var(--header-h)+28px)] border-t border-[rgb(1_20_65/0.08)] pt-9 first:mt-6"
            >
              <h2 className="mb-4 flex items-start gap-3 text-[21px] font-medium leading-snug tracking-[-0.015em] text-heading md:text-[23px]">
                <span aria-hidden className="-mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-chip md:mt-0 text-[13.5px] font-semibold tabular-nums text-brand">
                  {s.n}
                </span>
                {s.label}
              </h2>
              {s.blocks.map((b, i) => (
                <BlockView key={i} b={b} />
              ))}
            </section>
          ))}

          {/* Başvuru kutusu: haklar ve sorular için doğrudan iletişim */}
          <div className="mt-12 flex flex-col gap-4 rounded-2xl bg-soft p-5 sm:flex-row sm:items-center sm:p-6">
            <span aria-hidden className={cn(iconBoxCls, "shrink-0 bg-white")}>
              <Glyph name="mail" className="size-6" strokeWidth={1.7} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="!m-0 text-[16px] font-medium text-heading">Sorularınız ve başvurularınız için</p>
              <p className="!m-0 text-[14.5px] text-muted">Bu metinle ilgili her türlü talebinizi e-postayla iletebilirsiniz.</p>
            </div>
            <a
              href={`mailto:${info.email}`}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-navy px-5 text-[14.5px] font-medium text-white transition-colors hover:bg-brand"
            >
              {info.email}
            </a>
          </div>
        </div>
      </div>

      {/* Diğer yasal metinler: beyaz zeminde, üstte ince çizgiyle; alt bilginin tonlu zemini hemen sonra başlar
          (iki tonlu bölüm art arda gelince boşluklar birleşip hata gibi duruyordu) */}
      <section className="border-t border-[rgb(1_20_65/0.08)] py-12 md:py-14" aria-labelledby="diger-yasal">
        <div className="container-g">
          <h2 id="diger-yasal" className="text-[22px] font-medium tracking-[-0.02em] text-heading md:text-[26px]">
            Diğer Yasal Metinler
          </h2>
          <ul className="mt-6 grid gap-3 md:gap-4 lg:grid-cols-3">
            {others.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/yasal/${p.slug}`}
                  className="group flex h-full items-start gap-4 rounded-2xl bg-white p-5 shadow-[0_0_0_1px_rgb(1_20_65/0.07)] transition-shadow duration-300 hover:shadow-[0_0_0_1px_rgb(42_106_202/0.35),0_18px_40px_-24px_rgb(1_20_65/0.35)]"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[16px] font-medium text-heading">{p.label}</span>
                    <span className="mt-1 block text-[14px] leading-snug text-muted">{p.desc}</span>
                  </span>
                  <ArrowRight aria-hidden className="mt-1 size-4 shrink-0 text-heading transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-brand" strokeWidth={2} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </article>
  );
}
