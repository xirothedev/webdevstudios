import { WDSAboutHero } from '@/components/wds/AboutHero';
import { WDSAboutSections } from '@/components/wds/AboutSections';
import { WDSFooter } from '@/components/wds/Footer';
import { WDSHeader } from '@/components/wds/Header';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <WDSHeader />
      <WDSAboutHero />
      <WDSAboutSections />
      <WDSFooter />
    </div>
  );
}
