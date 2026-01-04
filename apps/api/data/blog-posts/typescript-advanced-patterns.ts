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
  slug: 'typescript-advanced-patterns',
  title: 'Advanced TypeScript Patterns for Modern Development',
  excerpt:
    'Explore advanced TypeScript patterns including conditional types, mapped types, and utility types to write more robust and type-safe code.',
  content: `# Advanced TypeScript Patterns for Modern Development

TypeScript offers powerful type system features that can help you write more robust and maintainable code. Let's explore some advanced patterns.

## Conditional Types

Conditional types allow you to create types that depend on other types:

\`\`\`typescript
type NonNullable<T> = T extends null | undefined ? never : T;

type Example = NonNullable<string | null>; // string
\`\`\`

## Mapped Types

Mapped types let you create new types by transforming properties:

\`\`\`typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};
\`\`\`

## Utility Types

TypeScript provides several built-in utility types:

- \`Partial<T>\`: Make all properties optional
- \`Required<T>\`: Make all properties required
- \`Pick<T, K>\`: Select specific properties
- \`Omit<T, K>\`: Exclude specific properties

## Template Literal Types

Create types from string templates:

\`\`\`typescript
type EventName<T extends string> = \`on\${Capitalize<T>}\`;

type ClickEvent = EventName<'click'>; // 'onClick'
\`\`\`

## Best Practices

- Use type guards for runtime type checking
- Leverage discriminated unions
- Prefer interfaces for object shapes
- Use type aliases for complex types

## Conclusion

Mastering these advanced TypeScript patterns will make you a more effective developer.`,
  metaTitle: 'Advanced TypeScript Patterns Guide | WebDev Studios',
  metaDescription:
    'Learn advanced TypeScript patterns including conditional types, mapped types, and utility types to write more robust code.',
  isPublished: true,
};
