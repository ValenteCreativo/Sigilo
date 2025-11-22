import {
  Hero,
  Features,
  TechCarousel,
  Mission,
  Footer,
} from "@/components/landing";
import { MatrixRain } from "@/components/effects";

export default function LandingPage() {
  return (
    <main className="min-h-screen relative bg-transparent">
      {/* Encrypted particle field background */}
      <MatrixRain opacity={1.0} speed={0.75} density={0.65} />

      <div className="relative z-10">
        <Hero />
        <Features />
        <TechCarousel />
        <Mission />
        <Footer />
      </div>
    </main>
  );
}
