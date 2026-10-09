import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ locals }) => {
	return Response.json(
		{
			status: 'ok',
			service: 'svelte-skeleton',
			timestamp: new Date().toISOString(),
			requestId: locals.requestId
		},
		{
			headers: {
				'cache-control': 'no-store'
			}
		}
	);
};
