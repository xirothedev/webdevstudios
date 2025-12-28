# Feature-Based Commit Guide

This guide explains how to commit files grouped by feature, ensuring each commit contains only files related to a specific feature.

## Overview

When making changes across multiple features, it's best practice to create separate commits for each feature. This makes the git history cleaner, easier to review, and allows for better rollback if needed.

## Step-by-Step Process

### 1. Check Current Status

First, see what files have been modified:

```bash
git status
# or short format
git status --short
```

### 2. Identify Feature Groups

Group your files by feature. Common feature groups in this project:

- **Products**: Product-related files
  - `apps/api/prisma/schema/product.prisma`
  - `apps/api/prisma/product.seed.ts`
  - `apps/web/src/components/shop/ProductSizeGuide.tsx`
  - `apps/web/src/components/FeaturesGrid.tsx` (if product-related changes)

- **Users**: User management files
  - `apps/api/prisma/schema/user.prisma`
  - `apps/api/prisma/user.seed.ts`
  - `apps/api/src/users/**/*.ts`
  - `apps/web/src/lib/utils/avatar.ts`

- **Auth**: Authentication files
  - `apps/api/prisma/schema/auth.prisma`
  - `apps/web/src/app/auth/**/*.tsx`
  - `apps/web/src/contexts/auth.context.tsx`

- **Orders**: Order management files
  - `apps/api/prisma/schema/order.prisma`
  - `apps/web/src/app/checkout/page.tsx`

- **Payments**: Payment-related files
  - `apps/api/prisma/schema/payment.prisma`

- **Marketing**: Marketing features
  - `apps/api/prisma/schema/marketing.prisma`

- **Events**: Event management
  - `apps/api/prisma/schema/event.prisma`

- **Storage**: File storage
  - `apps/api/src/storage/**/*.ts`
  - `apps/api/src/storage/README.md`

- **Account**: User account pages
  - `apps/web/src/app/account/**/*.tsx`

- **Enums**: Shared enums
  - `apps/api/prisma/schema/enums.prisma`

- **Documentation**: Documentation files
  - `docs/**/*.md`
  - `apps/web/docs/**/*.md`
  - `apps/api/**/README.md`
  - `MEMORIZE.md`

- **Scripts**: Utility scripts
  - `apps/web/scripts/**/*.ts`

### 3. Commit Each Feature Separately

#### Example: Committing Product Feature

```bash
# Stage only product-related files
git add apps/api/prisma/schema/product.prisma
git add apps/api/prisma/product.seed.ts
git add apps/web/src/components/shop/ProductSizeGuide.tsx
git add apps/web/src/components/FeaturesGrid.tsx

# Commit with descriptive message
git commit -m "feat(products): Add product size guide and features grid

- Add ProductSizeGuide component with size chart
- Update FeaturesGrid with product display
- Update product schema and seed data"
```

#### Example: Committing User Feature

```bash
# Stage only user-related files
git add apps/api/prisma/schema/user.prisma
git add apps/api/prisma/user.seed.ts
git add apps/api/src/users/**/*.ts
git add apps/web/src/lib/utils/avatar.ts

# Commit with descriptive message
git commit -m "feat(users): Add user management and avatar utilities

- Update user schema with MFA support
- Add user seed data
- Implement user query handlers
- Add avatar utility functions"
```

#### Example: Committing Auth Feature

```bash
# Stage only auth-related files
git add apps/api/prisma/schema/auth.prisma
git add apps/web/src/app/auth/**/*.tsx
git add apps/web/src/contexts/auth.context.tsx

# Commit with descriptive message
git commit -m "feat(auth): Implement authentication pages

- Add login, signup, 2FA pages
- Update auth schema
- Add auth context"
```

#### Example: Committing Documentation

```bash
# Stage only documentation files
git add docs/**/*.md
git add apps/web/docs/**/*.md
git add apps/api/**/README.md
git add MEMORIZE.md

# Commit with descriptive message
git commit -m "docs: Translate documentation to English

- Translate all markdown documentation files
- Update code comments to English
- Keep user-facing content in Vietnamese"
```

### 4. Using Git Add with Patterns

You can also use patterns to stage multiple files at once:

```bash
# Stage all product-related files
git add apps/api/prisma/schema/product.prisma apps/api/prisma/product.seed.ts
git add apps/web/src/components/shop/ProductSizeGuide.tsx
git add apps/web/src/components/FeaturesGrid.tsx

# Or use glob patterns (if supported)
git add 'apps/api/**/product*'
git add 'apps/web/src/components/**/Product*'
```

### 5. Verify Before Committing

