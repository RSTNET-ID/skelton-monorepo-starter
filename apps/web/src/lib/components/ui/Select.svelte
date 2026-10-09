<script lang="ts">
	import type { HTMLSelectAttributes } from 'svelte/elements';

	export type SelectItem = { value: string; label: string; disabled?: boolean };
	interface Props extends Omit<HTMLSelectAttributes, 'value' | 'size' | 'children'> {
		label: string;
		value?: string;
		options: readonly SelectItem[];
		placeholder?: string;
		hint?: string;
		error?: string;
	}
	let {
		id,
		label,
		value = $bindable(''),
		options,
		placeholder = 'Pilih opsi',
		hint,
		error,
		required = false,
		disabled = false,
		class: className = '',
		...rest
	}: Props = $props();

	const uniqueId = $props.id();
	const fieldId = $derived(id ?? uniqueId);
</script>

<div class="flex flex-col gap-1.5">
	<label for={fieldId} class="text-sm font-medium text-slate-800 dark:text-slate-200">{label}</label
	>
	<select
		{...rest}
		id={fieldId}
		bind:value
		{required}
		{disabled}
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
		class={`min-h-10 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white ${className}`}
	>
		<option value="" disabled={required}>{placeholder}</option>
		{#each options as option (option.value)}
			<option value={option.value} disabled={option.disabled}>{option.label}</option>
		{/each}
	</select>
	{#if error}<p id={`${fieldId}-error`} role="alert" class="text-xs text-rose-600">{error}</p>
	{:else if hint}<p id={`${fieldId}-hint`} class="text-xs text-slate-500">{hint}</p>{/if}
</div>
