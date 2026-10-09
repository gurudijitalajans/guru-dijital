"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDocumentInfo, useFormFields } from "@payloadcms/ui";
import { getDocs, listUrl, send } from "../crm/api";

/**
 * Fırsat sayfasının yanında: bu fırsattan açılmış operasyon işleri ve
 * "Operasyon işi aç" (şablon seçilirse görevler kendiliğinden açılır).
 */
type Id = number | string;
type Project = { id: Id; title: string; status: string };
type Template = { id: Id; name: string };

export function DealToProject() {
  const { id } = useDocumentInfo();
  const stage = useFormFields(([f]) => f.stage?.value as string | undefined);
  const router = useRouter();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [template, setTemplate] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let alive = true;
    Promise.all([getDocs<Project>(listUrl("projects", { deal: { equals: id } })), getDocs<Template>("/api/templates?limit=100&depth=0&sort=name")]).then(([p, t]) => {
      if (!alive) return;
      setProjects(p);
      setTemplates(t);
    });
    return () => {
      alive = false;
    };
  }, [id]);

  if (!id || !projects) return null;

  const open = async () => {
    setBusy(true);
    setError("");
    try {
      const res = (await send("POST", "/api/projects", { deal: id, template: template || undefined, title: "" })) as { doc: { id: Id } };
      router.push(`/admin/collections/projects/${res.doc.id}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <div className="guru-quote guru-ops__deal">
      <p className="guru-ops__deal-title">Guru Operation</p>
      {projects.length > 0 ? (
        <ul className="guru-crm__links">
          {projects.map((p) => (
            <li key={p.id}>
              <Link href={`/admin/collections/projects/${p.id}`}>
                <b>{p.title}</b>
                <small>Operasyon işi</small>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="guru-crm__hint">{stage === "kazanildi" ? "Fırsat kazanıldı: işi operasyona aktarın." : "Fırsat kazanılınca işi buradan operasyona aktarabilirsiniz."}</p>
      )}
      <label className="guru-crm__due">
        <span>Süreç şablonu</span>
        <select value={template} onChange={(e) => setTemplate(e.target.value)}>
          <option value="">Şablonsuz (boş iş)</option>
          {templates.map((t) => (
            <option key={t.id} value={String(t.id)}>
              {t.name}
            </option>
          ))}
        </select>
      </label>
      <button type="button" className="guru-crm__save" onClick={open} disabled={busy}>
        {busy ? "Açılıyor…" : projects.length ? "Yeni operasyon işi aç" : "Operasyon işi aç"}
      </button>
      {error ? <p className="guru-crm__error">{error}</p> : null}
    </div>
  );
}
