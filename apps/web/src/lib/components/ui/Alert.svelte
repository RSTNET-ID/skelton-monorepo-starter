<script lang="ts">
	import type { Snippet } from 'svelte';

	type Tone = 'info' | 'success' | 'warning' | 'danger';
	interface Props {
		tone?: Tone;
		title?: string;
		children?: Snippet;
		class?: string;
	}

	let { tone = 'info', title, children, class: className = '' }: Props = $props();

	const tones: Record<Tone, string> = {
		info: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200',
		success:
			'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200',
		warning:
			'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200',
		danger:
			'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200'
	};
</script>

<div
	role={tone === 'danger' ? 'alert' : 'status'}
	class={`rounded-xl border p-4 text-sm ${tones[tone]} ${className}`}
>
	{#if title}<p class="mb-1 font-semibold">{title}</p>{/if}
	{#if children}<div class="leading-6">{@render children()}</div>{/if}
</div>
