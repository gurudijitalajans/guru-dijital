import { LinkedinIcon } from "@/components/ui/icons";
import { cardCls } from "@/components/site/styles";
import type { TeamView } from "@/lib/content";
import { IconByName } from "@/lib/icons";
import { cn } from "@/lib/utils";

/**
 * Ekipte henüz fotoğraf yokken kullanılan kompakt kart: role uygun ikon, başlık
 * ve tek satırlık uzmanlık. Boş portre alanı göstermez; isim girilmemişse rol
 * başlık olur, uydurma isim yazılmaz. Fotoğraflar eklenince portre kartlarına geçilir.
 */
export function TeamRoleCard({ member: m }: { member: TeamView }) {
  return (
    <article className={cn(cardCls, "flex h-full items-start gap-4 p-5")}>
      <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-xl bg-chip text-brand">
        <IconByName name={m.icon} className="size-5" strokeWidth={1.8} />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <h3 className="text-balance text-[16px] font-medium leading-snug text-heading">{m.placeholder ? m.role : m.name}</h3>
        <p className="mt-1 text-pretty text-[13.5px] leading-snug text-muted">{m.placeholder ? m.focus : m.role}</p>
      </div>
      {m.linkedin && (
        <a
          href={m.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${m.name}, ${m.role}: LinkedIn profili`}
          className="grid size-11 shrink-0 place-items-center self-center rounded-xl text-heading shadow-[0_0_0_1px_rgb(1_20_65/0.1)] transition-colors hover:text-brand"
        >
          <LinkedinIcon className="size-4" />
        </a>
      )}
    </article>
  );
}
