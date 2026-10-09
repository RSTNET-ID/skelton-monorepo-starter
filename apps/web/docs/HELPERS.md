# Shared Helpers

All reusable, framework-agnostic helper functions live in `src/lib/helpers/`. Import from `#lib/helpers/index.ts`. No helper can import server credentials, call APIs, or access global browser state.

| Module       | Exports                                                                           | Typical use                                                           |
| ------------ | --------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `format.ts`  | `formatCurrency`, `formatNumber`, `formatPercent`, `formatDate`, `formatDateTime` | Table/detail display with explicit locale/timezone                    |
| `text.ts`    | `initials`, `truncate`, `humanizeKey`, `normalizeSearch`                          | User avatars, table strings, search fields                            |
| `query.ts`   | `buildQuery`, `parsePositiveInt`, `paginationInfo`                                | URL filters and paginated views                                       |
| `objects.ts` | `isRecord`, `toErrorMessage`, `uniqueBy`, `omitEmpty`                             | Safe narrowing, display-safe errors, distinct options, filter cleanup |

Keep domain-specific validation in the backend and feature contract. UI numeric formatting is _not_ decimal-safe accounting. Date-only values and absolute timestamps are different types and must not be confused. Avoid adding utilities that merely rename native standard library functions.
