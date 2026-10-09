export function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function toErrorMessage(error: unknown, fallback = 'Terjadi kesalahan'): string {
	if (error instanceof Error && error.message.trim()) return error.message;
	return fallback;
}

export function uniqueBy<T, K>(items: readonly T[], getKey: (item: T) => K): T[] {
	const keys = new Set<K>();
	return items.filter((item) => {
		const key = getKey(item);
		if (keys.has(key)) return false;
		keys.add(key);
		return true;
	});
}

export function omitEmpty<T extends Record<string, unknown>>(object: T): Partial<T> {
	return Object.fromEntries(
		Object.entries(object).filter(
			([, value]) => value !== null && value !== undefined && value !== ''
		)
	) as Partial<T>;
}
