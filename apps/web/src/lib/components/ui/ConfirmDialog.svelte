<script lang="ts">
	import { page } from '$app/state';
	import { tick } from 'svelte';
	import { translate } from '#lib/i18n/index.ts';
	import Button from './Button.svelte';

	interface Props {
		open?: boolean;
		title: string;
		description: string;
		busy?: boolean;
		destructive?: boolean;
		onconfirm: () => void | Promise<void>;
		oncancel: () => void;
	}
	let {
		open = false,
		title,
		description,
		busy = false,
		destructive = false,
		onconfirm,
		oncancel
	}: Props = $props();
	const locale = $derived(page.data.locale ?? 'id');
	const uid = $props.id();
	let dialog: HTMLDivElement;

	$effect(() => {
		if (!open) return;
		const previouslyFocused =
			document.activeElement instanceof HTMLElement ? document.activeElement : null;
		void tick().then(() => {
			if (open) dialog?.focus();
		});
		function handleKey(event: KeyboardEvent) {
			if (event.key === 'Escape' && !busy) {
				event.preventDefault();
				oncancel();
				return;
			}
			if (event.key !== 'Tab' || !dialog) return;
			const focusable = Array.from(
				dialog.querySelectorAll<HTMLElement>(
					'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
				)
			);
			if (!focusable.length) {
				event.preventDefault();
				dialog.focus();
				return;
			}
			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			if (
				event.shiftKey &&
				(document.activeElement === first || document.activeElement === dialog)
			) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		}
		document.addEventListener('keydown', handleKey);
		return () => {
			document.removeEventListener('keydown', handleKey);
			previouslyFocused?.focus();
		};
	});
</script>

{#if open}
	<div class="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4">
		<div
			bind:this={dialog}
			role="alertdialog"
			tabindex="-1"
			aria-modal="true"
			aria-labelledby={`${uid}-title`}
			aria-describedby={`${uid}-description`}
			class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"
		>
			<h2 id={`${uid}-title`} class="text-lg font-bold">{title}</h2>
			<p id={`${uid}-description`} class="mt-2 text-sm text-slate-600 dark:text-slate-300">
				{description}
			</p>
			<div class="mt-6 flex justify-end gap-2">
				<Button variant="outline" disabled={busy} onclick={oncancel}
					>{translate(locale, 'common.cancel')}</Button
				>
				<Button
					variant={destructive ? 'danger' : 'primary'}
					loading={busy}
					onclick={() => void onconfirm()}>{translate(locale, 'common.confirm')}</Button
				>
			</div>
		</div>
	</div>
{/if}
