<script lang="ts">
	import { page } from '$app/state';
	import { translate } from '#lib/i18n/index.ts';
	import { Button } from '#lib/components/ui/index.ts';

	const locale = $derived(page.data.locale ?? 'id');
</script>

<form
	action="/language"
	method="POST"
	class="inline-flex items-center gap-1"
	aria-label={translate(locale, 'nav.language')}
>
	<Button
		type="submit"
		name="locale"
		value="id"
		variant={locale === 'id' ? 'secondary' : 'ghost'}
		size="sm"
		aria-pressed={locale === 'id'}>ID</Button
	>
	<Button
		type="submit"
		name="locale"
		value="en"
		variant={locale === 'en' ? 'secondary' : 'ghost'}
		size="sm"
		aria-pressed={locale === 'en'}>EN</Button
	>
</form>
