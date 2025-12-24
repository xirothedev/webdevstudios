import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { WDSAboutHero } from '@/components/wds/AboutHero';
import { WDSAboutSections } from '@/components/wds/AboutSections';
import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata({
  title: 'Về chúng tôi',
  description:
    'Tìm hiểu về WebDev Studios - Câu lạc bộ lập trình web của sinh viên UIT. Tiểu sử, định hướng, tầm nhìn, sứ mệnh và phạm vi hoạt động của chúng tôi.',
  path: '/about',
  keywords: [
    'Về WebDev Studios',
    'Giới thiệu WebDev Studios',
    'Câu lạc bộ UIT',
    'Lịch sử WebDev Studios',
  ],
});

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
