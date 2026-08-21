"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X, Mail } from "lucide-react";
import { InstagramIcon } from "@/components/ui/icons";
import { navLinks, site } from "@/lib/data";
import { cn } from "@/lib/utils";
import { GButton } from "@/components/ui/Button";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled && !open
          ? "border-b border-paper/10 bg-coal/80 backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <div className="container-g flex h-16 items-center justify-between md:h-20">
        <Link href="/" className="relative z-[60] shrink-0" aria-label="Guru Dijital Ajans | Ana Sayfa">
          <Image
            src="/logo-light.png"
            alt="Guru Dijital Ajans"
            width={720}
            height={306}
            priority
            className="h-9 w-auto md:h-10"
          />
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
                  active ? "text-paper" : "text-paper/60 hover:text-paper"
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

        <div className="hidden lg:block">
          <GButton href="/iletisim" size="md" variant="green">
            Teklif Al
          </GButton>
        </div>

        {/* Mobile toggle */}
        <button
          className={cn(
            "relative z-[60] flex size-11 items-center justify-center rounded-full transition-colors lg:hidden",
            "bg-paper/10 text-paper"
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
            className="fixed inset-0 z-50 flex flex-col bg-coal text-paper lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grain-blob -right-24 top-1/4 h-72 w-72" aria-hidden />
            <nav
              className="container-g flex flex-1 flex-col justify-center gap-1 pt-16"
              aria-label="Mobil menü"
            >
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
                        active ? "text-guru" : "text-paper hover:text-guru"
                      )}
                    >
                      <span className="text-sm font-semibold text-paper/40">
                        0{i + 1}
                      </span>
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
            <motion.div
              className="container-g flex items-center justify-between border-t border-paper/10 py-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.35 }}
            >
              <div className="flex gap-3">
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex size-11 items-center justify-center rounded-full bg-paper/10 transition-colors hover:bg-guru hover:text-ink"
                >
                  <InstagramIcon className="size-5" />
                </a>
                <a
                  href={`mailto:${site.email}`}
                  aria-label="E-posta"
                  className="flex size-11 items-center justify-center rounded-full bg-paper/10 transition-colors hover:bg-guru hover:text-ink"
                >
                  <Mail className="size-5" />
                </a>
              </div>
              <span className="text-sm text-paper/50">Unlock the next level</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
