/**
 * Dördüncü tur veri güncellemesini yerel veritabanına uygular (canlıda aynı
 * adımlar derlemede Postgres geçişiyle). Tekrar çalıştırılabilir.
 *   npm run payload run src/payload/run-dorduncu-tur.ts < /dev/null
 */
import { createLocalReq, getPayload } from "payload";
import config from "@payload-config";
import { dorduncuTur } from "@/migrations/data/dorduncu-tur";

const payload = await getPayload({ config });
const req = await createLocalReq({}, payload);
await dorduncuTur(payload, req);
process.exit(0);
