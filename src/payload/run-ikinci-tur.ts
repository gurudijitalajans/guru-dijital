/**
 * İkinci tur veri düzeltmelerini yerel veritabanına uygular (canlıda aynı
 * adımlar derlemede Postgres geçişiyle). Tekrar çalıştırılabilir.
 *   npm run payload run src/payload/run-ikinci-tur.ts < /dev/null
 */
import { createLocalReq, getPayload } from "payload";
import config from "@payload-config";
import { ikinciTur } from "@/migrations/data/ikinci-tur";

const payload = await getPayload({ config });
const req = await createLocalReq({}, payload);
await ikinciTur(payload, req);
process.exit(0);
