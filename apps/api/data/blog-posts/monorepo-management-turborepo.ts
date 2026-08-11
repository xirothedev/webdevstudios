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

import { BlogPostSeedData } from './types';

export const blogPost: BlogPostSeedData = {
  slug: 'monorepo-management-turborepo',
  title: 'Monorepo Management with Turborepo',
  excerpt:
    'Learn how to manage monorepos effectively using Turborepo, including build optimization, caching, and task orchestration.',
  content: `# Monorepo Management with Turborepo

Turborepo makes managing monorepos easier. Let's explore how.

## What is Turborepo?

Turborepo is a high-performance build system for JavaScript and TypeScript monorepos.

## Setting Up

\`\`\`json
{
  "turbo": {
    "pipeline": {
      "build": {
        "dependsOn": ["^build"],
        "outputs": ["dist/**"]
      },
      "test": {
        "dependsOn": ["build"],
        "outputs": []
      }
    }
  }
}
\`\`\`

## Task Dependencies

Define task relationships:

\`\`\`json
{
  "build": {
    "dependsOn": ["^build"]
  },
  "test": {
    "dependsOn": ["build"]
  }
}
\`\`\`

## Caching

Turborepo caches task outputs:

\`\`\`bash
# Cache is automatic
turbo run build

# Clear cache
turbo run build --force
\`\`\`

## Remote Caching

Share cache across team:

\`\`\`bash
turbo login
turbo link
\`\`\`

## Best Practices

- Define clear task dependencies
- Use appropriate outputs
- Leverage remote caching
- Monitor build performance

## Conclusion

Turborepo simplifies monorepo management significantly.`,
  metaTitle: 'Monorepo Management with Turborepo | WebDev Studios',
  metaDescription:
    'Learn how to manage monorepos effectively using Turborepo including build optimization and caching.',
  isPublished: true,
};
