"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useDocumentInfo, useFormFields } from "@payloadcms/ui";
import { activityLabel, stageLabel } from "@/payload/crm/stages";
import { fmtDay, fmtMoney, fmtStamp, getDocs, listUrl, send } from "./api";

/**
 * Kişi, firma ve fırsat sayfalarının altında: açık görevler, hızlı not/görev
 * ekleme, bağlı kayıtlar (fırsat, teklif, talep, randevu) ve geçmiş.
 * Veri tutmaz (ui alanı); REST ile okur ve yazar.
 */

type Kind = "contact" | "company" | "deal";
type Id = number | string;
type Activity = { id: Id; type: string; title: string; body?: string | null; dueAt?: string | null; done?: boolean; createdAt: string };
type Link_ = { href: string; label: string; meta: string };
type Entry = { key: string; when: string; badge: string; title: string; body?: string | null; href?: string };
type Loaded = { activities: Activity[]; links: Link_[]; extra: Entry[] };

async function fetchAll(kind: Kind, id: Id): Promise<Loaded> {
  type Deal = { id: Id; title: string; stage: string; value?: number | null };
  type Quote = { id: Id; number: string; title: string; status: string; total?: number | null };
  type Lead = { id: Id; subject?: string | null; service?: string | null; message: string; createdAt: string };
  type Booking = { id: Id; topic?: string | null; date: string; time: string; status: string; createdAt: string };
  type Person = { id: Id; name: string; title?: string | null };
  const [activities, deals, quotes, leads, bookings, people] = await Promise.all([
    getDocs<Activity>(listUrl("activities", { [kind]: { equals: id } }, { limit: 100 })),
    kind === "deal" ? Promise.resolve([] as Deal[]) : getDocs<Deal>(listUrl("deals", { [kind]: { equals: id } })),
    getDocs<Quote>(listUrl("quotes", { [kind]: { equals: id } })),
    kind === "contact" ? getDocs<Lead>(listUrl("leads", { contact: { equals: id } })) : Promise.resolve([] as Lead[]),
    kind === "contact" ? getDocs<Booking>(listUrl("bookings", { contact: { equals: id } })) : Promise.resolve([] as Booking[]),
    kind === "company" ? getDocs<Person>(listUrl("contacts", { company: { equals: id } })) : Promise.resolve([] as Person[]),
  ]);
  return {
    activities,
    links: [
      ...people.map((p) => ({ href: `/admin/collections/contacts/${p.id}`, label: p.name, meta: p.title || "Kişi" })),
      ...deals.map((d) => ({ href: `/admin/collections/deals/${d.id}`, label: d.title, meta: `${stageLabel(d.stage)}${d.value ? ` · ${fmtMoney(d.value)}` : ""}` })),
      ...quotes.map((q) => ({ href: `/admin/collections/quotes/${q.id}`, label: `${q.number} · ${q.title}`, meta: fmtMoney(q.total) })),
    ],
    extra: [
      ...leads.map((l) => ({ key: `l${l.id}`, when: l.createdAt, badge: "Talep", title: l.subject || l.service || "Siteden talep", body: l.message, href: `/admin/collections/leads/${l.id}` })),
      ...bookings.map((b) => ({ key: `b${b.id}`, when: b.createdAt, badge: "Randevu", title: `${fmtDay(b.date)} ${b.time}${b.topic ? ` · ${b.topic}` : ""}`, href: `/admin/collections/bookings/${b.id}` })),
    ],
  };
}

const TYPES = [
  { value: "not", label: "Not" },
  { value: "arama", label: "Arama" },
  { value: "eposta", label: "E-posta" },
  { value: "toplanti", label: "Toplantı" },
  { value: "gorev", label: "Görev" },
];
const relId = (v: unknown): Id | undefined => (v && typeof v === "object" ? (v as { id?: Id }).id : ((v as Id) ?? undefined));
/* datetime-local değeri İstanbul saatidir (UTC+3, yaz saati yok) */
const fromLocal = (v: string) => (v ? new Date(`${v}:00+03:00`).toISOString() : undefined);
/* Varsayılan son tarih: ertesi iş günü 10:00 */
const tomorrowLocal = () => {
  const d = new Date(Date.now() + 3 * 3600000);
  do d.setUTCDate(d.getUTCDate() + 1);
  while (d.getUTCDay() === 0 || d.getUTCDay() === 6);
  return `${d.toISOString().slice(0, 10)}T10:00`;
};

