<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
	type Size = 'sm' | 'md' | 'lg';

	interface Props extends Omit<HTMLButtonAttributes, 'size'> {
		variant?: Variant;
		size?: Size;
		loading?: boolean;
		children?: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		loading = false,
		disabled = false,
		type = 'button',
		children,
		class: className = '',
		...rest
	}: Props = $props();

	const variants: Record<Variant, string> = {
		primary:
			'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400',
		secondary:
			'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white',
		outline:
			'border border-slate-300 bg-transparent text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800',
		ghost: 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
		danger: 'bg-rose-600 text-white hover:bg-rose-700'
	};
	const sizes: Record<Size, string> = {
		sm: 'min-h-9 px-3 text-xs',
		md: 'min-h-10 px-4 text-sm',
		lg: 'min-h-12 px-5 text-base'
	};
</script>

<button
	{...rest}
	{type}
	disabled={disabled || loading}
	aria-busy={loading}
	class={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
>
	{#if loading}
		<span
			class="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
			aria-hidden="true"
		></span>
		<span class="sr-only">Loading</span>
	{/if}
	{#if children}{@render children()}{/if}
</button>
