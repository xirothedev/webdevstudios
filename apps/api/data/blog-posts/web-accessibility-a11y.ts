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
  slug: 'web-accessibility-a11y',
  title: 'Web Accessibility (a11y): Building Inclusive Applications',
  excerpt:
    'Learn how to build accessible web applications that work for everyone, including ARIA attributes, keyboard navigation, and screen reader support.',
  content: `# Web Accessibility (a11y): Building Inclusive Applications

Accessibility ensures your applications work for everyone. Let's build inclusive apps.

## What is Accessibility?

Accessibility (a11y) means making your web applications usable by people with disabilities.

## Semantic HTML

Use proper HTML elements:

\`\`\`html
<!-- ✅ Good -->
<button>Click me</button>
<nav>Navigation</nav>
<main>Main content</main>

<!-- ❌ Bad -->
<div onclick="handleClick()">Click me</div>
\`\`\`

## ARIA Attributes

Use ARIA when HTML isn't enough:

\`\`\`html
<button aria-label="Close dialog" aria-expanded="false">
  ×
</button>
\`\`\`

## Keyboard Navigation

Ensure keyboard accessibility:

\`\`\`typescript
function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    handleClick();
  }
}
\`\`\`

## Focus Management

Manage focus properly:

\`\`\`typescript
// Focus first element in modal
modalRef.current?.focus();

// Return focus after closing
previousFocusElement?.focus();
\`\`\`

## Color Contrast

Ensure sufficient contrast:

- Text: 4.5:1 for normal text
- Large text: 3:1
- UI components: 3:1

## Screen Readers

Test with screen readers:

- NVDA (Windows)
- VoiceOver (macOS/iOS)
- JAWS (Windows)

## Testing Tools

- **axe DevTools**: Browser extension
- **WAVE**: Web accessibility evaluation
- **Lighthouse**: Built into Chrome DevTools

## Conclusion

Accessibility is not optional. Build for everyone!`,
  metaTitle: 'Web Accessibility Guide | WebDev Studios',
  metaDescription:
    'Learn how to build accessible web applications with ARIA attributes, keyboard navigation, and screen reader support.',
  isPublished: true,
};
