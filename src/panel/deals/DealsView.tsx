"use client";

import { OFFERINGS } from "../offerings";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Dialog } from "radix-ui";
import { AlertTriangle, Phone, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { DataTable } from "../ui/data-table";
import { Fields, Sheet, SheetSection } from "../ui/sheet";
import { addNote, createDeal, findContacts, moveDeal, scheduleCall, updateDeal } from "./actions";

export type BoardDeal = { id: number; title: string; stage: string; value: number; order: number | null; who: string; owner: number | null; ownerName: string; expectedClose: string | null; updatedAt: string; closedAt: string | null; lateTask: boolean };
export type DealDetail = {
  id: number;
  title: string;
  stage: string;
  stageLabel: string;
  value: number;
  service: string;
  notes: string;
  lostReason: string;
  expectedClose: string;
  who: string;
  contact: { id: number; name: string; email: string; phone: string } | null;
  company: { id: number; name: string } | null;
  ownerName: string;
  created: string;
  leadKey: string | null;
  timeline: { id: number; title: string; body: string; detail: string; open: boolean }[];
  quotes: { id: number; number: string; title: string; total: number; status: string }[];
  projects: { id: number; title: string }[];
};

const OPEN = [
  { id: "aday", label: "Aday" },
  { id: "gorusme", label: "Görüşme" },
  { id: "teklif", label: "Teklif" },
];
const ALL = [...OPEN, { id: "kazanildi", label: "Kazanıldı" }, { id: "kaybedildi", label: "Kaybedildi" }];
const LABEL = Object.fromEntries(ALL.map((s) => [s.id, s.label]));
const STALE_DAYS = 7;
const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
const dayFmt = new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "short" });
const idleDays = (iso: string) => Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
const byOrder = (a: BoardDeal, b: BoardDeal) => (a.order ?? Infinity) - (b.order ?? Infinity) || b.updatedAt.localeCompare(a.updatedAt);

type View = "pano" | "liste";

