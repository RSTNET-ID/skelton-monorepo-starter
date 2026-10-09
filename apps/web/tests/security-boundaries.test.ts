import { describe, expect, it } from 'vitest';
import { decodeCmsIdentity } from '../src/lib/server/cms-identity.ts';
import { requestJson } from '../src/lib/api/request.ts';

describe('CMS identity boundary', () => {
	it('accepts valid permissions', () => {
		expect(
			decodeCmsIdentity({ id: 'abc', name: 'User', permissions: ['cms.components.read'] })
				.permissions
		).toEqual(['cms.components.read']);
	});
	it('fails closed on invalid permissions', () => {
		expect(() =>
			decodeCmsIdentity({ id: 'abc', name: 'User', permissions: ['cms.components.read', 5] })
		).toThrow();
		expect(() => decodeCmsIdentity({ id: null, name: 'User' })).toThrow();
		expect(decodeCmsIdentity({ id: 'abc', name: 'User' }).permissions).toEqual([]);
	});
});
describe('request redirect behavior', () => {
	it('allows manual redirect mode without following or reading an external location', async () => {
		let mode = '';
		const fetcher = async (_input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
			mode = init?.redirect ?? '';
			return new Response('', { status: 302, headers: { location: 'https://untrusted.example/' } });
		};
		await expect(
			requestJson(fetcher, { baseUrl: 'https://api.example', path: '/auth/me', redirect: 'manual' })
		).rejects.toMatchObject({ status: 302 });
		expect(mode).toBe('manual');
	});
});
