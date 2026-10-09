#!/usr/bin/env bun
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';

const [rootArg, nameArg, portArg] = process.argv.slice(2);
function die(message: string): never { console.error('ERROR: ' + message); process.exit(1); }
if (!rootArg || !nameArg || !portArg) die('Usage: bun scripts/init-deployment.ts <deployments-dir> <deployment-slug> <host-port>');
if (!/^[a-z][a-z0-9-]{2,40}$/.test(nameArg)) die('Slug must be 3-41 lowercase characters, digits, or hyphens, beginning with a letter');
const port = Number(portArg);
if (!Number.isInteger(port) || port < 1024 || port > 65535) die('Host port must be an integer between 1024 and 65535');
const root = resolve(rootArg);
const target = join(root, nameArg);
if (existsSync(target)) die('Deployment folder already exists: ' + target);
for (const sibling of existsSync(root) ? readdirSync(root, { withFileTypes: true }) : []) {
  if (!sibling.isDirectory()) continue;
  const envPath = join(root, sibling.name, '.env');
  if (!existsSync(envPath)) continue;
  const env = readFileSync(envPath, 'utf8');
  const has = (key: string, value: string) => new RegExp('^' + key + '=' + value.replace(/[.*+?^\x24{}()|[\]\\]/g, '\\$&') + '\\s*$', 'm').test(env);
  if (has('APP_PUBLISHED_PORT', String(port))) die('Host port already assigned in ' + sibling.name);
  if (has('COMPOSE_PROJECT_NAME', 'app-' + nameArg)) die('Compose project already assigned in ' + sibling.name);
  if (has('SERVICE_NAME', nameArg)) die('Service name already assigned in ' + sibling.name);
}
const base = resolve(import.meta.dir, '..');
const template = readFileSync(join(base, '.env.example'), 'utf8');
const env = template
  .replace(/^COMPOSE_PROJECT_NAME=.*$/m, 'COMPOSE_PROJECT_NAME=app-' + nameArg)
  .replace(/^SERVICE_NAME=.*$/m, 'SERVICE_NAME=' + nameArg)
  .replace(/^REDIS_NAMESPACE=.*$/m, 'REDIS_NAMESPACE=' + nameArg + ':production')
  .replace(/^APP_PUBLISHED_PORT=.*$/m, 'APP_PUBLISHED_PORT=' + port)
  .replace(/^APP_ENV=.*$/m, 'APP_ENV=production')
  .replace(/^EXAMPLE_ROUTES_ENABLED=.*$/m, 'EXAMPLE_ROUTES_ENABLED=false')
  .replace(/^DB_TLS_MODE=.*$/m, 'DB_TLS_MODE=verify-full');
mkdirSync(target, { recursive: false });
writeFileSync(join(target, '.env'), env, { mode: 0o600, flag: 'wx' });
writeFileSync(join(target, 'docker-compose.yml'), readFileSync(join(base, 'docker-compose.yml')), { flag: 'wx' });
console.log('Created ' + target + ' (two files). Replace placeholder registry/database/Redis values before deploy.');
