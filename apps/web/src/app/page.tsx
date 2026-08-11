/**
 * Copyright (c) 2026 Xiro The Dev <lethanhtrung.trungle@gmail.com>
 *
 * Source Available License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to:
 * - View and study the Software for educational purposes
 * - Fork this repository on GitHub for personal reference
 * - Share links to this repository
 *
 * THE FOLLOWING ARE PROHIBITED:
 * - Using the Software in production or commercial applications
 * - Copying substantial portions of the Software into other projects
 * - Distributing modified versions of the Software
 * - Removing or altering copyright notices
 *
 * For commercial licensing or usage permissions, contact: lethanhtrung.trungle@gmail.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

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
