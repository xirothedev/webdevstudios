# syntax=docker/dockerfile:1
# Build context = repo root: docker build -f apps/api-elysia/Dockerfile .
# ponytail: single-stage install + run src with bun (bun needs no build step).
# api's layered cache stages only matter for prod deploys; this Mirror boots from src.

FROM oven/bun:1 AS base
WORKDIR /app

COPY package.json bun.lock ./
COPY apps/api-elysia/package.json ./apps/api-elysia/
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/

RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile --ignore-scripts

COPY . .

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000
CMD ["bun", "apps/api-elysia/src/index.ts"]
