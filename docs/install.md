# Installation

## Requirements

| Requirement | Notes |
|-------------|-------|
| Linux + systemd | Tested on Debian/Ubuntu; any systemd distro should work |
| Architecture | x86_64 or arm64 |
| Root access | Installer runs as root |
| Internet access | Downloads Go 1.22.4 and Bun during install |
| git | Installed automatically if missing |
| nginx | Installed automatically if missing |

Go and Bun do **not** need to be pre-installed — the installer handles them.

---

## Install

```bash
sudo bash scripts/install.sh
```

The installer runs in four phases:

0. **Preparation** — checks for root access; prompts for or loads the `GITHUB_TOKEN` (required early for private dependencies).
1. **Preinstall** — installs Go 1.22, Bun, git, nginx; creates system users and directories; compiles the orchestrator and CLI; builds the GUI (uses the token for `bun install`); installs GUI runtime dependencies.
2. **Install** — writes `/etc/obstetrix/obstetrix.conf` (skipped if already exists); saves the token to the config file.
3. **Postinstall** — writes and enables systemd units; waits for the socket; smoke-tests `obstetrix-ctl status`.

#### GUI build details (preinstall)

Before running `bun install`, the build step deletes any local `bun.lockb` and evicts the `@atom-forge` and `@nano-forge` package directories from `node_modules`. This guarantees that private packages from the GitHub Package Registry are always resolved to their latest published versions rather than a cached older version.

After the Vite build, `_install_gui` copies the output to `/opt/obstetrix/gui/`, strips workspace-only dependencies from `package.json`, then runs `bun install --production` inside `/opt/obstetrix/gui/` to install packages that adapter-node leaves unbundled (e.g. `@atom-forge/tango-rpc`).

#### `SOCKET_PATH` and the GUI service

`obstetrix.conf` contains `SOCKET_PATH` — the Unix socket path for the orchestrator. Both the orchestratord and the GUI service load this file via `EnvironmentFile`. However, `@sveltejs/adapter-node` also reads `SOCKET_PATH` and, when it is set, attempts to bind the HTTP server to a Unix socket instead of a TCP port.

To prevent this conflict the GUI systemd unit includes:

```ini
UnsetEnvironment=SOCKET_PATH
Environment=ORCHESTRATOR_SOCKET=/run/obstetrix/orchestrator.sock
```

`SOCKET_PATH` is removed from the GUI's environment so adapter-node uses `HOST`/`PORT`. The GUI server code reads `ORCHESTRATOR_SOCKET` (with the same default value) to locate the orchestrator socket.

#### `/run/obstetrix/` directory group

The orchestrator's runtime directory `/run/obstetrix/` must be searchable by the `obstetrix` user so the GUI can reach the socket inside it. Because the orchestratord service runs as `root`, systemd's `RuntimeDirectoryGroup=` directive has no effect — so the unit instead uses:

```ini
ExecStartPost=/bin/chgrp obstetrix /run/obstetrix
```

This runs immediately after the orchestrator process starts, setting the directory group to `obstetrix` before the GUI attempts to connect. The result is `root:obstetrix 770` — matching the directories table above. Without this, the GUI gets `ENOENT` when connecting to the socket (Linux returns ENOENT rather than EACCES when directory search permission is missing).

### Flags

| Flag | Description |
|------|-------------|
| `--force` | Recompile and rebuild even if binaries already exist |
| `--reset-token` | Prompt to replace the stored GitHub token |
| `--env-file PATH` | Read `GITHUB_TOKEN` from a file instead of prompting |
| `--config-root PATH` | Override config directory (default: `/etc/obstetrix`) |
| `--projects-dir PATH` | Override projects directory (default: `/obstetrix-projects`) |

```bash
# Non-interactive install reading token from a file
sudo bash scripts/install.sh --env-file /root/secrets.env

# Install to custom paths
sudo bash scripts/install.sh --config-root /srv/obstetrix/etc --projects-dir /srv/obstetrix/projects
```

---

## What gets created

### System users

| User | Purpose |
|------|---------|
| `obstetrix` | Runs the GUI process |
| `obstetrix-{name}` | Runs app processes for project `{name}` (created on first deploy) |

Both are system users with no home directory and no login shell.

### Directories

| Path | Mode | Purpose |
|------|------|---------|
| `/etc/obstetrix/` | `root:obstetrix 750` | Config root |
| `/etc/obstetrix/projects/` | `root:obstetrix 750` | Per-project config folders |
| `/obstetrix-projects/` | `root:root 755` | App deploy root |
| `/obstetrix-projects/_work/` | `root:root 755` | Build scratch root |
| `/var/obstetrix/state/` | `root 755` | Deploy state JSON files |
| `/var/obstetrix/logs/` | `root 755` | Deploy JSONL log files |
| `/var/obstetrix/backups/` | `root 750` | Backup archives |
| `/opt/obstetrix/gui/` | `obstetrix 755` | GUI build output |
| `/run/obstetrix/` | `root:obstetrix 770` | Runtime (Unix socket) |

### Binaries

| Binary | Location |
|--------|----------|
| Orchestrator daemon | `/usr/local/bin/obstetrix-orchestratord` |
| CLI | `/usr/local/bin/obstetrix-ctl` |
| Bun runtime | `/usr/local/bin/bun` |

### Systemd units

| Unit | User | Description |
|------|------|-------------|
| `obstetrix-orchestratord.service` | root | Core daemon |
| `obstetrix-gui.service` | obstetrix | Web UI (port 3000) |
| `{name}@.service` | obstetrix-{name} | Per-project template (written on first deploy) |

---

## GitHub Personal Access Token

The orchestrator polls GitHub's API to detect new commits and downloads packages from the GitHub Package Registry. The token needs:

- **Public repos:** `contents:read` and `read:packages` scopes (or fine-grained with "Contents: Read-only" and "Packages: Read-only")
- **Private repos:** classic token with `repo` and `read:packages` scopes, or fine-grained with "Contents: Read-only" and "Packages: Read-only"

The token is stored in `/etc/obstetrix/obstetrix.conf` (mode `root:obstetrix 640`).

To update the token after install:

```bash
sudo bash scripts/install.sh --reset-token
```

Or edit the file directly:

```bash
sudo nano /etc/obstetrix/obstetrix.conf
# Change: GITHUB_TOKEN=ghp_...
sudo systemctl restart obstetrix-orchestratord
```

---

## Update

Recompiles from source and restarts services:

```bash
cd /path/to/obstetrix-repo
sudo bash scripts/update.sh
```

The update script runs preinstall with `FORCE=1`, then restarts both services.

---

## Uninstall

```bash
# Remove services and binaries (keeps all data)
sudo bash scripts/uninstall.sh

# Remove everything including configs, state, logs, backups, app dirs, and system users
sudo bash scripts/uninstall.sh --purge
```

`--purge` requires double confirmation before deleting any data.

---

## nginx reverse proxy

The GUI binds to `127.0.0.1:3000` by default. To expose it over HTTPS:

```nginx
server {
    listen 443 ssl;
    server_name cicd.example.com;

    ssl_certificate     /etc/ssl/certs/obstetrix.crt;
    ssl_certificate_key /etc/ssl/private/obstetrix.key;

    proxy_http_version 1.1;
    proxy_set_header Connection '';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # SSE routes must not be buffered
    location ~ ^/api/(logs|events) {
        proxy_pass http://127.0.0.1:3000;
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 3600s;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
    }
}
```

Place this in `/etc/nginx/sites-available/obstetrix` and enable it:

```bash
sudo ln -s /etc/nginx/sites-available/obstetrix /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```
