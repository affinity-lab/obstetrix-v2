# Web UI Guide

The GUI is a SvelteKit app that connects to the orchestrator over the Unix socket (server-side) and receives live updates over Server-Sent Events (client-side).

**Default URL:** `http://<server-ip>:3000`

For HTTPS access, set up an nginx reverse proxy — see [install.md](install.md#nginx-reverse-proxy).

---

## Dashboard (`/`)

The main page shows a card for each project with:

- **Name** — links to the project detail page
- **Status badge** — live, color-coded: green (running), red (failed), blue (building), grey (stopped/unknown)
- **Current SHA** — first 8 characters of the deployed commit
- **Last deployed** — relative time (e.g., "2m ago")
- **Deploy button** — triggers a deploy immediately
- **Logs button** — opens the live log stream

The dashboard receives live updates automatically. Status badges and SHA update in real time as deploys progress — no page refresh needed.

---

## Project Detail (`/project/{name}`)

Shows detailed information for a single project:

- **Status badge** and current SHA
- **Branch** and repo URL
- **Last deploy** timestamp and success/failure
- **Instance count** (running / total reserved)

**Actions:**
- **Deploy now** — triggers a deploy; watch `/project/{name}/logs` for output
- **Rollback** — reverts to the previous SHA (only shown if a previous SHA exists)
- **View logs** — opens the live log stream
- **Deploys** — opens the deploy history list
- **Settings** — opens the project config editor

**Scale slider:**
Drag the slider to set the target instance count and click **apply**. The number of active instances changes immediately (starts or stops `{name}@{port}.service` units). The slider maximum is the port count allocated for the project.

**Deploy history table:**
Shows the last 20 deploys with SHA, timestamp, ok/failed badge, and duration.

---

## Live Logs (`/project/{name}/logs`)

Streams log output in real time using a Server-Sent Events connection.

- **Log lines** — each line from the build and deploy process
- **Status events** — shown when the project status changes
- **Deploy complete** — shown when a deploy finishes (green = ok, red = failed)

Error lines (lines starting with `error:`, `fatal:`, `panic:`, etc.) are highlighted in red.

The view keeps the last 500 lines and auto-scrolls as new output arrives. A `● live` indicator shows the connection is active.

---

## Deploy History (`/project/{name}/deploys`)

Lists all deploy log files for the project with:
- Short SHA (8 chars)
- Start timestamp
- Status badge (running / ok / failed)
- Duration

Click any row to open the full log for that deploy.

---

## Deploy Log Detail (`/project/{name}/deploys/{deployId}`)

Full JSONL log viewer for a single deploy. Shows:
- Start entry (SHA, project name, timestamp)
- All log lines (error lines in red)
- End entry (ok/failed, duration, error message if any)

---

## Settings (`/settings`)

The settings hub shows:

**Disk usage** — lists each mount point with used/total GB and usage percentage.

**Project config links** — links to the config editor for each project.

**Actions:**
- **Reload configs** — triggers `config.reload` on the orchestrator (same as `obstetrix-ctl config reload`)
- **Edit obstetrix.conf** — opens the secrets editor

---

## Project Config Editor (`/settings/project/{name}`)

Three-tab editor for the project's config files:

**project.conf tab:**
- Shows current settings as key=value text
- Edit directly and click **Save**
- Changes apply on the next deploy

**\.env tab:**
- Edit environment variables
- **Save** writes to `/etc/obstetrix/projects/{name}/.env`
- **Sync now** pushes the resolved env to the deploy directory and performs a rolling restart (no build)

**\.npmrc tab:**
- Edit npm/Bun config
- **Save** writes to `/etc/obstetrix/projects/{name}/.npmrc`

---

## Secrets Editor (`/settings/secrets`)

Edits `/etc/obstetrix/obstetrix.conf` — the main config file containing the GitHub token, global paths, and port assignments.

By default, values for keys containing `TOKEN`, `SECRET`, or `KEY` are masked with `****`. Toggle **mask secret values** to reveal them.

When saving, any line still containing `****` is skipped (preserving the current value). Only lines you actively changed are written back.

---

## Backups (`/backups`)

Overview of all project backups:

- Per-project card with the 3 most recent archives (date, size, download link)
- **Backup now** button per project
- **System backup** button (top-right) — backs up `/etc/obstetrix/` and global state
- Link to the per-project backup history

---

## Per-Project Backup History (`/backups/{name}`)

Full list of backup archives for one project with date, size, and download link.

**Backup now** triggers an immediate backup. The new archive appears at the top of the list.

Downloads stream directly from the server as `.tar.gz` files.

---

## Live updates

The GUI maintains a persistent SSE connection to `/api/events` throughout the session. This connection receives `BuildEvent` messages for all projects:

| Event type | Effect |
|------------|--------|
| `status` | Updates the project's status badge on the dashboard and detail page |
| `deploy_complete` | Updates SHA, last-deploy time, and ok/failed indicator |
| `log` | Streams to the live log page for the relevant project |

The SSE connection reconnects automatically if dropped.
