# TypeScript contracts and exceptions

- Keep `strict: true`. Never weaken TS configuration or disable `noImplicitAny`.
- Stable Bun response objects and domain DTOs use named `interface`; union/utility types use `type`.
- Import `ApiResponse<TData>`, `PaginatedResponse<TItem>`, `ApiPageQuery` and `ApiFieldErrors` from `#lib/api/contracts.ts` only if the backend implements the documented shape.
- `requestJson<T>()` deserializes but does **not** validate the payload. Decode untrusted JSON as `unknown` and validate before business-critical use.
- For intentional `any` forced by a third-party type, write a line-specific ESLint directive with a reason. No file-level or global opt-out.
- Generic Svelte components should use `generics` and explicit `interface Props` instead of erasing model types.
- Run `bun run check`, `bun run lint`, `bun run format:check` and the tests before shipping.

Example:

```ts
import type { PaginatedResponse } from '#lib/api/contracts.ts';

interface UserSummary {
	id: string;
	name: string;
}

type UserPage = PaginatedResponse<UserSummary>;
```
