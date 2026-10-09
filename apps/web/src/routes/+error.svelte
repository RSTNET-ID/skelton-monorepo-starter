<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status} · Svelte Skeleton</title>
</svelte:head>

<section class="mx-auto flex min-h-[65vh] max-w-3xl items-center px-5 py-16 sm:px-8">
	<div>
		<p class="font-mono text-sm font-semibold text-indigo-600 dark:text-indigo-400">
			HTTP {page.status}
		</p>
		<h1 class="mt-3 text-4xl font-bold tracking-tight dark:text-white">
			The request did not make it.
		</h1>
		<p class="mt-4 max-w-xl text-slate-600 dark:text-slate-300">
			{page.error?.message ?? 'An unexpected error occurred.'}
		</p>
		{#if page.error?.errorId}
			<p class="mt-3 font-mono text-xs text-slate-500 dark:text-slate-400">
				Error ID: {page.error.errorId}
			</p>
		{/if}
		<a
			href="/"
			class="mt-8 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
			>Back home</a
		>
	</div>
</section>
