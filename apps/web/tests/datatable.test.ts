import { describe, expect, it } from 'vitest';
import { getLocale, translate } from '../src/lib/i18n/index.ts';

describe('DataTable translations', () => {
	it('provides both locales and plural-independent total placeholder', () => {
		expect(translate('id', 'table.total', { total: 12 })).toContain('12');
		expect(translate('en', 'table.total', { total: 12 })).toContain('12');
		expect(getLocale('en')).toBe('en');
	});
});
