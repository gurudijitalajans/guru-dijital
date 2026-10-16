// Sitedeki çift ton ikonların şekil verisi: src/lib/icons.ts'teki panel ikonları + EK listesi
// lucide paketinden okunur, dolgu alacak biçimler (kapalı yollar + DOLGU listesi) işaretlenir.
//   node tools/gorsel-studyo/ikon/glifler.mjs   → src/lib/glyphs.ts
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../../..", import.meta.url)).replace(/\/$/, "");
/* Panel listesi dışında doğrudan kullanılanlar: ad → lucide dosyası */
const EK = {
  "calendar-clock": "calendar-clock",
  headset: "headset",
  "layout-grid": "layout-grid",
  "map-pin": "map-pin",
  phone: "phone",
  "user-check": "user-check",
};

/* Panel ikonunun yerine dolgu alabilen kardeş şekli (çizgiden ibaret olanlar) */
const YERINE = { "chart-bar": "chart-column-big", kanban: "square-kanban", "chart-line": "chart-area" };
/* Ucu başına dönen ya da kapanınca anlamlı biçim veren açık yollar da dolgu alır: ad → d başlangıçları */
const DOLGU = {
  bell: ["M3.262 15.326"],
  code: ["m16 18 6-6-6-6", "m8 6-6 6 6 6"],
  gauge: ["M3.34 19a10"],
  handshake: ["m21 3 1 11h-2", "M3 3 2 14l6.5"],
  languages: ["m22 22-5-10-5 10"],
  lightbulb: ["M15 14c"],
  link: ["M9 17H7A5", "M15 7h2a5"],
  phone: ["M13.832 16.568"],
  trending: ["M16 7h6v6"],
  users: ["M16 21v-2a4"],
  "user-check": ["M16 21v-2a4"],
};

function node(file) {
  const src = readFileSync(`${ROOT}/node_modules/lucide-react/dist/esm/icons/${file}.mjs`, "utf8");
  const alias = src.match(/export \{ default \} from '\.\/([\w-]+)\.mjs'/);
  if (alias) return node(alias[1]);
  return Function(`return ${src.match(/const __iconNode = (\[[\s\S]*?\]);\nconst /)[1]}`)();
}
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/([a-zA-Z])(\d)/g, "$1-$2").toLowerCase();

/* icons.ts: panel adı → lucide bileşeni (ör. share: Share2 → share-2) */
const reg = readFileSync(`${ROOT}/src/lib/icons.ts`, "utf8").match(/const ICONS[^{]*\{([\s\S]*?)\n\};/)[1];
const map = Object.fromEntries([...reg.matchAll(/^\s*"?([\w-]+)"?:\s*(\w+),/gm)].map(([, k, c]) => [k, kebab(c)]));
Object.assign(map, EK, YERINE);

const closed = (tag, a) => ["rect", "circle", "ellipse", "polygon"].includes(tag) || (tag === "path" && /z\s*$/i.test(a.d));
const out = Object.entries(map).map(([name, file]) => {
  const parts = node(file).map(([tag, a]) => {
    const { key, ...rest } = a;
    const fill = closed(tag, a) || (tag === "path" && (DOLGU[name] ?? []).some((d) => a.d.startsWith(d)));
    return `[${JSON.stringify(tag)}, ${JSON.stringify(rest)}, ${fill ? 1 : 0}]`;
  });
  return `  ${JSON.stringify(name)}: [${parts.join(", ")}],`;
});

writeFileSync(
  `${ROOT}/src/lib/glyphs.ts`,
  `/* Üretildi: node tools/gorsel-studyo/ikon/glifler.mjs (elle düzenlenmez). Kaynak: lucide (ISC). */
/* Her öğe: [etiket, öznitelikler, çift ton dolgusu alır mı (kapalı biçim ya da DOLGU listesi)] */
export type GlyphPart = [string, Record<string, string | number>, 0 | 1];

export const GLYPHS = {
${out.join("\n")}
} satisfies Record<string, GlyphPart[]>;

export type GlyphName = keyof typeof GLYPHS;
`
);
console.log(`${Object.keys(map).length} ikon yazıldı`);
