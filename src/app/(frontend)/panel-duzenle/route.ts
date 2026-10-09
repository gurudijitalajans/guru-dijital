import { redirect } from "next/navigation";
import { cms } from "@/lib/cms";

/**
 * Sitedeki "Bu sayfayı düzenle" bağlantısı buraya gelir: sayfanın yolundan
 * paneldeki karşılığını bulup oraya yönlendirir. Giriş yoksa panel giriş
 * sayfasını açar (panelin kendi kuralı).
 */
const STATIC: Record<string, string> = {
  "/": "/admin/globals/home-page",
  "/hakkimizda": "/admin/globals/about-page",
  "/hizmetler": "/admin/collections/services",
  "/urunler": "/admin/collections/products",
  "/blog": "/admin/collections/posts",
  "/referanslar": "/admin/collections/references",
  "/iletisim": "/admin/globals/site-settings",
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
    redirect(doc ? `/admin/collections/${collection}/${doc.id}` : `/admin/collections/${collection}`);
  }
  redirect("/admin");
}
