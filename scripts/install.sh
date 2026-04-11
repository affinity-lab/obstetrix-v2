#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()  { echo -e "${GREEN}[obstetrix]${NC} $*"; }
warn()  { echo -e "${YELLOW}[obstetrix]${NC} $*"; }
error() { echo -e "${RED}[obstetrix]${NC} $*" >&2; }
die()   { error "$*"; exit 1; }

FORCE=0
RESET_TOKEN=0
ENV_FILE=""
CONFIG_ROOT="/etc/obstetrix"
PLATFORM="obstetrix"
PROJECTS_DIR="/obstetrix-projects"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --force)        FORCE=1 ;;
    --reset-token)  RESET_TOKEN=1 ;;
    --env-file)     ENV_FILE="$2"; shift ;;
    --config-root)  CONFIG_ROOT="$2"; shift ;;
    --projects-dir) PROJECTS_DIR="$2"; shift ;;
    *) die "unknown flag: $1" ;;
  esac
  shift
done

export FORCE RESET_TOKEN ENV_FILE CONFIG_ROOT REPO_ROOT PLATFORM PROJECTS_DIR

[[ $EUID -eq 0 ]] || die "must run as root (use sudo)"

# --- Token Collection (Required before Phase 1 for bun install) ---
_get_token() {
  local conf="${CONFIG_ROOT}/obstetrix.conf"
  local current_token=""
  [[ -f "$conf" ]] && current_token=$(grep -oP '(?<=GITHUB_TOKEN=).+' "$conf" 2>/dev/null || true)

  if [[ -n "$ENV_FILE" ]]; then
    # shellcheck source=/dev/null
    if [[ -f "$ENV_FILE" ]]; then
      source "$ENV_FILE"
    else
      die "--env-file $ENV_FILE not found"
    fi
    [[ -z "${GITHUB_TOKEN:-}" ]] && die "--env-file provided but GITHUB_TOKEN not set"
    export GITHUB_TOKEN
    export BUN_CONFIG_GITHUB_TOKEN="$GITHUB_TOKEN"
  elif [[ -z "$current_token" ]] || [[ $RESET_TOKEN -eq 1 ]]; then
    echo
    echo -e "${YELLOW}[obstetrix]${NC} This project requires a GitHub Personal Access Token to download private dependencies."
    echo "Enter your GitHub PAT (repo or contents:read scope)."
    echo "Press Enter to skip (installation will likely fail if dependencies are private)."
    read -r -s -p "GITHUB_TOKEN: " token; echo
    if [[ -n "$token" ]]; then
       export GITHUB_TOKEN="$token"
       export BUN_CONFIG_GITHUB_TOKEN="$token"
    fi
  else
    export GITHUB_TOKEN="$current_token"
    export BUN_CONFIG_GITHUB_TOKEN="$current_token"
    info "GITHUB_TOKEN already set"
  fi
}

_write_token() {
  local token="${1:-${GITHUB_TOKEN:-}}"
  [[ -z "$token" ]] && return
  local conf="${CONFIG_ROOT}/obstetrix.conf"
  sed -i "s|^GITHUB_TOKEN=.*|GITHUB_TOKEN=${token}|" "$conf"
  info "GITHUB_TOKEN written to obstetrix.conf"
}

info "preparing installation..."
_get_token

info "phase 1: preinstall"
# shellcheck source=preinstall.sh
source "$SCRIPT_DIR/preinstall.sh"

_install_main() {
  local conf="${CONFIG_ROOT}/obstetrix.conf"

  if [[ ! -f "$conf" ]]; then
    info "writing default config to $conf..."
    cat > "$conf" << EOF
CONFIG_ROOT=${CONFIG_ROOT}
PROJECTS_DIR=${PROJECTS_DIR}
STATE_DIR=/var/${PLATFORM}/state
LOG_DIR=/var/${PLATFORM}/logs
BACKUP_DIR=/var/${PLATFORM}/backups
SOCKET_PATH=/run/${PLATFORM}/orchestrator.sock

GITHUB_TOKEN=${GITHUB_TOKEN:-}
GITHUB_POLL_INTERVAL=30s
GITHUB_TIMEOUT=10s

BACKUP_SCHEDULE=0 3 * * *
BACKUP_RETENTION=7

LOG_LEVEL=info
GUI_PORT=3000
GUI_HOST=127.0.0.1

# Port assignments — auto-managed by obstetrix-ctl project create/delete
# Format: PORT.{name}=base_port:count
# Example: PORT.api=4000:4
EOF
    chown root:obstetrix "$conf"
    chmod 640 "$conf"
  else
    # Update token in existing config if it was changed/provided
    _write_token
  fi

  # Example project config
  local example_dir="${CONFIG_ROOT}/projects/example"
  if [[ ! -d "$example_dir" ]]; then
    mkdir -p "$example_dir"
    cat > "${example_dir}/project.conf" << 'EOF'
# Rename this folder to your project name.
REPO_URL=https://github.com/yourorg/yourproject
BRANCH=main
BUILD_CMD=bun install && bun run build
HEALTH_CHECK_URL=http://127.0.0.1:4000/health
HEALTH_TIMEOUT=60
ROLLBACK_ON_FAIL=true
BASE_PORT=4000
PORT_COUNT=4
DEFAULT_INSTANCES=1
PERSISTENT_DIRS=uploads,data
EOF
    cat > "${example_dir}/.env" << 'EOF'
NODE_ENV=production
ORIGIN=https://yourproject.yourdomain.com
CHECK_ORIGIN=false
PROTOCOL_HEADER=x-forwarded-proto
HOST_HEADER=x-forwarded-host
EOF
    cat > "${example_dir}/.npmrc" << 'EOF'
frozen-lockfile=true
EOF
    chown -R root:obstetrix "$example_dir"
    chmod 640 "${example_dir}/project.conf" "${example_dir}/.env" "${example_dir}/.npmrc"
  fi
}

info "phase 2: install"
_install_main

info "phase 3: postinstall"
# shellcheck source=postinstall.sh
source "$SCRIPT_DIR/postinstall.sh"

info "done — obstetrix installed"
