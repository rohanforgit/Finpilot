import { Navbar } from "@/features/landing/components/Navbar";
import { Hero } from "@/features/landing/components/Hero";
import { HowItWorks } from "@/features/landing/components/HowItWorks";
import { InteractiveDemo } from "@/features/landing/components/InteractiveDemo";
import { Features } from "@/features/landing/components/Features";
import { Comparison } from "@/features/landing/components/Comparison";
import { Testimonials } from "@/features/landing/components/Testimonials";
import { FAQ } from "@/features/landing/components/FAQ";
import { Footer } from "@/features/landing/components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 overflow-x-hidden">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <HowItWorks />
        <InteractiveDemo />
        <Features />
        <Comparison />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
