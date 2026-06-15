import { Hero } from "@/components/Hero";
import { CustomerLogos } from "@/components/CustomerLogos";
import { Pillars } from "@/components/Pillars";
import { VerifiedTable } from "@/components/VerifiedTable";
import { SdkSection } from "@/components/SdkSection";
import { BusinessModel } from "@/components/BusinessModel";
import { Testimonials } from "@/components/Testimonials";
import { FaqAccordion } from "@/components/FaqAccordion";
import { BlogStub } from "@/components/BlogStub";
import { CtaSection } from "@/components/CtaSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CustomerLogos />
      <Pillars />
      <VerifiedTable />
      <SdkSection />
      <BusinessModel />
      <Testimonials />
      <FaqAccordion />
      <BlogStub />
      <CtaSection />
    </>
  );
}
