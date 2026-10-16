import { cms } from "@/lib/cms";
import { aktar } from "@/lib/analiz/depo";

/**
 * Ölçüm tamponunu veritabanına aktarır. Vercel Cron günde bir çağırır
 * (CRON_SECRET ile); Analiz sayfası da açılışta aynı işi yapar.
 */
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  /* Aktarım zararsız ve tekrarlanabilir: CRON_SECRET yoksa Vercel Cron'un kimliği yeterli */
  const secret = process.env.CRON_SECRET;
  const ok = secret ? req.headers.get("authorization") === `Bearer ${secret}` : (req.headers.get("user-agent") ?? "").startsWith("vercel-cron");
  if (!ok) return new Response("Yetkisiz", { status: 401 });
  const r = await aktar(await cms());
  return Response.json(r, { headers: { "Cache-Control": "no-store" } });
}
