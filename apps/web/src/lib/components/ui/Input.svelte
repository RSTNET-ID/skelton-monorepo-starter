<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	interface Props extends Omit<HTMLInputAttributes, 'size'> {
		label: string;
		hint?: string;
		error?: string;
		value?: string;
	}

	let {
		id,
		label,
		hint,
		error,
		value = $bindable(''),
		required = false,
		disabled = false,
		class: className = '',
		...rest
	}: Props = $props();

	const generatedId = $props.id();
	const inputId = $derived(id ?? generatedId);
</script>

<div class="flex flex-col gap-1.5">
	<label for={inputId} class="text-sm font-medium text-slate-800 dark:text-slate-200">
		{label}{#if required}<span class="ml-1 text-rose-600" aria-hidden="true">*</span>{/if}
	</label>
	<input
		{...rest}
		id={inputId}
		bind:value
		{required}
		{disabled}
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
		class={`min-h-10 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white ${error ? 'border-rose-500 dark:border-rose-500' : ''} ${className}`}
	/>
	{#if error}
		<p id={`${inputId}-error`} class="text-xs text-rose-600" role="alert">{error}</p>
	{:else if hint}
		<p id={`${inputId}-hint`} class="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
	{/if}
</div>
