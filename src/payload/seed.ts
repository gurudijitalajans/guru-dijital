/**
 * Yerel veritabanını ilk kullanım için hazırlar: npm run seed
 *
 * - Hiç kullanıcı yoksa .env.local'deki SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD
 *   ile bir yönetici hesabı açar (yalnız yerel test içindir).
 * - Site Ayarları'nı data.ts varsayılanlarıyla doldurur.
 * - Üç blog kategorisi ve iki ÖRNEK yazı ekler (yalnız boşsa).
 * - Koddaki hizmet ve ürün içeriğini (data.ts, products-content.ts,
 *   service-showcase.ts, service-faq.ts) görselleriyle panele aktarır
 *   (yalnız boşsa). Bundan sonra içeriğin asıl yeri paneldir.
 *
 * Tekrar çalıştırmak güvenlidir; var olan kayıtlara dokunmaz.
 */
import path from "path";
import { fileURLToPath } from "url";
import { getPayload } from "payload";
import config from "@payload-config";
import { announcement, products, services, site } from "@/lib/data";
import { productDetails } from "@/lib/products-content";
import { iconNameOf } from "@/lib/icons";
import { serviceVisuals, type WorkImage } from "@/components/pages/hizmetler/service-showcase";
import { serviceFaq } from "@/components/pages/hizmetler/service-faq";
import type { Post } from "@/payload-types";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(dirname, "../../public");

/* ---- Lexical içerik yardımcıları ---- */
const text = (t: string, format = 0) => ({ type: "text", text: t, format, style: "", mode: "normal", detail: 0, version: 1 });
const base = { format: "", indent: 0, version: 1, direction: "ltr" as const };
const p = (...children: ReturnType<typeof text>[]) => ({ ...base, type: "paragraph", textFormat: 0, textStyle: "", children });
const h2 = (t: string) => ({ ...base, type: "heading", tag: "h2", children: [text(t)] });
const ul = (items: string[]) => ({
  ...base,
  type: "list",
  listType: "bullet",
  start: 1,
  tag: "ul",
  children: items.map((t, i) => ({ ...base, type: "listitem", value: i + 1, children: [text(t)] })),
});
const doc = (...children: object[]) => ({ root: { ...base, type: "root", children } }) as unknown as Post["content"];

const payload = await getPayload({ config });
const log = (m: string) => payload.logger.info(`seed: ${m}`);

/* 1. Yönetici */
const users = await payload.count({ collection: "users" });
if (users.totalDocs === 0) {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) throw new Error("SEED_ADMIN_EMAIL ve SEED_ADMIN_PASSWORD .env.local içinde tanımlı olmalı.");
  await payload.create({ collection: "users", data: { email, password, name: "Guru Yönetici", role: "admin" } });
  log(`yönetici hesabı açıldı (${email})`);
}

/* 2. Site ayarları (yalnız hiç kaydedilmemişse; paneldeki düzenlemeler korunur) */
const settings = await payload.findGlobal({ slug: "site-settings" });
if (!settings.contact?.email) {
  await payload.updateGlobal({
    slug: "site-settings",
    data: {
      announcement: { enabled: true, text: announcement },
      contact: { email: site.email, instagram: site.instagram },
    },
  });
  log("site ayarları yazıldı");
}

/* 3. Kategoriler */
const categoryNames = ["Dijital Pazarlama", "Sosyal Medya", "Web ve Teknoloji"];
const categoryIds: Record<string, number | string> = {};
for (const title of categoryNames) {
  const found = await payload.find({ collection: "categories", where: { title: { equals: title } }, limit: 1 });
  categoryIds[title] = found.docs[0]?.id ?? (await payload.create({ collection: "categories", data: { title } })).id;
}
log("kategoriler hazır");

