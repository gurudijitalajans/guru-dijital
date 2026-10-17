import type { CollectionConfig, Field, Payload, PayloadRequest } from "payload";
import { TATILLER, YARIM_GUNLER } from "../lib/tatiller";
import { isTenantAdminReq } from "./business/roles";
import { isAdmin } from "./access";

/**
 * Çalışma takvimi (işletme başına tek kayıt): haftalık açık günler ve saatler,
 * öğle arası, randevu süresi ve kuralları, resmi tatiller, özel kapalı ya da açık
 * günler. Randevu planlayıcısı, sohbet asistanı, sunucu doğrulaması ve iş günü
 * hesapları buradan okur. Kayıt yoksa bugünkü davranışla aynı varsayılanlar kullanılır.
 */
export const GUNLER = [
  { key: "pzt", label: "Pazartesi", dow: 1 },
  { key: "sal", label: "Salı", dow: 2 },
  { key: "car", label: "Çarşamba", dow: 3 },
  { key: "per", label: "Perşembe", dow: 4 },
  { key: "cum", label: "Cuma", dow: 5 },
  { key: "cmt", label: "Cumartesi", dow: 6 },
  { key: "paz", label: "Pazar", dow: 0 },
] as const;

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const saatAlani = (name: string, label: string, def?: string): Field => ({
  name,
  type: "text",
  label,
  defaultValue: def,
  admin: { placeholder: "09:00", width: "25%" },
  validate: (v: string | null | undefined) => !v || HHMM.test(v) || "Saati 09:00 biçiminde yazın.",
});

export const WorkCalendar: CollectionConfig = {
  slug: "work-calendar",
  labels: { singular: "Çalışma takvimi", plural: "Çalışma takvimi" },
  admin: { group: "Ayarlar", description: "Açık günler ve saatler, resmi tatiller, randevu kuralları." },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => isTenantAdminReq(req),
    update: ({ req }) => isTenantAdminReq(req),
    delete: isAdmin,
  },
  fields: [
    {
      name: "hafta",
      type: "group",
      label: "Haftalık program",
      admin: { description: "Kapalı günlerde randevu alınmaz; asistan mesai dışında olduğunu söyler. Öğle arası boş bırakılabilir." },
      fields: GUNLER.map((g) => ({
        name: g.key,
        type: "group" as const,
        label: g.label,
        fields: [
          { name: "acik", type: "checkbox" as const, label: "Açık", defaultValue: g.dow >= 1 && g.dow <= 5 },
          { type: "row" as const, fields: [saatAlani("bas", "Açılış", "10:00"), saatAlani("bit", "Kapanış", "17:00"), saatAlani("araBas", "Öğle arası başı", "12:00"), saatAlani("araBit", "Öğle arası sonu", "13:00")] },
        ],
      })),
    },
    {
      name: "randevu",
      type: "group",
      label: "Randevu kuralları",
      fields: [
        {
          type: "row",
          fields: [
            { name: "sure", type: "select", label: "Görüşme süresi", defaultValue: "60", options: [{ label: "30 dakika", value: "30" }, { label: "45 dakika", value: "45" }, { label: "60 dakika", value: "60" }, { label: "90 dakika", value: "90" }], admin: { width: "25%" } },
            { name: "tampon", type: "number", label: "Arada boşluk (dk)", defaultValue: 0, min: 0, max: 120, admin: { width: "25%" } },
            { name: "enErkenSaat", type: "number", label: "En erken (saat sonra)", defaultValue: 12, min: 0, max: 168, admin: { width: "25%", description: "Ör. 12: şimdiden en az 12 saat sonrası" } },
            { name: "enGecGun", type: "number", label: "En geç (gün ileri)", defaultValue: 14, min: 1, max: 90, admin: { width: "25%" } },
          ],
        },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "resmiTatiller", type: "checkbox", label: "Türkiye resmi tatillerinde kapalı", defaultValue: true },
        { name: "arifeYarim", type: "checkbox", label: "Arife ve 28 Ekim'de 13:00'ten sonra kapalı", defaultValue: true },
      ],
    },
    {
      name: "kapaliGunler",
      type: "array",
      label: "Özel kapalı günler",
      labels: { singular: "Gün", plural: "Günler" },
      admin: { description: "Ofis tatili, etkinlik, köprü günü. Yarım işaretliyse 13:00'ten sonra kapalı." },
      fields: [
        { type: "row", fields: [{ name: "tarih", type: "date", label: "Tarih", required: true, admin: { date: { pickerAppearance: "dayOnly", displayFormat: "d MMMM yyyy" }, width: "40%" } }, { name: "ad", type: "text", label: "Açıklama", admin: { width: "40%" } }, { name: "yarim", type: "checkbox", label: "Yarım gün", admin: { width: "20%" } }] },
      ],
    },
    {
      name: "acikGunler",
      type: "array",
      label: "Tatil olduğu hâlde açık günler",
      labels: { singular: "Gün", plural: "Günler" },
      admin: { description: "Resmi tatil ya da hafta sonu olduğu hâlde çalışacağınız günler." },
      fields: [{ name: "tarih", type: "date", label: "Tarih", required: true, admin: { date: { pickerAppearance: "dayOnly", displayFormat: "d MMMM yyyy" } } }],
    },
  ],
};

