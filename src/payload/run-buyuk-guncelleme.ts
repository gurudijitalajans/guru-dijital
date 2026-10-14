/**
 * Büyük güncellemenin veri adımlarını yerel veritabanına uygular (canlıda
 * aynı adımlar src/migrations/20261014_020000_buyuk_guncelleme_veri ile
 * derlemede çalışır). Tekrar çalıştırılabilir.
 *   npm run payload run src/payload/run-buyuk-guncelleme.ts < /dev/null
 */
import { createLocalReq, getPayload } from "payload";
import config from "@payload-config";
import { buyukGuncelleme } from "@/migrations/data/buyuk-guncelleme";

const payload = await getPayload({ config });
const req = await createLocalReq({}, payload);
await buyukGuncelleme(payload, req);
process.exit(0);
