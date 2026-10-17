"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Dialog } from "radix-ui";
import { CheckSquare, MessageSquare, Plus, Repeat, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge, type Tone } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { DataTable } from "../ui/data-table";
import { Sheet, SheetSection } from "../ui/sheet";
import { addTaskComment, createTask, deleteTask, deleteTaskComment, moveTask, setChecklist, toggleCheck, updateTask } from "./actions";

export type BoardTask = { id: number; code: string; title: string; stage: string; order: number | null; priority: string; due: string | null; late: boolean; hours: number | null; assignee: number | null; assigneeName: string; project: number | null; projectTitle: string; checks: [number, number]; updatedAt: string; repeat?: string | null };
const REPEAT_LABEL: Record<string, string> = { haftalik: "Her hafta", "iki-haftalik": "İki haftada bir", aylik: "Her ay" };
export type TaskDetail = { id: number; code: string; title: string; stage: string; priority: string; startDate: string; dueDate: string; hours: number | null; assignee: number | null; project: number | null; projectTitle: string; description: string; checklist: { text: string; done: boolean }[]; late: boolean; repeat: string; comments: { id: number; text: string; author: string; at: string; mine: boolean }[] };
type Option = { id: number; name?: string; title?: string };

const STAGES = [
  { id: "yapilacak", label: "Yapılacak" },
  { id: "devam", label: "Devam" },
  { id: "kontrol", label: "Kontrol" },
  { id: "tamam", label: "Tamam" },
];
const LABEL = Object.fromEntries(STAGES.map((s) => [s.id, s.label]));
const PRIO: Record<string, [Tone, string]> = { dusuk: ["plain", "Düşük"], normal: ["plain", "Normal"], yuksek: ["warn", "Yüksek"], acil: ["bad", "Acil"] };
const dayFmt = new Intl.DateTimeFormat("tr-TR", { timeZone: "UTC", day: "numeric", month: "short" });
const fmtDay = (d: string | null) => (d ? dayFmt.format(new Date(`${d}T12:00:00Z`)) : "");
const byOrder = (a: BoardTask, b: BoardTask) => (a.order ?? Infinity) - (b.order ?? Infinity) || (a.due ?? "9").localeCompare(b.due ?? "9");
const initials = (n: string) =>
  n
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toLocaleUpperCase("tr-TR"))
    .join("");
const field = "block w-full rounded-[9px] border border-line bg-surface px-3 min-h-10 text-[14px] pointer-coarse:text-[16px] text-ink focus:border-accent focus:outline-none";

