<script lang="ts">
	import { page } from '$app/state';
	import { translate } from '#lib/i18n/index.ts';
	import Button from './Button.svelte';
	import { validateUploadOrigin } from '#lib/helpers/upload.ts';
	type UploadTicket = {
		uploadUrl: string;
		method?: 'PUT';
		headers?: Record<string, string>;
		objectKey: string;
	};
	interface Props {
		label: string;
		requestTicket: (file: File, signal: AbortSignal) => Promise<UploadTicket>;
		complete?: (ticket: UploadTicket, file: File, signal: AbortSignal) => Promise<void>;
		maxBytes?: number;
		allowedUploadOrigins: readonly string[];
		accept?: string;
		disabled?: boolean;
		onuploaded?: (objectKey: string) => void;
	}
	let {
		label,
		requestTicket,
		complete,
		maxBytes = 10 * 1024 * 1024,
		allowedUploadOrigins,
		accept,
		disabled = false,
		onuploaded
	}: Props = $props();
	const locale = $derived(page.data.locale ?? 'id');
	const id = $props.id();
	let input: HTMLInputElement;
	let busy = $state(false);
	let completed = $state(false);
	let errorText = $state('');
	let aborter: AbortController | undefined;
	let sequence = 0;
	function choose() {
		input.click();
	}
	async function upload(event: Event) {
		const file = (event.currentTarget as HTMLInputElement).files?.[0];
		if (!file || busy) return;
		if (file.size > maxBytes) {
			errorText = translate(locale, 'upload.tooLarge');
			input.value = '';
			return;
		}
		busy = true;
		completed = false;
		errorText = '';
		const current = ++sequence;
		const controller = new AbortController();
		aborter = controller;
		try {
			const ticket = await requestTicket(file, controller.signal);
			if (!validateUploadOrigin(ticket.uploadUrl, allowedUploadOrigins))
				throw new Error('Untrusted upload origin');
			if (!ticket.objectKey) throw new Error('Missing object key');
			const response = await fetch(ticket.uploadUrl, {
				method: 'PUT',
				body: file,
				headers: ticket.headers,
				signal: controller.signal,
				credentials: 'omit'
			});
			if (!response.ok) throw new Error(`Upload failed: ${response.status}`);

			if (complete) await complete(ticket, file, controller.signal);
			if (!controller.signal.aborted && current === sequence) {
				completed = true;
				onuploaded?.(ticket.objectKey);
			}
		} catch (reason) {
			if (!controller.signal.aborted && current === sequence)
				errorText = reason instanceof Error ? reason.message : translate(locale, 'upload.failed');
		} finally {
			if (current === sequence) {
				busy = false;
				input.value = '';
				aborter = undefined;
			}
		}
	}
	function cancel() {
		sequence += 1;
		aborter?.abort();
		aborter = undefined;
		busy = false;
		completed = false;
		input.value = '';
	}
</script>

<div class="space-y-2">
	<label for={id} class="block text-sm font-medium">{label}</label>
	<input bind:this={input} {id} type="file" {accept} {disabled} class="sr-only" onchange={upload} />
	<div class="flex items-center gap-3">
		<Button variant="outline" disabled={disabled || busy} onclick={choose}
			>{translate(locale, 'upload.choose')}</Button
		>
		{#if busy}<Button variant="ghost" onclick={cancel}>{translate(locale, 'common.cancel')}</Button
			>{/if}
	</div>
	{#if busy}<p role="status" class="text-sm">{translate(locale, 'upload.inProgress')}</p>{/if}
	{#if completed && !busy}<p role="status" class="text-sm text-emerald-600">
			{translate(locale, 'upload.complete')}
		</p>{/if}
	{#if errorText}<p role="alert" class="text-sm text-rose-600">{errorText}</p>{/if}
</div>
