"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardHeader } from "../ui/card";
import { changePassword, updateAccount } from "./actions";

export function AccountForms({ name: n0, email: e0 }: { name: string; email: string }) {
  const router = useRouter();
  const [name, setName] = useState(n0);
  const [email, setEmail] = useState(e0);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [cur, setCur] = useState("");
  const [cur2, setCur2] = useState("");
  const [pending, start] = useTransition();
  const label = "grid gap-1 text-[14px]";

  return (
    <div className="grid max-w-[640px] gap-4">
      <Card>
        <CardHeader title="Bilgileriniz" />
        <form
          className="grid gap-3 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              const r = await updateAccount({ name, email, current: cur2 });
              if (!r.ok) return void toast.error(r.error);
              setCur2("");
              toast.success(email !== e0 ? "Kaydedildi. Eski adresinize bilgilendirme e-postası gitti." : "Kaydedildi.");
              router.refresh();
            });
          }}
        >
          <label className={label}>
            <span className="text-muted">Ad Soyad</span>
            <Input required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </label>
          <label className={label}>
            <span className="text-muted">E-posta</span>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            <span className="text-[12px] text-muted">Girişte ve parola yenileme e-postasında bu adres kullanılır.</span>
          </label>
          {email.trim().toLowerCase() !== e0.toLowerCase() ? (
            <label className={label}>
              <span className="text-muted">Mevcut parolanız</span>
              <Input type="password" required value={cur2} onChange={(e) => setCur2(e.target.value)} autoComplete="current-password" />
              <span className="text-[12px] text-muted">E-posta adresini değiştirmek için mevcut parolanızı yazın.</span>
            </label>
          ) : null}
          <div>
            <Button type="submit" variant="primary" disabled={pending || (name === n0 && email === e0)}>
              Kaydet
            </Button>
          </div>
        </form>
      </Card>
      <Card>
        <CardHeader title="Parola" />
        <form
          className="grid gap-3 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (pw !== pw2) return void toast.error("İki parola aynı değil.");
            start(async () => {
              const r = await changePassword(pw, cur);
              if (!r.ok) return void toast.error(r.error);
              setPw("");
              setPw2("");
              setCur("");
              toast.success("Parolanız değişti. Diğer cihazlardaki oturumlar kapatıldı.");
            });
          }}
        >
          <label className={label}>
            <span className="text-muted">Mevcut parola</span>
            <Input type="password" required value={cur} onChange={(e) => setCur(e.target.value)} autoComplete="current-password" />
          </label>
          <label className={label}>
            <span className="text-muted">Yeni parola</span>
            <Input type="password" required minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" />
          </label>
          <label className={label}>
            <span className="text-muted">Yeni parola (tekrar)</span>
            <Input type="password" required minLength={8} value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" />
            <span className="text-[12px] text-muted">En az 8 karakter.</span>
          </label>
          <div>
            <Button type="submit" variant="primary" disabled={pending || !pw || !cur}>
              Parolayı değiştir
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
