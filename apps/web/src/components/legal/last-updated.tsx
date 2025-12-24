'use client';

import { format, type Locale as DateFnsLocale } from 'date-fns';
import { enUS, vi } from 'date-fns/locale';

import { useLastUpdated } from './last-updated-provider';

const localeMap: Record<string, DateFnsLocale> = {
  en: enUS,
  vi: vi,
};

// Format patterns for different locales
const formatPatterns: Record<string, string> = {
  en: 'MMMM d, yyyy', // January 15, 2024
  vi: "'ngày' d 'tháng' M 'năm' yyyy", // ngày 4 tháng 12 năm 2025
};

export function LastUpdated() {
  const context = useLastUpdated();

  if (!context) {
    return (
      <strong>{format(new Date(), formatPatterns.en, { locale: enUS })}</strong>
    );
  }

  const { date, locale } = context;
  const dateLocale = localeMap[locale] || enUS;
  const formatPattern = formatPatterns[locale] || formatPatterns.en;

  try {
    // Parse the ISO date string and format it with locale
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      // If date is invalid, return as is
      return <strong>{date}</strong>;
    }
    const formattedDate = format(dateObj, formatPattern, {
      locale: dateLocale,
    });
    return <strong>{formattedDate}</strong>;
  } catch {
    // If date is already formatted, return as is
    return <strong>{date}</strong>;
  }
}
