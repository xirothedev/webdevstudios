# Base stage with Node.js and pnpm
FROM node:25-alpine3.22 AS base
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Dependencies stage
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
# Copy Prisma schema and config for postinstall script
COPY apps/api/prisma.config.ts ./apps/api/
COPY apps/api/prisma ./apps/api/prisma
COPY apps/api/tsconfig.json ./apps/api/
RUN pnpm install --frozen-lockfile --ignore-scripts

# Run postinstall script
RUN pnpm -C apps/api exec prisma generate --schema=prisma/schema/base.prisma

# Builder stage
FROM base AS builder
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY . .

# Build the API using npx to ensure nest is found
WORKDIR /app/apps/api
RUN npx nest build

# Generate Prisma client
RUN npx prisma generate
WORKDIR /app

# Production runner stage
FROM base AS runner
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy necessary files
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/generated ./apps/api/generated
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

USER nestjs

EXPOSE 4000

ENV PORT=4000

CMD ["node", "apps/api/dist/main.js"]
