/**
 * E-ticaret vakasını yerel veritabanına uygular.
 *   npm run payload run src/payload/run-eticaret-vakasi.ts < /dev/null
 */
import { createLocalReq, getPayload } from "payload";
import config from "@payload-config";
import { eticaretVakasi } from "@/migrations/data/eticaret-vakasi";

const payload = await getPayload({ config });
const req = await createLocalReq({}, payload);
await eticaretVakasi(payload, req);
process.exit(0);
