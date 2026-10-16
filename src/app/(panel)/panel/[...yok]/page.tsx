import { notFound } from "next/navigation";

/* Panelde olmayan bir adres sitenin 404'üne değil, panelin kendi (menülü) 404'üne düşer */
export default function PanelUnknown() {
  notFound();
}
