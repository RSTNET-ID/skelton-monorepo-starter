# Claude Code Instructions

Read and follow [AGENTS.md](AGENTS.md) before changing any code. That document is the canonical coding, security, architecture, and acceptance standard.

## Workflow

- Inspect relevant files before editing. Prefer narrow diffs.
- Maintain Svelte 5 and SvelteKit 3 conventions; no legacy slot or event dispatcher patterns in new code.
- Implement reusable UI in `src/lib/components/ui` and keep `/components` examples up to date.
- Route browser code through browser-safe modules and privileged API requests through `src/lib/server`.
- Validate with `bun run check`, `bun run lint`, `bun run format:check`, `bun run test:unit`, and `bun run --bun build`.
- Mention any checks that could not run and why. Never invent green CI status.

Do not infer authorization or backend contracts from a decoded JWT. The Bun backend remains authoritative.
