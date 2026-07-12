#!/bin/bash
# =============================================================================
# VPS Setup Script — Ubuntu 22.04 LTS
# Run as root: bash vps-setup.sh
# =============================================================================
set -euo pipefail

DOMAIN="${1:-viccom.com.mx}"
APP_USER="viccom"
APP_DIR="/opt/viccom"
BACKEND_DIR="${APP_DIR}/backend"

echo "==> Setting up VPS for VICCOM Sync Service"
echo "    Domain: ${DOMAIN}"

# --- System update -----------------------------------------------------------
export DEBIAN_FRONTEND=noninteractive
apt-get update

# --- Node.js 22 LTS -----------------------------------------------------------
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

echo "Node version: $(node --version)"
echo "npm  version: $(npm  --version)"

# --- PM2 (process manager) ---------------------------------------------------
npm install -g pm2

# --- nginx -------------------------------------------------------------------
apt-get install -y nginx certbot python3-certbot-nginx ufw

# --- Firewall ----------------------------------------------------------------
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# --- Create app user ---------------------------------------------------------
if ! id "${APP_USER}" &>/dev/null; then
  useradd --system --create-home --shell /bin/bash "${APP_USER}"
  echo "Created user: ${APP_USER}"
fi

# --- App directories ---------------------------------------------------------
mkdir -p "${BACKEND_DIR}"
chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}"

# --- nginx config ------------------------------------------------------------
cat > /etc/nginx/sites-available/viccom-sync <<NGINX
server {
    listen 80;
    server_name ${DOMAIN};

    location / {
        proxy_pass         http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header   Host              \$host;
        proxy_set_header   X-Real-IP         \$remote_addr;
        proxy_set_header   X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 10s;
        proxy_read_timeout    30s;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/viccom-sync /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

echo "==> nginx configured"

# --- SSL certificate ---------------------------------------------------------
echo "==> Run the following command to get SSL certificate:"
echo "    certbot --nginx -d ${DOMAIN} --non-interactive --agree-tos --email admin@${DOMAIN}"

# --- PM2 startup on boot -----------------------------------------------------
pm2 startup systemd -u "${APP_USER}" --hp "/home/${APP_USER}"
echo "==> PM2 startup configured"

echo ""
echo "==> VPS setup complete!"
echo "    Deploy the backend with: cd ${BACKEND_DIR} && bash deploy.sh"
