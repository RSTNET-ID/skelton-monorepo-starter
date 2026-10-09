<script lang="ts">
	import { onMount } from 'svelte';
	import type { Instance } from 'flatpickr/dist/types/instance';
	import type { BaseOptions } from 'flatpickr/dist/types/options';

	type Mode = 'single' | 'range' | 'multiple';
	interface Props {
		id?: string;
		name?: string;
		label: string;
		value?: string;
		mode?: Mode;
		timeOnly?: boolean;
		enableTime?: boolean;
		dateFormat?: string;
		minDate?: string;
		maxDate?: string;
		disabled?: boolean;
		required?: boolean;
		placeholder?: string;
		error?: string;
		options?: Partial<BaseOptions>;
	}
	let {
		id,
		name,
		label,
		value = $bindable(''),
		mode = 'single',
		timeOnly = false,
		enableTime = false,
		dateFormat,
		minDate,
		maxDate,
		disabled = false,
		required = false,
		placeholder,
		error,
		options = {}
	}: Props = $props();

	const generatedId = $props.id();
	const fieldId = $derived(id ?? generatedId);
	let input: HTMLInputElement;
	let calendar: Instance | undefined;
	let applying = false;

	onMount(() => {
		let mounted = true;
		void Promise.all([import('flatpickr'), import('flatpickr/dist/flatpickr.min.css')]).then(
			([mod]) => {
				if (!mounted) return;
				const flatpickr = mod.default;
				calendar = flatpickr(input, {
					mode,
					enableTime: enableTime || timeOnly,
					noCalendar: timeOnly,
					time_24hr: true,
					dateFormat: dateFormat ?? (timeOnly ? 'H:i' : enableTime ? 'Y-m-d H:i' : 'Y-m-d'),
					...(minDate ? { minDate } : {}),
					...(maxDate ? { maxDate } : {}),
					defaultDate: value || undefined,
					...options,
					onChange: (_dates, formatted) => {
						if (!applying) value = formatted;
					}
				});
			}
		);
		return () => {
			mounted = false;
			calendar?.destroy();
		};
	});

	$effect(() => {
		if (!calendar) return;
		const selected = calendar.input.value;
		if (selected !== value) {
			applying = true;
			calendar.setDate(value || [], false);
			applying = false;
		}
	});
</script>

<div class="flex flex-col gap-1.5">
	<label for={fieldId} class="text-sm font-medium">{label}</label>
	<input
		bind:this={input}
		id={fieldId}
		type="text"
		{disabled}
		{required}
		{placeholder}
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={error ? `${fieldId}-error` : undefined}
		class="min-h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
	/>
	{#if name}<input type="hidden" {name} {value} />{/if}
	{#if error}<p id={`${fieldId}-error`} role="alert" class="text-xs text-rose-600">{error}</p>{/if}
</div>
