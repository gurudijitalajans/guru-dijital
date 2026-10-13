"use server";

import type { PayloadRequest } from "payload";
import { headers } from "next/headers";
import { cms } from "@/lib/cms";
import { getPanelContext } from "../context";

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

export async function updateAccount(d: { name: string; email: string }): Promise<Result> {
  try {
    const { ctx, payload, opts } = await me();
    const name = d.name.trim().slice(0, 120);
    const email = d.email.trim().toLowerCase();
    if (!name) return { ok: false, error: "Adınızı yazın." };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Geçerli bir e-posta yazın." };
    await payload.update({ collection: "users", id: ctx.user.id, data: { name, email }, ...opts });
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function changePassword(password: string): Promise<Result> {
  try {
    if (password.length < 8) return { ok: false, error: "Parola en az 8 karakter olmalı." };
    const { ctx, payload, opts } = await me();
    await payload.update({ collection: "users", id: ctx.user.id, data: { password } as never, ...opts });
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
