"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, Send, X } from "lucide-react";
import type { ChatInfo } from "@/lib/cms";
import { cn } from "@/lib/utils";

/**
 * Sağ alttaki sohbet balonu (Guru Chatbot). Asistan bilgi tabanıyla yanıtlar;
 * ekip devraldığında yanıtlar aynı pencereye düşer (açıkken 4 saniyede bir
 * yoklanır). Sohbet anahtarı tarayıcıda saklanır; pencere kapanıp açılınca
 * geçmiş geri gelir. Pencere ilk tıklamaya kadar hiçbir istek atmaz.
 */
type Msg = { id: string | number; role: string; text: string; at: string; author?: string };
const KEY = "guru-sohbet";
let seq = 0;
const store = {
  get: (key: string) => {
    try {
      return localStorage.getItem(key) ?? "";
    } catch {
      return "";
    }
  },
  set: (key: string, v: string) => {
    try {
      localStorage.setItem(key, v);
    } catch {
      /* gizli pencere: sohbet yalnız bu sayfada sürer */
    }
  },
};

/* Asistanın site içi bağlantıları (/iletisim, /hizmetler/…) tıklanabilir; dış bağlantı üretilmez */
const LINK_RE = /(\/(?:iletisim|hizmetler|urunler|blog|hakkimizda|referanslar)(?:\/[a-z0-9-]+)?)/g;
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(LINK_RE).map((part, i) =>
        i % 2 === 1 ? (
          <Link key={i} href={part} className="font-medium text-brand underline underline-offset-2">
            {part}
          </Link>
        ) : (
          <span key={i}>{part.replace(/\*\*/g, "")}</span>
        ),
      )}
    </>
  );
}

/* Gömülü mod: müşteri sitesindeki çerçevede (guru-site.js) çalışır; işletme site anahtarından */
type Embed = { key: string; page: string; accent: string; desktop?: boolean };

/* Gömülü modda yalnız tam adresler bağlantı olur ve yeni sekmede açılır */
const URL_RE = /(https:\/\/[^\s)]+[^\s).,;:!?])/g;
function RichUrls({ text }: { text: string }) {
  return (
    <>
      {text.split(URL_RE).map((part, i) =>
        i % 2 === 1 ? (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="font-medium underline underline-offset-2">
            {part}
          </a>
        ) : (
          <span key={i}>{part.replace(/\*\*/g, "")}</span>
        ),
      )}
    </>
  );
}

