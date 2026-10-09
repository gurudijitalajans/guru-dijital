/**
 * İş günü hesapları (İstanbul saati, UTC+3, yaz saati yok). Görev tarihleri
 * gün olarak tutulur: öğlen UTC, böylece Türkiye'de de aynı güne düşer.
 */
const DAY = 86400000;

export const dayOf = (v: string | Date) => new Date(new Date(v).getTime() + 3 * 3600000).toISOString().slice(0, 10);
export const noonUtc = (day: string) => `${day}T12:00:00.000Z`;
const isWeekend = (d: Date) => d.getUTCDay() === 0 || d.getUTCDay() === 6;

/** `day` gününe `n` iş günü ekler (hafta sonu atlanır); n=0 ve gün hafta sonuysa ilk iş günü */
export function addBusinessDays(day: string, n: number): string {
  const d = new Date(noonUtc(day));
  while (isWeekend(d)) d.setUTCDate(d.getUTCDate() + 1);
  let left = n;
  while (left > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    if (!isWeekend(d)) left--;
  }
  return d.toISOString().slice(0, 10);
}

/** İki gün arası (dahil) iş günleri */
export function businessDays(from: string, to: string): string[] {
  const out: string[] = [];
  const end = new Date(noonUtc(to)).getTime();
  for (let t = new Date(noonUtc(from)).getTime(); t <= end; t += DAY) {
    const d = new Date(t);
    if (!isWeekend(d)) out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

/** Verilen günün haftasının pazartesisi */
export function mondayOf(day: string): string {
  const d = new Date(noonUtc(day));
  const back = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - back);
  return d.toISOString().slice(0, 10);
}

export function shiftDays(day: string, n: number): string {
  const d = new Date(noonUtc(day));
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
