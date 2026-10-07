import Link from "next/link";
import { Mail } from "lucide-react";
import { InstagramIcon } from "@/components/ui/icons";
import { awards, site } from "@/lib/data";
import { Logo } from "./Logo";

const headCls = "mb-3 text-[15px] font-medium text-heading";
const linkCls = "block py-1.5 text-[14px] text-body transition-colors hover:text-brand";

/** "https://www.instagram.com/gurudijital/" → "gurudijital" */
const handleOf = (url: string) => url.replace(/\/+$/, "").split("/").pop() || "gurudijital";

type SiteFooterProps = {
  email: string;
  instagram: string;
  showBlog?: boolean;
  services: { title: string; slug: string }[];
  products: { name: string; slug: string }[];
};

/** İletişim bilgileri, hizmet ve ürün listeleri panelden gelir; blog bağlantısı yayında yazı varken görünür. */
export function SiteFooter({ email, instagram, showBlog = false, services, products }: SiteFooterProps) {
  const year = new Date().getFullYear();
  const partner = awards.find((a) => a.title === "Google Partner");

  return (
    <footer className="bg-soft pb-8 pt-14 md:pt-16">
      <div className="container-g">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1.4fr_1fr_1.1fr_1fr_1fr]">
          <div className="col-span-2 lg:col-span-1">
            <Logo height={30} />
            <p className="mt-4 max-w-[260px] text-[14px] leading-relaxed text-muted">
              Markanızı dijitalde büyüten entegre ajans hizmetleri ve işletme yazılımları.
            </p>
            {partner && (
              <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[12.5px] font-medium text-heading shadow-[0_0_0_1px_rgb(1_20_65/0.07)]">
                <span className="size-1.5 rounded-full bg-brand" aria-hidden />
                {partner.year} {partner.title}
              </p>
            )}
          </div>

          <nav aria-label="Kurumsal">
            <h2 className={headCls}>Guru</h2>
            <Link href="/hakkimizda" className={linkCls}>Hakkımızda</Link>
            <Link href="/hakkimizda#ekip" className={linkCls}>Ekibimiz</Link>
            <Link href="/#referanslar" className={linkCls}>Referanslarımız</Link>
            {showBlog && <Link href="/blog" className={linkCls}>Blog</Link>}
            <Link href="/iletisim" className={linkCls}>İletişim</Link>
          </nav>

          <nav aria-label="Hizmetler">
            <h2 className={headCls}>Hizmetler</h2>
            {services.map((s) => (
              <Link key={s.slug} href={`/hizmetler/${s.slug}`} className={linkCls}>
                {s.title}
              </Link>
            ))}
          </nav>

          <nav aria-label="Ürünler">
            <h2 className={headCls}>Ürünler</h2>
            {products.map((p) => (
              <Link key={p.slug} href={`/urunler/${p.slug}`} className={linkCls}>
                {p.name}
              </Link>
            ))}
          </nav>

          <div>
            <h2 className={headCls}>İletişim</h2>
            <a href={`mailto:${email}`} className={`${linkCls} break-all`}>
              {email}
            </a>
            <a href={instagram} target="_blank" rel="noopener noreferrer" className={linkCls}>
              @{handleOf(instagram)}
            </a>
            <div className="mt-3 flex gap-2">
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="grid size-11 place-items-center rounded-full bg-white text-heading shadow-[0_0_0_1px_rgb(1_20_65/0.07)] transition-colors hover:bg-brand hover:text-white"
              >
                <InstagramIcon className="size-4" />
              </a>
              <a
                href={`mailto:${email}`}
                aria-label="E-posta"
                className="grid size-11 place-items-center rounded-full bg-white text-heading shadow-[0_0_0_1px_rgb(1_20_65/0.07)] transition-colors hover:bg-brand hover:text-white"
              >
                <Mail className="size-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 text-[13px] text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {site.name}. Tüm hakları saklıdır.</p>
          <p>Unlock the next level</p>
        </div>
      </div>
    </footer>
  );
}
