import { redirect } from "next/navigation";
import { cms } from "@/lib/cms";

/**
 * Sitedeki "Bu sayfayı düzenle" bağlantısı buraya gelir: sayfanın yolundan
 * paneldeki karşılığını bulup oraya yönlendirir. Giriş yoksa panel giriş
 * sayfasını açar (panelin kendi kuralı).
 */
const STATIC: Record<string, string> = {
  "/": "/panel/duzenle/home-page",
  "/hakkimizda": "/panel/duzenle/about-page",
  "/hizmetler": "/panel/icerik?tur=hizmetler",
  "/urunler": "/panel/icerik?tur=urunler",
  "/blog": "/panel/icerik?tur=blog",
  "/referanslar": "/panel/icerik?tur=referanslar",
  "/iletisim": "/panel/duzenle/site-settings",
};
const DETAIL: Record<string, "services" | "products" | "posts"> = { hizmetler: "services", urunler: "products", blog: "posts" };

export async function GET(req: Request) {
  const path = (new URL(req.url).searchParams.get("yol") ?? "/").replace(/\/+$/, "") || "/";
  if (STATIC[path]) redirect(STATIC[path]);
  const [, section, slug] = path.split("/");
  const collection = DETAIL[section];
  if (collection && slug) {
    const payload = await cms();
    const res = await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, depth: 0, draft: true });
    const doc = res.docs[0];
    redirect(doc ? `/panel/duzenle/${collection}/${doc.id}` : `/panel/icerik?tur=${section}`);
  }
  redirect("/panel");
}
