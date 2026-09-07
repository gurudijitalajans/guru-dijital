"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X, Mail } from "lucide-react";
import { InstagramIcon } from "@/components/ui/icons";
import { navLinks, site } from "@/lib/data";
import { cn } from "@/lib/utils";
import { GButton } from "@/components/ui/Button";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const EASE = [0.22, 1, 0.36, 1] as const;
/* Masaüstü düzeni (yatay menü + CTA) md'den itibaren açılır; hamburger
   yalnız telefon genişliğinde kalır. */
const DESKTOP_MQ = "(min-width: 768px)";
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // Rota değişince menüyü kapat: React'in "render sırasında state uyarlama"
  // deseni (effect + setState kaskadı yerine, ekstra boyama olmadan).
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    if (open) setOpen(false);
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Menü açıkken viewport masaüstü eşiğine büyürse (overlay md:hidden ile
  // görünmez olur) open state'i ve scroll kilidini bırakma.
  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_MQ);
    const closeIfDesktop = () => {
      if (mql.matches) setOpen(false);
    };
    mql.addEventListener("change", closeIfDesktop);
    // Bazı ortamlarda (emülasyon, eski WebKit) mql change atlanabiliyor.
    window.addEventListener("resize", closeIfDesktop, { passive: true });
    return () => {
      mql.removeEventListener("change", closeIfDesktop);
      window.removeEventListener("resize", closeIfDesktop);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    // iOS Safari html overflow'u tek başına takmayabiliyor; body'ye de uygula.
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    // Yalnız overlay DIŞINDAKİ dokunmatik kaydırmayı engelle; overlay kendi
    // içinde (overflow-y-auto) serbestçe kaysın.
    const onTouchMove = (e: TouchEvent) => {
      const overlay = overlayRef.current;
      if (overlay && e.target instanceof Node && overlay.contains(e.target)) return;
      e.preventDefault();
    };
    document.addEventListener("touchmove", onTouchMove, { passive: false });

    // Modal davranışı: Escape kapatır (odak anahtara döner), Tab header
    // içindeki görünür odaklanabilirler arasında döner (logo + anahtar +
    // overlay), arkadaki sayfaya geçmez.
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !headerRef.current) return;
      const items = Array.from(
        headerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter((el) => el.getClientRects().length > 0);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const inside = active instanceof Node && headerRef.current.contains(active);
      if (e.shiftKey && (active === first || !inside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !inside)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    // Odağı menünün ilk bağlantısına taşı (klavye/ekran okuyucu akışı).
    const focusId = requestAnimationFrame(() => {
      overlayRef.current?.querySelector<HTMLElement>("a[href]")?.focus({ preventScroll: true });
    });

    return () => {
      cancelAnimationFrame(focusId);
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header
      ref={headerRef}
      className={cn(
        "fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)] transition-all duration-300",
        scrolled && !open
          ? "border-b border-fg/10 bg-page/80 backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <div className="container-g flex h-16 items-center justify-between gap-4 md:h-20">
        <Link href="/" className="relative z-[60] flex shrink-0 items-center py-1" aria-label="Guru Dijital Ajans | Ana Sayfa">
          <BrandLogo className="h-9 w-auto md:h-10" />
        </Link>

        {/* Desktop nav (md+) */}
        <nav className="hidden items-center gap-5 md:flex lg:gap-8" aria-label="Ana menü">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative whitespace-nowrap py-3 text-sm font-medium transition-colors duration-200",
                  active ? "text-fg" : "text-fg/60 hover:text-fg"
                )}
              >
                {link.label}
                <span
                  className={cn(
                    "absolute bottom-1.5 left-1/2 size-1.5 -translate-x-1/2 bg-guru transition-all duration-300",
                    active ? "scale-100 opacity-100" : "scale-0 opacity-0"
                  )}
                  aria-hidden
                />
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <GButton href="/iletisim" size="md" variant="green" className="whitespace-nowrap">
            Teklif Al
          </GButton>
        </div>

        {/* Mobile toggle */}
        <button
          ref={toggleRef}
          type="button"
          className={cn(
            "relative z-[60] flex size-11 items-center justify-center rounded-full transition-colors md:hidden",
            "bg-fg/10 text-fg"
          )}
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={overlayRef}
            id="mobil-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Mobil menü"
            className="fixed inset-0 z-50 flex flex-col bg-page text-fg md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grain-blob -right-24 top-1/4 h-72 w-72" aria-hidden />
            <nav
              className="container-g flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pt-[calc(4rem+env(safe-area-inset-top))]"
              aria-label="Sayfalar"
            >
              <div className="my-auto py-4">
                <div className="flex flex-col gap-1">
                  {navLinks.map((link, i) => {
                    const active = isActive(link.href);
                    return (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 12, transition: { duration: 0.2 } }}
                        transition={{ delay: 0.06 + i * 0.06, duration: 0.45, ease: EASE }}
                      >
                        <Link
                          href={link.href}
                          onClick={close}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex items-baseline gap-4 py-3 text-4xl font-bold tracking-tight sm:text-5xl",
                            active ? "text-guru-text" : "text-fg hover:text-guru"
                          )}
                        >
                          <span className="text-sm font-semibold text-fg/50">
                            0{i + 1}
                          </span>
                          {link.label}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Dönüşüm CTA'sı: masaüstündeki "Teklif Al" mobil menüde de var */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  transition={{ delay: 0.4, duration: 0.45, ease: EASE }}
                >
                  <GButton href="/iletisim" variant="green" size="lg" className="mt-6 w-full">
                    Teklif Al
                  </GButton>
                  <a
                    href={`mailto:${site.email}`}
                    onClick={close}
                    className="mt-2 inline-block py-2 text-sm text-fg/60 transition-colors hover:text-guru"
                  >
                    {site.email}
                  </a>
                </motion.div>
              </div>
            </nav>
            <motion.div
              className="container-g flex items-center justify-between border-t border-fg/10 py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{ delay: 0.35 }}
            >
              <div className="flex gap-3">
                <ThemeToggle />
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  onClick={close}
                  className="flex size-11 items-center justify-center rounded-full bg-fg/10 transition-colors hover:bg-guru hover:text-ink"
                >
                  <InstagramIcon className="size-5" />
                </a>
                <a
                  href={`mailto:${site.email}`}
                  aria-label="E-posta"
                  onClick={close}
                  className="flex size-11 items-center justify-center rounded-full bg-fg/10 transition-colors hover:bg-guru hover:text-ink"
                >
                  <Mail className="size-5" />
                </a>
              </div>
              <span className="text-sm text-fg/60">Unlock the next level</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
