"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, Clock, Copy } from "lucide-react";
import { Btn } from "@/components/site/Btn";
import { cardCls } from "@/components/site/styles";
import { services, site } from "@/lib/data";
import { postForm } from "@/lib/submit";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTHER_OPTION = "Diğer";

type Values = {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
};

type Errors = Partial<Record<keyof Values, string>>;

const initialValues: Values = {
  name: "",
  email: "",
  phone: "",
  service: "",
  message: "",
};

/* Hata varsa ilk hatalı alana kaydırılır ve odaklanır (sabit header altında kalmasın). */
const FIELD_ORDER = ["name", "email", "service", "message"] as const;

function validate(values: Values): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = "Lütfen adınızı ve soyadınızı yazın.";
  if (!values.email.trim()) errors.email = "Lütfen e-posta adresinizi yazın.";
  else if (!EMAIL_RE.test(values.email.trim()))
    errors.email = "Geçerli bir e-posta adresi girin.";
  if (!values.service) errors.service = "Lütfen bir hizmet seçin.";
  if (!values.message.trim()) errors.message = "Lütfen mesajınızı yazın.";
  return errors;
}

/* HYDRATION GÜVENLİĞİ: /iletisim?hizmet=<slug> ön seçimi yalnız istemci
   snapshot'ında okunur; sunucu snapshot'ı "" olduğundan SSR ile ilk istemci
   render birebir aynıdır, gerçek değer hydration sonrası tek re-render ile gelir.
   useSyncExternalStore sayesinde effect içinde setState gerekmez ve sayfa
   statik kalır (searchParams okumak sayfayı dinamik render'a çevirirdi). */
const subscribeUrl = (onChange: () => void) => {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
};
const getUrlService = () =>
  new URLSearchParams(window.location.search).get("hizmet") ?? "";
const getServerUrlService = () => "";

function useUrlService(): string {
  const raw = useSyncExternalStore(subscribeUrl, getUrlService, getServerUrlService);
  if (!raw) return "";
  return services.find((s) => s.slug === raw || s.title === raw)?.title ?? "";
}

/* ---- Ortak form görünümü (MeetingScheduler da kullanır) ----
   Beyaz zemin, ince halka, odakta mavi halka, 12px köşe. Mobilde yazı 16px
   (iOS odakta yakınlaştırmasın), md+ 15px. */
export const fieldCls = (hasError: boolean) =>
  cn(
    "w-full rounded-xl bg-white px-4 text-base text-heading outline-none transition-shadow duration-200 placeholder:text-muted/80 md:text-[15px]",
    hasError
      ? "shadow-[0_0_0_1px_rgb(200_30_30/0.6)] focus:shadow-[0_0_0_1px_rgb(200_30_30/0.8),0_0_0_4px_rgb(200_30_30/0.12)]"
      : "shadow-[0_0_0_1px_rgb(1_20_65/0.14)] hover:shadow-[0_0_0_1px_rgb(1_20_65/0.26)] focus:shadow-[0_0_0_1px_#2a6aca,0_0_0_4px_rgb(42_106_202/0.16)]"
  );

export const labelCls = "block text-[13.5px] font-medium text-heading";

/** Zorunlu alan işareti (ekran okuyucuya aria-required ile bildirilir) */
export function Req() {
  return (
    <span aria-hidden className="text-brand">
      *
    </span>
  );
}

/** İsteğe bağlı alan notu */
export function Opt() {
  return <span className="font-normal text-muted">(isteğe bağlı)</span>;
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-[13px] font-medium text-[#c81e1e]">
      {message}
    </p>
  );
}

/**
 * Bal küpü alanı: ekranda ve ekran okuyucuda görünmez; yalnız formu körlemesine
 * dolduran botlar doldurur, sunucu bu gönderimleri sessizce atar.
 */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden className="pointer-events-none absolute -left-[10000px] top-0 size-px overflow-hidden">
      <label>
        Web siteniz
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-[16px]"
        />
      </label>
    </div>
  );
}

