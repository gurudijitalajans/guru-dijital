"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import { Dialog } from "radix-ui";
import { Plus, Search, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge, type Tone } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Sheet, SheetSection } from "../ui/sheet";
import { createProject, createTask, updateProject } from "./actions";

export type ProjectRow = { id: number; title: string; status: string; who: string; owner: string; due: string | null; late: boolean; total: number; done: number; lateTasks: number };
export type ProjectDetail = {
  id: number;
  title: string;
  status: string;
  who: string;
  owner: number | null;
  ownerName: string;
  deal: { id: number; title: string } | null;
  startDate: string;
  dueDate: string;
  description: string;
  tasks: { id: number; code: string; title: string; stage: string; due: string | null; late: boolean; assignee: string }[];
};
type Opt = { id: number; name?: string; title?: string };

const STATUS: Record<string, [Tone, string]> = { aktif: ["info", "Sürüyor"], beklemede: ["warn", "Beklemede"], tamamlandi: ["good", "Tamamlandı"], iptal: ["plain", "İptal"] };
const STAGE: Record<string, string> = { yapilacak: "Yapılacak", devam: "Devam", kontrol: "Kontrol", tamam: "Tamam" };
const dFmt = new Intl.DateTimeFormat("tr-TR", { timeZone: "UTC", day: "numeric", month: "short" });
const fmt = (d: string | null) => (d ? dFmt.format(new Date(`${d}T12:00:00Z`)) : "");
const field = "block w-full rounded-[9px] border border-line bg-surface px-3 min-h-10 text-[14px] pointer-coarse:text-[16px] text-ink focus:border-accent focus:outline-none";

