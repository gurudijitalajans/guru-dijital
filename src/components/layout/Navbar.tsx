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

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Rota değişince menüyü kapat: React'in "render sırasında state uyarlama"
  // deseni (effect + setState kaskadı yerine, ekstra boyama olmadan).
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Menü açıkken viewport desktop eşiğine büyürse (overlay lg:hidden ile
  // görünmez olur) open state'i ve scroll kilidini bırakma.
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
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
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.removeEventListener("touchmove", onTouchMove);
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)] transition-all duration-300",
        scrolled && !open
          ? "border-b border-fg/10 bg-page/80 backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <div className="container-g flex h-16 items-center justify-between md:h-20">
        <Link href="/" className="relative z-[60] shrink-0" aria-label="Guru Dijital Ajans | Ana Sayfa">
          <BrandLogo priority className="h-9 w-auto md:h-10" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Ana menü">
          {navLinks.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative text-sm font-medium transition-colors duration-200",
                  active ? "text-fg" : "text-fg/60 hover:text-fg"
                )}
              >
                {link.label}
                <span
                  className={cn(
                    "absolute -bottom-1.5 left-1/2 size-1.5 -translate-x-1/2 bg-guru transition-all duration-300",
                    active ? "scale-100 opacity-100" : "scale-0 opacity-0"
                  )}
                  aria-hidden
                />
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          <GButton href="/iletisim" size="md" variant="green">
            Teklif Al
          </GButton>
        </div>

        {/* Mobile toggle */}
        <button
          className={cn(
            "relative z-[60] flex size-11 items-center justify-center rounded-full transition-colors lg:hidden",
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
            className="fixed inset-0 z-50 flex flex-col bg-page text-fg lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grain-blob -right-24 top-1/4 h-72 w-72" aria-hidden />
            <nav
              className="container-g flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pt-[calc(4rem+env(safe-area-inset-top))]"
              aria-label="Mobil menü"
            >
              <div className="my-auto flex flex-col gap-1 py-4">
              {navLinks.map((link, i) => {
                const active =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ delay: 0.06 + i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-baseline gap-4 py-3 text-4xl font-bold tracking-tight sm:text-5xl",
                        active ? "text-guru" : "text-fg hover:text-guru"
                      )}
                    >
                      <span className="text-sm font-semibold text-fg/40">
                        0{i + 1}
                      </span>
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
              </div>
            </nav>
            <motion.div
              className="container-g flex items-center justify-between border-t border-fg/10 py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.35 }}
            >
              <div className="flex gap-3">
                <ThemeToggle />
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex size-11 items-center justify-center rounded-full bg-fg/10 transition-colors hover:bg-guru hover:text-ink"
                >
                  <InstagramIcon className="size-5" />
                </a>
                <a
                  href={`mailto:${site.email}`}
                  aria-label="E-posta"
                  className="flex size-11 items-center justify-center rounded-full bg-fg/10 transition-colors hover:bg-guru hover:text-ink"
                >
                  <Mail className="size-5" />
                </a>
              </div>
              <span className="text-sm text-fg/50">Unlock the next level</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
