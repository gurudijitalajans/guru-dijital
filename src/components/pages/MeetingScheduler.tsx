"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
} from "lucide-react";
import { Sparkles } from "@/components/fx/Sparkles";
import { Spotlight } from "@/components/fx/Spotlight";
import { site } from "@/lib/data";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Öğle arası hariç sabit saat dilimleri. */
const TIME_SLOTS = ["10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

type Day = {
  key: string;
  /** Kısa gün adı, ör. "Cum" */
  weekday: string;
  /** GG.AA, ör. "22.08" */
  short: string;
  /** GG.AA.YYYY, ör. "22.08.2026" */
  full: string;
};

/* Yarından itibaren önümüzdeki 10 iş günü (hafta sonları atlanır). */
function buildBusinessDays(): Day[] {
  const wd = new Intl.DateTimeFormat("tr-TR", { weekday: "short" });
  const dm = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit" });
  const dmy = new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const days: Day[] = [];
  const cursor = new Date();
  while (days.length < 10) {
    cursor.setDate(cursor.getDate() + 1);
    const dow = cursor.getDay();
    if (dow === 0 || dow === 6) continue;
    days.push({
      key: `${cursor.getFullYear()}-${cursor.getMonth() + 1}-${cursor.getDate()}`,
      weekday: wd.format(cursor),
      short: dm.format(cursor),
      full: dmy.format(cursor),
    });
  }
  return days;
}

/* HYDRATION GÜVENLİĞİ: Date yalnız istemci snapshot'ında üretilir.
   Sunucu (ve hydration render'ı) null döner → SSR ile ilk istemci render
   birebir aynı iskeleti çizer; React hydration sonrası gerçek listeye geçer.
   useSyncExternalStore deseni sayesinde effect içinde setState gerekmez. */
const subscribe = () => () => {};
let dayCache: Day[] | null = null;
const getClientDays = (): Day[] | null => {
  if (!dayCache) dayCache = buildBusinessDays();
  return dayCache;
};
const getServerDays = (): Day[] | null => null;

function useBusinessDays(): Day[] | null {
  return useSyncExternalStore(subscribe, getClientDays, getServerDays);
}

type SchedulerErrors = {
  day?: string;
  time?: string;
  name?: string;
  email?: string;
};

/* Hata varsa ilk hatalı adıma kaydırılır; giriş alanıysa odaklanır. */
const FIELD_ORDER = ["day", "time", "name", "email"] as const;

const inputCls = (hasError: boolean) =>
  cn(
    "w-full rounded-xl border bg-band/70 px-4 text-base text-fg outline-none transition-colors duration-200 placeholder:text-fg/50 md:text-sm",
    hasError
      ? "border-red-400/70 focus:border-red-400/70 focus:ring-2 focus:ring-red-400/15"
      : "border-fg/30 hover:border-fg/45 focus:border-guru focus:ring-2 focus:ring-guru/20"
  );

const labelCls = "block text-[13px] font-medium text-fg/80";

const chipCls = (selected: boolean) =>
  cn(
    "flex min-h-11 items-center justify-center rounded-xl border transition-colors duration-200",
    selected
      ? "border-guru bg-guru text-ink"
      : "border-fg/30 bg-band/70 text-fg/70 hover:border-fg/45 hover:text-fg"
  );

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

type MeetingRequest = { subject: string; body: string };

function buildRequest(
  day: Day,
  time: string,
  name: string,
  email: string,
  note: string,
  topic?: string
): MeetingRequest {
  const subject = topic
    ? `Toplantı Talebi | ${topic} | ${day.full} ${time}`
    : `Toplantı Talebi | ${day.full} ${time}`;
  const bodyLines = [
    `Ad Soyad: ${name.trim()}`,
    `E-posta: ${email.trim()}`,
    `Tarih ve Saat: ${day.full} ${time}`,
  ];
  if (topic) bodyLines.push(`Konu: ${topic}`);
  if (note.trim()) bodyLines.push("", `Not: ${note.trim()}`);
  return { subject, body: bodyLines.join("\n") };
}

const mailtoHref = ({ subject, body }: MeetingRequest) =>
  `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

export type MeetingSchedulerProps = {
  /** Görüşme konusu (örn. "Guru CRM Demo"); e-posta konusuna ve gövdesine eklenir. */
  topic?: string;
};

export function MeetingScheduler({ topic }: MeetingSchedulerProps = {}) {
  const days = useBusinessDays();
  const [dayKey, setDayKey] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<SchedulerErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number | null>(null);

  const selectedDay = days?.find((d) => d.key === dayKey) ?? null;
  const request =
    selectedDay && time
      ? buildRequest(selectedDay, time, name, email, note, topic)
      : null;

  useEffect(() => {
    // Yalnız unmount temizliği: bekleyen "kopyalandı" zamanlayıcısını iptal et.
    return () => {
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    };
  }, []);

  function clearError(key: keyof SchedulerErrors) {
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  }

  function copyRequest() {
    // Yalnız tıklama anında çalışır (hydration güvenli); pano yoksa sessiz geç,
    // adres zaten görünür ve mailto olarak tıklanabilir.
    if (!request || !navigator.clipboard) return;
    const text = [`Alıcı: ${site.email}`, `Konu: ${request.subject}`, "", request.body].join("\n");
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
        copyTimer.current = window.setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nextErrors: SchedulerErrors = {};
    if (!selectedDay) nextErrors.day = "Lütfen bir gün seçin.";
    if (!time) nextErrors.time = "Lütfen bir saat seçin.";
    if (!name.trim()) nextErrors.name = "Lütfen adınızı ve soyadınızı yazın.";
    if (!email.trim()) nextErrors.email = "Lütfen e-posta adresinizi yazın.";
    else if (!EMAIL_RE.test(email.trim()))
      nextErrors.email = "Geçerli bir e-posta adresi girin.";
    const firstKey = FIELD_ORDER.find((k) => nextErrors[k]);
    if (!selectedDay || !time || firstKey) {
      setErrors(nextErrors);
      const targetId =
        firstKey === "day" || firstKey === "time"
          ? `ms-${firstKey}-label`
          : `ms-${firstKey}`;
      const target = document.getElementById(targetId);
      target?.scrollIntoView({ block: "center" });
      if (target instanceof HTMLInputElement) target.focus({ preventScroll: true });
      return;
    }
    window.location.assign(
      mailtoHref(buildRequest(selectedDay, time, name, email, note, topic))
    );
    setSubmitted(true);
  }

  return (
    <Spotlight className="mx-auto max-w-3xl overflow-hidden rounded-3xl" size={520} opacity={0.07}>
      <div className="rounded-3xl border border-fg/10 bg-card p-6 shadow-[0_0_50px_rgba(16,216,108,0.07)] md:p-8">
        {days === null ? (
          /* SSR + hydration iskeleti: tarih üretimi istemciye kalır. */
          <div
            className="flex min-h-72 flex-col items-center justify-center gap-4 text-center"
            aria-busy="true"
            aria-live="polite"
          >
            <span className="flex size-12 items-center justify-center rounded-2xl bg-guru/12 text-guru">
              <CalendarClock className="size-6" strokeWidth={2} />
            </span>
            <p className="text-sm font-medium text-fg/60">Günler yükleniyor</p>
          </div>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="relative flex min-h-72 flex-col items-center justify-center overflow-hidden text-center"
              >
                {/* Kutlama ışıltıları: dekoratif, pointer-events yok; düşük yoğunluk metni örtmesin */}
                <Sparkles density={6} className="opacity-80" />
                <span className="flex size-16 items-center justify-center rounded-full bg-guru/15 text-guru shadow-[0_0_40px_light-dark(rgb(16_216_108/0.14),rgb(16_216_108/0.25))]">
                  <CheckCircle2 className="size-8" strokeWidth={2} />
                </span>
                <h3 className="mt-6 text-xl font-bold tracking-tight text-fg md:text-2xl">
                  Talebiniz e-posta uygulamanızda açıldı
                </h3>
                {selectedDay && time && (
                  <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-fg/15 bg-band/60 px-4 py-1.5 text-sm font-semibold text-fg">
                    <CalendarClock className="size-4 shrink-0 text-guru" strokeWidth={2.2} />
                    {selectedDay.full} {time}
                  </p>
                )}
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-fg/60">
                  Gönder butonuna basmanız yeterli; aynı gün onay dönüşü
                  yapıyoruz. E-posta uygulamanız açılmadıysa talebi doğrudan{" "}
                  <a
                    href={request ? mailtoHref(request) : `mailto:${site.email}`}
                    className="font-semibold text-fg underline decoration-guru decoration-2 underline-offset-2"
                  >
                    {site.email}
                  </a>{" "}
                  adresine gönderin.
                </p>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={copyRequest}
                    aria-live="polite"
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-fg/25 px-6 py-3 text-sm font-semibold text-fg transition-all duration-300 hover:border-guru/70 hover:text-guru active:scale-[0.98]"
                  >
                    {copied ? (
                      <Check className="size-4 text-guru" strokeWidth={2.4} />
                    ) : (
                      <Copy className="size-4" strokeWidth={2.2} />
                    )}
                    {copied ? "Talep kopyalandı" : "Talebi kopyala"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTime(null);
                      setSubmitted(false);
                      setCopied(false);
                    }}
                    className="min-h-11 rounded-full border border-fg/25 px-6 py-3 text-sm font-semibold text-fg transition-all duration-300 hover:border-fg hover:bg-fg hover:text-page active:scale-[0.98]"
                  >
                    Farklı saat seç
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
                {/* Adım 1: gün seçimi */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <p id="ms-day-label" className={labelCls}>
                      1. Gün seçin <span className="text-guru">*</span>
                    </p>
                    {/* Mobilde şerit yatay kayar: görsel ipucu (md+ tüm günler ızgarada) */}
                    <span
                      aria-hidden
                      className="inline-flex items-center gap-0.5 text-xs font-medium text-fg/55 md:hidden"
                    >
                      Kaydırın
                      <ChevronRight className="size-3.5" strokeWidth={2.2} />
                    </span>
                  </div>
                  <div
                    role="group"
                    aria-labelledby="ms-day-label"
                    className="-mx-6 flex snap-x snap-proximity gap-2 overflow-x-auto scroll-px-6 px-6 pb-2 [scrollbar-width:none] max-md:[mask-image:linear-gradient(to_right,transparent,black_24px,black_calc(100%_-_24px),transparent)] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0 md:pb-0"
                  >
                    {days.map((d) => {
                      const selected = d.key === dayKey;
                      return (
                        <button
                          key={d.key}
                          type="button"
                          onClick={(e) => {
                            setDayKey(d.key);
                            clearError("day");
                            // Kesik görünen çipi şeride tam sokar (yalnız yatay, sayfa kaymaz)
                            e.currentTarget.scrollIntoView({ inline: "nearest", block: "nearest" });
                          }}
                          aria-pressed={selected}
                          className={cn(
                            chipCls(selected),
                            "min-w-16 shrink-0 snap-start flex-col px-3 py-1.5"
                          )}
                        >
                          <span className="text-xs font-semibold uppercase tracking-[0.08em] opacity-85">
                            {d.weekday}
                          </span>
                          <span className="text-[13px] font-bold">{d.short}</span>
                        </button>
                      );
                    })}
                  </div>
                  <FieldError id="ms-day-error" message={errors.day} />
                </div>

                {/* Adım 2: saat seçimi */}
                <div className="mt-6 space-y-2">
                  <p id="ms-time-label" className={labelCls}>
                    2. Saat seçin <span className="text-guru">*</span>
                  </p>
                  <div
                    role="group"
                    aria-labelledby="ms-time-label"
                    className="grid grid-cols-3 gap-2 sm:grid-cols-6"
                  >
                    {TIME_SLOTS.map((t) => {
                      const selected = t === time;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            setTime(t);
                            clearError("time");
                          }}
                          aria-pressed={selected}
                          className={cn(chipCls(selected), "px-2 text-sm font-semibold")}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                  <FieldError id="ms-time-error" message={errors.time} />
                </div>

                {/* Adım 3: iletişim bilgileri */}
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="ms-name" className={labelCls}>
                      3. Ad soyad <span className="text-guru">*</span>
                    </label>
                    <input
                      id="ms-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Adınız Soyadınız"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        clearError("name");
                      }}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? "ms-name-error" : undefined}
                      className={cn(inputCls(Boolean(errors.name)), "h-12")}
                    />
                    <FieldError id="ms-name-error" message={errors.name} />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="ms-email" className={labelCls}>
                      E-posta <span className="text-guru">*</span>
                    </label>
                    <input
                      id="ms-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="ornek@firma.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        clearError("email");
                      }}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? "ms-email-error" : undefined}
                      className={cn(inputCls(Boolean(errors.email)), "h-12")}
                    />
                    <FieldError id="ms-email-error" message={errors.email} />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label htmlFor="ms-note" className={labelCls}>
                      Kısa not <span className="text-fg/45">(opsiyonel)</span>
                    </label>
                    <textarea
                      id="ms-note"
                      name="note"
                      rows={3}
                      placeholder="Görüşmede konuşmak istediğiniz konuyu kısaca yazabilirsiniz…"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className={cn(inputCls(false), "resize-y py-3 leading-relaxed")}
                    />
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <button
                    type="submit"
                    className="group inline-flex h-12 w-full items-center justify-center gap-2.5 whitespace-nowrap rounded-full bg-guru px-6 text-[15px] font-semibold text-ink transition-all duration-300 hover:brightness-110 hover:shadow-[0_0_28px_rgba(16,216,108,0.3)] active:scale-[0.985] sm:w-auto sm:px-8 md:h-14"
                  >
                    Toplantı Talebi Gönder
                    <ArrowRight
                      className="size-[18px] shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                      strokeWidth={2.2}
                    />
                  </button>
                  <p className="text-xs leading-relaxed text-fg/50">
                    Görüşmeler yaklaşık 30 dakika sürer ve çevrim içi yapılır.
                  </p>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        )}
      </div>
    </Spotlight>
  );
}