export function DealsView({ deals: initial, detail, me, hasOps, initialView }: { deals: BoardDeal[]; detail: DealDetail | null; me: number; hasOps: boolean; initialView: View }) {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const [deals, setDeals] = useState(initial);
  const [synced, setSynced] = useState(initial);
  /* Sunucudan yeni veri gelince (yenileme sonrası) yerel listeyi tazele */
  if (synced !== initial) {
    setSynced(initial);
    setDeals(initial);
  }
  const [view, setView] = useState<View>(initialView);
  const [q, setQ] = useState("");
  const [mine, setMine] = useState(false);
  const [staleOnly, setStaleOnly] = useState(false);
  const [showClosed, setShowClosed] = useState(false);
  const [dragId, setDragId] = useState<number | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [lost, setLost] = useState<{ id: number; order: number } | null>(null);
  const [creating, setCreating] = useState(false);
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
  const pickView = (v: View) => {
    setView(v);
    const next = new URLSearchParams(params.toString());
    if (v === "liste") next.set("gorunum", "liste");
    else next.delete("gorunum");
    window.history.replaceState(null, "", `${path}${next.toString() ? `?${next}` : ""}`);
  };

  const term = q.trim().toLocaleLowerCase("tr-TR");
  const visible = useMemo(
    () =>
      deals.filter(
        (d) =>
          (!term || `${d.title} ${d.who}`.toLocaleLowerCase("tr-TR").includes(term)) &&
          (!mine || d.owner === me) &&
          (!staleOnly || (OPEN.some((s) => s.id === d.stage) && idleDays(d.updatedAt) >= STALE_DAYS)),
      ),
    [deals, term, mine, me, staleOnly],
  );
  const open = visible.filter((d) => OPEN.some((s) => s.id === d.stage));
  const won = visible.filter((d) => d.stage === "kazanildi");
  const lostList = visible.filter((d) => d.stage === "kaybedildi");
  const total = open.reduce((a, d) => a + d.value, 0);

  /* Taşıma: yeni sıra komşu kartların arası; ekranda hemen, sunucuda arkadan */
  const move = (id: number, stage: string, beforeId: number | null, lostReason?: string) => {
    const deal = deals.find((d) => d.id === id);
    if (!deal) return;
    const col = deals.filter((d) => d.stage === stage && d.id !== id).sort(byOrder);
    const at = beforeId ? Math.max(0, col.findIndex((d) => d.id === beforeId)) : col.length;
    const prev = col[at - 1]?.order ?? (col[at] ? (col[at].order ?? at) - 1 : 0);
    const next = col[at]?.order ?? prev + 2;
    const order = (prev + next) / 2;
    if (deal.stage === stage && deal.order === order) return;
    if (stage === "kaybedildi" && lostReason === undefined) return setLost({ id, order });
    const before = deals;
    setDeals((list) => list.map((d) => (d.id === id ? { ...d, stage, order, updatedAt: new Date().toISOString(), closedAt: stage === "kazanildi" || stage === "kaybedildi" ? new Date().toISOString() : null } : d)));
    start(async () => {
      const r = await moveDeal(id, stage, order, lostReason);
      if (!r.ok) {
        setDeals(before);
        return void toast.error(r.error ?? "Taşınamadı.");
      }
      if (deal.stage !== stage) toast.success(stage === "kazanildi" ? `${deal.title} kazanıldı.${hasOps ? " Proje açmak için fırsatı açın." : ""}` : `${deal.title}: ${LABEL[stage]}`);
      router.refresh();
    });
  };

  const onDrop = (stage: string, beforeId: number | null) => {
    if (dragId !== null) move(dragId, stage, beforeId);
    setDragId(null);
    setOver(null);
  };

  const listCols: ColumnDef<BoardDeal, unknown>[] = [
    { accessorKey: "title", header: "Fırsat", cell: ({ row }) => <span className="font-medium text-ink">{row.original.title}</span> },
    { accessorKey: "who", header: "Firma ya da kişi" },
    { accessorKey: "stage", header: "Aşama", cell: ({ getValue }) => <Badge tone={getValue() === "kazanildi" ? "good" : "plain"}>{LABEL[getValue() as string]}</Badge> },
    { accessorKey: "value", header: "Tutar", cell: ({ getValue }) => <span className="tabular whitespace-nowrap">{money.format(getValue() as number)}</span> },
    { accessorKey: "expectedClose", header: "Tahmini kapanış", cell: ({ getValue }) => (getValue() ? <span className="tabular">{dayFmt.format(new Date(getValue() as string))}</span> : <span className="text-muted">Yok</span>) },
    {
      accessorKey: "updatedAt",
      header: "Son işlem",
      cell: ({ row }) => {
        const n = idleDays(row.original.updatedAt);
        return n >= STALE_DAYS && OPEN.some((s) => s.id === row.original.stage) ? <Badge tone="warn">{n} gün önce</Badge> : <span className="tabular text-muted">{n === 0 ? "Bugün" : `${n} gün önce`}</span>;
      },
    },
  ];

  return (
    <>
      <div className="mb-3.5 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-[9px] border border-line bg-sunken p-[3px]" role="group" aria-label="Görünüm">
          {(["pano", "liste"] as const).map((v) => (
            <button key={v} type="button" aria-pressed={view === v} onClick={() => pickView(v)} className={cn("min-h-8.5 rounded-[7px] px-3 font-medium text-muted", view === v && "bg-surface text-ink shadow-sm")}>
              {v === "pano" ? "Pano" : "Liste"}
            </button>
          ))}
        </div>
        <label className="relative min-w-[180px] flex-1 sm:max-w-[320px]">
          <span className="sr-only">Fırsat ara</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <Input id="firsat-ara" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Fırsat ya da firma ara" className="w-full pl-9" />
        </label>
        <button type="button" aria-pressed={mine} onClick={() => setMine((m) => !m)} className={cn("min-h-8.5 rounded-full border border-line px-3 text-[13px]", mine ? "border-accent bg-accent-soft text-accent" : "hover:border-accent")}>
          Benim
        </button>
        <button type="button" aria-pressed={staleOnly} onClick={() => setStaleOnly((m) => !m)} className={cn("min-h-8.5 rounded-full border border-line px-3 text-[13px]", staleOnly ? "border-accent bg-accent-soft text-accent" : "hover:border-accent")}>
          {STALE_DAYS} günden uzun bekleyen
        </button>
        <span className="text-[13px] text-muted">
          <span className="tabular">{open.length}</span> açık · <span className="tabular">{money.format(total)}</span>
        </span>
        <Button variant="primary" className="ml-auto" onClick={() => setCreating(true)}>
          <Plus /> Yeni fırsat
        </Button>
      </div>

      {view === "pano" ? (
        <>
          <div className="grid gap-3 md:grid-cols-3" aria-busy={pending}>
            {OPEN.map((s) => {
              const col = open.filter((d) => d.stage === s.id).sort(byOrder);
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
                      <span className="tabular">{col.length}</span> fırsat · <span className="tabular">{money.format(col.reduce((a, d) => a + d.value, 0))}</span>
                    </p>
                  </header>
                  <div className="grid flex-1 content-start gap-2 px-2.5 pb-2.5">
                    {col.map((d) => {
                      const idle = idleDays(d.updatedAt);
                      const stale = idle >= STALE_DAYS;
                      return (
                        <button
                          key={d.id}
                          type="button"
                          draggable
                          onDragStart={(e) => {
                            setDragId(d.id);
                            e.dataTransfer.effectAllowed = "move";
                            e.dataTransfer.setData("text/plain", String(d.id));
                          }}
                          onDragEnd={() => {
                            setDragId(null);
                            setOver(null);
                          }}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onDrop(s.id, d.id);
                          }}
                          onClick={() => setParam("firsat", String(d.id))}
                          className={cn(
                            "w-full cursor-grab rounded-[9px] border border-line bg-surface px-3 py-2.5 text-left hover:border-accent active:cursor-grabbing",
                            stale && "shadow-[inset_3px_0_0_var(--warn)]",
                            dragId === d.id && "opacity-50",
                          )}
                        >
                          <span className="block font-medium text-ink">{d.title}</span>
                          <span className="mt-0.5 flex justify-between gap-2 text-[13px] text-muted">
                            <span className="min-w-0 truncate">{d.who || "Kişi yok"}</span>
                            <span className="tabular shrink-0">{money.format(d.value)}</span>
                          </span>
                          {stale || d.lateTask ? (
                            <span className="mt-1.5 flex flex-wrap gap-1">
                              {stale ? <Badge tone="warn">{idle} gündür dokunulmadı</Badge> : null}
                              {d.lateTask ? (
                                <Badge tone="bad">
                                  <AlertTriangle className="size-3" aria-hidden /> Geciken görev
                                </Badge>
                              ) : null}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                    {col.length === 0 ? <p className="m-0 px-1 py-3 text-[13px] text-muted">Bu aşamada fırsat yok.</p> : null}
                  </div>
                </section>
              );
            })}
          </div>

          {/* Kapanış alanları: sürüklerken görünür, telefonda karttaki düğmeler kullanılır */}
          <div className={cn("mt-3 grid grid-cols-2 gap-3", dragId === null && "hidden md:grid")}>
            {(["kazanildi", "kaybedildi"] as const).map((st) => (
              <div
                key={st}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOver(st);
                }}
                onDragLeave={() => setOver((o) => (o === st ? null : o))}
                onDrop={(e) => {
                  e.preventDefault();
                  onDrop(st, null);
                }}
                className={cn("rounded-card border-2 border-dashed border-line px-3 py-4 text-center text-[14px] font-medium", st === "kazanildi" ? "text-good" : "text-bad", over === st && "border-current bg-surface")}
              >
                {st === "kazanildi" ? "Kazanıldı olarak işaretlemek için buraya bırakın" : "Kaybedildi olarak işaretlemek için buraya bırakın"}
              </div>
            ))}
          </div>

          <section className="mt-4 rounded-card border border-line bg-surface">
            <button type="button" onClick={() => setShowClosed((s) => !s)} aria-expanded={showClosed} className="flex min-h-12 w-full items-center justify-between gap-3 px-4 text-left">
              <span className="text-ink">
                Son 30 gün: <b className="tabular">{won.length}</b> kazanıldı (<span className="tabular">{money.format(won.reduce((a, d) => a + d.value, 0))}</span>), <b className="tabular">{lostList.length}</b> kaybedildi
              </span>
              <span className="text-[14px] text-accent">{showClosed ? "Gizle" : "Göster"}</span>
            </button>
            {showClosed ? (
              <ul className="m-0 list-none border-t border-line p-0">
                {[...won, ...lostList]
                  .sort((a, b) => (b.closedAt ?? "").localeCompare(a.closedAt ?? ""))
                  .map((d) => (
                    <li key={d.id} className="border-b border-line last:border-0">
                      <button type="button" onClick={() => setParam("firsat", String(d.id))} className="flex min-h-12 w-full items-center gap-3 px-4 py-2 text-left hover:bg-sunken">
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-ink">{d.title}</span>
                          <span className="block truncate text-[13px] text-muted">{[d.who, d.closedAt ? dayFmt.format(new Date(d.closedAt)) : null].filter(Boolean).join(" · ")}</span>
                        </span>
                        <span className="tabular text-[13px] text-muted">{money.format(d.value)}</span>
                        <Badge tone={d.stage === "kazanildi" ? "good" : "plain"}>{LABEL[d.stage]}</Badge>
                      </button>
                    </li>
                  ))}
                {won.length + lostList.length === 0 ? <li className="px-4 py-4 text-[14px] text-muted">Son 30 günde kapanan fırsat yok.</li> : null}
              </ul>
            ) : null}
          </section>
        </>
      ) : (
        <DataTable
          columns={listCols}
          data={[...open, ...won, ...lostList]}
          onRowClick={(d) => setParam("firsat", String(d.id))}
          rowLabel={(d) => `${d.title} fırsatını aç`}
          mobile={(d) => ({ title: d.title, detail: [d.who, money.format(d.value)].filter(Boolean).join(" · "), meta: <Badge>{LABEL[d.stage]}</Badge> })}
          empty="Aramaya uyan fırsat yok."
        />
      )}

      <LostDialog
        open={Boolean(lost)}
        onCancel={() => setLost(null)}
        onConfirm={(reason) => {
          if (lost) move(lost.id, "kaybedildi", null, reason);
          setLost(null);
        }}
      />
      <NewDealDialog open={creating} onOpenChange={setCreating} onCreated={(id) => setParam("firsat", String(id))} />
      <DealSheet detail={detail} hasOps={hasOps} onClose={() => setParam("firsat", null)} onMove={(st) => detail && move(detail.id, st, null)} pending={pending} />
    </>
  );
}

function LostDialog({ open, onCancel, onConfirm }: { open: boolean; onCancel: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState("");
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[min(460px,calc(100%-32px))] -translate-x-1/2 -translate-y-1/2 rounded-[12px] border border-line bg-surface p-5 shadow-pop focus:outline-none">
          <Dialog.Title className="m-0 text-[18px] font-semibold text-ink">Fırsat neden kaybedildi?</Dialog.Title>
          <Dialog.Description className="mt-1 mb-3 text-[14px] text-muted">Fiyat, zamanlama, rakip… Sonraki teklifler için ipucu olur. Boş bırakabilirsiniz.</Dialog.Description>
          <textarea id="kayip-neden" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} className="block w-full rounded-[9px] border border-line bg-surface px-3 py-2 text-[14px] text-ink focus:border-accent focus:outline-none" />
          <div className="mt-4 flex justify-end gap-2">
            <Button onClick={onCancel}>Vazgeç</Button>
            <Button
              variant="danger"
              onClick={() => {
                onConfirm(reason);
                setReason("");
              }}
            >
              Kaybedildi olarak işaretle
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function NewDealDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (o: boolean) => void; onCreated: (id: number) => void }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [stage, setStage] = useState("aday");
  const [close, setClose] = useState("");
  const [cq, setCq] = useState("");
  const [hits, setHits] = useState<{ id: number; name: string; detail: string }[]>([]);
  const [contact, setContact] = useState<{ id: number; name: string } | null>(null);
  const [pending, start] = useTransition();
  const reset = () => {
    setTitle("");
    setValue("");
    setStage("aday");
    setClose("");
    setCq("");
    setHits([]);
    setContact(null);
  };
  const searchContact = (v: string) => {
    setCq(v);
    if (v.trim().length < 2) return setHits([]);
    start(async () => setHits(await findContacts(v)));
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const r = await createDeal({ title, value: value ? Number(value.replace(/\./g, "").replace(",", ".")) : null, stage, expectedClose: close || null, contact: contact?.id ?? null });
      if (!r.ok || !r.id) return void toast.error(r.error ?? "Fırsat açılamadı.");
      toast.success("Fırsat açıldı.");
      onOpenChange(false);
      reset();
      router.refresh();
      onCreated(r.id);
    });
  };
  const field = "block w-full rounded-[9px] border border-line bg-surface px-3 min-h-10 text-[14px] text-ink focus:border-accent focus:outline-none";
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[90dvh] w-[min(520px,calc(100%-32px))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[12px] border border-line bg-surface p-5 shadow-pop focus:outline-none">
          <div className="flex items-start justify-between gap-3">
            <Dialog.Title className="m-0 text-[18px] font-semibold text-ink">Yeni fırsat</Dialog.Title>
            <Dialog.Close className="grid size-10 place-items-center rounded-[9px] text-muted hover:bg-sunken" aria-label="Kapat">
              <X className="size-5" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">Yeni fırsat formu</Dialog.Description>
          <form onSubmit={submit} className="mt-3 grid gap-3">
            <label className="grid gap-1 text-[13px] text-muted">
              Fırsat adı
              <input id="yeni-firsat-ad" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Web sitesi yenileme · Firma adı" className={field} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1 text-[13px] text-muted">
                Tutar (₺, KDV hariç)
                <input id="yeni-firsat-tutar" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} placeholder="25000" className={field} />
              </label>
              <label className="grid gap-1 text-[13px] text-muted">
                Aşama
                <select id="yeni-firsat-asama" value={stage} onChange={(e) => setStage(e.target.value)} className={field}>
                  {OPEN.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="grid gap-1 text-[13px] text-muted">
              Tahmini kapanış
              <input id="yeni-firsat-kapanis" type="date" value={close} onChange={(e) => setClose(e.target.value)} className={field} />
            </label>
            <div className="grid gap-1 text-[13px] text-muted">
              <label htmlFor="yeni-firsat-kisi">Kişi</label>
              {contact ? (
                <div className="flex min-h-10 items-center justify-between gap-2 rounded-[9px] border border-line px-3">
                  <span className="text-[14px] text-ink">{contact.name}</span>
                  <button type="button" className="text-[13px] text-accent" onClick={() => setContact(null)}>
                    Değiştir
                  </button>
                </div>
              ) : (
                <>
                  <input id="yeni-firsat-kisi" value={cq} onChange={(e) => searchContact(e.target.value)} placeholder="Ad ya da e-posta yazın (isteğe bağlı)" className={field} autoComplete="off" />
                  {hits.length ? (
                    <ul className="m-0 list-none overflow-hidden rounded-[9px] border border-line p-0">
                      {hits.map((h) => (
                        <li key={h.id}>
                          <button type="button" onClick={() => setContact({ id: h.id, name: h.name })} className="flex min-h-10 w-full items-center justify-between gap-2 px-3 text-left hover:bg-sunken">
                            <span className="text-[14px] text-ink">{h.name}</span>
                            <span className="truncate text-[12px] text-muted">{h.detail}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </>
              )}
            </div>
            <div className="mt-1 flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button type="button">Vazgeç</Button>
              </Dialog.Close>
              <Button type="submit" variant="primary" disabled={pending || !title.trim()}>
                Fırsatı aç
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DealSheet({ detail, hasOps, onClose, onMove, pending }: { detail: DealDetail | null; hasOps: boolean; onClose: () => void; onMove: (stage: string) => void; pending: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState("");
  const [busy, start] = useTransition();
  const [form, setForm] = useState<{ title: string; value: string; expectedClose: string; service: string; notes: string } | null>(null);
  const [forId, setForId] = useState<number | null>(null);
  /* Başka fırsat açılınca düzenleme formu kapanır */
  if ((detail?.id ?? null) !== forId) {
    setForId(detail?.id ?? null);
    setEditing(false);
    setNote("");
  }
  const startEdit = () => {
    if (!detail) return;
    setForm({ title: detail.title, value: detail.value ? String(detail.value) : "", expectedClose: detail.expectedClose, service: detail.service, notes: detail.notes });
    setEditing(true);
  };
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail || !form) return;
    start(async () => {
      const r = await updateDeal(detail.id, { title: form.title, value: form.value ? Number(form.value.replace(/\./g, "").replace(",", ".")) : null, expectedClose: form.expectedClose || null, service: form.service, notes: form.notes });
      if (!r.ok) return void toast.error(r.error ?? "Kaydedilemedi.");
      toast.success("Kaydedildi.");
      setEditing(false);
      router.refresh();
    });
  };
  const doNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail || !note.trim()) return;
    start(async () => {
      const r = await addNote(detail.id, note);
      if (!r.ok) return void toast.error(r.error ?? "Not eklenemedi.");
      setNote("");
      toast.success("Not eklendi.");
      router.refresh();
    });
  };
  const doCall = () =>
    detail &&
    start(async () => {
      const r = await scheduleCall(detail.id);
      if (!r.ok) return void toast.error(r.error ?? "Planlanamadı.");
      toast.success("Arama bir sonraki iş günü 10:00 için planlandı; o gün ana sayfada görünür.");
      router.refresh();
    });
  const field = "block w-full rounded-[9px] border border-line bg-surface px-3 min-h-10 text-[14px] text-ink focus:border-accent focus:outline-none";

  return (
    <Sheet open={Boolean(detail)} onOpenChange={(o) => !o && onClose()} title={detail?.title ?? ""} description={detail ? [detail.who, money.format(detail.value)].filter(Boolean).join(" · ") : undefined}>
      {detail ? (
        <>
          <SheetSection title="Aşama">
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Aşama">
              {ALL.map((s) => (
                <Button key={s.id} size="sm" variant={detail.stage === s.id ? "primary" : "secondary"} aria-pressed={detail.stage === s.id} disabled={pending} onClick={() => detail.stage !== s.id && onMove(s.id)}>
                  {s.label}
                </Button>
              ))}
            </div>
            {detail.stage === "kaybedildi" && detail.lostReason ? <p className="mt-2 mb-0 text-[14px] text-muted">Neden: {detail.lostReason}</p> : null}
          </SheetSection>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" onClick={doCall} disabled={busy}>
              <Phone /> Arama planla
            </Button>
            <Button size="sm" asChild>
              <a href={`/panel/teklifler/yeni?firsat=${detail.id}`}>Teklif hazırla</a>
            </Button>
            {hasOps && detail.stage === "kazanildi" && !detail.projects.length ? (
              <Button size="sm" variant="primary" asChild>
                <a href={`/panel/projeler?yeni=1&firsat=${detail.id}`}>Proje aç</a>
              </Button>
            ) : null}
            {!editing ? (
              <Button size="sm" variant="ghost" onClick={startEdit}>
                Düzenle
              </Button>
            ) : null}
          </div>

          {editing && form ? (
            <form onSubmit={save} className="mt-4 grid gap-3 rounded-card border border-line p-3">
              <label className="grid gap-1 text-[13px] text-muted">
                Fırsat adı
                <input id="firsat-ad" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={field} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1 text-[13px] text-muted">
                  Tutar (₺, KDV hariç)
                  <input id="firsat-tutar" inputMode="decimal" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className={field} />
                </label>
                <label className="grid gap-1 text-[13px] text-muted">
                  Tahmini kapanış
                  <input id="firsat-kapanis" type="date" value={form.expectedClose} onChange={(e) => setForm({ ...form, expectedClose: e.target.value })} className={field} />
                </label>
              </div>
              <label className="grid gap-1 text-[13px] text-muted">
                Hizmet ya da ürün
                <input id="firsat-hizmet" list="firsat-hizmet-liste" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} placeholder="Listeden seçin ya da yazın" className={field} />
                <datalist id="firsat-hizmet-liste">
                  {OFFERINGS.map((o) => (
                    <option key={o} value={o} />
                  ))}
                </datalist>
              </label>
              <label className="grid gap-1 text-[13px] text-muted">
                Notlar
                <textarea id="firsat-notlar" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={cn(field, "py-2")} />
              </label>
              <div className="flex justify-end gap-2">
                <Button type="button" size="sm" onClick={() => setEditing(false)}>
                  Vazgeç
                </Button>
                <Button type="submit" size="sm" variant="primary" disabled={busy}>
                  Kaydet
                </Button>
              </div>
            </form>
          ) : (
            <SheetSection title="Bilgiler">
              <Fields
                rows={[
                  ["Kişi", detail.contact ? <a href={`/panel/kisiler?kisi=${detail.contact.id}`} className="text-accent">{detail.contact.name}</a> : ""],
                  ["İletişim", detail.contact ? [detail.contact.email, detail.contact.phone].filter(Boolean).join(" · ") : ""],
                  ["Firma", detail.company ? <a href={`/panel/kisiler?firma=${detail.company.id}`} className="text-accent">{detail.company.name}</a> : ""],
                  ["Tutar", <span key="v" className="tabular">{money.format(detail.value)}</span>],
                  ["Tahmini kapanış", detail.expectedClose ? dayFmt.format(new Date(detail.expectedClose)) : ""],
                  ["Hizmet", detail.service],
                  ["Sorumlu", detail.ownerName],
                  ["Açılış", detail.created],
                ]}
              />
              {detail.notes ? <p className="mt-3 mb-0 whitespace-pre-wrap text-[14px] text-ink">{detail.notes}</p> : null}
              {detail.leadKey ? (
                <a href={`/panel/gelen?s=${detail.leadKey}`} className="mt-2 inline-block text-[14px] text-accent">
                  Geldiği talebi aç
                </a>
              ) : null}
            </SheetSection>
          )}

          {detail.quotes.length ? (
            <SheetSection title="Teklifler">
              <ul className="m-0 list-none p-0">
                {detail.quotes.map((qt) => (
                  <li key={qt.id}>
                    <a href={`/panel/teklifler/${qt.id}`} className="flex min-h-10 items-center justify-between gap-3 rounded-[8px] px-2 no-underline hover:bg-sunken">
                      <span className="min-w-0 truncate text-ink">
                        <span className="font-mono text-[12px] text-muted">{qt.number}</span> {qt.title}
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <Badge>{qt.status}</Badge>
                        <span className="tabular text-[13px] text-muted">{money.format(qt.total)}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </SheetSection>
          ) : null}

          {detail.projects.length ? (
            <SheetSection title="Proje">
              {detail.projects.map((p) => (
                <a key={p.id} href={`/panel/projeler?proje=${p.id}`} className="block text-[14px] text-accent">
                  {p.title}
                </a>
              ))}
            </SheetSection>
          ) : null}

          <SheetSection title="Not ekle">
            <form onSubmit={doNote} className="flex items-end gap-2">
              <label className="min-w-0 flex-1">
                <span className="sr-only">Not</span>
                <textarea id="firsat-not" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Görüşmede ne konuşuldu?" className={cn(field, "py-2")} />
              </label>
              <Button type="submit" size="sm" variant="primary" disabled={busy || !note.trim()}>
                Ekle
              </Button>
            </form>
          </SheetSection>

          <SheetSection title="Geçmiş">
            {detail.timeline.length ? (
              <ul className="m-0 ml-1.5 list-none border-l-2 border-line p-0">
                {detail.timeline.map((t) => (
                  <li key={t.id} className={cn("relative pb-3.5 pl-4 text-[14px] before:absolute before:top-1.5 before:-left-[7px] before:size-3 before:rounded-full before:border-2 before:bg-surface", t.open ? "before:border-warn" : "before:border-accent")}>
                    <span className="text-ink">{t.title}</span>
                    {t.open ? <Badge tone="warn" className="ml-2">Yapılacak</Badge> : null}
                    {t.body ? <span className="block whitespace-pre-wrap text-[13px] text-text">{t.body}</span> : null}
                    <span className="block text-[13px] text-muted">{t.detail}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="m-0 text-[14px] text-muted">Henüz kayıt yok.</p>
            )}
          </SheetSection>
        </>
      ) : null}
    </Sheet>
  );
}
