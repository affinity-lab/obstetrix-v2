#!/usr/bin/env bash
set -euo pipefail

PLATFORM="obstetrix"
CONFIG_ROOT="/etc/obstetrix"
PROJECTS_DIR="/obstetrix-projects"

[[ $EUID -eq 0 ]] || { echo "must run as root"; exit 1; }

PURGE=0
for arg in "$@"; do [[ "$arg" == "--purge" ]] && PURGE=1; done

echo "stopping platform services..."
systemctl disable --now "${PLATFORM}-orchestratord" "${PLATFORM}-gui" 2>/dev/null || true

echo "stopping all project app instances..."
systemctl stop "${PLATFORM}-*@*.service" 2>/dev/null || true

echo "removing platform binaries..."
rm -f "/usr/local/bin/${PLATFORM}-orchestratord" /usr/local/bin/obstetrix-ctl

echo "removing platform systemd units..."
rm -f \
  "/etc/systemd/system/${PLATFORM}-orchestratord.service" \
  "/etc/systemd/system/${PLATFORM}-gui.service"
systemctl daemon-reload

echo "removing tmpfiles.d rule..."
rm -f "/etc/tmpfiles.d/${PLATFORM}.conf"

echo "removing gui..."
rm -rf "/opt/obstetrix/gui"

if [[ $PURGE -eq 1 ]]; then
  echo
  echo "WARNING: --purge will permanently delete:"
  echo "  ${CONFIG_ROOT}/           (project configs and obstetrix.conf)"
  echo "  /var/${PLATFORM}/         (state, logs, backups)"
  echo "  /opt/${PLATFORM}/         (all project app code and data)"
  echo "  ${PROJECTS_DIR}/          (projects root and work dirs)"
  echo "  All project system users  (obstetrix-* users)"
  read -r -p "This cannot be undone. Type 'yes' to confirm: " c1
  [[ "$c1" != "yes" ]] && { echo "purge cancelled"; exit 0; }
  read -r -p "Are you absolutely sure? Type 'DELETE' to proceed: " c2
  if [[ "$c2" == "DELETE" ]]; then
    rm -rf "$CONFIG_ROOT" "/var/${PLATFORM}" "/opt/${PLATFORM}" "${PROJECTS_DIR}"
    # Remove all project system users
    while IFS= read -r user; do
      userdel "$user" 2>/dev/null || true
    done < <(getent passwd | awk -F: '$1 ~ /^obstetrix-/ {print $1}')
    userdel obstetrix 2>/dev/null || true
    echo "purge complete"
  else
    echo "purge cancelled"
  fi
else
  echo
  echo "preserved (use --purge to remove):"
  echo "  ${CONFIG_ROOT}/     — configs and obstetrix.conf"
  echo "  /var/${PLATFORM}/   — state, logs, backups"
  echo "  /opt/${PLATFORM}/   — app code and persistent data"
fi

echo "done"
