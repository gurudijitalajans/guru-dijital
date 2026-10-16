"use server";

import { pbkdf2, timingSafeEqual } from "crypto";
import type { PayloadRequest } from "payload";
import { headers } from "next/headers";
import { cms } from "@/lib/cms";
import { getPanelContext } from "../context";
import { sessionLost } from "../errors";
import { sendNotice } from "@/payload/notify";

/** Kullanıcının kendi hesabı: ad, e-posta, parola (Payload'un kuralıyla) */
type Result = { ok: boolean; error?: string };
const fail = (e: unknown): Result => {
  const err = e as { message?: string; data?: { errors?: { message?: string }[] } };
  return { ok: false, error: err.data?.errors?.[0]?.message ?? (err.message || "Kaydedilemedi.") };
};

async function me() {
  const ctx = await getPanelContext();
  const payload = await cms();
  const req = { headers: await headers(), user: ctx.user } as unknown as Partial<PayloadRequest>;
  return { ctx, payload, opts: { user: ctx.user, req, overrideAccess: false } as const };
}

/* Payload'un parola özeti: "pbkdf2-sha256-v1:" önekli yeni biçim (600.000 tur, 32 bayt) ya da eski biçim (25.000 tur, 512 bayt) */
const PREFIX = "pbkdf2-sha256-v1:";
async function passwordMatches(payload: Awaited<ReturnType<typeof cms>>, id: number, password: string) {
  if (!password) return false;
  const doc = (await payload.findByID({ collection: "users", id, depth: 0, showHiddenFields: true, overrideAccess: true })) as unknown as { hash?: string; salt?: string };
  if (!doc.hash || !doc.salt) return false;
  const current = doc.hash.startsWith(PREFIX);
  const stored = Buffer.from(current ? doc.hash.slice(PREFIX.length) : doc.hash, "hex");
  const got = await new Promise<Buffer | null>((res) => pbkdf2(password, doc.salt!, current ? 600000 : 25000, current ? 32 : 512, "sha256", (e, b) => res(e ? null : b)));
  return Boolean(got && got.length === stored.length && timingSafeEqual(got, stored));
}
const WRONG = "Mevcut parolanız doğru değil.";

export async function updateAccount(d: { name: string; email: string; current?: string }): Promise<Result> {
  try {
    const { ctx, payload, opts } = await me();
    const name = d.name.trim().slice(0, 120);
    const email = d.email.trim().toLowerCase();
    if (!name) return { ok: false, error: "Adınızı yazın." };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Geçerli bir e-posta yazın." };
    /* E-posta değişikliği hesabı devralmaya açık kapıdır: mevcut parola istenir, eski adrese haber gider */
    const emailChanged = email !== String(ctx.user.email).toLowerCase();
    if (emailChanged && !(await passwordMatches(payload, ctx.user.id, d.current ?? ""))) return { ok: false, error: WRONG };
    await payload.update({ collection: "users", id: ctx.user.id, data: { name, email }, ...opts });
    if (emailChanged)
      await sendNotice(opts.req as PayloadRequest, ctx.user.email, {
        subject: "Guru Panel e-posta adresiniz değişti",
        intro: `Guru Panel hesabınızın giriş adresi ${email} olarak değiştirildi. Bunu siz yapmadıysanız hemen yöneticinizle ya da Guru Dijital ile iletişime geçin.`,
        rows: [],
        path: "/giris",
      }).catch(() => null);
    return { ok: true };
  } catch (e) {
    const lost = sessionLost(e);
    if (lost) return lost as never;
    return fail(e);
  }
}

export async function changePassword(password: string, current: string): Promise<Result> {
  try {
    if (password.length < 8) return { ok: false, error: "Parola en az 8 karakter olmalı." };
    const { ctx, payload, opts } = await me();
    if (!(await passwordMatches(payload, ctx.user.id, current))) return { ok: false, error: WRONG };
    await payload.update({ collection: "users", id: ctx.user.id, data: { password } as never, ...opts });
    await sendNotice(opts.req as PayloadRequest, ctx.user.email, {
      subject: "Guru Panel parolanız değişti",
      intro: "Guru Panel parolanız az önce değiştirildi. Bunu siz yapmadıysanız giriş ekranındaki Parolamı unuttum bağlantısıyla hemen yeni parola belirleyin.",
      rows: [],
      path: "/parola-sifirla",
    }).catch(() => null);
    return { ok: true };
  } catch (e) {
    const lost = sessionLost(e);
    if (lost) return lost as never;
    return fail(e);
  }
}
