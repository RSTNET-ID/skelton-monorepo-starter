# Agent and Coding Rules

These rules apply to AI coding agents and human contributors working from this skeleton.

## Runtime and framework

- Use Bun as the package manager and production runtime.
- Keep the Bun version pinned through `packageManager`, CI, and Docker.
- This is SvelteKit 3. Do not add `svelte.config.js`.
- Put SvelteKit configuration in the `sveltekit(...)` call in `vite.config.ts`.
- Use Svelte 5 runes for new component state.
- Use `$app/state`, not removed legacy stores.
- Use the new `$app/env/private` and `$app/env/public` modules, not deprecated `$env/*` modules.
- Use `#lib` package imports where shared code benefits from them. Do not reintroduce the removed implicit `$lib` alias.

## Backend boundary

- Treat the Bun API as the owner of domain logic, persistence, queues, storage, and integrations.
- Do not duplicate backend business rules in SvelteKit merely for convenience.
- Browser-safe transport code belongs in `src/lib/api`.
- Privileged/server-only integration belongs in `src/lib/server` or another `server` path segment.
- Use `backendApi` for normal server-to-Bun JSON calls so timeout, request ID, and error handling stay consistent.
- Do not import `$app/env/private` from browser-reachable modules.

## Authentication and secrets

- Never store access tokens, refresh tokens, JWTs, passwords, or API keys in `localStorage` or `sessionStorage`.
- Prefer HttpOnly/Secure/SameSite cookies or an equivalent backend-controlled session.
- Never expose private environment variables to client code.
- Never log credentials, cookies, bearer tokens, full sensitive request bodies, or secret environment values.
- Do not weaken CSP, CSRF, CORS, or response headers merely to make an integration pass locally. Fix the integration boundary instead.

## TypeScript

- Keep strict TypeScript enabled.
- Explicit `any` is forbidden by ESLint. Prefer `unknown` at untrusted boundaries, runtime narrowing, generics, or typed utility contracts.
- Use `interface` for stable object-shaped domain, DTO, API and component prop contracts. Use `type` for unions, mapped/conditional types, primitives and function aliases.
- Use `ApiResponse<T>`, `CursorPageResponse<T>` and `ApiFieldErrors` from `#lib/api/contracts.ts` when the Bun endpoint follows those contracts. Do not assume all API endpoints return a common envelope.
- `requestJson<T>()` types caller expectations; it does NOT validate JSON at runtime. Validate untrusted responses at boundaries when correctness/security depends on their shape.
- If a third-party declaration truly forces `any`, add an explicit, narrowly-scoped `eslint-disable-next-line @typescript-eslint/no-explicit-any -- <reason>` on that line only. Never disable `strict`, `noImplicitAny` or the ESLint rule globally.
- Keep stable API/domain response types explicit.
- Treat network, storage, URL params, form data, and environment inputs as untrusted until validated.

## Svelte

- Keep components focused on presentation and interaction.
- Prefer route `load`/actions for route-owned data over global client fetching during mount.
- Preserve progressive enhancement where practical.
- Keep accessibility semantics intact: labels, button types, keyboard focus, headings, and meaningful link text.
- Do not disable Svelte accessibility warnings without a documented reason.

## API calls

- Use stable backend error `code` values for application branching when available.
- Preserve and propagate `x-request-id` through server-side calls.
- Always apply a timeout to upstream network requests.
- Do not silently retry mutations. Retries require endpoint-specific idempotency semantics.
- Do not forward auth headers/cookies to arbitrary third-party origins.

## Dependencies

- Keep the starter dependency surface small.
- Do not add a UI kit, form library, state manager, auth SDK, analytics SDK, schema library, or icon pack to the skeleton unless it is broadly justified for derived projects.
- Pin direct dependency versions in the skeleton and commit `bun.lock`.
- Prefer platform/SvelteKit primitives over tiny convenience packages.

## Quality gate

Before merging a functional change, run:

```bash
bun run check
bun run lint
bun run format:check
bun run test:unit
bun run --bun build
```

Run Playwright when behavior visible in the browser changed.

## Documentation

- Update `.env.example` when environment variables change.
- Update backend integration docs when request/auth/proxy conventions change.
- Update the README when commands, minimum versions, or deployment behavior changes.

## Shared UI component rules

- Reusable primitives belong in `src/lib/components/ui`, one PascalCase component per file, exported through `index.ts`.
- Compose with Svelte 5 `Snippet`, `$props()`, `$bindable()`, and `{@render ...}`. Do not add new Svelte 4 slot/event-dispatch patterns.
- Use native semantic HTML before recreating browser controls in JavaScript.
- A form field must have a visible label, stable ID, associated errors/hints and appropriate invalid state.
- Buttons default to `type="button"` and expose loading/disabled state.
- Do not style by constructing Tailwind class names dynamically from pieces. Use explicit complete strings in variant maps so the compiler can discover the classes.
- Use the provided tokens/variants before adding another palette. UI components must work in light and dark mode and with keyboard-only input.
- Avoid unnecessary abstractions: base controls are not a reason to build a large design-system framework.
- Page-specific composite components belong alongside their feature/route, not automatically in the UI primitives folder.
- The `/components` route demonstrates UI primitives. Keep examples in sync when components change.

