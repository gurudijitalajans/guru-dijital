"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { safeNext } from "./safe";

/**
 * Giriş, parola sıfırlama ve parola belirleme formları. Payload'un kendi
 * uçlarını kullanır (/api/users/login, forgot-password, reset-password);
 * oturum çerezi Payload'unki.
 */
type ApiErr = { errors?: { message?: string }[]; message?: string } | null;
const msgOf = (j: ApiErr) => j?.errors?.[0]?.message ?? j?.message ?? "";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1 text-[14px]">
      <span className="text-muted">{label}</span>
      {children}
    </label>
  );
}

function Password({ value, onChange, autoComplete, id }: { value: string; onChange: (v: string) => void; autoComplete: string; id?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input id={id} type={show ? "text" : "password"} required value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} className="w-full pr-11" />
      <button type="button" onClick={() => setShow((s) => !s)} className="absolute top-1/2 right-1 grid size-9 -translate-y-1/2 place-items-center rounded-[8px] text-muted hover:text-ink" aria-label={show ? "Parolayı gizle" : "Parolayı göster"}>
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

function Alert({ tone, children }: { tone: "bad" | "good"; children: React.ReactNode }) {
  return (
    <p role={tone === "bad" ? "alert" : "status"} className={tone === "bad" ? "m-0 rounded-[10px] bg-bad-soft px-3 py-2 text-[14px] text-bad" : "m-0 rounded-[10px] bg-good-soft px-3 py-2 text-[14px] text-good"}>
      {children}
    </p>
  );
}

export function LoginForm({ next, loggedOut, noTenant = false }: { next: string | null; loggedOut: boolean; noTenant?: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  /* Eski /admin/logout adresinden gelindiyse oturum kapatılır */
  useEffect(() => {
    if (loggedOut || noTenant) void fetch("/api/users/logout", { method: "POST", credentials: "same-origin" }).catch(() => null);
  }, [loggedOut, noTenant]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const r = await fetch("/api/users/login", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim(), password }) }).catch(() => null);
    if (r?.ok) {
      window.location.assign(safeNext(next));
      return;
    }
    const j = (await r?.json().catch(() => null)) as ApiErr;
    setError(
      !r
        ? "Bağlantı kurulamadı. İnternetinizi kontrol edip tekrar deneyin."
        : /* Payload kilitli hesapta da 401 döndürür: kilit önce mesajdan anlaşılır */
          r.status === 423 || /locked|kilit/i.test(msgOf(j))
          ? "Çok fazla hatalı deneme yapıldı; hesabınız 10 dakikalığına kilitlendi. Parolanızı yenilerseniz kilit hemen açılır."
          : r.status === 401
            ? "E-posta ya da parola hatalı."
            : r.status === 429
              ? "Çok sık deneme yapıldı. Biraz bekleyip tekrar deneyin."
              : msgOf(j) || "Giriş yapılamadı.",
    );
    setBusy(false);
  };

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <div>
        <h1 className="m-0 text-[22px] font-semibold text-ink">Giriş yapın</h1>
        <p className="mt-1 mb-0 text-[14px] text-muted">Guru Panel hesabınızla devam edin.</p>
      </div>
      {loggedOut ? <Alert tone="good">Oturumunuz kapatıldı.</Alert> : null}
      {noTenant ? <Alert tone="bad">Hesabınız şu an etkin bir işletmeye bağlı değil. İşletmenizin yöneticisiyle ya da Guru Dijital ile görüşün.</Alert> : null}
      {error ? <Alert tone="bad">{error}</Alert> : null}
      <Field label="E-posta">
        <Input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
      </Field>
      <Field label="Parola">
        <Password value={password} onChange={setPassword} autoComplete="current-password" />
      </Field>
      <Button type="submit" variant="primary" disabled={busy} className="min-h-11">
        {busy ? "Giriş yapılıyor…" : "Giriş yap"}
      </Button>
      <Link href="/parola-sifirla" className="justify-self-center text-[14px] text-accent">
        Parolamı unuttum
      </Link>
    </form>
  );
}

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const r = await fetch("/api/users/forgot-password", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim() }) }).catch(() => null);
    if (r?.status === 429) {
      const j = (await r.json().catch(() => null)) as ApiErr;
      setError(msgOf(j) || "Az önce bir bağlantı gönderildi. Bir dakika sonra tekrar deneyin.");
    } else if (!r) setError("Bağlantı kurulamadı. Tekrar deneyin.");
    /* Hesabın var olup olmadığı söylenmez */ else setDone(true);
    setBusy(false);
  };
  return (
    <form className="grid gap-4" onSubmit={submit}>
      <div>
        <h1 className="m-0 text-[22px] font-semibold text-ink">Parolanızı yenileyin</h1>
        <p className="mt-1 mb-0 text-[14px] text-muted">E-posta adresinizi yazın; parolanızı yenilemeniz için bir bağlantı gönderelim.</p>
      </div>
      {done ? <Alert tone="good">Bu adres bir hesaba aitse birkaç dakika içinde e-posta gelir. Gelen kutunuzu ve istenmeyen klasörünü kontrol edin.</Alert> : null}
      {error ? <Alert tone="bad">{error}</Alert> : null}
      {!done ? (
        <>
          <Field label="E-posta">
            <Input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
          </Field>
          <Button type="submit" variant="primary" disabled={busy} className="min-h-11">
            {busy ? "Gönderiliyor…" : "Bağlantı gönder"}
          </Button>
        </>
      ) : null}
      <Link href="/giris" className="justify-self-center text-[14px] text-accent">
        Girişe dön
      </Link>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [again, setAgain] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [expired, setExpired] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return void setError("Parola en az 8 karakter olmalı.");
    if (password !== again) return void setError("İki parola aynı değil.");
    setBusy(true);
    setError("");
    const r = await fetch("/api/users/reset-password", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) }).catch(() => null);
    if (r?.ok) {
      /* Tam yükleme: yeni oturum çereziyle panel baştan kurulsun */
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/panel");
      return;
    }
    const j = (await r?.json().catch(() => null)) as ApiErr;
    if (r && (r.status === 403 || /token|expired|invalid|geçersiz|süresi/i.test(msgOf(j)))) setExpired(true);
    else setError(msgOf(j) || "Parola kaydedilemedi.");
    setBusy(false);
  };
  if (expired)
    return (
      <div className="grid gap-4">
        <h1 className="m-0 text-[22px] font-semibold text-ink">Bağlantının süresi dolmuş</h1>
        <p className="m-0 text-[14px] text-muted">Bu bağlantı kullanılmış ya da süresi dolmuş. Yeni bir bağlantı isteyin; davet ettiyseniz ekip yöneticinizden daveti yeniden göndermesini isteyin.</p>
        <Button asChild variant="primary" className="min-h-11">
          <Link href="/parola-sifirla">Yeni bağlantı iste</Link>
        </Button>
      </div>
    );
  return (
    <form className="grid gap-4" onSubmit={submit}>
      <div>
        <h1 className="m-0 text-[22px] font-semibold text-ink">Parolanızı belirleyin</h1>
        <p className="mt-1 mb-0 text-[14px] text-muted">En az 8 karakter. Kaydedince panele giriş yapılır.</p>
      </div>
      {error ? <Alert tone="bad">{error}</Alert> : null}
      <Field label="Yeni parola">
        <Password value={password} onChange={setPassword} autoComplete="new-password" />
      </Field>
      <Field label="Yeni parola (tekrar)">
        <Password value={again} onChange={setAgain} autoComplete="new-password" />
      </Field>
      <Button type="submit" variant="primary" disabled={busy} className="min-h-11">
        {busy ? "Kaydediliyor…" : "Parolayı kaydet ve giriş yap"}
      </Button>
    </form>
  );
}
