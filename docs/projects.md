# Project Lifecycle

---

## 1. Create a project

```bash
obstetrix-ctl project create myapp --ports 4
```

This allocates 4 consecutive ports starting from the next available slot (e.g., 4000–4003), writes the port assignment to `/etc/obstetrix/obstetrix.conf`, and creates a config folder with template files:

```
/etc/obstetrix/projects/myapp/
├── project.conf   ← edit this
├── .env           ← edit this
└── .npmrc         ← edit this (optional)
```

---

## 2. Configure the project

Edit the project config:

```bash
sudo nano /etc/obstetrix/projects/myapp/project.conf
```

Minimum required fields:

```ini
REPO_URL=https://github.com/yourorg/myapp
BUILD_CMD=bun install && bun run build
```

Commonly useful fields:

```ini
BRANCH=main
HEALTH_CHECK_URL=http://127.0.0.1:4000/health
HEALTH_TIMEOUT=60
ROLLBACK_ON_FAIL=true
DEFAULT_INSTANCES=1
PERSISTENT_DIRS=uploads,data
```

See [config.md](config.md) for the full field reference.

---

## 3. Set up environment variables

```bash
sudo nano /etc/obstetrix/projects/myapp/.env
```

```bash
NODE_ENV=production
ORIGIN=https://myapp.example.com
CHECK_ORIGIN=false
PROTOCOL_HEADER=x-forwarded-proto
HOST_HEADER=x-forwarded-host
```

Values support `${VAR}` substitution from `obstetrix.conf`:

```bash
DATABASE_URL=${DATABASE_URL}  # resolved from /etc/obstetrix/obstetrix.conf
```

---

## 4. (Optional) Add `obstetrix.json` to your repo

Create `obstetrix.json` in your project's git root to control which files get deployed and override build/health settings:

```json
{
  "deploy": {
    "include": ["build/", "package.json", "bun.lockb"],
    "exclude": []
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

Without this file, obstetrix copies everything from the build workspace to the deploy directory (minus `.git/` and `node_modules/`).

---

## 5. Trigger the first deploy

```bash
obstetrix-ctl deploy myapp
```

On first deploy, obstetrix bootstraps the project automatically:

1. Creates system user `obstetrix-myapp`
2. Creates `/obstetrix-projects/myapp/` (deploy dir) and `/obstetrix-projects/_work/myapp/` (build workspace)
3. Writes `/var/obstetrix/.netrc` with the GitHub token for git authentication
4. Clones the repository into `_work/myapp/`
5. Writes `/etc/systemd/system/myapp@.service` (template unit)
6. Writes `scale.sh` into the deploy directory

Then the normal 12-step deploy pipeline runs (see **Deploy pipeline** below).

---

## 6. Monitor the deploy

```bash
# Stream live log output
obstetrix-ctl logs myapp --follow

# Check status when done
obstetrix-ctl status myapp
```

---

## Deploy pipeline

Every deploy (including the first) runs these steps in order:

| Step | Action |
|------|--------|
| 1 | Ensure system user, dirs, git clone, systemd unit |
| 2 | Sync `.env` + `.npmrc` into `_work/myapp/` |
| 3 | `git fetch origin` in `_work/myapp/` |
| 4 | `git checkout {sha}` in `_work/myapp/` |
| 5 | Read `obstetrix.json` from `_work/myapp/` |
| 6 | Run build command in `_work/myapp/` as `obstetrix-myapp` |
| 7 | Re-read `obstetrix.json` (build may have generated it) |
| 8 | Ensure persistent dirs exist in deploy dir (never deleted) |
| 9 | Copy deploy artifacts: `_work/myapp/` → `/obstetrix-projects/myapp/` |
| 10 | Write `.env` + `.npmrc` to deploy dir |
| 11 | Update `ExecStart` in systemd unit if `start.command` changed |
| 12 | Rolling restart: for each running port → restart → health check |

**Rolling restart detail:** For each running instance port: `systemctl restart myapp@{port}.service` → wait `initial_delay_seconds` → poll `GET http://127.0.0.1:{port}{health.path}` every 1s → pass or timeout. If health check fails and `ROLLBACK_ON_FAIL=true`, a rollback is triggered automatically.

---

## 7. Scale instances

```bash
obstetrix-ctl scale myapp 3
```

Scales to 3 instances (ports 4000, 4001, 4002). Starts or stops `myapp@{port}.service` units without a redeploy. Scaling up does not run the build — it starts new instances of the currently deployed code.

The maximum is `PORT_COUNT` (set when you ran `project create --ports N`).

From the GUI: use the scale slider on the project detail page and click **apply**.

---

## 8. Rollback

Roll back to the previously deployed SHA:

```bash
obstetrix-ctl rollback myapp
```

Rollback checks out the previous SHA in `_work/myapp/` and re-runs the full deploy pipeline (rebuild + rolling restart). It does not skip the build step.

Automatic rollback: if `ROLLBACK_ON_FAIL=true` in `project.conf` and a deploy's health check fails, the orchestrator triggers rollback automatically.

---

## 9. Update environment variables without a full redeploy

After changing `.env`:

```bash
obstetrix-ctl config reload   # makes orchestrator aware of the new file
```

Then sync it to running instances via the GUI (**Settings → project → .env → Sync now**) or trigger a full redeploy:

```bash
obstetrix-ctl deploy myapp
```

A "sync" pushes the resolved `.env` to the deploy dir and does a rolling restart — no git pull, no build.

---

## 10. Persistent directories

Directories listed in `PERSISTENT_DIRS` (or `obstetrix.json persistent[]`) are **never touched** by any deploy, rollback, or delete operation. They are created once (on first deploy) and survive forever.

```ini
PERSISTENT_DIRS=uploads,data,cache
```

This creates:
- `/obstetrix-projects/myapp/uploads/`
- `/obstetrix-projects/myapp/data/`
- `/obstetrix-projects/myapp/cache/`

These directories are owned by `obstetrix-myapp` and writable by the running app. They are excluded from `deploy.include` globs regardless of what the manifest says.

---

## 11. Delete a project

```bash
obstetrix-ctl project delete myapp
```

This:
- Stops all `myapp@*.service` instances
- Removes `/etc/systemd/system/myapp@.service`
- Removes `/etc/obstetrix/projects/myapp/`
- Removes `PORT.myapp` from `obstetrix.conf`
- Removes `/obstetrix-projects/myapp/` and `/obstetrix-projects/_work/myapp/`

Preserved (never deleted by `project delete`):
- `/var/obstetrix/state/myapp.json`
- `/var/obstetrix/logs/myapp/`
- `/var/obstetrix/backups/myapp/`
- System user `obstetrix-myapp`

---

## Directory layout after first deploy

```
/etc/obstetrix/projects/myapp/
├── project.conf       ← your config
├── .env               ← your env vars
└── .npmrc             ← your npm config

/obstetrix-projects/
├── _work/myapp/       ← git clone + node_modules (build workspace)
│   ├── .git/
│   ├── node_modules/
│   ├── build/
│   └── obstetrix.json
└── myapp/             ← deployed files (served by systemd)
    ├── .env           ← written from /etc/obstetrix/projects/myapp/.env
    ├── .npmrc
    ├── build/         ← copied from _work/myapp/ per obstetrix.json
    ├── uploads/       ← PERMANENT
    ├── data/          ← PERMANENT
    └── scale.sh       ← written by bootstrap

/var/obstetrix/
├── state/myapp.json   ← current state (SHA, instances, history)
└── logs/myapp/        ← deploy JSONL logs
```
