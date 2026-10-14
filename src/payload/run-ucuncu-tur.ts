/**
 * Üçüncü tur veri güncellemesini yerel veritabanına uygular (canlıda aynı
 * adımlar derlemede Postgres geçişiyle). Tekrar çalıştırılabilir.
 *   npm run payload run src/payload/run-ucuncu-tur.ts < /dev/null
 */
import { createLocalReq, getPayload } from "payload";
import config from "@payload-config";
import { ucuncuTur } from "@/migrations/data/ucuncu-tur";

const payload = await getPayload({ config });
const req = await createLocalReq({}, payload);
await ucuncuTur(payload, req);
process.exit(0);
