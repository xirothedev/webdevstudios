# Base stage with Node.js and pnpm
FROM node:lts-alpine AS base
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Dependencies stage
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile

# Builder stage
FROM base AS builder
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the API
RUN pnpm build --filter=api

# Generate Prisma client
RUN pnpm prisma:generate --filter=api

# Production runner stage
FROM base AS runner
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy necessary files
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/node_modules/.prisma ./apps/api/node_modules/.prisma
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

USER nestjs

EXPOSE 4000

ENV PORT=4000

CMD ["node", "apps/api/dist/main.js"]
