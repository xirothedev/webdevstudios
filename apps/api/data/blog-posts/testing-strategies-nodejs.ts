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
  slug: 'testing-strategies-nodejs',
  title: 'Testing Strategies for Node.js Applications',
  excerpt:
    'Learn comprehensive testing strategies for Node.js applications, including unit tests, integration tests, and E2E testing approaches.',
  content: `# Testing Strategies for Node.js Applications

Testing is crucial for maintaining code quality. Let's explore testing strategies for Node.js.

## Types of Tests

### Unit Tests

Test individual functions in isolation:

\`\`\`typescript
describe('calculateTotal', () => {
  it('should calculate total correctly', () => {
    expect(calculateTotal([10, 20, 30])).toBe(60);
  });
});
\`\`\`

### Integration Tests

Test how components work together:

\`\`\`typescript
describe('User Service', () => {
  it('should create and retrieve user', async () => {
    const user = await userService.create({ name: 'John' });
    const retrieved = await userService.findById(user.id);
    expect(retrieved.name).toBe('John');
  });
});
\`\`\`

### E2E Tests

Test the entire application flow:

\`\`\`typescript
test('user can register and login', async () => {
  await page.goto('/register');
  await page.fill('#email', 'test@example.com');
  await page.click('button[type="submit"]');
  // ... more steps
});
\`\`\`

## Testing Tools

- **Jest**: Unit and integration testing
- **Supertest**: API testing
- **Playwright**: E2E testing
- **Vitest**: Fast unit testing

## Best Practices

1. Write tests before or alongside code
2. Aim for high coverage but focus on quality
3. Use mocks and stubs appropriately
4. Test edge cases
5. Keep tests fast and independent

## Conclusion

Good testing practices lead to more maintainable code.`,
  metaTitle: 'Node.js Testing Strategies Guide | WebDev Studios',
  metaDescription:
    'Learn comprehensive testing strategies for Node.js applications including unit, integration, and E2E testing.',
  isPublished: true,
};
