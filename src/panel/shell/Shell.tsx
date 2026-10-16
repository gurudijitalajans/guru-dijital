"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Dialog, DropdownMenu } from "radix-ui";
import { ArrowUpRight, Check, ChevronsUpDown, ExternalLink, LogOut, Menu, Search, UserRound, X } from "lucide-react";
import { toast } from "sonner";
import { PanelMark } from "../ui/panel-mark";
import { cn } from "@/lib/utils";
import type { NavGroup } from "../nav";
import { NavGlyph } from "../ui/icons";
import { selectTenant } from "../actions";
import { CommandMenu } from "./CommandMenu";
import { Zil } from "../bildirim/Zil";

export type ShellTenant = { id: number; name: string; detail: string };
type Props = {
  nav: NavGroup[];
  tenant: ShellTenant;
  tenants: ShellTenant[];
  user: { name: string; initials: string; role: string };
  children: React.ReactNode;
};

const isActive = (path: string, href: string) => (href === "/panel" ? path === "/panel" : path === href || path.startsWith(href + "/"));

function TenantSwitcher({ tenant, tenants }: { tenant: ShellTenant; tenants: ShellTenant[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const pick = (id: number) =>
    start(async () => {
      const r = await selectTenant(id);
      if (!r.ok) return void toast.error("Bu işletmeye erişiminiz yok.");
      router.refresh();
      toast.success(`${r.name} seçildi.`);
    });
  if (tenants.length < 2)
    return (
      <div className="mx-3 mb-3 rounded-[9px] border border-white/10 bg-nav-hover px-3 py-2 text-nav-strong">
        {tenant.name}
        <span className="block text-[12px] text-nav-text">{tenant.detail}</span>
      </div>
    );
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className="mx-3 mb-3 flex min-h-11 items-center justify-between gap-2 rounded-[9px] border border-white/10 bg-nav-hover px-3 py-2 text-left text-nav-strong disabled:opacity-60"
        disabled={pending}
        aria-label={`İşletme: ${tenant.name}. Değiştir`}
      >
        <span className="min-w-0">
          <span className="block truncate">{tenant.name}</span>
          <span className="block truncate text-[12px] text-nav-text">{pending ? "Değiştiriliyor…" : tenant.detail}</span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-nav-text" aria-hidden />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="start" sideOffset={6} className="z-50 max-h-[60vh] w-[260px] overflow-y-auto rounded-[10px] border border-line bg-surface p-1.5 text-text shadow-pop">
          <DropdownMenu.Label className="px-2.5 py-1.5 text-[12px] font-semibold text-muted">İşletme</DropdownMenu.Label>
          {tenants.map((t) => (
            <DropdownMenu.Item key={t.id} onSelect={() => t.id !== tenant.id && pick(t.id)} className="flex min-h-10 cursor-pointer items-center gap-2 rounded-[7px] px-2.5 py-1.5 outline-none data-[highlighted]:bg-accent-soft">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-ink">{t.name}</span>
                <span className="block truncate text-[12px] text-muted">{t.detail}</span>
              </span>
              {t.id === tenant.id ? <Check className="size-4 text-accent" aria-hidden /> : null}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function NavLinks({ nav, path, onNavigate }: { nav: NavGroup[]; path: string; onNavigate?: () => void }) {
  return (
    <nav aria-label="Ana menü" className="min-h-0 flex-1 overflow-y-auto px-2.5">
      {nav.map((g) => (
        <div key={g.label || "son"} className="mb-1">
          {g.label ? <div className="mx-2.5 mt-4 mb-1 text-[11px] font-semibold text-nav-label">{g.label}</div> : <div className="mt-4 border-t border-white/10" />}
          {g.items.map((it) => {
            const active = isActive(path, it.href);
            return (
              <Link
                key={it.id}
                href={it.href}
                onClick={onNavigate}
                prefetch={it.legacy ? false : undefined}
                aria-current={active ? "page" : undefined}
                title={it.legacy ? "İçerik ekranında, canlı önizlemeyle açılır" : undefined}
                className={cn(
                  "flex min-h-10 pointer-coarse:min-h-11 items-center gap-2.5 rounded-[8px] px-2.5 text-nav-text no-underline hover:bg-nav-hover hover:text-nav-strong",
                  active && "bg-nav-hover text-nav-strong shadow-[inset_3px_0_0_var(--accent)]",
                )}
              >
                <NavGlyph name={it.icon} className="size-[18px] shrink-0 opacity-85" />
                <span className="min-w-0 flex-1 truncate">{it.label}</span>
                {it.count ? (
                  <span className="tabular shrink-0 rounded-full bg-accent px-2 text-[12px] font-medium text-white" aria-label={`${it.count} bekleyen`}>
                    {it.count > 99 ? "99+" : it.count}
                  </span>
                ) : null}
                {it.legacy ? <ArrowUpRight className="size-3.5 shrink-0 text-nav-label" aria-label="İçerik ekranında açılır" /> : null}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function UserFoot({ user }: { user: Props["user"] }) {
  const router = useRouter();
  const logout = async () => {
    await fetch("/api/users/logout", { method: "POST", credentials: "same-origin" }).catch(() => null);
    router.replace("/giris");
  };
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="mx-2.5 mt-2 flex min-h-12 items-center gap-2.5 rounded-[9px] border-t border-white/10 px-2 pt-2.5 text-left text-[13px] hover:bg-nav-hover" aria-label="Hesap menüsü">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft text-[12px] font-semibold text-accent" aria-hidden>
          {user.initials}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-nav-strong">{user.name}</span>
          <span className="block truncate text-nav-text">{user.role}</span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-nav-text" aria-hidden />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content side="top" align="start" sideOffset={6} className="z-50 w-[226px] rounded-[10px] border border-line bg-surface p-1.5 text-text shadow-pop">
          <DropdownMenu.Item asChild className="flex min-h-10 cursor-pointer items-center gap-2 rounded-[7px] px-2.5 text-ink no-underline outline-none data-[highlighted]:bg-accent-soft">
            <Link href="/panel/hesap">
              <UserRound className="size-4 text-muted" aria-hidden />
              Hesabım
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild className="flex min-h-10 cursor-pointer items-center gap-2 rounded-[7px] px-2.5 text-ink no-underline outline-none data-[highlighted]:bg-accent-soft">
            <a href="/" target="_blank" rel="noreferrer">
              <ExternalLink className="size-4 text-muted" aria-hidden />
              Siteyi aç
            </a>
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={logout} className="flex min-h-10 cursor-pointer items-center gap-2 rounded-[7px] px-2.5 text-ink outline-none data-[highlighted]:bg-accent-soft">
            <LogOut className="size-4 text-muted" aria-hidden />
            Çıkış yap
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function SidebarBody({ nav, tenant, tenants, user, path, onNavigate }: Omit<Props, "children"> & { path: string; onNavigate?: () => void }) {
  return (
    <>
      <div className="flex items-center gap-2.5 px-4.5 pt-1 pb-3.5 font-semibold text-nav-strong">
        <PanelMark size={30} />
        Guru Panel
      </div>
      <TenantSwitcher tenant={tenant} tenants={tenants} />
      <NavLinks nav={nav} path={path} onNavigate={onNavigate} />
      <UserFoot user={user} />
    </>
  );
}

export function Shell(props: Props) {
  const path = usePathname();
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);
  /* Kayan oturum: sekme açık ve görünürken oturum 30 dakikada bir yenilenir (Payload'un 8 saatlik
     belirteci gün ortasında düşmesin); sekmeye geri dönülünce de hemen yenilenir */
  useEffect(() => {
    let last = Date.now();
    const refresh = () => {
      last = Date.now();
      void fetch("/api/users/refresh-token", { method: "POST", credentials: "same-origin" }).catch(() => null);
    };
    const tick = window.setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, 30 * 60 * 1000);
    const onVisible = () => {
      if (document.visibilityState === "visible" && Date.now() - last > 10 * 60 * 1000) refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(tick);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
  /* Sayfa değişince içerik alanı başa döner (kaydırılan öğe pencere değil main) */
  useEffect(() => {
    document.getElementById("icerik")?.scrollTo({ top: 0, behavior: "instant" });
  }, [path]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="grid h-full grid-cols-1 lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="hidden min-h-0 flex-col bg-nav py-3.5 lg:flex">
        <SidebarBody {...props} path={path} />
      </aside>

      <Dialog.Root open={drawer} onOpenChange={setDrawer}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-overlay lg:hidden" />
          <Dialog.Content className="fixed inset-y-0 left-0 z-50 flex w-[min(290px,86vw)] flex-col bg-nav pt-[calc(env(safe-area-inset-top,0px)+14px)] pb-3 focus:outline-none lg:hidden">
            <Dialog.Title className="sr-only">Menü</Dialog.Title>
            <Dialog.Description className="sr-only">Panelin ana menüsü</Dialog.Description>
            <Dialog.Close className="absolute top-[calc(env(safe-area-inset-top,0px)+10px)] right-2 grid size-10 place-items-center rounded-[8px] text-nav-text" aria-label="Menüyü kapat">
              <X className="size-5" />
            </Dialog.Close>
            <SidebarBody {...props} path={path} onNavigate={() => setDrawer(false)} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <div className="flex min-h-0 min-w-0 flex-col">
        <header className="flex items-center gap-3 border-b border-line bg-surface px-4 py-2.5 pt-[calc(env(safe-area-inset-top,0px)+10px)] lg:px-6 lg:pt-2.5">
          <button type="button" onClick={() => setDrawer(true)} className="grid size-11 place-items-center rounded-[9px] border border-line lg:hidden" aria-label="Menüyü aç">
            <Menu className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => setPalette(true)}
            className="flex min-h-10 max-w-[520px] flex-1 items-center gap-2.5 rounded-[9px] border border-line bg-sunken px-3 text-left text-muted"
            aria-label="Ara ya da sayfaya git"
          >
            <Search className="size-4 shrink-0" aria-hidden />
            <span className="min-w-0 flex-1 truncate">
              <span className="sm:hidden">Ara</span>
              <span className="hidden sm:inline">Kişi, firma, fırsat, görev ya da sayfa ara</span>
            </span>
            <kbd className="hidden rounded-[5px] border border-line bg-surface px-1.5 font-mono text-[11px] sm:inline pointer-coarse:hidden">⌘K</kbd>
          </button>
          <span className="flex-1" />
          <Zil />
        </header>
        <main id="icerik" tabIndex={-1} className="min-h-0 flex-1 overflow-y-auto px-4 pt-5 pb-12 focus:outline-none lg:px-7 lg:pt-6">
          {props.children}
        </main>
      </div>

      <CommandMenu open={palette} onOpenChange={setPalette} nav={props.nav} />
    </div>
  );
}
