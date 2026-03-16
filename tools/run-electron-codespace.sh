#!/usr/bin/env bash
set -euo pipefail

echo "[codespace] waiting for Vite on tcp:5173..."
wait-on tcp:5173
echo "[codespace] launching Electron in headless Xvfb (no visible Linux desktop in Codespaces)..."

# Run Electron headlessly in Codespaces and drop only the known non-fatal
# Chromium DBus system socket warning.
dbus-run-session -- xvfb-run -a electron . --no-sandbox --disable-dev-shm-usage 2> >(sed '/dbus\/bus.cc:408/d' >&2)
