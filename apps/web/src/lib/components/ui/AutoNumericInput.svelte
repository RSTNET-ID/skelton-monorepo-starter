<script lang="ts">
	import { onMount } from 'svelte';
	import type AutoNumericType from 'autonumeric';
	import type { Options } from 'autonumeric';

	type Kind = 'currency' | 'percent' | 'number';
	interface Props {
		id?: string;
		name?: string;
		label: string;
		value?: string | null;
		kind?: Kind;
		currencySymbol?: string;
		decimalPlaces?: number;
		minimumValue?: string;
		maximumValue?: string;
		disabled?: boolean;
		required?: boolean;
		placeholder?: string;
		error?: string;
		options?: Options;
	}
	let {
		id,
		name,
		label,
		value = $bindable<string | null>(null),
		kind = 'currency',
		currencySymbol = 'Rp ',
		decimalPlaces = 2,
		minimumValue,
		maximumValue,
		disabled = false,
		required = false,
		placeholder,
		error,
		options = {}
	}: Props = $props();

	const generatedId = $props.id();
	const fieldId = $derived(id ?? generatedId);
	let element: HTMLInputElement;
	let instance: AutoNumericType | undefined;
	let applying = false;

	onMount(() => {
		let mounted = true;
		// Keep the optional browser-only formatter out of the SSR bundle.
		void import('autonumeric').then(({ default: AutoNumeric }) => {
			if (!mounted) return;
			instance = new AutoNumeric(element, value ?? '', {
				digitGroupSeparator: '.',
				decimalCharacter: ',',
				decimalPlaces,
				currencySymbol: kind === 'currency' ? currencySymbol : '',
				suffixText: kind === 'percent' ? '%' : '',
				...(minimumValue !== undefined ? { minimumValue } : {}),
				...(maximumValue !== undefined ? { maximumValue } : {}),
				modifyValueOnWheel: false,
				...options
			});
			element.addEventListener('autoNumeric:rawValueModified', sync);
		});
		return () => {
			mounted = false;
			element.removeEventListener('autoNumeric:rawValueModified', sync);
			instance?.remove();
		};
	});

	function sync() {
		if (!instance || applying) return;
		value = instance.getNumericString() || null;
	}

	$effect(() => {
		if (!instance) return;
		const next = value ?? '';
		if (instance.getNumericString() !== next) {
			applying = true;
			instance.set(next);
			applying = false;
		}
	});
</script>

<div class="flex flex-col gap-1.5">
	<label for={fieldId} class="text-sm font-medium">{label}</label>
	<input
		bind:this={element}
		id={fieldId}
		type="text"
		inputmode="decimal"
		{disabled}
		{required}
		{placeholder}
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={error ? `${fieldId}-error` : undefined}
		class="min-h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
	/>
	{#if name}<input type="hidden" {name} value={value ?? ''} />{/if}
	{#if error}<p id={`${fieldId}-error`} role="alert" class="text-xs text-rose-600">{error}</p>{/if}
</div>
