import { Crown } from 'lucide-react';
import Image from 'next/image';

import { getInitials } from '@/data/generations';

interface GenerationMemberAvatarProps {
  avatar?: string;
  name: string;
  isLeader?: boolean;
  size?: 'small' | 'large';
  variant?: 'mobile' | 'desktop';
}

/**
 * Avatar component for generation members
 * Supports both small and large sizes, with leader badge
 */
export function GenerationMemberAvatar({
  avatar,
  name,
  isLeader = false,
  size = 'small',
  variant = 'mobile',
}: GenerationMemberAvatarProps) {
  const initials = getInitials(name);

  // Size classes based on size prop and variant
  const sizeClasses =
    size === 'large'
      ? variant === 'desktop'
        ? 'h-40 w-40'
        : 'h-20 w-20 sm:h-28 sm:w-28'
      : variant === 'desktop'
        ? 'h-28 w-28'
        : 'h-14 w-14 sm:h-20 sm:w-20';

  const textSizeClasses =
    size === 'large'
      ? variant === 'desktop'
        ? 'text-2xl'
        : 'text-lg sm:text-2xl'
      : variant === 'desktop'
        ? 'text-lg'
        : 'text-sm sm:text-base';

  const crownSizeClasses =
    size === 'large'
      ? variant === 'desktop'
        ? 'h-8 w-8'
        : 'h-6 w-6 sm:h-7 sm:w-7'
      : variant === 'desktop'
        ? 'h-6 w-6'
        : 'h-5 w-5 sm:h-6 sm:w-6';

  const crownIconSizeClasses =
    size === 'large'
      ? variant === 'desktop'
        ? 'h-4 w-4'
        : 'h-3 w-3 sm:h-3.5 sm:w-3.5'
      : variant === 'desktop'
        ? 'h-3 w-3'
        : 'h-2.5 w-2.5 sm:h-3 sm:w-3';

  // Container classes based on size
  const containerClasses =
    size === 'large'
      ? 'from-wds-accent to-wds-accent/70 shadow-wds-accent/30 group-hover:shadow-wds-accent/50 overflow-hidden rounded-full bg-linear-to-br shadow-lg transition-shadow'
      : 'bg-wds-accent/20 overflow-hidden rounded-full';

  const fallbackClasses =
    size === 'large'
      ? 'from-wds-accent to-wds-accent/70 shadow-wds-accent/30 flex items-center justify-center rounded-full bg-linear-to-br text-black shadow-lg font-black'
      : 'bg-wds-accent/20 text-wds-accent flex items-center justify-center rounded-full font-bold';

  const imageWidth =
    size === 'large' ? (variant === 'desktop' ? 160 : 120) : 64;
  const imageHeight =
    size === 'large' ? (variant === 'desktop' ? 160 : 120) : 64;

  return (
    <div className="relative">
      {avatar ? (
        <div className={containerClasses}>
          <Image
            src={avatar}
            alt={name}
            width={imageWidth}
            height={imageHeight}
            sizes={
              size === 'large'
                ? variant === 'desktop'
                  ? '160px'
                  : '(max-width: 640px) 80px, 112px'
                : variant === 'desktop'
                  ? '112px'
                  : '(max-width: 640px) 56px, 80px'
            }
            className={`${sizeClasses} object-cover transition-transform duration-300 ${
              size === 'large'
                ? 'group-hover:scale-110'
                : 'group-hover:scale-105'
            }`}
          />
        </div>
      ) : (
        <div className={`${fallbackClasses} ${sizeClasses} ${textSizeClasses}`}>
          {initials}
        </div>
      )}
      {isLeader && (
        <div
          className={`text-wds-accent absolute ${
            size === 'large'
              ? variant === 'desktop'
                ? 'right-2 bottom-2'
                : '-right-1 -bottom-1'
              : variant === 'desktop'
                ? 'right-1 bottom-1'
                : '-right-0.5 -bottom-0.5'
          } flex ${crownSizeClasses} items-center justify-center rounded-full border-2 border-white bg-black shadow-lg`}
        >
          <Crown className={crownIconSizeClasses} />
        </div>
      )}
    </div>
  );
}
