import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { SystemLayers } from "@/components/SystemLayers";
import { HowItWorks } from "@/components/HowItWorks";
import { TechStack } from "@/components/TechStack";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <AnimatedBackground />
      <Navbar />
      <main className="relative">
        <Hero />
        <SystemLayers />
        <HowItWorks />
        <TechStack />
      </main>
      <Footer />
    </>
  );
}
