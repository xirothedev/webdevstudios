import { FeaturesGrid } from '@/components/FeaturesGrid';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { Navbar } from '@/components/Navbar';
import { TrustSection } from '@/components/TrustSection';

export default function ShopPage() {
  return (
    <div className="bg-wds-background text-wds-text selection:bg-wds-accent/30 selection:text-wds-text min-h-screen">
      <Navbar />
      <Hero />
      <TrustSection />
      <FeaturesGrid />
      <Footer />
    </div>
  );
}
