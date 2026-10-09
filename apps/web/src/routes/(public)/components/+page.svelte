<script lang="ts">
	import {
		Alert,
		Badge,
		Button,
		Card,
		EmptyState,
		Input,
		Spinner,
		Textarea,
		Tabs,
		Checkbox,
		ConfirmDialog
	} from '#lib/components/ui/index.ts';

	let name = $state('');
	let notes = $state('');
	let saving = $state(false);
	let submitted = $state(false);
	let activeTab = $state('first');
	let accepted = $state(false);
	let confirmOpen = $state(false);
	let confirmed = $state(false);
	const sampleTabs = [
		{ value: 'first', label: 'First' },
		{ value: 'second', label: 'Second' }
	];
</script>

<svelte:head>
	<title>Component gallery · Svelte Skeleton</title>
	<meta name="description" content="Reusable components for SvelteKit and Bun-backed frontends." />
</svelte:head>

<div class="mx-auto max-w-6xl space-y-10 px-5 py-14 sm:px-8">
	<header>
		<p class="text-sm font-semibold text-indigo-600 dark:text-indigo-400">UI foundations</p>
		<h1 class="mt-2 text-4xl font-bold tracking-tight">Component gallery</h1>
		<p class="mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
			Reusable Svelte 5 primitives with accessible defaults, explicit variants, and light/dark
			support.
		</p>
	</header>

	<div class="grid gap-6 lg:grid-cols-2">
		<Card>
			{#snippet header()}<h2 class="text-lg font-semibold">Buttons</h2>{/snippet}
			<div class="flex flex-wrap gap-3">
				<Button onclick={() => (submitted = !submitted)}>Primary</Button>
				<Button variant="secondary">Secondary</Button>
				<Button variant="outline">Outline</Button>
				<Button variant="ghost">Ghost</Button>
				<Button variant="danger">Danger</Button>
				<Button disabled>Disabled</Button>
				<Button loading>Saving</Button>
			</div>
			{#if submitted}<p class="mt-4 text-sm" role="status">Primary button clicked.</p>{/if}
		</Card>

		<Card>
			{#snippet header()}<h2 class="text-lg font-semibold">Badges and progress</h2>{/snippet}
			<div class="flex flex-wrap items-center gap-3">
				<Badge>Neutral</Badge>
				<Badge tone="info">Info</Badge>
				<Badge tone="success">Active</Badge>
				<Badge tone="warning">Pending</Badge>
				<Badge tone="danger">Failed</Badge>
				<Spinner label="Example loading state" />
			</div>
		</Card>

		<Card>
			{#snippet header()}<h2 class="text-lg font-semibold">Form fields</h2>{/snippet}
			<form
				class="space-y-4"
				onsubmit={(event) => {
					event.preventDefault();
					saving = true;
				}}
			>
				<Input
					label="Full name"
					name="name"
					bind:value={name}
					required
					placeholder="Jane Doe"
					hint="Enter a display name."
				/>
				<Textarea
					label="Notes"
					name="notes"
					bind:value={notes}
					placeholder="Optional notes"
					rows={3}
				/>
				<div class="flex items-center gap-3">
					<Button type="submit">Submit example</Button>
					{#if saving}<span role="status" class="text-sm text-emerald-600"
							>Form example submitted locally.</span
						>{/if}
				</div>
			</form>
		</Card>

		<Card>
			{#snippet header()}<h2 class="text-lg font-semibold">Alerts</h2>{/snippet}
			<div class="space-y-3">
				<Alert tone="info" title="Information">Here is something worth knowing.</Alert>
				<Alert tone="success" title="Saved">Changes were processed successfully.</Alert>
				<Alert tone="warning" title="Review required">Check your inputs before continuing.</Alert>
				<Alert tone="danger" title="Request failed">Try again or contact support.</Alert>
			</div>
		</Card>

		<Card>
			{#snippet header()}<h2 class="text-lg font-semibold">Keyboard tabs and checkbox</h2>{/snippet}
			<Tabs items={sampleTabs} label="Sample sections" bind:value={activeTab}>
				{#snippet children(selected)}
					<p role="status">Active tab: {selected}</p>
				{/snippet}
			</Tabs>
			<div class="mt-4"><Checkbox label="Accept sample" bind:checked={accepted} /></div>
			<p role="status" class="mt-2">{accepted ? 'Accepted' : 'Not accepted'}</p>
		</Card>
		<Card>
			{#snippet header()}<h2 class="text-lg font-semibold">Confirmation dialog</h2>{/snippet}
			<Button onclick={() => (confirmOpen = true)}>Open confirmation</Button>
			{#if confirmed}<p role="status">Sample confirmed</p>{/if}
			<ConfirmDialog
				open={confirmOpen}
				title="Confirm sample"
				description="Proceed with sample action?"
				oncancel={() => (confirmOpen = false)}
				onconfirm={() => {
					confirmed = true;
					confirmOpen = false;
				}}
			/>
		</Card>
		<div class="lg:col-span-2">
			<EmptyState
				title="No records found"
				description="Data will appear here when your backend returns matching items."
			>
				{#snippet action()}<Button variant="outline" onclick={() => (name = '')}
						>Reset sample form</Button
					>{/snippet}
			</EmptyState>
		</div>
	</div>
</div>
