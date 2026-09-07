"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, CheckCircle2, Clock, Copy } from "lucide-react";
import { Sparkles } from "@/components/fx/Sparkles";
import { services, site } from "@/lib/data";
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

const inputCls = (hasError: boolean) =>
  cn(
    "w-full rounded-xl border bg-band/70 px-4 text-base text-fg outline-none transition-colors duration-200 placeholder:text-fg/50 md:text-sm",
    hasError
      ? "border-red-400/70 focus:border-red-400/70 focus:ring-2 focus:ring-red-400/15"
      : "border-fg/30 hover:border-fg/45 focus:border-guru focus:ring-2 focus:ring-guru/20"
  );

const labelCls = "block text-[13px] font-medium text-fg/80";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      className="text-[13px] font-medium text-[color:light-dark(#dc2626,#f87171)]"
    >
      {message}
    </p>
  );
}

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
  const [submitted, setSubmitted] = useState(false);
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

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
    setSubmitted(true);
  }

  return (
    <div className="rounded-3xl border border-fg/10 bg-card p-6 shadow-[0_0_50px_rgba(16,216,108,0.07)] md:p-8">
      <AnimatePresence mode="wait" initial={false}>
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="relative flex min-h-96 flex-col items-center justify-center overflow-hidden text-center"
          >
            {/* Kutlama ışıltıları: dekoratif, pointer-events yok; düşük yoğunluk metni örtmesin */}
            <Sparkles density={6} className="opacity-80" />
            <span className="flex size-16 items-center justify-center rounded-full bg-guru/15 text-guru shadow-[0_0_40px_light-dark(rgb(16_216_108/0.14),rgb(16_216_108/0.25))]">
              <CheckCircle2 className="size-8" strokeWidth={2} />
            </span>
            <h3 className="mt-6 text-xl font-bold tracking-tight text-fg md:text-2xl">
              Talebiniz e-posta uygulamanızda açıldı
            </h3>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-fg/60">
              Gönder butonuna basmanız yeterli. E-posta uygulamanız açılmadıysa
              mesajınızı doğrudan{" "}
              <a
                href={`mailto:${site.email}`}
                className="font-semibold text-fg underline decoration-guru decoration-2 underline-offset-2"
              >
                {site.email}
              </a>{" "}
              adresine iletebilirsiniz.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={copyEmail}
                aria-live="polite"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-fg/25 px-6 py-3 text-sm font-semibold text-fg transition-all duration-300 hover:border-guru/70 hover:text-guru active:scale-[0.98]"
              >
                {copied ? (
                  <Check className="size-4 text-guru" strokeWidth={2.4} />
                ) : (
                  <Copy className="size-4" strokeWidth={2.2} />
                )}
                {copied ? "Adres kopyalandı" : "Adresi kopyala"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setValues(initialValues);
                  setErrors({});
                  setSubmitted(false);
                  setCopied(false);
                }}
                className="min-h-11 rounded-full border border-fg/25 px-6 py-3 text-sm font-semibold text-fg transition-all duration-300 hover:border-fg hover:bg-fg hover:text-page active:scale-[0.98]"
              >
                Yeni mesaj yaz
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            noValidate
            onSubmit={onSubmit}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-fg/15 bg-band/60 px-3.5 py-1.5 text-xs font-medium leading-none text-fg/70">
              <Clock className="size-3.5 shrink-0 text-guru" strokeWidth={2.2} />
              Ortalama yanıt: aynı gün
            </div>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="cf-name" className={labelCls}>
                  Ad soyad <span className="text-guru">*</span>
                </label>
                <input
                  id="cf-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Adınız Soyadınız"
                  value={values.name}
                  onChange={(e) => set("name", e.target.value)}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "cf-name-error" : undefined}
                  className={cn(inputCls(Boolean(errors.name)), "h-12")}
                />
                <FieldError id="cf-name-error" message={errors.name} />
              </div>

              <div className="space-y-2">
                <label htmlFor="cf-email" className={labelCls}>
                  E-posta <span className="text-guru">*</span>
                </label>
                <input
                  id="cf-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="ornek@firma.com"
                  value={values.email}
                  onChange={(e) => set("email", e.target.value)}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "cf-email-error" : undefined}
                  className={cn(inputCls(Boolean(errors.email)), "h-12")}
                />
                <FieldError id="cf-email-error" message={errors.email} />
              </div>

              <div className="space-y-2">
                <label htmlFor="cf-phone" className={labelCls}>
                  Telefon <span className="text-fg/45">(opsiyonel)</span>
                </label>
                <input
                  id="cf-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="05xx xxx xx xx"
                  value={values.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  className={cn(inputCls(false), "h-12")}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="cf-service" className={labelCls}>
                  {serviceLabel} <span className="text-guru">*</span>
                </label>
                <select
                  id="cf-service"
                  name="service"
                  value={service}
                  onChange={(e) => set("service", e.target.value)}
                  aria-invalid={Boolean(errors.service)}
                  aria-describedby={errors.service ? "cf-service-error" : undefined}
                  className={cn(
                    inputCls(Boolean(errors.service)),
                    "h-12",
                    !service && "text-fg/50"
                  )}
                >
                  <option value="" disabled>
                    Hizmet seçin
                  </option>
                  {optionList.map((title) => (
                    <option key={title} value={title}>
                      {title}
                    </option>
                  ))}
                  <option value={OTHER_OPTION}>Diğer / Emin değilim</option>
                </select>
                <FieldError id="cf-service-error" message={errors.service} />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="cf-message" className={labelCls}>
                  Mesajınız <span className="text-guru">*</span>
                </label>
                <textarea
                  id="cf-message"
                  name="message"
                  rows={5}
                  placeholder="Projenizden, hedeflerinizden ya da aklınızdaki sorudan kısaca bahsedin…"
                  value={values.message}
                  onChange={(e) => set("message", e.target.value)}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? "cf-message-error" : undefined}
                  className={cn(inputCls(Boolean(errors.message)), "resize-y py-3 leading-relaxed")}
                />
                <FieldError id="cf-message-error" message={errors.message} />
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <button
                type="submit"
                className="group inline-flex h-12 w-full items-center justify-center gap-2.5 whitespace-nowrap rounded-full bg-guru px-6 text-[15px] font-semibold text-ink transition-all duration-300 hover:brightness-110 hover:shadow-[0_0_28px_rgba(16,216,108,0.3)] active:scale-[0.985] sm:w-auto sm:px-8 md:h-14"
              >
                Mesajı Gönder
                <ArrowRight
                  className="size-[18px] shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                  strokeWidth={2.2}
                />
              </button>
              <p className="text-xs leading-relaxed text-fg/50">
                Gönderdiğinizde mesajınız e-posta uygulamanızda hazırlanır.
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
