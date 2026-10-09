"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PRIORITIES, TASK_STAGES, priorityLabel, taskCode } from "@/payload/ops/stages";
import { fmtDay, send } from "../crm/api";

export type BoardTask = {
  id: number | string;
  seq: number | null;
  title: string;
  stage: string;
  priority: string;
  order: number | null;
  dueDate: string | null;
  project: { id: number | string; title: string } | null;
  assignee: { id: number | string; name: string } | null;
  checklist: { done: number; total: number };
  updatedAt: string;
};
type Opt = { id: number | string; title?: string; name?: string };

const byOrder = (a: BoardTask, b: BoardTask) =>
  (a.order ?? Infinity) - (b.order ?? Infinity) || (a.dueDate ?? "9").localeCompare(b.dueDate ?? "9") || b.updatedAt.localeCompare(a.updatedAt);
const today = () => new Date(Date.now() + 3 * 3600000).toISOString().slice(0, 10);

export function TaskBoard({ tasks: initial, me, projects, users, initialProject }: { tasks: BoardTask[]; me: number | string; projects: Opt[]; users: Opt[]; initialProject: string }) {
  const [tasks, setTasks] = useState(initial);
  const [project, setProject] = useState(initialProject);
  const [person, setPerson] = useState("");
  const [priority, setPriority] = useState("");
  const [drag, setDrag] = useState<BoardTask["id"] | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [error, setError] = useState("");
  const now = today();

  const visible = useMemo(
    () =>
      tasks.filter(
        (t) =>
          (!project || String(t.project?.id) === project) &&
          (!person || (person === "ben" ? t.assignee?.id === me : person === "yok" ? !t.assignee : String(t.assignee?.id) === person)) &&
          (!priority || t.priority === priority),
      ),
    [tasks, project, person, priority, me],
  );
  const late = visible.filter((t) => t.stage !== "tamam" && t.dueDate && t.dueDate.slice(0, 10) < now).length;
  const review = visible.filter((t) => t.stage === "kontrol").length;

  const move = async (id: BoardTask["id"], stage: string, before?: BoardTask["id"]) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const col = tasks.filter((t) => t.stage === stage && t.id !== id).sort(byOrder);
    const idx = before !== undefined ? col.findIndex((t) => t.id === before) : col.length;
    const at = idx < 0 ? col.length : idx;
    const prev = col[at - 1]?.order ?? (col[at] ? (col[at].order ?? at) - 1 : 0);
    const next = col[at]?.order ?? prev + 2;
    const order = (prev + next) / 2;
    const snapshot = tasks;
    setTasks((list) => list.map((t) => (t.id === id ? { ...t, stage, order } : t)));
    setError("");
    try {
      await send("PATCH", `/api/tasks/${id}`, { stage, order });
    } catch (e) {
      setTasks(snapshot);
      setError((e as Error).message);
    }
  };

  return (
    <div className="guru-pipe">
      <header className="guru-pipe__head">
        <div>
          <h1>Görev panosu</h1>
          <p>
            Açık görev <b>{visible.filter((t) => t.stage !== "tamam").length}</b> · Geciken <b className={late ? "guru-ops__late" : undefined}>{late}</b> · Onay bekleyen <b>{review}</b>
          </p>
        </div>
        <div className="guru-pipe__tools">
          <select value={project} onChange={(e) => setProject(e.target.value)} aria-label="İş">
            <option value="">Tüm işler</option>
            {projects.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.title}
              </option>
            ))}
          </select>
          <select value={person} onChange={(e) => setPerson(e.target.value)} aria-label="Sorumlu">
            <option value="">Herkes</option>
            <option value="ben">Bana atananlar</option>
            <option value="yok">Atanmamış</option>
            {users.map((u) => (
              <option key={u.id} value={String(u.id)}>
                {u.name}
              </option>
            ))}
          </select>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} aria-label="Öncelik">
            <option value="">Her öncelik</option>
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <Link href="/admin/collections/tasks/create" className="guru-pipe__new">
            Yeni görev
          </Link>
        </div>
      </header>
      {error ? (
        <p className="guru-crm__error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="guru-pipe__board guru-ops__board">
        {TASK_STAGES.map((s) => {
          const col = visible.filter((t) => t.stage === s.value).sort(byOrder);
          return (
            <section
              key={s.value}
              className={`guru-pipe__col guru-ops__col--${s.value}${over === s.value ? " is-over" : ""}`}
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
                {s.value === "tamam" ? <small>son 14 gün</small> : null}
              </header>
              {col.length === 0 ? <p className="guru-pipe__empty">{s.value === "kontrol" ? "Onay bekleyen iş yok." : "Kartı buraya sürükleyin."}</p> : null}
              <ul>
                {col.map((t) => {
                  const isLate = t.stage !== "tamam" && t.dueDate && t.dueDate.slice(0, 10) < now;
                  return (
                    <li
                      key={t.id}
                      draggable
                      className={`guru-pipe__card${drag === t.id ? " is-drag" : ""}`}
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = "move";
                        setDrag(t.id);
                      }}
                      onDragEnd={() => setDrag(null)}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOver(null);
                        if (drag !== null && drag !== t.id) void move(drag, s.value, t.id);
                        setDrag(null);
                      }}
                    >
                      <div className="guru-ops__top">
                        <span className="guru-ops__code">{taskCode(t.seq)}</span>
                        {t.priority === "yuksek" || t.priority === "acil" ? <span className={`guru-ops__prio guru-ops__prio--${t.priority}`}>{priorityLabel(t.priority)}</span> : null}
                      </div>
                      <Link href={`/admin/collections/tasks/${t.id}`} className="guru-pipe__title">
                        {t.title}
                      </Link>
                      {t.project ? <span className="guru-pipe__who">{t.project.title}</span> : null}
                      <div className="guru-pipe__meta">
                        <b>{t.assignee?.name ?? "Atanmadı"}</b>
                        {t.dueDate ? <span className={isLate ? "guru-pipe__late" : undefined}>{isLate ? "Gecikti · " : ""}{fmtDay(t.dueDate)}</span> : null}
                        {t.checklist.total ? (
                          <span>
                            ✓ {t.checklist.done}/{t.checklist.total}
                          </span>
                        ) : null}
                      </div>
                      <label className="guru-pipe__stage">
                        <span className="sr-only">Aşama</span>
                        <select value={t.stage} onChange={(e) => void move(t.id, e.target.value)}>
                          {TASK_STAGES.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
