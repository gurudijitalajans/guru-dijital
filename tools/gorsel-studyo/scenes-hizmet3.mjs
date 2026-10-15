// Hizmet görselleri v3: teslim edilen işler (müşteri siteleri, reklamlar, uygulamalar...).
// Bileşenler h3/ altında. Ad öneki: hizmet3-  (hizmet3-raw-*: video için tam ekranlar)
//   node tools/gorsel-studyo/render.mjs hizmet3- && python3 tools/gorsel-studyo/export-hizmet3.py
import { adsScenes } from "./h3/ads.mjs";
import { designScenes } from "./h3/design.mjs";
import { mobileScenes } from "./h3/mobile.mjs";
import { seoScenes } from "./h3/seo.mjs";
import { shopScenes } from "./h3/shop.mjs";
import { socialScenes } from "./h3/social.mjs";
import { softwareScenes } from "./h3/software.mjs";
import { trademarkScenes } from "./h3/trademark.mjs";
import { webScenes } from "./h3/web.mjs";

export const HIZMET3_SCENES = [...adsScenes(), ...webScenes(), ...seoScenes(), ...softwareScenes(), ...mobileScenes(), ...trademarkScenes(), ...shopScenes(), ...designScenes(), ...socialScenes()];

/* Paylaşım görselleri (1200x630): hero çıktısından kesit; hero'dan sonra işlenir */
import { fileUrl, ROOT } from "./lib.mjs";
import { og, T } from "./h3/common.mjs";
const OG = {
  "dijital-reklam-yonetimi": "Her lira *ölçülür*",
  "web-tasarim": "Markanızın *dijital* yüzü",
  seo: "Sizi arayan *sizi bulsun*",
  "ozel-yazilim": "İşinize göre *yazılım*",
  "mobil-uygulama": "Cebinizdeki *markanız*",
  "marka-tescil": "Emeğiniz *adınızla* korunsun",
  "e-ticaret-yonetimi": "Mağazanız *satışa* hazır",
  "grafik-tasarim": "Akılda kalan *bir kimlik*",
  "sosyal-medya-yonetimi": "Markanız *her gün* akışta",
};
for (const [slug, title] of Object.entries(OG))
  HIZMET3_SCENES.push({ name: `hizmet3-${slug}-og`, w: 1200, h: 630, html: og({ t: T[slug], title, heroPng: fileUrl(`${ROOT}/tools/gorsel-studyo/out/hizmet3-${slug}-hero.png`) }) });

/* Blog kapakları v2 (blog2-*) */
import { blogScenes } from "./h3/blog.mjs";
HIZMET3_SCENES.push(...blogScenes());

/* Ödül kartları v2 (odul2-*) */
import { awardScenes } from "./h3/awards.mjs";
HIZMET3_SCENES.push(...awardScenes());
import { aboutScenes } from "./h3/awards.mjs";
HIZMET3_SCENES.push(...aboutScenes());
import { webCoverScenes } from "./h3/awards.mjs";
HIZMET3_SCENES.push(...webCoverScenes());
import { webTileScenes } from "./h3/awards.mjs";
HIZMET3_SCENES.push(...webTileScenes());
import { realScenes } from "./h3/real.mjs";
HIZMET3_SCENES.push(...realScenes());
import { storyScenes } from "./h3/real.mjs";
HIZMET3_SCENES.push(...storyScenes());
import { webScenesReal } from "./h3/real.mjs";
HIZMET3_SCENES.push(...webScenesReal());
import { storyConcepts } from "./h3/real.mjs";
HIZMET3_SCENES.push(...storyConcepts());
import { storyV3 } from "./h3/real.mjs";
HIZMET3_SCENES.push(...storyV3());
import { socialSample } from "./h3/real.mjs";
HIZMET3_SCENES.push(...socialSample());
import { socialScenesReal } from "./h3/real.mjs";
HIZMET3_SCENES.push(...socialScenesReal());
import { grafikScenesReal } from "./h3/grafik.mjs";
HIZMET3_SCENES.push(...grafikScenesReal());
import { reklamScenesReal } from "./h3/reklam.mjs";
HIZMET3_SCENES.push(...reklamScenesReal());
import { yazilimScenesReal } from "./h3/yazilim.mjs";
HIZMET3_SCENES.push(...yazilimScenesReal());
/* v4 paylaşım görselleri: gerçek iş hero'sundan (real-<slug>-hero.png) */
for (const slug of ["web-tasarim", "sosyal-medya-yonetimi", "grafik-tasarim", "dijital-reklam-yonetimi", "ozel-yazilim"])
  HIZMET3_SCENES.push({ name: `real-${slug}-og`, w: 1200, h: 630, html: og({ t: T[slug], title: OG[slug], heroPng: fileUrl(`${ROOT}/tools/gorsel-studyo/out/real-${slug}-hero.png`) }) });
