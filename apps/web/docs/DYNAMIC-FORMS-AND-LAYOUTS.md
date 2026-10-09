# Dynamic forms and layouts

## Route groups

- `src/routes/+layout.svelte`: global CSS only
- `src/routes/(public)/+layout.svelte`: public website chrome
- `src/routes/(public)/+page.svelte`: landing page at `/`
- `src/routes/(public)/login/+page.svelte`: Bun auth integration placeholder
- `src/routes/(cms)/cms/+layout.svelte`: CMS sidebar/header
- `src/routes/(cms)/cms/+layout.server.ts`: server-side authentication guard through Bun `/auth/me`
- `src/routes/(cms)/cms/components/+page.svelte`: private component examples

Route groups in parentheses do not appear in URL paths. The example CMS guard requires a functional Bun /auth/me endpoint. It denies access if the backend cannot authenticate the caller. Real login/logout/session, CSRF mitigation and route-level permissions must be implemented per project.

## AutoNumericInput

```svelte
<script lang="ts">
	import { AutoNumericInput } from '#lib/components/ui/index.ts';
	let amount = $state<string | null>('125000');
	let percent = $state<string | null>('12.5');
</script>

<AutoNumericInput label="Nominal" kind="currency" name="amount" bind:value={amount} />
<AutoNumericInput
	label="Diskon"
	kind="percent"
	name="discount"
	bind:value={percent}
	minimumValue="0"
	maximumValue="100"
/>
```

Formatting defaults use Indonesian thousands and decimal separators. Values are raw decimal strings. A 12.5 percent value emits `12.5` (not 0.125). Use decimal-safe arithmetic for money in the backend, never depend on UI validation alone.

## DatePicker

```svelte
<DatePicker label="Tanggal" bind:value={date} />
<DatePicker label="Periode" mode="range" bind:value={period} />
<DatePicker label="Jam" timeOnly bind:value={time} />
<DatePicker label="Jadwal" enableTime bind:value={startsAt} />
```

Single, range and multiple supported. Time-only defaults to 24-hour H:i. Range emits flatpickr's formatted range string; parse into structured start/end at the API boundary. Date-only values are not UTC instants.

## SelectAjax

Provide callbacks to keep the component backend-agnostic.

```ts
type SelectOption = { value: string; label: string; disabled?: boolean };
type SearchOptions = (query: string, signal: AbortSignal) => Promise<SelectOption[]>;
type ResolveOption = (id: string, signal: AbortSignal) => Promise<SelectOption | null>;
```

`search(query, signal)` runs after a debounce (default 350 ms) and two typed characters. Pending request is aborted when text changes; outdated responses are ignored. `resolve(id, signal)` fetches the initial option label for edit forms, while `selectedOption` can seed a resolved option. `value` stores the ID, never its label. Backend search should enforce authorization, indexing, paging and a result limit.

## Mandatory component rule

Pages MUST NOT use native `input`, `select`, or `textarea` elements directly. Build the appropriate base component first; then import from `#lib/components/ui/index.ts`. See `AGENTS.md`.

## Helpers

Reusable pure utilities live in `src/lib/helpers`. Helpers are imported from `#lib/helpers/index.ts`; do not duplicate implementations in feature folders without an explicit domain-specific reason.

## Regular Select vs SelectAjax

Use `Select` for provided/local options; use `SelectAjax` when options are fetched and searched from Bun. Both are reusable and bind their selected value. Example:

```svelte
<script lang="ts">
	import { Select } from '#lib/components/ui/index.ts';
	let status = $state('active');
	const options = [
		{ value: 'active', label: 'Aktif' },
		{ value: 'inactive', label: 'Nonaktif' }
	];
</script>

<Select label="Status" name="status" {options} bind:value={status} />
```
