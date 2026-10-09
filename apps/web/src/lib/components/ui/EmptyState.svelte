<script lang="ts">
	import type { Snippet } from 'svelte';
	interface Props {
		title: string;
		description?: string;
		action?: Snippet;
	}
	let { title, description, action }: Props = $props();
</script>

<div
	class="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center dark:border-slate-700"
>
	<div
		class="mb-4 grid size-12 place-items-center rounded-2xl bg-slate-100 text-xl text-slate-500 dark:bg-slate-800"
	>
		∅
	</div>
	<h3 class="font-semibold text-slate-900 dark:text-white">{title}</h3>
	{#if description}<p class="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
			{description}
		</p>{/if}
	{#if action}<div class="mt-5">{@render action()}</div>{/if}
</div>
