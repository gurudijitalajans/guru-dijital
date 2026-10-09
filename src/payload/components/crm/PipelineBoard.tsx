"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DEAL_STAGES, OPEN_STAGES, type DealStage } from "@/payload/crm/stages";
import { fmtDay, fmtMoney, send } from "./api";

export type BoardDeal = {
  id: number | string;
  title: string;
  stage: string;
  value: number | null;
  order: number | null;
  contact: string;
  company: string;
  owner: { id: number | string; name: string } | null;
  expectedClose: string | null;
  updatedAt: string;
  late: boolean;
};

const byOrder = (a: BoardDeal, b: BoardDeal) => (a.order ?? Infinity) - (b.order ?? Infinity) || b.updatedAt.localeCompare(a.updatedAt);

export function PipelineBoard({ deals: initial, me }: { deals: BoardDeal[]; me: number | string }) {
  const [deals, setDeals] = useState(initial);
  const [mine, setMine] = useState(false);
  const [q, setQ] = useState("");
  const [drag, setDrag] = useState<BoardDeal["id"] | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [error, setError] = useState("");

  const visible = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase("tr-TR");
    return deals.filter(
      (d) =>
        (!mine || d.owner?.id === me) &&
        (!needle || [d.title, d.contact, d.company].some((t) => t.toLocaleLowerCase("tr-TR").includes(needle))),
    );
  }, [deals, mine, q, me]);

  const openTotal = visible.filter((d) => OPEN_STAGES.includes(d.stage as DealStage)).reduce((s, d) => s + (d.value ?? 0), 0);
  const won = visible.filter((d) => d.stage === "kazanildi").reduce((s, d) => s + (d.value ?? 0), 0);

  /** Kartı `stage` sütununa, `before` kartının önüne (yoksa sona) taşır */
  const move = async (id: BoardDeal["id"], stage: string, before?: BoardDeal["id"]) => {
    const deal = deals.find((d) => d.id === id);
    if (!deal) return;
    const col = deals.filter((d) => d.stage === stage && d.id !== id).sort(byOrder);
    const idx = before !== undefined ? col.findIndex((d) => d.id === before) : col.length;
    const at = idx < 0 ? col.length : idx;
    const prev = col[at - 1]?.order ?? (col[at] ? (col[at].order ?? at) - 1 : 0);
    const next = col[at]?.order ?? prev + 2;
    const order = (prev + next) / 2;
    if (deal.stage === stage && deal.order === order) return;
    const snapshot = deals;
    setDeals((list) => list.map((d) => (d.id === id ? { ...d, stage, order, updatedAt: new Date().toISOString() } : d)));
    setError("");
    try {
      await send("PATCH", `/api/deals/${id}`, { stage, order });
    } catch (e) {
      setDeals(snapshot);
      setError((e as Error).message);
    }
  };

  return (
    <div className="guru-pipe">
      <header className="guru-pipe__head">
        <div>
          <h1>Satış hattı</h1>
          <p>
            Açık fırsatlar <b>{fmtMoney(openTotal)}</b> · Son 30 günde kazanılan <b>{fmtMoney(won)}</b>
          </p>
        </div>
        <div className="guru-pipe__tools">
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Fırsat, kişi ya da firma ara" aria-label="Ara" />
          <button type="button" aria-pressed={mine} className={mine ? "is-on" : undefined} onClick={() => setMine((v) => !v)}>
            Yalnız benimkiler
          </button>
          <Link href="/admin/collections/deals/create" className="guru-pipe__new">
            Yeni fırsat
          </Link>
        </div>
      </header>
      {error ? <p className="guru-crm__error" role="alert">{error}</p> : null}

      <div className="guru-pipe__board">
        {DEAL_STAGES.map((s) => {
          const col = visible.filter((d) => d.stage === s.value).sort(byOrder);
          const total = col.reduce((sum, d) => sum + (d.value ?? 0), 0);
          return (
            <section
              key={s.value}
              className={`guru-pipe__col guru-pipe__col--${s.value}${over === s.value ? " is-over" : ""}`}
              aria-label={s.label}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(s.value);
              }}
              onDragLeave={() => setOver((o) => (o === s.value ? null : o))}
              onDrop={(e) => {
                e.preventDefault();
                setOver(null);
                if (drag !== null) void move(drag, s.value);
                setDrag(null);
              }}
            >
              <header>
                <h2>
                  {s.label} <span>{col.length}</span>
                </h2>
                <small>{fmtMoney(total)}</small>
              </header>
              {col.length === 0 ? <p className="guru-pipe__empty">{s.value === "aday" ? "Siteden gelen talepler buraya düşer." : "Kartı buraya sürükleyin."}</p> : null}
              <ul>
                {col.map((d) => (
                  <li
                    key={d.id}
                    draggable
                    className={`guru-pipe__card${drag === d.id ? " is-drag" : ""}`}
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = "move";
                      setDrag(d.id);
                    }}
                    onDragEnd={() => setDrag(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOver(null);
                      if (drag !== null && drag !== d.id) void move(drag, s.value, d.id);
                      setDrag(null);
                    }}
                  >
                    <Link href={`/admin/collections/deals/${d.id}`} className="guru-pipe__title">
                      {d.title}
                    </Link>
                    <span className="guru-pipe__who">{[d.company, d.contact].filter(Boolean).join(" · ") || "Kişi eklenmedi"}</span>
                    <div className="guru-pipe__meta">
                      <b>{d.value ? fmtMoney(d.value) : "Tutar yok"}</b>
                      {d.expectedClose ? <span>{fmtDay(d.expectedClose)}</span> : null}
                      {d.late ? <span className="guru-pipe__late">Geciken görev</span> : null}
                    </div>
                    <label className="guru-pipe__stage">
                      <span className="sr-only">Aşama</span>
                      <select value={d.stage} onChange={(e) => void move(d.id, e.target.value)}>
                        {DEAL_STAGES.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
