<script lang="ts">
	import '../styles/app.css';
	import { page } from '$app/state';
	let { children } = $props();
	$effect(() => {
		if (typeof document !== 'undefined') document.documentElement.lang = page.data.locale ?? 'id';
	});
</script>

{@render children()}