export function ChatWidget({ info, embed }: { info: ChatInfo; embed?: Embed }) {
  const routePath = usePathname();
  const pathname = embed ? embed.page : routePath;
  const accent = embed?.accent;
  const paint = accent ? { backgroundColor: accent } : undefined;
  const storeKey = embed ? `${KEY}-${embed.key}` : KEY;
  const kq = embed ? `&k=${encodeURIComponent(embed.key)}` : "";
  /* Çerçeveyi büyüten betiğe haber */
  const tell = (open: boolean) => {
    if (embed && window.parent !== window) window.parent.postMessage({ guru: "sohbet", open }, "*");
  };
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [status, setStatus] = useState("bot");
  const [text, setText] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const loaded = useRef(false);

  /* İlk açılışta: kayıtlı sohbet varsa geçmişi getir */
  const openChat = () => {
    setOpen(true);
    tell(true);
    if (loaded.current) return;
    loaded.current = true;
    const saved = store.get(storeKey);
    if (!saved) return;
    setToken(saved);
    fetch(`/api/conversations/gecmis?token=${encodeURIComponent(saved)}${kq}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { messages?: Msg[]; status?: string } | null) => {
        if (j?.messages) {
          setMessages(j.messages);
          setStatus(j.status ?? "bot");
        } else store.set(storeKey, "");
      })
      .catch(() => {});
  };

  /* Açıkken ekip yanıtlarını yokla */
  useEffect(() => {
    /* Gönderim sürerken yoklama yok: geçici mesaj gerçeğiyle değişmeden çift görünmesin */
    if (!open || !token || waiting) return;
    const t = setInterval(() => {
      const after = messages[messages.length - 1]?.at ?? "";
      fetch(`/api/conversations/akis?token=${encodeURIComponent(token)}&after=${encodeURIComponent(after)}${kq}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((j: { messages?: Msg[]; status?: string } | null) => {
          if (!j?.messages?.length) return;
          setMessages((old) => [...old, ...j.messages!.filter((m) => !old.some((o) => o.id === m.id))]);
          if (j.status) setStatus(j.status);
        })
        .catch(() => {});
    }, 4000);
    return () => clearInterval(t);
  }, [open, token, messages, waiting, kq]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, waiting, open]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      if (embed && window.parent !== window) window.parent.postMessage({ guru: "sohbet", open: false }, "*");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, embed]);

  const sendText = async (value: string) => {
    const t = value.trim();
    if (!t || waiting) return;
    setText("");
    setError("");
    const temp: Msg = { id: `yerel-${++seq}`, role: "ziyaretci", text: t, at: "" };
    setMessages((old) => [...old, temp]);
    setWaiting(true);
    try {
      const r = await fetch("/api/conversations/mesaj", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token || undefined, text: t, page: pathname, ...(embed ? { k: embed.key } : {}) }),
      });
      const j = (await r.json().catch(() => null)) as { ok?: boolean; token?: string; status?: string; messages?: Msg[]; error?: string } | null;
      if (!r.ok || !j?.ok) throw new Error(j?.error ?? "Mesaj gönderilemedi. Lütfen tekrar deneyin.");
      if (j.token && j.token !== token) {
        setToken(j.token);
        store.set(storeKey, j.token);
      }
      setStatus(j.status ?? "bot");
      setMessages((old) => [...old.filter((m) => m.id !== temp.id), ...(j.messages ?? []).filter((m) => !old.some((o) => o.id === m.id))]);
    } catch (e) {
      setMessages((old) => old.filter((m) => m.id !== temp.id));
      setText(t);
      setError((e as Error).message);
    } finally {
      setWaiting(false);
    }
  };

  if (!embed && routePath.startsWith("/admin")) return null;
  const close = () => {
    setOpen(false);
    tell(false);
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={openChat}
          aria-label={`${info.botName} ile sohbet edin`}
          data-umami-event="sohbet-ac"
          style={paint}
          className={cn(
            "fixed z-[45] inline-flex size-14 items-center justify-center rounded-full bg-navy text-white shadow-[0_14px_32px_-12px_rgb(1_20_65/0.55)] transition-colors hover:bg-brand",
            embed ? "bottom-5 right-5" : "bottom-[88px] right-4 lg:bottom-6 lg:right-6",
          )}
        >
          <MessageCircle aria-hidden className="size-6" strokeWidth={2} />
        </button>
      )}
      {open && (
        <section
          role="dialog"
          aria-label={`${info.botName} sohbeti`}
          className={cn(
            "fixed z-[130] flex flex-col bg-white",
            embed
              ? embed.desktop
                ? "inset-3 overflow-hidden rounded-2xl shadow-[0_18px_44px_-18px_rgb(1_20_65/0.45),0_0_0_1px_rgb(1_20_65/0.06)]"
                : "inset-0"
              : "inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[min(620px,calc(100dvh-48px))] sm:w-[390px] sm:overflow-hidden sm:rounded-2xl sm:shadow-[0_24px_60px_-20px_rgb(1_20_65/0.45),0_0_0_1px_rgb(1_20_65/0.06)]",
          )}
        >
          <header style={paint} className="flex items-center gap-3 bg-navy px-4 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))] text-white sm:pt-3">
            <span className="inline-flex size-9 items-center justify-center rounded-full bg-white/15" aria-hidden>
              <MessageCircle className="size-[18px]" strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-medium">{info.botName}</p>
              <p className="text-[12.5px] text-white/75">{status === "ekip" ? (embed ? "Ekibimiz yazışmayı devraldı" : "Guru ekibi yazışmayı devraldı") : "Yapay zekâ asistanı, gerekirse ekibe aktarır"}</p>
            </div>
            <button type="button" onClick={close} aria-label="Sohbeti kapat" className="inline-flex size-11 items-center justify-center rounded-full hover:bg-white/15">
              <X aria-hidden className="size-5" />
            </button>
          </header>

          <div className="flex-1 space-y-2.5 overflow-y-auto bg-soft px-4 py-4" aria-live="polite">
            {info.greeting && (
              <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-[14.5px] leading-relaxed text-body shadow-[0_0_0_1px_rgb(1_20_65/0.05)]">{info.greeting}</div>
            )}
            {messages.length === 0 && info.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {info.suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sendText(s)}
                    className="min-h-11 rounded-full bg-white px-4 text-[14px] text-navy shadow-[0_0_0_1px_rgb(42_106_202/0.35)] hover:bg-chip"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {messages.map((m) =>
              m.role === "sistem" ? (
                <p key={m.id} className="px-2 text-center text-[13px] text-muted">
                  {m.text}
                </p>
              ) : (
                <div
                  key={m.id}
                  style={m.role === "ziyaretci" ? paint : undefined}
                  className={cn(
                    "max-w-[85%] whitespace-pre-line break-words rounded-2xl px-3.5 py-2.5 text-[14.5px] leading-relaxed",
                    m.role === "ziyaretci"
                      ? "ml-auto rounded-br-md bg-navy text-white"
                      : "rounded-bl-md bg-white text-body shadow-[0_0_0_1px_rgb(1_20_65/0.05)]",
                  )}
                >
                  {m.role === "ekip" && <span className="mb-0.5 block text-[12px] font-medium text-brand">{embed ? (m.author ?? "Ekibimiz") : m.author ? `${m.author}, Guru ekibi` : "Guru ekibi"}</span>}
                  {m.role === "ziyaretci" ? m.text : embed ? <RichUrls text={m.text} /> : <Rich text={m.text} />}
                </div>
              ),
            )}
            {waiting && (
              <div className="inline-flex items-center gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3" aria-label="Yanıt yazılıyor">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="size-1.5 animate-pulse rounded-full bg-muted" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form
            className="border-t border-line bg-white px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 sm:pb-3"
            onSubmit={(e) => {
              e.preventDefault();
              void sendText(text);
            }}
          >
            {error && (
              <p className="mb-2 px-1 text-[13px] text-red-700" role="alert">
                {error}
              </p>
            )}
            <div className="flex items-end gap-2">
              <label className="sr-only" htmlFor="guru-sohbet-mesaj">
                Mesajınız
              </label>
              <textarea
                id="guru-sohbet-mesaj"
                ref={inputRef}
                rows={1}
                value={text}
                maxLength={1500}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendText(text);
                  }
                }}
                placeholder="Mesajınızı yazın"
                className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-line bg-soft px-3.5 py-2.5 text-[15px] text-heading outline-none placeholder:text-muted focus:border-brand"
              />
              <button
                type="submit"
                disabled={waiting || !text.trim()}
                aria-label="Gönder"
                style={paint}
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-navy text-white transition-colors hover:bg-brand disabled:opacity-40"
              >
                <Send aria-hidden className="size-[18px]" />
              </button>
            </div>
            {info.notice && <p className="mt-2 px-1 text-[11.5px] leading-snug text-muted">{info.notice}</p>}
          </form>
        </section>
      )}
    </>
  );
}
