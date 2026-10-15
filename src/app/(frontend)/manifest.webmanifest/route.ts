import { site } from "@/lib/data";

/* Sitenin web uygulaması bildirimi. Dosya tabanlı app/manifest.ts her yerleşime
   (panel dahil) uygulandığı için burada; panelin kendi bildirimi
   public/panel.webmanifest (panel kök yerleşimi bağlar). */
export const dynamic = "force-static";

export function GET() {
  return Response.json(
    {
      name: site.name,
      short_name: site.shortName,
      description: site.description,
      start_url: "/",
      display: "standalone",
      /* Gündüz varsayılan tema ile aynı zemin: PWA açılış ekranı ile ilk boyama uyuşur */
      background_color: "#ffffff",
      theme_color: "#011441",
      icons: [
        { src: "/icon.png", sizes: "512x512", type: "image/png" },
        { src: "/favicon32.png", sizes: "32x32", type: "image/png" },
      ],
    },
    { headers: { "Content-Type": "application/manifest+json" } }
  );
}
