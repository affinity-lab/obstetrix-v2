export type BuildTemplate = {
  id:               string;
  label:            string;
  description:      string;
  buildCmd:         string;
  healthPath:       string;  // path only, e.g. /health
  healthTimeout:    number;
  persistentDirs:   string;  // comma-separated
  defaultInstances: number;
};

export const BUILD_TEMPLATES: BuildTemplate[] = [
  {
    id:               'bun',
    label:            'Bun app',
    description:      'Bun-based server (e.g. Elysia, Hono, plain Bun.serve)',
    buildCmd:         'bun install && bun run build',
    healthPath:       '/health',
    healthTimeout:    30,
    persistentDirs:   '',
    defaultInstances: 1,
  },
  {
    id:               'sveltekit-bun',
    label:            'SvelteKit (Bun)',
    description:      'SvelteKit app with adapter-node, running via Bun',
    buildCmd:         'bun install && bun run build',
    healthPath:       '/',
    healthTimeout:    30,
    persistentDirs:   '',
    defaultInstances: 1,
  },
  {
    id:               'node-npm',
    label:            'Node.js (npm)',
    description:      'Any Node.js app built with npm',
    buildCmd:         'npm ci && npm run build',
    healthPath:       '/health',
    healthTimeout:    45,
    persistentDirs:   '',
    defaultInstances: 1,
  },
  {
    id:               'nextjs',
    label:            'Next.js (npm)',
    description:      'Next.js app with standalone output',
    buildCmd:         'npm ci && npm run build',
    healthPath:       '/api/health',
    healthTimeout:    60,
    persistentDirs:   '.next/cache',
    defaultInstances: 1,
  },
  {
    id:               'go',
    label:            'Go binary',
    description:      'Go application compiled to a single binary',
    buildCmd:         'go build -o app .',
    healthPath:       '/health',
    healthTimeout:    15,
    persistentDirs:   '',
    defaultInstances: 2,
  },
  {
    id:               'python',
    label:            'Python (pip)',
    description:      'Python app with pip dependencies',
    buildCmd:         'pip install -r requirements.txt',
    healthPath:       '/health',
    healthTimeout:    30,
    persistentDirs:   '',
    defaultInstances: 1,
  },
  {
    id:               'static',
    label:            'Static site',
    description:      'Build generates a dist/ or public/ directory, served by a static file server',
    buildCmd:         'bun install && bun run build',
    healthPath:       '/',
    healthTimeout:    15,
    persistentDirs:   '',
    defaultInstances: 1,
  },
];

/** Generate a project.conf key=value string from a template and user overrides. */
export function templateToConf(
  t: BuildTemplate,
  repoUrl: string,
  branch: string,
): string {
  const lines = [
    `REPO_URL=${repoUrl}`,
    `BRANCH=${branch || 'main'}`,
    `BUILD_CMD=${t.buildCmd}`,
    `HEALTH_CHECK_URL=http://127.0.0.1:$PORT${t.healthPath}`,
    `HEALTH_TIMEOUT=${t.healthTimeout}`,
    `ROLLBACK_ON_FAIL=true`,
    `DEFAULT_INSTANCES=${t.defaultInstances}`,
  ];
  if (t.persistentDirs) {
    lines.push(`PERSISTENT_DIRS=${t.persistentDirs}`);
  }
  return lines.join('\n');
}
