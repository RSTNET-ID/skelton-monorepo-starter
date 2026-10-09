import type { Handle, HandleServerError } from '@sveltejs/kit/hooks';

const REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]{1,128}$/;

function requestIdFrom(header: string | null): string {
	const candidate = header?.trim();
	return candidate && REQUEST_ID_PATTERN.test(candidate) ? candidate : crypto.randomUUID();
}

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.requestId = requestIdFrom(event.request.headers.get('x-request-id'));

	const response = await resolve(event);
	const headers = new Headers(response.headers);

	headers.set('x-request-id', event.locals.requestId);
	headers.set('x-content-type-options', 'nosniff');
	headers.set('referrer-policy', 'strict-origin-when-cross-origin');
	headers.set('x-frame-options', 'DENY');
	headers.set('permissions-policy', 'camera=(), microphone=(), geolocation=()');

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers
	});
};

export const handleError: HandleServerError = ({ kind, error, event }) => {
	const errorId = event.locals.requestId || crypto.randomUUID();

	if (kind === 'unknown') {
		console.error('[svelte-skeleton] unexpected server error', {
			errorId,
			path: event.url.pathname,
			error
		});

		return {
			message: 'Internal server error',
			errorId
		};
	}
};
