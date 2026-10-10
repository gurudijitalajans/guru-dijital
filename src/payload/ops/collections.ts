import { APIError, type CollectionConfig, type Field, type PayloadRequest } from "payload";
import { isAdmin, isLoggedIn } from "../access";
import { CRM_SKIP, idOf, logActivity } from "../crm/automation";
import { sendNotice } from "../notify";
import { PRIORITIES, PROJECT_STATUS, TASK_STAGES, taskCode } from "./stages";
import { addBusinessDays, dayOf, noonUtc } from "./dates";

/**
 * Guru Operation: işler (proje), görevler ve süreç şablonları. Şablonlu bir
 * iş açılınca adımlar görev olarak doğru kişiye ve tarihe dağılır. CRM'de
 * kazanılan fırsat tek tıkla işe dönüşür (fırsat sayfasındaki düğme).
 * Kayıtlar CRM gibi işletmeye (tenant) bağlıdır.
 */

const GROUP = "Guru Operation";
const access = { read: isLoggedIn, create: isLoggedIn, update: isLoggedIn, delete: isAdmin };
const dayField = (name: string, label: string, extra: Partial<Field> = {}): Field =>
  ({
    name,
    type: "date",
    label,
    admin: { date: { pickerAppearance: "dayOnly", displayFormat: "dd.MM.yyyy" } },
    ...extra,
  }) as Field;

export const Templates: CollectionConfig = {
  slug: "templates",
  labels: { singular: "Süreç şablonu", plural: "Süreç şablonları" },
  admin: {
    useAsTitle: "name",
    group: GROUP,
    defaultColumns: ["name", "description"],
    description: "Tekrarlayan işlerin adımları. Şablondan iş açınca her adım sorumlusuna ve tarihine göre görev olur.",
  },
  access,
  fields: [
    { name: "name", type: "text", label: "Şablon adı", required: true },
    { name: "description", type: "textarea", label: "Açıklama" },
    {
      name: "steps",
      type: "array",
      label: "Adımlar",
      labels: { singular: "Adım", plural: "Adımlar" },
      minRows: 1,
      admin: { description: "Başlangıç ve süre iş günüdür: işin başladığı günden kaç gün sonra başlar, kaç günde biter." },
      fields: [
        {
          type: "row",
          fields: [
            { name: "title", type: "text", label: "Adım", required: true },
            { name: "assignee", type: "relationship", relationTo: "users", label: "Sorumlu", admin: { width: "30%" } },
          ],
        },
        {
          type: "row",
          fields: [
            { name: "offset", type: "number", label: "Başlangıç (gün sonra)", defaultValue: 0, min: 0, required: true },
            { name: "duration", type: "number", label: "Süre (iş günü)", defaultValue: 1, min: 0, required: true },
            { name: "hours", type: "number", label: "Tahmini saat", min: 0, admin: { description: "Ekip kapasitesi bu saatle hesaplanır." } },
            { name: "priority", type: "select", label: "Öncelik", defaultValue: "normal", options: [...PRIORITIES] },
          ],
        },
        {
          name: "checklist",
          type: "array",
          label: "Kontrol listesi",
          labels: { singular: "Madde", plural: "Maddeler" },
          fields: [{ name: "text", type: "text", label: "Madde", required: true }],
        },
      ],
    },
  ],
};

type Step = { title: string; assignee?: unknown; offset?: number | null; duration?: number | null; hours?: number | null; priority?: string | null; checklist?: { text: string }[] | null };

