import { describe, expect, it } from 'vitest';
import { ApiError } from '../src/lib/api/error.ts';
import { buildApiUrl, requestJson } from '../src/lib/api/request.ts';

describe('buildApiUrl', () => {
	it('joins absolute and relative API bases safely', () => {
		expect(buildApiUrl('/api', '/users')).toBe('/api/users');
		expect(buildApiUrl('https://api.example.com/v1/', 'users')).toBe(
			'https://api.example.com/v1/users'
		);
		expect(buildApiUrl('/api', 'https://other.example.com/ping')).toBe(
			'https://other.example.com/ping'
		);
	});
});

describe('requestJson', () => {
	it('returns a parsed JSON response', async () => {
		const fetcher = async () => Response.json({ ok: true });

		await expect(
			requestJson<{ ok: boolean }>(fetcher, {
				baseUrl: '/api',
				path: '/health'
			})
		).resolves.toEqual({ ok: true });
	});

	it('serializes JSON bodies and forwards request IDs', async () => {
		let request: RequestInit | undefined;
		const fetcher = async (_input: RequestInfo | URL, init?: RequestInit) => {
			request = init;
			return Response.json({ created: true }, { status: 201 });
		};

		await requestJson(fetcher, {
			baseUrl: '/api',
			path: '/items',
			method: 'POST',
			json: { name: 'demo' },
			requestId: 'req-123'
		});

		const headers = new Headers(request?.headers);
		expect(headers.get('content-type')).toBe('application/json');
		expect(headers.get('x-request-id')).toBe('req-123');
		expect(request?.body).toBe(JSON.stringify({ name: 'demo' }));
	});

	it('throws ApiError with backend details on non-2xx responses', async () => {
		const fetcher = async () =>
			Response.json(
				{ message: 'Validation failed', code: 'VALIDATION_ERROR', fields: { email: ['invalid'] } },
				{ status: 422, headers: { 'x-request-id': 'req-error' } }
			);

		try {
			await requestJson(fetcher, { baseUrl: '/api', path: '/users' });
			throw new Error('Expected requestJson to throw');
		} catch (error) {
			expect(error).toBeInstanceOf(ApiError);
			const apiError = error as ApiError;
			expect(apiError.status).toBe(422);
			expect(apiError.code).toBe('VALIDATION_ERROR');
			expect(apiError.requestId).toBe('req-error');
			expect(apiError.message).toBe('Validation failed');
		}
	});
});
