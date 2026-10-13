/**
 * Site içeriği türleri. Hizmet, ürün ve blog yazısı canlı önizlemeli içerik
 * ekranında düzenlenir; panelde listesi, durumu ve yayın düğmesi var. Ekip,
 * referans, müşteri yorumu ve vaka tamamen panelde düzenlenir: alanları
 * burada tanımlı, sunucu yalnız bu alanları kabul eder.
 */
export type FieldDef =
  | { name: string; label: string; type: "text"; required?: boolean; max?: number; hint?: string; placeholder?: string }
  | { name: string; label: string; type: "textarea"; required?: boolean; max?: number; hint?: string }
  | { name: string; label: string; type: "number"; hint?: string }
  | { name: string; label: string; type: "checkbox"; hint?: string; defaultValue?: boolean }
  | { name: string; label: string; type: "media"; hint?: string }
  | { name: string; label: string; type: "stats"; hint?: string };

export type SimpleKind = {
  collection: "team" | "references" | "testimonials" | "case-studies" | "categories";
  label: string;
  singular: string;
  titleField: string;
  subField?: string;
  media?: string;
  /** Listede rozetle gösterilen onay kutusu */
  flag?: { field: string; on: string; off: string };
  fields: FieldDef[];
  note?: string;
};

const order: FieldDef = { name: "order", label: "Sıra", type: "number", hint: "Küçük sayı önce gelir." };

export const SIMPLE: Record<"ekip" | "referanslar" | "yorumlar" | "vakalar" | "kategoriler", SimpleKind> = {
  ekip: {
    collection: "team",
    label: "Ekip",
    singular: "Ekip üyesi",
    titleField: "name",
    subField: "role",
    media: "photo",
    flag: { field: "showOnHome", on: "Ana sayfada", off: "Ana sayfada değil" },
    note: "Fotoğraf yüklenmeyen kişi için marka renklerinde yer tutucu görünür.",
    fields: [
      { name: "name", label: "Ad Soyad", type: "text", required: true, max: 120 },
      { name: "role", label: "Unvan", type: "text", required: true, max: 120 },
      { name: "photo", label: "Fotoğraf", type: "media", hint: "Dikey portre önerilir (4:5)." },
      { name: "linkedin", label: "LinkedIn adresi", type: "text", max: 300, placeholder: "https://www.linkedin.com/in/..." },
      order,
      { name: "showOnHome", label: "Ana sayfada göster", type: "checkbox", defaultValue: true },
    ],
  },
  referanslar: {
    collection: "references",
    label: "Referanslar",
    singular: "Referans",
    titleField: "name",
    media: "logo",
    note: "Logolar şeritte gri tonda gösterilir; şeffaf zeminli SVG ya da PNG önerilir. Logosuz marka adıyla yazılır.",
    fields: [
      { name: "name", label: "Marka adı", type: "text", required: true, max: 120 },
      { name: "logo", label: "Logo", type: "media" },
      order,
    ],
  },
  yorumlar: {
    collection: "testimonials",
    label: "Müşteri yorumları",
    singular: "Müşteri yorumu",
    titleField: "name",
    subField: "company",
    media: "photo",
    flag: { field: "consent", on: "Yayın izni var", off: "İzin bekliyor" },
    note: "Yorum metni, kişiden yazılı yayın izni alınıp işaretlenene kadar sitede görünmez.",
    fields: [
      { name: "quote", label: "Yorum", type: "textarea", max: 400 },
      { name: "name", label: "Ad Soyad", type: "text", required: true, max: 120 },
      { name: "title", label: "Unvan", type: "text", max: 120 },
      { name: "company", label: "Firma", type: "text", max: 120 },
      { name: "photo", label: "Fotoğraf ya da logo", type: "media" },
      { name: "consent", label: "Yayın izni alındı", type: "checkbox", hint: "Kişinin adı ve yorumu için yazılı izin alındıysa işaretleyin." },
      order,
    ],
  },
  vakalar: {
    collection: "case-studies",
    label: "Vaka çalışmaları",
    singular: "Vaka çalışması",
    titleField: "title",
    subField: "sector",
    flag: { field: "showOnHome", on: "Ana sayfada", off: "Ana sayfada değil" },
    note: "Yalnız ölçülmüş ve müşterinin paylaşmayı onayladığı sonuçları yazın.",
    fields: [
      { name: "sector", label: "Sektör", type: "text", required: true, max: 120, placeholder: "Sağlık / Klinik" },
      { name: "title", label: "Başlık", type: "text", required: true, max: 160 },
      { name: "summary", label: "Özet", type: "textarea", required: true, max: 1000 },
      { name: "stats", label: "Sonuçlar", type: "stats", hint: "\"Kartta göster\" seçili ilk üç sonuç kartta görünür; hiçbiri seçili değilse ilk üçü." },
      { name: "note", label: "Dipnot", type: "text", max: 200, hint: "Kartın altında küçük yazı: ölçüm süresi, koşul vb." },
      order,
      { name: "showOnHome", label: "Ana sayfada göster", type: "checkbox", defaultValue: true },
    ],
  },
  kategoriler: {
    collection: "categories",
    label: "Blog kategorileri",
    singular: "Blog kategorisi",
    titleField: "title",
    note: "Blog yazıları bu kategorilere göre süzülür. Adres (slug) addan kendiliğinden üretilir.",
    fields: [{ name: "title", label: "Kategori adı", type: "text", required: true, max: 80 }],
  },
};

export type SimpleKey = keyof typeof SIMPLE;

export const PUBLISHABLE = {
  hizmetler: { collection: "services", label: "Hizmetler", singular: "Hizmet", titleField: "title", base: "/hizmetler" },
  urunler: { collection: "products", label: "Ürünler", singular: "Ürün", titleField: "name", base: "/urunler" },
  blog: { collection: "posts", label: "Blog yazıları", singular: "Blog yazısı", titleField: "title", base: "/blog" },
} as const;

export type PublishKey = keyof typeof PUBLISHABLE;
export type Stat = { label: string; value: number; prefix?: string; suffix?: string; featured?: boolean };
