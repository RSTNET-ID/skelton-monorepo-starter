<script lang="ts">
	import type { Snippet } from 'svelte';

	type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
	interface Props {
		tone?: Tone;
		children?: Snippet;
		class?: string;
	}

	let { tone = 'neutral', children, class: className = '' }: Props = $props();

	const tones: Record<Tone, string> = {
		neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
		info: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
		success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
		warning: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300',
		danger: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
	};
</script>

<span
	class={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]} ${className}`}
>
	{#if children}{@render children()}{/if}
</span>
