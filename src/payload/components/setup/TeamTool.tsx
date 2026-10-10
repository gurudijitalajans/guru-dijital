"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type Member = { id: number | string; name: string; email: string; role: string; modules: string[]; pending: boolean; self: boolean };
type Mod = { value: string; label: string };

export function TeamTool({ members, modules, emailReady, canEditUsers }: { members: Member[]; modules: Mod[]; emailReady: boolean; canEditUsers: boolean }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("uye");
  const [mods, setMods] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [link, setLink] = useState("");
  const label = (v: string) => modules.find((m) => m.value === v)?.label ?? v;

  const answer = (j: { ok?: boolean; error?: string; message?: string; emailSent?: boolean; link?: string } | null, okText: string) => {
    if (!j?.ok) {
      setMsg(j?.error ?? "İşlem yapılamadı.");
      setLink("");
      return false;
    }
    setMsg(j.message ?? (j.emailSent ? okText : "E-posta servisi bağlı değil: aşağıdaki bağlantıyı kişiye kendiniz iletin (3 gün geçerli)."));
    setLink(j.link ?? "");
    return true;
  };

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const r = await fetch("/api/users/davet", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, role, modules: mods }) }).catch(() => null);
    const j = await r?.json().catch(() => null);
    if (answer(j, `${email} adresine davet gönderildi.`)) {
      setName("");
      setEmail("");
      setMods([]);
      router.refresh();
    }
    setBusy(false);
  };
  const resend = async (m: Member) => {
    setBusy(true);
    const r = await fetch(`/api/users/${m.id}/davet-yenile`, { method: "POST", credentials: "same-origin" }).catch(() => null);
    answer(await r?.json().catch(() => null), `${m.email} adresine davet yeniden gönderildi.`);
    setBusy(false);
  };

  return (
    <div className="guru-import">
      <section className="guru-home__panel">
        <div className="guru-home__panel-head">
          <h2>Kişi Davet Edin</h2>
          {!emailReady ? <span className="guru-home__meta">E-posta servisi bağlı değil: davet bağlantısını kopyalayıp iletirsiniz</span> : null}
        </div>
        <form className="guru-team__form" onSubmit={invite}>
          <label className="guru-crm__due">
            <span>Ad Soyad</span>
            <input className="guru-crm__input" required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="guru-crm__due">
            <span>E-posta</span>
            <input className="guru-crm__input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="guru-crm__due">
            <span>Rol</span>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="uye">Ekip üyesi (seçtiğiniz modüller)</option>
              <option value="yonetici">İşletme yöneticisi (tüm modüller, ekibi yönetir)</option>
            </select>
          </label>
          {role === "uye" ? (
            <fieldset className="guru-team__mods">
              <legend>Modüller</legend>
              {modules.map((m) => (
                <label key={m.value}>
                  <input type="checkbox" checked={mods.includes(m.value)} onChange={(e) => setMods((x) => (e.target.checked ? [...x, m.value] : x.filter((v) => v !== m.value)))} />
                  {m.label}
                </label>
              ))}
            </fieldset>
          ) : null}
          <div className="guru-crm__row">
            <button type="submit" className="guru-crm__save" disabled={busy}>
              {busy ? "Gönderiliyor…" : "Davet et"}
            </button>
          </div>
        </form>
        {msg ? (
          <p className="guru-crm__hint" role="status">
            {msg}
          </p>
        ) : null}
        {link ? (
          <div className="guru-embed__code">
            <code>{link}</code>
            <button type="button" className="guru-plan__nav" onClick={() => navigator.clipboard.writeText(link).catch(() => {})}>
              Kopyala
            </button>
          </div>
        ) : null}
      </section>

      <section className="guru-home__panel">
        <div className="guru-home__panel-head">
          <h2>Ekip</h2>
        </div>
        <ul className="guru-home__rows">
          {members.map((m) => (
            <li key={m.id}>
              <div className="guru-exec__feed guru-team__row">
                <span className="guru-home__who">
                  {m.name} {m.self ? <small>(siz)</small> : null}
                </span>
                <span className="guru-home__meta">
                  {m.email} · {m.role === "yonetici" ? "İşletme yöneticisi" : m.modules.length ? m.modules.map(label).join(", ") : "Modül verilmedi"}
                </span>
                <span className="guru-team__actions">
                  {m.pending ? (
                    <>
                      <span className="guru-home__pill guru-home__pill--yeni">Davet bekliyor</span>
                      <button type="button" className="guru-plan__nav" disabled={busy} onClick={() => resend(m)}>
                        Yeniden gönder
                      </button>
                    </>
                  ) : null}
                  {canEditUsers || !m.self ? <Link href={`/admin/collections/users/${m.id}`}>Yetkiyi düzenle</Link> : null}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
