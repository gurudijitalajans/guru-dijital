"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { Where } from "payload";
import { getPanelContext, TENANT_COOKIE } from "./context";

/** İşletme seçici: yalnız kullanıcının işletmelerinden biri seçilebilir (Payload panelindeki seçiciyle aynı çerez) */
export async function selectTenant(id: number): Promise<{ ok: boolean; name?: string }> {
  const ctx = await getPanelContext();
  const t = ctx.tenants.find((x) => x.id === Number(id));
  if (!t) return { ok: false };
  (await cookies()).set(TENANT_COOKIE, String(t.id), { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/panel", "layout");
  return { ok: true, name: t.name };
}

export type SearchHit = { id: string; label: string; detail?: string; group: string; href: string };

/** Komut paleti araması: seçili işletmenin kayıtlarında, kullanıcının yetkisiyle */
export async function searchPanel(q: string): Promise<SearchHit[]> {
  const term = q.trim().slice(0, 80);
  if (term.length < 2) return [];
  const ctx = await getPanelContext();
  const like = (field: string): Where => ({ [field]: { like: term } });
  const jobs: Promise<SearchHit[]>[] = [];
  if (ctx.has("crm")) {
    jobs.push(
      ctx.find("contacts", { where: { or: [like("name"), like("email"), like("phone")] }, limit: 6, depth: 1 }).then((r) =>
        r.docs.map((d) => {
          const c = d as { id: number; name: string; email?: string | null; company?: { name?: string } | number | null };
          return { id: `p${c.id}`, label: c.name, detail: [typeof c.company === "object" ? c.company?.name : null, c.email].filter(Boolean).join(" · "), group: "Kişi", href: `/panel/kisiler?kisi=${c.id}` };
        }),
      ),
      ctx.find("companies", { where: like("name"), limit: 4 }).then((r) =>
        r.docs.map((d) => {
          const c = d as { id: number; name: string; sector?: string | null };
          return { id: `c${c.id}`, label: c.name, detail: c.sector ?? undefined, group: "Firma", href: `/panel/kisiler?firma=${c.id}` };
        }),
      ),
      ctx.find("deals", { where: like("title"), limit: 5 }).then((r) =>
        r.docs.map((d) => {
          const c = d as { id: number; title: string };
          return { id: `d${c.id}`, label: c.title, group: "Fırsat", href: `/panel/firsatlar?firsat=${c.id}` };
        }),
      ),
    );
  }
  if (ctx.has("ops")) {
    jobs.push(
      ctx.find("tasks", { where: like("title"), limit: 5 }).then((r) =>
        r.docs.map((d) => {
          const c = d as { id: number; title: string; seq?: number | null };
          return { id: `t${c.id}`, label: c.title, detail: c.seq ? `G-${c.seq}` : undefined, group: "Görev", href: `/panel/gorevler?gorev=${c.id}` };
        }),
      ),
      ctx.find("projects", { where: like("title"), limit: 4 }).then((r) =>
        r.docs.map((d) => {
          const c = d as { id: number; title: string };
          return { id: `j${c.id}`, label: c.title, group: "Proje", href: `/admin/collections/projects/${c.id}` };
        }),
      ),
    );
  }
  const all = await Promise.all(jobs.map((j) => j.catch(() => [] as SearchHit[])));
  return all.flat();
}
