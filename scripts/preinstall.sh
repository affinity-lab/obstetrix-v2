#!/usr/bin/env bash
# Sourced by install.sh. No LXC, no Docker, no Node.js.
# Idempotent — safe to run multiple times.

PLATFORM="obstetrix"
ORCHESTRATOR_BIN="/usr/local/bin/${PLATFORM}-orchestratord"
CLI_BIN="/usr/local/bin/obstetrix-ctl"

_require_systemd() {
  systemctl --version &>/dev/null || die "systemd is required"
}

_install_go() {
  local GO_VERSION="1.22.4"
  local GO_ARCH
  case "$(uname -m)" in
    x86_64)  GO_ARCH="amd64" ;;
    aarch64) GO_ARCH="arm64" ;;
    *) die "unsupported arch: $(uname -m)" ;;
  esac

  if command -v go &>/dev/null && [[ "$(go version 2>/dev/null)" == *"go${GO_VERSION}"* ]] && [[ ${FORCE:-0} -eq 0 ]]; then
    info "go ${GO_VERSION} already installed"; return
  fi

  info "installing go ${GO_VERSION}..."
  local tmp; tmp=$(mktemp -d)
  local tarball="go${GO_VERSION}.linux-${GO_ARCH}.tar.gz"
  curl -fsSL "https://go.dev/dl/${tarball}" -o "$tmp/$tarball"
  rm -rf /usr/local/go
  tar -C /usr/local -xzf "$tmp/$tarball"
  rm -rf "$tmp"
  export PATH="/usr/local/go/bin:$PATH"
  echo 'export PATH="/usr/local/go/bin:$PATH"' > /etc/profile.d/go.sh
  info "go installed: $(go version)"
}

_install_bun() {
  if command -v bun &>/dev/null && [[ ${FORCE:-0} -eq 0 ]]; then
    local ver; ver=$(bun --version 2>/dev/null)
    local minor; minor=$(echo "$ver" | cut -d. -f2)
    if [[ "$minor" -ge 2 ]]; then
      info "bun $ver already installed"; return
    fi
    info "bun $ver is too old (need 1.2+), upgrading..."
  else
    info "installing bun (system-wide)..."
  fi
  # Install into /usr/local so all users can run it
  BUN_INSTALL="/usr/local" curl -fsSL https://bun.sh/install | bash
  # Ensure symlink exists
  [[ -f /usr/local/bin/bun ]] || ln -sf "$(command -v bun 2>/dev/null)" /usr/local/bin/bun
  info "bun installed: $(bun --version)"
}

_install_git() {
  if command -v git &>/dev/null; then
    info "git already installed"; return
  fi
  info "installing git..."
  apt-get update -qq
  apt-get install -y -qq git
}

_install_nginx() {
  if command -v nginx &>/dev/null; then
    info "nginx already installed"; return
  fi
  info "installing nginx..."
  apt-get update -qq
  apt-get install -y -qq nginx
}

_compile_orchestrator() {
  if [[ -f "$ORCHESTRATOR_BIN" ]] && [[ ${FORCE:-0} -eq 0 ]]; then
    info "orchestrator already compiled"; return
  fi
  info "compiling orchestrator..."
  (
    cd "$REPO_ROOT/packages/orchestrator"
    /usr/local/go/bin/go build -ldflags='-s -w' -o "$ORCHESTRATOR_BIN" ./cmd/orchestratord
  )
  chmod 755 "$ORCHESTRATOR_BIN"
  info "orchestrator compiled → $ORCHESTRATOR_BIN"
}

_compile_cli() {
  if [[ -f "$CLI_BIN" ]] && [[ ${FORCE:-0} -eq 0 ]]; then
    info "obstetrix-ctl already compiled"; return
  fi
  info "compiling obstetrix-ctl..."
  (
    cd "$REPO_ROOT/packages/cli"
    /usr/local/go/bin/go build -ldflags='-s -w' -o "$CLI_BIN" ./cmd/obstetrix-ctl
  )
  chmod 755 "$CLI_BIN"
  info "obstetrix-ctl compiled → $CLI_BIN"
}

