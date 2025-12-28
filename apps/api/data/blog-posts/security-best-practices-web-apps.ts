import { BlogPostSeedData } from './types';

export const blogPost: BlogPostSeedData = {
  slug: 'security-best-practices-web-apps',
  title: 'Security Best Practices for Web Applications',
  excerpt:
    'Learn essential security practices for web applications, including authentication, authorization, data protection, and common vulnerabilities.',
  content: `# Security Best Practices for Web Applications

Security should be a priority from day one. Here are essential practices.

## Authentication

### Use Strong Password Policies

\`\`\`typescript
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{8,}$/;
\`\`\`

### Implement JWT Properly

- Use secure tokens
- Set appropriate expiration
- Implement refresh tokens
- Store tokens securely

## Authorization

Implement proper access control:

\`\`\`typescript
@UseGuards(RolesGuard)
@Roles('ADMIN')
async deleteUser(id: string) {
  // Only admins can delete users
}
\`\`\`

## Data Protection

### Input Validation

Always validate and sanitize input:

\`\`\`typescript
@IsEmail()
@IsNotEmpty()
email: string;
\`\`\`

### SQL Injection Prevention

Use parameterized queries:

\`\`\`typescript
// ✅ Safe
await prisma.user.findUnique({ where: { id } });

// ❌ Unsafe
await prisma.$queryRaw\`SELECT * FROM users WHERE id = \${id}\`;
\`\`\`

## Common Vulnerabilities

### XSS (Cross-Site Scripting)

Sanitize user input and use Content Security Policy:

\`\`\`html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'">
\`\`\`

### CSRF (Cross-Site Request Forgery)

Use CSRF tokens:

\`\`\`typescript
app.use(csrf({ cookie: true }));
\`\`\`

## HTTPS

Always use HTTPS in production:

\`\`\`typescript
// Redirect HTTP to HTTPS
app.use((req, res, next) => {
  if (!req.secure) {
    return res.redirect(\`https://\${req.headers.host}\${req.url}\`);
  }
  next();
});
\`\`\`

## Conclusion

Security is not optional. Implement these practices from the start!`,
  metaTitle: 'Web Application Security Best Practices | WebDev Studios',
  metaDescription:
    'Learn essential security practices for web applications including authentication, authorization, and vulnerability prevention.',
  isPublished: true,
};
