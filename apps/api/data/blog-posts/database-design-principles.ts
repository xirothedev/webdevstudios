import { BlogPostSeedData } from './types';

export const blogPost: BlogPostSeedData = {
  slug: 'database-design-principles',
  title: 'Database Design Principles and Best Practices',
  excerpt:
    'Learn fundamental database design principles, normalization techniques, indexing strategies, and performance optimization.',
  content: `# Database Design Principles and Best Practices

Good database design is crucial for application performance. Let's explore the principles.

## Normalization

### First Normal Form (1NF)

- Each column contains atomic values
- No repeating groups

### Second Normal Form (2NF)

- In 1NF
- All non-key attributes fully dependent on primary key

### Third Normal Form (3NF)

- In 2NF
- No transitive dependencies

## Indexing Strategies

### When to Index

- Frequently queried columns
- Foreign keys
- Columns used in WHERE clauses
- Columns used for sorting

### Index Types

- **B-tree**: Default, good for most cases
- **Hash**: Equality lookups only
- **GIN**: Full-text search
- **GiST**: Geometric data

## Query Optimization

### Use EXPLAIN

\`\`\`sql
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
\`\`\`

### Avoid N+1 Queries

\`\`\`typescript
// ❌ Bad
users.forEach(user => {
  const posts = await getPosts(user.id);
});

// ✅ Good
const usersWithPosts = await getUsersWithPosts();
\`\`\`

## Connection Pooling

Configure appropriate pool size:

\`\`\`typescript
const pool = new Pool({
  max: 20,
  min: 5,
  idleTimeoutMillis: 30000,
});
\`\`\`

## Conclusion

Good database design pays off in the long run.`,
  metaTitle: 'Database Design Principles Guide | WebDev Studios',
  metaDescription:
    'Learn fundamental database design principles, normalization, indexing strategies, and performance optimization.',
  isPublished: true,
};
