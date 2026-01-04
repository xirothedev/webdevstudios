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

import Image from 'next/image';
import Link from 'next/link';

export function AuthHeader() {
  return (
    <header className="mx-auto flex h-16 w-full max-w-5xl items-center px-4 sm:px-6">
      <Link href="/" className="relative block h-8 w-32">
        <Image
          src="/image/wds-logo.svg"
          alt="WebDev Studios"
          fill
          className="object-contain"
          sizes="128px"
          priority
        />
      </Link>
    </header>
  );
}
