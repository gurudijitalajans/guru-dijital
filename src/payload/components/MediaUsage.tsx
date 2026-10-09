import Link from "next/link";
import type { Payload } from "payload";
import { findMediaUsage } from "../media-usage";

/** Medya formunun yanında "Kullanıldığı yerler" listesi (sunucuda hesaplanır) */
export async function MediaUsage(props: { payload: Payload; id?: string | number; data?: { id?: string | number } }) {
  const id = props.id ?? props.data?.id;
  if (!id) return null;
  const uses = await findMediaUsage(props.payload, id);
  return (
    <div className="guru-usage">
      <p className="guru-usage__title">Kullanıldığı yerler</p>
      {uses.length === 0 ? (
        <p className="guru-usage__empty">Bu görsel şu an sitede hiçbir yerde kullanılmıyor.</p>
      ) : (
        <ul>
          {uses.map((u) => (
            <li key={`${u.href}-${u.label}`}>
              <Link href={u.href}>
                <b>{u.label}</b>
                <span>{u.where}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
