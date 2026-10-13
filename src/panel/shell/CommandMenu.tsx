"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Command } from "cmdk";
import { Dialog } from "radix-ui";
import type { NavGroup } from "../nav";
import { NavGlyph } from "../ui/icons";
import { searchPanel, type SearchHit } from "../actions";

/** Cmd+K: sayfalara git, seçili işletmede kişi, firma, fırsat, görev ara */
export function CommandMenu({ open, onOpenChange, nav }: { open: boolean; onOpenChange: (o: boolean) => void; nav: NavGroup[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const seq = useRef(0);

  useEffect(() => {
    const term = q.trim();
    const n = ++seq.current;
    if (term.length < 2) {
      const t = setTimeout(() => n === seq.current && setHits([]), 0);
      return () => clearTimeout(t);
    }
    const t = setTimeout(async () => {
      setLoading(true);
      const r = await searchPanel(term).catch(() => []);
      if (n === seq.current) {
        setHits(r);
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  const go = (href: string) => {
    onOpenChange(false);
    setQ("");
    if (href.startsWith("/admin")) window.location.assign(href);
    else router.push(href);
  };
  const pages = nav.flatMap((g) => g.items);
  const groups = [...new Set(hits.map((h) => h.group))];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay" />
        <Dialog.Content className="fixed top-[12vh] left-1/2 z-50 w-[min(620px,calc(100%-32px))] -translate-x-1/2 overflow-hidden rounded-[12px] border border-line bg-surface shadow-pop focus:outline-none">
          <Dialog.Title className="sr-only">Ara</Dialog.Title>
          <Dialog.Description className="sr-only">Sayfalara gidin ya da kayıt arayın</Dialog.Description>
          <Command shouldFilter={false} label="Ara" className="text-text">
            <Command.Input value={q} onValueChange={setQ} placeholder="Kişi, firma, fırsat, görev ya da sayfa ara" className="w-full border-0 border-b border-line bg-transparent px-4.5 py-4 text-[16px] text-ink outline-none placeholder:text-muted" />
            <Command.List className="max-h-[55vh] overflow-y-auto p-1.5">
              <Command.Empty className="px-3 py-4 text-[14px] text-muted">{loading ? "Aranıyor…" : q.trim().length < 2 ? "En az iki harf yazın." : "Sonuç yok."}</Command.Empty>
              {groups.map((g) => (
                <Command.Group key={g} heading={g} className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.08em] [&_[cmdk-group-heading]]:text-muted">
                  {hits.filter((h) => h.group === g).map((h) => (
                    <Command.Item key={h.id} value={h.id} onSelect={() => go(h.href)} className="flex min-h-10 cursor-pointer items-center gap-2 rounded-[8px] px-3 py-2 data-[selected=true]:bg-accent-soft">
                      <span className="min-w-0 flex-1 truncate text-ink">{h.label}</span>
                      {h.detail ? <span className="truncate text-[13px] text-muted">{h.detail}</span> : null}
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
              <Command.Group heading="Sayfalar" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.08em] [&_[cmdk-group-heading]]:text-muted">
                {pages
                  .filter((p) => {
                    const t = q.trim().toLocaleLowerCase("tr-TR");
                    return !t || `${p.label} ${p.keywords ?? ""}`.toLocaleLowerCase("tr-TR").includes(t);
                  })
                  .map((p) => (
                    <Command.Item key={p.id} value={`sayfa-${p.id}`} onSelect={() => go(p.href)} className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-[8px] px-3 py-2 data-[selected=true]:bg-accent-soft">
                      <NavGlyph name={p.icon} className="size-4 text-muted" />
                      <span className="flex-1 text-ink">{p.label}</span>
                      {p.legacy ? <span className="text-[12px] text-muted">içerik ekranı</span> : null}
                    </Command.Item>
                  ))}
              </Command.Group>
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
