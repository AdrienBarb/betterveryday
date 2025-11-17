import HeroSection from "@/components/sections/HeroSection";
import WhoIsMaartySection from "@/components/sections/WhoIsMaartySection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import FAQSection from "@/components/sections/FAQSection";

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <WhoIsMaartySection />
      <FeaturesSection />
      <FAQSection />
    </div>
  );
}
