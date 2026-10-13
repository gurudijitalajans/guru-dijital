/** Girişten sonra dönülecek adres: yalnız panelin kendi sayfaları */
export const safeNext = (v: string | null | undefined) => (v && /^\/panel(\/|\?|$)/.test(v) && !v.startsWith("//") ? v : "/panel");
