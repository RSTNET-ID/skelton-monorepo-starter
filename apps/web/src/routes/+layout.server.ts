import type { LayoutServerLoad } from './$types';
import { getLocale, languageCookie } from '#lib/i18n/index.ts';

export const load: LayoutServerLoad = ({ cookies }) => ({
	locale: getLocale(cookies.get(languageCookie))
});
