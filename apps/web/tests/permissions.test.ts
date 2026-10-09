import { describe, expect, it } from 'vitest';
import { canAccess } from '../src/lib/helpers/permissions.ts';
describe('permission menu visibility', () => {
	it('shows public items and hides restricted items', () => {
		expect(canAccess([], undefined)).toBe(true);
		expect(canAccess([], 'cms.components.read')).toBe(false);
		expect(canAccess(['cms.components.read'], 'cms.components.read')).toBe(true);
	});
});
