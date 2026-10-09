/** Presentation-only formatters. Money calculations belong in decimal-safe backend code. */
export function formatCurrency(value: number | string, currency = 'IDR', locale = 'id-ID'): string {
	const parsed = Number(value);
	if (!Number.isFinite(parsed)) return '';
	return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(parsed);
}

export function formatNumber(value: number | string, locale = 'id-ID', digits = 2): string {
	const parsed = Number(value);
	if (!Number.isFinite(parsed)) return '';
	return new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(parsed);
}

/** value 12.5 means 12.5%, not a decimal fraction 0.125. */
export function formatPercent(value: number | string, locale = 'id-ID', digits = 2): string {
	const result = formatNumber(value, locale, digits);
	return result ? `${result}%` : '';
}

export function formatDate(
	value: string | Date | null | undefined,
	locale = 'id-ID',
	timeZone = 'Asia/Jakarta'
): string {
	if (!value) return '';
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return '';
	return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone }).format(date);
}

export function formatDateTime(
	value: string | Date | null | undefined,
	locale = 'id-ID',
	timeZone = 'Asia/Jakarta'
): string {
	if (!value) return '';
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return '';
	return new Intl.DateTimeFormat(locale, {
		dateStyle: 'medium',
		timeStyle: 'short',
		timeZone
	}).format(date);
}
