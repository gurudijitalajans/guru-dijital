"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CalendarClock, Check, ChevronRight, Copy } from "lucide-react";
import { Btn } from "@/components/site/Btn";
import { iconBoxCls, pillCls } from "@/components/site/styles";
import { FieldError, FormNotice, Honeypot, Opt, Req, fieldCls, formCardCls, labelCls } from "@/components/pages/ContactForm";
import { site } from "@/lib/data";
import { postForm } from "@/lib/submit";
import { EVENTS, track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Öğle arası hariç sabit saat dilimleri. */
const TIME_SLOTS = ["10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

type Day = {
  key: string;
  /** Kısa gün adı, ör. "Cum" */
  weekday: string;
  /** Gün ve kısa ay, ör. "22 Ağu" (onay hapındaki GG.AA.YYYY ile karışmaz) */
  short: string;
  /** GG.AA.YYYY, ör. "22.08.2026" */
  full: string;
};

/* Yarından itibaren önümüzdeki 10 iş günü (hafta sonları atlanır). */
function buildBusinessDays(): Day[] {
  const wd = new Intl.DateTimeFormat("tr-TR", { weekday: "short" });
  /* { day, month: "2-digit" } Chrome'da "22/08" üretiyor; kısa ay adı her tarayıcıda aynı */
  const dm = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" });
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
    const pad = (n: number) => String(n).padStart(2, "0");
    days.push({
      /* "YYYY-MM-DD": panelin dolu saat anahtarıyla aynı biçim */
      key: `${cursor.getFullYear()}-${pad(cursor.getMonth() + 1)}-${pad(cursor.getDate())}`,
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

/* Gün ve saat çipleri: beyaz zemin + ince halka; seçili olan marka mavisi.
   Seçim yapılmadan gönderilince çipler inputlar gibi kırmızı halka alır. */
const chipCls = (selected: boolean, hasError = false) =>
  cn(
    "flex min-h-11 items-center justify-center rounded-xl transition-[background-color,color,box-shadow] duration-200",
    selected
      ? "bg-brand text-white shadow-[0_0_0_1px_#2a6aca]"
      : hasError
        ? "bg-white text-body shadow-[0_0_0_1px_rgb(200_30_30/0.6)] hover:text-heading hover:shadow-[0_0_0_1px_rgb(200_30_30/0.8)]"
        : "bg-white text-body shadow-[0_0_0_1px_rgb(1_20_65/0.14)] hover:text-heading hover:shadow-[0_0_0_1px_rgb(42_106_202/0.55)]"
  );

/** Adım numarası + etiket */
function StepLabel({ id, n, children }: { id?: string; n: number; children: React.ReactNode }) {
  return (
    <span id={id} className={cn(labelCls, "inline-flex items-center gap-2.5")}>
      <span
        aria-hidden
        className="grid size-6 shrink-0 place-items-center rounded-full bg-chip text-[12px] font-medium text-heading"
      >
        {n}
      </span>
      <span>{children}</span>
    </span>
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
  /* "saved": panele kaydedildi; "mail": panel yoksa e-posta uygulamasıyla */
  const [submitted, setSubmitted] = useState<false | "saved" | "mail">(false);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<string>();
  const [trap, setTrap] = useState("");
  /* Panelde iptal edilmemiş randevuların "YYYY-MM-DD HH:mm" anahtarları */
  const [busy, setBusy] = useState<Set<string>>(() => new Set());
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number | null>(null);

  const selectedDay = days?.find((d) => d.key === dayKey) ?? null;
  const request =
    selectedDay && time
      ? buildRequest(selectedDay, time, name, email, note, topic)
      : null;

  /* Dolu saatleri panelden oku; panel yoksa tüm saatler açık kalır */
  useEffect(() => {
    let alive = true;
    fetch("/api/bookings/dolu")
      .then((r) => (r.ok ? r.json() : { slots: [] }))
      .then((j: { slots?: string[] }) => {
        if (alive) setBusy(new Set(j.slots ?? []));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const isBusy = (day: string | null, t: string) => Boolean(day && busy.has(`${day} ${t}`));

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

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    setNotice(undefined);
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
      const isGroup = firstKey === "day" || firstKey === "time";
      const target = document.getElementById(isGroup ? `ms-${firstKey}-label` : `ms-${firstKey}`);
      target?.scrollIntoView({ block: "center" });
      const focusable = isGroup
        ? document.querySelector<HTMLButtonElement>(`#ms-${firstKey}-group button:not(:disabled)`)
        : target;
      if (focusable instanceof HTMLElement) focusable.focus({ preventScroll: true });
      return;
    }

    setSending(true);
    const result = await postForm("/api/bookings/gonder", {
      day: selectedDay.key,
      time,
      name,
      email,
      note,
      topic: topic ?? "",
      source: window.location.pathname,
      website: trap,
    });
    setSending(false);
    if (result.kind === "saved") {
      track(EVENTS.bookingSent, { kaynak: window.location.pathname, ...(topic ? { konu: topic } : {}) });
      setBusy((b) => new Set(b).add(`${selectedDay.key} ${time}`));
      setSubmitted("saved");
      return;
    }
    if (result.kind === "error") {
      if (result.code === "dolu") {
        /* Bu arada başkası almış: saati kapat, yeniden seçtir */
        setBusy((b) => new Set(b).add(`${selectedDay.key} ${time}`));
        setTime(null);
        setErrors({ time: result.message });
        document.getElementById("ms-time-label")?.scrollIntoView({ block: "center" });
      } else {
        setNotice(result.message);
      }
      return;
    }

    window.location.assign(
      mailtoHref(buildRequest(selectedDay, time, name, email, note, topic))
    );
    setSubmitted("mail");
  }

  return (
    <div className={cn(formCardCls, "mx-auto flex max-w-3xl flex-col")}>
      {days === null ? (
        /* SSR + hydration iskeleti: tarih üretimi istemciye kalır. */
        <div
          className="flex min-h-72 flex-col items-center justify-center gap-4 text-center"
          aria-busy="true"
          aria-live="polite"
        >
          <span className={iconBoxCls}>
            <CalendarClock className="size-5 text-brand" strokeWidth={2} aria-hidden />
          </span>
          <p className="text-[14px] font-medium text-muted">Günler yükleniyor</p>
        </div>
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="flex min-h-72 flex-col items-center justify-center text-center"
            >
              <span className="grid size-16 place-items-center rounded-full bg-chip text-brand">
                <Check className="size-7" strokeWidth={2.2} aria-hidden />
              </span>
              <h3 className="mt-6 text-balance text-[22px] font-medium leading-snug tracking-[-0.02em] text-heading md:text-[24px]">
                {submitted === "saved" ? "Toplantı Talebiniz Alındı" : "Talebiniz E-posta Uygulamanızda Açıldı"}
              </h3>
              {selectedDay && time && (
                <p className={cn(pillCls, "mt-4 bg-chip shadow-none")}>
                  <CalendarClock className="size-4 shrink-0 text-brand" strokeWidth={2} aria-hidden />
                  {selectedDay.full} {time}
                </p>
              )}
              {submitted === "saved" ? (
                <p className="mt-4 max-w-sm text-[14.5px] leading-relaxed text-muted">
                  Saat sizin için ayrıldı. Aynı gün içinde{" "}
                  <span className="break-words font-medium text-heading">{email.trim()}</span> adresine onay ve
                  görüşme bağlantısını göndereceğiz.
                </p>
              ) : (
              <p className="mt-4 max-w-sm text-[14.5px] leading-relaxed text-muted">
                Gönder butonuna basmanız yeterli; aynı gün onay dönüşü
                yapıyoruz. E-posta uygulamanız açılmadıysa talebi doğrudan{" "}
                <a
                  href={request ? mailtoHref(request) : `mailto:${site.email}`}
                  className="break-words font-medium text-heading underline decoration-brand decoration-2 underline-offset-4 hover:text-brand"
                >
                  {site.email}
                </a>{" "}
                adresine gönderin.
              </p>
              )}
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                {submitted === "mail" && (
                <Btn variant="light" onClick={copyRequest} aria-live="polite">
                  <span className="flex items-center gap-2">
                    {copied ? (
                      <Check className="size-4 text-brand" strokeWidth={2.4} aria-hidden />
                    ) : (
                      <Copy className="size-4" strokeWidth={2} aria-hidden />
                    )}
                    {copied ? "Talep Kopyalandı" : "Talebi Kopyala"}
                  </span>
                </Btn>
                )}
                <Btn
                  variant="primary"
                  onClick={() => {
                    setTime(null);
                    setSubmitted(false);
                    setCopied(false);
                    setNotice(undefined);
                  }}
                >
                  {submitted === "saved" ? "Yeni Talep Oluştur" : "Farklı Saat Seç"}
                </Btn>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              noValidate
              onSubmit={onSubmit}
              aria-busy={sending}
              className="relative flex flex-1 flex-col"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              {/* Adım 1: gün seçimi */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <StepLabel id="ms-day-label" n={1}>
                    Gün seçin <Req />
                  </StepLabel>
                  {/* Mobilde şerit yatay kayar: görsel ipucu (md+ tüm günler ızgarada) */}
                  <span
                    aria-hidden
                    className="inline-flex items-center gap-0.5 text-[12.5px] font-medium text-muted md:hidden"
                  >
                    Kaydırın
                    <ChevronRight className="size-3.5" strokeWidth={2.2} />
                  </span>
                </div>
                <div
                  id="ms-day-group"
                  role="group"
                  aria-labelledby="ms-day-label"
                  aria-describedby={errors.day ? "ms-day-error" : undefined}
                  className="-mx-6 flex snap-x snap-proximity gap-2 overflow-x-auto scroll-px-6 px-6 py-1 [scrollbar-width:none] max-md:[mask-image:linear-gradient(to_right,transparent,black_24px,black_calc(100%_-_24px),transparent)] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0 md:py-0"
                >
                  {days.map((d) => {
                    const selected = d.key === dayKey;
                    return (
                      <button
                        key={d.key}
                        type="button"
                        onClick={(e) => {
                          setDayKey(d.key);
                          if (time && isBusy(d.key, time)) setTime(null);
                          clearError("day");
                          // Kesik görünen çipi şeride tam sokar (yalnız yatay, sayfa kaymaz)
                          e.currentTarget.scrollIntoView({ inline: "nearest", block: "nearest" });
                        }}
                        aria-pressed={selected}
                        className={cn(chipCls(selected, Boolean(errors.day)), "min-w-[68px] shrink-0 snap-start flex-col px-3 py-2")}
                      >
                        <span
                          className={cn(
                            "text-[11.5px] font-medium uppercase leading-tight tracking-[0.08em]",
                            selected ? "text-white/80" : "text-muted"
                          )}
                        >
                          {d.weekday}
                        </span>
                        <span className="text-[14px] font-medium leading-tight">{d.short}</span>
                      </button>
                    );
                  })}
                </div>
                <FieldError id="ms-day-error" message={errors.day} />
              </div>

              {/* Adım 2: saat seçimi */}
              <div className="mt-6 space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <StepLabel id="ms-time-label" n={2}>
                    Saat seçin <Req />
                  </StepLabel>
                  <span className="text-[12.5px] font-medium text-muted">Türkiye saati (GMT+3)</span>
                </div>
                <div
                  id="ms-time-group"
                  role="group"
                  aria-labelledby="ms-time-label"
                  aria-describedby={errors.time ? "ms-time-error" : undefined}
                  className="grid grid-cols-3 gap-2 sm:grid-cols-6"
                >
                  {TIME_SLOTS.map((t) => {
                    const selected = t === time;
                    const taken = isBusy(dayKey, t);
                    return (
                      <button
                        key={t}
                        type="button"
                        disabled={taken}
                        onClick={() => {
                          setTime(t);
                          clearError("time");
                        }}
                        aria-pressed={selected}
                        aria-label={taken ? `${t}, dolu` : undefined}
                        className={cn(
                          chipCls(selected, Boolean(errors.time) && !taken),
                          "flex-col px-2 text-[14.5px] font-medium",
                          taken && "cursor-not-allowed bg-soft text-muted/70 shadow-none hover:text-muted/70 hover:shadow-none"
                        )}
                      >
                        <span>{t}</span>
                        {taken && <span className="text-[11px] font-medium leading-none">Dolu</span>}
                      </button>
                    );
                  })}
                </div>
                <FieldError id="ms-time-error" message={errors.time} />
              </div>

              {/* Adım 3: iletişim bilgileri */}
              <div className="mt-6 space-y-3">
                <StepLabel n={3}>Bilgileriniz</StepLabel>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="ms-name" className={labelCls}>
                      Ad soyad <Req />
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
                      aria-required
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? "ms-name-error" : undefined}
                      className={cn(fieldCls(Boolean(errors.name)), "h-12")}
                    />
                    <FieldError id="ms-name-error" message={errors.name} />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="ms-email" className={labelCls}>
                      E-posta <Req />
                    </label>
                    <input
                      id="ms-email"
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="ornek@firma.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        clearError("email");
                      }}
                      aria-required
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? "ms-email-error" : undefined}
                      className={cn(fieldCls(Boolean(errors.email)), "h-12")}
                    />
                    <FieldError id="ms-email-error" message={errors.email} />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label htmlFor="ms-note" className={labelCls}>
                      Kısa not <Opt />
                    </label>
                    <textarea
                      id="ms-note"
                      name="note"
                      rows={3}
                      placeholder="Görüşmede konuşmak istediğiniz konuyu kısaca yazabilirsiniz."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className={cn(fieldCls(false), "block resize-y py-3 leading-relaxed")}
                    />
                  </div>
                </div>
              </div>

              <Honeypot value={trap} onChange={setTrap} />
              <FormNotice message={notice} />

              <div className="mt-auto flex flex-col gap-3 pt-7 sm:flex-row sm:items-center sm:gap-5">
                <Btn
                  type="submit"
                  variant="primary"
                  size="lg"
                  arrow={!sending}
                  disabled={sending}
                  className="w-full shrink-0 disabled:cursor-wait disabled:opacity-70 sm:w-auto"
                >
                  {sending ? "Gönderiliyor" : "Toplantı Talebi Gönder"}
                </Btn>
                <p className="text-[13px] leading-relaxed text-muted">
                  Görüşmeler yaklaşık 30 dakika sürer ve çevrim içi yapılır.
                </p>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
