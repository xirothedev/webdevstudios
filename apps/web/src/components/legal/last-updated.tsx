'use client';

import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

import { useLastUpdated } from './last-updated-provider';

export function LastUpdated() {
  const context = useLastUpdated();
  const dateToFormat = context?.date ? new Date(context.date) : new Date();

  if (isNaN(dateToFormat.getTime())) {
    return <strong>{context?.date || ''}</strong>;
  }

  return (
    <strong>
      {format(dateToFormat, "'ngày' d 'tháng' M 'năm' yyyy", { locale: vi })}
    </strong>
  );
}
