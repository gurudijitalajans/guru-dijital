import { Hero } from "@/components/home/Hero";
import { ServicesBento } from "@/components/home/ServicesBento";
import { CaseStats } from "@/components/home/CaseStats";
import { ProcessSection } from "@/components/home/ProcessSection";
import { WorkTeaser } from "@/components/home/WorkTeaser";
import { ReferencesSection } from "@/components/home/ReferencesSection";
import { CTASection } from "@/components/sections/CTASection";

export default function Home() {
  return (
    <>
      <Hero />
      <ServicesBento />
      <CaseStats />
      <ProcessSection />
      <WorkTeaser />
      <ReferencesSection />
      <CTASection />
    </>
  );
}
