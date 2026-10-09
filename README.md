# Skeleton Monorepo Starter

Turborepo monorepo that combines the RSTNET-ID Svelte frontend and the Bun/Hono MySQL v8 backend.

## Source lineage

- `apps/web`: imported from `RSTNET-ID/svelte-skeleton` `main`, snapshot `a5d2b71acdb91c051d5b69d01008298419ad8fb3`.
- `apps/api`: imported from `RSTNET-ID/bun-slim` branch `mysql-v8`, snapshot `ae12d1b5bdc871a25f357e06498be2be6de514dd`.

## Layout

```text
apps/
  web/    SvelteKit 3 + Svelte 5
  api/    Bun + Hono + MySQL 8
scripts/
  container-supervisor.ts
Dockerfile
docker-compose.yml
package.json
turbo.json
```

## One production image

The canonical root `Dockerfile` builds both applications into **one image**.

At runtime:

```text
client
  |
  v
:3000 SvelteKit
  |  /api/*
  v
127.0.0.1:3001 Bun/Hono
  |
  v
MySQL / Redis
```

Only the SvelteKit listener is public. The API listener is forced to loopback by the container supervisor. Browser API calls stay same-origin at `/api`.

The same image also contains the API worker, scheduler, migration, seed, doctor, and dead-letter tooling binaries. Compose profiles may run those roles as separate containers **without building separate images**.

## Workspace commands

Install the root workspace and generate the root Bun lockfile once:

```bash
bun install
```

Then:

```bash
bun run dev
bun run dev:web
bun run dev:api
bun run build
bun run check
bun run lint
bun run test
```

## Docker

```bash
docker compose up --build
```

Open http://127.0.0.1:3000.

The development Compose file sets `AUTO_MIGRATE=true`, so migrations run before the API and web listeners start.

For multi-replica production deployments, prefer a one-shot migration job and set `AUTO_MIGRATE=false` for normal application replicas.

Optional worker/scheduler profiles reuse the exact same application image:

```bash
docker compose --profile worker up --build
docker compose --profile scheduler up --build
```

See `docs/MONOREPO.md` for architecture and deployment rules.
