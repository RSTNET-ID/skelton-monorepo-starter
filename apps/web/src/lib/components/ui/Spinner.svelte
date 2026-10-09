<script lang="ts">
	type Size = 'sm' | 'md' | 'lg';
	interface Props {
		size?: Size;
		label?: string;
	}
	let { size = 'md', label = 'Loading' }: Props = $props();
	const sizes: Record<Size, string> = { sm: 'size-4', md: 'size-6', lg: 'size-9' };
</script>

<span role="status" aria-label={label} class="inline-flex items-center">
	<span
		aria-hidden="true"
		class={`${sizes[size]} animate-spin rounded-full border-2 border-current border-r-transparent`}
	></span>
	<span class="sr-only">{label}</span>
</span>
