# Contributing

Keep changes to this repository reusable across many frontend projects. Product-specific features belong in projects created from the skeleton, not in the skeleton itself.

## Development

```bash
bun install
cp .env.example .env
bun run dev
```

## Before opening a pull request

```bash
bun run check
bun run lint
bun run format:check
bun run test:unit
bun run --bun build
bun run test:e2e
```

A change should include tests when it changes transport behavior, hooks, reusable utilities, or user-visible flows.

## Commit scope

Prefer small commits with conventional, readable messages such as:

```text
feat: add reusable form field
fix: preserve backend request id
chore: update svelte dependencies
docs: explain reverse proxy setup
```

## Dependency changes

Explain why a new dependency belongs in a general-purpose skeleton. Convenience alone is not enough; the cost is inherited by every downstream project.
