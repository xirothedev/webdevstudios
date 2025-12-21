import { WDSClientsSection } from '@/components/wds/ClientsSection';
import { WDSContactGrid } from '@/components/wds/ContactGrid';
import { WDSFooter } from '@/components/wds/Footer';
import { WDSHeader } from '@/components/wds/Header';
import { WDSHero } from '@/components/wds/Hero';
import { WDSMissionSection } from '@/components/wds/MissionSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <WDSHeader />
      <WDSHero />
      <WDSContactGrid />
      <WDSClientsSection />
      <WDSMissionSection />
      <WDSFooter />
    </div>
  );
}
