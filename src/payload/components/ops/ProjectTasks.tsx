"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useDocumentInfo } from "@payloadcms/ui";
import { TASK_STAGES, taskCode, taskStageLabel } from "@/payload/ops/stages";
import { fmtDay, getDocs, listUrl, send } from "../crm/api";

/**
 * İş sayfasının altında: ilerleme, aşamalara göre görevler ve hızlı görev
 * ekleme. Veri tutmaz (ui alanı); REST ile okur ve yazar.
 */
type Id = number | string;
type Task = { id: Id; seq?: number | null; title: string; stage: string; dueDate?: string | null; assignee?: { id: Id; name: string } | Id | null };
type User = { id: Id; name: string };

const today = () => new Date(Date.now() + 3 * 3600000).toISOString().slice(0, 10);

export function ProjectTasks() {
  const { id } = useDocumentInfo();
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [tick, setTick] = useState(0);
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState("");
  const [due, setDue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let alive = true;
    Promise.all([
      getDocs<Task>(listUrl("tasks", { project: { equals: id } }, { sort: "dueDate", limit: 200, depth: 1 })),
      getDocs<User>("/api/users?limit=100&depth=0&sort=name"),
    ]).then(([t, u]) => {
      if (!alive) return;
      setTasks(t);
      setUsers(u);
    });
    return () => {
      alive = false;
    };
  }, [id, tick]);

  if (!id) return <p className="guru-crm__hint">Kaydettikten sonra işin görevleri burada görünür. Şablon seçtiyseniz görevler kendiliğinden açılır.</p>;
  if (!tasks) return <p className="guru-crm__hint">Görevler yükleniyor…</p>;

  const done = tasks.filter((t) => t.stage === "tamam").length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const now = today();

  const add = async () => {
    if (!title.trim()) return setError("Görevin adını yazın.");
    setBusy(true);
    setError("");
    try {
      await send("POST", "/api/tasks", { title: title.trim(), project: id, assignee: assignee || undefined, dueDate: due ? `${due}T12:00:00.000Z` : undefined });
      setTitle("");
      setTick((t) => t + 1);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="guru-crm guru-ops">
      <div className="guru-ops__progress">
        <div className="guru-home__panel-head">
          <h3 className="guru-crm__h">Görevler</h3>
          <Link href={`/admin/operasyon?is=${id}`}>Panoda aç</Link>
        </div>
        <div className="guru-home__progress" aria-hidden>
          <span style={{ width: `${pct}%`, background: "var(--guru-navy)" }} />
        </div>
        <small>
          {tasks.length ? `${tasks.length} görevden ${done} tanesi tamam (%${pct})` : "Henüz görev yok."}
        </small>
      </div>

      {TASK_STAGES.map((s) => {
        const list = tasks.filter((t) => t.stage === s.value);
        if (!list.length) return null;
        return (
          <section key={s.value}>
            <h3 className="guru-crm__h">
              {s.label} <span className="guru-ops__count">{list.length}</span>
            </h3>
            <ul className="guru-crm__links guru-ops__list">
              {list.map((t) => {
                const who = t.assignee && typeof t.assignee === "object" ? t.assignee.name : "Atanmadı";
                const late = t.stage !== "tamam" && t.dueDate && t.dueDate.slice(0, 10) < now;
                return (
                  <li key={t.id}>
                    <Link href={`/admin/collections/tasks/${t.id}`}>
                      <b>
                        {taskCode(t.seq)} {t.title}
                      </b>
                      <small className={late ? "guru-pipe__late" : undefined}>
                        {[who, t.dueDate ? `${late ? "Gecikti · " : ""}${fmtDay(t.dueDate)}` : null, taskStageLabel(t.stage)].filter(Boolean).join(" · ")}
                      </small>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <div className="guru-crm__add">
        <h3 className="guru-crm__h">Görev ekleyin</h3>
        <input
          className="guru-crm__input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void add();
            }
          }}
          placeholder="Ne yapılacak?"
          aria-label="Görev"
        />
        <div className="guru-crm__row">
          <label className="guru-crm__due">
            <span>Sorumlu</span>
            <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
              <option value="">Atanmadı</option>
              {users.map((u) => (
                <option key={u.id} value={String(u.id)}>
                  {u.name}
                </option>
              ))}
            </select>
          </label>
          <label className="guru-crm__due guru-ops__due">
            <span>Teslim</span>
            <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </label>
          <button type="button" className="guru-crm__save" onClick={add} disabled={busy}>
            {busy ? "Ekleniyor…" : "Ekle"}
          </button>
        </div>
        {error ? <p className="guru-crm__error">{error}</p> : null}
      </div>
    </div>
  );
}
