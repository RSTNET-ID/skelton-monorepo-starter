/** Guard against sending bytes or signed URLs to unexpected endpoints. */
export function validateUploadOrigin(
	uploadUrl: string,
	allowedOrigins: readonly string[]
): boolean {
	try {
		const url = new URL(uploadUrl);
		if (url.username || url.password || url.hash) return false;
		if (
			url.protocol !== 'https:' &&
			!(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))
		)
			return false;
		return allowedOrigins.some((origin) => {
			try {
				const allowed = new URL(origin);
				return allowed.origin === origin && allowed.origin === url.origin;
			} catch {
				return false;
			}
		});
	} catch {
		return false;
	}
}
