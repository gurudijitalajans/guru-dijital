"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { send } from "./api";

/** Panodaki görev satırının işaret kutusu: tamamlandı olarak kaydeder ve listeyi yeniler */
export function TaskCheck({ id, title }: { id: number | string; title: string }) {
  const router = useRouter();
  const [done, setDone] = useState(false);
  return (
    <input
      type="checkbox"
      className="guru-home__taskbox"
      checked={done}
      aria-label={`Tamamlandı: ${title}`}
      onChange={async () => {
        setDone(true);
        try {
          await send("PATCH", `/api/activities/${id}`, { done: true });
          router.refresh();
        } catch {
          setDone(false);
        }
      }}
    />
  );
}
