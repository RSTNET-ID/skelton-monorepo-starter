# Svelte Skeleton

A production-minded SvelteKit starter for frontend projects that commonly sit in front of Bun APIs.

The repository intentionally provides infrastructure and conventions without forcing a product architecture. It gives new projects the boring baseline once: runtime integration, API helpers, environment validation, security headers, tests, formatting, linting, Docker, and CI.

## Stack

- SvelteKit 3 and Svelte 5
- TypeScript in strict mode
- Vite 8
- Tailwind CSS 4
- Official `@sveltejs/adapter-bun`
- Bun 1.4.2 as the pinned package manager and production runtime
- Vitest for unit tests
- Playwright for browser tests
- ESLint and Prettier

## Requirements

- Bun 1.4 or newer. The repository pins Bun 1.4.2.
- Node.js 22.17 or newer only when using Node-based editor/tool integrations. Production uses Bun.

## Quick start

```bash
bun install
cp .env.example .env
bun run dev
```

Open `http://localhost:5173`.

The first `bun install` creates `bun.lock`. Commit that lockfile. Production and CI should use a committed lockfile once it exists.

## Commands

```bash
bun run dev             # Development server
bun run check           # Svelte and TypeScript checks
bun run lint            # ESLint
bun run format          # Rewrite files with Prettier
bun run format:check    # Verify formatting
bun run test:unit       # Vitest
bun run test:e2e        # Playwright
bun run ci              # Local quality gate
bun run --bun build     # Production build through Bun
bun ./build             # Run the adapter-bun production output
```

`adapter-bun` requires the production build itself to run through Bun. Use `bun run --bun build`, not a Node-executed Vite build.

## Environment

| Variable              | Visibility | Default                     | Purpose                           |
| --------------------- | ---------- | --------------------------- | --------------------------------- |
| `API_BASE_URL`        | Private    | `http://127.0.0.1:3000/api` | Server-to-server Bun API base URL |
| `API_TIMEOUT_MS`      | Private    | `10000`                     | Backend request timeout           |
| `PUBLIC_API_BASE_URL` | Public     | `/api`                      | Browser-visible API base URL      |

Variables are declared and validated in `src/env.ts`. Private values are only imported from `$app/env/private`; public values use `$app/env/public`.

For production, `/api` is a good default when Nginx, Caddy, Traefik, or another gateway routes `/api/*` to the Bun backend and everything else to SvelteKit. That keeps browser requests same-origin and greatly reduces CORS ceremony.

## Backend integration

Browser-side requests:

```ts
import { apiFetch } from '#lib/api/client.ts';

const profile = await apiFetch<Profile>({
	path: '/me'
});
```

Server-side requests from `+page.server.ts`, `+layout.server.ts`, actions, or endpoints:

```ts
import { backendApi } from '#lib/server/backend-api.ts';

export async function load(event) {
	const profile = await backendApi<Profile>(event, {
		path: '/me'
	});

	return { profile };
}
```

The server helper forwards `Authorization` and `Cookie` by default, adds `x-request-id`, applies the configured timeout, and normalizes non-2xx responses to `ApiError`. Set `forwardAuth: false` for public upstream calls.

See [`docs/BACKEND-INTEGRATION.md`](docs/BACKEND-INTEGRATION.md) for the intended boundary with a Bun backend.

## Authentication baseline

The skeleton deliberately does not implement a product-specific auth flow. When the Bun backend issues a browser session, prefer an `HttpOnly`, `Secure`, `SameSite` cookie or another backend-owned session mechanism.

Do not store bearer/JWT credentials in `localStorage`. Browser JavaScript can read `localStorage`, which turns an XSS bug into credential theft. `localStorage` is used here only for the harmless theme preference.

## Security baseline

Included by default:

- SvelteKit CSP with restrictive defaults
- `frame-ancestors 'none'` and `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- strict referrer policy
- restrictive permissions policy
- per-request correlation ID
- safe generic handling of unexpected errors
- validated private/public environment separation
- no credential persistence in browser storage
- dependency update automation

HSTS belongs at the TLS-terminating reverse proxy or load balancer, not blindly inside the application. Forwarded proxy headers must only be trusted when the Bun/SvelteKit service cannot be reached directly by untrusted clients.

## Project structure

```text
src/
├── app.d.ts
├── app.html
├── env.ts
├── hooks.client.ts
├── hooks.server.ts
├── lib/
│   ├── api/                 # Browser-safe API primitives
│   ├── components/          # Shared UI components
│   ├── config/              # Public app configuration
│   └── server/              # Server-only integration code
├── routes/                  # SvelteKit filesystem routes
└── styles/                  # Global styling

tests/                       # Vitest
e2e/                         # Playwright
docs/                        # Architecture and integration notes
static/                      # Public immutable source assets
```

SvelteKit 3 uses Vite-based configuration, so this repository intentionally has no `svelte.config.js`.

## Docker

Build and run:

```bash
docker build -t svelte-skeleton .
docker run --rm -p 3001:3000 \
  -e API_BASE_URL=http://host.docker.internal:3000/api \
  svelte-skeleton
```

Or use:

```bash
docker compose up --build
```

The container runs as the non-root `bun` user and exposes a `/health` liveness endpoint.

## Starting a new project

1. Create a repository from this starter or clone it.
2. Change package name and `src/lib/config/app.ts`.
3. Copy `.env.example` to `.env` and point it at the Bun backend.
4. Run `bun install` and commit `bun.lock`.
5. Replace the starter landing page with product routes.
6. Keep server-only backend access under a `server` directory or server route/module.
7. Add domain-specific validation, auth, telemetry, and UI libraries only when the project actually needs them.

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/BACKEND-INTEGRATION.md`](docs/BACKEND-INTEGRATION.md)
- [`AGENTS.md`](AGENTS.md)
- [`CONTRIBUTING.md`](CONTRIBUTING.md)
- [`SECURITY.md`](SECURITY.md)

## License

MIT. See [`LICENSE`](LICENSE).

## Dynamic base components and layouts

- `AutoNumericInput`: reusable raw decimal values for currency, percent and generic numbers.
- `DatePicker`: reusable single/range/multiple selection and time-only/date-time modes.
- `SelectAjax`: debounced async suggestion search, cancellation, and edit-form ID resolution.
- `src/routes/(public)` and `src/routes/(cms)/cms`: separate public/CMS shells; CMS has server-side Bun auth gate.
- `src/lib/helpers`: common pure UI/data utilities.

See [dynamic form documentation](docs/DYNAMIC-FORMS-AND-LAYOUTS.md). All pages MUST use base components, not native input elements. See [AGENTS.md](AGENTS.md).
