import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const name = process.argv[2];
if (!name || !/^[a-z][a-z0-9-]{1,48}$/.test(name) || name.includes('--') || name.endsWith('-')) {
	console.error('Usage: bun run make:module <kebab-name>');
	process.exit(1);
}
const root = join(process.cwd(), 'src', 'lib', 'modules', name);
if (existsSync(root)) {
	console.error('Module already exists: ' + name);
	process.exit(1);
}
const pascal = name
	.split('-')
	.map((part) => part[0].toUpperCase() + part.slice(1))
	.join('');
mkdirSync(root, { recursive: true });
const files: Record<string, string> = {
	'types.ts': `export interface ${pascal}Item {
  id: string;
  name: string;
}

export interface ${pascal}List {
  items: ${pascal}Item[];
  nextCursor: string | null;
  hasNextPage: boolean;
}
`,
	'api.ts': `import { apiFetch } from '#lib/api/client.ts';
import type { ${pascal}List } from './types.ts';

export function list${pascal}(cursor: string | null = null, signal?: AbortSignal): Promise<${pascal}List> {
  return apiFetch<${pascal}List>({ path: '/${name}' + (cursor ? '?cursor=' + encodeURIComponent(cursor) : ''), method: 'GET', signal });
}
`,
	'README.md': `# ${pascal} module

This module is frontend-only. Update the Bun API path and contract in api.ts.
Validate untrusted responses and check permissions on every Bun endpoint.
Use shared UI components and ID/EN translation keys for any new pages.
`
};
for (const [path, contents] of Object.entries(files)) {
	writeFileSync(join(root, path), contents, { flag: 'wx' });
}
console.log('Created: ' + root);
