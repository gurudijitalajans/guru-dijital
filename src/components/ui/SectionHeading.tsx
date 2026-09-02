import { cn, parseAccent } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Eyebrow + display heading. Wrap accent words in *stars* to paint them green.
 */
export function SectionHeading({
  eyebrow,
  title,
  sub,
  dark = false,
  center = false,
  className,
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  dark?: boolean;
  center?: boolean;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  const parts = parseAccent(title);
  return (
    <div className={cn("max-w-3xl", center && "mx-auto text-center", className)}>
      {eyebrow && (
        <Reveal y={16}>
          <div
            className={cn(
              "mb-4 inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.18em]",
              dark ? "text-fg/60" : "text-smoke"
            )}
          >
            <span className="inline-block size-2 bg-guru" aria-hidden />
            {eyebrow}
          </div>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <Tag
          className={cn(
            "text-balance font-bold leading-[1.06] tracking-[-0.03em]",
            Tag === "h1"
              ? "text-4xl sm:text-5xl md:text-6xl"
              : "text-3xl sm:text-4xl md:text-5xl",
            /* Başlık her zaman tema tokenı: zeminler (page/band/card) tema ile
               döndüğü için sabit ink burada gece modunda görünmez kalırdı.
               dark prop'u yalnız eyebrow/sub tonunu seçer. */
            "text-fg"
          )}
        >
          {parts.map((p, i) => (
            <span key={i} className={p.accent ? "text-guru" : undefined}>
              {p.t}
            </span>
          ))}
        </Tag>
      </Reveal>
      {sub && (
        <Reveal delay={0.12}>
          <p
            className={cn(
              "mt-5 text-base leading-relaxed md:text-lg",
              dark ? "text-fg/70" : "text-smoke"
            )}
          >
            {sub}
          </p>
        </Reveal>
      )}
    </div>
  );
}
