<script lang="ts">
	import { AutoNumericInput, DatePicker, Select, SelectAjax } from '#lib/components/ui/index.ts';
	import type { SelectOption } from '#lib/components/ui/SelectAjax.svelte';
	import { page } from '$app/state';
	import { translate } from '#lib/i18n/index.ts';

	let nominal = $state<string | null>('2500000');
	let percent = $state<string | null>('12.5');
	let tanggal = $state('');
	let rentang = $state('');
	let jam = $state('');
	let status = $state('active');
	const statuses = [
		{ value: 'active', label: 'Aktif' },
		{ value: 'inactive', label: 'Nonaktif' }
	];
	let userId = $state<string | null>(null);
	let userOption = $state<SelectOption | null>(null);

	// Example backend contract. Replace endpoints with your actual Bun API.
	async function searchUsers(query: string, signal: AbortSignal): Promise<SelectOption[]> {
		const response = await fetch('/api/users?' + new URLSearchParams({ search: query }), {
			credentials: 'include',
			signal
		});
		if (!response.ok) throw new Error('User lookup failed');
		const data: { items: { id: string; name: string }[] } = await response.json();
		return data.items.map((user) => ({ value: user.id, label: user.name }));
	}
	async function resolveUser(id: string, signal: AbortSignal): Promise<SelectOption | null> {
		const response = await fetch('/api/users/' + encodeURIComponent(id), {
			credentials: 'include',
			signal
		});
		if (response.status === 404) return null;
		if (!response.ok) throw new Error('User lookup failed');
		const user: { id: string; name: string } = await response.json();
		return { value: user.id, label: user.name };
	}
</script>

<svelte:head><title>Dynamic forms · Skeleton CMS</title></svelte:head>
<div class="max-w-4xl space-y-8">
	<div>
		<h1 class="text-3xl font-bold">Dynamic form components</h1>
		<p class="mt-2 text-sm text-slate-500">Reusable for create, edit, and filter screens.</p>
	</div>
	<section
		class="grid gap-5 rounded-2xl border border-slate-200 bg-white p-6 md:grid-cols-2 dark:border-slate-800 dark:bg-slate-900"
	>
		<AutoNumericInput
			label={translate(page.data.locale ?? 'id', 'fields.amount')}
			kind="currency"
			name="amount"
			bind:value={nominal}
		/>
		<AutoNumericInput
			label={translate(page.data.locale ?? 'id', 'fields.percent')}
			kind="percent"
			name="rate"
			minimumValue="0"
			maximumValue="100"
			bind:value={percent}
		/>
		<DatePicker
			label={translate(page.data.locale ?? 'id', 'fields.date')}
			bind:value={tanggal}
			name="date"
		/>
		<DatePicker
			label={translate(page.data.locale ?? 'id', 'fields.range')}
			mode="range"
			bind:value={rentang}
			name="range"
		/>
		<DatePicker
			label={translate(page.data.locale ?? 'id', 'fields.time')}
			timeOnly
			bind:value={jam}
			name="time"
		/>
		<Select
			label={translate(page.data.locale ?? 'id', 'fields.status')}
			name="status"
			options={statuses}
			bind:value={status}
		/>
		<SelectAjax
			label={translate(page.data.locale ?? 'id', 'fields.user')}
			name="user_id"
			bind:value={userId}
			bind:selectedOption={userOption}
			search={searchUsers}
			resolve={resolveUser}
		/>
	</section>
	<pre
		class="overflow-x-auto rounded-2xl bg-slate-950 p-5 font-mono text-xs leading-6 text-slate-200">{JSON.stringify(
			{ nominal, percent, tanggal, rentang, jam, status, userId },
			null,
			2
		)}</pre>
	<p class="text-sm text-slate-500">
		SelectAjax membutuhkan endpoint Bun untuk pencarian dan resolusi ID. Nominal dan persentase
		mengembalikan raw numeric string.
	</p>
</div>