## Agent execution protocol

1. Inspect existing files and relevant docs before edits. Never assume an old SvelteKit tutorial applies.
2. State the intended scope and identify affected layers (UI, API, server, tests, deployment).
3. Prefer minimal, localized changes; do not reformat unrelated files.
4. Implement and document behavioral changes together. Add regression coverage when feasible.
5. Run quality checks; explicitly report commands not run, failures and environmental blockers.
6. Do not claim tests passed or deployment succeeded without observing those results.
7. Never expose secrets, production customer data, or credentials in prompts, commits or logs.
8. Never silently change public API signatures, environment contracts, security defaults, or auth behavior.
9. When editing a shared primitive, consider accessibility, theme support, keyboard behavior, SSR, and hydration.
10. Preserve compatibility with the Bun backend; the frontend must not become a parallel owner of business rules.

## Agent entrypoints

`AGENTS.md` is canonical for every agent. `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`, and `.cursor/rules/svelte-skeleton.mdc` point back here and only describe tooling-specific workflows. Resolve conflicts by following this file; security rules take precedence.

## Mandatory base components: STRICT RULE

**MUST:** Every route/page/feature uses the shared primitives exported by `#lib/components/ui/index.ts` for user input and interactive form controls. Applies equally to public pages, CMS pages, create/edit forms, search, filters, modals and settings.

**FORBIDDEN outside `src/lib/components/ui/`:** direct `<input>`, `<textarea>`, `<select>` or hand-rolled replacements for existing base components. Native HTML controls may be implemented inside the base component layer only. Do not use raw input elements in a page, even when they appear simpler.

**MUST:** Use `Input`, `Textarea`, `Button`, `AutoNumericInput`, `DatePicker`, `SelectAjax` or additional shared base components. If a requested feature needs a control that does not exist, implement or extend a reusable base component FIRST, then use it in the page. Do not bypass the rule due to deadlines or create page-local input wrappers. No third-party widget directly in route code: wrap it in a base component with a stable public API.

**MUST:** Keep all shared components configurable through props, Svelte 5 snippets, typed callbacks and bindable values. No page-specific URLs, fixed option catalogs, fixed permission checks or domain schemas inside generic UI controls.

**MUST:** Shared helpers go into `src/lib/helpers/`, exported through `index.ts`, with tests for nontrivial behavior. Check existing helpers before creating local formatters, normalizers, URL builders, string/date/number utilities. Helpers must be pure when possible, locale/timezone explicit, and never handle secrets or authorization decisions.

**MUST:** Public routes belong to `src/routes/(public)/`; CMS routes to `src/routes/(cms)/cms/`. CMS must enforce server-side identity and authorization. An authentication gate is not a replacement for endpoint-level permissions.

**FORBIDDEN:** Per-keypress AJAX network calls. `SelectAjax` uses debounce after typing stops, AbortController, stale result protection and `resolve(id)` for edit preselection.

Code review rejection criteria: any new page-local native input, duplicated helper, bypass of server auth boundary, or untested shared helper. Do not claim completion until full CI is green.

- **Select (regular)** MUST be used for local/static/preloaded options. **SelectAjax** MUST be used for backend-filtered datasets. Never implement a native `<select>` inside a page.

## Icon policy (mandatory)

- Use `@lucide/svelte` (Svelte 5-native). Import **each icon from its explicit subpath**, e.g. `import Search from '@lucide/svelte/icons/search';`.
- Do **not** import from the package root (`import { Search } from '@lucide/svelte'`), dynamically import an entire icon set, import `icons` dictionaries, or build a registry that eagerly imports every icon.
- Do **not** add icon fonts, remote icon CDNs, a second icon dependency, or global SVG sprite preload.
- Decorative icons require `aria-hidden="true"`; icon-only buttons require an accessible label. Reuse `Button` for icon actions.
- Icons are presentation components, not a reason to bypass mandatory UI base components.
- Avoid adding a generic `Icon name={string}` wrapper backed by a complete registry. Direct imports permit smaller per-route bundles.

## Internationalization (mandatory, ID and EN)

- ALL user-facing UI text MUST use translation keys from `src/lib/i18n/index.ts`. This includes labels, buttons, headings, navigation, validation messages, placeholders, empty states, toasts, dialogs, error states and accessibility labels.
- Default language is Indonesian (`id`); English (`en`) is required for every new translation key. Missing counterparts block review. Avoid hard-coded visible strings in pages, layouts and base components.
- Use `translate(locale, key, params)`; keys must be typed. Never build translation keys dynamically from arbitrary API input.
- Locale MUST be decided on the server from the `app_locale` HttpOnly cookie, with a safe `id` fallback. Do not decide initial language using `localStorage`, which causes SSR hydration mismatches.
- Reuse `LanguageSwitcher` for both public and CMS. The same-origin POST endpoint changes the cookie and redirects back to a safe local URL.
- Use locale-aware `Intl` formatters and explicitly supplied time zone for dates and currency. Backend field values and API enum codes must never be translated as storage values.
- Keep translations in a small local dictionary; do not add a heavy internationalization runtime by default.
- Add tests for translation keys, interpolation and locale validation when modifying the i18n layer.

