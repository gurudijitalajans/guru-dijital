import type { PayloadHandler, PayloadRequest } from "payload";
import { addDataAndFileToRequest } from "payload";
import { canReq } from "../business/roles";
import { CRM_SKIP } from "../crm/automation";
import { currentTenantId } from "../crm/tenant";

/**
 * POST /api/contacts/ice-aktar: Excel ya da CSV'den kişi, firma ve fırsat.
 * Dosya tarayıcıda okunur, sütunlar eşleştirilir; buraya satırlar gelir.
 * dryRun ile yalnız sayılar döner (önizleme). Kişi e-postaya göre (işletme
 * içinde) birleşir: var olan kişinin yalnız boş alanları dolar, üzerine
 * yazılmaz. Firma adına göre birleşir. Bir seferde en çok 1000 satır.
 */
export type ImportRow = {
  name?: string;
  email?: string;
  phone?: string;
  title?: string;
  company?: string;
  notes?: string;
  tags?: string;
  dealTitle?: string;
  dealValue?: string | number;
  dealStage?: string;
  expectedClose?: string;
  service?: string;
};

const MAX_ROWS = 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const s = (v: unknown, max = 200) => (v === undefined || v === null ? "" : String(v).trim().slice(0, max));
const key = (v: string) => v.toLocaleLowerCase("tr-TR").replace(/\s+/g, " ").trim();

const STAGE: Record<string, string> = {
  aday: "aday",
  yeni: "aday",
  lead: "aday",
  gorusme: "gorusme",
  görüşme: "gorusme",
  toplanti: "gorusme",
  toplantı: "gorusme",
  teklif: "teklif",
  proposal: "teklif",
  kazanildi: "kazanildi",
  kazanıldı: "kazanildi",
  won: "kazanildi",
  kaybedildi: "kaybedildi",
  lost: "kaybedildi",
};

/** "45.000", "45,000.50", "₺45.000,50", "45000" → sayı */
export function parseMoney(v: unknown): number | undefined {
  const raw = s(v, 40).replace(/[^\d.,-]/g, "");
  if (!raw) return undefined;
  const lastComma = raw.lastIndexOf(",");
  const lastDot = raw.lastIndexOf(".");
  let norm = raw;
  if (lastComma > lastDot) norm = raw.replace(/\./g, "").replace(",", ".");
  else if (lastDot > lastComma && lastComma >= 0) norm = raw.replace(/,/g, "");
  else if (lastDot >= 0 && raw.length - lastDot - 1 === 3 && raw.split(".").length > 1) norm = raw.replace(/\./g, "");
  const n = Number(norm);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : undefined;
}

/** "31.12.2026", "2026-12-31", "31/12/2026" → ISO (öğlen UTC) */
export function parseDay(v: unknown): string | undefined {
  const t = s(v, 30);
  let m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], 12)).toISOString();
  m = t.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})/);
  if (m) return new Date(Date.UTC(+m[3], +m[2] - 1, +m[1], 12)).toISOString();
  return undefined;
}

type Summary = { contactsNew: number; contactsUpdated: number; companiesNew: number; dealsNew: number; skipped: { row: number; reason: string }[] };

