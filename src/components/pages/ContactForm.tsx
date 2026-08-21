"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Clock } from "lucide-react";
import { GButton } from "@/components/ui/Button";
import { Sparkles } from "@/components/fx/Sparkles";
import { services, site } from "@/lib/data";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

const inputCls = (hasError: boolean) =>
  cn(
    "w-full rounded-xl border bg-carbon px-4 py-3 text-sm text-paper outline-none transition-all duration-200 placeholder:text-paper/40",
    hasError
      ? "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
      : "border-paper/15 focus:border-guru focus:ring-2 focus:ring-guru/25 focus:shadow-[0_0_26px_rgba(16,216,108,0.16)]"
  );

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs font-medium text-red-400">
      {message}
    </p>
  );
}

export function ContactForm() {
  const [values, setValues] = useState<Values>(initialValues);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  function set<K extends keyof Values>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nextErrors = validate(values);
    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors);
      return;
    }
    const subject = `Web Sitesi İletişim Formu | ${values.service}`;
    const body = [
      `Ad Soyad: ${values.name.trim()}`,
      `E-posta: ${values.email.trim()}`,
      values.phone.trim() ? `Telefon: ${values.phone.trim()}` : null,
      `İlgilenilen Hizmet: ${values.service}`,
      "",
      values.message.trim(),
    ]
      .filter(Boolean)
      .join("\n");
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
  }

  return (
    <div className="rounded-3xl border border-paper/10 bg-carbon p-6 shadow-[0_0_50px_rgba(16,216,108,0.07)] md:p-8 [color-scheme:dark]">
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
            {/* Kutlama ışıltıları — dekoratif, pointer-events yok */}
            <Sparkles density={10} className="opacity-80" />
            <span className="flex size-16 items-center justify-center rounded-full bg-guru/15 text-guru shadow-[0_0_40px_rgba(16,216,108,0.25)]">
              <CheckCircle2 className="size-8" strokeWidth={2} />
            </span>
            <h3 className="mt-6 text-xl font-bold tracking-tight text-paper md:text-2xl">
              Talebiniz e-posta uygulamanızda açıldı
            </h3>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-paper/60">
              Gönder butonuna basmanız yeterli. E-posta uygulamanız açılmadıysa
              mesajınızı doğrudan{" "}
              <a
                href={`mailto:${site.email}`}
                className="font-semibold text-paper underline decoration-guru decoration-2 underline-offset-2"
              >
                {site.email}
              </a>{" "}
              adresine iletebilirsiniz.
            </p>
            <button
              type="button"
              onClick={() => {
                setValues(initialValues);
                setErrors({});
                setSubmitted(false);
              }}
              className="mt-7 rounded-full border border-paper/25 px-6 py-3 text-sm font-semibold text-paper transition-all duration-300 hover:border-paper hover:bg-paper hover:text-ink active:scale-[0.98]"
            >
              Yeni mesaj yaz
            </button>
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
            <div className="inline-flex items-center gap-2 rounded-full bg-guru/12 px-4 py-2 text-[13px] font-semibold text-guru">
              <Clock className="size-4" strokeWidth={2.2} />
              Ortalama yanıt süremiz: aynı gün
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="cf-name" className="mb-1.5 block text-sm font-semibold text-paper">
                  Ad Soyad <span className="text-guru">*</span>
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
                  className={inputCls(Boolean(errors.name))}
                />
                <FieldError id="cf-name-error" message={errors.name} />
              </div>

              <div>
                <label htmlFor="cf-email" className="mb-1.5 block text-sm font-semibold text-paper">
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
                  className={inputCls(Boolean(errors.email))}
                />
                <FieldError id="cf-email-error" message={errors.email} />
              </div>

              <div>
                <label htmlFor="cf-phone" className="mb-1.5 block text-sm font-semibold text-paper">
                  Telefon <span className="font-normal text-paper/50">(opsiyonel)</span>
                </label>
                <input
                  id="cf-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="05xx xxx xx xx"
                  value={values.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  className={inputCls(false)}
                />
              </div>

              <div>
                <label htmlFor="cf-service" className="mb-1.5 block text-sm font-semibold text-paper">
                  İlgilendiğiniz Hizmet <span className="text-guru">*</span>
                </label>
                <select
                  id="cf-service"
                  name="service"
                  value={values.service}
                  onChange={(e) => set("service", e.target.value)}
                  aria-invalid={Boolean(errors.service)}
                  aria-describedby={errors.service ? "cf-service-error" : undefined}
                  className={cn(inputCls(Boolean(errors.service)), !values.service && "text-paper/40")}
                >
                  <option value="" disabled>
                    Hizmet seçin
                  </option>
                  {services.map((s) => (
                    <option key={s.slug} value={s.title}>
                      {s.title}
                    </option>
                  ))}
                  <option value="Diğer">Diğer / Emin değilim</option>
                </select>
                <FieldError id="cf-service-error" message={errors.service} />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="cf-message" className="mb-1.5 block text-sm font-semibold text-paper">
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
                  className={cn(inputCls(Boolean(errors.message)), "resize-y")}
                />
                <FieldError id="cf-message-error" message={errors.message} />
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <GButton type="submit" variant="green" size="lg">
                Mesajı Gönder
              </GButton>
              <p className="text-xs leading-relaxed text-paper/50">
                Gönderdiğinizde mesajınız e-posta uygulamanızda hazırlanır.
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
