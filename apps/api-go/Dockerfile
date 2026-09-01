# syntax=docker/dockerfile:1
# Build context = repo root: docker build -f apps/api-go/Dockerfile .

FROM golang:1.25-alpine AS builder
# go.mod pins 1.27; GOTOOLCHAIN=auto downloads it inside the 1.25 image.
ENV CGO_ENABLED=0 GOTOOLCHAIN=auto
WORKDIR /src
COPY apps/api-go/go.mod apps/api-go/go.sum ./
RUN go mod download
COPY apps/api-go/ .
RUN go build -trimpath -ldflags="-s -w" -o /out/server ./cmd/server

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=builder /out/server /server
ENV PORT=4000
EXPOSE 4000
USER nonroot
ENTRYPOINT ["/server"]
