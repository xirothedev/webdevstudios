# Contributing to WebDev Studios E-commerce Platform

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to:

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

## How to Contribute

### Reporting Bugs

1. **Check existing issues**: Make sure the bug hasn't been reported already
2. **Create a new issue**: Use the bug report template
3. **Provide details**:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment (OS, Node version, etc.)
   - Screenshots (if applicable)

### Suggesting Features

1. **Check existing issues**: See if the feature has been suggested
2. **Create a new issue**: Use the feature request template
3. **Provide details**:
   - Clear description of the feature
   - Use case and motivation
   - Potential implementation approach (if you have ideas)

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes**:
   - Follow the coding standards (see below)
   - Write/update tests if applicable
   - Update documentation if needed
4. **Commit your changes**:
   - Use clear, descriptive commit messages
   - Follow the commit message format: `[TYPE] - Description`
   - Types: `feat`, `fix`, `chore`, `refactor`, `docs`, `style`
5. **Push to your fork**: `git push origin feature/your-feature-name`
6. **Create a Pull Request**:
   - Provide a clear description
   - Reference related issues
   - Wait for review and feedback

## Development Setup

### Prerequisites

- Node.js >= 25.0.0
- pnpm >= 10.0.0
- PostgreSQL
- Redis (optional)

### Setup Steps

1. **Fork and clone**:

   ```bash
   git clone https://github.com/your-username/webdevstudios.git
   cd webdevstudios
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Setup environment variables**:
   - Copy `.env.example` to `.env` (if exists)
   - Configure database, JWT, OAuth, etc.

4. **Setup database**:

   ```bash
   cd apps/api
   pnpm prisma:migrate
   pnpm prisma:generate
   pnpm prisma:seed
   ```

5. **Start development servers**:
   ```bash
   # From root
   pnpm dev
   ```

## Coding Standards

### TypeScript

- **Strict mode**: Always enabled
- **No `any`**: Use `unknown` if type is truly unknown
- **Type everything**: Functions, variables, props
- **Enums**: Use enums for constants instead of strings

### Code Style

- **Formatting**: Prettier (auto-format on save)
- **Linting**: ESLint (must pass before commit)
- **Imports**: Sorted with simple-import-sort
- **Comments**: English only, JSDoc for public APIs

### Import Order

Imports MUST be sorted in this order:

1. Side effects (`import '...'`)
2. Node built-ins (`import fs from 'node:fs'`)
3. External libraries (`import { ... } from '@nestjs/common'`)
4. Path aliases (`import { ... } from '@/common'`)
5. Relative imports (`import { ... } from './file'`)

### File Organization

- **One export per file**: Each file exports one main thing
- **Co-location**: Related files stay together
- **Barrel exports**: Use `index.ts` for re-exports when appropriate

### Backend (NestJS)

- **CQRS Pattern**: MUST follow CQRS
  - Controllers dispatch Commands/Queries only
  - No business logic in controllers
- **Module Structure**: Follow existing module patterns
- **Validation**: Use class-validator for DTOs
- **Error Handling**: Use proper HTTP status codes

### Frontend (Next.js)

- **Server Components First**: Prefer Server Components
- **Client Components**: Only use `'use client'` when necessary
- **Responsive Design**: Mobile-first approach
- **Accessibility**: ARIA labels, keyboard navigation
- **Image Optimization**: Use Next.js Image component

## Testing

### Running Tests

```bash
# All tests
pnpm test

# Specific app
cd apps/web && pnpm test
cd apps/api && pnpm test
```

### Writing Tests

- **Unit tests**: For utilities and business logic
- **Integration tests**: For API endpoints
- **E2E tests**: For critical user flows (if applicable)

## Documentation

### Code Documentation

- **JSDoc**: For public functions/classes
- **Comments**: For complex logic (English only)
- **README**: Update if adding new features

### Documentation Files

- **English only**: All markdown files and comments
- **User-facing content**: Vietnamese (for website content)
- **Code**: English (variable names, functions, etc.)

## Commit Messages

Format: `[TYPE] - Description`

Types:

- `feat`: New feature
- `fix`: Bug fix
- `chore`: Maintenance tasks
- `refactor`: Code refactoring
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)

Examples:

```
[feat] - Add product review feature
[fix] - Fix cart quantity validation
[refactor] - Extract product API client
[docs] - Update API documentation
```

## Pull Request Process

1. **Update documentation** if needed
2. **Add tests** if applicable
3. **Ensure all tests pass**
4. **Run linting**: `pnpm lint`
5. **Format code**: `pnpm format`
6. **Update CHANGELOG** (if exists)
7. **Request review** from maintainers

## Review Process

- Maintainers will review your PR
- Address feedback and suggestions
- Keep discussions constructive
- Be patient - reviews may take time

## Questions?

- **Open an issue**: For questions or discussions
- **Check documentation**: See `docs/` folder
- **Read existing code**: Learn from examples

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (see LICENSE file).

Thank you for contributing! 🎉