export function TasksView({ tasks: initial, detail, me, team, projects, canDelete = false, initialView }: { tasks: BoardTask[]; detail: TaskDetail | null; me: number; team: Option[]; projects: Option[]; canDelete?: boolean; initialView: "pano" | "liste" }) {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const [tasks, setTasks] = useState(initial);
  const [synced, setSynced] = useState(initial);
  if (synced !== initial) {
    setSynced(initial);
    setTasks(initial);
  }
  const [view, setView] = useState(initialView);
  const [q, setQ] = useState("");
  const [mine, setMine] = useState(false);
  const [lateOnly, setLateOnly] = useState(false);
  const [project, setProject] = useState<string>("");
  const [dragId, setDragId] = useState<number | null>(null);
  const [over, setOver] = useState<string | null>(null);
  /* ?yeni=1 (ör. telefondaki "+" menüsü) yeni kayıt penceresini açık getirir */
  const yeni = params.get("yeni") === "1";
  const [creating, setCreating] = useState(yeni);
  /* Aynı sayfadayken adrese ?yeni=1 eklenirse de pencere açılır */
  const [prevYeni, setPrevYeni] = useState(yeni);
  if (yeni !== prevYeni) {
    setPrevYeni(yeni);
    if (yeni) setCreating(true);
  }
  const [pending, start] = useTransition();

  const setParam = useCallback(
    (k: string, v: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (v) next.set(k, v);
      else next.delete(k);
      router.push(`${path}${next.toString() ? `?${next}` : ""}`, { scroll: false });
    },
    [params, path, router],
  );
  const pickView = (v: "pano" | "liste") => {
    setView(v);
    const next = new URLSearchParams(params.toString());
    if (v === "liste") next.set("gorunum", "liste");
    else next.delete("gorunum");
    window.history.replaceState(null, "", `${path}${next.toString() ? `?${next}` : ""}`);
  };

  const term = q.trim().toLocaleLowerCase("tr-TR");
  const visible = useMemo(
    () => tasks.filter((t) => (!term || `${t.code} ${t.title} ${t.projectTitle}`.toLocaleLowerCase("tr-TR").includes(term)) && (!mine || t.assignee === me) && (!lateOnly || t.late) && (!project || String(t.project) === project)),
    [tasks, term, mine, me, lateOnly, project],
  );

  const move = (id: number, stage: string, beforeId: number | null) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const col = tasks.filter((t) => t.stage === stage && t.id !== id).sort(byOrder);
    const at = beforeId ? Math.max(0, col.findIndex((t) => t.id === beforeId)) : col.length;
    const prev = col[at - 1]?.order ?? (col[at] ? (col[at].order ?? at) - 1 : 0);
    const next = col[at]?.order ?? prev + 2;
    const order = (prev + next) / 2;
    if (task.stage === stage && task.order === order) return;
    /* Kural ekranda da: Tamam'a yalnız Kontrol'den ve liste bitince */
    if (stage === "tamam" && task.stage !== "tamam") {
      if (task.stage !== "kontrol") return void toast.error("Görev Tamam'a yalnız Kontrol aşamasından geçer. Önce Kontrol'e alın.");
      if (task.checks[1] && task.checks[0] < task.checks[1]) return void toast.error(`Kontrol listesinde ${task.checks[1] - task.checks[0]} madde açık. Hepsi işaretlenince Tamam'a geçebilir.`);
    }
    const before = tasks;
    setTasks((list) => list.map((t) => (t.id === id ? { ...t, stage, order, late: stage === "tamam" ? false : t.late } : t)));
    start(async () => {
      const r = await moveTask(id, stage, order);
      if (!r.ok) {
        setTasks(before);
        return void toast.error(r.error ?? "Taşınamadı.");
      }
      if (task.stage !== stage) toast.success(`${task.code} ${LABEL[stage]}`);
      router.refresh();
    });
  };
  const onDrop = (stage: string, beforeId: number | null) => {
    if (dragId !== null) move(dragId, stage, beforeId);
    setDragId(null);
    setOver(null);
  };

  const listCols: ColumnDef<BoardTask, unknown>[] = [
    { accessorKey: "code", header: "Kod", cell: ({ getValue }) => <span className="font-mono text-[12px] text-muted">{getValue() as string}</span> },
    { accessorKey: "title", header: "Görev", cell: ({ getValue }) => <span className="font-medium text-ink">{getValue() as string}</span> },
    { accessorKey: "projectTitle", header: "Proje" },
    { accessorKey: "assigneeName", header: "Sorumlu", cell: ({ getValue }) => (getValue() as string) || <span className="text-muted">Atanmadı</span> },
    { accessorKey: "stage", header: "Aşama", cell: ({ getValue }) => <Badge tone={getValue() === "tamam" ? "good" : "plain"}>{LABEL[getValue() as string]}</Badge> },
    { accessorKey: "due", header: "Teslim", cell: ({ row }) => (row.original.late ? <Badge tone="bad">{fmtDay(row.original.due)}</Badge> : <span className="tabular">{fmtDay(row.original.due) || "Yok"}</span>) },
  ];

  const chip = (on: boolean) => cn("min-h-8.5 pointer-coarse:min-h-11 rounded-full border border-line px-3 text-[13px]", on ? "border-accent bg-accent-soft text-accent" : "hover:border-accent");
  const openCount = visible.filter((t) => t.stage !== "tamam").length;

  return (
    <>
      <div className="mb-3.5 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-[9px] border border-line bg-sunken p-[3px]" role="group" aria-label="Görünüm">
          {(["pano", "liste"] as const).map((v) => (
            <button key={v} type="button" aria-pressed={view === v} onClick={() => pickView(v)} className={cn("min-h-8.5 pointer-coarse:min-h-11 rounded-[7px] px-3 font-medium text-muted", view === v && "bg-surface text-ink shadow-sm")}>
              {v === "pano" ? "Pano" : "Liste"}
            </button>
          ))}
        </div>
        <label className="relative min-w-[180px] flex-1 sm:max-w-[280px]">
          <span className="sr-only">Görev ara</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <Input id="gorev-ara" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Görev, kod ya da proje ara" className="w-full pl-9" />
        </label>
        <label className="sr-only" htmlFor="gorev-proje">
          Proje
        </label>
        <select id="gorev-proje" value={project} onChange={(e) => setProject(e.target.value)} className="min-h-8.5 pointer-coarse:min-h-11 max-w-[220px] rounded-full border border-line bg-surface px-3 text-[13px]">
          <option value="">Tüm projeler</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
        <button type="button" aria-pressed={mine} onClick={() => setMine((m) => !m)} className={chip(mine)}>
          Bana atananlar
        </button>
        <button type="button" aria-pressed={lateOnly} onClick={() => setLateOnly((m) => !m)} className={chip(lateOnly)}>
          Gecikenler
        </button>
        <span className="text-[13px] text-muted">
          <span className="tabular">{openCount}</span> açık görev
        </span>
        <Button variant="primary" className="ml-auto" onClick={() => setCreating(true)}>
          <Plus /> Yeni görev
        </Button>
      </div>

      {view === "pano" ? (
        <div className="grid gap-3 md:snap-x md:auto-cols-[minmax(270px,1fr)] md:grid-flow-col md:overflow-x-auto md:pb-2 xl:auto-cols-auto xl:grid-flow-row xl:grid-cols-4 xl:overflow-visible xl:pb-0" aria-busy={pending}>
          {STAGES.map((s) => {
            const col = visible.filter((t) => t.stage === s.id).sort(byOrder);
            return (
              <section
                key={s.id}
                aria-label={s.label}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOver(s.id);
                }}
                onDragLeave={() => setOver((o) => (o === s.id ? null : o))}
                onDrop={(e) => {
                  e.preventDefault();
                  onDrop(s.id, null);
                }}
                className={cn("flex min-h-40 min-w-0 flex-col rounded-card border border-line bg-sunken", over === s.id && "outline-2 outline-dashed outline-offset-[-4px] outline-accent")}
              >
                <header className="px-3 pt-3 pb-2">
                  <h2 className="m-0 text-[15px] font-semibold text-ink">{s.label}</h2>
                  <p className="m-0 text-[13px] text-muted">
                    <span className="tabular">{col.length}</span> görev{s.id === "tamam" ? " · son 14 gün" : ""}
                  </p>
                </header>
                <div className="grid flex-1 content-start gap-2 px-2.5 pb-2.5">
                  {col.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      draggable
                      onDragStart={(e) => {
                        setDragId(t.id);
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", String(t.id));
                      }}
                      onDragEnd={() => {
                        setDragId(null);
                        setOver(null);
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDrop(s.id, t.id);
                      }}
                      onClick={() => setParam("gorev", String(t.id))}
                      className={cn("w-full cursor-grab rounded-[9px] border border-line bg-surface px-3 py-2.5 text-left hover:border-accent active:cursor-grabbing", t.late && "shadow-[inset_3px_0_0_var(--bad)]", dragId === t.id && "opacity-50")}
                    >
                      <span className="block text-ink">
                        <span className="font-mono text-[12px] text-muted">{t.code}</span> <span className="font-medium">{t.title}</span>
                      </span>
                      {t.projectTitle ? <span className="mt-0.5 block truncate text-[13px] text-muted">{t.projectTitle}</span> : null}
                      <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {t.late ? <Badge tone="bad">Gecikti · {fmtDay(t.due)}</Badge> : t.due ? <Badge>{fmtDay(t.due)}</Badge> : null}
                        {t.priority === "yuksek" || t.priority === "acil" ? <Badge tone={PRIO[t.priority][0]}>{PRIO[t.priority][1]}</Badge> : null}
                        {t.repeat ? (
                          <span className="inline-flex items-center gap-1 text-[12px] text-muted" title={REPEAT_LABEL[t.repeat]}>
                            <Repeat className="size-3.5" aria-hidden /> {REPEAT_LABEL[t.repeat]}
                          </span>
                        ) : null}
                        {t.checks[1] ? (
                          <span className="inline-flex items-center gap-1 text-[12px] text-muted">
                            <CheckSquare className="size-3.5" aria-hidden />
                            <span className="tabular">
                              {t.checks[0]}/{t.checks[1]}
                            </span>
                          </span>
                        ) : null}
                        <span className="ml-auto grid size-6 place-items-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent" title={t.assigneeName || "Atanmadı"} aria-label={`Sorumlu: ${t.assigneeName || "atanmadı"}`}>
                          {t.assigneeName ? initials(t.assigneeName) : "?"}
                        </span>
                      </span>
                    </button>
                  ))}
                  {col.length === 0 ? <p className="m-0 px-1 py-3 text-[13px] text-muted">Görev yok.</p> : null}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <DataTable
          columns={listCols}
          data={[...visible].sort((a, b) => (a.due ?? "9").localeCompare(b.due ?? "9"))}
          onRowClick={(t) => setParam("gorev", String(t.id))}
          rowLabel={(t) => `${t.code} ${t.title} görevini aç`}
          mobile={(t) => ({ title: `${t.code} ${t.title}`.trim(), detail: [t.projectTitle, t.assigneeName, fmtDay(t.due)].filter(Boolean).join(" · "), meta: <Badge tone={t.late ? "bad" : "plain"}>{t.late ? "Gecikti" : LABEL[t.stage]}</Badge> })}
          empty="Bu süzgeçte görev yok."
        />
      )}

      <TaskForm open={creating} onOpenChange={setCreating} team={team} projects={projects} me={me} onSaved={(id) => setParam("gorev", String(id))} />
      <TaskSheet canDelete={canDelete} detail={detail} team={team} projects={projects} pending={pending} onClose={() => setParam("gorev", null)} onMove={(st) => detail && move(detail.id, st, null)} />
    </>
  );
}

