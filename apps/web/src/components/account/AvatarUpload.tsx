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

import { Camera, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useUpdateAvatar } from '@/lib/api/hooks/use-user';
import { cn } from '@/lib/utils';
import { getAvatarInitials } from '@/lib/utils/avatar';
import type { User } from '@/types/auth.types';

interface AvatarUploadProps {
  user: User;
  className?: string;
}

export function AvatarUpload({ user, className }: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const updateAvatar = useUpdateAvatar();

  const initials = getAvatarInitials(user.fullName, user.email);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error(
        'Định dạng file không hợp lệ. Vui lòng chọn file JPG, PNG hoặc WebP.'
      );
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn 5MB.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file directly
    updateAvatar.mutate(file, {
      onSuccess: () => {
        setPreview(null); // Clear preview after successful upload
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
      onError: () => {
        setPreview(null); // Clear preview on error
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
    });
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const avatarUrl = preview || user.avatar;
  const isLoading = updateAvatar.isPending;

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <div className="relative">
        <Avatar className="h-24 w-24 border-4 border-white shadow-lg sm:h-32 sm:w-32">
          {avatarUrl ? (
            <AvatarImage
              src={avatarUrl}
              alt={user.fullName || user.email}
              className="object-cover"
            />
          ) : null}
          <AvatarFallback className="bg-wds-accent/20 text-wds-accent text-2xl font-bold sm:text-3xl">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Upload avatar"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleButtonClick}
          disabled={isLoading}
          className="gap-2"
        >
          <Camera className="h-4 w-4" />
          <span>Thay đổi ảnh</span>
        </Button>
        <p className="text-xs text-gray-500">JPG, PNG hoặc WebP (tối đa 5MB)</p>
      </div>
    </div>
  );
}
