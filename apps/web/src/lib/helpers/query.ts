export type QueryValue =
	string | number | boolean | null | undefined | ReadonlyArray<string | number | boolean>;

export function buildQuery(params: Record<string, QueryValue>): string {
	const qs = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value === undefined || value === null || value === '') continue;
		const entries = Array.isArray(value) ? value : [value];
		for (const entry of entries) qs.append(key, String(entry));
	}
	return qs.toString();
}

export function parsePositiveInt(
	value: string | null | undefined,
	fallback: number,
	max = 1000
): number {
	const numeric = Number(value);
	return Number.isSafeInteger(numeric) && numeric > 0 ? Math.min(numeric, max) : fallback;
}

export function paginationInfo(page: number, limit: number, total: number) {
	const safeLimit = Math.max(1, Math.trunc(limit));
	const safeTotal = Math.max(0, Math.trunc(total));
	const pages = Math.max(1, Math.ceil(safeTotal / safeLimit));
	const current = Math.min(pages, Math.max(1, Math.trunc(page)));
	return {
		page: current,
		limit: safeLimit,
		total: safeTotal,
		pages,
		offset: (current - 1) * safeLimit,
		hasNext: current < pages,
		hasPrevious: current > 1
	};
}
