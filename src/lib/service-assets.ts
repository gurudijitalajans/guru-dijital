import "server-only";
import { existsSync } from "node:fs";
import { join } from "node:path";

/* Hizmet görselinin en yeni sürümü: katalog işleriyle üretilen v4 varsa o, yoksa v3 (yoksa null) */
export function serviceAsset(slug: string, file: string): string | null {
  for (const v of ["v4", "v3"]) {
    if (existsSync(join(process.cwd(), "public", "services", v, `${slug}-${file}`))) return `/services/${v}/${slug}-${file}`;
  }
  return null;
}
