# syntax=docker/dockerfile:1
# Build context = repo root: docker build -f apps/web-vue/Dockerfile .
# ponytail: cloud serves web-vue static from S3+CloudFront; this image exists for
# local/LAN parity (xiroserver-lan) where S3 is not in the loop.

FROM oven/bun:1 AS builder
WORKDIR /app
COPY package.json bun.lock ./
COPY apps/web-vue/package.json ./apps/web-vue/
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile --ignore-scripts
COPY . .
# Baked at build time: web-vue reads VITE_API_URL into the bundle (src/lib/constants.ts).
ARG VITE_API_URL=http://localhost:4000
ARG VITE_SITE_URL=http://localhost:3001
ARG VITE_CDN_URL=http://localhost:3001
ENV VITE_API_URL=$VITE_API_URL VITE_SITE_URL=$VITE_SITE_URL VITE_CDN_URL=$VITE_CDN_URL
RUN bun run --cwd apps/web-vue build

FROM nginx:1-alpine
COPY --from=builder /app/apps/web-vue/dist /usr/share/nginx/html
COPY apps/web-vue/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
