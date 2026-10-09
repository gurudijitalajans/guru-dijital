/** Yerelde: npm run payload run src/payload/ops/seed-run.ts */
import { getPayload } from "payload";
import config from "@payload-config";
import { seedTemplates } from "./seed-templates";

const payload = await getPayload({ config });
const n = await seedTemplates(payload);
payload.logger.info(`Süreç şablonları: ${n} eklendi`);
process.exit(0);
