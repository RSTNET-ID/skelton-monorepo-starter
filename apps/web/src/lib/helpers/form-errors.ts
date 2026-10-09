import { isRecord } from './objects.ts';

export type FieldErrors = Record<string, string[]>;

function messages(value: unknown): string[] {
	if (typeof value === 'string' && value.trim()) return [value];
	if (Array.isArray(value))
		return value.filter(
			(entry): entry is string => typeof entry === 'string' && entry.trim().length > 0
		);
	return [];
}

/** Normalize Bun API validation responses without trusting arbitrary error payloads. */
export function mapFieldErrors(payload: unknown): FieldErrors {
	if (!isRecord(payload)) return {};
	const source = isRecord(payload.fields)
		? payload.fields
		: isRecord(payload.errors)
			? payload.errors
			: null;
	if (!source) return {};
	const result: FieldErrors = {};
	for (const [field, detail] of Object.entries(source)) {
		if (!/^[a-zA-Z0-9_.-]{1,100}$/.test(field)) continue;
		const list = messages(detail);
		if (list.length) result[field] = list;
	}
	return result;
}

export function firstFieldError(errors: FieldErrors, field: string): string | undefined {
	return errors[field]?.[0];
}
