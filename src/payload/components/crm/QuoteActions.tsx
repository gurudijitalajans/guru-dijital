"use client";

import { useDocumentInfo, useFormFields } from "@payloadcms/ui";
import { fmtMoney } from "./api";

/** Teklif formunun yanında: anlık toplam ve müşteriye gidecek belgeyi açma düğmesi */
type Item = { qty?: number; unitPrice?: number; vatRate?: string };

export function QuoteActions() {
  const { id } = useDocumentInfo();
  const rows = useFormFields(([f]) => {
    const n = Number(f.items?.value ?? 0);
    return Array.from({ length: n }, (_, i): Item => ({
      qty: Number(f[`items.${i}.qty`]?.value ?? 0),
      unitPrice: Number(f[`items.${i}.unitPrice`]?.value ?? 0),
      vatRate: String(f[`items.${i}.vatRate`]?.value ?? "20"),
    }));
  });
  let sub = 0;
  let vat = 0;
  for (const r of rows) {
    const line = (r.qty ?? 0) * (r.unitPrice ?? 0);
    sub += line;
    vat += (line * Number(r.vatRate)) / 100;
  }
  return (
    <div className="guru-quote">
      <div className="guru-quote__sum">
        <span>Genel toplam</span>
        <b>{fmtMoney(sub + vat, 2)}</b>
        <small>
          {fmtMoney(sub, 2)} + KDV {fmtMoney(vat, 2)}
        </small>
      </div>
      {id ? (
        <a className="guru-quote__btn" href={`/api/quotes/${id}/yazdir?yazdir=1`} target="_blank" rel="noopener">
          Yazdır / PDF
        </a>
      ) : (
        <p className="guru-crm__hint">Kaydedince teklif numarası verilir ve belge açılabilir.</p>
      )}
    </div>
  );
}
