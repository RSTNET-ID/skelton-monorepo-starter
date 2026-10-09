/** Presentation helper only. Bun must authorize every API request. */
export function canAccess(permissions: readonly string[], needed?: string): boolean {
	return !needed || permissions.includes(needed);
}