/** Şablon adımlarını işin görevleri olarak açar */
export async function applyTemplate(req: PayloadRequest, project: { id: number | string; startDate?: string | null; owner?: unknown; tenant?: unknown }, templateId: number | string) {
  const tpl = await req.payload.findByID({ collection: "templates", id: templateId, depth: 0, req, overrideAccess: true });
  const start = dayOf(project.startDate ?? new Date());
  let last = start;
  for (const step of (tpl.steps ?? []) as Step[]) {
    const from = addBusinessDays(start, step.offset ?? 0);
    const to = addBusinessDays(from, Math.max(0, (step.duration ?? 1) - 1));
    if (to > last) last = to;
    await req.payload.create({
      collection: "tasks",
      data: {
        title: step.title,
        project: project.id,
        assignee: idOf(step.assignee) ?? idOf(project.owner),
        startDate: noonUtc(from),
        dueDate: noonUtc(to),
        hours: step.hours ?? undefined,
        priority: (step.priority ?? "normal") as never,
        checklist: (step.checklist ?? []).map((c) => ({ text: c.text, done: false })),
        stage: "yapilacak",
        /* İşin işletmesi (paneldeki seçili işletme başka olabilir: demo kurulumu) */
        ...(idOf(project.tenant) ? { tenant: idOf(project.tenant) } : {}),
      } as never,
      req,
      overrideAccess: true,
    });
  }
  return last;
}

export const Projects: CollectionConfig = {
  slug: "projects",
  labels: { singular: "İş", plural: "İşler" },
  admin: {
    useAsTitle: "title",
    group: GROUP,
    defaultColumns: ["title", "company", "status", "dueDate", "owner"],
    listSearchableFields: ["title"],
    description: "Müşteri işleri ve iç projeler. Şablon seçerek açarsanız görevler kendiliğinden oluşur.",
  },
  defaultSort: "-createdAt",
  access,
  hooks: {
    /* Doğrulamadan önce: fırsattan açılan işte başlık (zorunlu) fırsattan gelir */
    beforeValidate: [
      async ({ data, originalDoc, req, operation }) => {
        if (!data) return data;
        /* Fırsattan açılan işte başlık, kişi ve firma fırsattan gelir */
        const deal = idOf(data.deal ?? originalDoc?.deal);
        if (deal && operation === "create") {
          const d = await req.payload.findByID({ collection: "deals", id: deal, depth: 0, req, overrideAccess: true }).catch(() => null);
          if (d) {
            data.title = data.title || d.title;
            data.company = data.company ?? idOf(d.company);
            data.contact = data.contact ?? idOf(d.contact);
          }
        }
        if (operation === "create" && !data.startDate) data.startDate = noonUtc(dayOf(new Date()));
        /* Teslim süresi raporu için: iş tamamlandı olarak işaretlendiği an */
        const status = data.status ?? originalDoc?.status;
        if (status === "tamamlandi" && !originalDoc?.completedAt && !data.completedAt) data.completedAt = new Date().toISOString();
        if (status !== "tamamlandi" && status) data.completedAt = null;
        return data;
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== "create") return;
        const tpl = idOf(doc.template);
        if (tpl) {
          const last = await applyTemplate(req, doc, tpl);
          if (!doc.dueDate) await req.payload.update({ collection: "projects", id: doc.id, data: { dueDate: noonUtc(last) }, req, overrideAccess: true });
        }
        const deal = idOf(doc.deal);
        if (deal) {
          await logActivity(req, { type: "sistem", title: `Operasyon işi açıldı: ${doc.title}`, deal, contact: idOf(doc.contact), company: idOf(doc.company) });
        }
      },
    ],
  },
  fields: [
    { name: "title", type: "text", label: "İş", required: true, admin: { placeholder: "Web sitesi yenileme · Firma adı" } },
    {
      type: "row",
      fields: [
        { name: "company", type: "relationship", relationTo: "companies", label: "Firma" },
        { name: "contact", type: "relationship", relationTo: "contacts", label: "Kişi" },
      ],
    },
    {
      type: "row",
      fields: [
        dayField("startDate", "Başlangıç"),
        dayField("dueDate", "Teslim", { admin: { date: { pickerAppearance: "dayOnly", displayFormat: "dd.MM.yyyy" }, description: "Şablonla açılırsa son adımın bitişi." } }),
      ],
    },
    {
      name: "template",
      type: "relationship",
      relationTo: "templates",
      label: "Süreç şablonu",
      admin: { description: "Yalnız iş açılırken uygulanır: adımlar görev olarak eklenir.", condition: (_, __, { operation }) => operation === "create" },
    },
    { name: "description", type: "textarea", label: "Kapsam ve notlar" },
    {
      name: "tasksView",
      type: "ui",
      admin: { components: { Field: "/payload/components/ops/ProjectTasks#ProjectTasks" }, disableListColumn: true },
    },
    { name: "status", type: "select", label: "Durum", required: true, defaultValue: "aktif", options: PROJECT_STATUS, admin: { position: "sidebar" } },
    {
      name: "owner",
      type: "relationship",
      relationTo: "users",
      label: "Sorumlu",
      defaultValue: ({ user }: { user?: { id?: number | string } | null }) => user?.id,
      admin: { position: "sidebar", description: "Şablon adımında sorumlu yoksa görev buna atanır; Kontrol'e gelen işler ona bildirilir." },
    },
    { name: "deal", type: "relationship", relationTo: "deals", label: "Geldiği fırsat", admin: { position: "sidebar" } },
    { name: "completedAt", type: "date", label: "Tamamlandı", admin: { position: "sidebar", readOnly: true, date: { displayFormat: "dd.MM.yyyy" }, condition: (d) => Boolean(d?.completedAt) } },
  ],
};