export function ProjectsView({ rows, detail, team, templates, deals, me, startNew, fromDeal }: { rows: ProjectRow[]; detail: ProjectDetail | null; team: Opt[]; templates: Opt[]; deals: Opt[]; me: number; startNew: boolean; fromDeal: number | null }) {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const [status, setStatus] = useState("aktif");
  const [q, setQ] = useState("");
  const [creating, setCreating] = useState(startNew);
  const setParams = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v) next.set(k, v);
        else next.delete(k);
      }
      router.push(`${path}${next.toString() ? `?${next}` : ""}`, { scroll: false });
    },
    [params, path, router],
  );
  const term = q.trim().toLocaleLowerCase("tr-TR");
  const visible = useMemo(() => rows.filter((r) => (!status || r.status === status) && (!term || `${r.title} ${r.who}`.toLocaleLowerCase("tr-TR").includes(term))), [rows, status, term]);
  const count = (s: string) => rows.filter((r) => r.status === s).length;

  return (
    <>
      <div className="mb-3.5 flex flex-wrap items-center gap-2">
        <label className="relative min-w-[180px] flex-1 sm:max-w-[300px]">
          <span className="sr-only">Proje ara</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <Input id="proje-ara" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Proje ya da firma ara" className="w-full pl-9" />
        </label>
        {[...Object.entries(STATUS).map(([k, [, l]]) => [k, `${l} (${count(k)})`]), ["", `Tümü (${rows.length})`]].map(([k, l]) => (
          <button key={k || "tumu"} type="button" aria-pressed={status === k} onClick={() => setStatus(k)} className={cn("min-h-8.5 pointer-coarse:min-h-11 rounded-full border border-line px-3 text-[13px]", status === k ? "border-accent bg-accent-soft text-accent" : "hover:border-accent")}>
            {l}
          </button>
        ))}
        <Button variant="primary" className="ml-auto" onClick={() => setCreating(true)}>
          <Plus /> Yeni proje
        </Button>
      </div>

      {visible.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((p) => {
            const pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
            const [tone, label] = STATUS[p.status] ?? ["plain", p.status];
            return (
              <button key={p.id} type="button" onClick={() => setParams({ proje: String(p.id) })} className="grid min-w-0 gap-2 rounded-card border border-line bg-surface p-4 text-left hover:border-accent">
                <span className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block font-semibold text-ink">{p.title}</span>
                    <span className="block truncate text-[13px] text-muted">{[p.who, p.owner].filter(Boolean).join(" · ") || "İç proje"}</span>
                  </span>
                  <Badge tone={tone}>{label}</Badge>
                </span>
                <span className="block">
                  <span className="flex justify-between text-[13px] text-muted">
                    <span className="tabular">
                      {p.done}/{p.total} görev
                    </span>
                    <span className="tabular">%{pct}</span>
                  </span>
                  <span className="mt-1 block h-2 overflow-hidden rounded-full bg-sunken">
                    <span className={cn("block h-full rounded-full", pct === 100 ? "bg-good" : "bg-accent")} style={{ width: `${pct}%` }} />
                  </span>
                </span>
                <span className="flex flex-wrap gap-1.5">
                  {p.due ? <Badge tone={p.late ? "bad" : "plain"}>{p.late ? `Teslim geçti · ${fmt(p.due)}` : `Teslim ${fmt(p.due)}`}</Badge> : null}
                  {p.total - p.done > 0 && p.status === "aktif" ? <Badge>{p.total - p.done} açık görev</Badge> : null}
                  {p.lateTasks && p.status === "aktif" ? <Badge tone="bad">{p.lateTasks} geciken görev</Badge> : null}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="rounded-card border border-line bg-surface px-4 py-6 text-muted">{q || status !== "aktif" ? "Bu süzgeçte proje yok." : "Süren proje yok. Kazanılan fırsattan ya da Yeni proje ile açın."}</p>
      )}

      <NewProject
        open={creating}
        onOpenChange={(o) => {
          setCreating(o);
          if (!o && (params.get("yeni") || params.get("firsat"))) setParams({ yeni: null, firsat: null });
        }}
        team={team}
        templates={templates}
        deals={deals}
        me={me}
        fromDeal={fromDeal}
        onSaved={(id) => setParams({ proje: String(id), yeni: null, firsat: null })}
      />
      <ProjectSheet detail={detail} team={team} onClose={() => setParams({ proje: null })} />
    </>
  );
}

function NewProject({ open, onOpenChange, team, templates, deals, me, fromDeal, onSaved }: { open: boolean; onOpenChange: (o: boolean) => void; team: Opt[]; templates: Opt[]; deals: Opt[]; me: number; fromDeal: number | null; onSaved: (id: number) => void }) {
  const router = useRouter();
  const blank = { title: "", deal: fromDeal ? String(fromDeal) : "", template: templates[0] ? String(templates[0].id) : "", startDate: "", dueDate: "", owner: team.some((m) => m.id === me) ? String(me) : "" };
  const [f, setF] = useState(blank);
  const [pending, start] = useTransition();
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const r = await createProject({ title: f.title, deal: f.deal ? Number(f.deal) : null, template: f.template ? Number(f.template) : null, startDate: f.startDate || null, dueDate: f.dueDate || null, owner: f.owner ? Number(f.owner) : null });
      if (!r.ok || !r.id) return void toast.error(r.error ?? "Proje açılamadı.");
      toast.success(f.template ? "Proje açıldı; şablonun adımları görev olarak eklendi." : "Proje açıldı.");
      onOpenChange(false);
      setF(blank);
      router.refresh();
      onSaved(r.id);
    });
  };
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[90dvh] w-[min(520px,calc(100%-32px))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[12px] border border-line bg-surface p-5 shadow-pop focus:outline-none">
          <div className="flex items-start justify-between gap-3">
            <Dialog.Title className="m-0 text-[18px] font-semibold text-ink">Yeni proje</Dialog.Title>
            <Dialog.Close className="grid size-10 place-items-center rounded-[9px] text-muted hover:bg-sunken" aria-label="Kapat">
              <X className="size-5" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="mt-1 mb-0 text-[14px] text-muted">Fırsat seçerseniz ad, kişi ve firma fırsattan gelir. Şablon seçerseniz adımları görev olarak eklenir.</Dialog.Description>
          <form onSubmit={submit} className="mt-3 grid gap-3">
            {deals.length ? (
              <label className="grid gap-1 text-[13px] text-muted">
                Fırsat
                <select id="yeni-proje-firsat" value={f.deal} onChange={(e) => setF({ ...f, deal: e.target.value })} className={field}>
                  <option value="">Fırsat yok (iç proje)</option>
                  {deals.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <label className="grid gap-1 text-[13px] text-muted">
              Proje adı{f.deal ? " (boşsa fırsatın adı)" : ""}
              <input id="yeni-proje-ad" required={!f.deal} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Web sitesi yenileme · Firma adı" className={field} />
            </label>
            <label className="grid gap-1 text-[13px] text-muted">
              Süreç şablonu
              <select id="yeni-proje-sablon" value={f.template} onChange={(e) => setF({ ...f, template: e.target.value })} className={field}>
                <option value="">Şablon yok (görevleri kendim eklerim)</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1 text-[13px] text-muted">
                Başlangıç
                <input id="yeni-proje-baslangic" type="date" value={f.startDate} onChange={(e) => setF({ ...f, startDate: e.target.value })} className={field} />
              </label>
              <label className="grid gap-1 text-[13px] text-muted">
                Teslim{f.template ? " (boşsa şablondan)" : ""}
                <input id="yeni-proje-teslim" type="date" value={f.dueDate} onChange={(e) => setF({ ...f, dueDate: e.target.value })} className={field} />
              </label>
            </div>
            <label className="grid gap-1 text-[13px] text-muted">
              Sorumlu
              <select id="yeni-proje-sorumlu" value={f.owner} onChange={(e) => setF({ ...f, owner: e.target.value })} className={field}>
                {team.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="mt-1 flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button type="button">Vazgeç</Button>
              </Dialog.Close>
              <Button type="submit" variant="primary" disabled={pending || (!f.title.trim() && !f.deal)}>
                Projeyi aç
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ProjectSheet({ detail, team, onClose }: { detail: ProjectDetail | null; team: Opt[]; onClose: () => void }) {
  const router = useRouter();
  const [busy, start] = useTransition();
  const [edit, setEdit] = useState<null | { title: string; dueDate: string; owner: string; description: string }>(null);
  const [task, setTask] = useState({ title: "", assignee: "" });
  const [forId, setForId] = useState<number | null>(null);
  if ((detail?.id ?? null) !== forId) {
    setForId(detail?.id ?? null);
    setEdit(null);
    setTask({ title: "", assignee: "" });
  }
  const run = (job: () => Promise<{ ok: boolean; error?: string }>, done: string, after?: () => void) =>
    start(async () => {
      const r = await job();
      if (!r.ok) return void toast.error(r.error ?? "Kaydedilemedi.");
      toast.success(done);
      after?.();
      router.refresh();
    });
  const open = detail ? detail.tasks.filter((t) => t.stage !== "tamam") : [];
  const done = detail ? detail.tasks.length - open.length : 0;

  return (
    <Sheet open={Boolean(detail)} onOpenChange={(o) => !o && onClose()} title={detail?.title ?? ""} description={detail ? [detail.who, detail.ownerName].filter(Boolean).join(" · ") || "İç proje" : undefined}>
      {detail ? (
        <>
          <SheetSection title="Durum">
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Durum">
              {Object.entries(STATUS).map(([k, [, l]]) => (
                <Button key={k} size="sm" variant={detail.status === k ? "primary" : "secondary"} aria-pressed={detail.status === k} disabled={busy} onClick={() => detail.status !== k && run(() => updateProject(detail.id, { status: k }), `Durum: ${l}`)}>
                  {l}
                </Button>
              ))}
            </div>
          </SheetSection>

          {edit ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                run(() => updateProject(detail.id, { title: edit.title, dueDate: edit.dueDate || null, owner: edit.owner ? Number(edit.owner) : null, description: edit.description }), "Kaydedildi.", () => setEdit(null));
              }}
              className="mt-5 grid gap-3 rounded-card border border-line p-3"
            >
              <label className="grid gap-1 text-[13px] text-muted">
                Proje adı
                <input id="proje-ad" required value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} className={field} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1 text-[13px] text-muted">
                  Teslim
                  <input id="proje-teslim" type="date" value={edit.dueDate} onChange={(e) => setEdit({ ...edit, dueDate: e.target.value })} className={field} />
                </label>
                <label className="grid gap-1 text-[13px] text-muted">
                  Sorumlu
                  <select id="proje-sorumlu" value={edit.owner} onChange={(e) => setEdit({ ...edit, owner: e.target.value })} className={field}>
                    <option value="">Atanmadı</option>
                    {team.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="grid gap-1 text-[13px] text-muted">
                Kapsam ve notlar
                <textarea id="proje-not" rows={4} value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} className={cn(field, "py-2")} />
              </label>
              <div className="flex justify-end gap-2">
                <Button type="button" size="sm" onClick={() => setEdit(null)}>
                  Vazgeç
                </Button>
                <Button type="submit" size="sm" variant="primary" disabled={busy}>
                  Kaydet
                </Button>
              </div>
            </form>
          ) : (
            <SheetSection title="Bilgiler">
              <dl className="m-0 grid grid-cols-[110px_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-[14px]">
                {(
                  [
                    ["Sorumlu", detail.ownerName || "Atanmadı"],
                    ["Başlangıç", fmt(detail.startDate || null) || "Yok"],
                    ["Teslim", fmt(detail.dueDate || null) || "Yok"],
                    ["İlerleme", `${done}/${detail.tasks.length} görev`],
                  ] as [string, string][]
                ).map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-muted">{k}</dt>
                    <dd className="m-0 text-ink">{v}</dd>
                  </div>
                ))}
                {detail.deal ? (
                  <div className="contents">
                    <dt className="text-muted">Fırsat</dt>
                    <dd className="m-0">
                      <Link href={`/panel/firsatlar?firsat=${detail.deal.id}`} className="text-accent">
                        {detail.deal.title}
                      </Link>
                    </dd>
                  </div>
                ) : null}
              </dl>
              {detail.description ? <p className="mt-3 mb-0 whitespace-pre-wrap text-[14px] text-ink">{detail.description}</p> : null}
              <Button size="sm" className="mt-3" onClick={() => setEdit({ title: detail.title, dueDate: detail.dueDate, owner: detail.owner ? String(detail.owner) : "", description: detail.description })}>
                Düzenle
              </Button>
            </SheetSection>
          )}

          <SheetSection title={`Görevler (${open.length} açık)`}>
            {detail.tasks.length ? (
              <ul className="m-0 list-none p-0">
                {detail.tasks.map((t) => (
                  <li key={t.id}>
                    <Link href={`/panel/gorevler?gorev=${t.id}`} className="flex min-h-11 items-center gap-2 rounded-[8px] px-2 no-underline hover:bg-sunken">
                      <span className="min-w-0 flex-1">
                        <span className={cn("block truncate text-[14px]", t.stage === "tamam" ? "text-muted line-through" : "text-ink")}>
                          <span className="font-mono text-[12px] text-muted">{t.code}</span> {t.title}
                        </span>
                        <span className="block truncate text-[12px] text-muted">{[t.assignee, t.due ? `teslim ${fmt(t.due)}` : null].filter(Boolean).join(" · ")}</span>
                      </span>
                      <Badge tone={t.late ? "bad" : t.stage === "tamam" ? "good" : "plain"}>{t.late ? "Gecikti" : STAGE[t.stage]}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="m-0 text-[14px] text-muted">Görev yok.</p>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!task.title.trim()) return;
                run(() => createTask({ title: task.title, project: detail.id, assignee: task.assignee ? Number(task.assignee) : (detail.owner ?? null) }), "Görev eklendi.", () => setTask({ title: "", assignee: "" }));
              }}
              className="mt-3 flex flex-wrap items-end gap-2"
            >
              <label className="min-w-[160px] flex-1">
                <span className="sr-only">Yeni görev</span>
                <input id="proje-yeni-gorev" value={task.title} onChange={(e) => setTask({ ...task, title: e.target.value })} placeholder="Yeni görev" className={field} />
              </label>
              <label>
                <span className="sr-only">Sorumlu</span>
                <select id="proje-yeni-gorev-sorumlu" value={task.assignee} onChange={(e) => setTask({ ...task, assignee: e.target.value })} className={cn(field, "w-auto")}>
                  <option value="">Proje sorumlusu</option>
                  {team.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </label>
              <Button type="submit" size="sm" variant="primary" disabled={busy || !task.title.trim()}>
                Ekle
              </Button>
            </form>
          </SheetSection>
        </>
      ) : null}
    </Sheet>
  );
}
