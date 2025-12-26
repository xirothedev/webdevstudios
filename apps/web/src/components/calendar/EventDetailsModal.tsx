'use client';

import {
  Calendar as CalendarIcon,
  ExternalLink,
  MapPin,
  Users,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/button';
import { Event, EventType } from '@/lib/events/types';
import {
  formatEventTime,
  getEventTypeColor,
  getEventTypeLabel,
  getRelativeTime,
} from '@/lib/events/utils';

interface EventDetailsModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EventDetailsModal({
  event,
  isOpen,
  onClose,
}: EventDetailsModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!event || !mounted) return null;

  const eventColor = getEventTypeColor(event.type);
  const eventTypeLabel = getEventTypeLabel(event.type);

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-9998 bg-black/50"
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/2 left-1/2 z-9999 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-4 shadow-xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: eventColor }}
                  />
                  <span className="text-sm font-medium text-gray-600">
                    {eventTypeLabel}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  {event.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              {/* Time */}
              <div className="flex items-start gap-3">
                <CalendarIcon className="mt-0.5 h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatEventTime(event)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getRelativeTime(event)}
                  </p>
                </div>
              </div>

              {/* Location */}
              {event.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-gray-400" />
                  <p className="text-sm text-gray-700">{event.location}</p>
                </div>
              )}

              {/* Organizer */}
              {event.organizer && (
                <div className="flex items-start gap-3">
                  <Users className="mt-0.5 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Tổ chức bởi:</span>{' '}
                      {event.organizer}
                    </p>
                    {event.attendees !== undefined && event.attendees > 0 && (
                      <p className="text-xs text-gray-500">
                        {event.attendees} người tham gia
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              {event.description && (
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-700">{event.description}</p>
                </div>
              )}

              {/* Survey Link */}
              {event.type === EventType.SURVEY && event.surveyLink && (
                <div className="pt-2">
                  <Button
                    asChild
                    variant="default"
                    className="w-full"
                    style={{ backgroundColor: eventColor }}
                  >
                    <a
                      href={event.surveyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      <span>Mở khảo sát</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={onClose}>
                Đóng
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
