# syntax=docker/dockerfile:1.7

FROM oven/bun:1.4.2-alpine AS api-deps
WORKDIR /src
COPY apps/api/package.json apps/api/bun.lock ./
RUN --mount=type=cache,target=/root/.bun/install/cache \
    HUSKY=0 bun install --frozen-lockfile

FROM api-deps AS api-builder
COPY apps/api/ ./
RUN bun run typecheck && bun run build

FROM oven/bun:1.4.2-alpine AS web-deps
WORKDIR /src
COPY apps/web/package.json apps/web/bun.lock ./
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

FROM web-deps AS web-builder
COPY apps/web/ ./
RUN bun run check && bun run --bun build

FROM oven/bun:1.4.2-alpine AS supervisor-builder
WORKDIR /src
COPY scripts/container-supervisor.ts ./
RUN bun build --compile --minify \
    --no-compile-autoload-dotenv \
    --no-compile-autoload-bunfig \
    ./container-supervisor.ts --outfile /out/supervisor

FROM alpine:3.22 AS runtime
ENV TZ=UTC \
    NODE_ENV=production \
    PORT=3000 \
    API_INTERNAL_PORT=3001

RUN apk add --no-cache \
    tzdata \
    ca-certificates \
    curl \
    dumb-init \
    libstdc++ \
  && cp /usr/share/zoneinfo/UTC /etc/localtime \
  && echo "UTC" > /etc/timezone \
  && addgroup -S appgroup \
  && adduser -S appuser -G appgroup

WORKDIR /app

COPY --from=api-builder --chown=appuser:appgroup /src/dist/ ./api/
COPY --from=web-builder --chown=appuser:appgroup /src/build/server ./web/server
COPY --from=supervisor-builder --chown=appuser:appgroup /out/supervisor ./supervisor

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=20s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS "http://127.0.0.1:${PORT}/health" >/dev/null || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["./supervisor"]
