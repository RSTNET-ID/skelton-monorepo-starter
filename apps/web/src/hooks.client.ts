import type { HandleClientError } from '@sveltejs/kit/hooks';

export const handleError: HandleClientError = ({ kind, error }) => {
	if (kind === 'unknown') {
		const errorId = crypto.randomUUID();
		console.error('[svelte-skeleton] unexpected client error', { errorId, error });

		return {
			message: 'Something went wrong',
			errorId
		};
	}
};
