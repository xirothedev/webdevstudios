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
  slug: 'ci-cd-pipelines-guide',
  title: 'CI/CD Pipelines: A Complete Guide',
  excerpt:
    'Learn how to set up and optimize CI/CD pipelines for automated testing, building, and deployment of your applications.',
  content: `# CI/CD Pipelines: A Complete Guide

CI/CD pipelines automate your development workflow. Let's build one.

## What is CI/CD?

- **CI (Continuous Integration)**: Automatically test and build code
- **CD (Continuous Deployment)**: Automatically deploy to production

## Setting Up GitHub Actions

\`\`\`yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run build
\`\`\`

## Pipeline Stages

1. **Lint**: Check code quality
2. **Test**: Run unit and integration tests
3. **Build**: Compile application
4. **Deploy**: Deploy to staging/production

## Best Practices

- Run tests in parallel
- Cache dependencies
- Use matrix builds for multiple versions
- Implement deployment gates
- Monitor pipeline performance

## Deployment Strategies

### Blue-Green Deployment

Deploy new version alongside old, then switch:

\`\`\`yaml
- name: Deploy to staging
  run: |
    docker build -t app:staging .
    docker run -d -p 8080:3000 app:staging
\`\`\`

### Canary Deployment

Gradually roll out to a subset of users.

## Conclusion

CI/CD pipelines save time and reduce errors. Set one up today!`,
  metaTitle: 'CI/CD Pipelines Complete Guide | WebDev Studios',
  metaDescription:
    'Learn how to set up and optimize CI/CD pipelines for automated testing, building, and deployment.',
  isPublished: true,
};
