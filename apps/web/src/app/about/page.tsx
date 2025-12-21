import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { WDSAboutHero } from '@/components/wds/AboutHero';
import { WDSAboutSections } from '@/components/wds/AboutSections';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar variant="light" />
      <WDSAboutHero />
      <WDSAboutSections />
      <Footer variant="light" />
    </div>
  );
}
