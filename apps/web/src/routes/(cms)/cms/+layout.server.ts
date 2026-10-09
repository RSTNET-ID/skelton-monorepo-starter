import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { backendApi } from '#lib/server/backend-api.ts';
import { ApiError } from '#lib/api/error.ts';

import { decodeCmsIdentity } from '#lib/server/cms-identity.ts';

export const load: LayoutServerLoad = async (event) => {
	let user: ReturnType<typeof decodeCmsIdentity>;
	try {
		user = decodeCmsIdentity(await backendApi<unknown>(event, { path: '/auth/me' }));
	} catch (cause) {
		if (cause instanceof ApiError && cause.status === 401) {
			redirect(303, '/login?returnTo=' + encodeURIComponent(event.url.pathname));
		}
		if (cause instanceof ApiError && cause.status === 403) {
			error(403, 'CMS access denied');
		}
		throw cause;
	}
	if (!user?.id) error(403, 'CMS access denied');
	return { user };
};
