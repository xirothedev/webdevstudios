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

import { CalendarContainer } from '@/components/calendar/CalendarContainer';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="light" />
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
            Lịch sự kiện
          </h1>
          <p className="mt-2 text-base text-gray-600 sm:text-lg">
            Xem tất cả các sự kiện, workshop và hoạt động của WebDev Studios
          </p>
        </div>
        <CalendarContainer />
      </div>
      <Footer variant="light" />
    </div>
  );
}
