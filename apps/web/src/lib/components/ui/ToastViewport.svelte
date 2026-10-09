<script lang="ts">
	import { page } from '$app/state';
	import { translate } from '#lib/i18n/index.ts';
	import { Button } from './index.ts';

	export type ToastItem = {
		id: string;
		message: string;
		tone?: 'info' | 'success' | 'warning' | 'danger';
	};
	interface Props {
		items: readonly ToastItem[];
		dismiss: (id: string) => void;
	}
	let { items, dismiss }: Props = $props();
	const locale = $derived(page.data.locale ?? 'id');
</script>

<div
	class="pointer-events-none fixed bottom-5 right-5 z-50 flex w-[min(24rem,calc(100vw-2.5rem))] flex-col gap-2"
	aria-live="polite"
>
	{#each items as item (item.id)}
		<div
			role={item.tone === 'danger' ? 'alert' : 'status'}
			class="pointer-events-auto flex items-start justify-between gap-3 rounded-xl border border-slate-300 bg-white p-4 text-sm shadow-lg dark:border-slate-700 dark:bg-slate-900"
		>
			<span>{item.message}</span>
			<Button
				variant="ghost"
				size="sm"
				aria-label={translate(locale, 'common.close')}
				onclick={() => dismiss(item.id)}>×</Button
			>
		</div>
	{/each}
</div>
