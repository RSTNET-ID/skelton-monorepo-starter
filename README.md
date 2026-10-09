# Skeleton Monorepo Starter

One Docker image containing SvelteKit 5 frontend and Bun/Hono MySQL 8 backend, managed with Turborepo.

- `apps/web`: imported from `RSTNET-ID/svelte-skeleton` main at `a5d2b71acdb91c051d5b69d01008298419ad8fb3`.
- `apps/api`: imported from `RSTNET-ID/bun-slim` mysql-v8 at `ae12d1b5bdc871a25f357e06498be2be6de514dd`.

## Development

```sh
bun install
make dev
```

Commit the generated root `bun.lock` after the first install. The per-app lockfiles remain in place for reproducible Docker builds.

## External MySQL and Redis

**Neither MySQL nor Redis is started by Docker Compose.** Both are external managed/shared dependencies configured via URLs. No local database or Redis volumes are created.

```sh
make env-init
# Edit .env: DATABASE_URL, REDIS_URL if required, APP_BIND_HOST, APP_PUBLISHED_PORT
make docker-config
make docker-build
make docker-dev-up
make docker-health
```

The default host binding is `127.0.0.1:3000`. Change `APP_BIND_HOST` and `APP_PUBLISHED_PORT` for different host interfaces or external ports; **internal web port 3000 and API loopback port 3001 stay fixed**.

The application image is used by both web and API processes under `scripts/container-supervisor.ts`. Separate optional worker/scheduler containers reuse this exact image via profiles; they never introduce another build.

Registry and production commands follow the `wati-crm` Makefile conventions:

```sh
make docker-build ENV_FILE=.env.prod
make docker-push ENV_FILE=.env.prod
make docker-prod-up ENV_FILE=.env.prod
make backend-migrate ENV_FILE=.env.prod
```

Migration is opt-in by default (`AUTO_MIGRATE=false`), so releases can run it as a controlled one-shot operation. See [deployment documentation](docs/MONOREPO.md) for TLS, secrets and external network requirements.

## Tenant deployment from just two files

Build and publish the single image once in the source repository using `make docker-build` and `make docker-push`. A separate `docker-compose.build.yml` is used only for builds, never for deployments.

Each deployment folder contains only `docker-compose.yml` and `.env`, with an image available in the registry:

```text
/opt/apps/tenant-a/docker-compose.yml
/opt/apps/tenant-a/.env
/opt/apps/tenant-b/docker-compose.yml
/opt/apps/tenant-b/.env
```

Set distinct `COMPOSE_PROJECT_NAME`, `APP_PUBLISHED_PORT` on a shared host IP, `SERVICE_NAME`, `REDIS_NAMESPACE` and database credentials for every tenant. All tenant containers may use exactly the same immutable `REGISTRY_IMAGE:IMAGE_TAG`, with web internal port 3000 and API internal port 3001.

From inside a tenant folder:

```sh
docker compose --env-file .env config --quiet
docker compose --env-file .env pull
docker compose --env-file .env up -d --no-build
```

This requires **no Dockerfile, source checkout, Makefile, MySQL container or Redis container** in the tenant folder. For reverse proxy setups, bind each tenant to a different loopback host port and route each tenant domain accordingly.

## Local development without Docker: one root .env

Use the root `.env` for both applications; app-specific `.env` files are not required. `bun run dev` loads `.env` explicitly before Turborepo starts both processes, and Turborepo forwards the environment variables.

```sh
cp .env.example .env
# Edit external DATABASE_URL and optionally REDIS_URL
bun install
make dev
```

Local web: `http://127.0.0.1:5173`; local API: `http://127.0.0.1:3001`; browser API access stays at `/api` via the web proxy. Local development requires no Docker. The root `.env` is not embedded into the production Docker image. In a tenant VM, only `.env` and `docker-compose.yml` are required, with runtime variables supplied by Compose and image pulled from registry.
