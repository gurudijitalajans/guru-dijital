"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { fmtStamp, getDocs, send } from "../crm/api";

/**
 * Gelen kutusu: solda sohbetler, sağda yazışma. Liste 6, açık sohbet 4
 * saniyede bir yenilenir. Ekip yazınca asistan o sohbette susar; "Asistana
 * geri ver" ile yeniden devreye girer.
 */
type Id = number | string;
type Conv = {
  id: Id;
  label?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  topic?: string | null;
  page?: string | null;
  lastText?: string | null;
  lastMessageAt?: string | null;
  status: string;
  needsReply?: boolean | null;
  contact?: Id | null;
  lead?: Id | null;
  booking?: Id | null;
};
type Message = { id: Id; role: string; text: string; createdAt: string; unanswered?: boolean | null; author?: { name: string } | Id | null };

const FILTERS = [
  { key: "bekleyen", label: "Yanıt bekleyen", where: "where[needsReply][equals]=true" },
  { key: "ekip", label: "Ekipte", where: "where[status][equals]=ekip" },
  { key: "bot", label: "Asistanda", where: "where[status][equals]=bot" },
  { key: "tumu", label: "Tümü", where: "" },
  { key: "kapali", label: "Kapanan", where: "where[status][equals]=kapali" },
];
const STATUS: Record<string, string> = { bot: "Asistan", ekip: "Ekipte", kapali: "Kapandı" };

