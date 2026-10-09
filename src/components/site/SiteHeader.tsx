"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import type { NavGroup } from "@/lib/data";
import { IconByName } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

function TalkLink({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <Link
      href="/iletisim"
      onClick={onClick}
      data-umami-event="tanisalim"
      data-umami-event-konum="menu"
      className={cn(
        "inline-flex min-h-11 items-center gap-2.5 text-[15px] font-medium text-heading transition-colors hover:text-brand",
        className
      )}
    >
      <span className="relative inline-flex size-2.5" aria-hidden>
        <span className="absolute inset-0 animate-ping rounded-full bg-brand/40 [animation-duration:2.4s] motion-reduce:animate-none" />
        <span className="relative inline-block size-2.5 rounded-full bg-brand" />
      </span>
      Tanışalım
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Masaüstü açılır menü                                               */
/* ------------------------------------------------------------------ */

function DesktopGroup({ group, active }: { group: NavGroup; active: boolean }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const closeTimer = useRef<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  /* Fareyle (hover) açıldıysa tetikleyiciye tıklamak menüyü kapatmaz */
  const hoverOpened = useRef(false);

  const show = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    hoverOpened.current = true;
    setOpen(true);
  };
  const hideSoon = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      hoverOpened.current = false;
      setOpen(false);
    }, 120);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      /* Odak paneldeyse kaybolmasın: tetikleyiciye döner */
      if (wrapRef.current?.contains(document.activeElement)) triggerRef.current?.focus();
    };
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDoc);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDoc);
    };
  }, [open]);

  const linkCls = cn(
    "inline-flex min-h-11 items-center gap-1 text-[15px] font-medium transition-colors hover:text-brand",
    active ? "text-brand" : "text-heading"
  );

  if (!group.items) {
    return (
      <Link href={group.href} className={linkCls}>
        {group.label}
      </Link>
    );
  }

  return (
    /* Panel nav'a göre konumlanır (sarmalayıcı relative değil): bütün menüler aynı
       merkezde açılır, dar masaüstünde de ekran dışına taşmaz */
    <div
      ref={wrapRef}
      onMouseEnter={show}
      onMouseLeave={hideSoon}
      onBlur={(e) => {
        /* Klavyeyle Tab ile dışarı çıkınca kapanır; tıklama dışarıda zaten kapatır */
        const next = e.relatedTarget as Node | null;
        if (next && !wrapRef.current?.contains(next)) setOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => {
          const keep = hoverOpened.current;
          hoverOpened.current = false;
          setOpen((v) => (keep ? true : !v));
        }}
        className={linkCls}
      >
        {group.label}
        <ChevronDown
          aria-hidden
          className={cn("size-4 text-muted transition-transform duration-200", open && "rotate-180")}
        />
      </button>
      {/* Tüm açılır menüler aynı yapıda: iki sütun, her öğede ikon + başlık + tek satır açıklama, altta bağlantı satırı */}
      <div id={id} hidden={!open} className="absolute left-1/2 top-full z-50 w-[620px] max-w-[calc(100vw-48px)] -translate-x-1/2 pt-3">
        <div className="rounded-[20px] bg-white p-2 shadow-[0_0_0_1px_rgb(1_20_65/0.08),0_24px_48px_-20px_rgb(1_20_65/0.35)]">
          <ul className="grid grid-cols-2 gap-1">
            {group.items.map((it) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  onClick={() => setOpen(false)}
                  className="group/item flex items-center gap-3.5 rounded-2xl p-3 transition-colors hover:bg-soft"
                >
                  <span
                    aria-hidden
                    className="grid size-10 shrink-0 place-items-center rounded-xl bg-chip text-brand transition-colors group-hover/item:bg-white"
                  >
                    <IconByName name={it.icon} className="size-[18px]" strokeWidth={1.9} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[14.5px] font-medium leading-snug text-heading">{it.label}</span>
                    <span className="mt-0.5 block truncate text-[13px] leading-snug text-muted">{it.desc}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {group.footer && (
            <div className="mt-1 flex items-center justify-between gap-4 rounded-2xl bg-soft px-4 py-3">
              <span className="text-[13px] text-muted">{group.footer.hint}</span>
              <Link
                href={group.footer.href}
                onClick={() => setOpen(false)}
                className="inline-flex shrink-0 items-center gap-1.5 text-[13.5px] font-medium text-brand transition-colors hover:text-navy"
              >
                {group.footer.label}
                <ArrowRight aria-hidden className="size-3.5" strokeWidth={2.2} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Header                                                             */
/* ------------------------------------------------------------------ */

/** Menü sunucuda panel içeriğinden kurulur (SiteShell); blog bağlantısı yayında yazı varken eklenir. */
export function SiteHeader({ menu }: { menu: NavGroup[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [panelTop, setPanelTop] = useState(0);

  /* Rota değişince menü kapanır (render sırasında durum düzeltmesi, effect yok) */
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
    setExpanded(null);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Mobil menü: kaydırma kilidi, Escape ile kapanma, odak yönetimi */
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
      if (e.key === "Tab" && panelRef.current) {
        const f = panelRef.current.querySelectorAll<HTMLElement>("a, button");
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    return () => {
      root.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);
  const isActive = (g: NavGroup) =>
    g.href !== "/" && !g.href.startsWith("/#") && (pathname === g.href || pathname.startsWith(g.href + "/"));

  return (
    <>
    <header
      ref={headerRef}
      className={cn(
        "sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-shadow duration-300",
        /* çizgi yok: kaydırınca yalnız yumuşak gölge */
        scrolled && "shadow-[0_10px_30px_-18px_rgb(1_20_65/0.32)] [html[data-subnav='1']_&]:shadow-none"
      )}
    >
      <div className="container-g flex h-[68px] items-center lg:h-[76px]">
        {/* Mobil: hamburger solda */}
        <button
          ref={toggleRef}
          type="button"
          aria-expanded={open}
          aria-controls="mobil-menu"
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          onClick={() => {
            if (!open) setPanelTop(Math.max(0, headerRef.current?.getBoundingClientRect().top ?? 0));
            setOpen((v) => !v);
          }}
          className="-ml-2 inline-grid size-11 place-items-center rounded-full text-heading lg:hidden"
        >
          {open ? <X className="size-6" strokeWidth={1.8} /> : <Menu className="size-6" strokeWidth={1.8} />}
        </button>

        <Link
          href="/"
          aria-label="Guru Dijital Ajans ana sayfa"
          className="absolute left-1/2 inline-flex min-h-11 -translate-x-1/2 items-center lg:static lg:translate-x-0"
        >
          <Logo height={32} priority />
        </Link>

        <nav aria-label="Ana menü" className="relative mx-auto hidden items-center gap-8 lg:flex">
          {menu.map((g) => (
            <DesktopGroup key={g.label} group={g} active={isActive(g)} />
          ))}
        </nav>

        <TalkLink className="ml-auto lg:ml-0" />
      </div>

    </header>
      {/* Mobil menü paneli */}
      <div
        id="mobil-menu"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menü"
        hidden={!open}
        style={{ top: panelTop }}
        className="fixed inset-x-0 bottom-0 z-[60] overflow-y-auto bg-white px-5 pb-[calc(2rem+env(safe-area-inset-bottom))] lg:hidden"
      >
        {/* Panelin kendi üst satırı: header ile aynı hizada kapat düğmesi, logo, Tanışalım */}
        <div className="relative -mx-5 mb-2 flex h-[68px] items-center px-5">
          <button
            type="button"
            aria-label="Menüyü kapat"
            onClick={() => {
              setOpen(false);
              toggleRef.current?.focus();
            }}
            className="-ml-2 inline-grid size-11 place-items-center rounded-full text-heading"
          >
            <X className="size-6" strokeWidth={1.8} />
          </button>
          <Link href="/" onClick={close} aria-label="Guru Dijital Ajans ana sayfa" className="absolute left-1/2 inline-flex min-h-11 -translate-x-1/2 items-center">
            <Logo height={32} />
          </Link>
          <TalkLink className="ml-auto" onClick={close} />
        </div>
        <ul>
          {menu.map((g) => {
            const isOpen = expanded === g.label;
            return (
              <li key={g.label} className="py-1">
                {g.items ? (
                  <>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setExpanded(isOpen ? null : g.label)}
                      className="flex min-h-14 w-full items-center justify-between text-left text-[22px] font-medium tracking-[-0.02em] text-heading"
                    >
                      {g.label}
                      <ChevronDown aria-hidden className={cn("size-5 text-muted transition-transform", isOpen && "rotate-180")} />
                    </button>
                    <ul hidden={!isOpen} className="mb-3 grid gap-1">
                      {g.items.map((it) => (
                        <li key={it.href}>
                          <Link href={it.href} onClick={close} className="flex min-h-14 items-center gap-3.5 rounded-2xl px-1 py-2">
                            <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl bg-chip text-brand">
                              <IconByName name={it.icon} className="size-[18px]" strokeWidth={1.9} />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-[16px] font-medium leading-snug text-heading">{it.label}</span>
                              <span className="mt-0.5 block truncate text-[13.5px] leading-snug text-muted">{it.desc}</span>
                            </span>
                          </Link>
                        </li>
                      ))}
                      {g.footer && (
                        <li>
                          <Link href={g.footer.href} onClick={close} className="flex min-h-11 items-center gap-1.5 px-1 text-[15px] font-medium text-brand">
                            {g.footer.label}
                            <ArrowRight aria-hidden className="size-4" strokeWidth={2.2} />
                          </Link>
                        </li>
                      )}
                    </ul>
                  </>
                ) : (
                  <Link href={g.href} onClick={close} className="flex min-h-14 items-center text-[22px] font-medium tracking-[-0.02em] text-heading">
                    {g.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
        <div className="mt-6">
          <Link
            href="/iletisim"
            onClick={close}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-navy px-6 text-[15.5px] font-medium text-white"
          >
            Teklif Al
          </Link>
        </div>
      </div>
    </>
  );
}
