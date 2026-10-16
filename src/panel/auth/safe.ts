import { sitePath } from "@/lib/safe-path";

/** Girişten sonra dönülecek adres: yalnız panelin kendi sayfaları */
export const safeNext = (v: string | null | undefined) => {
  const p = sitePath(v, "/panel");
  return /^\/panel(\/|\?|$)/.test(p) ? p : "/panel";
};
