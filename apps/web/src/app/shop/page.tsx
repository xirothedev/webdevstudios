import { FeaturesGrid } from '@/components/FeaturesGrid';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { Navbar } from '@/components/Navbar';
import { TrustSection } from '@/components/TrustSection';
import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata({
  title: 'E-commerce Platform',
  description:
    'Khám phá nền tảng thương mại điện tử hiện đại với giao diện đẹp mắt và trải nghiệm người dùng tuyệt vời.',
  path: '/shop',
  keywords: [
    'E-commerce',
    'Thương mại điện tử',
    'E-commerce platform',
    'Mua sắm online',
  ],
});

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