_build_gui() {
  if [[ -d "$REPO_ROOT/packages/gui/build" ]] && [[ ${FORCE:-0} -eq 0 ]]; then
    info "gui already built"; return
  fi
  info "building gui..."
  (
    cd "$REPO_ROOT"
    rm -f bun.lockb
    rm -rf node_modules/@atom-forge node_modules/@nano-forge
    bun install
    bun run build:shared
    bun run build:gui
  )
  info "gui built"
}

_install_gui() {
  info "installing gui to /opt/${PLATFORM}/gui..."
  mkdir -p "/opt/${PLATFORM}/gui"
  rsync -a --delete "$REPO_ROOT/packages/gui/build/" "/opt/${PLATFORM}/gui/build/"
  # Strip workspace:* deps (bundled at build time) so bun install works outside the monorepo
  bun -e "
    const pkg = JSON.parse(require('fs').readFileSync('$REPO_ROOT/packages/gui/package.json','utf8'));
    for (const [k,v] of Object.entries(pkg.dependencies ?? {}))
      if (v.startsWith('workspace:')) delete pkg.dependencies[k];
    require('fs').writeFileSync('/opt/$PLATFORM/gui/package.json', JSON.stringify(pkg, null, 2));
  "
  cp "$REPO_ROOT/.npmrc" "/opt/${PLATFORM}/gui/"
  # Bun does not expand ${VAR} syntax in .npmrc — write the actual token value in place
  if [[ -n "${GITHUB_TOKEN:-}" ]]; then
    sed -i "s|\${GITHUB_TOKEN}|${GITHUB_TOKEN}|g" "/opt/${PLATFORM}/gui/.npmrc"
  fi
  info "installing gui runtime dependencies..."
  (cd "/opt/${PLATFORM}/gui" && bun install --production)
  chown -R obstetrix:obstetrix "/opt/${PLATFORM}/gui"
}

_create_obstetrix_user() {
  if id obstetrix &>/dev/null; then
    info "user 'obstetrix' already exists"
  else
    info "creating system user 'obstetrix' (runs the GUI)..."
    useradd --system --create-home --shell /usr/sbin/nologin \
      --comment "Obstetrix GUI user" obstetrix
  fi
  # Ensure home dir exists — handles users created without --create-home
  mkdir -p /home/obstetrix
  chown obstetrix:obstetrix /home/obstetrix
  chmod 750 /home/obstetrix
  usermod -d /home/obstetrix obstetrix
}

_create_directories() {
  info "creating permanent directories..."

  local PROJECTS_DIR="${PROJECTS_DIR:-/obstetrix-projects}"

  mkdir -p "/opt/${PLATFORM}"
  chmod 755 "/opt/${PLATFORM}"

  mkdir -p \
    "/var/${PLATFORM}/state" \
    "/var/${PLATFORM}/backups" \
    "/var/${PLATFORM}/logs"
  chmod 755 "/var/${PLATFORM}" "/var/${PLATFORM}/state" "/var/${PLATFORM}/logs"
  chmod 750 "/var/${PLATFORM}/backups"

  mkdir -p "${PROJECTS_DIR}" "${PROJECTS_DIR}/_work"
  chmod 755 "${PROJECTS_DIR}" "${PROJECTS_DIR}/_work"
  chown root:root "${PROJECTS_DIR}" "${PROJECTS_DIR}/_work"

  mkdir -p "${CONFIG_ROOT}/projects"
  chown root:obstetrix "${CONFIG_ROOT}" "${CONFIG_ROOT}/projects"
  chmod 750 "${CONFIG_ROOT}" "${CONFIG_ROOT}/projects"

  mkdir -p "/run/${PLATFORM}"
  chown root:obstetrix "/run/${PLATFORM}"
  chmod 770 "/run/${PLATFORM}"

  cat > "/etc/tmpfiles.d/${PLATFORM}.conf" << EOF
d /run/${PLATFORM} 0770 root obstetrix -
EOF

  info "directories created"
}

# ─── preinstall entrypoint ────────────────────────────────────────────────────

_require_systemd
_install_go
_install_bun
_install_git
_install_nginx
_create_obstetrix_user
_create_directories
_compile_orchestrator
_compile_cli
_build_gui
_install_gui
