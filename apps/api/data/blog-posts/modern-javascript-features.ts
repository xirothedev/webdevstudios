import { BlogPostSeedData } from './types';

export const blogPost: BlogPostSeedData = {
  slug: 'modern-javascript-features',
  title: 'Modern JavaScript Features You Should Know',
  excerpt:
    'Explore modern JavaScript features including ES6+, async/await, destructuring, optional chaining, and more.',
  content: `# Modern JavaScript Features You Should Know

JavaScript has evolved significantly. Let's explore modern features.

## ES6+ Features

### Arrow Functions

\`\`\`typescript
// Traditional
function add(a, b) {
  return a + b;
}

// Arrow function
const add = (a, b) => a + b;
\`\`\`

### Destructuring

\`\`\`typescript
const { name, email } = user;
const [first, second] = array;
\`\`\`

### Template Literals

\`\`\`typescript
const message = \`Hello, \${name}!\`;
\`\`\`

## Async/Await

Modern way to handle promises:

\`\`\`typescript
async function fetchUser(id: string) {
  try {
    const response = await fetch(\`/api/users/\${id}\`);
    return await response.json();
  } catch (error) {
    console.error(error);
  }
}
\`\`\`

## Optional Chaining

Safe property access:

\`\`\`typescript
const name = user?.profile?.name;
\`\`\`

## Nullish Coalescing

Default values:

\`\`\`typescript
const name = user.name ?? 'Anonymous';
\`\`\`

## Spread Operator

\`\`\`typescript
const newArray = [...oldArray, newItem];
const newObject = { ...oldObject, newProperty: value };
\`\`\`

## Modules

ES6 modules:

\`\`\`typescript
// Export
export const myFunction = () => {};

// Import
import { myFunction } from './module';
\`\`\`

## Conclusion

Modern JavaScript makes development easier. Use these features!`,
  metaTitle: 'Modern JavaScript Features Guide | WebDev Studios',
  metaDescription:
    'Explore modern JavaScript features including ES6+, async/await, destructuring, and optional chaining.',
  isPublished: true,
};
