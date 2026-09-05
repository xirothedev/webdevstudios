# Base stage with Bun
FROM oven/bun:1.3.14-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Dependencies stage — invalidated only by lockfile/workspace manifests
FROM base AS deps
COPY package.json bun.lock ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
COPY apps/api-axum/package.json ./apps/api-axum/
COPY apps/api-effect/package.json ./apps/api-effect/
COPY apps/api-elysia/package.json ./apps/api-elysia/
COPY apps/web-vue/package.json ./apps/web-vue/
COPY infra/package.json ./infra/
# Copy Prisma schema and config for postinstall script
COPY apps/api/prisma.config.ts ./apps/api/
COPY apps/api/prisma ./apps/api/prisma
COPY apps/api/tsconfig.json ./apps/api/

ENV CI=true
# Cache mount: bun's download store persists even when the layer invalidates
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile --ignore-scripts --linker isolated

# Prisma stage — client regenerates only when schema or lockfile changes
FROM deps AS prisma
WORKDIR /app/apps/api
RUN bun run prisma:generate

# Builder stage
FROM base AS builder
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY . .
# Fresh client from the prisma stage wins over anything in the build context
COPY --from=prisma /app/apps/api/src/generated ./apps/api/src/generated

# Build the API
WORKDIR /app/apps/api
RUN bun run build
WORKDIR /app

# Production runner stage — prod-only install, scripts skipped (client is copied)
FROM base AS runner
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

COPY package.json bun.lock ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
COPY apps/api-axum/package.json ./apps/api-axum/
COPY apps/api-effect/package.json ./apps/api-effect/
COPY apps/api-elysia/package.json ./apps/api-elysia/
COPY apps/web-vue/package.json ./apps/web-vue/
COPY infra/package.json ./infra/

ENV CI=true
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile --production --ignore-scripts --linker isolated

COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/src ./apps/api/src
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/package.json ./apps/api/package.json

# Runtime tsconfig: aliases must resolve into dist so bun loads ONE copy of each
# class. Mapping @/* to ./src/* instead makes Nest register a class from dist
# while services inject the same-named class loaded from src — DI token mismatch.
# @prisma/client stays pointed at the generated client.
RUN printf '%s\n' \
  '{' \
  '  "compilerOptions": {' \
  '    "baseUrl": ".", ' \
  '    "paths": { ' \
  '      "@/*": ["./dist/*"], ' \
  '      "@prisma/client": ["./src/generated/prisma"], ' \
  '      "@prisma/client/*": ["./src/generated/prisma/*"] ' \
  '    }' \
  '  }' \
  '}' > apps/api/tsconfig.json

# Writable dir for winston file transports: LOG_DIR defaults to ./logs,
# resolved against the container workdir /app
RUN mkdir -p logs && chown nestjs:nodejs logs

USER nestjs

EXPOSE 4000

ENV PORT=4000

CMD ["bun", "apps/api/dist/main.js"]
