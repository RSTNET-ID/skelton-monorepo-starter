import { test, expect } from '@playwright/test';

test('confirmation dialog traps focus, escapes and restores trigger focus', async ({ page }) => {
	await page.goto('/components');
	const trigger = page.getByRole('button', { name: 'Open confirmation' });
	await trigger.click();
	const dialog = page.getByRole('alertdialog');
	await expect(dialog).toBeVisible();
	await expect(dialog).toBeFocused();
	await page.keyboard.press('Escape');
	await expect(dialog).toBeHidden();
	await expect(trigger).toBeFocused();
	await trigger.click();
	await dialog.getByRole('button').last().click();
	await expect(page.getByText('Sample confirmed')).toBeVisible();
	await expect(trigger).toBeFocused();
});