Always check what you're about to commit:

```bash
# See staged files
git status

# See the diff of staged changes
git diff --cached

# See a summary
git diff --cached --stat
```

### 6. Complete Example Workflow

Here's a complete example for committing multiple features:

```bash
# 1. Check status
git status

# 2. Commit Products feature
git add apps/api/prisma/schema/product.prisma \
        apps/api/prisma/product.seed.ts \
        apps/web/src/components/shop/ProductSizeGuide.tsx
git commit -m "feat(products): Add product features"

# 3. Commit Users feature
git add apps/api/prisma/schema/user.prisma \
        apps/api/prisma/user.seed.ts \
        apps/api/src/users/**/*.ts \
        apps/web/src/lib/utils/avatar.ts
git commit -m "feat(users): Add user management"

# 4. Commit Auth feature
git add apps/api/prisma/schema/auth.prisma \
        apps/web/src/app/auth/**/*.tsx
git commit -m "feat(auth): Add authentication pages"

# 5. Commit Documentation
git add docs/**/*.md \
        apps/web/docs/**/*.md \
        apps/api/**/README.md \
        MEMORIZE.md
git commit -m "docs: Update documentation"

# 6. Commit remaining files (if any)
git add .
git commit -m "chore: Update remaining files"
```

## Commit Message Convention

Follow this format for commit messages:

```
<type>(<scope>): <subject>

<body (optional)>

<footer (optional)>
```

### Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Scopes:

- `products`: Product-related features
- `users`: User management
- `auth`: Authentication
- `orders`: Order management
- `payments`: Payment processing
- `cart`: Shopping cart
- `storage`: File storage
- `api`: API changes
- `web`: Frontend changes

### Examples:

```bash
# Feature commit
git commit -m "feat(products): Add product size selector"

# Bug fix
git commit -m "fix(cart): Fix cart item quantity validation"

# Documentation
git commit -m "docs: Update API documentation"

# Refactoring
git commit -m "refactor(users): Simplify user query handlers"
```

## Tips

1. **One feature per commit**: Each commit should represent one logical change
2. **Atomic commits**: Commits should be complete and working
3. **Descriptive messages**: Write clear commit messages explaining what and why
4. **Review before committing**: Always check `git status` and `git diff --cached`
5. **Use interactive staging**: For complex cases, use `git add -p` to stage parts of files

## Interactive Staging

For more control, use interactive staging:

```bash
# Stage parts of files interactively
git add -p

# This allows you to:
# - Stage specific hunks of changes
# - Skip unrelated changes
# - Split large changes into smaller commits
```

## Undoing Mistakes

If you accidentally staged wrong files:

```bash
# Unstage all files
git reset

# Unstage specific file
git reset <file>

# Unstage but keep changes
git reset HEAD <file>
```

## Best Practices

1. **Commit often**: Make small, frequent commits
2. **Test before committing**: Ensure code works before committing
3. **Review your changes**: Use `git diff` to review before committing
4. **Write meaningful messages**: Future you (and your team) will thank you
5. **Group related changes**: Keep related changes together in one commit

## Example: Complete Feature Commit Workflow

```bash
# Scenario: You've made changes to products, users, and documentation

# Step 1: Check what changed
git status

# Step 2: Commit products feature
git add apps/api/prisma/schema/product.prisma
git add apps/api/prisma/product.seed.ts
git add apps/web/src/components/shop/ProductSizeGuide.tsx
git commit -m "feat(products): Add product size guide component"

# Step 3: Commit users feature
git add apps/api/prisma/schema/user.prisma
git add apps/api/prisma/user.seed.ts
git add apps/api/src/users/queries/get-user-by-id/get-user-by-id.handler.ts
git add apps/api/src/users/queries/search-users/search-users.handler.ts
git commit -m "feat(users): Add user query handlers with privacy logic"

# Step 4: Commit documentation
git add docs/shop-api-requirements.md
git add docs/schema-rebuild-summary.md
git add apps/web/docs/feature-features-grid.md
git add apps/api/src/storage/README.md
git add MEMORIZE.md
git commit -m "docs: Translate all documentation to English"

# Step 5: Commit remaining files (if any)
git add .
git status  # Verify what's left
git commit -m "chore: Update remaining translation files"
```

## Quick Reference

```bash
# Check status
git status

# Stage specific files
git add <file1> <file2>

# Stage all files in directory
git add <directory>/

# Stage with pattern
git add 'pattern/**/*.ts'

# See what's staged
git diff --cached

# Commit staged files
git commit -m "message"

# Unstage files
git reset <file>

# Unstage all
git reset
```
