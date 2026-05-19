# Base stage with Bun
FROM oven/bun:1.3.14-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY package.json bun.lock ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
# Copy Prisma schema and config for the API workspace postinstall script
COPY apps/api/prisma.config.ts ./apps/api/
COPY apps/api/prisma ./apps/api/prisma
COPY apps/api/tsconfig.json ./apps/api/
RUN bun install --frozen-lockfile --linker isolated

# Builder stage
FROM base AS builder
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY . .

# Build the web app with Bun
WORKDIR /app/apps/web
RUN bun run build
WORKDIR /app

# Production runner stage
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "apps/web/server.js"]
