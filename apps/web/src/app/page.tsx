import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { WDSClientsSection } from '@/components/wds/ClientsSection';
import { WDSContactGrid } from '@/components/wds/ContactGrid';
import { WDSHero } from '@/components/wds/Hero';
import { WDSMissionSection } from '@/components/wds/MissionSection';
import { WDSStatsSection } from '@/components/wds/StatsSection';
import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata({
  title: 'Trang chủ',
  description:
    'WebDev Studios - Câu lạc bộ lập trình web của sinh viên UIT. Nơi tập hợp các bạn sinh viên có niềm đam mê với Lập trình Web để học hỏi, trau dồi kỹ năng và phát triển bản thân.',
  path: '/',
  keywords: [
    'WebDev Studios',
    'Câu lạc bộ lập trình web UIT',
    'Học lập trình web',
    'Cộng đồng lập trình viên',
  ],
});

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
