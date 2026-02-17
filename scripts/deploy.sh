#!/bin/bash
# ===========================================
# RedditAutoMarket - EC2 Deployment Script
# ===========================================
# Usage: ./deploy.sh [setup|deploy|rollback|logs|status]
set -euo pipefail

APP_NAME="reddit-auto-market"
APP_DIR="/opt/${APP_NAME}"
COMPOSE_FILE="${APP_DIR}/docker-compose.yml"
BACKUP_DIR="${APP_DIR}/backups"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ---- Initial server setup ----
setup() {
  log "Setting up EC2 instance for ${APP_NAME}..."

  # Update system
  sudo apt-get update -y
  sudo apt-get upgrade -y

  # Install Docker
  if ! command -v docker &> /dev/null; then
    log "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker "$USER"
    sudo systemctl enable docker
    sudo systemctl start docker
    log "Docker installed. You may need to log out and back in for group changes."
  else
    log "Docker already installed."
  fi

  # Install Docker Compose
  if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    log "Installing Docker Compose..."
    sudo apt-get install -y docker-compose-plugin
  else
    log "Docker Compose already installed."
  fi

  # Create app directory
  sudo mkdir -p "${APP_DIR}" "${BACKUP_DIR}"
  sudo chown -R "$USER:$USER" "${APP_DIR}"

  # Create .env file if not exists
  if [ ! -f "${APP_DIR}/.env" ]; then
    log "Creating .env template..."
    cat > "${APP_DIR}/.env" << 'EOF'
# === Required ===
POSTGRES_PASSWORD=CHANGE_ME_STRONG_PASSWORD
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=GENERATE_WITH_openssl_rand_-base64_32
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
OPENAI_API_KEY=your_openai_api_key
CRON_SECRET=GENERATE_WITH_openssl_rand_-base64_32
NEXT_PUBLIC_APP_URL=https://your-domain.com
EOF
    warn "Edit ${APP_DIR}/.env with your actual values before deploying!"
  fi

  # Setup firewall
  if command -v ufw &> /dev/null; then
    sudo ufw allow 22/tcp
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw --force enable
    log "Firewall configured (22, 80, 443)"
  fi

  # Install Nginx for reverse proxy
  if ! command -v nginx &> /dev/null; then
    log "Installing Nginx..."
    sudo apt-get install -y nginx
    sudo systemctl enable nginx
  fi

  # Create Nginx config
  sudo tee /etc/nginx/sites-available/${APP_NAME} > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

  sudo ln -sf /etc/nginx/sites-available/${APP_NAME} /etc/nginx/sites-enabled/
  sudo rm -f /etc/nginx/sites-enabled/default
  sudo nginx -t && sudo systemctl reload nginx

  log "✅ Setup complete! Next steps:"
  echo "  1. Edit ${APP_DIR}/.env with your secrets"
  echo "  2. Copy your project files to ${APP_DIR}/"
  echo "  3. Run: ./deploy.sh deploy"
}

# ---- Deploy / update ----
deploy() {
  log "Deploying ${APP_NAME}..."

  cd "${APP_DIR}" || error "App directory not found: ${APP_DIR}"

  [ -f .env ] || error ".env file not found. Run setup first."

  # Backup current state
  if docker compose ps --quiet 2>/dev/null | grep -q .; then
    log "Creating backup..."
    local backup_name="backup-$(date +'%Y%m%d-%H%M%S')"
    mkdir -p "${BACKUP_DIR}/${backup_name}"
    docker compose exec -T db pg_dumpall -U postgres > "${BACKUP_DIR}/${backup_name}/db.sql" 2>/dev/null || warn "DB backup skipped (no running db)"
    log "Backup saved to ${BACKUP_DIR}/${backup_name}"
  fi

  # Pull/build and deploy
  log "Building containers..."
  docker compose build --no-cache

  log "Starting services..."
  docker compose up -d

  # Wait for health check
  log "Waiting for app to be healthy..."
  local retries=30
  while [ $retries -gt 0 ]; do
    if docker compose exec -T app wget -qO- http://localhost:3000/api/cron/automation 2>/dev/null | grep -q "ok"; then
      log "✅ App is healthy!"
      break
    fi
    retries=$((retries - 1))
    sleep 2
  done

  if [ $retries -eq 0 ]; then
    warn "Health check timed out. Check logs with: ./deploy.sh logs"
  fi

  log "✅ Deployment complete!"
  status
}

# ---- Rollback ----
rollback() {
  log "Rolling back..."
  cd "${APP_DIR}" || error "App directory not found"

  local latest_backup=$(ls -td "${BACKUP_DIR}"/backup-* 2>/dev/null | head -1)
  if [ -z "$latest_backup" ]; then
    error "No backups found"
  fi

  log "Restoring from ${latest_backup}..."
  if [ -f "${latest_backup}/db.sql" ]; then
    docker compose exec -T db psql -U postgres < "${latest_backup}/db.sql"
    log "Database restored"
  fi

  docker compose restart app
  log "✅ Rollback complete"
}

# ---- Logs ----
logs() {
  cd "${APP_DIR}" || error "App directory not found"
  docker compose logs -f --tail=100
}

# ---- Status ----
status() {
  cd "${APP_DIR}" || error "App directory not found"
  echo ""
  log "Service Status:"
  docker compose ps
  echo ""
  log "Resource Usage:"
  docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" 2>/dev/null || true
}

# ---- Main ----
case "${1:-help}" in
  setup)    setup ;;
  deploy)   deploy ;;
  rollback) rollback ;;
  logs)     logs ;;
  status)   status ;;
  *)
    echo "Usage: $0 {setup|deploy|rollback|logs|status}"
    echo ""
    echo "  setup    - Install Docker, Nginx, create directories"
    echo "  deploy   - Build and deploy (with backup)"
    echo "  rollback - Restore from latest backup"
    echo "  logs     - Tail container logs"
    echo "  status   - Show container status"
    ;;
esac
