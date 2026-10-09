<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
		header?: Snippet;
		footer?: Snippet;
		class?: string;
	}

	let { children, header, footer, class: className = '' }: Props = $props();
</script>

<section
	class={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}
>
	{#if header}
		<div class="border-b border-slate-200 px-5 py-4 dark:border-slate-800">{@render header()}</div>
	{/if}
	<div class="p-5">
		{#if children}{@render children()}{/if}
	</div>
	{#if footer}
		<div class="border-t border-slate-200 px-5 py-4 dark:border-slate-800">{@render footer()}</div>
	{/if}
</section>
