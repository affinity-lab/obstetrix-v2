export type ProjectStatus =
  | 'running'    // app service up and passing health checks
  | 'stopped'    // app dir exists but service not running
  | 'building'   // a deploy is currently in progress
  | 'failed'     // last deploy or health check failed
  | 'unknown';   // never deployed or state file missing

export type ProjectState = {
  // Identity
  name:    string;            // project name; matches /etc/obstetrix/projects/{name}/
  appDir:  string;            // absolute path on host, e.g. /obstetrix-projects/api
  appUser: string;            // system user running the app, e.g. obstetrix-api
  workDir: string;            // absolute path to _work dir, e.g. /obstetrix-projects/_work/api

  // Status
  status:  ProjectStatus;

  // Source
  repoUrl:      string;
  targetBranch: string;

  // Deploy tracking
  currentSha:  string | null;   // full 40-char SHA currently running
  previousSha: string | null;   // SHA before last deploy (for rollback)

  // Timing
  lastDeployAt:      string | null; // ISO 8601 UTC
  lastDeployOk:      boolean | null;// null = never deployed
  lastHealthCheckAt: string | null; // ISO 8601 UTC

  // Port pool
  basePort:         number;     // first port in the reserved pool
  portCount:        number;     // total ports reserved; nginx lists all
  instances:        number;     // currently running instance count
  runningPorts:     number[];   // e.g. [4000, 4001, 4002]
  defaultInstances: number;     // instances to start on first deploy

  // Health
  healthCheckUrl: string | null;

  // Persistent dirs (within appDir, git-ignored, never wiped by deploys)
  persistentDirs: string[];     // e.g. ["uploads", "data"]

  // Deploy history — last 20 summaries, newest first
  deployHistory: DeployRecord[];
};

export type DeployRecord = {
  deployId:   string;
  sha:        string;
  at:         string;   // ISO 8601 UTC
  ok:         boolean;
  durationMs: number;
  error:      string | null;
};

export type BuildEvent =
  | { type: 'log';             projectName: string; line: string; level?: 'error'; ts: string }
  | { type: 'status';          projectName: string; status: ProjectStatus; ts: string }
  | { type: 'deploy_complete'; projectName: string; sha: string; ok: boolean; durationMs: number; ts: string };

export type DeployLogMeta = {
  deployId:   string;         // filename stem
  project:    string;
  sha:        string;         // 8-char short SHA
  startedAt:  string;         // ISO 8601 UTC
  ok:         boolean | null; // null = still running
  durationMs: number;         // 0 if running
  path:       string;         // absolute path on host
};

export type DeployLogEntry = {
  ts:          string;
  type:        'start' | 'log' | 'end';
  line?:       string;
  level?:      'error';
  sha?:        string;
  project?:    string;
  ok?:         boolean;
  durationMs?: number;
  error?:      string;
};

export type OrchestratorConfig = {
  configRoot:      string;
  pollInterval:    string;
  githubTimeout:   string;
  socketPath:      string;
  projectsDir:     string;    // /obstetrix-projects
  stateDir:        string;
  logDir:          string;
  backupSchedule:  string;
  backupRetention: number;
  backupDir:       string;
  logLevel:        'info' | 'debug';
};

export type DiskInfo = {
  path:    string;
  label:   string;
  totalGb: number;
  usedGb:  number;
  freeGb:  number;
  usedPct: number;
};

export type DaemonStatus = {
  startedAt:  string;
  uptime:     string;
  socketPath: string;
  configRoot: string;
  version:    string;
  projects:   number;
};

export type BackupResult = {
  path:      string;
  sizeBytes: number;
  createdAt: string;
  label:     string;
};

export type PortEntry = {
  name:  string;
  base:  number;
  count: number;
  ports: number[];
};

export type RpcRequest  = { id: number; method: string; params: unknown };
export type RpcResponse = { id: number; result: unknown } | { id: number; error: { code: number; message: string } };
export type RpcStreamFrame = { stream: true; event: BuildEvent };
