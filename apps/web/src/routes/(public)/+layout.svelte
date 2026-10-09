<script lang="ts">
	import LanguageSwitcher from '#lib/components/LanguageSwitcher.svelte';
	import { page } from '$app/state';
	import { translate } from '#lib/i18n/index.ts';
	import ThemeToggle from '#lib/components/ThemeToggle.svelte';
	import { appConfig } from '#lib/config/app.ts';

	let { children } = $props();
</script>

<svelte:head>
	<title>{appConfig.name}</title>
	<meta name="description" content={appConfig.description} />
</svelte:head>

<div class="min-h-screen text-slate-900 dark:text-slate-100">
	<header
		class="sticky top-0 z-20 border-b border-slate-200/80 bg-white/75 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/75"
	>
		<div class="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
			<a
				href="/"
				class="group flex items-center gap-3 font-semibold tracking-tight"
				aria-label="Svelte Skeleton home"
			>
				<span
					class="grid size-9 place-items-center rounded-xl bg-slate-950 text-sm font-bold text-white shadow-sm dark:bg-white dark:text-slate-950"
					>S</span
				>
				<span>{appConfig.name}</span>
			</a>

			<div class="flex items-center gap-2">
				<a
					href={appConfig.repository}
					class="hidden rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 sm:inline-flex dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
					target="_blank"
					rel="noreferrer">GitHub</a
				>
				<LanguageSwitcher />
				<ThemeToggle />
			</div>
		</div>
	</header>

	<main>{@render children()}</main>

	<footer class="border-t border-slate-200/80 dark:border-slate-800/80">
		<div
			class="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 dark:text-slate-400"
		>
			<p>{translate(page.data.locale ?? 'id', 'footer.description')}</p>
			<p>{translate(page.data.locale ?? 'id', 'footer.tagline')}</p>
		</div>
	</footer>
</div>