/** Kişi izinleri: yıllık izin, rapor, yarım gün. Ekip yükü kapasitesi ve takvim bunları gösterir. */
export const Leaves: CollectionConfig = {
  slug: "leaves",
  labels: { singular: "İzin", plural: "İzinler" },
  admin: { group: "Operasyon", useAsTitle: "not", defaultColumns: ["kisi", "baslangic", "bitis", "tur"] },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => isTenantAdminReq(req),
  },
  fields: [
    { name: "kisi", type: "relationship", relationTo: "users", label: "Kişi", required: true },
    {
      type: "row",
      fields: [
        { name: "baslangic", type: "date", label: "Başlangıç", required: true, admin: { date: { pickerAppearance: "dayOnly", displayFormat: "d MMMM yyyy" } } },
        { name: "bitis", type: "date", label: "Bitiş (dahil)", required: true, admin: { date: { pickerAppearance: "dayOnly", displayFormat: "d MMMM yyyy" } } },
      ],
    },
    { name: "tur", type: "select", label: "Tür", defaultValue: "yillik", options: [{ label: "Yıllık izin", value: "yillik" }, { label: "Rapor", value: "rapor" }, { label: "Yarım gün", value: "yarim" }, { label: "Eğitim / etkinlik", value: "etkinlik" }, { label: "Diğer", value: "diger" }] },
    { name: "not", type: "text", label: "Not" },
  ],
};

/* ---- Çalışma kuralları (sunucu) ---- */
type Gun = { acik: boolean; bas: string; bit: string; araBas?: string; araBit?: string };
export type Kurallar = {
  hafta: Record<number, Gun>;
  sure: number;
  tampon: number;
  enErkenSaat: number;
  enGecGun: number;
  resmi: boolean;
  arife: boolean;
  kapali: Map<string, { ad: string; yarim: boolean }>;
  acik: Set<string>;
};

export const VARSAYILAN: Kurallar = {
  hafta: Object.fromEntries(GUNLER.map((g) => [g.dow, { acik: g.dow >= 1 && g.dow <= 5, bas: "10:00", bit: "17:00", araBas: "12:00", araBit: "13:00" }])),
  sure: 60,
  tampon: 0,
  enErkenSaat: 12,
  enGecGun: 14,
  resmi: true,
  arife: true,
  kapali: new Map(),
  acik: new Set(),
};

const dayStr = (v: unknown) => (typeof v === "string" ? new Date(new Date(v).getTime() + 3 * 3600000).toISOString().slice(0, 10) : "");
const cache = new Map<string, { at: number; k: Kurallar }>();

/** İşletmenin kuralları (60 sn önbellek); kayıt yoksa varsayılanlar */
export async function kurallarOf(payload: Payload, tenant: number | string, req?: PayloadRequest): Promise<Kurallar> {
  const c = cache.get(String(tenant));
  if (c && Date.now() - c.at < 60000) return c.k;
  let k = VARSAYILAN;
  try {
    const r = await payload.find({ collection: "work-calendar", where: { tenant: { equals: tenant } }, limit: 1, depth: 0, req, overrideAccess: true });
    const d = r.docs[0] as unknown as Record<string, unknown> | undefined;
    if (d) {
      const h = (d.hafta ?? {}) as Record<string, Partial<Gun>>;
      const rd = (d.randevu ?? {}) as Record<string, unknown>;
      k = {
        hafta: Object.fromEntries(GUNLER.map((g) => {
          const x = h[g.key] ?? {};
          const def = VARSAYILAN.hafta[g.dow];
          return [g.dow, { acik: x.acik ?? def.acik, bas: x.bas || def.bas, bit: x.bit || def.bit, araBas: x.araBas || undefined, araBit: x.araBit || undefined }];
        })),
        sure: Number(rd.sure ?? 60) || 60,
        tampon: Number(rd.tampon ?? 0) || 0,
        enErkenSaat: Number(rd.enErkenSaat ?? 12),
        enGecGun: Number(rd.enGecGun ?? 14) || 14,
        resmi: d.resmiTatiller !== false,
        arife: d.arifeYarim !== false,
        kapali: new Map(((d.kapaliGunler ?? []) as { tarih?: string; ad?: string | null; yarim?: boolean | null }[]).filter((x) => x.tarih).map((x) => [dayStr(x.tarih), { ad: x.ad || "Kapalı", yarim: Boolean(x.yarim) }])),
        acik: new Set(((d.acikGunler ?? []) as { tarih?: string }[]).map((x) => dayStr(x.tarih)).filter(Boolean)),
      };
    }
  } catch {
    /* tablo henüz yoksa (geçiş öncesi) varsayılan */
  }
  cache.set(String(tenant), { at: Date.now(), k });
  return k;
}

