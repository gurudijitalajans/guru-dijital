/**
 * Uygulama simgeli ürün görsellerini yerel veritabanına uygular.
 *   npm run payload run src/payload/run-urun-simgeleri.ts < /dev/null
 */
import { createLocalReq, getPayload } from "payload";
import config from "@payload-config";
import { urunSimgeleri } from "@/migrations/data/urun-simgeleri";

const payload = await getPayload({ config });
const req = await createLocalReq({}, payload);
await urunSimgeleri(payload, req);
process.exit(0);
