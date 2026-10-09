# Skeleton Monorepo Starter

Monorepo starter for RSTNET-ID applications, combining:

- `apps/web`: SvelteKit frontend imported from `RSTNET-ID/svelte-skeleton` `main`.
- `apps/api`: Bun + Hono backend imported from `RSTNET-ID/bun-slim` `mysql-v8`.
- Turborepo for workspace task orchestration and caching.
- Bun 1.4.2 as the package manager/runtime baseline.

## Source snapshots

The initial import is based on:

- Frontend: `a5d2b71acdb91c051d5b69d01008298419ad8fb3` (2026-10-09)
- Backend: `ae12d1b5bdc871a25f357e06498be2be6de514dd` from branch `mysql-v8` (2026-10-07)

## Layout

```text
.
├── apps/
│   ├── api/
│   └── web/
├── docs/
├── package.json
└── turbo.json
```

## Requirements

- Bun 1.4.2 or newer on the 1.4 line
- Docker + Docker Compose for the local infrastructure path

## Bootstrap

```bash
bun install
bun run dev
```

The first root `bun install` creates the monorepo lockfile. Commit that generated root `bun.lock` after reviewing it. The imported app-level lockfiles remain available for standalone Docker builds until the root Docker flow is deliberately consolidated.

## Common commands

```bash
bun run dev
bun run dev:web
bun run dev:api
bun run build
bun run check
bun run lint
bun run format:check
bun run test:unit
bun run test
bun run ci
```

Turborepo skips a task automatically when a workspace does not define a matching script.

## Docker

Run the complete web + API + MySQL development stack:

```bash
docker compose up --build
```

Frontend: http://127.0.0.1:3001

Backend: http://127.0.0.1:3000

Worker and scheduler overlays remain under `apps/api` and can also be run independently.

## Development rules

Repository-wide rules live in `AGENTS.md`. Workspace-specific rules and documentation remain inside each app where useful.

See `docs/MONOREPO.md` for migration decisions and operating conventions.
