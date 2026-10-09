# Repository Coding Rules

## Scope
This repository is a Bun + Turborepo monorepo with SvelteKit in `apps/web` and Bun/Hono MySQL v8 in `apps/api`.

## Non-negotiable architecture
- The canonical production build is the root `Dockerfile`.
- FE and BE ship in one application image.
- The public listener belongs to SvelteKit on port 3000.
- The API must bind to loopback inside the default container.
- Do not reintroduce production Dockerfiles under `apps/*`.
- Do not create a shared package until at least two workspaces genuinely need the same contract or implementation.

## TypeScript
- Prefer explicit interfaces/types at module boundaries.
- Do not use `any` for convenience. Prefer `unknown` plus validation/narrowing.
- If a library forces `any`, isolate it at the adapter boundary and document why.
- Preserve strict typing and runtime validation for external input.

## Backend
- MySQL 8 is the database baseline.
- Growing collections use cursor pagination, not OFFSET pagination.
- Keep database queries parameterized and bounded.
- Preserve graceful shutdown, request IDs, security headers, rate limits, Redis namespace isolation, migration/seeder registries, workers, schedulers, and observability.
- Do not expose secrets or sensitive error details.

## Frontend
- Support both Indonesian (`id`) and English (`en`).
- Keep icons lightweight using the existing Lucide package. Do not preload entire icon sets.
- Browser API access should remain same-origin through `/api`.
- Server-only credentials and upstream URLs must never be exposed to client bundles.
- Reuse existing base UI components before introducing one-off equivalents.

## Quality
Before merging, run the relevant type checks, lint, unit/contract tests, and production builds. Keep changes scoped and avoid speculative abstractions.
