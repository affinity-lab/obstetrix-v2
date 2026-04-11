# CLI Reference — `obstetrix-ctl`

`obstetrix-ctl` is the command-line interface to the obstetrix orchestrator. It connects to the orchestrator over a Unix socket and sends JSON-RPC requests.

**Socket path:** `/run/obstetrix/orchestrator.sock` (override with `OBSTETRIX_SOCKET` env var)

**Global flag:** `--json` — available on all commands; outputs raw JSON instead of formatted text.

---

## `status`

Show the current status of all projects or a single project.

```bash
obstetrix-ctl status
obstetrix-ctl status <project>
obstetrix-ctl status --json
obstetrix-ctl status <project> --json
```

**Output (all projects):**
```
PROJECT   STATUS      SHA       LAST DEPLOY
api       ● running   a1b2c3d4  2m ago
payments  ● running   f6e5d4c3  1h ago
worker    ✗ failed    b3c4d5e6  4h ago
```

Status icons: `●` running, `◌` building, `✗` failed, `○` stopped, `?` unknown

**Single project output** includes SHA, branch, deploy history, running ports, and instance count.

---

## `deploy`

Trigger a deploy for a project. By default deploys the latest HEAD of the configured branch.

```bash
obstetrix-ctl deploy <project>
obstetrix-ctl deploy <project> --sha <full-or-short-sha>
```

The deploy is queued non-blocking. Watch progress with `logs --follow`.

```bash
obstetrix-ctl deploy api
# deploy queued for api
# watch logs: obstetrix-ctl logs api --follow
```

---

## `rollback`

Roll back a project to the previously deployed SHA.

```bash
obstetrix-ctl rollback <project>
```

Rollback re-runs the full deploy pipeline (`git checkout previousSha`, rebuild, rolling restart). It only works if a previous SHA exists in the project state.

---

## `logs`

Show deploy history or stream live log output.

```bash
obstetrix-ctl logs <project>          # Show recent deploy history
obstetrix-ctl logs <project> --follow # Stream live logs (Ctrl-C to stop)
```

Live streaming shows log lines, status changes, and deploy completion events in real time. Requires the orchestrator to be active and a deploy to be running.

---

## `scale`

Change the number of running instances for a project.

```bash
obstetrix-ctl scale <project> <instances>
```

`<instances>` must be between 1 and the project's `PORT_COUNT`. Scaling starts or stops systemd service instances (`{name}@{port}.service`) without a full redeploy.

```bash
obstetrix-ctl scale api 3
# Starts api@4000, api@4001, api@4002 (stops api@4003 if it was running)
```

---

## `shell`

Open an interactive shell as the project's system user.

```bash
obstetrix-ctl shell <project>
```

Executes `sudo -u obstetrix-{name}` and drops into a bash session in `/obstetrix-projects/{name}/`. Requires the calling user to have sudo access.

Useful for: inspecting the deploy directory, running one-off bun commands, debugging the app.

---

## `config reload`

Reload all project configs from `/etc/obstetrix/projects/` without restarting the orchestrator.

```bash
obstetrix-ctl config reload
# reloaded 3 project config(s)
```

Run this after editing any `project.conf` file. The orchestrator also polls for config changes every 10 seconds automatically.

---

## `project create`

Create a new project and allocate a port pool for it.

```bash
obstetrix-ctl project create <name> [--ports N]
```

| Flag | Default | Description |
|------|---------|-------------|
| `--ports N` | `4` | Number of ports to reserve (determines max instances) |

Port allocation starts from 4000 and fills the first available gap. The assignment is written to `/etc/obstetrix/obstetrix.conf` as `PORT.{name}={base}:{count}`.

```bash
obstetrix-ctl project create api --ports 4
# project 'api' created — base port 4000, count 4 (ports 4000–4003)
# next: edit /etc/obstetrix/projects/api/project.conf then trigger a deploy
```

This creates:
- `/etc/obstetrix/projects/{name}/project.conf` (template)
- `/etc/obstetrix/projects/{name}/.env` (empty)
- `/etc/obstetrix/projects/{name}/.npmrc` (empty)
- `PORT.{name}=...` entry in `obstetrix.conf`

The system user and app directories are created on the **first deploy**, not here.

---

## `project delete`

Delete a project: stop all instances, remove config, free port assignment.

```bash
obstetrix-ctl project delete <name>
```

This stops all `{name}@*.service` units, removes `/etc/obstetrix/projects/{name}/`, removes the `PORT.{name}` entry from `obstetrix.conf`, and removes the project's app directories (`/obstetrix-projects/{name}/` and `/obstetrix-projects/_work/{name}/`).

State files and deploy logs in `/var/obstetrix/` are preserved.

---

## `port list`

List all current port assignments.

```bash
obstetrix-ctl port list
obstetrix-ctl port list --json
```

```
api                   base=4000   count=4    range=4000–4003
payments              base=4004   count=2    range=4004–4005
```

---

## Environment variable

| Variable | Default | Description |
|----------|---------|-------------|
| `OBSTETRIX_SOCKET` | `/run/obstetrix/orchestrator.sock` | Override the socket path |

```bash
# Connect to a non-default socket
OBSTETRIX_SOCKET=/tmp/test.sock obstetrix-ctl status
```