/** Gönderim sırasında ya da sunucu hatasında formun altındaki uyarı */
export function FormNotice({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-5 rounded-xl bg-[#fdecec] px-4 py-3 text-[14px] font-medium text-[#a51b1b]">
      {message}
    </p>
  );
}

/** Form kartı: beyaz, ince halka, hafif derinlik */
export const formCardCls = cn(
  cardCls,
  "p-6 shadow-[0_0_0_1px_rgb(1_20_65/0.08),0_30px_60px_-40px_rgb(1_20_65/0.4)] md:p-8"
);

export type ContactFormProps = {
  /** Ürün sayfalarında konu ön seçimi (örn. "Guru CRM"); listede yoksa seçenek olarak eklenir. */
  defaultService?: string;
  /** E-posta konu ön eki; varsayılan "Web Sitesi İletişim Formu". */
  subjectPrefix?: string;
  /** Konu alanı etiketi; ürün sayfalarında "İlgilendiğiniz ürün". */
  serviceLabel?: string;
  /** Verilirse hizmet listesi yerine bu seçenekler (+ "Diğer") listelenir. */
  serviceOptions?: string[];
  /**
   * Listedeki bir başlığı ön seçer (örn. "Web Tasarım"). Verilmezse
   * /iletisim?hizmet=<slug> URL parametresi aynı işi otomatik yapar.
   */
  initialService?: string;
};

export function ContactForm({
  defaultService,
  subjectPrefix = "Web Sitesi İletişim Formu",
  serviceLabel = "İlgilendiğiniz hizmet",
  serviceOptions,
  initialService,
}: ContactFormProps = {}) {
  const options = serviceOptions ?? services.map((s) => s.title);
  const optionList =
    defaultService && !options.includes(defaultService)
      ? [defaultService, ...options]
      : options;
  const urlService = useUrlService();
  const isOption = (v?: string): v is string =>
    Boolean(v) && (optionList.includes(v as string) || v === OTHER_OPTION);
  /* Ön seçim önceliği: açık prop > ürün bağlamı > URL parametresi.
     Kullanıcı seçim yapınca values.service her zaman kazanır; "Yeni mesaj yaz"
     sonrasında ön seçim yeniden devreye girer. */
  const presetService =
    [initialService, defaultService, urlService].find(isOption) ?? "";

  const [values, setValues] = useState<Values>(initialValues);
  const [errors, setErrors] = useState<Errors>({});
  /* "saved": panele kaydedildi; "mail": panel yoksa e-posta uygulamasıyla gönderim */
  const [submitted, setSubmitted] = useState<false | "saved" | "mail">(false);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<string>();
  const [trap, setTrap] = useState("");
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number | null>(null);

  const service = values.service || presetService;

  useEffect(() => {
    // Yalnız unmount temizliği: bekleyen "kopyalandı" zamanlayıcısını iptal et.
    return () => {
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    };
  }, []);

  function copyEmail() {
    // Yalnız tıklama anında çalışır (hydration güvenli); pano yoksa sessiz geç,
    // adres zaten görünür ve mailto olarak tıklanabilir.
    if (!navigator.clipboard) return;
    navigator.clipboard
      .writeText(site.email)
      .then(() => {
        setCopied(true);
        if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
        copyTimer.current = window.setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }

  function set<K extends keyof Values>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    setNotice(undefined);
    const effective: Values = { ...values, service };
    const nextErrors = validate(effective);
    const firstKey = FIELD_ORDER.find((k) => nextErrors[k]);
    if (firstKey) {
      setErrors(nextErrors);
      const target = document.getElementById(`cf-${firstKey}`);
      target?.scrollIntoView({ block: "center" });
      if (target instanceof HTMLElement) target.focus({ preventScroll: true });
      return;
    }
    const subject = `${subjectPrefix} | ${service}`;

    /* Önce panele kaydet; panel ulaşılamazsa e-posta uygulamasına düş */
    setSending(true);
    const result = await postForm("/api/leads/gonder", {
      name: effective.name,
      email: effective.email,
      phone: effective.phone,
      service,
      subject,
      message: effective.message,
      source: window.location.pathname,
      website: trap,
    });
    setSending(false);
    if (result.kind === "saved") {
      setSubmitted("saved");
      return;
    }
    if (result.kind === "error") {
      setNotice(result.message);
      return;
    }

    const body = [
      `Ad Soyad: ${effective.name.trim()}`,
      `E-posta: ${effective.email.trim()}`,
      effective.phone.trim() ? `Telefon: ${effective.phone.trim()}` : null,
      `İlgilenilen Hizmet: ${service}`,
      "",
      effective.message.trim(),
    ]
      .filter(Boolean)
      .join("\n");
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    setSubmitted("mail");
  }

  return (
    <div className={formCardCls}>
      <AnimatePresence mode="wait" initial={false}>
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="flex min-h-96 flex-col items-center justify-center text-center"
          >
            <span className="grid size-16 place-items-center rounded-full bg-chip text-brand">
              <Check className="size-7" strokeWidth={2.2} aria-hidden />
            </span>
            <h3 className="mt-6 text-balance text-[22px] font-medium leading-snug tracking-[-0.02em] text-heading md:text-[24px]">
              {submitted === "saved" ? "Mesajınız Bize Ulaştı" : "Talebiniz E-posta Uygulamanızda Açıldı"}
            </h3>
            {submitted === "saved" ? (
              <p className="mt-3 max-w-sm text-[14.5px] leading-relaxed text-muted">
                Teşekkürler {values.name.trim().split(" ")[0]}. Ekibimiz aynı gün içinde{" "}
                <span className="break-words font-medium text-heading">{values.email.trim()}</span> adresinden size
                dönüş yapacak.
              </p>
            ) : (
            <p className="mt-3 max-w-sm text-[14.5px] leading-relaxed text-muted">
              Gönder butonuna basmanız yeterli. E-posta uygulamanız açılmadıysa
              mesajınızı doğrudan{" "}
              <a
                href={`mailto:${site.email}`}
                className="break-words font-medium text-heading underline decoration-brand decoration-2 underline-offset-4 hover:text-brand"
              >
                {site.email}
              </a>{" "}
              adresine iletebilirsiniz.
            </p>
            )}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              {submitted === "mail" && (
              <Btn variant="light" onClick={copyEmail} aria-live="polite">
                <span className="flex items-center gap-2">
                  {copied ? (
                    <Check className="size-4 text-brand" strokeWidth={2.4} aria-hidden />
                  ) : (
                    <Copy className="size-4" strokeWidth={2} aria-hidden />
                  )}
                  {copied ? "Adres Kopyalandı" : "Adresi Kopyala"}
                </span>
              </Btn>
              )}
              <Btn
                variant="primary"
                onClick={() => {
                  setValues(initialValues);
                  setErrors({});
                  setSubmitted(false);
                  setCopied(false);
                  setNotice(undefined);
                }}
              >
                Yeni Mesaj Yaz
              </Btn>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            noValidate
            onSubmit={onSubmit}
            aria-busy={sending}
            className="relative"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <p className="inline-flex items-center gap-2 rounded-full bg-chip px-3.5 py-1.5 text-[13px] font-medium leading-none text-heading">
              <Clock className="size-3.5 shrink-0 text-brand" strokeWidth={2.2} aria-hidden />
              Ortalama yanıt: aynı gün
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="cf-name" className={labelCls}>
                  Ad soyad <Req />
                </label>
                <input
                  id="cf-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Adınız Soyadınız"
                  value={values.name}
                  onChange={(e) => set("name", e.target.value)}
                  aria-required
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "cf-name-error" : undefined}
                  className={cn(fieldCls(Boolean(errors.name)), "h-12")}
                />
                <FieldError id="cf-name-error" message={errors.name} />
              </div>

              <div className="space-y-2">
                <label htmlFor="cf-email" className={labelCls}>
                  E-posta <Req />
                </label>
                <input
                  id="cf-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="ornek@firma.com"
                  value={values.email}
                  onChange={(e) => set("email", e.target.value)}
                  aria-required
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "cf-email-error" : undefined}
                  className={cn(fieldCls(Boolean(errors.email)), "h-12")}
                />
                <FieldError id="cf-email-error" message={errors.email} />
              </div>

              <div className="space-y-2">
                <label htmlFor="cf-phone" className={labelCls}>
                  Telefon <Opt />
                </label>
                <input
                  id="cf-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="05xx xxx xx xx"
                  value={values.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  className={cn(fieldCls(false), "h-12")}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="cf-service" className={labelCls}>
                  {serviceLabel} <Req />
                </label>
                <div className="relative">
                  <select
                    id="cf-service"
                    name="service"
                    value={service}
                    onChange={(e) => set("service", e.target.value)}
                    aria-required
                    aria-invalid={Boolean(errors.service)}
                    aria-describedby={errors.service ? "cf-service-error" : undefined}
                    className={cn(
                      fieldCls(Boolean(errors.service)),
                      "h-12 cursor-pointer appearance-none pr-11",
                      !service && "text-muted"
                    )}
                  >
                    <option value="" disabled>
                      Seçin
                    </option>
                    {optionList.map((title) => (
                      <option key={title} value={title}>
                        {title}
                      </option>
                    ))}
                    <option value={OTHER_OPTION}>Diğer / Emin değilim</option>
                  </select>
                  <ChevronDown
                    aria-hidden
                    className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted"
                    strokeWidth={2}
                  />
                </div>
                <FieldError id="cf-service-error" message={errors.service} />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="cf-message" className={labelCls}>
                  Mesajınız <Req />
                </label>
                <textarea
                  id="cf-message"
                  name="message"
                  rows={5}
                  placeholder="Projenizden, hedeflerinizden ya da aklınızdaki sorudan kısaca bahsedin."
                  value={values.message}
                  onChange={(e) => set("message", e.target.value)}
                  aria-required
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? "cf-message-error" : undefined}
                  className={cn(fieldCls(Boolean(errors.message)), "block min-h-32 resize-y py-3 leading-relaxed")}
                />
                <FieldError id="cf-message-error" message={errors.message} />
              </div>
            </div>

            <Honeypot value={trap} onChange={setTrap} />
            <FormNotice message={notice} />

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
              <Btn
                type="submit"
                variant="primary"
                size="lg"
                arrow={!sending}
                disabled={sending}
                className="w-full shrink-0 disabled:cursor-wait disabled:opacity-70 sm:w-auto"
              >
                {sending ? "Gönderiliyor" : "Mesajı Gönder"}
              </Btn>
              <p className="text-[13px] leading-relaxed text-muted">
                Mesajınız doğrudan ekibimize iletilir; aynı gün dönüş yaparız.
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
