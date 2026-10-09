# Engineering standards and review checklist

## Deployment boundary

This is **single-tenant per deployment**, not shared-database multitenancy. Every deployment uses one app instance and its own MySQL database configured via its own `.env`. Application tables must not acquire a `tenant_id` solely for deployment separation. Do not add tenant-aware repositories, middleware, domain/JWT tenant detection or dynamic database selection. Keep user/role authorization within each instance. Redis may be physically shared, but namespace keys per deployment and use separate ACL credentials when needed.

## Schema conventions (new migrations)

- Plural snake_case table names, singular entity-prefixed PKs: `users.user_id`, `orders.order_id`, `payment_intents.payment_intent_id`.
- UUIDv7 for each new application entity PK, generated in application code and verified in tests. Choose one durable storage encoding (canonical UUID bytes as BINARY(16) or existing CHAR(36)). Ensure sorting, roundtrip and FK type compatibility. Never apply UUIDv1-oriented MySQL UUID_TO_BIN(..., 1) transformation.
- Foreign key column matches referenced PK name. Model on-delete behavior, FK index and uniqueness explicitly.
- This does not rename historical `categories.id`, `examples.id`, or their UUIDv4 seed rows. That requires a separate compatible data migration with dependent module updates.
- Composite-key junction tables and external identifiers require a documented exception.
- Migration review must include reversibility, locks, online changes, existing-data backfill, deployment/rollback ordering, and affected entities/queries.

## Query performance

- Explicit column lists in all SELECT queries. No SELECT * or alias.*; COUNT(*) aggregate remains valid.
- Reject N+1 by design. Prefer bounded batching and joins; use query-count instrumentation in integration tests for 1, 10, and 100 records, and assert the number of SQL roundtrips does not grow linearly with rows.
- Every new endpoint specifies a bounded response limit and cursor (when collecting rows); stable tie-break ordering and supporting composite indexes.
- Document expected WHERE, JOIN, ORDER BY, uniqueness, cardinality, cost and index layout for each changed query. Validate meaningful plans using EXPLAIN ANALYZE against realistic MySQL 8 fixtures. Consider unnecessary index write amplification.
- Detect repeated identical queries and API requests. Cache only safe reads after measuring; prefer request-scope dedup first, then bounded TTL caches if needed. Scope keys by deployment namespace, authorization scope, normalized params and schema/version; define invalidation on writes. Avoid caching auth decisions and ledger/payment states without consistency guarantees.
- Monitor query count, p95 latency, cache hit/miss, invalidation and slow queries. Avoid logging PII or SQL parameters containing secrets.

## Impact analysis template

For every feature or refactor document:
1. Goal, invariants, and affected modules/callers.
2. Schema/migration, index and query plans, PK/FK and API/DTO compatibility.
3. N+1 risk, batching strategy and expected query count for collection sizes.
4. Cache strategy: why, key scope, TTL, invalidation and freshness guarantees.
5. Deployment database ownership, permission rules, job/events/webhook behavior (no tenant resolver or tenant_id by default).
6. Frontend dedup, loading/error and localization consequences.
7. Unit/integration/contract and regression tests; observability and rollback steps.

## Local quality gate

```sh
bun install
make hooks-install
make query-guard
make verify
# For explicit repository-wide audit (may flag legacy SQL for planned cleanup)
bun run query:guard:all
```

Husky pre-commit invokes `bun run query:guard` to inspect staged API TypeScript/SQL additions. The guard rejects easily recognized SELECT wildcard projections and does not purport to parse every dynamic SQL variant. A reviewer must look for column projections across multiline/dynamic SQL and N+1 patterns. `make verify` runs the guard, type checks, lint, unit tests, and builds. This gate does not substitute for live database query-count tests and EXPLAIN ANALYZE. Keep existing historical migrations immutable until deliberate versioned migration is approved.

Note: root Bun lockfile needs to be generated and committed after an install in a Bun-enabled environment. Hooks are not active on GitHub solely because their files exist: developers must run `bun install` and allow `prepare`, or `make hooks-install`. CI is intentionally not enabled to avoid consuming GitHub Actions minutes.

## UUIDv7 implementation

The backend now provides `uuidV7()` and `isUuidV7()` at `apps/api/src/shared/ids/uuid-v7.ts`. New writes in the legacy example module also generate UUIDv7, while historical columns and existing UUIDv4 rows remain valid. Application developers MUST use this helper for new entity primary keys and use `<singular>_id` names for new schemas. The helper implements RFC 9562 version and variant bits using cryptographic randomness. UUIDs generated within one millisecond are not guaranteed strictly monotonic; use a stable secondary ordering where exact creation order matters.

## N+1 query budget test harness

`apps/api/tests/helpers/query-budget.ts` is a unit-test helper for instrumenting an injected query execution boundary. It includes passing batch-query and failing N+1 demonstrations in `tests/unit/shared/database/query-budget.test.ts`. A **real endpoint/database query-count integration test** must instrument the Bun.SQL query invocation boundary or use MySQL performance instrumentation and compare logical request query counts for 1, 10, 100 rows. The demonstration test is not proof that production endpoints are N+1-free. Always test the actual repository's collection methods and joined/batch lookups.

`RUN_MYSQL_INTEGRATION=true bun run --cwd apps/api test:integration` requires a disposable, migrated external MySQL 8 test database. Never run integration tests or automatic migrations against a live tenant production database.
