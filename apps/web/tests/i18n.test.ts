import { describe, expect, it } from 'vitest';
import { getLocale, isLocale, translate } from '../src/lib/i18n/index.ts';

describe('i18n', () => {
	it('defaults unknown locale to Indonesian', () => {
		expect(getLocale(undefined)).toBe('id');
		expect(getLocale('fr')).toBe('id');
		expect(isLocale('en')).toBe(true);
		expect(isLocale('EN')).toBe(false);
	});

	it('translates shared keys to both locales', () => {
		expect(translate('id', 'common.save')).toBe('Simpan');
		expect(translate('en', 'common.save')).toBe('Save');
	});

	it('interpolates variables without changing the source dictionary', () => {
		expect(translate('id', 'cms.welcome', { name: 'Budi' })).toBe('Selamat datang, Budi');
		expect(translate('en', 'cms.welcome', { name: 'Ana' })).toBe('Welcome, Ana');
	});
});
