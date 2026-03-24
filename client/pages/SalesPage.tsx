import BenefitsSection from "@/components/sales/BenefitsSection";
import ByRoofersSection from "@/components/sales/ByRoofersSection";
import CaseStudies from "@/components/sales/CaseStudies";
import DemoSection from "@/components/sales/DemoSection";
import FAQSection from "@/components/sales/FAQSection";
import FeatureShowcase from "@/components/sales/FeatureShowcase";
import FinalCTA from "@/components/sales/FinalCTA";
import GuaranteeSection from "@/components/sales/GuaranteeSection";
import LaunchSteps from "@/components/sales/LaunchSteps";
import LiveNumbers from "@/components/sales/LiveNumbers";
import MobileCTA from "@/components/sales/MobileCTA";
import PricingOffer from "@/components/sales/PricingOffer";
import ProblemSection from "@/components/sales/ProblemSection";
import ReviewSystem from "@/components/sales/ReviewSystem";
import SalesFooter from "@/components/sales/SalesFooter";
import SalesHero from "@/components/sales/SalesHero";
import SalesNavbar from "@/components/sales/SalesNavbar";
import SocialProof from "@/components/sales/SocialProof";
import SolutionSection from "@/components/sales/SolutionSection";
import UrgencyBanner from "@/components/sales/UrgencyBanner";

export default function SalesPage() {
  return (
    <div className="min-h-screen bg-white pb-16 md:pb-0">
      <SalesNavbar />
      <SalesHero />
      <ProblemSection />
      <SolutionSection />
      <FeatureShowcase />
      <DemoSection />
      <BenefitsSection />
      <ReviewSystem />
      <CaseStudies />
      <ByRoofersSection />
      <LiveNumbers />
      <SocialProof />
      <PricingOffer />
      <GuaranteeSection />
      <UrgencyBanner />
      <LaunchSteps />
      <FAQSection />
      <FinalCTA />
      <SalesFooter />
      <MobileCTA />
    </div>
  );
}
