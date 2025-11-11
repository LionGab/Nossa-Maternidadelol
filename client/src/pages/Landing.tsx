import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Benefits } from "@/components/landing/Benefits";
import { NathIASection } from "@/components/landing/NathIASection";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { SiteFooter } from "@/components/landing/SiteFooter";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <HowItWorks />
      <Benefits />
      <NathIASection />
      <Testimonials />
      <FAQ />
      <SiteFooter />
    </div>
  );
}
