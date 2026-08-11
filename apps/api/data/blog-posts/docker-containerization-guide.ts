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
  slug: 'docker-containerization-guide',
  title: 'Docker Containerization: A Complete Guide',
  excerpt:
    'Learn how to containerize your applications with Docker, including best practices, optimization techniques, and deployment strategies.',
  content: `# Docker Containerization: A Complete Guide

Docker has revolutionized how we deploy applications. This guide covers everything you need to know.

## What is Docker?

Docker is a platform for developing, shipping, and running applications in containers.

## Key Concepts

- **Image**: A read-only template for creating containers
- **Container**: A running instance of an image
- **Dockerfile**: Instructions for building an image

## Creating a Dockerfile

\`\`\`dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
\`\`\`

## Best Practices

1. Use multi-stage builds
2. Leverage layer caching
3. Minimize image size
4. Use .dockerignore

## Docker Compose

\`\`\`yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: password
\`\`\`

## Conclusion

Docker makes deployment easier and more consistent. Start containerizing today!`,
  metaTitle: 'Docker Containerization Complete Guide | WebDev Studios',
  metaDescription:
    'Learn how to containerize applications with Docker, including best practices, optimization techniques, and deployment strategies.',
  isPublished: true,
};
