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

'use client';

import { Search } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

import { ActivityCard } from '@/components/activities/ActivityCard';
import { ActivityFilters } from '@/components/activities/ActivityFilters';
import { ActivityHero } from '@/components/activities/ActivityHero';
import { NewsletterCTA } from '@/components/activities/NewsletterCTA';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { ACTIVITIES, CATEGORIES } from '@/data/activities';

export default function ActivitiesPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredActivities = ACTIVITIES.filter((item) => {
    const matchesCategory =
      activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="selection:bg-wds-accent min-h-screen bg-black font-sans text-white selection:text-black">
      <Navbar variant="dark" />

      {/* --- BACKGROUND --- */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            maskImage:
              'radial-gradient(circle at top center, black 30%, transparent 80%)',
            WebkitMaskImage:
              'radial-gradient(circle at top center, black 30%, transparent 80%)',
          }}
        />
      </div>

      <main className="relative z-10 pt-32 pb-20">
        {/* --- HEADER --- */}
        <ActivityHero />

        {/* --- CONTROLS --- */}
        <section className="mb-16 px-6">
          <div className="mx-auto max-w-7xl">
            <ActivityFilters
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              categories={CATEGORIES}
            />
          </div>
        </section>

        {/* --- GRID --- */}
        <section className="min-h-[500px] px-6">
          <div className="mx-auto max-w-7xl">
            <motion.div
              layout
              className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              <AnimatePresence mode="popLayout">
                {filteredActivities.length > 0 ? (
                  filteredActivities.map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} />
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full py-20 text-center"
                  >
                    <div className="mb-4 inline-flex rounded-full bg-white/5 p-4 text-gray-500">
                      <Search size={32} />
                    </div>
                    <p className="text-lg text-gray-400">
                      Không tìm thấy hoạt động nào phù hợp.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>

        {/* --- NEWSLETTER CTA --- */}
        <NewsletterCTA />
      </main>

      <Footer variant="dark" />
    </div>
  );
}
