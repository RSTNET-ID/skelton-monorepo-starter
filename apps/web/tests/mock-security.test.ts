import { describe, expect, it } from 'vitest';
import { makeMockBackend } from './mocks/backend.ts';
import { requestJson } from '../src/lib/api/request.ts';
import { validateUploadOrigin } from '../src/lib/helpers/upload.ts';

function call(token: string, path: string, options: { method?: string; csrf?: string } = {}) {
	const server = makeMockBackend();
	return requestJson<unknown>(server.fetch, {
		baseUrl: 'https://mock.local',
		path,
		method: options.method ?? 'GET',
		headers: {
			authorization: 'Bearer ' + token,
			...(options.csrf ? { 'x-csrf-token': options.csrf } : {})
		}
	});
}

describe('mock backend security scenarios (not a real Bun audit)', () => {
	it('rejects unauthenticated requests', async () => {
		await expect(call('invalid', '/auth/me')).rejects.toMatchObject({ status: 401 });
	});
	it('isolates tenant list and denies cross-tenant direct IDs', async () => {
		const response = (await call('alice', '/records')) as { items: { tenantId: string }[] };
		expect(response.items.every((record) => record.tenantId === 'tenant-a')).toBe(true);
		await expect(call('alice', '/records/b1')).rejects.toMatchObject({ status: 404 });
	});
	it('rejects invalid cursor and enforces bounded limits', async () => {
		await expect(call('alice', '/records?cursor=b1')).rejects.toMatchObject({ status: 400 });
		await expect(call('alice', '/records?limit=500')).rejects.toMatchObject({ status: 400 });
	});
	it('rejects CSRF missing and permissions missing on upload ticket', async () => {
		await expect(call('alice', '/uploads/ticket', { method: 'POST' })).rejects.toMatchObject({
			status: 403
		});
		await expect(
			call('bob', '/uploads/ticket', { method: 'POST', csrf: 'csrf-bob' })
		).rejects.toMatchObject({ status: 403 });
	});
	it('allows scoped upload ticket only and validates target origin', async () => {
		const ticket = (await call('alice', '/uploads/ticket', {
			method: 'POST',
			csrf: 'csrf-alice'
		})) as { uploadUrl: string; objectKey: string };
		expect(ticket.objectKey).toBe('tenant-a/sample');
		expect(validateUploadOrigin(ticket.uploadUrl, ['https://storage.example.test'])).toBe(true);
		expect(validateUploadOrigin(ticket.uploadUrl, ['https://evil.example.test'])).toBe(false);
	});
	it('invalidates a session after logout', async () => {
		const server = makeMockBackend();
		const options = {
			baseUrl: 'https://mock.local',
			path: '/auth/logout',
			method: 'POST',
			headers: { authorization: 'Bearer alice', 'x-csrf-token': 'csrf-alice' }
		};
		await requestJson(server.fetch, options);
		await expect(
			requestJson(server.fetch, {
				baseUrl: 'https://mock.local',
				path: '/auth/me',
				headers: { authorization: 'Bearer alice' }
			})
		).rejects.toMatchObject({ status: 401 });
	});
});
