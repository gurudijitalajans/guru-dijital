import { ATIF_KEYS, type Atif } from "./kanal";

/**
 * Tarayıcı tarafı oturum: sekme açıkken bellekte tutulan rastgele kimlik ve
 * girişteki kaynak bilgisi (UTM, reklam kimliği, yönlendiren site). Çerez ya da
 * yerel depolama KULLANILMAZ; sekme kapanınca ya da sayfa yenilenince yeni oturum
 * başlar. Formlar gönderilirken aynı bilgi talep kaydına eklenir (kaynağa göre talep).
 */
type State = { sid: string; atif: Atif };
/* Durum pencerede tutulur: sayaç ve formlar farklı paket parçalarında olsa da aynı oturumu görür */
type Win = Window & { __guruOturum?: State };

const rid = () => {
  const a = new Uint8Array(12);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 20);
};

export function oturum(): State {
  const w = window as Win;
  if (w.__guruOturum) return w.__guruOturum;
  const atif: Atif = {};
  try {
    const q = new URLSearchParams(window.location.search);
    for (const k of ATIF_KEYS) {
      const v = q.get(k);
      if (v) (atif as Record<string, string>)[k] = v.slice(0, 150);
    }
    const ref = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "") : "";
    if (ref && ref !== window.location.hostname.replace(/^www\./, "")) atif.ref = ref;
    atif.giris = window.location.pathname.slice(0, 300);
  } catch {
    /* adres okunamadı */
  }
  w.__guruOturum = { sid: rid(), atif };
  return w.__guruOturum;
}

/** Form gönderimine eklenen kaynak özeti */
export function atifOzeti(): Atif & { sid: string } {
  const s = oturum();
  return { ...s.atif, sid: s.sid };
}
