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

export function AuthWelcome() {
  return (
    <div className="space-y-2 text-left">
      <h1 className="text-3xl font-semibold text-white">
        Welcome to WebDev Studios
      </h1>
      <p className="text-lg text-white/70">The new way to build software</p>
      <p className="font-mono text-xs tracking-[0.2em] text-white/40 uppercase">
        build · ship · learn
      </p>
    </div>
  );
}
