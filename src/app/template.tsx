import { PageCurtain } from "@/components/fx/PageCurtain";
import type { ReactNode } from "react";

export default function Template({ children }: { children: ReactNode }) {
  return <PageCurtain>{children}</PageCurtain>;
}
