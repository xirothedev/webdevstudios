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

/// <reference types="node" />

// Bun resolves tsconfig paths from the nearest tsconfig.json; inside dist the dev
// mapping @/* -> ./src/* loads classes twice (dist provider vs src token) and Nest DI
// crashes. This runtime tsconfig points aliases into dist so bun loads one copy —
// the same fix the Dockerfile applies at image build time.
import { writeFileSync } from 'fs';

const runtime = {
  compilerOptions: {
    baseUrl: '.',
    paths: {
      '@/*': ['./*'],
      '@prisma/client': ['../src/generated/prisma'],
      '@prisma/client/*': ['../src/generated/prisma/*'],
    },
  },
};

writeFileSync('dist/tsconfig.json', `${JSON.stringify(runtime, null, 2)}\n`);
