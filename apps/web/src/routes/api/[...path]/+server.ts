import { API_PROXY_TARGET, API_TIMEOUT_MS } from '$app/env/private';
import type { RequestHandler } from './$types';

const HOP_BY_HOP_HEADERS = [
	'connection',
	'keep-alive',
	'proxy-authenticate',
	'proxy-authorization',
	'te',
	'trailer',
	'transfer-encoding',
	'upgrade'
] as const;

const proxy: RequestHandler = async ({ request, url, params, locals, getClientAddress }) => {
	const suffix = params.path ? `/api/${params.path}` : '/api';
	const upstreamUrl = new URL(`${suffix}${url.search}`, API_PROXY_TARGET);
	const headers = new Headers(request.headers);

	for (const name of HOP_BY_HOP_HEADERS) headers.delete(name);
	headers.delete('host');
	headers.delete('content-length');
	headers.set('x-request-id', locals.requestId);
	headers.set('x-forwarded-host', url.host);
	headers.set('x-forwarded-proto', url.protocol.replace(':', ''));

	try {
		headers.set('x-forwarded-for', getClientAddress());
	} catch {
		// Client address forwarding is optional and depends on adapter proxy settings.
	}

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

	try {
		const response = await fetch(upstreamUrl, {
			method: request.method,
			headers,
			body:
				request.method === 'GET' || request.method === 'HEAD'
					? undefined
					: await request.arrayBuffer(),
			redirect: 'manual',
			signal: controller.signal
		});

		const responseHeaders = new Headers(response.headers);
		for (const name of HOP_BY_HOP_HEADERS) responseHeaders.delete(name);

		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers: responseHeaders
		});
	} catch {
		return Response.json(
			{
				code: 'UPSTREAM_UNAVAILABLE',
				message: 'Backend service is unavailable',
				requestId: locals.requestId
			},
			{
				status: 502,
				headers: { 'cache-control': 'no-store' }
			}
		);
	} finally {
		clearTimeout(timeoutId);
	}
};

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
export const HEAD = proxy;
export const fallback = proxy;
