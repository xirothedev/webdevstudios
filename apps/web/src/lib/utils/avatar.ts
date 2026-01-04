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

export function getAvatarInitials(
  fullName: string | null,
  email: string
): string {
  if (fullName) {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      // Get first letter of first word and last word
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    // If only one word, get first 2 letters
    return fullName.substring(0, 2).toUpperCase();
  }

  // Fallback to email
  if (email && email.length > 0) {
    return email[0].toUpperCase();
  }

  // Ultimate fallback
  return 'U';
}
