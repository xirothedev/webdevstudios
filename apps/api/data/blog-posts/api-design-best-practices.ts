import { BlogPostSeedData } from './types';

export const blogPost: BlogPostSeedData = {
  slug: 'api-design-best-practices',
  title: 'RESTful API Design Best Practices',
  excerpt:
    'Learn best practices for designing RESTful APIs, including endpoint naming, status codes, versioning, and documentation.',
  content: `# RESTful API Design Best Practices

Well-designed APIs are crucial for developer experience. Let's explore best practices.

## Endpoint Naming

### Use Nouns, Not Verbs

\`\`\`typescript
// ✅ Good
GET /api/users
POST /api/users
GET /api/users/:id

// ❌ Bad
GET /api/getUsers
POST /api/createUser
\`\`\`

### Use Plural Nouns

\`\`\`typescript
// ✅ Good
/api/users
/api/products

// ❌ Bad
/api/user
/api/product
\`\`\`

## HTTP Methods

- **GET**: Retrieve resources
- **POST**: Create resources
- **PUT**: Update entire resource
- **PATCH**: Partial update
- **DELETE**: Delete resource

## Status Codes

Use appropriate status codes:

- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Server Error

## Versioning

Version your APIs:

\`\`\`typescript
// URL versioning
/api/v1/users
/api/v2/users

// Header versioning
Accept: application/vnd.api+json;version=1
\`\`\`

## Pagination

Implement pagination for list endpoints:

\`\`\`typescript
GET /api/users?page=1&pageSize=20
\`\`\`

## Error Handling

Return consistent error format:

\`\`\`json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found",
    "details": {}
  }
}
\`\`\`

## Documentation

Document your API:

- Use OpenAPI/Swagger
- Provide examples
- Include error responses
- Document authentication

## Conclusion

Good API design makes integration easier. Follow these practices!`,
  metaTitle: 'RESTful API Design Best Practices | WebDev Studios',
  metaDescription:
    'Learn best practices for designing RESTful APIs including endpoint naming, status codes, and versioning.',
  isPublished: true,
};
