import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";

export default function Home() {
  return (
    <>
      <AnimatedBackground />
      <Navbar />
      <main className="relative">
        <Hero />
      </main>
    </>
  );
}
