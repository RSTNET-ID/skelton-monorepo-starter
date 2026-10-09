<script lang="ts">
	import { page } from '$app/state';
	import { translate } from '#lib/i18n/index.ts';
	export type BreadcrumbItem = { label: string; href?: string };
	interface Props {
		items: readonly BreadcrumbItem[];
	}
	let { items }: Props = $props();
	const locale = $derived(page.data.locale ?? 'id');
</script>

<nav
	aria-label={translate(locale, 'nav.breadcrumb')}
	class="text-sm text-slate-500 dark:text-slate-400"
>
	<ol class="flex flex-wrap items-center gap-2">
		{#each items as item, i (i)}
			{#if i > 0}<li aria-hidden="true">/</li>{/if}
			<li>
				{#if item.href && i !== items.length - 1}
					<a href={item.href} class="hover:text-indigo-600 hover:underline">{item.label}</a>
				{:else}
					<span
						aria-current={i === items.length - 1 ? 'page' : undefined}
						class="font-medium text-slate-900 dark:text-white">{item.label}</span
					>
				{/if}
			</li>
		{/each}
	</ol>
</nav>
