import Image from "next/image";
import WaitlistForm from "@/components/WaitlistForm";

export default function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl text-center">
        <div className="flex justify-center mb-8">
          <Image
            src="/maarty.png"
            alt="Maarty"
            width={200}
            height={200}
            className="w-64 h-64 md:w-80 md:h-80 object-contain"
            priority
          />
        </div>
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl mb-6 text-text">
          Meet Maarty. Your daily guide to becoming your best self.
        </h1>
        <p className="text-xl text-text/80 mb-8 max-w-2xl mx-auto">
          Maarty helps you prioritize, take action daily, and review your
          progress weekly.
        </p>

        <div className="max-w-md mx-auto mb-8">
          <WaitlistForm />
        </div>
      </div>
    </section>
  );
}
