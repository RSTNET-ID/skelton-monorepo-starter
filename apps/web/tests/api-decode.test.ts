import { describe, expect, it } from 'vitest';
import { requestJson } from '../src/lib/api/request.ts';
import type { Fetcher } from '../src/lib/api/request.ts';

interface SampleUser {
	id: string;
	name: string;
}
function decodeUser(value: unknown): SampleUser {
	if (
		typeof value !== 'object' ||
		value === null ||
		!('id' in value) ||
		typeof value.id !== 'string' ||
		!('name' in value) ||
		typeof value.name !== 'string'
	) {
		throw new Error('Invalid API user payload');
	}
	return { id: value.id, name: value.name };
}
describe('API runtime decoder', () => {
	const valid: Fetcher = async () =>
		new Response(JSON.stringify({ id: '1', name: 'Ana' }), { status: 200 });
	it('returns typed validated responses', async () => {
		await expect(
			requestJson(valid, { baseUrl: '/api', path: 'user' }, decodeUser)
		).resolves.toEqual({ id: '1', name: 'Ana' });
	});
	it('rejects structurally invalid API responses', async () => {
		const invalid: Fetcher = async () => new Response(JSON.stringify({ id: 12 }), { status: 200 });
		await expect(
			requestJson(invalid, { baseUrl: '/api', path: 'user' }, decodeUser)
		).rejects.toThrow('Invalid API user payload');
	});
	it('preserves backend error handling before decoding', async () => {
		const failed: Fetcher = async () =>
			new Response(JSON.stringify({ code: 'BAD', message: 'Rejected' }), { status: 400 });
		await expect(
			requestJson(failed, { baseUrl: '/api', path: 'user' }, decodeUser)
		).rejects.toMatchObject({ status: 400, code: 'BAD' });
	});
});
