import { ApiError } from './error.ts';

export type JsonDecoder<T> = (payload: unknown) => T;

export type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export interface ApiRequestOptions extends Omit<RequestInit, 'body' | 'signal'> {
	baseUrl: string;
	path: string;
	body?: BodyInit | null;
	json?: unknown;
	signal?: AbortSignal;
	timeoutMs?: number;
	requestId?: string;
}

export function buildApiUrl(baseUrl: string, path: string): string {
	if (/^https?:\/\//i.test(path)) return path;

	const base = baseUrl === '/' ? '' : baseUrl.replace(/\/+$/, '');
	const suffix = path.replace(/^\/+/, '');

	return suffix ? `${base}/${suffix}` : base || '/';
}

function parseJson(text: string): unknown {
	if (!text) return undefined;

	try {
		return JSON.parse(text);
	} catch {
		return text;
	}
}

function messageFrom(payload: unknown, status: number): string {
	if (typeof payload === 'object' && payload !== null && 'message' in payload) {
		const message = (payload as { message?: unknown }).message;
		if (typeof message === 'string' && message.trim()) return message;
	}

	return `API request failed with status ${status}`;
}

function codeFrom(payload: unknown): string | undefined {
	if (typeof payload === 'object' && payload !== null && 'code' in payload) {
		const code = (payload as { code?: unknown }).code;
		return typeof code === 'string' ? code : undefined;
	}

	return undefined;
}

export async function requestJson<T>(
	fetcher: Fetcher,
	options: ApiRequestOptions,
	decode?: JsonDecoder<T>
): Promise<T> {
	const {
		baseUrl,
		path,
		body: rawBody,
		json,
		signal: externalSignal,
		timeoutMs = 10_000,
		requestId,
		headers: rawHeaders,
		...init
	} = options;

	const controller = new AbortController();
	const timeoutId = setTimeout(
		() => controller.abort(new Error('API request timed out')),
		timeoutMs
	);
	const abort = () => controller.abort(externalSignal?.reason);

	if (externalSignal) {
		if (externalSignal.aborted) abort();
		else externalSignal.addEventListener('abort', abort, { once: true });
	}

	try {
		const headers = new Headers(rawHeaders);
		headers.set('accept', 'application/json');
		if (requestId) headers.set('x-request-id', requestId);

		let body = rawBody;
		if (json !== undefined) {
			headers.set('content-type', 'application/json');
			body = JSON.stringify(json);
		}

		const response = await fetcher(buildApiUrl(baseUrl, path), {
			...init,
			body,
			headers,
			signal: controller.signal
		});

		if (response.status === 204 || response.status === 205) {
			if (!response.ok) {
				throw new ApiError(`API request failed with status ${response.status}`, {
					status: response.status,
					requestId: response.headers.get('x-request-id') ?? requestId
				});
			}
			return undefined as T;
		}

		const payload = parseJson(await response.text());

		if (!response.ok) {
			throw new ApiError(messageFrom(payload, response.status), {
				status: response.status,
				code: codeFrom(payload),
				details: payload,
				requestId: response.headers.get('x-request-id') ?? requestId
			});
		}

		return decode ? decode(payload) : (payload as T);
	} catch (error) {
		if (controller.signal.aborted && !externalSignal?.aborted) {
			throw new ApiError('API request timed out', {
				status: 0,
				code: 'API_TIMEOUT',
				requestId
			});
		}

		throw error;
	} finally {
		clearTimeout(timeoutId);
		externalSignal?.removeEventListener('abort', abort);
	}
}
