<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	interface Props extends Omit<HTMLInputAttributes, 'type' | 'checked' | 'size'> {
		label: string;
		checked?: boolean;
		hint?: string;
		error?: string;
	}
	let {
		id,
		label,
		checked = $bindable(false),
		hint,
		error,
		class: className = '',
		...rest
	}: Props = $props();
	const generated = $props.id();
	const inputId = $derived(id ?? generated);
</script>

<div class="space-y-1">
	<div class="flex items-center justify-between gap-4">
		<label for={inputId} class="text-sm font-medium text-slate-800 dark:text-slate-200"
			>{label}</label
		>
		<input
			{...rest}
			id={inputId}
			type="checkbox"
			role="switch"
			bind:checked
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
			class={`relative h-6 w-11 cursor-pointer appearance-none rounded-full bg-slate-300 transition-colors before:absolute before:left-1 before:top-1 before:size-4 before:rounded-full before:bg-white before:shadow before:transition-transform checked:bg-indigo-600 checked:before:translate-x-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-700 dark:checked:bg-indigo-500 ${className}`}
		/>
	</div>
	{#if error}<p id={`${inputId}-error`} role="alert" class="text-xs text-rose-600">{error}</p>
	{:else if hint}<p id={`${inputId}-hint`} class="text-xs text-slate-500">{hint}</p>{/if}
</div>
