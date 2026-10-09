<script lang="ts">
	const features = [
		{
			title: 'Bun-native production',
			text: 'Official adapter-bun, Bun-pinned tooling, precompressed assets, Docker, and CI that builds through the Bun runtime.'
		},
		{
			title: 'Backend-ready API layer',
			text: 'Typed JSON requests, consistent errors, request IDs, timeouts, browser calls, and server-only calls to your Bun API.'
		},
		{
			title: 'Security baseline',
			text: 'CSP, defensive response headers, safe error surfaces, private/public env separation, and no auth tokens in localStorage by default.'
		},
		{
			title: 'Quality gates included',
			text: 'Type checking, ESLint, Prettier, Vitest, Playwright, Dependabot, and a GitHub Actions pipeline are part of the starter.'
		},
		{
			title: 'SvelteKit 3 structure',
			text: 'Current Vite-based SvelteKit configuration, #lib imports, new env APIs, Svelte 5 runes, and no legacy compatibility baggage.'
		},
		{
			title: 'Small dependency surface',
			text: 'Tailwind is the only UI layer. No state, form, auth, or component framework is forced on projects that may not need one.'
		}
	];

	const commands = [
		['Install', 'bun install'],
		['Develop', 'bun run dev'],
		['Validate', 'bun run ci'],
		['Production build', 'bun run --bun build'],
		['Production start', 'bun ./build']
	];
</script>

<svelte:head>
	<title>Svelte Skeleton · SvelteKit + Bun</title>
	<meta
		name="description"
		content="Production-minded SvelteKit skeleton for frontends that integrate with Bun backends."
	/>
</svelte:head>

<section class="mx-auto max-w-6xl px-5 pb-16 pt-16 sm:px-8 sm:pb-24 sm:pt-24">
	<div class="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
		<div>
			<div
				class="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold tracking-wide text-indigo-700 uppercase dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300"
			>
				<span class="size-1.5 rounded-full bg-indigo-500"></span>
				SvelteKit 3 · Svelte 5 · Bun 1.4+
			</div>

			<h1
				class="max-w-3xl text-4xl font-bold tracking-[-0.04em] text-balance sm:text-6xl dark:text-white"
			>
				A frontend starter that already did the boring work.
			</h1>
			<p class="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
				Use it as the clean starting point for dashboards, portals, internal tools, and product
				frontends backed by Bun APIs. The defaults are opinionated where safety matters and
				deliberately unopinionated where product requirements differ.
			</p>

			<div class="mt-8 flex flex-wrap gap-3">
				<a
					href="https://github.com/RSTNET-ID/svelte-skeleton"
					target="_blank"
					rel="noreferrer"
					class="inline-flex items-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
					>View repository</a
				>
				<a
					href="/health"
					class="inline-flex items-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
					>Health endpoint</a
				>
			</div>
		</div>

		<div
			class="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-2xl shadow-slate-900/10 dark:border-slate-800"
		>
			<div class="flex items-center gap-1.5 border-b border-white/10 px-5 py-4">
				<span class="size-2.5 rounded-full bg-white/20"></span>
				<span class="size-2.5 rounded-full bg-white/20"></span>
				<span class="size-2.5 rounded-full bg-white/20"></span>
				<span class="ml-3 text-xs font-medium text-slate-400">starter workflow</span>
			</div>
			<div class="space-y-1 p-5 font-mono text-sm">
				{#each commands as command, index (command[1])}
					<div class="grid grid-cols-[1.3rem_1fr] gap-2 rounded-lg px-2 py-2.5 hover:bg-white/5">
						<span class="select-none text-slate-600">{String(index + 1).padStart(2, '0')}</span>
						<div>
							<p class="text-xs text-slate-500">{command[0]}</p>
							<p class="mt-1 text-slate-200">
								<span class="text-emerald-400">$</span>
								{command[1]}
							</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

<section
	class="border-y border-slate-200/80 bg-white/55 dark:border-slate-800/80 dark:bg-slate-950/45"
>
	<div class="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
		<div class="max-w-2xl">
			<p class="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Baseline included</p>
			<h2 class="mt-2 text-3xl font-bold tracking-tight dark:text-white">
				Enough structure to move fast, not enough to trap you.
			</h2>
		</div>

		<div class="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each features as feature (feature.title)}
				<article
					class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/70"
				>
					<div
						class="mb-5 grid size-9 place-items-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
					>
						✓
					</div>
					<h3 class="font-semibold text-slate-950 dark:text-white">{feature.title}</h3>
					<p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{feature.text}</p>
				</article>
			{/each}
		</div>
	</div>
</section>

<section class="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
	<div
		class="grid gap-8 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center dark:border-slate-800 dark:bg-slate-900/70"
	>
		<div>
			<p class="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Backend contract</p>
			<h2 class="mt-2 text-2xl font-bold tracking-tight dark:text-white">
				Built to sit in front of a Bun API, not compete with it.
			</h2>
			<p class="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">
				Keep domain logic, queues, storage, and persistence in the backend. Let SvelteKit own
				rendering, browser interactions, BFF-style server calls when useful, and a strict boundary
				between public and private configuration.
			</p>
		</div>
		<a
			href="https://svelte.dev/docs/kit"
			target="_blank"
			rel="noreferrer"
			class="inline-flex w-fit rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
			>SvelteKit docs</a
		>
	</div>
</section>
