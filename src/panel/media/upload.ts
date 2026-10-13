"use client";

import { upload } from "@vercel/blob/client";
import { discardOriginal } from "./actions";

/** Dosya adından ilk açıklama: "guru-crm_ekran-2.png" → "Guru crm ekran 2" */
export const altFrom = (name: string) => {
  const s = name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  return s ? s.charAt(0).toLocaleUpperCase("tr-TR") + s.slice(1) : "Görsel";
};
const ROUTE = "/api/vercel-blob-client-upload-route";

/** Payload'un yükleme ucu. Canlıda dosya önce tarayıcıdan Blob'a gider (Vercel'in 4,5 MB istek sınırı), sonra kayıt açılır */
export async function uploadOne(file: File, folder: number | null, clientUpload: boolean) {
  let fileField: File | string = file;
  let original: string | null = null;
  if (clientUpload) {
    const issued = await fetch(`${ROUTE}?issue-client-upload=1`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collectionSlug: "media", filename: file.name, mimeType: file.type }),
    });
    if (!issued.ok) throw new Error("Yükleme başlatılamadı.");
    const { clientUploadContext, filename, pathname } = (await issued.json()) as { clientUploadContext: { prefix?: string; signedReceipt: string }; filename: string; pathname: string };
    await upload(pathname, file, {
      access: "public",
      contentType: file.type,
      handleUploadUrl: ROUTE,
      clientPayload: JSON.stringify({ collectionSlug: "media", mimeType: file.type, signedReceipt: clientUploadContext.signedReceipt }),
    });
    original = pathname;
    fileField = JSON.stringify({
      clientUploadContext: { prefix: clientUploadContext.prefix, signedReceipt: clientUploadContext.signedReceipt },
      collectionSlug: "media",
      filename,
      mimeType: file.type,
      size: file.size,
    });
  }
  const fd = new FormData();
  fd.append("_payload", JSON.stringify({ alt: altFrom(file.name), ...(folder ? { folder } : {}) }));
  fd.append("file", fileField);
  const r = await fetch("/api/media", { method: "POST", credentials: "include", body: fd });
  const body = (await r.json().catch(() => null)) as { doc?: { id: number }; errors?: { message?: string }[] } | null;
  if (!r.ok || !body?.doc) throw new Error(body?.errors?.[0]?.message || "Görsel yüklenemedi.");
  /* Kayıt webp kopyayla açıldı; tarayıcının yüklediği orijinal Blob'da kalmasın */
  if (original) await discardOriginal(body.doc.id, original).catch(() => null);
  return body.doc.id;
}

