<script lang="ts">
	export type RadioChoice = { value: string; label: string; disabled?: boolean };
	interface Props {
		label: string;
		name: string;
		options: readonly RadioChoice[];
		value?: string;
		disabled?: boolean;
		required?: boolean;
		hint?: string;
		error?: string;
	}
	let {
		label,
		name,
		options,
		value = $bindable(''),
		disabled = false,
		required = false,
		hint,
		error
	}: Props = $props();
	const id = $props.id();
</script>

<fieldset
	{disabled}
	aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
	class="space-y-2"
>
	<legend class="text-sm font-medium text-slate-800 dark:text-slate-200">{label}</legend>
	<div class="flex flex-wrap gap-4">
		{#each options as option (option.value)}
			<label class="inline-flex items-center gap-2 text-sm">
				<input
					type="radio"
					{name}
					value={option.value}
					bind:group={value}
					disabled={option.disabled}
					{required}
					class="size-4 accent-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
				/>
				<span>{option.label}</span>
			</label>
		{/each}
	</div>
	{#if error}<p id={`${id}-error`} role="alert" class="text-xs text-rose-600">{error}</p>
	{:else if hint}<p id={`${id}-hint`} class="text-xs text-slate-500">{hint}</p>{/if}
</fieldset>
