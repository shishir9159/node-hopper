#syntax=docker/dockerfile:1.7-labs
FROM golang:1.25.1-trixie AS builder
ENV CGO_ENABLED 0
WORKDIR /app

COPY . ./
RUN go mod download
RUN go build -C main.go -gcflags "all=-N -l" -o main

FROM debian:bookworm-slim
RUN --mount=target=/var/lib/apt/lists,type=cache,sharing=locked \
    --mount=target=/var/cache/apt/,type=cache,sharing=locked \
    set -x && apt-get update && apt-get install -y \
    ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/cmd/patch-upgrade/main /app/server
WORKDIR /app
EXPOSE 40000

# CMD ["/app/server"]
CMD ["/dlv", "--listen=:40000", "--headless=true", "--api-version=2", "--log", "exec", "/app/server"]