const baseEnv: Record<string, string> = {};
for (const [key, value] of Object.entries(process.env)) {
  if (value !== undefined) baseEnv[key] = value;
}

const isEnabled = (value: string | undefined) =>
  ['1', 'true', 'yes', 'on'].includes((value ?? '').trim().toLowerCase());

const publicPort = baseEnv.PORT ?? '3000';
const apiPort = baseEnv.API_INTERNAL_PORT ?? '3001';

if (publicPort === apiPort) {
  throw new Error('PORT and API_INTERNAL_PORT must be different');
}

async function runOneShot(label: string, command: string[]): Promise<void> {
  process.stdout.write(`[supervisor] ${label}...\n`);
  const child = Bun.spawn({
    cmd: command,
    cwd: '/app',
    env: baseEnv,
    stdin: 'inherit',
    stdout: 'inherit',
    stderr: 'inherit'
  });
  const exitCode = await child.exited;
  if (exitCode !== 0) {
    throw new Error(`${label} failed with exit code ${exitCode}`);
  }
}

if (isEnabled(baseEnv.AUTO_MIGRATE)) {
  await runOneShot('applying database migrations', ['/app/api/migrate', 'up']);
}

if (isEnabled(baseEnv.AUTO_SEED)) {
  await runOneShot('running database seeders', ['/app/api/seed', 'run']);
}

const api = Bun.spawn({
  cmd: ['/app/api/server'],
  cwd: '/app',
  env: {
    ...baseEnv,
    PORT: apiPort,
    SERVER_HOST: '127.0.0.1'
  },
  stdin: 'inherit',
  stdout: 'inherit',
  stderr: 'inherit'
});

async function waitForApi(): Promise<void> {
  const deadline = Date.now() + 20_000;
  const healthUrl = `http://127.0.0.1:${apiPort}/health/live`;

  while (Date.now() < deadline) {
    if (api.exitCode !== null) {
      throw new Error(`API exited during startup with code ${api.exitCode}`);
    }

    try {
      const response = await fetch(healthUrl);
      if (response.ok) return;
    } catch {
      // API listener is not ready yet.
    }

    await Bun.sleep(200);
  }

  api.kill('SIGTERM');
  throw new Error('API did not become live before startup deadline');
}

await waitForApi();

const web = Bun.spawn({
  cmd: ['/app/web/server'],
  cwd: '/app',
  env: {
    ...baseEnv,
    HOST: '0.0.0.0',
    PORT: publicPort,
    API_PROXY_TARGET: `http://127.0.0.1:${apiPort}`,
    API_BASE_URL: `http://127.0.0.1:${apiPort}/api`,
    PUBLIC_API_BASE_URL: '/api'
  },
  stdin: 'inherit',
  stdout: 'inherit',
  stderr: 'inherit'
});

let stopping = false;
let requestedShutdown = false;

function stopChildren(signal: 'SIGINT' | 'SIGTERM') {
  if (stopping) return;
  stopping = true;
  if (api.exitCode === null) api.kill(signal);
  if (web.exitCode === null) web.kill(signal);
}

process.on('SIGTERM', () => {
  requestedShutdown = true;
  stopChildren('SIGTERM');
});
process.on('SIGINT', () => {
  requestedShutdown = true;
  stopChildren('SIGINT');
});

const firstExit = await Promise.race([
  api.exited.then((code) => ({ name: 'api', code })),
  web.exited.then((code) => ({ name: 'web', code }))
]);

if (!stopping) {
  process.stderr.write(
    `[supervisor] ${firstExit.name} exited unexpectedly with code ${firstExit.code}; stopping container\n`
  );
  stopChildren('SIGTERM');
}

await Promise.allSettled([api.exited, web.exited]);
process.exit(requestedShutdown ? 0 : firstExit.code || 1);
