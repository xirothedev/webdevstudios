'use client';

import { ArrowRight, Calendar, Code, MapPin, Users, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';

import type { Activity } from '@/data/activities';

interface ActivityCardProps {
  activity: Activity;
  index?: number;
}

const getCategoryIcon = (category: Activity['category']) => {
  switch (category) {
    case 'academic':
      return <Code size={12} className="text-blue-400" />;
    case 'community':
      return <Users size={12} className="text-green-400" />;
    case 'event':
      return <Zap size={12} className="text-wds-accent" />;
    default:
      return null;
  }
};

const getCategoryLabel = (category: Activity['category']) => {
  switch (category) {
    case 'academic':
      return 'Học thuật';
    case 'community':
      return 'Cộng đồng';
    case 'event':
      return 'Sự kiện';
    default:
      return category;
  }
};

export function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="group hover:border-wds-accent/50 relative flex flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/3 transition-colors"
    >
      {/* Image Section */}
      <div className="relative h-56 overflow-hidden">
        <div className="absolute inset-0 z-10 bg-linear-to-t from-black via-transparent to-transparent opacity-60" />
        <Image
          src={activity.image}
          alt={activity.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Category Badge */}
        <div className="absolute top-4 left-4 z-20">
          <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
            {getCategoryIcon(activity.category)}
            <span>{getCategoryLabel(activity.category)}</span>
          </span>
        </div>

        <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <Calendar size={12} /> {activity.date}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col gap-3 p-6">
        <h3 className="group-hover:text-wds-accent line-clamp-2 text-xl font-bold text-white transition-colors">
          {activity.title}
        </h3>

        <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
          <MapPin size={12} /> {activity.location}
          <span className="h-1 w-1 rounded-full bg-gray-600" />
          <Users size={12} /> {activity.attendees} tham gia
        </div>

        <p className="mb-4 line-clamp-3 text-sm text-gray-400">
          {activity.description}
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
          <button className="group-hover:text-wds-accent flex items-center gap-2 text-sm font-medium text-white transition-colors">
            Xem chi tiết{' '}
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
