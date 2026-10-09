<script lang="ts">
	import { page } from '$app/state';
	import { translate } from '#lib/i18n/index.ts';
	let { data } = $props();
</script>

<svelte:head><title>Dashboard · Skeleton CMS</title></svelte:head>
<div class="space-y-5">
	<div>
		<p class="text-sm text-indigo-600 dark:text-indigo-400">Dashboard</p>
		<h1 class="mt-1 text-3xl font-bold">
			{translate(page.data.locale ?? 'id', 'cms.welcome', { name: data.user.name })}
		</h1>
	</div>
	<p class="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
		Layout CMS dipisahkan dari website publik. Server-side guard memverifikasi session melalui
		backend Bun.
	</p>
	<a
		href="/cms/components"
		class="inline-flex rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white"
		>Komponen Form Dinamis</a
	>
</div>
