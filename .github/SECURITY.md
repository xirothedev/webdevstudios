# Security Policy

## Supported Versions

We currently support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability, please **DO NOT** open a public issue. Instead, please report it privately:

### How to Report

1. **Email**: Send details to [lethanhtrung.trungle@gmail.com]

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Time

We aim to:

- Acknowledge receipt within 48 hours
- Provide initial assessment within 7 days
- Release a fix within 30 days (depending on severity)

### Security Best Practices

When using this project:

1. **Never commit secrets**: Use environment variables for all sensitive data
2. **Keep dependencies updated**: Regularly run `pnpm audit` and `pnpm audit:fix`
3. **Use strong passwords**: For database, admin accounts, etc.
4. **Enable 2FA**: For all user accounts
5. **Review code changes**: Before deploying to production
6. **Use HTTPS**: In production environments
7. **Regular backups**: Of database and important files

### Known Security Considerations

- **JWT Tokens**: Use strong `JWT_SECRET_KEY` and appropriate expiration times
- **OAuth**: Keep OAuth client secrets secure
- **Database**: Use strong passwords and restrict access
- **File Uploads**: Validate file types and sizes
- **Rate Limiting**: Configure appropriate rate limits
- **CORS**: Configure CORS properly for production
- **CSRF**: CSRF protection is enabled, ensure tokens are validated

### Security Checklist for Deployment

- [ ] All environment variables are set and secure
- [ ] Database credentials are strong and unique
- [ ] JWT secret is strong and unique
- [ ] OAuth secrets are configured
- [ ] HTTPS is enabled
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] File upload validation is working
- [ ] Dependencies are up to date (`pnpm audit`)
- [ ] No secrets in code or git history
- [ ] Admin accounts have strong passwords
- [ ] 2FA is enabled for admin accounts
- [ ] Regular backups are configured
- [ ] Error messages don't leak sensitive information
- [ ] Logging doesn't include sensitive data

## Security Updates

Security updates will be released as:

- **Patch versions** (0.1.x) for critical security fixes
- **Minor versions** (0.x.0) for important security improvements

## Acknowledgments

We appreciate responsible disclosure of security vulnerabilities. Contributors who report valid security issues will be acknowledged (if they wish) in our security advisories.
