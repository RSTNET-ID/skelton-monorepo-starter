# Repository Coding Rules

## Architecture
- Bun + Turborepo with `apps/web` (SvelteKit) and `apps/api` (Bun/Hono MySQL 8).
- One canonical production Dockerfile/image at repository root. Default container hosts FE and BE.
- Web binds container 3000; internal API binds loopback 3001 and is reached via same-origin `/api`.
- Do not expose internal API port or add separate frontend/backend image builds.
- Database and Redis are always **external**; do not add database/Redis services or volumes to Compose.
- Host publish IP and host publish port must come from `.env` (`APP_BIND_HOST`, `APP_PUBLISHED_PORT`).
- Keep fixed container internal ports unless intentionally redesigning supervisor/proxy.
- Environment-specific URLs/credentials remain outside Git and Docker image.
- Use controlled one-shot DB migrations for production; do not automatically seed production.

## Backend
- MySQL 8 and external Redis, with isolated namespace on shared Redis.
- Cursor pagination instead of OFFSET; always parameterized SQL and bounded queries.
- Validate untrusted input, isolate tenant access, never log secrets/JWTs/cookies.
- Keep worker, scheduler, migrations, and observability available in same app image.

## Frontend
- Support Indonesian (id) and English (en).
- Reuse lightweight Lucide icons; no global eager icon preload.
- Public API is same-origin `/api`; keep backend credentials server-side.

## TypeScript
- Prefer explicit interfaces. No casual `any`; validate `unknown` at boundaries.

## Operations
- Maintain a complete root `.env.example`, `Makefile`, and deployment docs together with Compose changes.
- Do not add duplicate app-specific production Dockerfiles.
- Before release check `make docker-config`, image build, runtime health and dependency access.
