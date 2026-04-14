# Operations

---

## Service management

```bash
# Status
systemctl status obstetrix-orchestratord
systemctl status obstetrix-gui

# Restart
systemctl restart obstetrix-orchestratord
systemctl restart obstetrix-gui

# Live logs
journalctl -u obstetrix-orchestratord -f
journalctl -u obstetrix-gui -f

# Project app instances
systemctl status 'myapp@*.service'
journalctl -u 'myapp@*.service' -f
journalctl -u myapp@4000.service -f

# Restart a specific instance
systemctl restart myapp@4000.service

# Reset a failed instance
systemctl reset-failed myapp@4000.service
systemctl start myapp@4000.service
```

---

## Deploy logs

Deploy logs are JSONL files at `/var/obstetrix/logs/{name}/`.

**Filename format:** `{timestamp}_{sha8}.running` during a deploy, renamed to `{timestamp}_{sha8}_ok.jsonl` or `{timestamp}_{sha8}_fail.jsonl` on completion.

```
/var/obstetrix/logs/api/
├── 2026-03-23T10-00-00Z_a1b2c3d4_ok.jsonl
├── 2026-03-23T09-00-00Z_f6e5d4c3_fail.jsonl
└── 2026-03-23T08-00-00Z_b3c4d5e6.running   ← in-progress
```

**Line format (JSONL):**
```jsonl
{"ts":"2026-03-23T10:00:00Z","type":"start","sha":"a1b2c3d4...","project":"api"}
{"ts":"2026-03-23T10:00:01Z","type":"log","line":"==> deploying api @ a1b2c3d4"}
{"ts":"2026-03-23T10:00:45Z","type":"log","line":"==> health check passed"}
{"ts":"2026-03-23T10:01:00Z","type":"end","ok":true,"durationMs":60000}
```

To read a log file:
```bash
cat /var/obstetrix/logs/api/2026-03-23T10-00-00Z_a1b2c3d4_ok.jsonl | jq -r '.line // empty'
```

Logs are never automatically deleted.

---

## State files

Project state is stored at `/var/obstetrix/state/{name}.json`. This file is the authoritative record of the project's current SHA, instance count, running ports, and deploy history.

```bash
cat /var/obstetrix/state/api.json | jq .
```

State files are written atomically (via a temp file + rename) after every deploy and after each health check update.

---

## Backups

**Automatic backups** run on the schedule in `obstetrix.conf` (`BACKUP_SCHEDULE`, default `0 3 * * *` = 3am UTC daily). Per-project schedules can be set in `project.conf`.

**What gets backed up:**
- The project's persistent dirs (`uploads/`, `data/`, etc.) (if `BACKUP_INCLUDE_DATA=true`)
- `.env` and `.npmrc` (if `BACKUP_INCLUDE_ENV=true`)
- NOT the git clone (`_work/`) or build artifacts

**Manual backup:**
```bash
# Via CLI — not directly supported; use the GUI or trigger via RPC
# Via GUI: Backups → project → Backup now
```

**Backup location:** `/var/obstetrix/backups/{name}/` (default)

**Retention:** Archives older than `BACKUP_RETENTION` (default 7) are deleted automatically after each new backup.

**Download a backup:**
```bash
# GUI: Backups → project → download link
# Direct: the file is a standard .tar.gz
tar -tzf /var/obstetrix/backups/api/2026-03-23T10-00-00Z_api.tar.gz
```

---

## Rotating the GitHub token

1. Generate a new token at GitHub
2. Update the config:
   ```bash
   sudo bash scripts/install.sh --reset-token
   ```
   Or edit directly:
   ```bash
   sudo nano /etc/obstetrix/obstetrix.conf
   # Update: GITHUB_TOKEN=ghp_...
   ```
3. Restart the orchestrator:
   ```bash
   sudo systemctl restart obstetrix-orchestratord
   ```

The shared `.netrc` file at `/var/obstetrix/.netrc` is updated automatically on the next deploy.

---

## Resetting a corrupt git workspace

If a project's git state is corrupted (e.g., interrupted mid-fetch):

