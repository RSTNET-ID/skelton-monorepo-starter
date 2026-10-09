# Bun Backend Integration

## Recommended deployment shape

Use one public origin where possible:

```text
https://app.example.com/       -> SvelteKit
https://app.example.com/api/*  -> Bun backend
```

Set:

```env
PUBLIC_API_BASE_URL=/api
API_BASE_URL=http://bun-api:3000/api
```

`PUBLIC_API_BASE_URL` is visible to browser code. `API_BASE_URL` is private and intended for the internal network path from SvelteKit to Bun.

## Browser calls

Use `apiFetch` for calls that are intentionally made by browser JavaScript:

```ts
import { apiFetch } from '#lib/api/client.ts';

const result = await apiFetch<User>({
	path: '/v1/me',
	method: 'GET'
});
```

It sends cookies by default with `credentials: 'include'`.

## Server calls

Use `backendApi(event, options)` from server-only modules:

```ts
import { backendApi } from '#lib/server/backend-api.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const dashboard = await backendApi<Dashboard>(event, {
		path: '/v1/dashboard'
	});

	return { dashboard };
};
```

The helper forwards `authorization` and `cookie` headers by default. Disable forwarding for endpoints that do not need caller identity:

```ts
const catalog = await backendApi<Catalog>(event, {
	path: '/v1/catalog',
	forwardAuth: false
});
```

## Backend error contract

The transport layer understands a minimal error shape without forcing it:

```json
{
	"message": "Validation failed",
	"code": "VALIDATION_ERROR",
	"fields": {
		"email": ["invalid"]
	}
}
```

`message` and `code` are extracted when present. The entire body remains available as `ApiError.details`.

For long-lived projects, define the backend's real response DTOs in a shared contract package or generated client rather than slowly growing duplicate handwritten types in mobile and web repositories.

## Authentication

Preferred browser pattern:

1. Browser submits credentials to an auth endpoint.
2. Bun validates credentials.
3. Bun or the trusted frontend boundary sets an `HttpOnly; Secure; SameSite=...` session cookie.
4. Browser sends the cookie automatically.
5. Frontend JavaScript never needs to read the credential.

If the backend uses JWT internally, the token format does not require storing the token in browser-readable storage. JWT is a token format, not a browser storage policy. Humanity has suffered enough from conflating those two concepts.

## CORS

Same-origin routing avoids most CORS configuration. If the browser must call another origin directly, configure CORS in the Bun backend with an explicit allowlist and credential policy. Do not use `*` together with credentialed requests.

## Reverse proxy trust

The official Bun adapter supports forwarded protocol/host/address headers. Only enable and trust those headers when the SvelteKit process is reachable exclusively through a proxy you control. Otherwise clients can spoof them.

## MinIO and uploads

For large object uploads, prefer a backend-controlled flow that creates short-lived presigned MinIO URLs. The frontend then uploads directly to object storage without proxying large bodies through SvelteKit. Keep authorization, object naming, size/type policy, and finalization in the Bun backend.
