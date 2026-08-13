import { HeroSection } from "./hero-section";
import { FeaturesSection } from "./features-section";
import { AiShowcaseSection } from "./ai-showcase-section";
import { PricingSection } from "./pricing-section";
import { TestimonialsSection } from "./testimonials-section";
import { FaqSection } from "./faq-section";
import { Footer } from "./footer";
import { Navbar } from "./navbar";

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <AiShowcaseSection />
        <TestimonialsSection />
        <PricingSection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