```bash
rm -rf /obstetrix-projects/_work/myapp/
```

The next deploy will re-clone automatically. This does not affect the running app — the deploy dir (`/obstetrix-projects/myapp/`) is untouched.

---

## nginx app upstream

When a project is deployed for the first time, obstetrix writes a nginx upstream config that lists all reserved ports. nginx handles stopped instances automatically via `max_fails`.

Example config at `/etc/nginx/sites-available/myapp`:

```nginx
upstream myapp {
    least_conn;
    server 127.0.0.1:4000 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:4001 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:4002 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:4003 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

server {
    listen 80;
    server_name myapp.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name myapp.example.com;

    ssl_certificate     /etc/ssl/certs/myapp.crt;
    ssl_certificate_key /etc/ssl/private/myapp.key;

    location / {
        proxy_pass http://myapp;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
    }
}
```

After enabling: `sudo nginx -t && sudo systemctl reload nginx`

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `cannot connect to orchestrator` | Service not running | `systemctl start obstetrix-orchestratord` |
| `GITHUB_TOKEN is required` | Token not set | `sudo bash scripts/install.sh --reset-token` |
| Socket not created after 15s | Config error at startup | `journalctl -u obstetrix-orchestratord -n 50` |
| Project deploys automatically on every poll tick | `CurrentSHA` is nil — project has never been deployed | Trigger an explicit first deploy from the GUI or CLI; the poller skips nil-SHA projects intentionally |
| Project keeps auto-deploying after config save | `AUTO_DEPLOY=true` and a new commit exists | Either deploy manually to set `CurrentSHA`, or set `AUTO_DEPLOY=false` in `project.conf` via the deploy settings tab |
| Deploy stuck at `git fetch` | Network / token issue | Check token scopes; check repo URL in `project.conf` |
| Health check timeout | App not starting | Check `journalctl -u myapp@4000.service -n 50`; verify `start.command` |
| GUI 502 Bad Gateway | GUI process crashing on startup | Check `journalctl -u obstetrix-gui -n 50`; usually a socket connect error causing an unhandled exception |
| GUI 502 immediately after orchestratord restart | `/run/obstetrix/` reverted to `root:root` group | The `ExecStartPost=/bin/chgrp obstetrix /run/obstetrix` line must be present in the orchestratord unit; reinstall or patch the unit manually |
| GUI gets `ENOENT` connecting to socket despite socket existing | `/run/obstetrix/` directory not searchable by obstetrix user | `sudo chgrp obstetrix /run/obstetrix` (temporary); permanent fix: ensure orchestratord unit has `ExecStartPost=/bin/chgrp obstetrix /run/obstetrix` |
| SSE (`/api/events`) not connecting in Firefox | nginx proxy uses HTTP/2 and forwards hop-by-hop headers | Ensure the SSE location block uses `proxy_buffering off` and does not set `Connection: keep-alive` (forbidden in HTTP/2) |
| SSE disconnects frequently | nginx buffering | Add `proxy_buffering off` and `proxy_read_timeout 3600s` to SSE location block |
| `no project configs configured` on dashboard | No valid `project.conf` | Ensure `REPO_URL` and `BUILD_CMD` are set; run `obstetrix-ctl config reload` |
| Instance enters failed state | Crash loop | `systemctl reset-failed myapp@4000.service` then investigate with `journalctl` |
| Deploy succeeds but app not accessible | nginx upstream stale | `sudo systemctl reload nginx` |
| `--purge` removed too much | Permanent deletion | Restore from `/var/obstetrix/backups/` |

---

## Disk usage

```bash
# Project app dirs
du -sh /obstetrix-projects/myapp/
du -sh /obstetrix-projects/_work/myapp/   # git + node_modules

# State and logs
du -sh /var/obstetrix/

# GUI and binaries
du -sh /opt/obstetrix/
```

`_work/{name}/` contains the full git history and `node_modules/` cache. For large projects this can be several hundred MB. It can be safely deleted (see [Resetting a corrupt git workspace](#resetting-a-corrupt-git-workspace)) — the next deploy will re-clone.
