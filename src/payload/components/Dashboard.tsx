import { redirect } from "next/navigation";

/**
 * Payload'un ana sayfası (/admin): günlük işler yeni panelde. Girişten sonra
 * ve logoya tıklayınca oraya gidilir; içerik ve ayar ekranları Payload'da
 * kalır, panelin menüsünden açılır. Sitenin eksikleri ve demo işletmesi
 * panelin Ayarlar sayfasında, yeni işletmenin kurulum listesi panelin ana
 * sayfasında.
 */
export function Dashboard(): never {
  redirect("/panel");
}
