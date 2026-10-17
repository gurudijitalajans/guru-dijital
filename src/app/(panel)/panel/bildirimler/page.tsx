import type { Metadata } from "next";
import { PageHeader } from "@/panel/ui/page-header";
import { Merkez } from "@/panel/bildirim/Merkez";
import { pageNotifications } from "@/panel/bildirim/actions";

export const metadata: Metadata = { title: "Bildirimler" };
export const dynamic = "force-dynamic";

/** Bildirim merkezi: zildeki listenin tamamı, okundu/okunmadı, silme ve temizleme */
export default async function NotificationsPage() {
  const first = await pageNotifications(1, false);
  return (
    <>
      <PageHeader title="Bildirimler" description="Aynı sohbet, talep ya da görev için tek satır; yeni hareket olunca üste çıkar. Hangi bildirimleri alacağınızı Hesabım'dan seçin." />
      <Merkez initial={first} />
    </>
  );
}
