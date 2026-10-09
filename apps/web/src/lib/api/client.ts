import { PUBLIC_API_BASE_URL } from '$app/env/public';
import { requestJson, type ApiRequestOptions } from './request.ts';

export type ClientApiOptions = Omit<ApiRequestOptions, 'baseUrl'>;

export function apiFetch<T>(options: ClientApiOptions): Promise<T> {
	return requestJson<T>(fetch, {
		...options,
		baseUrl: PUBLIC_API_BASE_URL,
		credentials: options.credentials ?? 'include'
	});
}
