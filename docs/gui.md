# Web UI Guide

The GUI is a SvelteKit app that connects to the orchestrator over the Unix socket (server-side) and receives live updates over Server-Sent Events (client-side).

**Default URL:** `http://<server-ip>:3000`

For HTTPS access, set up an nginx reverse proxy — see [install.md](install.md#nginx-reverse-proxy).

---

## Navigation

**Desktop:** top nav bar — `obstetrix · dashboard · backups · settings · nginx`

**Mobile:** bottom tab bar — dashboard / backups / settings / nginx

---

## Dashboard (`/`)

Shows a card for each project with:

- **Name** — links to the project detail page
- **Status badge** — live, color-coded: green (running), red (failed), blue (building), grey (stopped/unknown)
- **Current SHA** — first 8 characters of the deployed commit
- **Instances** — running / total reserved
- **Last deployed** — relative time (e.g., "2m ago")
- **Deploy** button — triggers a deploy immediately; button label becomes "deploying…" optimistically

Live updates arrive automatically via SSE. Status badges, SHAs, and last-deploy times update in real time.

**Create project:** a form at the bottom of the dashboard (or on empty state) lets you create a new project. Select a **build template** to pre-fill `REPO_URL`, `BUILD_CMD`, `HEALTH_CHECK_URL`, and instance defaults, then customise as needed.

---

## Project Detail (`/project/{name}`)

Detailed view for a single project:

- Status badge, current SHA, branch, repo URL, last deploy time and ok/fail, instance count, health check URL (if set)

**Actions:**
- **Deploy now** — queues a deploy
- **Deploy sha…** — toggle a SHA input panel; enter any full or short SHA and click **deploy** to pin that exact commit
- **View logs** — live log stream
- **Deploys** — deploy history list
- **Deploy settings** — opens the project config editor (deploy tab)
- **Rollback** (destructive, only shown when a previous SHA exists) — reverts to the previous commit

**Scale slider:**
Drag to set instance count and click **apply**. Instances start or stop immediately. The slider max is the port count allocated for the project.

**Deploy history table:**
Last 20 deploys with SHA, timestamp, ok/failed badge, and duration.

---

## Live Logs (`/project/{name}/logs`)

Real-time log stream with auto-reconnect (exponential backoff, 1 s → 30 s max).

- **Phase headers** (`==>` lines) — highlighted in accent colour
- **Error lines** — highlighted in red (lines starting with `error:`, `fatal:`, `panic:`, etc.)
- **Meta lines** — status/deploy-complete events, shown in muted colour
- **Line count** — shown in the header
- **Auto-scroll** — pauses when you scroll up; **resume** button appears; **clear** empties the buffer
- Buffer holds the last 1 000 lines.

---

## Deploy History (`/project/{name}/deploys`)

Lists all deploy log files with status filter tabs (all / running / ok / failed).

Each row shows: short SHA, start time (absolute + relative), status badge, duration, and a **re-deploy** button to re-queue the same SHA.

Auto-refreshes when a live `cicd:event` arrives.

---

## Deploy Log Detail (`/project/{name}/deploys/{deployId}`)

Full JSONL log viewer for a single deploy:

- Header with project name, SHA, status badge
- Phase headers (`==>` lines) in accent colour; error lines in red
- HH:MM:SS timestamps on each line
- Duration and re-deploy button in the action bar

---

## Settings (`/settings`)

The settings hub shows:

**Daemon status** — version, start time, config root, number of projects loaded.

**Disk usage** — each mount point with used/total GB and percentage.

**Port allocations** — base port and reserved range per project.

**Project config links** — links to the config editor for each project.

**Nginx card** — click to open the nginx site manager.

**Actions:**
- **Reload configs** — re-reads all `project.conf` files (same as `obstetrix-ctl config reload`)
- **Edit obstetrix.conf** — opens the secrets editor

---

## Project Config Editor (`/settings/project/{name}`)

Four-tab editor:

### Deploy tab (default)

Structured form for the most common `project.conf` fields:

| Field | Config key |
|-------|-----------|
| Build command | `BUILD_CMD` |
| Branch | `BRANCH` |
| Persistent dirs | `PERSISTENT_DIRS` |
| Health check URL | `HEALTH_CHECK_URL` |
| Health timeout (s) | `HEALTH_TIMEOUT` |
| Default instances | `DEFAULT_INSTANCES` |
| Rollback on fail | `ROLLBACK_ON_FAIL` |
| Auto-deploy | `AUTO_DEPLOY` |

**Load template…** — choose a build template (Bun, SvelteKit/Bun, Node/npm, Next.js, Go, Python, static) to pre-fill the form fields. Customise and save.

**Auto-deploy switch** — when off, the poller will still detect new commits but will not queue a deploy automatically. Use **Deploy now** on the project detail page to deploy manually. Projects that have never been deployed are always manual regardless of this setting.

### project.conf tab

Raw key=value editor for the full `project.conf`. Load template fills the whole file. Save invalidates the deploy tab so it re-reads values on next visit.

### .env tab

Environment variables written to `/etc/obstetrix/projects/{name}/.env`.

Use `${VAR}` to substitute values from `obstetrix.conf` at deploy time.

**Sync now** — pushes the resolved env to the running deploy directory and performs a rolling restart without a full build.

### .npmrc tab

npm/Bun config written to `/etc/obstetrix/projects/{name}/.npmrc`.

---

## Secrets Editor (`/settings/secrets`)

Edits `/etc/obstetrix/obstetrix.conf` — the main config file containing the GitHub token, global paths, and port assignments.

By default, values for keys containing `TOKEN`, `SECRET`, or `KEY` are masked with `****`. Toggle **mask secret values** to reveal them.

When saving, any line still containing `****` is skipped (preserving the current value). Only lines you actively changed are written back.

---

## Nginx Manager (`/settings/nginx`)

Lists all files in `/etc/nginx/sites-available/` with enabled/disabled badges (based on whether a matching symlink exists in `sites-enabled/`).

**Actions per site:**
- Site name — clickable link to the config editor for that site
- Enable / Disable — creates or removes the `sites-enabled` symlink (does not reload automatically)
- **Test config** — runs `nginx -t` and shows output
- **Reload nginx** — runs `systemctl reload nginx` and shows output

---

## Nginx Site Editor (`/settings/nginx/{site}`)

Full textarea editor for `/etc/nginx/sites-available/{site}`.

- **Unsaved** badge appears when you have uncommitted changes
- **Save** — writes the file and immediately runs `nginx -t`; if the test fails, the previous version is restored automatically and the error is shown
- **Test config** — runs `nginx -t` without saving
- **Reload nginx** — applies the current on-disk config to live traffic
- **Reset** — discards unsaved edits

---

## Backups (`/backups`)

Overview of all project backups:

- Per-project card with the 3 most recent archives (date, size, download link)
- **Backup now** button per project
- **System backup** button — backs up `/etc/obstetrix/` and global state
- Link to the per-project backup history

---

## Per-Project Backup History (`/backups/{name}`)

Full list of backup archives with date, size, and download link.

**Backup now** triggers an immediate backup. Downloads stream directly as `.tar.gz` files.

---

## Live updates

The GUI maintains a persistent SSE connection to `/api/events` throughout the session. `BuildEvent` messages are dispatched as a custom DOM event (`cicd:event`) that any page can listen to.

| Event type | Effect |
|------------|--------|
| `status` | Updates the project's status badge on dashboard and detail page |
| `deploy_complete` | Updates SHA, last-deploy time, and ok/failed indicator |
| `log` | Streams to the live log page for the relevant project |

The SSE connection reconnects automatically if dropped. Deploy history and logs pages also re-fetch data when a `cicd:event` arrives.

> **nginx / HTTP/2 note:** The `/api/events` response must not include `Connection: keep-alive` — that header is forbidden in HTTP/2 and causes Firefox to abort the connection (`NS_BINDING_ABORTED`) while Chrome silently ignores it. The nginx config in [install.md](install.md#nginx-reverse-proxy) uses a dedicated unbuffered location block for SSE routes; if you customise the proxy config, ensure `proxy_buffering off` and `proxy_read_timeout 3600s` are set for those paths.
