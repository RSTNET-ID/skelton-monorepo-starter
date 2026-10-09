import type { Fetcher } from '../../src/lib/api/request.ts';

export interface MockSession {
	token: string;
	userId: string;
	tenantId: string;
	permissions: string[];
	csrf: string;
	active: boolean;
}

export interface MockRecord {
	id: string;
	tenantId: string;
	name: string;
}

export interface MockBackend {
	fetch: Fetcher;
	sessions: Map<string, MockSession>;
}

function json(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
	});
}

/** Test-only security model. It is never wired into production routes. */
export function makeMockBackend(): MockBackend {
	const sessions = new Map<string, MockSession>([
		[
			'alice',
			{
				token: 'alice',
				userId: 'alice',
				tenantId: 'tenant-a',
				permissions: ['records.read', 'records.write', 'files.write'],
				csrf: 'csrf-alice',
				active: true
			}
		],
		[
			'bob',
			{
				token: 'bob',
				userId: 'bob',
				tenantId: 'tenant-b',
				permissions: ['records.read'],
				csrf: 'csrf-bob',
				active: true
			}
		]
	]);
	const records: MockRecord[] = [
		{ id: 'a1', tenantId: 'tenant-a', name: 'Alpha' },
		{ id: 'a2', tenantId: 'tenant-a', name: 'Beta' },
		{ id: 'b1', tenantId: 'tenant-b', name: 'Private B' }
	];
	const fetch: Fetcher = async (input, init = {}) => {
		const url = new URL(String(input), 'https://mock.local');
		const headers = new Headers(init.headers);
		const session = sessions.get(headers.get('authorization')?.replace(/^Bearer /, '') ?? '');
		if (!session?.active) return json({ code: 'UNAUTHENTICATED' }, 401);
		if (url.pathname === '/auth/me') {
			return json({ id: session.userId, name: session.userId, permissions: session.permissions });
		}
		if (url.pathname === '/auth/logout' && init.method === 'POST') {
			if (headers.get('x-csrf-token') !== session.csrf) return json({ code: 'CSRF_INVALID' }, 403);
			session.active = false;
			return json({ success: true });
		}
		if (url.pathname === '/records' && (!init.method || init.method === 'GET')) {
			if (!session.permissions.includes('records.read')) return json({ code: 'FORBIDDEN' }, 403);
			const limit = Number(url.searchParams.get('limit') ?? 10);
			if (!Number.isInteger(limit) || limit < 1 || limit > 50)
				return json({ code: 'INVALID_LIMIT' }, 400);
			const visible = records
				.filter((item) => item.tenantId === session.tenantId)
				.sort((a, b) => a.id.localeCompare(b.id));
			const cursor = url.searchParams.get('cursor');
			if (cursor && !visible.some((item) => item.id === cursor))
				return json({ code: 'INVALID_CURSOR' }, 400);
			const start = cursor ? visible.findIndex((item) => item.id === cursor) + 1 : 0;
			const items = visible.slice(start, start + limit);
			return json({
				items,
				nextCursor: visible[start + limit]?.id ? (items.at(-1)?.id ?? null) : null,
				hasNextPage: start + limit < visible.length
			});
		}
		if (url.pathname.startsWith('/records/') && (!init.method || init.method === 'GET')) {
			const record = records.find((item) => item.id === url.pathname.split('/').at(-1));
			if (!record || record.tenantId !== session.tenantId) return json({ code: 'NOT_FOUND' }, 404);
			return session.permissions.includes('records.read')
				? json(record)
				: json({ code: 'FORBIDDEN' }, 403);
		}
		if (url.pathname === '/uploads/ticket' && init.method === 'POST') {
			if (headers.get('x-csrf-token') !== session.csrf) return json({ code: 'CSRF_INVALID' }, 403);
			if (!session.permissions.includes('files.write')) return json({ code: 'FORBIDDEN' }, 403);
			return json({
				uploadUrl: 'https://storage.example.test/upload',
				objectKey: session.tenantId + '/sample',
				method: 'PUT'
			});
		}
		return json({ code: 'NOT_FOUND' }, 404);
	};
	return { fetch, sessions };
}