export function Timeline({ kind }: { kind: Kind }) {
  const { id } = useDocumentInfo();
  const contact = useFormFields(([f]) => f.contact?.value);
  const company = useFormFields(([f]) => f.company?.value);
  const [state, setState] = useState<Loaded | null>(null);
  const [tick, setTick] = useState(0);
  const load = () => setTick((t) => t + 1);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    fetchAll(kind, id).then((r) => {
      if (alive) setState(r);
    });
    return () => {
      alive = false;
    };
  }, [id, kind, tick]);

  const activities = state?.activities ?? [];
  const setActivities = (fn: (list: Activity[]) => Activity[]) => setState((s) => (s ? { ...s, activities: fn(s.activities) } : s));
  const links = state?.links ?? [];
  const extra = state?.extra ?? [];
  const loaded = state !== null;

  if (!id) return <p className="guru-crm__hint">Kaydettikten sonra notlar, görevler ve geçmiş burada görünür.</p>;

  const open = activities.filter((a) => !a.done && (a.type === "gorev" || a.type === "toplanti")).sort((a, b) => (a.dueAt ?? "").localeCompare(b.dueAt ?? ""));
  const history: Entry[] = [
    ...activities
      .filter((a) => !open.includes(a))
      .map((a) => ({ key: `a${a.id}`, when: a.createdAt, badge: activityLabel(a.type), title: a.title, body: a.body, href: `/admin/collections/activities/${a.id}` })),
    ...extra,
  ].sort((a, b) => b.when.localeCompare(a.when));

  const toggle = async (a: Activity) => {
    setActivities((list) => list.map((x) => (x.id === a.id ? { ...x, done: !x.done } : x)));
    await send("PATCH", `/api/activities/${a.id}`, { done: !a.done }).catch(() => load());
  };

  const relations = {
    [kind]: id,
    ...(kind !== "contact" && relId(contact) ? { contact: relId(contact) } : {}),
    ...(kind !== "company" && relId(company) ? { company: relId(company) } : {}),
  };

  return (
    <div className="guru-crm">
      <h3 className="guru-crm__h guru-crm__h--top">Not ya da görev ekleyin</h3>
      <QuickAdd relations={relations} onSaved={load} />
      {open.length > 0 && (
        <section>
          <h3 className="guru-crm__h">Açık görevler</h3>
          <ul className="guru-crm__tasks">
            {open.map((a) => (
              <li key={a.id} className={a.dueAt && a.dueAt < new Date().toISOString() ? "is-late" : undefined}>
                <label>
                  <input type="checkbox" checked={Boolean(a.done)} onChange={() => toggle(a)} />
                  <span>
                    <b>{a.title}</b>
                    <small>
                      {activityLabel(a.type)}
                      {a.dueAt ? ` · ${fmtStamp(a.dueAt)}` : ""}
                    </small>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}
      {links.length > 0 && (
        <section>
          <h3 className="guru-crm__h">Bağlı kayıtlar</h3>
          <ul className="guru-crm__links">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>
                  <b>{l.label}</b>
                  <small>{l.meta}</small>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section>
        <h3 className="guru-crm__h">Geçmiş</h3>
        {!loaded ? (
          <p className="guru-crm__hint">Yükleniyor…</p>
        ) : history.length === 0 ? (
          <p className="guru-crm__hint">Henüz kayıt yok. Yukarıdan ilk notu ekleyin.</p>
        ) : (
          <ol className="guru-crm__feed">
            {history.map((e) => (
              <li key={e.key}>
                <span className="guru-crm__badge">{e.badge}</span>
                <div>
                  {e.href ? (
                    <Link href={e.href}>
                      <b>{e.title}</b>
                    </Link>
                  ) : (
                    <b>{e.title}</b>
                  )}
                  {e.body ? <p>{e.body}</p> : null}
                  <small>{fmtStamp(e.when)}</small>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function QuickAdd({ relations, onSaved }: { relations: Record<string, unknown>; onSaved: () => void }) {
  const [type, setType] = useState("not");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [due, setDue] = useState(tomorrowLocal);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const timed = type === "gorev" || type === "toplanti";

  const save = async () => {
    if (!title.trim()) return setError("Kısa bir başlık yazın.");
    setBusy(true);
    setError("");
    try {
      await send("POST", "/api/activities", { type, title: title.trim(), body: body.trim() || undefined, dueAt: timed ? fromLocal(due) : undefined, done: !timed, ...relations });
      setTitle("");
      setBody("");
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="guru-crm__add">
      <div className="guru-crm__types" role="radiogroup" aria-label="Kayıt türü">
        {TYPES.map((t) => (
          <button key={t.value} type="button" role="radio" aria-checked={type === t.value} className={type === t.value ? "is-on" : undefined} onClick={() => setType(t.value)}>
            {t.label}
          </button>
        ))}
      </div>
      <input
        className="guru-crm__input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            void save();
          }
        }}
        placeholder={type === "gorev" ? "Ne yapılacak? (ör. Teklifi gönder)" : type === "arama" ? "Görüşmenin özeti" : "Kısa başlık"}
        aria-label="Başlık"
      />
      <textarea className="guru-crm__input" rows={2} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Ayrıntı (isteğe bağlı)" aria-label="Ayrıntı" />
      <div className="guru-crm__row">
        {timed && (
          <label className="guru-crm__due">
            <span>{type === "gorev" ? "Son tarih" : "Toplantı zamanı"}</span>
            <input type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} />
          </label>
        )}
        <button type="button" className="guru-crm__save" onClick={save} disabled={busy}>
          {busy ? "Ekleniyor…" : "Ekle"}
        </button>
      </div>
      {error ? <p className="guru-crm__error">{error}</p> : null}
    </div>
  );
}
