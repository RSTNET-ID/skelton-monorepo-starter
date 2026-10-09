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
	<div class="flex items-start gap-3">
		<input
			{...rest}
			id={inputId}
			type="checkbox"
			bind:checked
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
			class={`mt-1 size-4 accent-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50 ${className}`}
		/>
		<label for={inputId} class="text-sm font-medium text-slate-800 dark:text-slate-200"
			>{label}</label
		>
	</div>
	{#if error}<p id={`${inputId}-error`} role="alert" class="text-xs text-rose-600">{error}</p>
	{:else if hint}<p id={`${inputId}-hint`} class="text-xs text-slate-500">{hint}</p>{/if}
</div>
