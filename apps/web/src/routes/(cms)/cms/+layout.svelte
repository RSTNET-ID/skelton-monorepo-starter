<script lang="ts">
	import LanguageSwitcher from '#lib/components/LanguageSwitcher.svelte';
	import { translate } from '#lib/i18n/index.ts';
	import ThemeToggle from '#lib/components/ThemeToggle.svelte';
	import { Button, Breadcrumb } from '#lib/components/ui/index.ts';
	import { canAccess } from '#lib/helpers/permissions.ts';
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';
	import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
	import PanelsTopLeft from '@lucide/svelte/icons/panels-top-left';
	import Menu from '@lucide/svelte/icons/menu';

	let { children }: { children: Snippet } = $props();
	let mobileOpen = $state(false);
	const permissions = $derived(page.data.user?.permissions ?? []);
	const menu = [
		{ href: '/cms', title: 'nav.dashboard', icon: LayoutDashboard, permission: undefined },
		{
			href: '/cms/components',
			title: 'nav.components',
			icon: PanelsTopLeft,
			permission: 'cms.components.read'
		}
	];
	const visibleMenu = $derived(menu.filter((item) => canAccess(permissions, item.permission)));
</script>

<svelte:head><meta name="robots" content="noindex, nofollow" /></svelte:head>

<div class="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
	{#if mobileOpen}
		<Button
			variant="ghost"
			class="fixed inset-0 z-30 h-full w-full rounded-none bg-black/50 hover:bg-black/50 lg:hidden"
			aria-label="Tutup navigasi"
			onclick={() => (mobileOpen = false)}
		/>
	{/if}
	<aside
		class={`fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white p-5 transition-transform lg:translate-x-0 dark:border-slate-800 dark:bg-slate-900 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
	>
		<a href="/cms" class="flex items-center gap-2 text-lg font-bold"
			><span class="rounded-lg bg-indigo-600 px-2 py-1 text-white">S</span> Skeleton CMS</a
		>
		<nav aria-label="Navigasi CMS" class="mt-10 space-y-1">
			{#each visibleMenu as item (item.href)}
				<a
					href={item.href}
					onclick={() => (mobileOpen = false)}
					aria-current={page.url.pathname === item.href ? 'page' : undefined}
					class={`block rounded-xl px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 ${page.url.pathname === item.href ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' : ''}`}
				>
					<item.icon
						size={17}
						aria-hidden="true"
						class="mr-2 inline-block align-text-bottom"
					/>{translate(
						page.data.locale ?? 'id',
						item.title as 'nav.dashboard' | 'nav.components'
					)}</a
				>
			{/each}
		</nav>
		<p class="absolute bottom-6 text-xs text-slate-500">Backend: Bun API</p>
	</aside>
	<div class="lg:pl-64">
		<header
			class="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90"
		>
			<div class="flex items-center gap-3">
				<Button
					variant="outline"
					size="sm"
					class="lg:hidden"
					aria-label="Buka navigasi"
					aria-expanded={mobileOpen}
					onclick={() => (mobileOpen = true)}><Menu size={18} aria-hidden="true" /></Button
				>
				<span class="text-sm font-semibold">{translate(page.data.locale ?? 'id', 'cms.title')}</span
				>
			</div>
			<div class="flex items-center gap-3">
				<a href="/" class="text-sm text-indigo-600 dark:text-indigo-300"
					>{translate(page.data.locale ?? 'id', 'nav.website')}</a
				><LanguageSwitcher /><ThemeToggle />
			</div>
		</header>
		<main class="mx-auto max-w-7xl space-y-5 px-5 py-8 sm:px-8">
			<Breadcrumb
				items={[
					{ label: translate(page.data.locale ?? 'id', 'nav.dashboard'), href: '/cms' },
					...(page.url.pathname === '/cms'
						? []
						: [{ label: translate(page.data.locale ?? 'id', 'nav.components') }])
				]}
			/>
			{@render children()}
		</main>
	</div>
</div>
