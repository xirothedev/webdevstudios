# syntax=docker/dockerfile:1
# Build context = repo root: docker build -f apps/api-axum/Dockerfile .

FROM rust:1-slim-bookworm AS builder
RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*
WORKDIR /src
COPY apps/api-axum/Cargo.toml apps/api-axum/Cargo.lock ./
COPY apps/api-axum/src ./src
COPY apps/api-axum/templates ./templates
RUN cargo build --release --locked && strip target/release/api-axum

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /src/target/release/api-axum /usr/local/bin/api-axum
COPY --from=builder /src/templates /templates
ENV PORT=4000
EXPOSE 4000
USER nobody
ENTRYPOINT ["api-axum"]
