<script lang="ts">
	import { onMount } from 'svelte';
	import Sun from '@lucide/svelte/icons/sun';
	import Moon from '@lucide/svelte/icons/moon';

	let dark = $state(false);

	function applyTheme(value: boolean) {
		dark = value;
		document.documentElement.classList.toggle('dark', value);
		localStorage.setItem('theme', value ? 'dark' : 'light');
	}

	onMount(() => {
		const stored = localStorage.getItem('theme');
		const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches;
		dark = stored ? stored === 'dark' : preferred;
		document.documentElement.classList.toggle('dark', dark);
	});
</script>

<button
	type="button"
	class="inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
	onclick={() => applyTheme(!dark)}
	aria-label={dark ? 'Use light theme' : 'Use dark theme'}
	title={dark ? 'Use light theme' : 'Use dark theme'}
>
	{#if dark}
		<Sun size={20} aria-hidden="true" />
	{:else}
		<Moon size={20} aria-hidden="true" />
	{/if}
</button>
