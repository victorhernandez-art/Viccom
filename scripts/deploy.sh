#!/bin/bash
# =============================================================================
# Deploy Script — Backend Sync Service
# Run from the VPS as viccom user: bash deploy.sh
# =============================================================================
set -euo pipefail

BACKEND_DIR="${1:-/opt/viccom/backend}"
APP_NAME="viccom-sync"

echo "==> Deploying VICCOM Sync Service to ${BACKEND_DIR}"

cd "${BACKEND_DIR}"

# --- Install dependencies ---------------------------------------------------
npm ci --omit=dev

# --- Build TypeScript --------------------------------------------------------
npm run build

# --- Start / restart with PM2 ------------------------------------------------
if pm2 describe "${APP_NAME}" &>/dev/null; then
  pm2 reload "${APP_NAME}"
  echo "==> PM2 process reloaded"
else
  pm2 start dist/index.js --name "${APP_NAME}" \
    --max-memory-restart 256M \
    --log logs/pm2.log \
    --time
  pm2 save
  echo "==> PM2 process started"
fi

echo "==> Deploy complete! Status:"
pm2 status "${APP_NAME}"
