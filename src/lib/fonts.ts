import localFont from "next/font/local";

/* Outfit: ücretsiz, Türkçe karakter destekli; sabit ağırlık dosyaları yerelden.
   (EDME'nin Nexa'sına en yakın açık lisanslı yazı tipi.) Site layout'u ve
   global 404 sayfası aynı tanımı kullanır. */
export const outfit = localFont({
  variable: "--font-outfit",
  display: "swap",
  src: [
    { path: "../fonts/Outfit-Light.ttf", weight: "300", style: "normal" },
    { path: "../fonts/Outfit-Regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/Outfit-Medium.ttf", weight: "500", style: "normal" },
    { path: "../fonts/Outfit-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../fonts/Outfit-Bold.ttf", weight: "700", style: "normal" },
  ],
});
