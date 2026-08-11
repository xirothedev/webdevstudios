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
  slug: 'react-server-components-deep-dive',
  title: 'React Server Components: A Deep Dive',
  excerpt:
    'Understand React Server Components, how they work, and how they can improve your application performance and user experience.',
  content: `# React Server Components: A Deep Dive

React Server Components represent a fundamental shift in how we think about React applications. Let's dive deep into this technology.

## What Are Server Components?

Server Components are React components that run exclusively on the server. They:

- Never ship JavaScript to the client
- Can access backend resources directly
- Reduce bundle size significantly

## How They Work

Server Components are rendered on the server and sent to the client as a special format. The client then renders them without needing the component code.

## Benefits

1. **Smaller Bundle Size**: No JavaScript sent for Server Components
2. **Direct Backend Access**: Access databases, file systems, etc.
3. **Better Security**: Sensitive logic stays on the server

## When to Use Server Components

- Data fetching
- Accessing backend resources
- Large dependencies
- Sensitive information

## When to Use Client Components

- Interactivity (onClick, onChange, etc.)
- Browser APIs
- State management
- Third-party libraries that require client-side JavaScript

## Example

\`\`\`typescript
// Server Component
async function ServerComponent() {
  const data = await fetch('https://api.example.com/data');
  return <div>{data.title}</div>;
}

// Client Component
'use client';
function ClientComponent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
\`\`\`

## Conclusion

Server Components are a game-changer for React applications. Start using them today!`,
  metaTitle: 'React Server Components Deep Dive | WebDev Studios',
  metaDescription:
    'Learn about React Server Components, how they work, and how they can improve your application performance.',
  isPublished: true,
};
