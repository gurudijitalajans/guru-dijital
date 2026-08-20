import { HeroV2 } from "@/components/v2/HeroV2";
import { VelocityMarquee } from "@/components/fx/VelocityMarquee";
import { ServicesIndex } from "@/components/v2/ServicesIndex";
import { CaseStack } from "@/components/v2/CaseStack";
import { ProcessRail } from "@/components/v2/ProcessRail";
import { WorkShowcase } from "@/components/v2/WorkShowcase";
import { ReferencesWall } from "@/components/v2/ReferencesWall";
import { CTAV2 } from "@/components/v2/CTAV2";
import { services } from "@/lib/data";

export default function Home() {
  return (
    <>
      <HeroV2 />

      {/* scroll hızına tepkili hizmet marquee'si */}
      <div className="border-y border-paper/10 bg-ink py-5" aria-hidden>
        <VelocityMarquee baseVelocity={2.5}>
          {services.map((s) => (
            <span
              key={s.slug}
              className="mx-6 inline-flex items-center gap-6 text-sm font-semibold uppercase tracking-[0.18em] text-paper/70"
            >
              {s.title}
              <span className="text-guru">✦</span>
            </span>
          ))}
        </VelocityMarquee>
      </div>

      <ServicesIndex />
      <CaseStack />
      <ProcessRail />
      <WorkShowcase />
      <ReferencesWall />
      <CTAV2 />
    </>
  );
}