/* 4. Örnek yazılar (yalnız hiç yazı yoksa) */
const posts = await payload.count({ collection: "posts" });
if (posts.totalDocs === 0) {
  const cover = async (file: string, alt: string) =>
    (await payload.create({ collection: "media", data: { alt }, filePath: path.join(publicDir, "work", file) })).id;

  await payload.create({
    collection: "posts",
    data: {
      title: "Sosyal medya içerik takvimi nasıl hazırlanır?",
      excerpt:
        "Düzenli ve tutarlı paylaşım için içerik takvimini hedef, kitle ve kaynaklarınıza göre adım adım nasıl kurabileceğinizi anlattık.",
      category: categoryIds["Sosyal Medya"] as number,
      cover: (await cover("instagram-postlar.webp", "Bir markanın Instagram gönderilerinden oluşan ızgara")) as number,
      _status: "published",
      content: doc(
        p(text("İçerik takvimi, ne zaman ne paylaşacağınızı önceden planladığınız bir yol haritasıdır. Takvim olmadan paylaşımlar günün yoğunluğuna kalır; markanın sesi ve düzeni kaybolur.")),
        h2("1. Hedefi ve kitleyi netleştirin"),
        p(text("Takvime geçmeden önce sosyal medyada neyi amaçladığınızı yazın: bilinirlik, etkileşim, satış ya da randevu. Kime konuştuğunuzu ve bu kişinin hangi saatlerde, hangi platformda olduğunu belirleyin.")),
        h2("2. İçerik başlıklarını belirleyin"),
        p(text("Her paylaşımı sıfırdan düşünmek yerine tekrar eden birkaç başlık seçin. Örneğin:")),
        ul(["Ürün ya da hizmet tanıtımı", "Sık sorulan sorular ve ipuçları", "Ekip ve kamera arkası", "Müşteri deneyimleri (izinle)", "Kampanya ve duyurular"]),
        h2("3. Sıklığı gerçekçi tutun"),
        p(text("Ekibinizin sürdürebileceği bir sıklık seçin. Az ama düzenli paylaşım, yoğun başlayıp yarıda kalan bir plandan daha iyi sonuç verir.")),
        h2("4. Ölçün ve güncelleyin"),
        p(text("Ay sonunda hangi içeriklerin daha çok kaydedildiğine, paylaşıldığına ve mesaj getirdiğine bakın. Bir sonraki ayın takvimini bu verilere göre düzenleyin.")),
        p(text("Takviminizi birlikte kurmak isterseniz bize yazabilirsiniz.", 2))
      ),
    },
  });

  await payload.create({
    collection: "posts",
    data: {
      title: "Kurumsal web sitesi yaptırmadan önce sorulacak 6 soru",
      excerpt:
        "Yeni bir web sitesine başlamadan önce hedef, içerik, bakım ve ölçüm konularını netleştirmek projeyi hem hızlandırır hem de sonradan çıkan sürprizleri azaltır.",
      category: categoryIds["Web ve Teknoloji"] as number,
      cover: (await cover("web-mockup-dark.webp", "Dizüstü bilgisayar ekranında açık bir kurumsal web sitesi")) as number,
      _status: "published",
      content: doc(
        p(text("Web sitesi projeleri çoğu zaman tasarımla başlar; oysa doğru sorular tasarımdan önce gelir. Aşağıdaki altı soru, ajansınızla aynı dili konuşmanızı sağlar.")),
        h2("1. Sitenin birincil hedefi ne?"),
        p(text("Teklif formu doldurtmak, randevu almak, ürün satmak ya da kurumsal güven oluşturmak. Hedef, sayfa yapısını ve butonların yerini belirler.")),
        h2("2. İçeriği kim hazırlayacak?"),
        p(text("Metinler, fotoğraflar ve referanslar sitenin en çok zaman alan kısmıdır. Kimin hazırlayacağını ve ne zaman teslim edileceğini baştan planlayın.")),
        h2("3. Siteyi kim güncelleyecek?"),
        p(text("Blog yazısı, kampanya ya da yeni ürün eklemek için her seferinde ajansa mı yazacaksınız, yoksa kendi panelinizden mi yöneteceksiniz?")),
        h2("4. Mobil deneyim nasıl olacak?"),
        p(text("Ziyaretçilerin önemli bir kısmı telefondan gelir. Menünün, formların ve hızın mobilde nasıl çalışacağını tasarım aşamasında görün.")),
        h2("5. Hangi ölçümler yapılacak?"),
        p(text("Form gönderimleri, tıklamalar ve ziyaret kaynakları ölçülmezse hangi çalışmanın işe yaradığını bilemezsiniz.")),
        h2("6. Yayından sonra ne olacak?"),
        p(text("Alan adı, sunucu, yedekleme ve güvenlik güncellemeleri kimde? Bakım kapsamını sözleşmede açıkça yazın.")),
        p(text("Projenizi konuşmak isterseniz iletişim sayfasından toplantı planlayabilirsiniz.", 2))
      ),
    },
  });
  log("iki örnek blog yazısı eklendi");
}

