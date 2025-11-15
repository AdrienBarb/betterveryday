import HeroSection from "@/components/sections/HeroSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import TransformationSection from "@/components/sections/TransformationSection";
import FAQSection from "@/components/sections/FAQSection";

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TransformationSection />
      <FAQSection />
    </div>
  );
}
