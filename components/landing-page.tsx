import { SiteHeader } from "@/components/site-header";
import { LandingMotion } from "@/components/landing-motion";
import { HeroSection } from "@/components/landing/hero-section";
import { HighlightsSection } from "@/components/landing/highlights-section";
import { TourSection } from "@/components/landing/tour-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { PrinciplesSection } from "@/components/landing/principles-section";
import { SecuritySection } from "@/components/landing/security-section";
import { AudienceSection } from "@/components/landing/audience-section";
import { FaqSection } from "@/components/landing/faq-section";
import { ContactSection } from "@/components/landing/contact-section";
import { ClosingSection } from "@/components/landing/closing-section";
import { FooterSection } from "@/components/landing/footer-section";

export async function LandingPage() {
  return (
    <>
      <SiteHeader />
      <LandingMotion>
        <HeroSection />
        <HighlightsSection />
        <TourSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PrinciplesSection />
        <SecuritySection />
        <AudienceSection />
        <FaqSection />
        <ContactSection />
        <ClosingSection />
      </LandingMotion>
      <FooterSection />
    </>
  );
}
