export function initials(value: string, max = 2): string {
	return value
		.trim()
		.split(/\s+/u)
		.filter(Boolean)
		.slice(0, Math.max(0, max))
		.map((part) => part[0]?.toLocaleUpperCase() ?? '')
		.join('');
}

export function truncate(text: string, maxLength: number, suffix = '…'): string {
	if (maxLength <= 0) return '';
	if (text.length <= maxLength) return text;
	if (suffix.length >= maxLength) return suffix.slice(0, maxLength);
	return text.slice(0, maxLength - suffix.length).trimEnd() + suffix;
}

export function humanizeKey(key: string): string {
	return key
		.replace(/([a-z\d])([A-Z])/g, '$1 $2')
		.replace(/[_-]+/g, ' ')
		.trim()
		.replace(/^./, (v) => v.toUpperCase());
}

export function normalizeSearch(value: string): string {
	return value.trim().replace(/\s+/g, ' ');
}
