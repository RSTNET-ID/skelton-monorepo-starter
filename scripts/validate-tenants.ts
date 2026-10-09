#!/usr/bin/env bun
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

type Tenant = {
  folder: string;
  project: string;
  bind: string;
  port: number;
  namespace: string;
  database: string;
  image: string;
  tag: string;
};

function fail(message: string): never {
  console.error("ERROR: " + message);
  process.exit(1);
}

function parseEnv(file: string): Record<string, string> {
  const output: Record<string, string> = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const cleaned = line.trim();
    if (!cleaned || cleaned.startsWith("#")) continue;
    const match = cleaned.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) fail(file + ": invalid entry: " + cleaned.slice(0, 50));
    let value = match[2]!.trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    } else {
      value = value.replace(/\s+#.*$/, "");
    }
    if (output[match[1]!] !== undefined) fail(file + ": repeated key " + match[1]);
    output[match[1]!] = value;
  }
  return output;
}

function required(env: Record<string, string>, key: string, folder: string): string {
  const value = env[key]?.trim();
  if (!value) fail(folder + ": missing " + key);
  return value;
}

function tenant(folder: string): Tenant {
  const env = parseEnv(join(folder, ".env"));
  const project = required(env, "COMPOSE_PROJECT_NAME", folder);
  const bind = required(env, "APP_BIND_HOST", folder);
  const port = Number(required(env, "APP_PUBLISHED_PORT", folder));
  if (!Number.isInteger(port) || port < 1 || port > 65535) fail(folder + ": APP_PUBLISHED_PORT out of range");
  const namespace = required(env, "REDIS_NAMESPACE", folder);
  const database = required(env, "DATABASE_URL", folder);
  const image = required(env, "REGISTRY_IMAGE", folder);
  const tag = required(env, "IMAGE_TAG", folder);
  if (tag === "latest" || tag === "local") fail(folder + ": use a tested immutable IMAGE_TAG, not " + tag);
  if (!/^mysql:/.test(database)) fail(folder + ": DATABASE_URL must use mysql://");
  let databaseIdentity: string;
  try {
    const url = new URL(database);
    if (!url.hostname || !url.pathname || url.pathname === "/") fail(folder + ": database host/name required");
    databaseIdentity = url.hostname.toLowerCase() + ":" + (url.port || "3306") + url.pathname;
  } catch {
    fail(folder + ": malformed DATABASE_URL");
  }
  if (env.APP_ENV === "production" && env.DB_TLS_MODE !== "verify-full") fail(folder + ": production requires DB_TLS_MODE=verify-full");
  if (env.APP_ENV === "production" && env.EXAMPLE_ROUTES_ENABLED === "true") fail(folder + ": production example routes must be disabled");
  return { folder, project, bind, port, namespace, database: databaseIdentity, image, tag };
}

function overlaps(a: string, b: string): boolean {
  return a === b || a === "0.0.0.0" || b === "0.0.0.0" || a === "::" || b === "::";
}

const base = resolve(process.argv[2] ?? ".");
const folders = readdirSync(base).map(name => join(base, name)).filter(path => {
  try { return statSync(path).isDirectory() && statSync(join(path, ".env")).isFile(); }
  catch { return false; }
});
if (folders.length === 0) fail("No tenant folders with .env files found in " + base);
const tenants = folders.map(tenant);
for (let i = 0; i < tenants.length; i++) {
  for (let j = i + 1; j < tenants.length; j++) {
    const a = tenants[i]!, b = tenants[j]!;
    if (a.project === b.project) fail(a.folder + " and " + b.folder + " use the same COMPOSE_PROJECT_NAME");
    if (a.port === b.port && overlaps(a.bind, b.bind)) fail(a.folder + " and " + b.folder + " publish overlapping host IP/port");
    if (a.namespace === b.namespace) fail(a.folder + " and " + b.folder + " use the same REDIS_NAMESPACE");
    if (a.database === b.database) fail(a.folder + " and " + b.folder + " use the same DATABASE_URL");
  }
}
console.log("Validated " + tenants.length + " tenant environments: no duplicate project, bind/port, Redis namespace, or database URL.");
