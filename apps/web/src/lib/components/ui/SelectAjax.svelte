<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { translate } from '#lib/i18n/index.ts';

	export type SelectOption = { value: string; label: string; disabled?: boolean };
	export type SearchOptions = (query: string, signal: AbortSignal) => Promise<SelectOption[]>;
	export type ResolveOption = (id: string, signal: AbortSignal) => Promise<SelectOption | null>;

	interface Props {
		label: string;
		id?: string;
		name?: string;
		value?: string | null;
		selectedOption?: SelectOption | null;
		search: SearchOptions;
		resolve?: ResolveOption;
		debounceMs?: number;
		minChars?: number;
		placeholder?: string;
		disabled?: boolean;
		required?: boolean;
		error?: string;
	}

	let {
		id,
		name,
		label,
		value = $bindable<string | null>(null),
		selectedOption = $bindable<SelectOption | null>(null),
		search,
		resolve,
		debounceMs = 350,
		minChars = 2,
		placeholder,
		disabled = false,
		required = false,
		error
	}: Props = $props();

	const generatedId = $props.id();
	const fieldId = $derived(id ?? generatedId);
	const locale = $derived(page.data.locale ?? 'id');
	let text = $state('');
	let results = $state<SelectOption[]>([]);
	let open = $state(false);
	let loading = $state(false);
	let focusedIndex = $state(-1);
	let timer: ReturnType<typeof setTimeout> | undefined;
	let controller: AbortController | undefined;
	let generation = 0;
	let hydrated = $state(false);

	onMount(() => {
		hydrated = true;
		return () => {
			clearTimeout(timer);
			controller?.abort();
			generation += 1;
		};
	});

	$effect(() => {
		if (!hydrated) return;
		const id = value;
		if (!id) {
			selectedOption = null;
			text = '';
			return;
		}
		if (selectedOption?.value === id) {
			text = selectedOption.label;
			return;
		}
		if (!resolve) return;
		const request = new AbortController();
		let stale = false;
		void resolve(id, request.signal)
			.then((option) => {
				if (stale || request.signal.aborted || value !== id) return;
				selectedOption = option?.value === id ? option : null;
				text = selectedOption?.label ?? '';
			})
			.catch((err: unknown) => {
				if (!request.signal.aborted) console.error('Failed to resolve selected option', err);
			});
		return () => {
			stale = true;
			request.abort();
		};
	});

	function onInput(event: Event) {
		text = (event.currentTarget as HTMLInputElement).value;
		if (selectedOption?.label !== text) {
			value = null;
			selectedOption = null;
		}
		clearTimeout(timer);
		controller?.abort();
		generation += 1;
		const current = generation;
		const q = text.trim();
		results = [];
		open = false;
		focusedIndex = -1;
		loading = false;
		if (q.length < minChars) return;
		timer = setTimeout(async () => {
			controller = new AbortController();
			const signal = controller.signal;
			loading = true;
			open = true;
			try {
				const found = await search(q, signal);
				if (current !== generation || signal.aborted) return;
				results = found;
			} catch (err) {
				if (!signal.aborted) {
					results = [];
					console.error('SelectAjax search failed', err);
				}
			} finally {
				if (current === generation) loading = false;
			}
		}, debounceMs);
	}

	function choose(option: SelectOption) {
		if (option.disabled) return;
		value = option.value;
		selectedOption = option;
		text = option.label;
		close();
	}

	function close() {
		open = false;
		focusedIndex = -1;
		clearTimeout(timer);
		controller?.abort();
		generation += 1;
		loading = false;
	}

	function keydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			close();
			return;
		}
		if (!open || !results.length) return;
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			focusedIndex = Math.min(results.length - 1, focusedIndex + 1);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			focusedIndex = Math.max(0, focusedIndex - 1);
		} else if (event.key === 'Enter' && focusedIndex >= 0) {
			event.preventDefault();
			const option = results[focusedIndex];
			if (option) choose(option);
		}
	}

	function blur(event: FocusEvent) {
		const next = event.relatedTarget;
		if (next instanceof Node && (event.currentTarget as HTMLElement).contains(next)) return;
		close();
	}
</script>

<div class="relative flex flex-col gap-1.5" onfocusout={blur} role="group" aria-label={label}>
	<label for={fieldId} class="text-sm font-medium">{label}</label>
	<input
		id={fieldId}
		type="text"
		role="combobox"
		autocomplete="off"
		aria-autocomplete="list"
		aria-expanded={open}
		aria-controls={`${fieldId}-options`}
		aria-activedescendant={open && focusedIndex >= 0
			? `${fieldId}-option-${focusedIndex}`
			: undefined}
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={error ? `${fieldId}-error` : undefined}
		value={text}
		oninput={onInput}
		onkeydown={keydown}
		placeholder={placeholder ?? translate(locale, 'common.search')}
		{disabled}
		{required}
		class="min-h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
	/>
	{#if name}<input type="hidden" {name} value={value ?? ''} />{/if}
	{#if open}
		<div
			id={`${fieldId}-options`}
			role="listbox"
			class="absolute top-full z-40 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900"
		>
			{#if loading}
				<p role="status" class="px-3 py-2 text-sm text-slate-500">
					{translate(locale, 'common.loading')}
				</p>
			{:else if results.length === 0}
				<p class="px-3 py-2 text-sm text-slate-500">{translate(locale, 'common.noResults')}</p>
			{:else}
				{#each results as option, index (option.value)}
					<button
						type="button"
						id={`${fieldId}-option-${index}`}
						role="option"
						aria-selected={value === option.value}
						disabled={option.disabled}
						tabindex="-1"
						onmousedown={(e) => e.preventDefault()}
						onclick={() => choose(option)}
						class={`block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-indigo-50 dark:hover:bg-slate-800 ${focusedIndex === index ? 'bg-indigo-50 dark:bg-slate-800' : ''}`}
					>
						{option.label}
					</button>
				{/each}
			{/if}
		</div>
	{/if}
	{#if error}<p id={`${fieldId}-error`} role="alert" class="text-xs text-rose-600">{error}</p>{/if}
</div>
