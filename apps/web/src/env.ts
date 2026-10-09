import { defineEnvVars } from '@sveltejs/kit/env';

function httpUrl(value: string | undefined, fallback: string): string {
	const candidate = value ?? fallback;
	const url = new URL(candidate);

	if (url.protocol !== 'http:' && url.protocol !== 'https:') {
		throw new Error('URL must use http or https');
	}

	return candidate.replace(/\/+$/, '');
}

function publicApiUrl(value: string | undefined): string {
	const candidate = value ?? '/api';

	if (candidate.startsWith('/')) {
		return candidate === '/' ? candidate : candidate.replace(/\/+$/, '');
	}

	return httpUrl(candidate, '/api');
}

function timeout(value: string | undefined): number {
	const candidate = Number(value ?? 10_000);

	if (!Number.isInteger(candidate) || candidate < 100 || candidate > 120_000) {
		throw new Error('API_TIMEOUT_MS must be an integer between 100 and 120000');
	}

	return candidate;
}

export const variables = defineEnvVars({
	API_BASE_URL: {
		description: 'Private base URL used for server-to-server calls to the Bun backend.',
		schema: (value) => httpUrl(value, 'http://127.0.0.1:3001/api')
	},
	API_PROXY_TARGET: {
		public: false,
		description: 'Internal origin used by the same-origin /api reverse proxy.',
		schema: (value) => httpUrl(value, 'http://127.0.0.1:3001')
	},
	API_TIMEOUT_MS: {
		description: 'Timeout in milliseconds for backend API requests.',
		schema: timeout
	},
	PUBLIC_API_BASE_URL: {
		public: true,
		description: 'Browser-visible API base URL. Prefer a same-origin path such as /api.',
		schema: publicApiUrl
	}
});
