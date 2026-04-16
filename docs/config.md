# Configuration Reference

---

## `/etc/obstetrix/obstetrix.conf`

The single master config file. Key=value format. Comments begin with `#`.

**Permissions:** `root:obstetrix 640` — readable by the GUI and orchestrator, not by project users.

Environment variables override values in this file — the orchestrator checks `os.Getenv` first.

### Core settings

| Key | Default | Description |
|-----|---------|-------------|
| `CONFIG_ROOT` | `/etc/obstetrix` | Platform config root |
| `PROJECTS_DIR` | `/obstetrix-projects` | Root for all project app and work directories |
| `STATE_DIR` | `/var/obstetrix/state` | Per-project state JSON files |
| `LOG_DIR` | `/var/obstetrix/logs` | Per-project deploy JSONL log files |
| `BACKUP_DIR` | `/var/obstetrix/backups` | Default backup destination |
| `SOCKET_PATH` | `/run/obstetrix/orchestrator.sock` | Unix socket path |
| `GITHUB_TOKEN` | (required) | GitHub PAT — `contents:read` for public, `repo` for private |
| `GITHUB_POLL_INTERVAL` | `30s` | How often to check GitHub for new commits |
| `GITHUB_TIMEOUT` | `10s` | Timeout for GitHub API requests |
| `BACKUP_SCHEDULE` | `0 3 * * *` | Default backup cron schedule (UTC, 5-field) — `off` to disable |
| `BACKUP_RETENTION` | `7` | Default number of backup archives to keep per project |
| `LOG_LEVEL` | `info` | Orchestrator log verbosity: `info` or `debug` |
| `GUI_PORT` | `3000` | Port the SvelteKit GUI listens on |
| `GUI_HOST` | `127.0.0.1` | Interface the GUI binds to |

### Port assignments

Port assignments are auto-managed by `obstetrix-ctl project create/delete`. Do not edit by hand.

```ini
# Format: PORT.{name}=base_port:count
PORT.api=4000:4       # api reserves ports 4000, 4001, 4002, 4003
PORT.payments=4004:2  # payments reserves ports 4004, 4005
```

**Allocation range:** 4000–9999. The orchestrator returns an error if no gap is available.

### Full example

```ini
# /etc/obstetrix/obstetrix.conf   root:obstetrix 640

CONFIG_ROOT=/etc/obstetrix
PROJECTS_DIR=/obstetrix-projects
STATE_DIR=/var/obstetrix/state
LOG_DIR=/var/obstetrix/logs
BACKUP_DIR=/var/obstetrix/backups
SOCKET_PATH=/run/obstetrix/orchestrator.sock

GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_POLL_INTERVAL=30s
GITHUB_TIMEOUT=10s

BACKUP_SCHEDULE=0 3 * * *
BACKUP_RETENTION=7

LOG_LEVEL=info
GUI_PORT=3000
GUI_HOST=127.0.0.1

PORT.api=4000:4
PORT.payments=4004:2
```

---

## `/etc/obstetrix/projects/{name}/project.conf`

One subdirectory per project. The directory name is the project name.

**Permissions:** `root:obstetrix 640`

| Key | Required | Default | Description |
|-----|----------|---------|-------------|
| `REPO_URL` | yes | — | HTTPS GitHub repository URL |
| `BRANCH` | — | `main` | Branch to track |
| `BUILD_CMD` | yes | — | Build command run in `_work/{name}/` — overridden by `obstetrix.json build.command` |
| `HEALTH_CHECK_URL` | — | `` | Full health check URL — overridden by `obstetrix.json health.path` |
| `HEALTH_TIMEOUT` | — | `60` | Seconds to wait for health check to pass |
| `ROLLBACK_ON_FAIL` | — | `true` | Auto-rollback on deploy failure |
| `DEFAULT_INSTANCES` | — | `1` | Instances to start on first deploy |
| `PERSISTENT_DIRS` | — | `` | Comma-separated subdirs that survive all deploys (e.g., `uploads,data`) |
| `BACKUP_SCHEDULE` | — | global | Per-project cron schedule — `off` to disable |
| `BACKUP_RETENTION` | — | global | Archives to keep (0 = use global default) |
| `BACKUP_DIR` | — | global | Custom backup destination |
| `BACKUP_INCLUDE_DATA` | — | `true` | Include persistent dirs in backups |
| `BACKUP_INCLUDE_ENV` | — | `true` | Include `.env` and `.npmrc` in backups |
| `AUTO_DEPLOY` | — | `true` | Auto-deploy when the poller detects a new commit. Set to `false` for manual-only deploys. Has no effect on projects that have never been deployed — those always require an explicit first deploy. |

