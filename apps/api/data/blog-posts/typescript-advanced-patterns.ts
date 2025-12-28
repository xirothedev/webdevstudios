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
