/**
 * Katalog görsellerini yerel veritabanına uygular.
 *   npm run payload run src/payload/run-katalog.ts < /dev/null
 */
import { createLocalReq, getPayload } from "payload";
import config from "@payload-config";
import { katalog } from "@/migrations/data/katalog";

const payload = await getPayload({ config });
const req = await createLocalReq({}, payload);
await katalog(payload, req);
process.exit(0);
