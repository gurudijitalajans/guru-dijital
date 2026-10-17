"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo, useState, useSyncExternalStore, useTransition } from "react";
import { Dialog, DropdownMenu, Tooltip } from "radix-ui";
import { ArrowUpRight, Check, ChevronDown, ChevronsUpDown, ExternalLink, LogOut, PanelLeftClose, PanelLeftOpen, Search, UserRound, X } from "lucide-react";
import { toast } from "sonner";
import { PanelMark } from "../ui/panel-mark";
import { cn } from "@/lib/utils";
import type { NavGroup } from "../nav";
import { NavGlyph } from "../ui/icons";
import { selectTenant } from "../actions";
import { CommandMenu } from "./CommandMenu";
import { Zil } from "../bildirim/Zil";
import { KayitPaneli } from "../crm/KayitPaneli";
import { AltMenu } from "./AltMenu";
import { NAV_COOKIE, RAIL_COOKIE } from "./prefs";

export type ShellTenant = { id: number; name: string; detail: string };
type Props = {
  nav: NavGroup[];
  tenant: ShellTenant;
  tenants: ShellTenant[];
  user: { name: string; initials: string; role: string };
  /** Sunucunun çerezden okuduğu menü tercihleri (ilk çizim) */
  prefs: { rail: boolean; closed: string };
  children: React.ReactNode;
};

const isActive = (path: string, href: string) => (href === "/panel" ? path === "/panel" : path === href || path.startsWith(href + "/"));

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toLocaleUpperCase("tr-TR"))
    .join("");

