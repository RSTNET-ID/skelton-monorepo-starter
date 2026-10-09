# Repository Coding Rules

## Architecture
- **Single-tenant per deployment is mandatory:** one application container with FE + BE, one dedicated external MySQL database, and one deployment-specific root `.env`. Reuse the same image across deployments; do not treat one deployment as a shared multi-tenant application.
- **Do not implement application-level multi-tenancy by default:** no `tenant_id` columns/scopes, tenant resolver, tenant middleware, tenant-based dynamic database routing, or JWT/domain-derived tenant selection. Add those only through an explicitly approved architecture change.
- Extra worker/scheduler roles, when enabled, reuse the same image and deployment database; they can run in separate containers and are not additional tenants.
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
- MySQL 8 per deployment and optional external Redis, with a unique Redis namespace per deployment. Redis namespaces are logical collision prevention, not a substitute for ACLs.
- Cursor pagination instead of OFFSET; always parameterized SQL and bounded queries.
- Validate untrusted input, enforce user/role authorization within the deployment, never log secrets/JWTs/cookies.
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

## Mandatory schema and SQL rules
- Application tables MUST use plural snake_case names (`users`, `payment_intents`). Their primary key MUST use singular entity name plus `_id`: `users.user_id`, `orders.order_id`, `payment_intents.payment_intent_id`. Do NOT use a generic `id` primary key for new application tables.
- Foreign keys use the exact referenced PK name, such as `orders.user_id` referencing `users.user_id`. Define explicit constraints and referential actions.
- All new application entity PKs default to UUIDv7, created with a validated UUIDv7 generator and stored consistently. Prefer `BINARY(16)` with well-documented canonical byte encoding where appropriate; `CHAR(36)` is acceptable when needed for existing schema compatibility. Never use UUIDv4 for new application PKs without a documented exception. Never use MySQL's UUID_TO_BIN(uuid, 1) time swap on UUIDv7.
- Do not rewrite historical migrations or rename existing PK/FK columns silently. Introduce explicit backward-compatible migration plans for legacy schema; update repository, DTO, seeders, API payloads, queries, joins and tests together. Document exceptions for natural/composite keys and system tables.
- Absolutely no production `SELECT *` or `alias.*`. Always select explicit minimum columns. `COUNT(*)` is allowed as a SQL aggregate.
- No N+1: never issue queries per item in collection loops. Use bounded batch queries, joins/prefetch, aggregates; add query-count tests for collection endpoints and verify with realistic cardinality. Also check N+1 HTTP requests.
- Every new query or module requires an index review: WHERE equality/range, joins, ORDER BY, cursor pagination, cardinality/selectivity, composite-index leftmost prefix, unique constraints and write overhead. Match cursor predicates to indexes and validate significant queries with EXPLAIN ANALYZE and representative data. Do not blindly index every column.
- Prefer cursor pagination with stable ordering and unique tie-breaker; no OFFSET on unbounded collections.
- Query caching: prevent duplicated in-flight requests, cache frequently reused safe reads with explicit TTL and capacity bounds, key by deployment namespace, authorization scope and normalized query parameters, and invalidate on writes. Use Redis only with isolated namespace and appropriate ACLs. No caching of transaction-critical ledger/payment state, sensitive authorization data, or other rapidly changing values without a correctness design.
- Frontend must deduplicate identical concurrent fetches and avoid repeated requests to the same endpoint caused by component lifecycle. Ensure cache hit/miss, freshness, invalidation, and failure behavior are tested.

## Feature impact review
Before implementing each task, analyze which other modules, callers, database relationships, schema migrations, queries, indexes, API contracts, DTOs, jobs, cache keys/invalidation, authorization rules, deployment configuration, frontend screens, observability, and deployment rollback are impacted. Record affected modules, risks, expected query counts and regression tests in the change description.

## Quality gates
- Run `make query-guard` and `make verify`. Static SQL guard blocks obvious `SELECT *`/`alias.*` projections and surfaces suspicious loop+query patterns for code review; no static regex/AST scan can guarantee the absence of N+1. Use integration query-count tests and review on collection endpoints.
- Git pre-commit hook must run the query guard. Hooks are developer convenience, not the only enforcement; keep equivalent local gates runnable via Makefile.
