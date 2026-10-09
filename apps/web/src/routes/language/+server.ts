import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { isLocale, languageCookie } from '#lib/i18n/index.ts';

export const POST: RequestHandler = async ({ request, cookies, url }) => {
	const form = await request.formData();
	const locale = form.get('locale');
	if (!isLocale(locale)) error(400, 'Unsupported locale');
	cookies.set(languageCookie, locale, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: url.protocol === 'https:',
		maxAge: 60 * 60 * 24 * 365
	});
	const referrer = request.headers.get('referer');
	let destination = '/';
	if (referrer) {
		try {
			const parsed = new URL(referrer);
			if (parsed.origin === url.origin && parsed.pathname !== '/language') {
				destination = parsed.pathname + parsed.search;
			}
		} catch {
			// Ignore malformed or untrusted referrers.
		}
	}
	redirect(303, destination);
};
