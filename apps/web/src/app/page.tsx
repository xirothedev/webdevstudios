import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { WDSClientsSection } from '@/components/wds/ClientsSection';
import { WDSContactGrid } from '@/components/wds/ContactGrid';
import { WDSHero } from '@/components/wds/Hero';
import { WDSMissionSection } from '@/components/wds/MissionSection';
import { WDSStatsSection } from '@/components/wds/StatsSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar variant="light" />
      <WDSHero />
      <WDSContactGrid />
      <WDSClientsSection />
      <WDSMissionSection />
      <WDSStatsSection />
      <Footer variant="light" />
    </div>
  );
}
