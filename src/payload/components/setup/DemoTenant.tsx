import type { Payload } from "payload";
import { DEMO_SLUG } from "../../setup/demo";
import { DemoButton } from "./DemoButton";

/** Guru panosunda: satış sunumu için demo işletmesini kurma, açma ve sıfırlama */
export async function DemoTenant({ payload }: { payload: Payload }) {
  const found = await payload.find({ collection: "tenants", where: { slug: { equals: DEMO_SLUG } }, limit: 1, depth: 0, overrideAccess: true });
  const demo = found.docs[0];
  return (
    <section className="guru-home__panel">
      <div className="guru-home__panel-head">
        <h2>Demo İşletmesi</h2>
      </div>
      <p className="guru-home__meta">
        Satış görüşmesinde paneli gerçek veri göstermeden tanıtmak için: örnek firma, kişi, fırsat, teklif, operasyon işi ve sohbetlerle dolu, kurmaca bir işletme.
        {demo ? " Üstteki işletme seçicisinden ya da aşağıdan açın; sunumdan sonra sıfırlayın." : ""}
      </p>
      <DemoButton id={demo?.id ?? null} />
    </section>
  );
}
