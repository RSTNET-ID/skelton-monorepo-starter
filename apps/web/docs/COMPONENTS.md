# Base UI Components

Reusable primitives live at `src/lib/components/ui` and are re-exported from `src/lib/components/ui/index.ts`.

## Included

| Component    | Responsibility                                                        |
| ------------ | --------------------------------------------------------------------- |
| `Button`     | Primary/secondary/outline/ghost/danger actions, sizes, loading state  |
| `Input`      | Accessible labeled input with two-way binding and validation feedback |
| `Textarea`   | Accessible labeled multiline field with validation feedback           |
| `Badge`      | Small neutral/info/success/warning/danger status                      |
| `Card`       | Content container with optional header/footer snippets                |
| `Alert`      | Inline informational and error feedback                               |
| `Spinner`    | Progress state with accessible status text                            |
| `EmptyState` | No-results screen with an optional action snippet                     |

## Usage

```svelte
<script lang="ts">
	import { Button, Input, Card, Badge } from '#lib/components/ui/index.ts';

	let query = $state('');
</script>

<Card>
	{#snippet header()}<h2>Search</h2>{/snippet}
	<Input label="Search term" bind:value={query} placeholder="Type something" />
	<div class="mt-4 flex items-center gap-3">
		<Button onclick={() => console.log(query)}>Search</Button>
		<Badge tone="info">Ready</Badge>
	</div>
</Card>
```

See [`/components`](../src/routes/components/+page.svelte) for a live gallery.

## API conventions

- Components use native HTML attributes where appropriate (for example `onclick`, `autocomplete`, `name`, `required`).
- Svelte 5: use `children` snippets and named snippets rather than old slots.
- `Input` and `Textarea` support `bind:value` for client-side state.
- Field-level `error` text sets `aria-invalid` and is linked via `aria-describedby`.
- Buttons default to `type="button"` to prevent accidental form submission.
- Loading buttons become disabled and expose `aria-busy`.
- Cards accept named `header` and `footer` snippets.
- Favor semantic markup and keyboard interaction over custom interactive divs.

## Design rules

- Styling is via Tailwind 4 utilities with complete class strings in variant maps.
- Responsive layouts belong in route/feature compositions; base controls stay compact.
- Light and dark themes are supported.
- Keep form validation logic at the feature/action/backend boundary. UI controls show feedback; they do not own domain rules.
- Do not add heavyweight component frameworks by default.
- A component gallery is documentation, not proof of accessibility. Audit interactions and screen readers when introducing complex controls.

## Extending

Implement new primitives only when reused by multiple pages. Complex interactions such as comboboxes, date pickers, menus, dialogs, virtualized tables and multi-selects should use tested accessible building blocks when needed, not rushed custom ARIA widgets.

## Icons

Use lightweight Lucide SVG icons through **per-icon subpath imports**:

```svelte
<script lang="ts">
	import Search from '@lucide/svelte/icons/search';
	import { Button } from '#lib/components/ui/index.ts';
</script>

<Button aria-label="Cari"><Search size={18} aria-hidden="true" /></Button>
```

Do not import the entire icon library, use remote icon fonts, or preload the icon catalog. This keeps SSR and route bundles lean. SVG icons can be tree-shaken individually. Size/stroke/color are component props; prefer `currentColor` for theming.

## Additional form primitives

- `Checkbox`: native accessible checkbox wrapped in a typed Svelte 5 component with `bind:checked`, label, hint and error.
- `Switch`: semantic native checkbox with `role="switch"`, `bind:checked` and disabled/validation states.
- `RadioGroup`: fieldset/legend group with a shared `name`, bindable selected string and configurable choices.
- `mapFieldErrors(payload)`: maps `{ fields: { email: ['Invalid'] } }` or `{ errors: ... }` from Bun to typed field-error arrays; `firstFieldError(errors, 'email')` selects the first message for display.

All form primitives are usable from public and CMS pages and do not depend on domain-specific field names or backend endpoints. Keep labels translated at the calling page via `translate(locale, key)`.