/** Yeni görev */
function TaskForm({ open, onOpenChange, team, projects, me, onSaved }: { open: boolean; onOpenChange: (o: boolean) => void; team: Option[]; projects: Option[]; me: number; onSaved: (id: number) => void }) {
  const router = useRouter();
  const blank = { title: "", project: "", assignee: team.some((m) => m.id === me) ? String(me) : "", dueDate: "", hours: "", priority: "normal", checklist: "", repeat: "" };
  const [f, setF] = useState(blank);
  const [pending, start] = useTransition();
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const r = await createTask({ title: f.title, project: f.project ? Number(f.project) : null, assignee: f.assignee ? Number(f.assignee) : null, dueDate: f.dueDate || null, hours: f.hours ? Number(f.hours.replace(",", ".")) : null, priority: f.priority, checklist: f.checklist.split("\n"), repeat: f.repeat || null });
      if (!r.ok || !r.id) return void toast.error(r.error ?? "Görev açılamadı.");
      toast.success("Görev açıldı.");
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
            <Dialog.Title className="m-0 text-[18px] font-semibold text-ink">Yeni görev</Dialog.Title>
            <Dialog.Close className="grid size-10 place-items-center rounded-[9px] text-muted hover:bg-sunken" aria-label="Kapat">
              <X className="size-5" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">Yeni görev formu</Dialog.Description>
          <form onSubmit={submit} className="mt-3 grid gap-3">
            <label className="grid gap-1 text-[13px] text-muted">
              Görev
              <input id="yeni-gorev-ad" required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Ana sayfa tasarımı" className={field} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1 text-[13px] text-muted">
                Proje
                <select id="yeni-gorev-proje" value={f.project} onChange={(e) => setF({ ...f, project: e.target.value })} className={field}>
                  <option value="">Proje yok</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-[13px] text-muted">
                Sorumlu
                <select id="yeni-gorev-sorumlu" value={f.assignee} onChange={(e) => setF({ ...f, assignee: e.target.value })} className={field}>
                  <option value="">Atanmadı</option>
                  {team.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <label className="grid gap-1 text-[13px] text-muted">
                Teslim
                <input id="yeni-gorev-teslim" type="date" value={f.dueDate} onChange={(e) => setF({ ...f, dueDate: e.target.value })} className={field} />
              </label>
              <label className="grid gap-1 text-[13px] text-muted">
                Tahmini saat
                <input id="yeni-gorev-saat" inputMode="decimal" value={f.hours} onChange={(e) => setF({ ...f, hours: e.target.value })} placeholder="4" className={field} />
              </label>
              <label className="grid gap-1 text-[13px] text-muted">
                Öncelik
                <select id="yeni-gorev-oncelik" value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value })} className={field}>
                  {Object.entries(PRIO).map(([k, [, l]]) => (
                    <option key={k} value={k}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="grid gap-1 text-[13px] text-muted">
              Tekrar
              <select id="yeni-gorev-tekrar" value={f.repeat} onChange={(e) => setF({ ...f, repeat: e.target.value })} className={field}>
                <option value="">Tekrarlamaz</option>
                {Object.entries(REPEAT_LABEL).map(([k, l]) => (
                  <option key={k} value={k}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-[13px] text-muted">
              Kontrol listesi (her satır bir madde)
              <textarea id="yeni-gorev-liste" rows={3} value={f.checklist} onChange={(e) => setF({ ...f, checklist: e.target.value })} className={cn(field, "py-2")} />
            </label>
            <div className="mt-1 flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button type="button">Vazgeç</Button>
              </Dialog.Close>
              <Button type="submit" variant="primary" disabled={pending || !f.title.trim()}>
                Görevi aç
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function TaskSheet({ detail, team, projects, pending, canDelete, onClose, onMove }: { detail: TaskDetail | null; team: Option[]; projects: Option[]; pending: boolean; canDelete: boolean; onClose: () => void; onMove: (stage: string) => void }) {
  const router = useRouter();
  const [busy, start] = useTransition();
  const [list, setList] = useState(detail?.checklist ?? []);
  const [form, setForm] = useState<null | { title: string; project: string; assignee: string; startDate: string; dueDate: string; hours: string; priority: string; description: string; repeat: string }>(null);
  const [comment, setComment] = useState("");
  const [notify, setNotify] = useState<number[]>([]);
  const [forId, setForId] = useState<number | null>(null);
  const [synced, setSynced] = useState(detail);
  if (synced !== detail) {
    setSynced(detail);
    setList(detail?.checklist ?? []);
  }
  const [newItem, setNewItem] = useState("");
  const [confirm, setConfirm] = useState(false);
  if ((detail?.id ?? null) !== forId) {
    setForId(detail?.id ?? null);
    setForm(null);
    setNewItem("");
    setConfirm(false);
  }
  /* Kontrol listesi: madde ekle ya da kaldır; liste baştan kaydedilir */
  const saveList = (next: { text: string; done: boolean }[]) => {
    if (!detail) return;
    const prev = list;
    setList(next);
    start(async () => {
      const r = await setChecklist(detail.id, next);
      if (!r.ok) {
        setList(prev);
        return void toast.error(r.error ?? "Kaydedilemedi.");
      }
      router.refresh();
    });
  };
  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    const text = newItem.trim();
    if (!text) return;
    setNewItem("");
    saveList([...list, { text, done: false }]);
  };
  const remove = () =>
    detail &&
    start(async () => {
      const r = await deleteTask(detail.id);
      if (!r.ok) {
        setConfirm(false);
        return void toast.error(r.error ?? "Silinemedi.");
      }
      toast.success("Görev silindi.");
      onClose();
      router.refresh();
    });
  const check = (i: number, done: boolean) => {
    if (!detail) return;
    setList((l) => l.map((c, k) => (k === i ? { ...c, done } : c)));
    start(async () => {
      const r = await toggleCheck(detail.id, i, done);
      if (!r.ok) {
        setList(detail.checklist);
        return void toast.error(r.error ?? "Kaydedilemedi.");
      }
      router.refresh();
    });
  };
  const edit = () =>
    detail &&
    setForm({ title: detail.title, project: detail.project ? String(detail.project) : "", assignee: detail.assignee ? String(detail.assignee) : "", startDate: detail.startDate, dueDate: detail.dueDate, hours: detail.hours ? String(detail.hours) : "", priority: detail.priority, description: detail.description, repeat: detail.repeat });
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail || !form) return;
    start(async () => {
      const r = await updateTask(detail.id, { title: form.title, project: form.project ? Number(form.project) : null, assignee: form.assignee ? Number(form.assignee) : null, startDate: form.startDate || null, dueDate: form.dueDate || null, hours: form.hours ? Number(form.hours.replace(",", ".")) : null, priority: form.priority, description: form.description, repeat: form.repeat || null });
      if (!r.ok) return void toast.error(r.error ?? "Kaydedilemedi.");
      toast.success("Kaydedildi.");
      setForm(null);
      router.refresh();
    });
  };
  const assigneeName = team.find((m) => m.id === detail?.assignee)?.name ?? "";
  const open = list.filter((c) => !c.done).length;

  return (
    <Sheet open={Boolean(detail)} onOpenChange={(o) => !o && onClose()} title={detail ? `${detail.code} ${detail.title}`.trim() : ""} description={detail ? [detail.projectTitle, assigneeName].filter(Boolean).join(" · ") || undefined : undefined}>
      {detail ? (
        <>
          <SheetSection title="Aşama">
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Aşama">
              {STAGES.map((s) => (
                <Button key={s.id} size="sm" variant={detail.stage === s.id ? "primary" : "secondary"} aria-pressed={detail.stage === s.id} disabled={pending} onClick={() => detail.stage !== s.id && onMove(s.id)}>
                  {s.label}
                </Button>
              ))}
            </div>
            {detail.stage === "kontrol" && open ? <p className="mt-2 mb-0 text-[13px] text-warn">Tamam&apos;a geçmek için kontrol listesinde {open} madde açık.</p> : null}
          </SheetSection>

          <SheetSection title={list.length ? `Kontrol listesi (${list.length - open}/${list.length})` : "Kontrol listesi"}>
            {list.length ? (
              <ul className="m-0 list-none p-0">
                {list.map((c, i) => (
                  <li key={i} className="group flex items-center gap-1">
                    <label className="flex min-h-10 min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-[8px] px-1 hover:bg-sunken">
                      <input type="checkbox" checked={c.done} disabled={busy} onChange={(e) => check(i, e.target.checked)} className="size-4 shrink-0 accent-[var(--accent)]" />
                      <span className={cn("min-w-0 text-[14px] break-words", c.done ? "text-muted line-through" : "text-ink")}>{c.text}</span>
                    </label>
                    <button type="button" disabled={busy} onClick={() => saveList(list.filter((_, k) => k !== i))} className="grid size-9 shrink-0 place-items-center rounded-[8px] text-muted opacity-60 group-hover:opacity-100 hover:bg-sunken hover:text-ink focus-visible:opacity-100 pointer-coarse:opacity-100" aria-label={`Maddeyi kaldır: ${c.text}`}>
                      <X className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="m-0 text-[13px] text-muted">Madde yok. Eklenen maddeler bitmeden görev Tamam&apos;a geçmez.</p>
            )}
            <form onSubmit={addItem} className="mt-2 flex gap-2">
              <label className="min-w-0 flex-1">
                <span className="sr-only">Yeni madde</span>
                <input id="gorev-yeni-madde" value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Madde ekle" className={field} />
              </label>
              <Button type="submit" size="sm" disabled={busy || !newItem.trim()}>
                <Plus /> Ekle
              </Button>
            </form>
          </SheetSection>

          {form ? (
            <form onSubmit={save} className="mt-5 grid gap-3 rounded-card border border-line p-3">
              <label className="grid gap-1 text-[13px] text-muted">
                Görev
                <input id="gorev-ad" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={field} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1 text-[13px] text-muted">
                  Proje
                  <select id="gorev-proje-sec" value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })} className={field}>
                    <option value="">Proje yok</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                    {detail.project && !projects.some((p) => p.id === detail.project) ? <option value={detail.project}>{detail.projectTitle}</option> : null}
                  </select>
                </label>
                <label className="grid gap-1 text-[13px] text-muted">
                  Sorumlu
                  <select id="gorev-sorumlu" value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} className={field}>
                    <option value="">Atanmadı</option>
                    {team.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1 text-[13px] text-muted">
                  Başlangıç
                  <input id="gorev-baslangic" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={field} />
                </label>
                <label className="grid gap-1 text-[13px] text-muted">
                  Teslim
                  <input id="gorev-teslim" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className={field} />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1 text-[13px] text-muted">
                  Tahmini saat
                  <input id="gorev-saat" inputMode="decimal" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} className={field} />
                </label>
                <label className="grid gap-1 text-[13px] text-muted">
                  Öncelik
                  <select id="gorev-oncelik" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className={field}>
                    {Object.entries(PRIO).map(([k, [, l]]) => (
                      <option key={k} value={k}>
                        {l}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="grid gap-1 text-[13px] text-muted">
                Tekrar
                <select id="gorev-tekrar" value={form.repeat} onChange={(e) => setForm({ ...form, repeat: e.target.value })} className={field}>
                  <option value="">Tekrarlamaz</option>
                  {Object.entries(REPEAT_LABEL).map(([k, l]) => (
                    <option key={k} value={k}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-[13px] text-muted">
                Ayrıntı
                <textarea id="gorev-ayrinti" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={cn(field, "py-2")} />
              </label>
              <div className="flex justify-end gap-2">
                <Button type="button" size="sm" onClick={() => setForm(null)}>
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
                    ["Sorumlu", assigneeName || "Atanmadı"],
                    ["Başlangıç", detail.startDate ? fmtDay(detail.startDate) : "Yok"],
                    ["Teslim", detail.dueDate ? `${fmtDay(detail.dueDate)}${detail.late ? " (gecikti)" : ""}` : "Yok"],
                    ["Tahmini saat", detail.hours ? `${detail.hours} saat` : "Girilmedi"],
                    ["Öncelik", PRIO[detail.priority]?.[1] ?? detail.priority],
                    ["Proje", detail.projectTitle || "Yok"],
                    ["Tekrar", REPEAT_LABEL[detail.repeat] ?? "Tekrarlamaz"],
                  ] as [string, string][]
                ).map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-muted">{k}</dt>
                    <dd className={cn("m-0 text-ink", k === "Teslim" && detail.late && "text-bad")}>{v}</dd>
                  </div>
                ))}
              </dl>
              {detail.description ? <p className="mt-3 mb-0 whitespace-pre-wrap text-[14px] text-ink">{detail.description}</p> : null}
              <Button size="sm" className="mt-3" onClick={edit}>
                Düzenle
              </Button>
            </SheetSection>
          )}
          {!detail.hours ? <p className="mt-4 text-[13px] text-muted">Tahmini saat girilirse görev Ekip yükü&apos;nde sorumlunun haftasına sayılır.</p> : null}
          <SheetSection title={`Yorumlar${detail.comments.length ? ` (${detail.comments.length})` : ""}`}>
            {detail.comments.length ? (
              <ul className="m-0 mb-3 grid list-none gap-2 p-0">
                {detail.comments.map((c) => (
                  <li key={c.id} className="group rounded-[10px] bg-sunken px-3 py-2">
                    <div className="flex items-center gap-2 text-[12px] text-muted">
                      <MessageSquare className="size-3.5" aria-hidden />
                      <span className="font-medium text-ink">{c.author}</span>
                      <span>{new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(c.at))}</span>
                      {c.mine || canDelete ? (
                        <button type="button" disabled={busy} onClick={() => start(async () => { const r = await deleteTaskComment(c.id); if (!r.ok) return void toast.error(r.error ?? "Silinemedi."); router.refresh(); })} className="ml-auto grid size-7 place-items-center rounded-[6px] opacity-60 group-hover:opacity-100 hover:bg-surface hover:text-bad pointer-coarse:opacity-100" aria-label="Yorumu sil">
                          <Trash2 className="size-3.5" />
                        </button>
                      ) : null}
                    </div>
                    <p className="m-0 mt-0.5 text-[14px] whitespace-pre-wrap text-ink">{c.text}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="m-0 mb-2 text-[13px] text-muted">Henüz yorum yok. Ekip arkadaşınızı seçerseniz bildirim alır.</p>
            )}
            <form
              className="grid gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!comment.trim()) return;
                start(async () => {
                  const r = await addTaskComment(detail.id, comment, notify);
                  if (!r.ok) return void toast.error(r.error ?? "Yorum eklenemedi.");
                  toast.success(notify.length ? "Yorum eklendi; seçtiğiniz kişilere bildirim gitti." : "Yorum eklendi.");
                  setComment("");
                  setNotify([]);
                  router.refresh();
                });
              }}
            >
              <label>
                <span className="sr-only">Yorum</span>
                <textarea id="gorev-yorum" rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Yorum yazın" className={cn(field, "py-2")} />
              </label>
              {team.length > 1 ? (
                <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Bildirilecek kişiler">
                  <span className="text-[12px] text-muted">Bildir:</span>
                  {team.map((m) => {
                    const on = notify.includes(m.id);
                    return (
                      <button key={m.id} type="button" aria-pressed={on} onClick={() => setNotify((x) => (on ? x.filter((v) => v !== m.id) : [...x, m.id]))} className={cn("min-h-7 rounded-full border px-2.5 text-[12px]", on ? "border-accent bg-accent-soft text-accent" : "border-line text-text hover:border-accent")}>
                        {m.name}
                      </button>
                    );
                  })}
                </div>
              ) : null}
              <Button type="submit" size="sm" variant="primary" className="justify-self-end" disabled={busy || !comment.trim()}>
                Yorum ekle
              </Button>
            </form>
          </SheetSection>

          {canDelete ? (
            <SheetSection title="Görevi sil">
              {confirm ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[14px] text-ink">Görev kalıcı olarak silinsin mi?</span>
                  <Button type="button" size="sm" variant="danger" onClick={remove} disabled={busy}>
                    Evet, sil
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setConfirm(false)}>
                    Vazgeç
                  </Button>
                </div>
              ) : (
                <Button type="button" size="sm" variant="danger" onClick={() => setConfirm(true)}>
                  <Trash2 /> Sil
                </Button>
              )}
            </SheetSection>
          ) : null}
        </>
      ) : null}
    </Sheet>
  );
}
