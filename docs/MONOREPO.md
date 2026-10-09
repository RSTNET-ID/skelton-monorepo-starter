# Single-tenant deployment with external MySQL and Redis

**Invariant:** One deployment = one app container (SvelteKit + Bun API), one dedicated MySQL database, one `.env` and independent Compose project. Deployments share the *image*, not the runtime/database. Optional worker/scheduler containers reuse the deployment image and database. Never introduce application-level `tenant_id` or tenant resolution to solve separation already achieved through dedicated deployments. Still enforce user/role authorization inside the application.


## One image, external dependencies

Docker Compose runs only application processes. It must never provision MySQL or Redis. The web and API execute in the same main container and use one image. Worker and scheduler profiles reuse this image in additional containers, not additional image builds.

The public listener is **container port 3000** (SvelteKit). The backend listens only on **127.0.0.1:3001 inside the main container**. API calls go through the same-origin `/api/*` proxy.

## Separation boundaries

- **Database:** unique database and least-privileged MySQL user for each deployment.
- **Networking:** host binding/project name per deployment; publish only the SvelteKit port.
- **Redis:** unique per-deployment namespace; for stronger protection use separate Redis ACL credentials or instances. Shared Redis is infrastructure sharing, not application multi-tenancy.
- **Caching:** deployment namespace plus authorization-aware keys; no cross-deployment key reuse.

## Environment setup

```sh
cp .env.example .env
# Update DATABASE_URL, REDIS_URL if using worker/scheduler, app host binding, and credentials
docker compose --env-file .env config --quiet
make docker-dev-up
```

Use `ENV_FILE=.env.prod` with make for staging or production. Keep secrets outside Git. For a production secret file, consider a managed secret store and/or FILE-backed backend credentials; never bake secrets in Docker images.

`APP_BIND_HOST` is **the host interface where Docker publishes SvelteKit**, not the API bind address and not the MySQL hostname. Typical values:

- `127.0.0.1`: reverse proxy on the same host, preferred default.
- `0.0.0.0`: publish on all server interfaces; use only with correct firewall/TLS reverse proxy architecture.
- `192.0.2.10`: bind to a specific configured server interface (replace this documentation address).

`APP_PUBLISHED_PORT` selects the **host-side** port (for example `8080`). Internal container ports remain 3000/3001. Never point `DATABASE_URL` at `localhost` unless the database is inside that same container, which this project does not support.

External MySQL is configured via `DATABASE_URL` (and optionally `MIGRATION_DATABASE_URL` for migrations). External Redis uses `REDIS_URL`, with an isolated `REDIS_NAMESPACE`. Redis is needed only when enabling worker/scheduler. Allow outbound network access from the Docker host/container to the external systems; configure DNS, database grants, firewall, and TLS with your infrastructure administrator.

## Production

Set `APP_ENV=production`, a non-default `SERVICE_NAME`, `DB_TLS_MODE=verify-full`, real secure database credentials, and `EXAMPLE_ROUTES_ENABLED=false`. Supply trusted CA material when necessary. For multiple app replicas, use `AUTO_MIGRATE=false` and run `make backend-migrate ENV_FILE=.env.prod` once as a controlled release step. Never seed production by default.

```sh
make docker-config ENV_FILE=.env.prod
make docker-prod-pull ENV_FILE=.env.prod
make docker-prod-up ENV_FILE=.env.prod
```

Registry image reference comes from `REGISTRY_IMAGE` and `IMAGE_TAG` in your chosen env file. For example use `REGISTRY_IMAGE=docker.example.internal/team/skelton-monorepo` and a tested immutable release tag. Build/push with `make docker-build ENV_FILE=.env.prod` and `make docker-push ENV_FILE=.env.prod`.

`make docker-health` defaults to localhost and resolves the published port from the chosen env file. If publishing to a specific IP or reverse proxy, set `HEALTH_HOST` explicitly.

## Environment variable notes

The API validates all runtime environment variables at startup. Empty optional credential variables are intentionally omitted from Compose environment, because passing empty strings can fail strict URL/secret validation. If using special characters in URL usernames or passwords, percent-encode them. Keep TLS CA certificate files mounted/readable at the configured `DB_TLS_CA_FILE` location when needed.

The root `.env.example` is a template, not a deployment credential set.

## Release gates and rollback

For source development without Docker, use one root `.env` and run `make verify` (typecheck, lint, unit tests, builds). No GitHub Actions runners are required.

Before rolling out an image, test it in a staging environment with access to external MySQL/Redis. Confirm the main container starts, `/health` returns success, `/api/*` reaches the backend, migrations work, and worker/scheduler roles operate where enabled. The repo cannot claim these pass until an actual image build and staging deployment have been executed.

To prevent tenant configuration collisions, run from the source checkout:

```sh
make tenants-validate TENANTS_DIR=/opt/apps
```

It checks each subfolder's `.env` for duplicated Compose project names, host publish address/port overlaps, Redis namespaces, or identical database URLs. It additionally rejects invalid ports, mutable release tags and unsafe production defaults. This is a static check, not a guarantee of OS-wide port availability or isolation against pre-existing infrastructure. The check tool needs Bun; tenant VM deployments themselves need only Docker Compose and two configuration files.

Use immutable tested release tags in `IMAGE_TAG`, preferably registry digests or unique build IDs, and keep the last known-good image available in the registry. On a failed release, restore `IMAGE_TAG` in the tenant's `.env` to the previous release, then run `docker compose --env-file .env up -d --pull always --no-build app`. Check `docker compose --env-file .env ps` and `curl -fsS http://127.0.0.1:PORT/health`. Restore the previous database schema **only via a separately reviewed migration recovery plan**, never by blindly rolling migrations back. The Makefile `docker-rollback ROLLBACK_TAG=...` target reverts the running image temporarily; update `.env` as well to avoid drift.

## Resource controls

`APP_MEMORY_LIMIT`, `APP_CPU_LIMIT`, `APP_PIDS_LIMIT` and corresponding `WORKER_*` and `SCHEDULER_*` limits control each deployment independently. The example values are provisional; profile actual SSR/API memory together, memory spikes during migrations, and queue concurrency before setting production limits. Keep the external database and Redis per-tenant credentials least-privileged. Redis namespaces are logical key segregation, **not** a security boundary; separate Redis ACL users/databases or instances where strict isolation is required.

## Preflight checks

1. `docker compose --env-file .env config --quiet` inside each tenant directory.
2. Verify published host ports are not already occupied and reverse-proxy routes use the tenant's published loopback port.
3. Confirm image tag exists and is supported by the external schema and credentials.
4. Check database TLS validation and outbound firewall/DNS access.
5. Run one-shot migrations on a controlled rollout, ideally after taking a verified backup.
6. Deploy and verify `/health`, API proxy, and optional workers.
7. Keep a known-good tag and record version/health/rollback procedures per tenant.