export async function runImport(req: PayloadRequest, tenant: number, input: ImportRow[], dryRun: boolean): Promise<Summary> {
  const sum: Summary = { contactsNew: 0, contactsUpdated: 0, companiesNew: 0, dealsNew: 0, skipped: [] };
  const base = { req, overrideAccess: true, depth: 0, pagination: false as const, limit: 10000 };
  const [companies, contacts] = await Promise.all([
    req.payload.find({ collection: "companies", where: { tenant: { equals: tenant } }, select: { name: true }, ...base }),
    req.payload.find({ collection: "contacts", where: { tenant: { equals: tenant } }, select: { name: true, email: true, phone: true, title: true, company: true, notes: true }, ...base }),
  ]);
  const companyId = new Map(companies.docs.map((c) => [key(c.name), c.id as number | string]));
  const byEmail = new Map(contacts.docs.filter((c) => c.email).map((c) => [key(c.email!), c]));
  const byName = new Map(contacts.docs.map((c) => [key(c.name), c]));
  const seen = new Set<string>();
  /* Otomasyon notu ve işlem geçmişi her satır için yazılmasın */
  req.context = { ...req.context, [CRM_SKIP]: true };

  for (let i = 0; i < input.length; i++) {
    const r = input[i];
    const rowNo = i + 2; /* başlık satırı 1 */
    const name = s(r.name, 120);
    /* E-postada Türkçe küçük harf kullanılmaz (I → ı adresi bozar) */
    const email = s(r.email, 160).toLowerCase();
    if (!name && !email) {
      sum.skipped.push({ row: rowNo, reason: "Ad ve e-posta boş" });
      continue;
    }
    if (email && !EMAIL_RE.test(email)) {
      sum.skipped.push({ row: rowNo, reason: `Geçersiz e-posta: ${email}` });
      continue;
    }
    const dupKey = email || `${key(name)}|${key(s(r.company))}`;
    if (seen.has(dupKey)) {
      sum.skipped.push({ row: rowNo, reason: "Dosyada tekrar eden kişi" });
      continue;
    }
    seen.add(dupKey);

    /* Bir satırın hatası (ör. alan doğrulaması) aktarımı durdurmaz; satır atlananlara yazılır */
    try {
      /* Firma */
      let company: number | string | undefined;
      const cname = s(r.company, 120);
      if (cname) {
        company = companyId.get(key(cname));
        if (!company) {
          sum.companiesNew++;
          if (!dryRun) {
            const c = await req.payload.create({ collection: "companies", data: { name: cname, tenant }, req, overrideAccess: true });
            company = c.id;
          } else company = `yeni:${key(cname)}`;
          companyId.set(key(cname), company);
        }
      }
      const realCompany = typeof company === "number" || (typeof company === "string" && !company.startsWith("yeni:")) ? company : undefined;

      /* Kişi: e-posta, yoksa aynı ad */
      const existing = (email && byEmail.get(email)) || (!email ? byName.get(key(name)) : undefined);
      let contactId: number | string | undefined;
      const tags = s(r.tags, 300).split(/[,;]/).map((t) => t.trim()).filter(Boolean).slice(0, 10);
      if (existing) {
        const patch: Record<string, unknown> = {};
        if (!existing.phone && s(r.phone)) patch.phone = s(r.phone, 40);
        if (!existing.title && s(r.title)) patch.title = s(r.title, 120);
        if (!existing.company && realCompany) patch.company = realCompany;
        if (!existing.notes && s(r.notes)) patch.notes = s(r.notes, 4000);
        if (Object.keys(patch).length) {
          sum.contactsUpdated++;
          if (!dryRun) await req.payload.update({ collection: "contacts", id: existing.id, data: patch, req, overrideAccess: true });
        }
        contactId = existing.id;
      } else {
        sum.contactsNew++;
        if (!dryRun) {
          const c = await req.payload.create({
            collection: "contacts",
            data: {
              name: name || email.split("@")[0],
              email: email || undefined,
              phone: s(r.phone, 40) || undefined,
              title: s(r.title, 120) || undefined,
              company: realCompany as number | undefined,
              notes: s(r.notes, 4000) || undefined,
              tags,
              source: "aktarim",
              tenant,
            },
            req,
            overrideAccess: true,
          });
          contactId = c.id;
          if (email) byEmail.set(email, c as never);
        }
      }

      /* Fırsat: başlık ya da tutar sütunu doluysa */
      const value = parseMoney(r.dealValue);
      const dealTitle = s(r.dealTitle, 160);
      if (dealTitle || value !== undefined) {
        sum.dealsNew++;
        if (!dryRun) {
          const stage = STAGE[key(s(r.dealStage, 30))] ?? "aday";
          await req.payload.create({
            collection: "deals",
            data: {
              title: dealTitle || `${cname || name} fırsatı`,
              contact: contactId as number | undefined,
              company: realCompany as number | undefined,
              value,
              stage: stage as never,
              expectedClose: parseDay(r.expectedClose),
              service: s(r.service, 120) || undefined,
              tenant,
            },
            req,
            overrideAccess: true,
          });
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      sum.skipped.push({ row: rowNo, reason: `Kaydedilemedi${msg ? `: ${msg.slice(0, 120)}` : ""}` });
    }
  }
  return sum;
}

export const importContacts: PayloadHandler = async (req) => {
  if (!canReq(req, "crm")) return Response.json({ ok: false, error: "Yetki yok." }, { status: 403 });
  const tenant = await currentTenantId(req);
  if (!tenant) return Response.json({ ok: false, error: "İşletme seçili değil." }, { status: 400 });
  await addDataAndFileToRequest(req);
  const body = (req.data ?? {}) as { rows?: ImportRow[]; dryRun?: boolean };
  const rows = Array.isArray(body.rows) ? body.rows : [];
  if (!rows.length) return Response.json({ ok: false, error: "Aktarılacak satır yok." }, { status: 400 });
  if (rows.length > MAX_ROWS) return Response.json({ ok: false, error: `Bir seferde en çok ${MAX_ROWS} satır aktarılabilir; dosyayı bölün.` }, { status: 400 });
  const summary = await runImport(req, tenant, rows, body.dryRun !== false);
  return Response.json({ ok: true, dryRun: body.dryRun !== false, ...summary });
};
