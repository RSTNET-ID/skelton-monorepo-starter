import { expect, test } from '@playwright/test';

test('renders the starter page and health endpoint', async ({ page, request }) => {
	await page.goto('/');

	await expect(page).toHaveTitle(/Svelte Skeleton/);
	await expect(page.getByRole('heading', { level: 1 })).toContainText('frontend starter');
	await expect(page.getByRole('link', { name: 'Health endpoint' })).toBeVisible();

	const health = await request.get('/health');
	expect(health.ok()).toBeTruthy();
	expect(await health.json()).toMatchObject({ status: 'ok', service: 'svelte-skeleton' });
});
