# Gemini Agent Instructions

**Source of truth:** [AGENTS.md](AGENTS.md). Read it first, then follow it for every change.

- Prefer Svelte 5 runes and snippet composition.
- Keep API and secret management on the correct side of the SvelteKit server boundary.
- Follow `docs/ARCHITECTURE.md`, `docs/BACKEND-INTEGRATION.md`, and `docs/COMPONENTS.md`.
- Use existing UI primitives and variant tokens instead of inventing a parallel component set.
- Assess a11y, SSR/hydration, light/dark mode, loading/empty/error states when relevant.
- Validate changed code and state exact results; do not hide unrun checks.
