# Server-side DataTable: Cursor pagination

The reusable `DataTable` uses **cursor-based** pagination by default. Import it from `#lib/components/ui/index.ts` and pass `columns`, `fetchPage`, and `rowKey`.

`fetchPage(query, signal)` receives `{ cursor: string | null, limit: number, search: string, sortBy?, sortDir? }` and returns `{ items, nextCursor, hasNextPage, total? }`. Never send `page` or `OFFSET` to the Bun backend.

The frontend treats each cursor as an opaque string, stores a history to support Previous, and resets cursor history when search, sorting or limit changes. The user-visible page index describes navigation history, not an offset. Total count is optional.

The Bun backend MUST enforce a bounded limit, stable keyset ordering (e.g. `created_at DESC, id DESC`), consistent null ordering, sort-field allowlists, tenant scoping and permission filters. Sign or validate cursor payloads, including filters and expiration. Cursors from other filter contexts must be rejected. Search is debounced and old requests are aborted.

```ts
import type { CursorPageQuery, CursorPageResponse } from '#lib/api/contracts.ts';
interface User {
	id: string;
	name: string;
}
async function fetchUsers(
	query: CursorPageQuery,
	signal: AbortSignal
): Promise<CursorPageResponse<User>> {
	const params = new URLSearchParams({ limit: String(query.limit), search: query.search ?? '' });
	if (query.cursor) params.set('cursor', query.cursor);
	if (query.sortBy) params.set('sortBy', query.sortBy);
	if (query.sortDir) params.set('sortDir', query.sortDir);
	const response = await fetch('/api/users?' + params, { signal, credentials: 'include' });
	if (!response.ok) throw new Error('Unable to load users');
	return response.json(); // validate structure at the API boundary in production
}
```

Legacy offset contracts, when required for a specific endpoint, are explicitly named `OffsetPageQuery` and `OffsetPaginatedResponse<T>` and are **not** the DataTable default.
