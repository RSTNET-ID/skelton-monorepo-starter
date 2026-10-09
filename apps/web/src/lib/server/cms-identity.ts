/** Strictly decode auth identity; never trust TypeScript casts for permission checks. */
export interface CmsIdentity {
	id: string;
	name: string;
	permissions: string[];
}
export function decodeCmsIdentity(value: unknown): CmsIdentity {
	if (typeof value !== 'object' || value === null) throw new Error('Invalid auth identity');
	if (!('id' in value) || typeof value.id !== 'string' || !value.id)
		throw new Error('Invalid auth identity');
	if (!('name' in value) || typeof value.name !== 'string')
		throw new Error('Invalid auth identity');
	if (
		'permissions' in value &&
		(!Array.isArray(value.permissions) ||
			!value.permissions.every((x: unknown) => typeof x === 'string'))
	)
		throw new Error('Invalid auth permissions');
	return {
		id: value.id,
		name: value.name,
		permissions:
			'permissions' in value && Array.isArray(value.permissions)
				? (value.permissions as string[])
				: []
	};
}
