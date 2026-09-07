import type { MetadataRoute } from "next";
import { site } from "@/lib/data";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.shortName,
    description: site.description,
    start_url: "/",
    display: "standalone",
    /* Gündüz varsayılan tema ile aynı zemin: PWA açılış ekranı ile ilk boyama uyuşur */
    background_color: "#f6f7f6",
    theme_color: "#f6f7f6",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/favicon32.png", sizes: "32x32", type: "image/png" },
    ],
  };
}
