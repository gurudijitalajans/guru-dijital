import { parseAccent } from "@/lib/utils";
import { PageHeroV2, type PageHeroV2Props } from "@/components/v2/PageHeroV2";

/**
 * Shared hero for inner pages — thin alias over the dark PageHeroV2 so every
 * page picked up the redesign without touching its imports.
 */
export function PageHero(props: PageHeroV2Props) {
  return <PageHeroV2 {...props} />;
}

/** Renders a *accent*-marked string as spans (server-safe). */
export function AccentText({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {parseAccent(text).map((p, i) => (
        <span key={i} className={p.accent ? "text-guru" : undefined}>
          {p.t}
        </span>
      ))}
    </span>
  );
}
