"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CalendarClock, Check, FileText, Mail, MessageCircle, Pencil, Phone, ReceiptText, RotateCcw, StickyNote, Trash2, Users, CheckSquare, History, CalendarCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { SheetSection } from "../ui/sheet";
import { addFeedNote, completeActivity, deleteNote, editNote, planActivity, reopenActivity } from "./actions";
import type { FeedItem, FeedTarget } from "./feed";

const TZ = "Europe/Istanbul";
const when = (iso: string) => new Intl.DateTimeFormat("tr-TR", { timeZone: TZ, day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
const ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  not: StickyNote,
  arama: Phone,
  eposta: Mail,
  toplanti: Users,
  gorev: CheckSquare,
  sistem: History,
  talep: FileText,
  randevu: CalendarCheck,
  sohbet: MessageCircle,
  teklif: ReceiptText,
};
const PLAN_TYPES: [string, string][] = [
  ["arama", "Arama"],
  ["toplanti", "Toplantı"],
  ["eposta", "E-posta"],
  ["gorev", "Görev"],
];
const FILTERS: [string, string, (i: FeedItem) => boolean][] = [
  ["tumu", "Tümü", () => true],
  ["not", "Notlar", (i) => i.type === "not"],
  ["gorev", "Görevler", (i) => i.kind === "aktivite" && ["gorev", "arama", "toplanti", "eposta"].includes(i.type)],
  ["kayit", "Kayıtlar", (i) => i.kind !== "aktivite" || i.type === "sistem"],
];

/* Tarih ve saat alanı için yerel değer: yarın 10:00 */
const pad = (n: number) => String(n).padStart(2, "0");
const localValue = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
const tomorrowAt10 = () => {
  const d = new Date(Date.now() + 86400000);
  d.setHours(10, 0, 0, 0);
  return localValue(d);
};
const field = "block w-full rounded-[9px] border border-line bg-surface px-3 min-h-10 text-[14px] pointer-coarse:text-[16px] text-ink focus:border-accent focus:outline-none";

/**
 * Birleşik akış (fırsat, kişi, firma): üstte yapılacaklar ve "Not / Planla"
 * kutusu, altta tüm geçmiş. Görev tamamlanırken sonuç yazılır ve sonraki adım
 * hemen planlanabilir (Kommo alışkanlığı: her fırsatın bir sonraki adımı belli).
 */
export function Akis({ items, target, team, me, onChanged }: { items: FeedItem[]; target: FeedTarget; team: { id: number; name: string }[]; me: number; onChanged?: () => Promise<void> | void }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [tab, setTab] = useState<"not" | "plan">("not");
  const [note, setNote] = useState("");
  /* Guru yöneticisi müşteri işletmesinin ekibinde değil: varsayılan sorumlu ekipten biri olur */
  const defaultOwner = String(team.some((m) => m.id === me) ? me : (team[0]?.id ?? ""));
  const [plan, setPlan] = useState({ type: "arama", title: "", due: tomorrowAt10(), owner: defaultOwner });
  const [filter, setFilter] = useState("tumu");
  const [doneFor, setDoneFor] = useState<number | null>(null);
  const [result, setResult] = useState("");
  const [nextStep, setNextStep] = useState(true);
  const [editing, setEditing] = useState<{ id: number; text: string } | null>(null);
  const [confirmDel, setConfirmDel] = useState<number | null>(null);

  const run = (job: () => Promise<{ ok: boolean; error?: string }>, done: string, after?: () => void) =>
    start(async () => {
      const r = await job();
      if (!r.ok) return void toast.error(r.error ?? "İşlem yapılamadı.");
      toast.success(done);
      after?.();
      /* Yan panelde veri istemcide okunur: panel kendini yeniler, sayfa da tazelenir */
      await onChanged?.();
      router.refresh();
    });

  const todo = items.filter((i) => i.open).sort((a, b) => (a.due ?? "").localeCompare(b.due ?? ""));
  const history = items.filter((i) => !i.open).filter(FILTERS.find((f) => f[0] === filter)![2]);

  const submitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    run(() => addFeedNote(target, note), "Not eklendi.", () => setNote(""));
  };
  const submitPlan = (e: React.FormEvent) => {
    e.preventDefault();
    run(() => planActivity(target, { type: plan.type, title: plan.title, dueAt: new Date(plan.due).toISOString(), owner: plan.owner ? Number(plan.owner) : null }), "Planlandı; Yapılacaklar'da ve takvimde görünür.", () => setPlan({ ...plan, title: "" }));
  };
  const complete = (it: FeedItem) =>
    run(
      () => completeActivity(it.activityId!, result),
      "Tamamlandı.",
      () => {
        setDoneFor(null);
        setResult("");
        /* Sonraki adım: aynı türde, yarın 10:00 için planlama kutusu açılır */
        if (nextStep) {
          setTab("plan");
          setPlan({ type: it.type === "gorev" ? "arama" : it.type, title: "", due: tomorrowAt10(), owner: defaultOwner });
          requestAnimationFrame(() => document.getElementById("akis-plan-baslik")?.focus());
        }
      },
    );

  return (
    <>
      {todo.length ? (
        <SheetSection title={`Yapılacak (${todo.length})`}>
          <ul className="m-0 grid list-none gap-2 p-0">
            {todo.map((it) => {
              const Icon = ICON[it.type] ?? CheckSquare;
              return (
                <li key={it.id} className={cn("rounded-[10px] border px-3 py-2.5", it.late ? "border-bad/40 bg-bad-soft/40" : "border-line bg-surface")}>
                  <div className="flex items-start gap-2.5">
                    <Icon className={cn("mt-0.5 size-4 shrink-0", it.late ? "text-bad" : "text-accent")} aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="m-0 text-[14px] font-medium text-ink">{it.title}</p>
                      <p className={cn("m-0 text-[13px]", it.late ? "text-bad" : "text-muted")}>
                        {it.typeLabel} · {it.due ? when(it.due) : "tarih yok"}
                        {it.late ? " · gecikti" : ""}
                        {it.owner ? ` · ${it.owner}` : ""}
                      </p>
                    </div>
                    {doneFor !== it.activityId ? (
                      <Button size="sm" disabled={pending} onClick={() => setDoneFor(it.activityId)}>
                        <Check /> Tamamla
                      </Button>
                    ) : null}
                  </div>
                  {doneFor === it.activityId ? (
                    <div className="mt-2 grid gap-2">
                      <label className="grid gap-1 text-[13px] text-muted">
                        Sonuç (isteğe bağlı)
                        <textarea id={`akis-sonuc-${it.activityId}`} rows={2} value={result} onChange={(e) => setResult(e.target.value)} placeholder="Arandı, teklif istedi; ulaşılamadı…" className={cn(field, "py-2")} />
                      </label>
                      <label className="flex items-center gap-2 text-[13px] text-text">
                        <input type="checkbox" checked={nextStep} onChange={(e) => setNextStep(e.target.checked)} className="size-4 accent-[var(--accent)]" />
                        Ardından sonraki adımı planla
                      </label>
                      <div className="flex gap-2">
                        <Button size="sm" variant="primary" disabled={pending} onClick={() => complete(it)}>
                          Tamamla
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setDoneFor(null)}>
                          Vazgeç
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </SheetSection>
      ) : null}

      <SheetSection title="Ekle">
        <div className="mb-2 flex rounded-[9px] border border-line bg-surface p-0.5" role="tablist" aria-label="Ekle">
          {(
            [
              ["not", "Not", StickyNote],
              ["plan", "Planla", CalendarClock],
            ] as const
          ).map(([k, l, I]) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn("inline-flex min-h-8 flex-1 items-center justify-center gap-1.5 rounded-[7px] text-[13px]", tab === k ? "bg-accent-soft font-medium text-accent" : "text-text hover:text-ink")}>
              <I className="size-3.5" /> {l}
            </button>
          ))}
        </div>
        {tab === "not" ? (
          <form onSubmit={submitNote} className="grid gap-2">
            <label>
              <span className="sr-only">Not</span>
              <textarea id="akis-not" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Görüşmede ne konuşuldu, sonraki adım ne?" className={cn(field, "py-2")} />
            </label>
            <Button type="submit" size="sm" variant="primary" className="justify-self-end" disabled={pending || !note.trim()}>
              Not ekle
            </Button>
          </form>
        ) : (
          <form onSubmit={submitPlan} className="grid gap-2">
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Tür">
              {PLAN_TYPES.map(([k, l]) => {
                const I = ICON[k];
                return (
                  <button key={k} type="button" role="radio" aria-checked={plan.type === k} onClick={() => setPlan({ ...plan, type: k })} className={cn("inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 text-[13px]", plan.type === k ? "border-accent bg-accent-soft text-accent" : "border-line text-text hover:border-accent")}>
                    <I className="size-3.5" /> {l}
                  </button>
                );
              })}
            </div>
            <label className="grid gap-1 text-[13px] text-muted">
              Ne yapılacak
              <input id="akis-plan-baslik" required value={plan.title} onChange={(e) => setPlan({ ...plan, title: e.target.value })} placeholder="Teklifi konuşmak için ara" className={field} />
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="grid gap-1 text-[13px] text-muted">
                Tarih ve saat
                <input id="akis-plan-tarih" type="datetime-local" required value={plan.due} onChange={(e) => setPlan({ ...plan, due: e.target.value })} className={field} />
              </label>
              <label className="grid gap-1 text-[13px] text-muted">
                Sorumlu
                <select id="akis-plan-sorumlu" value={plan.owner} onChange={(e) => setPlan({ ...plan, owner: e.target.value })} className={field}>
                  {team.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.id === me ? `${m.name} (ben)` : m.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <Button type="submit" size="sm" variant="primary" className="justify-self-end" disabled={pending || !plan.title.trim()}>
              Planla
            </Button>
          </form>
        )}
      </SheetSection>

      <SheetSection title="Geçmiş">
        <div className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label="Süzgeç">
          {FILTERS.map(([k, l]) => (
            <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)} className={cn("min-h-8 rounded-full border px-3 text-[13px]", filter === k ? "border-accent bg-accent-soft text-accent" : "border-line text-text hover:border-accent")}>
              {l}
            </button>
          ))}
        </div>
        {history.length ? (
          <ul className="m-0 ml-1.5 list-none border-l-2 border-line p-0">
            {history.map((it) => {
              const Icon = ICON[it.type] ?? History;
              const isEditing = editing?.id === it.activityId;
              return (
                <li key={it.id} className="relative pb-4 pl-5">
                  <span className="absolute top-0 -left-[11px] grid size-5 place-items-center rounded-full border border-line bg-surface text-muted" aria-hidden>
                    <Icon className="size-3" />
                  </span>
                  {isEditing ? (
                    <div className="grid gap-2">
                      <textarea id={`akis-duzenle-${it.activityId}`} rows={3} value={editing.text} onChange={(e) => setEditing({ id: editing.id, text: e.target.value })} className={cn(field, "py-2")} />
                      <div className="flex gap-2">
                        <Button size="sm" variant="primary" disabled={pending} onClick={() => run(() => editNote(editing.id, editing.text), "Not güncellendi.", () => setEditing(null))}>
                          Kaydet
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
                          Vazgeç
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start gap-2">
                        <div className="min-w-0 flex-1">
                          {it.href ? (
                            <Link href={it.href} className="text-[14px] font-medium text-accent no-underline hover:underline">
                              {it.title}
                            </Link>
                          ) : (
                            <span className={cn("text-[14px] text-ink", it.type !== "sistem" && "font-medium")}>{it.type === "not" ? it.body || it.title : it.title}</span>
                          )}
                          {it.kind !== "aktivite" && it.owner ? (
                            <Badge tone="plain" className="ml-2">
                              {it.owner}
                            </Badge>
                          ) : null}
                        </div>
                        {it.editable ? (
                          <span className="flex shrink-0 gap-0.5">
                            <button type="button" onClick={() => setEditing({ id: it.activityId!, text: it.body || it.title })} className="grid size-8 place-items-center rounded-[7px] text-muted hover:bg-sunken hover:text-ink" aria-label="Notu düzenle">
                              <Pencil className="size-3.5" />
                            </button>
                            <button type="button" onClick={() => setConfirmDel(it.activityId)} className="grid size-8 place-items-center rounded-[7px] text-muted hover:bg-sunken hover:text-bad" aria-label="Notu sil">
                              <Trash2 className="size-3.5" />
                            </button>
                          </span>
                        ) : null}
                        {it.kind === "aktivite" && it.type !== "not" && it.type !== "sistem" ? (
                          <button type="button" disabled={pending} onClick={() => run(() => reopenActivity(it.activityId!), "Yeniden açıldı.")} className="grid size-8 shrink-0 place-items-center rounded-[7px] text-muted hover:bg-sunken hover:text-ink" aria-label="Yeniden aç" title="Yeniden aç">
                            <RotateCcw className="size-3.5" />
                          </button>
                        ) : null}
                      </div>
                      {it.type !== "not" && it.body ? <span className="block whitespace-pre-wrap text-[13px] text-text">{it.body}</span> : null}
                      {it.result ? <span className="mt-0.5 block whitespace-pre-wrap text-[13px] text-ink">Sonuç: {it.result}</span> : null}
                      <span className="block text-[12px] text-muted">
                        {it.typeLabel} · {when(it.at)}
                        {it.kind === "aktivite" && it.owner ? ` · ${it.owner}` : ""}
                      </span>
                      {confirmDel === it.activityId ? (
                        <span className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-ink">
                          Not silinsin mi?
                          <Button size="sm" variant="danger" disabled={pending} onClick={() => run(() => deleteNote(it.activityId!), "Not silindi.", () => setConfirmDel(null))}>
                            Evet, sil
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setConfirmDel(null)}>
                            Vazgeç
                          </Button>
                        </span>
                      ) : null}
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="m-0 text-[14px] text-muted">{filter === "tumu" ? "Henüz kayıt yok." : "Bu türde kayıt yok."}</p>
        )}
      </SheetSection>
    </>
  );
}
