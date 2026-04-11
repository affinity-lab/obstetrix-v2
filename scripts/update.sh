#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PLATFORM="obstetrix"
CONFIG_ROOT="/etc/obstetrix"

[[ $EUID -eq 0 ]] || { echo "must run as root"; exit 1; }

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()  { echo -e "${GREEN}[obstetrix]${NC} $*"; }
warn()  { echo -e "${YELLOW}[obstetrix]${NC} $*"; }
die()   { echo -e "${RED}[obstetrix]${NC} $*" >&2; exit 1; }

export FORCE=1 REPO_ROOT CONFIG_ROOT PLATFORM PROJECTS_DIR="${PROJECTS_DIR:-/obstetrix-projects}"

info "updating ${PLATFORM}..."

# Re-run preinstall with FORCE=1 to recompile and rebuild
# shellcheck source=preinstall.sh
source "$SCRIPT_DIR/preinstall.sh"

info "restarting services..."
systemctl restart "${PLATFORM}-orchestratord"

socket="/run/${PLATFORM}/orchestrator.sock"
for i in $(seq 1 15); do
  [[ -S "$socket" ]] && break
  sleep 1
done

systemctl restart "${PLATFORM}-gui"

info "update complete"
obstetrix-ctl status || true
