<script lang="ts">
	import type { Snippet } from 'svelte';
	type TabItem = { value: string; label: string; disabled?: boolean };
	interface Props {
		items: readonly TabItem[];
		value?: string;
		children: Snippet<[string]>;
		label: string;
	}
	let { items, value = $bindable(''), children, label }: Props = $props();
	const uid = $props.id();
	const active = $derived(
		items.find((item) => item.value === value && !item.disabled)?.value ??
			items.find((item) => !item.disabled)?.value ??
			''
	);
	function move(event: KeyboardEvent, index: number) {
		const enabled = items.filter((item) => !item.disabled);
		if (!enabled.length) return;
		const current = enabled.findIndex((item) => item.value === items[index]?.value);
		const next =
			event.key === 'ArrowRight'
				? current + 1
				: event.key === 'ArrowLeft'
					? current - 1
					: event.key === 'Home'
						? 0
						: event.key === 'End'
							? enabled.length - 1
							: -1;
		if (next === -1) return;
		event.preventDefault();
		value = enabled[(next + enabled.length) % enabled.length].value;
		const parent = (event.currentTarget as HTMLElement).parentElement;
		const selected = parent?.querySelector<HTMLElement>('[aria-selected="true"]');
		selected?.focus();
	}
</script>

<div class="space-y-4">
	<div
		role="tablist"
		aria-label={label}
		class="flex gap-1 border-b border-slate-200 dark:border-slate-700"
	>
		{#each items as item, index (item.value)}
			<button
				id={`${uid}-tab-${item.value}`}
				type="button"
				role="tab"
				aria-controls={`${uid}-panel-${item.value}`}
				aria-selected={active === item.value}
				tabindex={active === item.value ? 0 : -1}
				disabled={item.disabled}
				onclick={() => (value = item.value)}
				onkeydown={(e) => move(e, index)}
				class={`border-b-2 px-4 py-2 text-sm focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:opacity-50 ${active === item.value ? 'border-indigo-600 font-semibold' : 'border-transparent'}`}
				>{item.label}</button
			>
		{/each}
	</div>
	<div
		id={`${uid}-panel-${active}`}
		role="tabpanel"
		aria-labelledby={`${uid}-tab-${active}`}
		tabindex="0"
	>
		{@render children(active)}
	</div>
</div>
