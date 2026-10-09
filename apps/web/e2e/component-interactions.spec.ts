import { test, expect } from '@playwright/test';

test('keyboard tabs and checkbox update the gallery', async ({ page }) => {
	await page.goto('/components');
	const first = page.getByRole('tab', { name: 'First' });
	const second = page.getByRole('tab', { name: 'Second' });
	await expect(first).toHaveAttribute('aria-selected', 'true');
	await first.focus();
	await page.keyboard.press('ArrowRight');
	await expect(second).toHaveAttribute('aria-selected', 'true');
	await expect(page.getByText('Active tab: second')).toBeVisible();
	await page.getByRole('checkbox', { name: 'Accept sample' }).check();
	await expect(page.getByText('Accepted', { exact: true })).toBeVisible();
});
