# Skeleton Security Checklist

## CMS authorization

- Bun is the source of truth for authentication, authorization and tenant scoping.
- The CMS layout checks `/auth/me` to render its shell.
- Privileged example routes additionally enforce permissions in `+page.server.ts`.
- Every Bun endpoint must independently enforce permission and tenant authorization.
- Hidden menu items are presentation only, never authorization.

## Direct-to-MinIO uploads

- Frontend obtains short-lived presigned PUT tickets from Bun.
- Each FileUpload instance requires explicit `allowedUploadOrigins`. Never trust arbitrary signed URL hosts or forward session credentials to the signed upload host.
- Production upload URLs must be HTTPS, with localhost HTTP allowed only for configured development origins.
- Bun must enforce object ownership, size, type, TTL, object key, and finalization checks.
- MinIO must have tightly scoped bucket policy and CORS for intended frontend origins.
- The UI does not claim byte-level progress.
- Abort and stale completion should not report a cancelled upload as successful.

## Remaining deployment responsibilities

- Implement production session login/logout and CSRF strategy in Bun.
- Set secure proxy/TLS headers, HSTS and trusted-forwarder configuration at the edge.
- Apply rate limits, validation and tenant scoping in backend endpoints.
- Run accessibility and browser integration tests with real backend contracts before a production launch.
- Keep dependency lockfile committed; verify production Docker build and scanners in a supported runtime.

This is a reusable baseline, not a completed security assessment of the applications derived from it.

API consumer modules can supply a runtime decoder to `requestJson(fetcher, options, decode)`; TypeScript generics by themselves do not validate external JSON.

## Frontend protections checked in code

- `backendApi` disallows automatically following upstream redirects with credentials and restricts API paths to root-relative paths.
- CMS identity responses are decoded from unknown at the server boundary; malformed permissions fail closed.
- A real Bun API is still required to verify cross-tenant access control, cookie and CSRF semantics, logout invalidation and presigned ticket authorization.
