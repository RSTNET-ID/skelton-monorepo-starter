import { API_BASE_URL, API_TIMEOUT_MS } from '$app/env/private';
import type { RequestEvent } from '@sveltejs/kit';
import { requestJson, type ApiRequestOptions } from '../api/request.ts';

export type BackendApiOptions = Omit<ApiRequestOptions, 'baseUrl' | 'requestId' | 'timeoutMs'> & {
	forwardAuth?: boolean;
};

export function backendApi<T>(event: RequestEvent, options: BackendApiOptions): Promise<T> {
	const { forwardAuth = true, ...requestOptions } = options;
	// Never forward credentials across upstream HTTP redirects.
	if (requestOptions.redirect && requestOptions.redirect !== 'manual') {
		throw new TypeError('Backend API must not follow redirects');
	}
	// Auth-bearing server requests must never follow caller-supplied absolute URLs.
	if (
		!requestOptions.path.startsWith('/') ||
		requestOptions.path.startsWith('//') ||
		/[\\\\]/.test(requestOptions.path)
	) {
		throw new TypeError('Backend API path must be a root-relative path');
	}
	const headers = new Headers(requestOptions.headers);

	if (forwardAuth) {
		for (const name of ['authorization', 'cookie']) {
			const value = event.request.headers.get(name);
			if (value) headers.set(name, value);
		}
	}

	return requestJson<T>(event.fetch, {
		...requestOptions,
		headers,
		baseUrl: API_BASE_URL,
		redirect: 'manual',
		requestId: event.locals.requestId,
		timeoutMs: API_TIMEOUT_MS
	});
}
