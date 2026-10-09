# Security mock scenarios (test-only)

This repository includes a deterministic **test-only** mock backend at `tests/mocks/backend.ts`. It simulates logged-in sessions, CSRF, tenant records, cursor limits, permission checks, MinIO upload ticket authorization, and logout invalidation.

Run `bun run test:unit`. These fixtures never run in production routes and contain no real secrets.

**Important:** Mock tests verify expectations against a fabricated server. They do **not** demonstrate that a Bun backend, database policy, or MinIO bucket configuration actually enforces those expectations.

Before storing real sensitive data, execute equivalent integration cases against a deployed Bun API using two isolated test tenants, least-privilege accounts, and a throwaway MinIO bucket. Record evidence of denied cross-tenant reads/writes, forged CSRF requests, revoked sessions, invalid cursor scopes, and malicious upload tickets.
