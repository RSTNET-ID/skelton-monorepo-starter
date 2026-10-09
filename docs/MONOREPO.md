# Monorepo Architecture

## Canonical boundaries

- `apps/web` owns browser UI, SSR, same-origin API proxying, ID/EN localization, and frontend security headers.
- `apps/api` owns business rules, persistence, MySQL migrations, queues, schedulers, API security, and observability.
- Root owns Turborepo orchestration and production container packaging.

Do not create a shared package until code or contracts are genuinely consumed by both applications.

## Unified image invariant

Production packaging has one canonical Dockerfile at repository root. Do not add app-specific production Dockerfiles.

The default container launches two executables under one supervisor:

1. Bun/Hono API on `127.0.0.1:3001`.
2. SvelteKit on `0.0.0.0:3000`.

SvelteKit owns the public listener and proxies `/api/*` to the loopback API. If either executable exits unexpectedly, the supervisor terminates the other process and the container exits.

`/health` is an aggregate readiness endpoint. It reports unhealthy when the web process is alive but the API/database path is not ready.

## Database migration policy

Development Compose enables `AUTO_MIGRATE=true` so `docker compose up` applies migrations before listeners start.

For staging/production with multiple replicas, disable automatic per-replica migration and run:

```bash
/app/api/migrate up
```

as a controlled one-shot deployment step using the same image.

## Workspace policy

Bun is the package manager and runtime baseline. Turborepo orchestrates root tasks. App-level Bun lockfiles remain committed so Docker build stages can use deterministic standalone installs. The root `bun.lock` should also be committed after the first root `bun install`.

## API conventions

- Use cursor pagination for growing collections. Do not add OFFSET pagination to application endpoints.
- Validate all untrusted input.
- Authentication and authorization are separate checks.
- Keep SQL parameterized.
- Keep queue/Redis keys namespaced.
- Never log credentials, authorization headers, cookies, JWTs, or secrets.

## TypeScript conventions

Prefer explicit domain/application interfaces and concrete types. Avoid `any`. If an external boundary truly requires unknown data, use `unknown`, validate/narrow it, then convert it to an explicit type.

## Frontend conventions

- UI supports Indonesian (`id`) and English (`en`).
- Use lightweight icons from the existing Lucide setup. Avoid global icon bundles or large eager preload payloads.
- Browser API calls use same-origin `/api`.
- Secrets stay server-only.