## Server-side tables (mandatory)

- Use shared `DataTable` for recurring CMS tabular datasets. Never re-create search, pagination, sorting or fetch orchestration per page.
- Backend owns pagination, sorting, filtering and authorization; use explicit allowlists for sortable fields, stable sort, bounded page sizes and tenant filters.
- Pass `AbortSignal` to fetch. Never send a request on each keypress; debounce is mandatory.
- All visible table text and application column titles must have ID and EN translations. Do not render unsanitized HTML from API payloads.

## Notification and confirmation

- Use shared `ToastViewport` for transient feedback and `ConfirmDialog` for destructive confirmations; no browser `alert()` or `confirm()` in pages.
- Keep all labels translated in ID and EN, and never include secrets in toast messages.
- Confirming a destructive action must still be authorized by Bun backend; dialog confirmation is only UX.

## Mandatory common form controls and API error mapping

- Use `Checkbox`, `RadioGroup`, and `Switch` from `#lib/components/ui/index.ts`. NEVER place native checkbox, radio, toggle or other input markup in a route or feature component.
- Any new control must first be implemented as a reusable, accessible Svelte 5 base component, with bindable values, disabled and validation states.
- Use `mapFieldErrors` and `firstFieldError` from `#lib/helpers/index.ts` to map structured Bun backend validation payloads to field error props. Do not duplicate backend error parsing in pages.
- Preserve backend validation authority. Frontend checks only improve UX and never substitute backend authorization, input validation or tenant isolation.
- All new visible copy must be available in ID and EN. Never translate values persisted as domain/API enums.
- Do not run GitHub Actions jobs or create temporary format workflows when CI budget is unavailable. Report unrun validation accurately.

## CMS navigation, upload, and tabs

- Use shared `Tabs` for tabbed interfaces, `Breadcrumb` for hierarchical navigation, and `FileUpload` for uploads. Do not build page-local equivalents.
- UI permission checks only determine menu/button visibility. The Bun backend MUST enforce permissions and tenant isolation on every endpoint. Do not trust decoded JWT claims for authorization.
- FileUpload obtains a short-lived presigned URL from the Bun backend and uploads directly to MinIO; never embed MinIO keys or long-lived storage secrets in frontend code.
- Validate file size and MIME/type on Bun and MinIO policy as well as in the browser. Use an allowlist for presigned upload origins in real deployments. Do not claim byte-level progress unless implemented with a measurable upload transport.
- Use typed translation keys for all user-visible copy in both ID and EN. Tests and documentation are mandatory for new shared helpers.
- Until the user re-enables CI use, do not create or inspect GitHub Actions workflows; validate locally when possible and report any unresolved checks.

## Security acceptance criteria

- FileUpload MUST receive an explicit exact-origin allowlist. Never use arbitrary presigned URLs, wildcard domains, or forward cookies to object storage.
- Every restricted CMS route MUST have server-side permission verification; sidebar filtering is not authorization.
- Any shared security guard requires positive and negative regression tests. Do not treat this baseline as production certification.

## Runtime contracts and module scaffolding

- When backend response integrity matters, pass an explicit `(payload: unknown) => T` decoder as the third argument to `requestJson` rather than relying on generics alone.
- Never treat TypeScript interfaces as runtime validation. Prefer small domain-specific validators; avoid a mandatory schema runtime in the skeleton.
- Generate new frontend feature modules with `bun run make:module <kebab-name>`; adjust the Bun endpoint and validate its response before production usage.
- Never overwrite existing generated modules; use interface DTOs, and keep business validation, permission checks and tenant isolation on Bun.
- Treat `docs/RELEASE-CHECKLIST.md` as the v1.0.0 acceptance gate. CI passing does not override unchecked security and accessibility requirements.

## Cursor pagination (mandatory)

- Backend-driven lists use opaque cursor pagination by default. Use `CursorPageQuery` and `CursorPageResponse<T>`; do not send `OFFSET` or page numbers to Bun for standard list retrieval.
- DataTable stores prior cursors for Back and uses backend `nextCursor` and `hasNextPage` for Next. Reset cursors when page size, search, sort or filters change.
- Never decode, concatenate, infer or persist cursor internals in client code. Backend must sign/validate cursor scope and ensure stable ordering with a unique tie-breaker, tenant and permission filters.
- Total count is optional and may be expensive; do not require it for cursor pagination. Offset contracts are explicitly named legacy opt-ins.
- SelectAjax should use cursor pagination only for incremental large option lists; basic typeahead may return a bounded set without pagination.

## Production identity and proxy security

- Treat `/auth/me` as `unknown` and decode it with `decodeCmsIdentity` before rendering CMS or checking permissions.
- SvelteKit must never follow Bun backend redirects while forwarding cookies or authorization headers. Only root-relative internal API paths may be used.
- A valid frontend check is not a substitute for Bun endpoint permission enforcement, tenant isolation or CSRF controls. Test these against the deployed backend before handling sensitive data.