/* 5. Hizmetler ve ürünler: koddaki içerik panele aktarılır (yalnız boşsa) */
const uploaded = new Map<string, number>();
/** Aynı dosya bu çalıştırmada bir kez yüklenir; kırpma odağı korunur */
const mediaFor = async (img: { src: string; alt: string; position?: string }) => {
  const hit = uploaded.get(img.src);
  if (hit) return hit;
  const [fx, fy] = (img.position ?? "50% 50%").split(" ").map((v) => parseFloat(v));
  const doc = await payload.create({
    collection: "media",
    data: { alt: img.alt, focalX: fx, focalY: fy },
    filePath: path.join(publicDir, img.src),
  });
  uploaded.set(img.src, doc.id);
  return doc.id;
};
const rows = (list: string[]) => list.map((text) => ({ text }));

if ((await payload.count({ collection: "services" })).totalDocs === 0) {
  for (const [i, s] of services.entries()) {
    const visual = serviceVisuals[s.slug];
    const gallery: { image: number }[] = [];
    for (const g of visual?.gallery ?? ([] as WorkImage[])) gallery.push({ image: await mediaFor(g) });
    await payload.create({
      collection: "services",
      data: {
        title: s.title,
        slug: s.slug,
        order: (i + 1) * 10,
        icon: iconNameOf(s.icon),
        short: s.short,
        headline: s.headline,
        offeringsTitle: s.offeringsTitle,
        intro: rows(s.intro),
        offerings: rows(s.offerings),
        keywords: rows(s.keywords),
        cardImage: visual ? await mediaFor(visual.card) : undefined,
        gallery,
        faq: serviceFaq[s.slug] ?? [],
        showCases: s.slug === "dijital-pazarlama",
        showWebProjects: s.slug === "web-tasarim",
        seoDescription: s.seoDescription,
        _status: "published",
      },
    });
  }
  log(`${services.length} hizmet panele aktarıldı`);
}

if ((await payload.count({ collection: "products" })).totalDocs === 0) {
  for (const [i, pr] of products.entries()) {
    const d = productDetails[pr.slug];
    await payload.create({
      collection: "products",
      data: {
        name: pr.name,
        slug: pr.slug,
        order: (i + 1) * 10,
        icon: iconNameOf(pr.icon),
        tagline: pr.tagline,
        desc: pr.desc,
        highlights: rows(pr.features),
        screenshot: await mediaFor({ src: pr.image, alt: pr.imageAlt }),
        hero: d.hero,
        features: d.features.map((f) => ({ icon: iconNameOf(f.icon), title: f.title, desc: f.desc })),
        steps: d.steps,
        useCases: d.useCases,
        stats: d.stats,
        integrations: rows(d.integrations),
        faq: d.faq,
        seo: { title: d.seo.title, description: d.seo.description, keywords: rows(d.seo.keywords) },
        _status: "published",
      },
    });
  }
  log(`${products.length} ürün panele aktarıldı`);
}

log("tamam");
process.exit(0);
