/**
 * Yerel veritabanını ilk kullanım için hazırlar: npm run seed
 *
 * - Hiç kullanıcı yoksa .env.local'deki SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD
 *   ile bir yönetici hesabı açar (yalnız yerel test içindir).
 * - Site Ayarları'nı data.ts varsayılanlarıyla doldurur.
 * - Üç blog kategorisi ve iki ÖRNEK yazı ekler (yalnız boşsa).
 *
 * Tekrar çalıştırmak güvenlidir; var olan kayıtlara dokunmaz.
 */
import path from "path";
import { fileURLToPath } from "url";
import { getPayload } from "payload";
import config from "@payload-config";
import { announcement, site } from "@/lib/data";
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

/* 2. Site ayarları */
await payload.updateGlobal({
  slug: "site-settings",
  data: {
    announcement: { enabled: true, text: announcement },
    contact: { email: site.email, instagram: site.instagram },
  },
});
log("site ayarları yazıldı");

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

log("tamam");
process.exit(0);
