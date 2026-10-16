/**
 * Türkiye resmi tatilleri (2429 sayılı Kanun). Tam gün tatillerde iş günü
 * sayılmaz ve randevu alınmaz; arifelerde (ve 28 Ekim'de) 13:00'ten sonra
 * kapalıyız. Dini bayram tarihleri Diyanet takviminden; yeni yıl eklenince
 * buraya yazılır. Hafta sonu ve tatil kuralının TEK kaynağı bu dosyadır
 * (iş günü hesabı, randevu planlayıcısı, sohbet asistanı, sunucu doğrulaması).
 */
export const TATILLER: Record<string, string> = {
  "2026-01-01": "Yılbaşı",
  "2026-03-20": "Ramazan Bayramı",
  "2026-03-21": "Ramazan Bayramı",
  "2026-03-22": "Ramazan Bayramı",
  "2026-04-23": "Ulusal Egemenlik ve Çocuk Bayramı",
  "2026-05-01": "Emek ve Dayanışma Günü",
  "2026-05-19": "Atatürk'ü Anma, Gençlik ve Spor Bayramı",
  "2026-05-27": "Kurban Bayramı",
  "2026-05-28": "Kurban Bayramı",
  "2026-05-29": "Kurban Bayramı",
  "2026-05-30": "Kurban Bayramı",
  "2026-07-15": "Demokrasi ve Millî Birlik Günü",
  "2026-08-30": "Zafer Bayramı",
  "2026-10-29": "Cumhuriyet Bayramı",
  "2027-01-01": "Yılbaşı",
  "2027-03-09": "Ramazan Bayramı",
  "2027-03-10": "Ramazan Bayramı",
  "2027-03-11": "Ramazan Bayramı",
  "2027-04-23": "Ulusal Egemenlik ve Çocuk Bayramı",
  "2027-05-01": "Emek ve Dayanışma Günü",
  "2027-05-16": "Kurban Bayramı",
  "2027-05-17": "Kurban Bayramı",
  "2027-05-18": "Kurban Bayramı",
  "2027-05-19": "Kurban Bayramı",
  "2027-07-15": "Demokrasi ve Millî Birlik Günü",
  "2027-08-30": "Zafer Bayramı",
  "2027-10-29": "Cumhuriyet Bayramı",
};

/** Yarım günler: bu saatten sonra kapalı */
export const YARIM_GUNLER: Record<string, { from: string; name: string }> = {
  "2026-03-19": { from: "13:00", name: "Ramazan Bayramı arifesi" },
  "2026-05-26": { from: "13:00", name: "Kurban Bayramı arifesi" },
  "2026-10-28": { from: "13:00", name: "Cumhuriyet Bayramı arifesi" },
  "2027-03-08": { from: "13:00", name: "Ramazan Bayramı arifesi" },
  "2027-05-15": { from: "13:00", name: "Kurban Bayramı arifesi" },
  "2027-10-28": { from: "13:00", name: "Cumhuriyet Bayramı arifesi" },
};

/** "YYYY-MM-DD" hafta sonu mu (gün UTC öğlen olarak yorumlanır) */
export const isWeekendDay = (day: string) => {
  const d = new Date(`${day}T12:00:00Z`).getUTCDay();
  return d === 0 || d === 6;
};

/** Tam gün kapalı mı: hafta sonu ya da resmi tatil */
export const isClosedDay = (day: string) => isWeekendDay(day) || day in TATILLER;

/** O gün o saatte randevu alınabilir mi (yarım günlerde öğleden sonra kapalı) */
export const isOpenSlot = (day: string, time: string) => !isClosedDay(day) && !(YARIM_GUNLER[day] && time >= YARIM_GUNLER[day].from);

/** Kapalı günün adı (takvim ve asistan için); açık günde null */
export const closedReason = (day: string): string | null => (isWeekendDay(day) ? "Hafta sonu" : (TATILLER[day] ?? null));