const toMin = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3, 5));
const toHHMM = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const dow = (day: string) => new Date(`${day}T12:00:00Z`).getUTCDay();

/** Gün açık mı; kapalıysa nedeni, yarım günse kapanış saati */
export function gunDurumu(day: string, k: Kurallar): { acik: boolean; neden?: string; kapanis?: string } {
  const ozelAcik = k.acik.has(day);
  const g = k.hafta[dow(day)];
  if (!ozelAcik) {
    const kapali = k.kapali.get(day);
    if (kapali && !kapali.yarim) return { acik: false, neden: kapali.ad };
    if (k.resmi && TATILLER[day]) return { acik: false, neden: TATILLER[day] };
    if (!g?.acik) return { acik: false, neden: dow(day) === 0 || dow(day) === 6 ? "Hafta sonu" : "Kapalı gün" };
    if (kapali?.yarim) return { acik: true, kapanis: "13:00", neden: kapali.ad };
    if (k.arife && YARIM_GUNLER[day]) return { acik: true, kapanis: YARIM_GUNLER[day].from, neden: YARIM_GUNLER[day].name };
  }
  return { acik: true };
}

/** O günün randevu başlangıç saatleri (öğle arası, yarım gün ve süre hesaba katılır) */
export function saatler(day: string, k: Kurallar): string[] {
  const d = gunDurumu(day, k);
  if (!d.acik) return [];
  const g = k.hafta[dow(day)] ?? VARSAYILAN.hafta[1];
  const bas = toMin(g.bas);
  const bit = Math.min(toMin(g.bit), d.kapanis ? toMin(d.kapanis) : 24 * 60);
  const ara = g.araBas && g.araBit ? [toMin(g.araBas), toMin(g.araBit)] : null;
  const out: string[] = [];
  for (let t = bas; t + k.sure <= bit; t += k.sure + k.tampon) {
    if (ara && t < ara[1] && t + k.sure > ara[0]) {
      t = ara[1] - k.sure - k.tampon;
      continue;
    }
    out.push(toHHMM(t));
  }
  return out;
}

/** Randevu verilebilecek günler ve saatler (en erken ve en geç kuralına göre) */
export function plan(k: Kurallar, now = Date.now()): { gun: string; saatler: string[]; not?: string }[] {
  const out: { gun: string; saatler: string[]; not?: string }[] = [];
  const earliest = now + k.enErkenSaat * 3600000;
  for (let i = 0; i <= k.enGecGun; i++) {
    const day = new Date(now + 3 * 3600000 + i * 86400000).toISOString().slice(0, 10);
    const list = saatler(day, k).filter((s) => new Date(`${day}T${s}:00+03:00`).getTime() >= earliest);
    if (list.length) out.push({ gun: day, saatler: list, ...(gunDurumu(day, k).kapanis ? { not: gunDurumu(day, k).neden } : {}) });
  }
  return out;
}

/** Şu an mesai içinde mi (asistan ve "ilk yanıt süresi" için) */
export function mesaide(k: Kurallar, now = Date.now()): boolean {
  const ist = new Date(now + 3 * 3600000);
  const day = ist.toISOString().slice(0, 10);
  const d = gunDurumu(day, k);
  if (!d.acik) return false;
  const g = k.hafta[dow(day)];
  const m = ist.getUTCHours() * 60 + ist.getUTCMinutes();
  return m >= toMin(g.bas) && m < Math.min(toMin(g.bit), d.kapanis ? toMin(d.kapanis) : 1440);
}

/** Bir sonraki açılış (ör. "Pazartesi 10:00") */
export function sonrakiAcilis(k: Kurallar, now = Date.now()): string {
  for (let i = 0; i < 30; i++) {
    const day = new Date(now + 3 * 3600000 + i * 86400000).toISOString().slice(0, 10);
    const d = gunDurumu(day, k);
    if (!d.acik) continue;
    const g = k.hafta[dow(day)];
    const at = new Date(`${day}T${g.bas}:00+03:00`).getTime();
    if (at <= now && i === 0 && mesaide(k, now)) return "şimdi";
    if (at > now) return `${new Intl.DateTimeFormat("tr-TR", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Istanbul" }).format(new Date(at))} ${g.bas}`;
  }
  return "";
}
