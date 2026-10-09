FROM oven/bun:1.4.2-alpine AS dependencies
WORKDIR /app
COPY package.json ./
RUN bun install

FROM dependencies AS build
COPY . .
RUN bun run --bun build

FROM oven/bun:1.4.2-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000

COPY --from=build /app/build ./build
COPY --from=build /app/package.json ./package.json

USER bun
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD bun -e "const r=await fetch('http://127.0.0.1:3000/health');process.exit(r.ok?0:1)"

CMD ["bun", "./build"]
