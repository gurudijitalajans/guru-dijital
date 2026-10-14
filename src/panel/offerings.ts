import { products, services } from "@/lib/data";

/** Fırsat ve proje formlarında önerilen hizmet ve ürün adları */
export const OFFERINGS: string[] = [...services.map((s) => s.title), ...products.map((p) => p.name)];
