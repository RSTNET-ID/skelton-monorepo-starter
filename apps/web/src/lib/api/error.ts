export class ApiError extends Error {
	readonly status: number;
	readonly code?: string;
	readonly details?: unknown;
	readonly requestId?: string;

	constructor(
		message: string,
		options: {
			status: number;
			code?: string;
			details?: unknown;
			requestId?: string;
		}
	) {
		super(message);
		this.name = 'ApiError';
		this.status = options.status;
		this.code = options.code;
		this.details = options.details;
		this.requestId = options.requestId;
	}
}
