/**
 * Boşluk düzeni veri güncellemesini yerel veritabanına uygular.
 *   npm run payload run src/payload/run-bosluk-duzeni.ts < /dev/null
 */
import { createLocalReq, getPayload } from "payload";
import config from "@payload-config";
import { boslukDuzeni } from "@/migrations/data/bosluk-duzeni";

const payload = await getPayload({ config });
const req = await createLocalReq({}, payload);
await boslukDuzeni(payload, req);
process.exit(0);