type ChecklistItem = { text?: string; done?: boolean | null };

async function userEmail(req: PayloadRequest, id: unknown) {
  const uid = idOf(id);
  if (!uid) return null;
  const u = await req.payload.findByID({ collection: "users", id: uid, depth: 0, req, overrideAccess: true }).catch(() => null);
  return u?.email && !/\.test$/i.test(u.email) ? u : null;
}

export const Tasks: CollectionConfig = {
  slug: "tasks",
  labels: { singular: "Görev", plural: "Görevler" },
  admin: {
    useAsTitle: "title",
    group: GROUP,
    defaultColumns: ["title", "stage", "assignee", "dueDate", "priority", "project"],
    listSearchableFields: ["title"],
    description: "Operasyon görevleri. Görev panosunda sürükleyerek aşamasını değiştirebilirsiniz; Tamam'a yalnız Kontrol'den ve kontrol listesi bitince geçilir.",
  },
  defaultSort: "dueDate",
  access,
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, operation, req }) => {
        /* Görev numarası işletme başına (G-1, G-2…) */
        if (operation === "create" && !data.seq) {
          const tenant = idOf(data.tenant);
          const last = await req.payload.find({ collection: "tasks", where: tenant ? { tenant: { equals: tenant } } : undefined, sort: "-seq", limit: 1, depth: 0, req, overrideAccess: true, select: { seq: true } });
          data.seq = (last.docs[0]?.seq ?? 0) + 1;
        }
        const from = originalDoc?.stage ?? "yapilacak";
        const to = data.stage ?? from;
        if (to !== from || operation === "create") {
          if (to === "tamam") {
            if (from !== "kontrol") throw new APIError("Görev Tamam'a yalnız Kontrol aşamasından geçer. Önce Kontrol'e alın.", 400, undefined, true);
            const list = (data.checklist ?? originalDoc?.checklist ?? []) as ChecklistItem[];
            const open = list.filter((c) => !c.done).length;
            if (open > 0) throw new APIError(`Kontrol listesinde ${open} madde açık. Hepsi işaretlenince Tamam'a geçebilir.`, 400, undefined, true);
            data.completedAt = new Date().toISOString();
          } else {
            data.completedAt = null;
          }
          if (to === "devam" && !(data.startedAt ?? originalDoc?.startedAt)) data.startedAt = new Date().toISOString();
        }
        return data;
      },
    ],
    afterChange: [
      /* Bildirimler: görev atanınca sorumluya, Kontrol'e gelince işin sorumlusuna */
      async ({ doc, previousDoc, operation, req, context }) => {
        if (context[CRM_SKIP]) return;
        const me = req.user?.id;
        const path = `/collections/tasks/${doc.id}`;
        const code = taskCode(doc.seq);
        const assignee = idOf(doc.assignee);
        if (assignee && assignee !== me && (operation === "create" || idOf(previousDoc?.assignee) !== assignee)) {
          const u = await userEmail(req, assignee);
          if (u) {
            await sendNotice(req, u.email, {
              subject: `Size görev atandı: ${code} ${doc.title}`,
              intro: `${req.user?.name ?? "Guru Panel"} size bir görev atadı.`,
              rows: [["Görev", `${code} ${doc.title}`], ["Teslim", doc.dueDate ? new Date(doc.dueDate).toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul" }) : null]],
              adminPath: path,
            });
          }
        }
        if (doc.stage === "kontrol" && previousDoc?.stage !== "kontrol") {
          const project = idOf(doc.project) ? await req.payload.findByID({ collection: "projects", id: idOf(doc.project)!, depth: 0, req, overrideAccess: true }).catch(() => null) : null;
          const owner = idOf(project?.owner);
          const u = owner && owner !== me ? await userEmail(req, owner) : null;
          if (u) {
            await sendNotice(req, u.email, {
              subject: `Onay bekliyor: ${code} ${doc.title}`,
              intro: "Bir görev Kontrol aşamasına geldi; onaylayınca Tamam'a alabilirsiniz.",
              rows: [["Görev", `${code} ${doc.title}`], ["İş", project?.title]],
              adminPath: path,
            });
          }
        }
      },
    ],
  },
  fields: [
    { name: "title", type: "text", label: "Görev", required: true },
    {
      type: "row",
      fields: [
        { name: "project", type: "relationship", relationTo: "projects", label: "İş" },
        { name: "assignee", type: "relationship", relationTo: "users", label: "Sorumlu" },
      ],
    },
    {
      type: "row",
      fields: [
        dayField("startDate", "Başlangıç"),
        dayField("dueDate", "Teslim", { index: true }),
        { name: "hours", type: "number", label: "Tahmini saat", min: 0, admin: { description: "Ekip planındaki doluluk bununla hesaplanır." } },
      ],
    },
    { name: "description", type: "textarea", label: "Ayrıntı" },
    {
      name: "checklist",
      type: "array",
      label: "Kontrol listesi",
      labels: { singular: "Madde", plural: "Maddeler" },
      admin: { description: "Açık madde varken görev Tamam'a geçmez." },
      fields: [
        {
          type: "row",
          fields: [
            { name: "done", type: "checkbox", label: "Tamam", defaultValue: false, admin: { width: "90px" } },
            { name: "text", type: "text", label: "Madde", required: true },
          ],
        },
      ],
    },
    { name: "stage", type: "select", label: "Aşama", required: true, defaultValue: "yapilacak", options: [...TASK_STAGES], index: true, admin: { position: "sidebar" } },
    { name: "priority", type: "select", label: "Öncelik", required: true, defaultValue: "normal", options: [...PRIORITIES], admin: { position: "sidebar" } },
    { name: "seq", type: "number", label: "Görev no", index: true, admin: { position: "sidebar", readOnly: true, description: "Panoda G-numara olarak görünür." } },
    { name: "startedAt", type: "date", label: "Başlandı", admin: { position: "sidebar", readOnly: true, date: { displayFormat: "dd.MM.yyyy HH:mm" }, condition: (d) => Boolean(d?.startedAt) } },
    { name: "completedAt", type: "date", label: "Tamamlandı", index: true, admin: { position: "sidebar", readOnly: true, date: { displayFormat: "dd.MM.yyyy HH:mm" }, condition: (d) => Boolean(d?.completedAt) } },
    { name: "order", type: "number", admin: { hidden: true } },
  ],
};
