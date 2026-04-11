# obstetrix

A self-hosted CI/CD platform for Bun/SvelteKit apps. Polls GitHub, builds on the host, and serves with systemd — no containers, no Docker, no Kubernetes.

```
GitHub (token polling)
        │
        ▼
obstetrix-orchestratord  (Go daemon)
├── polls GitHub → detects new commit → triggers deploy
├── deploy: sync env → git pull → bun build → rolling restart → health check
└── socket: /run/obstetrix/orchestrator.sock  (JSON-RPC)
        │
        ├── obstetrix-ctl     (CLI)
        └── obstetrix-gui     (SvelteKit web UI, port 3000)
                │
        ┌───────┴──────────────────────────┐
        │  {name}@4000.service             │
        │  {name}@4001.service             │  ← systemd template units
        │  WorkDir: /obstetrix-projects/{name}/  │
        └──────────────────────────────────┘
                │
             nginx  (upstream load balancer)
```

Each project gets a dedicated Linux system user (`obstetrix-{name}`) and runs as a set of Bun processes managed by systemd. Isolation is provided by Linux user separation and systemd hardening directives — no container overhead.

---

## Quick start

**Requirements:** Linux with systemd, root access, internet connection (Go and Bun are installed automatically).

```bash
# Clone the repo
git clone https://github.com/yourorg/obstetrix /opt/obstetrix-src
cd /opt/obstetrix-src

# Install (installs Go, Bun, nginx; compiles; starts services)
sudo bash scripts/install.sh
```

The installer will ask for your GitHub Personal Access Token (`contents:read` scope for public repos, `repo` for private).

Once done:

```bash
# Add your first project
obstetrix-ctl project create myapp --ports 4

# Edit the project config
sudo nano /etc/obstetrix/projects/myapp/project.conf

# Trigger the first deploy
obstetrix-ctl deploy myapp

# Watch it build
obstetrix-ctl logs myapp --follow

# Check status
obstetrix-ctl status myapp
```

Open the web UI at `http://<server-ip>:3000`.

---

## Documentation

| Doc | What it covers |
|-----|----------------|
| [docs/install.md](docs/install.md) | Full install guide, update, uninstall, nginx proxy |
| [docs/cli.md](docs/cli.md) | `obstetrix-ctl` command reference |
| [docs/config.md](docs/config.md) | Config files, all keys, `obstetrix.json` schema |
| [docs/projects.md](docs/projects.md) | Project lifecycle: create → deploy → scale → rollback → delete |
| [docs/gui.md](docs/gui.md) | Web UI walkthrough |
| [docs/operations.md](docs/operations.md) | Day-2 ops: logs, backups, troubleshooting |

---

## What gets installed

| Binary | Location |
|--------|----------|
| Orchestrator daemon | `/usr/local/bin/obstetrix-orchestratord` |
| CLI | `/usr/local/bin/obstetrix-ctl` |
| GUI | `/opt/obstetrix/gui/build/` |

| Service | Description |
|---------|-------------|
| `obstetrix-orchestratord.service` | Core daemon (runs as root) |
| `obstetrix-gui.service` | SvelteKit web UI (runs as `obstetrix` user) |
| `{name}@.service` | Per-project template unit (written on first deploy) |

| Config path | Purpose |
|-------------|---------|
| `/etc/obstetrix/obstetrix.conf` | Main config: GitHub token, paths, ports |
| `/etc/obstetrix/projects/{name}/` | Per-project: `project.conf`, `.env`, `.npmrc` |
| `/var/obstetrix/state/` | Deploy state (JSON, never deleted) |
| `/var/obstetrix/logs/` | Deploy logs (JSONL, never deleted) |
| `/var/obstetrix/backups/` | Backup archives |
| `/obstetrix-projects/{name}/` | Deployed app files |
| `/obstetrix-projects/_work/{name}/` | Git clone + build workspace |
# obstetrix-v2
