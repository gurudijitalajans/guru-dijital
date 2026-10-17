"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Dialog } from "radix-ui";
import { FileText, Kanban, ListTodo, Menu, Plus, UserPlus, X, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavGroup } from "../nav";
import { NavGlyph } from "../ui/icons";

const isActive = (path: string, href: string) => (href === "/panel" ? path === "/panel" : path === href || path.startsWith(href + "/"));

/* "+" sayfasındaki kısayollar: yalnız kullanıcının açık modüllerindeki ekranlar */
const CREATE: { id: string; label: string; detail: string; href: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "deals", label: "Yeni fırsat", detail: "Satış hattına ekle", href: "/panel/firsatlar?yeni=1", icon: Kanban },
  { id: "people", label: "Yeni kişi", detail: "Müşteri ya da aday", href: "/panel/duzenle/contacts", icon: UserPlus },
  { id: "quotes", label: "Yeni teklif", detail: "Kalem kalem teklif hazırla", href: "/panel/teklifler/yeni", icon: FileText },
  { id: "tasks", label: "Yeni görev", detail: "Projeye ya da kendine", href: "/panel/gorevler?yeni=1", icon: ClipboardCheck },
  { id: "todo", label: "Yapılacaklar", detail: "Bugünkü aramalar ve takipler", href: "/panel/yapilacaklar", icon: ListTodo },
];

/**
 * Telefonda alt menü (Atomic CRM ve Twenty'deki gibi): Ana sayfa, Gelen
 * kutusu, ortada "+", Yapılacaklar (yoksa Takvim) ve tüm menü. İçerik aşağı
 * kaydırılınca gizlenir, yukarı kaydırılınca geri gelir; telefonun alt
 * boşluğu (home çubuğu) hesaba katılır.
 */
export function AltMenu({ nav, path, onMenu }: { nav: NavGroup[]; path: string; onMenu: () => void }) {
  const items = nav.flatMap((g) => g.items);
  const pick = (id: string) => items.find((i) => i.id === id);
  const left = [pick("home"), pick("inbox")].filter(Boolean) as NonNullable<ReturnType<typeof pick>>[];
  const right = [pick("todo") ?? pick("calendar")].filter(Boolean) as NonNullable<ReturnType<typeof pick>>[];
  const creates = CREATE.filter((c) => items.some((i) => i.id === c.id));
  const [hidden, setHidden] = useState(false);
  const [plus, setPlus] = useState(false);

  /* Kaydırma yönü: içerik alanı (main) kayar, pencere değil */
  useEffect(() => {
    const main = document.getElementById("icerik");
    if (!main) return;
    /* Yeni sayfa kısa olabilir (kaydırma olayı gelmez): menü görünür başlar */
    const show = setTimeout(() => setHidden(false), 0);
    let last = main.scrollTop;
    const onScroll = () => {
      const y = main.scrollTop;
      if (Math.abs(y - last) < 8) return;
      setHidden(y > last && y > 80);
      last = y;
    };
    main.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(show);
      main.removeEventListener("scroll", onScroll);
    };
  }, [path]);

  const tab = (it: (typeof items)[number]) => {
    const active = isActive(path, it.href);
    return (
      <Link key={it.id} href={it.href} aria-current={active ? "page" : undefined} className={cn("relative grid min-h-14 flex-1 place-items-center content-center gap-0.5 text-[11px] no-underline", active ? "text-accent" : "text-muted")}>
        <span className="relative">
          <NavGlyph name={it.icon} className="size-[21px]" />
          {it.count ? <span className="tabular absolute -top-1.5 -right-2.5 grid min-w-4 place-items-center rounded-full bg-bad px-1 text-[10px] leading-4 font-semibold text-white">{it.count > 99 ? "99+" : it.count}</span> : null}
        </span>
        <span className="max-w-full truncate px-1">{it.id === "inbox" ? "Gelen" : it.label}</span>
      </Link>
    );
  };

  return (
    <>
      <nav
        aria-label="Alt menü"
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t border-line bg-surface/95 px-[max(8px,env(safe-area-inset-left))] pb-[env(safe-area-inset-bottom,0px)] backdrop-blur transition-transform duration-200 motion-reduce:transition-none lg:hidden",
          hidden && "translate-y-full",
        )}
      >
        {left.map(tab)}
        {creates.length ? (
          <div className="grid flex-1 place-items-center">
            <button type="button" onClick={() => setPlus(true)} className="grid size-12 -translate-y-3 place-items-center rounded-full bg-accent text-white shadow-pop" aria-label="Yeni ekle">
              <Plus className="size-6" />
            </button>
          </div>
        ) : null}
        {right.map(tab)}
        <button type="button" onClick={onMenu} className="grid min-h-14 flex-1 place-items-center content-center gap-0.5 text-[11px] text-muted" aria-label="Tüm menü">
          <Menu className="size-[21px]" />
          <span>Menü</span>
        </button>
      </nav>

      <Dialog.Root open={plus} onOpenChange={setPlus}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-overlay lg:hidden" />
          <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 rounded-t-[18px] bg-surface px-4 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] shadow-pop focus:outline-none lg:hidden">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" aria-hidden />
            <div className="mb-2 flex items-center justify-between">
              <Dialog.Title className="m-0 text-[17px] font-semibold text-ink">Yeni ekle</Dialog.Title>
              <Dialog.Close className="grid size-10 place-items-center rounded-[9px] text-muted" aria-label="Kapat">
                <X className="size-5" />
              </Dialog.Close>
            </div>
            <Dialog.Description className="sr-only">Hızlı oluşturma kısayolları</Dialog.Description>
            <ul className="m-0 grid list-none gap-1 p-0">
              {creates.map((c) => (
                <li key={c.id}>
                  <Link href={c.href} onClick={() => setPlus(false)} className="flex min-h-14 items-center gap-3 rounded-[12px] px-3 no-underline hover:bg-sunken">
                    <span className="grid size-10 place-items-center rounded-[10px] bg-accent-soft text-accent">
                      <c.icon className="size-5" />
                    </span>
                    <span>
                      <span className="block font-medium text-ink">{c.label}</span>
                      <span className="block text-[13px] text-muted">{c.detail}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
