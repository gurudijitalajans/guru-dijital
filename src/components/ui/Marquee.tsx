import { cn } from "@/lib/utils";
import type { CSSProperties, ReactNode } from "react";

/** Infinite marquee. Content is duplicated; pauses on hover. */
export function Marquee({
  children,
  className,
  slow = false,
  reverse = false,
}: {
  children: ReactNode;
  className?: string;
  slow?: boolean;
  reverse?: boolean;
}) {
  const style: CSSProperties | undefined = reverse
    ? { animationDirection: "reverse" }
    : undefined;
  return (
    <div className={cn("marquee", slow && "marquee-slow", className)}>
      <div className="marquee-track" style={style}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
