#syntax=docker/dockerfile:1.7-labs
FROM golang:1.25.1-trixie AS builder
ENV CGO_ENABLED=0
WORKDIR /app

COPY examples/main.go go.* .
RUN go mod download
# libc6-compat
RUN go build -gcflags "all=-N -l" -o main .

FROM golang:1.25.3-alpine3.22 AS delve
RUN apk add --no-cache git
RUN go install github.com/go-delve/delve/cmd/dlv@latest

FROM alpine:3.22
RUN apk add --no-cache libc6-compat

COPY --from=delve  /go/bin/dlv   /usr/local/bin/dlv
COPY --from=builder /app/main  /app/main

WORKDIR /app
EXPOSE 40000

CMD ["dlv", "exec", "/app/main", \
     "--listen=:40000", \
     "--headless=true", \
     "--accept-multiclient", \
     "--api-version=2", \
     "--log"]