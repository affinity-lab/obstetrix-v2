#!/usr/bin/env bash
# Sourced by install.sh.

PLATFORM="${PLATFORM:-obstetrix}"
CONFIG_ROOT="${CONFIG_ROOT:-/etc/obstetrix}"
ORCHESTRATOR_BIN="/usr/local/bin/${PLATFORM}-orchestratord"

_write_systemd_units() {
  info "writing systemd units..."

  # Note: project app units ({name}@.service) are written by the orchestrator
  # during bootstrap — not by the install script.

  cat > "/etc/systemd/system/${PLATFORM}-orchestratord.service" << EOF
[Unit]
Description=obstetrix Orchestrator Daemon
After=network.target
Wants=network.target

[Service]
Type=simple
User=root
Group=root

EnvironmentFile=${CONFIG_ROOT}/obstetrix.conf

ExecStart=${ORCHESTRATOR_BIN} --config-root ${CONFIG_ROOT}
ExecReload=/bin/kill -HUP \$MAINPID

Restart=on-failure
RestartSec=5
StartLimitInterval=60
StartLimitBurst=3

RuntimeDirectory=${PLATFORM}
RuntimeDirectoryMode=0770
RuntimeDirectoryPreserve=yes

StandardOutput=journal
StandardError=journal
SyslogIdentifier=${PLATFORM}-orchestratord

[Install]
WantedBy=multi-user.target
EOF

  cat > "/etc/systemd/system/${PLATFORM}-gui.service" << EOF
[Unit]
Description=obstetrix GUI (SvelteKit)
After=${PLATFORM}-orchestratord.service
Requires=${PLATFORM}-orchestratord.service

[Service]
Type=simple
User=obstetrix
Group=obstetrix
WorkingDirectory=/opt/${PLATFORM}/gui

EnvironmentFile=${CONFIG_ROOT}/obstetrix.conf

Environment=PORT=3000
Environment=HOST=127.0.0.1
Environment=NODE_ENV=production
UnsetEnvironment=SOCKET_PATH
Environment=ORCHESTRATOR_SOCKET=/run/${PLATFORM}/orchestrator.sock

ExecStart=/usr/local/bin/bun /opt/${PLATFORM}/gui/build/index.js

Restart=on-failure
RestartSec=3

StandardOutput=journal
StandardError=journal
SyslogIdentifier=${PLATFORM}-gui

[Install]
WantedBy=multi-user.target
EOF

  systemctl daemon-reload
  info "systemd units written"
}

_enable_services() {
  systemctl enable "${PLATFORM}-orchestratord" "${PLATFORM}-gui"
  systemctl restart "${PLATFORM}-orchestratord"
  _wait_for_socket
  systemctl restart "${PLATFORM}-gui"
}

_wait_for_socket() {
  local socket="/run/${PLATFORM}/orchestrator.sock"
  info "waiting for orchestrator socket..."
  for i in $(seq 1 15); do
    [[ -S "$socket" ]] && { info "socket ready after ${i}s"; return; }
    sleep 1
  done
  warn "socket not ready after 15s — check: journalctl -u ${PLATFORM}-orchestratord -n 50"
}

_smoke_test() {
  if [[ -S "/run/${PLATFORM}/orchestrator.sock" ]]; then
    obstetrix-ctl status || true
  fi
}

_print_summary() {
  local ip
  ip=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "127.0.0.1")
  echo
  echo "──────────────────────────────────────────────────────"
  echo "  obstetrix installed"
  echo "──────────────────────────────────────────────────────"
  echo "  Orchestrator: systemctl status ${PLATFORM}-orchestratord"
  echo "  GUI:          http://${ip}:3000"
  echo "  Add a project: obstetrix-ctl project create <name>"
  echo "  CLI:  obstetrix-ctl status | deploy <n> | scale <n> <count>"
  echo "  Logs: journalctl -u ${PLATFORM}-orchestratord -f"
  echo "──────────────────────────────────────────────────────"
  echo
  echo "  On first deploy, the orchestrator will:"
  echo "  1. Create system user obstetrix-<name>"
  echo "  2. Create /obstetrix-projects/_work/<name>/ and clone repo"
  echo "  3. Write /etc/systemd/system/<name>@.service"
  echo "  4. Build and start instances"
  echo "──────────────────────────────────────────────────────"
}

_write_systemd_units
_enable_services
_smoke_test
_print_summary