export function Inbox({ canned, initialId }: { canned: { label: string; text: string }[]; initialId: string }) {
  const [filter, setFilter] = useState(initialId ? "tumu" : "bekleyen");
  const [list, setList] = useState<Conv[] | null>(null);
  const [selected, setSelected] = useState<string>(initialId);
  const [conv, setConv] = useState<Conv | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [tick, setTick] = useState(0);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const refresh = () => setTick((t) => t + 1);

  useEffect(() => {
    const where = FILTERS.find((f) => f.key === filter)?.where;
    const run = () =>
      getDocs<Conv>(`/api/conversations?sort=-lastMessageAt&limit=60&depth=0${where ? `&${where}` : ""}`).then((docs) => setList(docs));
    run();
    const t = setInterval(run, 6000);
    return () => clearInterval(t);
  }, [filter, tick]);

  useEffect(() => {
    if (!selected) return;
    let alive = true;
    const run = () =>
      Promise.all([
        fetch(`/api/conversations/${selected}?depth=0`, { credentials: "same-origin" }).then((r) => (r.ok ? (r.json() as Promise<Conv>) : null)),
        getDocs<Message>(`/api/chat-messages?where[conversation][equals]=${selected}&sort=createdAt&limit=300&depth=1`),
      ]).then(([c, m]) => {
        if (!alive) return;
        setConv(c);
        setMessages((old) => (old.length === m.length && old[old.length - 1]?.id === m[m.length - 1]?.id ? old : m));
      });
    run();
    const t = setInterval(run, 4000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [selected, tick]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, selected]);

  const act = async (data: Record<string, unknown>) => {
    if (!conv) return;
    setError("");
    try {
      await send("PATCH", `/api/conversations/${conv.id}`, data);
      refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const submit = async () => {
    if (!conv || !reply.trim()) return;
    setBusy(true);
    setError("");
    try {
      await send("POST", "/api/chat-messages", { conversation: conv.id, role: "ekip", text: reply.trim() });
      setReply("");
      refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`guru-inbox${selected ? " has-thread" : ""}`}>
      <aside className="guru-inbox__list" aria-label="Sohbetler">
        <div className="guru-inbox__filters" role="tablist">
          {FILTERS.map((f) => (
            <button key={f.key} type="button" role="tab" aria-selected={filter === f.key} className={filter === f.key ? "is-on" : undefined} onClick={() => setFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>
        {!list ? (
          <p className="guru-crm__hint">Yükleniyor…</p>
        ) : list.length === 0 ? (
          <p className="guru-crm__hint">{filter === "bekleyen" ? "Yanıt bekleyen sohbet yok." : "Bu görünümde sohbet yok."}</p>
        ) : (
          <ul>
            {list.map((c) => (
              <li key={c.id}>
                <button type="button" className={`guru-inbox__item${String(c.id) === selected ? " is-active" : ""}`} onClick={() => setSelected(String(c.id))}>
                  <span className="guru-inbox__row">
                    <b>{c.label || "Ziyaretçi"}</b>
                    {c.lastMessageAt ? <small>{fmtStamp(c.lastMessageAt)}</small> : null}
                  </span>
                  <span className="guru-inbox__last">{c.lastText}</span>
                  <span className="guru-inbox__row">
                    <small>{[STATUS[c.status], c.topic].filter(Boolean).join(" · ")}</small>
                    {c.needsReply ? <span className="guru-home__pill guru-home__pill--yeni">Yanıt bekliyor</span> : null}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <section className="guru-inbox__thread" aria-label="Yazışma">
        {!selected || !conv ? (
          <p className="guru-crm__hint guru-inbox__empty">Soldan bir sohbet seçin.</p>
        ) : (
          <>
            <header className="guru-inbox__head">
              <button type="button" className="guru-inbox__back" onClick={() => setSelected("")}>
                ← Sohbetler
              </button>
              <div className="guru-inbox__who">
                <b>{conv.label || "Ziyaretçi"}</b>
                <small>{[conv.email, conv.phone, conv.page && `Sayfa: ${conv.page}`].filter(Boolean).join(" · ") || "Ziyaretçi henüz bilgi bırakmadı"}</small>
              </div>
              <div className="guru-inbox__actions">
                {conv.contact ? <Link href={`/admin/collections/contacts/${conv.contact}`}>Kişi</Link> : null}
                {conv.lead ? <Link href={`/admin/collections/leads/${conv.lead}`}>Talep</Link> : null}
                {conv.booking ? <Link href={`/admin/collections/bookings/${conv.booking}`}>Randevu</Link> : null}
                {conv.status !== "ekip" ? (
                  <button type="button" onClick={() => act({ status: "ekip", needsReply: true })}>
                    Devral
                  </button>
                ) : (
                  <button type="button" onClick={() => act({ status: "bot", needsReply: false })}>
                    Asistana geri ver
                  </button>
                )}
                {conv.status !== "kapali" ? (
                  <button type="button" onClick={() => act({ status: "kapali", needsReply: false })}>
                    Kapat
                  </button>
                ) : null}
              </div>
            </header>
            <div className="guru-inbox__msgs" aria-live="polite">
              {messages.map((m) => (
                <div key={m.id} className={`guru-inbox__msg guru-inbox__msg--${m.role}`}>
                  <p>{m.text}</p>
                  <small>
                    {m.role === "ziyaretci" ? "Ziyaretçi" : m.role === "bot" ? "Asistan" : m.role === "ekip" ? (m.author && typeof m.author === "object" ? m.author.name : "Ekip") : "Bilgi"} · {fmtStamp(m.createdAt)}
                    {m.unanswered ? " · asistan yanıtlayamadı" : ""}
                  </small>
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <div className="guru-inbox__compose">
              {canned.length ? (
                <div className="guru-crm__types">
                  {canned.map((c) => (
                    <button key={c.label} type="button" onClick={() => setReply((r) => (r ? `${r} ${c.text}` : c.text))}>
                      {c.label}
                    </button>
                  ))}
                </div>
              ) : null}
              <textarea
                className="guru-crm__input"
                rows={3}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void submit();
                  }
                }}
                placeholder={conv.status === "kapali" ? "Sohbet kapandı; yazarsanız yeniden açılır." : "Yanıtınızı yazın (Enter gönderir, Shift+Enter yeni satır)"}
                aria-label="Yanıt"
              />
              <div className="guru-crm__row">
                <small className="guru-inbox__note">Yazdığınızda asistan bu sohbette susar; ziyaretçi yanıtı birkaç saniye içinde görür.</small>
                <button type="button" className="guru-crm__save" onClick={submit} disabled={busy || !reply.trim()}>
                  {busy ? "Gönderiliyor…" : "Gönder"}
                </button>
              </div>
              {error ? <p className="guru-crm__error">{error}</p> : null}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
