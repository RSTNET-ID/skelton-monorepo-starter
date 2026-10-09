import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Reject raw form controls outside the shared UI component layer.
const forbidden = /<\s*(input|select|textarea)\b/g;
const failures: string[] = [];
const allowed = 'src/lib/components/ui';

function scan(folder: string): void {
	for (const entry of readdirSync(folder, { withFileTypes: true })) {
		const path = join(folder, entry.name).replaceAll('\\', '/');
		if (entry.isDirectory()) {
			if (path !== allowed) scan(path);
			continue;
		}
		if (!entry.isFile() || !path.endsWith('.svelte')) continue;
		const lines = readFileSync(path, 'utf8').split(/\r?\n/);
		for (let i = 0; i < lines.length; i++) {
			forbidden.lastIndex = 0;
			if (forbidden.test(lines[i])) failures.push(`${path}:${i + 1}`);
		}
	}
}

scan('src');
if (failures.length) {
	console.error(
		'Native form controls are forbidden outside base UI components:\n' + failures.join('\n')
	);
	process.exit(1);
}
console.log('Base component policy passed');
