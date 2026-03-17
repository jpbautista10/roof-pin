import SalesNavbar from "@/components/sales/SalesNavbar";
import SalesHero from "@/components/sales/SalesHero";
import ProblemSection from "@/components/sales/ProblemSection";
import SolutionSection from "@/components/sales/SolutionSection";
import FeatureShowcase from "@/components/sales/FeatureShowcase";
import DemoSection from "@/components/sales/DemoSection";
import BenefitsSection from "@/components/sales/BenefitsSection";
import ReviewSystem from "@/components/sales/ReviewSystem";
import CaseStudies from "@/components/sales/CaseStudies";
import ByRoofersSection from "@/components/sales/ByRoofersSection";
import LiveNumbers from "@/components/sales/LiveNumbers";
import SocialProof from "@/components/sales/SocialProof";
import PricingOffer from "@/components/sales/PricingOffer";
import GuaranteeSection from "@/components/sales/GuaranteeSection";
import UrgencyBanner from "@/components/sales/UrgencyBanner";
import LaunchSteps from "@/components/sales/LaunchSteps";
import FAQSection from "@/components/sales/FAQSection";
import FinalCTA from "@/components/sales/FinalCTA";
import SalesFooter from "@/components/sales/SalesFooter";
import MobileCTA from "@/components/sales/MobileCTA";

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
