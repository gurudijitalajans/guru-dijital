"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardHeader } from "../ui/card";
import { cn } from "@/lib/utils";

export type Member = { id: number | string; name: string; email: string; role: string; modules: string[]; ownOnly?: boolean; pending: boolean; self: boolean };
type Mod = { value: string; label: string };
type Orphan = { id: number | string; name: string; email: string };
type Answer = { ok?: boolean; error?: string; message?: string; emailSent?: boolean; link?: string } | null;

/** Kişi davet etme ve ekip listesi; yetki düzenleme panelin kullanıcı formunda */
export function TeamPanel({ members, modules, emailReady, canEditUsers, orphans }: { members: Member[]; modules: Mod[]; emailReady: boolean; canEditUsers: boolean; orphans: Orphan[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("uye");
  const [scope, setScope] = useState("hepsi");
  const [mods, setMods] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState("");
  const label = (v: string) => modules.find((m) => m.value === v)?.label ?? v;

  const answer = (j: Answer, okText: string) => {
    if (!j?.ok) {
      toast.error(j?.error ?? "İşlem yapılamadı.");
      setLink("");
      return false;
    }
    toast.success(j.message ?? (j.emailSent ? okText : "E-posta servisi bağlı değil: aşağıdaki bağlantıyı kişiye kendiniz iletin (3 gün geçerli)."));
    setLink(j.link ?? "");
    return true;
  };
  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const r = await fetch("/api/users/davet", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, role, modules: mods, scope }) }).catch(() => null);
    if (answer((await r?.json().catch(() => null)) as Answer, `${email} adresine davet gönderildi.`)) {
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
    answer((await r?.json().catch(() => null)) as Answer, `${m.email} adresine davet yeniden gönderildi.`);
    setBusy(false);
  };

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader title="Kişi Davet Edin" action={!emailReady ? <span className="text-[12px] text-muted">E-posta servisi bağlı değil: bağlantıyı kopyalayıp iletirsiniz</span> : undefined} />
        <form className="grid gap-3 p-4 sm:grid-cols-2" onSubmit={invite}>
          <label className="grid gap-1 text-[14px]">
            <span className="text-muted">Ad Soyad</span>
            <Input required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="grid gap-1 text-[14px]">
            <span className="text-muted">E-posta</span>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="grid gap-1 text-[14px] sm:col-span-2">
            <span className="text-muted">Rol</span>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="min-h-10 rounded-[9px] border border-line bg-surface px-3 text-[14px] text-ink">
              <option value="uye">Ekip üyesi (seçtiğiniz modüller)</option>
              <option value="yonetici">İşletme yöneticisi (tüm modüller, ekibi yönetir)</option>
            </select>
          </label>
          {role === "uye" ? (
            <fieldset className="m-0 flex flex-wrap gap-2 border-0 p-0 sm:col-span-2">
              <legend className="mb-1 p-0 text-[14px] text-muted">Modüller</legend>
              {modules.map((m) => {
                const on = mods.includes(m.value);
                return (
                  <label key={m.value} className={cn("inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border px-3 text-[14px]", on ? "border-accent bg-accent-soft text-ink" : "border-line text-muted")}>
                    <input type="checkbox" className="sr-only" checked={on} onChange={(e) => setMods((x) => (e.target.checked ? [...x, m.value] : x.filter((v) => v !== m.value)))} />
                    {m.label}
                  </label>
                );
              })}
            </fieldset>
          ) : null}
          {role === "uye" ? (
            <label className="grid gap-1 text-[14px] sm:col-span-2">
              <span className="text-muted">Görünürlük</span>
              <select value={scope} onChange={(e) => setScope(e.target.value)} className="min-h-10 rounded-[9px] border border-line bg-surface px-3 text-[14px] text-ink">
                <option value="hepsi">Tüm kayıtlar</option>
                <option value="kendi">Yalnız kendi kayıtları (sorumlusu olduğu fırsat ve teklifler)</option>
              </select>
            </label>
          ) : null}
          <div className="sm:col-span-2">
            <Button type="submit" variant="primary" disabled={busy}>
              {busy ? "Gönderiliyor…" : "Davet et"}
            </Button>
          </div>
          {link ? (
            <div className="flex min-w-0 items-center gap-2 rounded-[10px] border border-line bg-sunken p-2 pl-3 sm:col-span-2">
              <code className="min-w-0 flex-1 overflow-x-auto font-mono text-[12px] whitespace-nowrap">{link}</code>
              <Button type="button" size="sm" onClick={() => void navigator.clipboard.writeText(link).then(() => toast.success("Bağlantı kopyalandı."))}>
                Kopyala
              </Button>
            </div>
          ) : null}
        </form>
      </Card>

      {orphans.length ? (
        <Card>
          <CardHeader title="İşletmeye Eklenmemiş Kullanıcılar" />
          <p className="mx-4 mt-0 mb-2 text-[13px] text-muted">Bu hesaplar hiçbir işletmede değil; girince hiçbir şey göremezler. Kullanıcıyı açıp İşletmeler bölümüne satır ekleyin ya da Guru yöneticisi yapın.</p>
          <ul className="m-0 grid list-none gap-0 p-0">
            {orphans.map((o) => (
              <li key={o.id} className="border-t border-line">
                <Link href={`/panel/duzenle/users/${o.id}`} className="flex min-h-12 items-center gap-3 px-4 py-2 text-ink no-underline hover:bg-sunken">
                  <span className="min-w-0 flex-1 truncate font-medium">{o.name}</span>
                  <span className="hidden truncate text-[13px] text-muted sm:inline">{o.email}</span>
                  <Badge tone="warn">İşletmesi yok</Badge>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card>
        <CardHeader title="Ekip" />
        <ul className="m-0 grid list-none gap-0 p-0">
          {members.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line px-4 py-3">
              <div className="min-w-0 flex-1 basis-[220px]">
                <div className="truncate font-medium text-ink">
                  {m.name} {m.self ? <span className="text-[13px] font-normal text-muted">(siz)</span> : null}
                </div>
                <div className="truncate text-[13px] text-muted">
                  {m.email} · {m.role === "guru" ? "Guru yöneticisi (tüm işletmeler)" : m.role === "yonetici" ? "İşletme yöneticisi" : m.modules.length ? m.modules.map(label).join(", ") : "Modül verilmedi"}
                  {m.role === "uye" && m.ownOnly ? " · yalnız kendi kayıtları" : ""}
                </div>
              </div>
              {m.pending ? (
                <>
                  <Badge tone="info">Davet bekliyor</Badge>
                  <Button type="button" size="sm" disabled={busy} onClick={() => resend(m)}>
                    Yeniden gönder
                  </Button>
                </>
              ) : null}
              {(canEditUsers || !m.self) && (m.role !== "guru" || canEditUsers) ? (
                <Button asChild size="sm" variant="ghost">
                  <Link href={`/panel/duzenle/users/${m.id}`}>Yetkiyi düzenle</Link>
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
