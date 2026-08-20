import { cn, parseAccent } from "@/lib/utils";
import { SplitText } from "@/components/ui/SplitText";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Shared hero for inner pages. Title accepts *accent* markers.
 */
export function PageHero({
  eyebrow,
  title,
  sub,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative overflow-hidden pb-14 pt-32 md:pb-20 md:pt-44", className)}>
      <div className="grain-blob -right-40 -top-20 h-96 w-96" aria-hidden />
      <div className="grain-blob -left-52 top-64 h-80 w-80 opacity-25" aria-hidden />
      <div className="container-g relative">
        <Reveal y={14}>
          <div className="mb-5 inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-smoke">
            <span className="inline-block size-2 bg-guru" aria-hidden />
            {eyebrow}
          </div>
        </Reveal>
        <h1 className="max-w-4xl text-[2.6rem] font-bold leading-[1.04] tracking-[-0.03em] sm:text-6xl md:text-7xl">
          <SplitText text={title} />
        </h1>
        {sub && (
          <Reveal delay={0.25}>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-smoke md:text-lg">
              {sub}
            </p>
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
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