function TenantSwitcher({ tenant, tenants, rail = false }: { tenant: ShellTenant; tenants: ShellTenant[]; rail?: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const pick = (id: number) =>
    start(async () => {
      const r = await selectTenant(id);
      if (!r.ok) return void toast.error("Bu işletmeye erişiminiz yok.");
      router.refresh();
      toast.success(`${r.name} seçildi.`);
    });
  /* Dar menüde işletme baş harfleriyle */
  const chip = (
    <span className="mx-auto mb-3 grid size-10 place-items-center rounded-[10px] border border-white/10 bg-nav-hover text-[13px] font-semibold text-nav-strong" aria-label={`İşletme: ${tenant.name}`}>
      {initialsOf(tenant.name)}
    </span>
  );
  if (rail && tenants.length < 2) return <RailTip label={tenant.name}>{chip}</RailTip>;
  if (tenants.length < 2)
    return (
      <div className="mx-3 mb-3 rounded-[9px] border border-white/10 bg-nav-hover px-3 py-2 text-nav-strong">
        {tenant.name}
        <span className="block text-[12px] text-nav-text">{tenant.detail}</span>
      </div>
    );
  return (
    <DropdownMenu.Root>
      {rail ? (
        <DropdownMenu.Trigger className="mx-auto mb-3 grid size-10 place-items-center rounded-[10px] border border-white/10 bg-nav-hover text-[13px] font-semibold text-nav-strong disabled:opacity-60" disabled={pending} aria-label={`İşletme: ${tenant.name}. Değiştir`} title={tenant.name}>
          {initialsOf(tenant.name)}
        </DropdownMenu.Trigger>
      ) : (
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
      )}
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="start" side={rail ? "right" : "bottom"} sideOffset={6} className="z-50 max-h-[60vh] w-[260px] overflow-y-auto rounded-[10px] border border-line bg-surface p-1.5 text-text shadow-pop">
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

/* Menü tercihleri (dar menü, kapalı bölümler) çerezde tutulur: sunucu ilk çizimi doğru genişlik ve
   bölümlerle yapar, tam yenilemede menü geniş gelip sonra daralmaz */
const readCookie = (key: string) => {
  const hit = document.cookie.split("; ").find((c) => c.startsWith(key + "="));
  if (!hit) return null;
  try {
    return decodeURIComponent(hit.slice(key.length + 1));
  } catch {
    return null;
  }
};
const writeCookie = (key: string, value: string) => {
  document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=31536000; samesite=lax`;
};
const prefListeners = new Set<() => void>();
const subscribePrefs = (cb: () => void) => {
  prefListeners.add(cb);
  return () => prefListeners.delete(cb);
};
const notifyPrefs = () => prefListeners.forEach((f) => f());

/** Eski sürüm tercihleri localStorage'daydı: bir kez çereze taşınır */
function migratePrefs() {
  try {
    for (const key of [NAV_COOKIE, RAIL_COOKIE]) {
      const old = localStorage.getItem(key);
      if (old === null) continue;
      if (readCookie(key) === null) writeCookie(key, old);
      localStorage.removeItem(key);
    }
  } catch {
    /* gizli pencere: taşınacak bir şey yok */
  }
  notifyPrefs();
}

function useClosedGroups(initial: string): [Set<string>, (label: string) => void] {
  const raw = useSyncExternalStore(subscribePrefs, () => readCookie(NAV_COOKIE) ?? "", () => initial);
  const closed = useMemo(() => new Set(raw ? raw.split("|") : []), [raw]);
  const toggle = (label: string) => {
    const next = new Set(closed);
    if (next.has(label)) next.delete(label);
    else next.add(label);
    writeCookie(NAV_COOKIE, [...next].join("|"));
    notifyPrefs();
  };
  return [closed, toggle];
}

/* Dar menü (ikon şeridi): "[" kısayolu ya da menünün başındaki düğme */
const readRail = () => readCookie(RAIL_COOKIE) === "1";
/** Dar menüyü aç ya da kapat: güncel değer çerezden okunur (kısayol eski bir kapanıştan çağrılabilir) */
function flipRail() {
  writeCookie(RAIL_COOKIE, readRail() ? "0" : "1");
  notifyPrefs();
}
function useRail(initial: boolean): boolean {
  return useSyncExternalStore(subscribePrefs, readRail, () => initial);
}

/** Dar menüde öğe adı sağda ipucu olarak çıkar */
function RailTip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content side="right" sideOffset={10} className="z-50 rounded-[7px] bg-ink px-2.5 py-1.5 text-[13px] font-medium text-surface shadow-pop">
          {label}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

function RailLinks({ nav, path }: { nav: NavGroup[]; path: string }) {
  return (
    <nav aria-label="Ana menü" className="nav-scroll grid min-h-0 flex-1 content-start justify-items-center gap-1 overflow-y-auto px-2">
      {nav.map((g, gi) => (
        <div key={g.label || "son"} className="grid w-full justify-items-center gap-1">
          {gi ? <div className="my-1.5 w-8 border-t border-white/10" aria-hidden /> : null}
          {g.items.map((it) => {
            const active = isActive(path, it.href);
            return (
              <RailTip key={it.id} label={it.count ? `${it.label} (${it.count})` : it.label}>
                <Link
                  href={it.href}
                  prefetch={it.legacy ? false : undefined}
                  aria-current={active ? "page" : undefined}
                  aria-label={it.count ? `${it.label}, ${it.count} bekleyen` : it.label}
                  className={cn("relative grid size-10 place-items-center rounded-[9px] text-nav-text hover:bg-nav-hover hover:text-nav-strong", active && "bg-nav-hover text-nav-strong shadow-[inset_3px_0_0_var(--accent)]")}
                >
                  <NavGlyph name={it.icon} className="size-[19px]" />
                  {it.count ? <span className="tabular absolute -top-0.5 -right-0.5 grid min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] leading-4 font-semibold text-white">{it.count > 99 ? "99+" : it.count}</span> : null}
                </Link>
              </RailTip>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function NavLinks({ nav, path, onNavigate, initialClosed }: { nav: NavGroup[]; path: string; onNavigate?: () => void; initialClosed: string }) {
  const [closed, toggle] = useClosedGroups(initialClosed);
  return (
    <nav aria-label="Ana menü" className="nav-scroll min-h-0 flex-1 overflow-y-auto px-2.5">
      {nav.map((g) => {
        /* Açık sayfa daraltılmış bölümdeyse bölüm yine açık görünür */
        const shut = Boolean(g.label) && closed.has(g.label) && !g.items.some((it) => isActive(path, it.href));
        const waiting = g.items.reduce((n, it) => n + (it.count ?? 0), 0);
        return (
          <div key={g.label || "son"} className="mb-1 [@media(max-height:860px)]:mb-0">
            {g.label ? (
              <button
                type="button"
                onClick={() => toggle(g.label)}
                aria-expanded={!shut}
                className="mx-1 mt-3.5 mb-0.5 flex w-[calc(100%-8px)] items-center gap-1 rounded-[6px] px-1.5 py-0.5 text-left text-[11px] font-semibold text-nav-label hover:text-nav-text [@media(max-height:860px)]:mt-2.5"
              >
                <span className="flex-1">{g.label}</span>
                {shut && waiting ? <span className="tabular rounded-full bg-accent px-1.5 text-[10px] text-white">{waiting > 99 ? "99+" : waiting}</span> : null}
                <ChevronDown className={cn("size-3.5 transition-transform", shut && "-rotate-90")} aria-hidden />
              </button>
            ) : (
              <div className="mt-4 border-t border-white/10" />
            )}
            {shut ? null : g.items.map((it) => {
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
                  "flex min-h-10 pointer-coarse:min-h-11 items-center gap-2.5 rounded-[8px] px-2.5 text-nav-text no-underline hover:bg-nav-hover hover:text-nav-strong [@media(max-height:860px)]:min-h-9",
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
        );
      })}
    </nav>
  );
}

function UserFoot({ user, rail = false }: { user: Props["user"]; rail?: boolean }) {
  const router = useRouter();
  const logout = async () => {
    await fetch("/api/users/logout", { method: "POST", credentials: "same-origin" }).catch(() => null);
    router.replace("/giris");
  };
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className={cn("mt-2 flex min-h-12 items-center gap-2.5 rounded-[9px] border-t border-white/10 text-left text-[13px] hover:bg-nav-hover", rail ? "mx-auto justify-center px-1.5 pt-2.5" : "mx-2.5 px-2 pt-2.5")} aria-label="Hesap menüsü" title={rail ? user.name : undefined}>
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft text-[12px] font-semibold text-accent" aria-hidden>
          {user.initials}
        </span>
        {rail ? null : (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium text-nav-strong">{user.name}</span>
              <span className="block truncate text-nav-text">{user.role}</span>
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-nav-text" aria-hidden />
          </>
        )}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content side={rail ? "right" : "top"} align={rail ? "end" : "start"} sideOffset={6} className="z-50 w-[226px] rounded-[10px] border border-line bg-surface p-1.5 text-text shadow-pop">
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

function SidebarBody({ nav, tenant, tenants, user, prefs, path, onNavigate, rail = false, onToggleRail }: Omit<Props, "children"> & { path: string; onNavigate?: () => void; rail?: boolean; onToggleRail?: (e: React.MouseEvent) => void }) {
  const toggleBtn = onToggleRail ? (
    <RailTip label={rail ? "Menüyü genişlet  [" : "Menüyü daralt  ["}>
      <button type="button" data-menu-toggle onClick={onToggleRail} className="grid size-8 shrink-0 place-items-center rounded-[8px] text-nav-text hover:bg-nav-hover hover:text-nav-strong" aria-label={rail ? "Menüyü genişlet" : "Menüyü daralt"} aria-keyshortcuts="[">
        {rail ? <PanelLeftOpen className="size-[18px]" /> : <PanelLeftClose className="size-[18px]" />}
      </button>
    </RailTip>
  ) : null;
  if (rail)
    return (
      <>
        <div className="grid justify-items-center gap-2 pt-1 pb-3">
          <PanelMark size={30} />
          {toggleBtn}
        </div>
        <TenantSwitcher tenant={tenant} tenants={tenants} rail />
        <RailLinks nav={nav} path={path} />
        <UserFoot user={user} rail />
      </>
    );
  return (
    <>
      <div className="flex items-center gap-2.5 pt-1 pr-2.5 pb-3.5 pl-4.5 font-semibold text-nav-strong">
        <PanelMark size={30} />
        <span className="flex-1">Guru Panel</span>
        {toggleBtn}
      </div>
      <TenantSwitcher tenant={tenant} tenants={tenants} />
      <NavLinks nav={nav} path={path} onNavigate={onNavigate} initialClosed={prefs.closed} />
      <UserFoot user={user} />
    </>
  );
}

export function Shell(props: Props) {
  const path = usePathname();
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);
  const rail = useRail(props.prefs.rail);
  useEffect(migratePrefs, []);
  /* Düğme dar ve geniş menüde ayrı yerde durur: klavyeyle basıldıysa odak yeni düğmeye geçer
     (yoksa sayfanın başına düşer). Fareyle basınca odak verilmez, ipucu açık kalmasın. */
  const toggleRail = (e: React.MouseEvent) => {
    const keyboard = e.detail === 0;
    flipRail();
    if (keyboard) requestAnimationFrame(() => document.querySelector<HTMLElement>("aside [data-menu-toggle]")?.focus());
  };
  /* Telefonda açılan çekmece pencere genişleyince kapanır: aksi halde görünmeyen bir pencere
     sayfayı tıklanamaz bırakır */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => mq.matches && setDrawer(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
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
      /* "[": menüyü daralt ya da genişlet (yazı yazılırken değil) */
      const el = e.target as HTMLElement | null;
      const typing = el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
      const overlay = document.querySelector("[role=dialog][data-state=open], [role=menu][data-state=open], [role=alertdialog][data-state=open]");
      if (e.key === "[" && !e.metaKey && !e.ctrlKey && !e.altKey && !e.repeat && !typing && !overlay && window.matchMedia("(min-width: 1024px)").matches) {
        e.preventDefault();
        flipRail();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Tooltip.Provider delayDuration={250}>
    <div
      className={cn("grid h-full grid-cols-1 transition-[grid-template-columns] duration-200 motion-reduce:transition-none", rail ? "lg:grid-cols-[68px_minmax(0,1fr)]" : "lg:grid-cols-[248px_minmax(0,1fr)]")}
      style={{ "--nav-w": rail ? "68px" : "248px" } as React.CSSProperties}
    >
      <aside className="hidden min-h-0 flex-col overflow-hidden bg-nav py-3.5 lg:flex">
        {/* İçerik hedef genişlikte sabit durur, yalnız kutu daralıp genişler: geçiş sırasında yazılar
            sıkışıp satır atlamaz, simgeler kaymaz */}
        <div className={cn("flex min-h-0 flex-1 shrink-0 flex-col", rail ? "w-[68px]" : "w-[248px]")}>
          <SidebarBody {...props} path={path} rail={rail} onToggleRail={toggleRail} />
        </div>
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
          <span className="grid size-10 shrink-0 place-items-center lg:hidden" aria-hidden>
            <PanelMark size={28} />
          </span>
          <button
            type="button"
            onClick={() => setPalette(true)}
            className="flex min-h-10 max-w-[520px] flex-1 items-center gap-2.5 rounded-[9px] border border-line bg-sunken px-3 text-left text-muted"
            aria-label="Ara ya da sayfaya git"
          >
            <Search className="size-4 shrink-0" aria-hidden />
            <span className="min-w-0 flex-1 truncate">
              <span className="sm:hidden">Ara</span>
              <span className="hidden sm:inline">Kişi, talep, sohbet, fırsat, teklif ya da sayfa ara</span>
            </span>
            <kbd className="hidden rounded-[5px] border border-line bg-surface px-1.5 font-mono text-[11px] sm:inline pointer-coarse:hidden">⌘K</kbd>
          </button>
          <span className="flex-1" />
          <Zil key={props.tenant.id} />
        </header>
        <main id="icerik" tabIndex={-1} className="min-h-0 flex-1 overflow-y-auto px-4 pt-5 pb-[calc(env(safe-area-inset-bottom,0px)+96px)] focus:outline-none lg:px-7 lg:pt-6 lg:pb-12">
          {props.children}
        </main>
      </div>

      <AltMenu nav={props.nav} path={path} onMenu={() => setDrawer(true)} />
      <CommandMenu open={palette} onOpenChange={setPalette} nav={props.nav} />
      <Suspense fallback={null}>
        <KayitPaneli />
      </Suspense>
    </div>
    </Tooltip.Provider>
  );
}