Note: `BASE_PORT` and `PORT_COUNT` are set automatically from `PORT.{name}` in `obstetrix.conf`. Do not set them manually.

```ini
# /etc/obstetrix/projects/api/project.conf

REPO_URL=https://github.com/yourorg/api
BRANCH=main
BUILD_CMD=bun install && bun run build
HEALTH_CHECK_URL=http://127.0.0.1:4000/health
HEALTH_TIMEOUT=60
ROLLBACK_ON_FAIL=true
AUTO_DEPLOY=true
DEFAULT_INSTANCES=1
PERSISTENT_DIRS=uploads,data
```

---

## `.env` and `.npmrc`

Located at `/etc/obstetrix/projects/{name}/.env` and `.npmrc`.

These files are synced into the project's work and deploy directories on every deploy. They support `${VAR}` substitution — placeholders are resolved against values in `obstetrix.conf`.

```bash
# /etc/obstetrix/projects/api/.env
NODE_ENV=production
ORIGIN=https://api.example.com
CHECK_ORIGIN=false
PROTOCOL_HEADER=x-forwarded-proto
HOST_HEADER=x-forwarded-host
# DATABASE_URL=${DATABASE_URL}   ← resolved from obstetrix.conf
```

```ini
# /etc/obstetrix/projects/api/.npmrc
frozen-lockfile=true
```

To store a shared secret (e.g., a database URL) and reference it from `.env`:

1. Add `DATABASE_URL=postgres://...` to `/etc/obstetrix/obstetrix.conf`
2. Reference it in the project `.env` as `DATABASE_URL=${DATABASE_URL}`
3. On each deploy, the orchestrator resolves the placeholder before writing it to the app directory

---

## `obstetrix.json` (in the project repo)

An optional file in the **root of the project's git repository**. Read after a successful build from `_work/{name}/obstetrix.json`.

`obstetrix.json` overrides `project.conf` for matching fields. If absent, all settings fall back to `project.conf`.

### Schema

```json
{
  "deploy": {
    "include": ["build/", "package.json", "bun.lockb"],
    "exclude": ["build/**/*.map"]
  },
  "persistent": ["uploads", "data"],
  "start": {
    "command": "bun build/index.js"
  },
  "health": {
    "path": "/health",
    "timeout_seconds": 60,
    "initial_delay_seconds": 2
  },
  "build": {
    "command": "bun install && bun run build"
  }
}
```

### Field reference

| Field | Type | Description |
|-------|------|-------------|
| `deploy.include` | `string[]` | Glob patterns (relative to `_work/{name}/`) to copy into the deploy dir. Required if the file is present. Dirs need trailing `/`. |
| `deploy.exclude` | `string[]` | Patterns within the included set to skip (e.g., `["build/**/*.map"]`) |
| `persistent` | `string[]` | Dir names (relative to the deploy dir) that survive every deploy. Overrides `PERSISTENT_DIRS` in `project.conf`. |
| `start.command` | `string` | Command written to `ExecStart` in the systemd template unit. If changed, the unit is reloaded automatically. |
| `health.path` | `string` | HTTP path polled on `127.0.0.1:{port}` after each service restart. Omit to skip health checks. Overrides `HEALTH_CHECK_URL`. |
| `health.timeout_seconds` | `int` | Total seconds to wait for health to pass (default `60`). Overrides `HEALTH_TIMEOUT`. |
| `health.initial_delay_seconds` | `int` | Seconds to wait before the first health poll (default `2`). |
| `build.command` | `string` | Build command run in `_work/{name}/`. Overrides `BUILD_CMD`. |

`.git/` and `node_modules/` are always excluded from `deploy.include`, regardless of patterns.

If `deploy.include` is absent, the orchestrator copies the entire `_work/{name}/` directory (minus `.git/` and `node_modules/`) to the deploy dir.
