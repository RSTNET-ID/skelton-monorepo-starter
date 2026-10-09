# Architecture

## Goals

This skeleton is a frontend baseline, not a second backend. It is optimized for applications where a separate Bun service owns business logic, persistence, queues, object storage, integrations, and domain APIs.

SvelteKit owns presentation, routing, SSR, form/UI behavior, and optionally a thin backend-for-frontend boundary where server-side rendering or cookie/session handling benefits from it.

## Request paths

### Browser to Bun through a reverse proxy

```text
Browser
  |
  | https://app.example.com/api/*
  v
Reverse proxy / gateway
  |
  +--> /api/*  -> Bun backend
  |
  +--> /*      -> SvelteKit frontend
```

This is the preferred simple production shape for browser API calls because it keeps traffic same-origin.

### SvelteKit server to Bun

```text
Browser -> SvelteKit load/action/endpoint -> backendApi(...) -> Bun backend
```

Use this when SSR needs backend data, credentials should never enter client JavaScript, or the frontend needs a small BFF-style translation boundary.

Do not recreate domain services inside SvelteKit. If logic is reusable by mobile, web, jobs, or other consumers, it belongs in the Bun backend.

## Directory rules

- `src/lib/api`: browser-safe transport primitives. Nothing here may import private environment values.
- `src/lib/server`: server-only Bun/backend integration.
- `src/lib/components`: reusable presentation components.
- `src/lib/config`: non-secret application metadata.
- `src/routes`: product routes and route-local UI/load/action code.
- `tests`: fast unit tests that do not require a browser.
- `e2e`: browser-level behavior tests.

SvelteKit 3 treats `server` path segments as server-only. Keep secrets and privileged upstream calls behind that boundary.

## State management

Start with Svelte state/runes and route data. Add a global state library only if real product requirements justify it. Most dashboards do not need a ceremonial state-management empire before they have state worth managing.

## API errors

`requestJson` converts failed upstream responses to `ApiError` with:

- HTTP status
- optional backend error code
- optional request ID
- parsed response details

UI code should branch on stable status/code values. Do not couple product logic to prose error messages.

## Correlation IDs

Every incoming request receives a request ID in `hooks.server.ts`. A valid upstream `x-request-id` is retained; otherwise a UUID is generated. Server-side Bun API calls forward that value.

The Bun backend should log and return the same `x-request-id` where practical. That gives frontend and backend logs a shared trace key without requiring a full tracing platform on day one.

## Security boundaries

- Private variables only via `$app/env/private`.
- Browser code only receives variables declared public.
- CSP is configured centrally in `vite.config.ts`.
- Unexpected errors are logged server-side but shown generically to clients.
- Authentication credentials should use HttpOnly cookies or an equivalent backend-controlled mechanism.
- HSTS and trusted forwarded headers are edge/deployment concerns.

## Adding dependencies

A starter becomes harder to reuse each time it adopts a product-specific dependency. Before adding a library to the skeleton, it should satisfy at least one of these:

1. Nearly every derived project needs it.
2. It enforces a baseline quality/security rule.
3. Removing it per project would be harder than adding it per project.

That is why this skeleton does not preinstall a form framework, schema library, icon pack, component suite, analytics SDK, auth SDK, or client state library.
