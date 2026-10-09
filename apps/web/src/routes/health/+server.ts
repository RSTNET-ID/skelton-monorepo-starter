import { API_PROXY_TARGET, API_TIMEOUT_MS } from '$app/env/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

	try {
		const response = await fetch(new URL('/health/ready', API_PROXY_TARGET), {
			headers: { 'x-request-id': locals.requestId },
			signal: controller.signal
		});

		if (!response.ok) {
			return Response.json(
				{
					status: 'degraded',
					services: { web: 'up', api: 'not-ready' },
					timestamp: new Date().toISOString(),
					requestId: locals.requestId
				},
				{ status: 503, headers: { 'cache-control': 'no-store' } }
			);
		}

		return Response.json(
			{
				status: 'ok',
				services: { web: 'up', api: 'ready' },
				timestamp: new Date().toISOString(),
				requestId: locals.requestId
			},
			{ headers: { 'cache-control': 'no-store' } }
		);
	} catch {
		return Response.json(
			{
				status: 'degraded',
				services: { web: 'up', api: 'down' },
				timestamp: new Date().toISOString(),
				requestId: locals.requestId
			},
			{ status: 503, headers: { 'cache-control': 'no-store' } }
		);
	} finally {
		clearTimeout(timeoutId);
	}
};
