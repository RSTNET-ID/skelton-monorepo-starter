/** Shared transport DTOs. Opt in only when the Bun endpoint uses these shapes. */
export interface ApiResponse<TData> {
	data: TData;
	success: boolean;
	message?: string;
	code?: string;
}

export interface OffsetPaginatedResponse<TItem> {
	items: TItem[];
	total: number;
	page: number;
	pageSize: number;
}

export interface ApiFieldErrors {
	fields?: Record<string, string[]>;
	errors?: Record<string, string | string[]>;
}

export type ApiSortDirection = 'asc' | 'desc';

export interface OffsetPageQuery {
	page: number;
	pageSize: number;
	search?: string;
	sortBy?: string;
	sortDir?: ApiSortDirection;
}

/** Default pagination contract. Cursors are opaque and bound to the current filter/sort. */
export interface CursorPageQuery {
	cursor?: string | null;
	limit: number;
	search?: string;
	sortBy?: string;
	sortDir?: ApiSortDirection;
}

export interface CursorPageResponse<TItem> {
	items: TItem[];
	nextCursor: string | null;
	hasNextPage: boolean;
	total?: number;
}
