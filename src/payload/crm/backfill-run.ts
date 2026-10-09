/** Yerelde: npm run payload run src/payload/crm/backfill-run.ts */
import { getPayload } from "payload";
import config from "@payload-config";
import { backfillCrm } from "./backfill";

const payload = await getPayload({ config });
const res = await backfillCrm(payload);
payload.logger.info(`CRM aktarımı: ${res.leads} talep, ${res.bookings} randevu`);
process.exit(0);
