# CMS navigation and components

- `Tabs`: use `items`, `bind:value`, and a Svelte 5 snippet receiving the active value; supports arrow keys, Home and End.
- `Breadcrumb`: pass `items: { label, href? }[]`. The last entry is marked as current.
- `FileUpload`: pass `requestTicket(file, signal)` to request a short-lived presigned PUT URL from Bun, an optional `complete(ticket,file,signal)` callback, and `onuploaded(key)`.
- `canAccess(permissions, needed)`: controls visibility only. It NEVER authorizes backend data access.

**Required backend contract**: presigned upload ticket contains `uploadUrl`, `objectKey`, optional `headers`; Bun validates identity, MIME, file size, target path, and expiration. MinIO policies must constrain object writes. Upload is a direct PUT with `credentials: omit`.

FileUpload currently provides busy/completed states, **not real byte progress**. Use an upload transport with byte-level progress events before showing percentage indicators in a derived product.

CMS example menu entry `/cms/components` requires `cms.components.read`. Every actual product endpoint must separately enforce permission and tenant rules. Existing example CMS authorization is a baseline, not a complete production RBAC solution.

## Upload origin enforcement

`FileUpload` requires an `allowedUploadOrigins` array, for example `['https://uploads.example.com']`. Only exact origin matches are allowed. For local MinIO development, explicitly include `http://localhost:9000`. The component no longer accepts arbitrary presigned URL origins. Cancellation invalidates pending completion callbacks. Production origin authorization and actual file validation remain the backend's responsibility.
