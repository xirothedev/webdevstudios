import { FeaturesGrid } from '@/components/FeaturesGrid';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { Navbar } from '@/components/Navbar';
import { TrustSection } from '@/components/TrustSection';

export default function Home() {
  return (
    <div className="bg-primary min-h-screen selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />
      <Hero />
      <TrustSection />
      <FeaturesGrid />
      <Footer />
    </div>
  );
}
