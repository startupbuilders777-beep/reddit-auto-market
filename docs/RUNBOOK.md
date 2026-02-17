# RedditAutoMarket — Operations Runbook

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Initial EC2 Setup](#initial-ec2-setup)
3. [Deployment](#deployment)
4. [Monitoring & Health Checks](#monitoring--health-checks)
5. [Troubleshooting](#troubleshooting)
6. [Database Operations](#database-operations)
7. [Backup & Recovery](#backup--recovery)
8. [Scaling](#scaling)
9. [Security Checklist](#security-checklist)

---

## Architecture Overview

```
┌─────────────┐     ┌──────────────────────────────┐
│   Browser   │────▶│  Nginx (reverse proxy :80)   │
└─────────────┘     └──────────┬───────────────────┘
                               │
                    ┌──────────▼───────────────────┐
                    │  Next.js App (Docker :3000)   │
                    │  - Dashboard UI               │
                    │  - API routes                  │
                    │  - Server actions              │
                    └──────────┬───────────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
    ┌─────────────┐  ┌──────────────┐  ┌─────────────┐
    │ PostgreSQL  │  │  OpenAI API  │  │ Reddit API  │
    │ (Docker)    │  │  (external)  │  │ (external)  │
    └─────────────┘  └──────────────┘  └─────────────┘
              
    ┌─────────────────────────────────────────────┐
    │  Cron Container (hourly automation trigger)  │
    └─────────────────────────────────────────────┘
```

**Containers:**
| Container | Image | Port | Purpose |
|-----------|-------|------|---------|
| `reddit-auto-market` | Custom (Dockerfile) | 3000 | Main app |
| `reddit-auto-market-db` | postgres:15-alpine | 5432 | Database |
| `reddit-auto-market-cron` | Custom (Dockerfile) | — | Hourly automation |

---

## Initial EC2 Setup

### Requirements

- **Instance type:** t3.small (minimum) or t3.medium (recommended)
- **OS:** Ubuntu 22.04 LTS
- **Storage:** 20GB+ EBS (gp3)
- **Security Group:** Allow TCP 22, 80, 443

### Step-by-Step

```bash
# 1. SSH into instance
ssh -i your-key.pem ubuntu@<ec2-public-ip>

# 2. Upload project or clone from git
git clone <repo-url> /opt/reddit-auto-market
cd /opt/reddit-auto-market

# 3. Run setup
chmod +x scripts/deploy.sh
./scripts/deploy.sh setup

# 4. Configure environment
nano /opt/reddit-auto-market/.env
# Fill in all required variables (see README)

# 5. Generate secrets
openssl rand -base64 32  # → NEXTAUTH_SECRET
openssl rand -base64 32  # → CRON_SECRET
# Create a strong password → POSTGRES_PASSWORD

# 6. Deploy
./scripts/deploy.sh deploy
```

### SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
# Auto-renewal is set up by certbot
```

---

## Deployment

### Standard Deploy

```bash
cd /opt/reddit-auto-market
git pull origin main
./scripts/deploy.sh deploy
```

### CI/CD Deploy

Pushes to `main` automatically trigger deployment via GitHub Actions.

**Required GitHub Secrets:**
| Secret | Description |
|--------|-------------|
| `EC2_HOST` | EC2 public IP or hostname |
| `EC2_USER` | SSH username (usually `ubuntu`) |
| `EC2_SSH_KEY` | Private SSH key content |
| `APP_URL` | Production URL |

### Manual Deploy via GitHub Actions

1. Go to Actions → Deploy workflow
2. Click "Run workflow"
3. Select environment (staging/production)

---

## Monitoring & Health Checks

### Health Check Endpoint

```bash
# Quick health check
curl http://localhost:3000/api/cron/automation
# Expected: {"status":"ok","message":"Automation endpoint. Use POST to run."}
```

### Container Health

```bash
# Status of all containers
docker compose ps

# Resource usage
docker stats --no-stream

# Logs (follow)
docker compose logs -f app
docker compose logs -f db
docker compose logs -f cron
```

### Key Metrics to Monitor

| Metric | Command | Healthy |
|--------|---------|---------|
| App responding | `curl -sf localhost:3000` | HTTP 200 |
| DB connection | `docker compose exec db pg_isready` | "accepting connections" |
| Disk usage | `df -h /` | < 80% |
| Memory | `free -m` | > 200MB available |
| Container status | `docker compose ps` | All "Up" |

### Recommended: External Monitoring

Set up a cron on a separate machine or use UptimeRobot:
```
GET https://your-domain.com/api/cron/automation → expect 200
```

---

## Troubleshooting

### App won't start

```bash
# Check logs
docker compose logs app --tail=50

# Common issues:
# 1. Missing env vars → check .env file
# 2. DB not ready → wait or restart: docker compose restart app
# 3. Build error → rebuild: docker compose build --no-cache app
```

### Database connection errors

```bash
# Check if DB is running
docker compose ps db

# Test connection
docker compose exec db psql -U postgres -c "SELECT 1"

# Reset DB (⚠️ data loss)
docker compose down -v
docker compose up -d
```

### Automation not posting

```bash
# Check cron container
docker compose logs cron --tail=20

# Manual trigger
curl -X POST -H "Authorization: Bearer YOUR_CRON_SECRET" \
  http://localhost:3000/api/cron/automation

# Common issues:
# 1. No active campaigns
# 2. No active Reddit account
# 3. Daily limit reached
# 4. Reddit API rate limited
# 5. OpenAI API key invalid
```

### High memory usage

```bash
# Check which container is heavy
docker stats --no-stream

# Restart specific container
docker compose restart app

# Clear Docker cache
docker system prune -f
```

### SSL certificate expired

```bash
sudo certbot renew
sudo systemctl reload nginx
```

---

## Database Operations

### Access DB shell

```bash
docker compose exec db psql -U postgres -d redditmarket
```

### Common queries

```sql
-- Active campaigns
SELECT id, name, status, "dailyLimit" FROM "Campaign" WHERE status = 'ACTIVE';

-- Comments posted today
SELECT COUNT(*) FROM "Comment" 
WHERE "postedAt" >= CURRENT_DATE AND status = 'POSTED';

-- Top performing comments
SELECT id, content, upvotes, engagement 
FROM "Comment" 
WHERE status = 'POSTED' 
ORDER BY engagement DESC LIMIT 10;

-- Account health
SELECT username, karma, "isActive" FROM "RedditAccount";
```

### Run migrations

```bash
docker compose exec app npx prisma db push
```

---

## Backup & Recovery

### Manual Backup

```bash
# Database dump
docker compose exec -T db pg_dump -U postgres redditmarket > backup-$(date +%Y%m%d).sql

# Full backup (DB + env)
mkdir -p /opt/reddit-auto-market/backups
docker compose exec -T db pg_dumpall -U postgres > /opt/reddit-auto-market/backups/full-$(date +%Y%m%d).sql
cp .env /opt/reddit-auto-market/backups/.env.$(date +%Y%m%d)
```

### Restore from Backup

```bash
# Stop app
docker compose stop app cron

# Restore database
docker compose exec -T db psql -U postgres < backup-YYYYMMDD.sql

# Restart
docker compose start app cron
```

### Automated Backups (cron)

Add to `crontab -e`:
```
0 3 * * * cd /opt/reddit-auto-market && docker compose exec -T db pg_dump -U postgres redditmarket | gzip > backups/daily-$(date +\%Y\%m\%d).sql.gz
0 4 * * 0 find /opt/reddit-auto-market/backups -name "daily-*.sql.gz" -mtime +30 -delete
```

---

## Scaling

### Vertical (current setup)

Upgrade EC2 instance type:
- **t3.small** (2 vCPU, 2GB) — up to ~50 campaigns
- **t3.medium** (2 vCPU, 4GB) — up to ~200 campaigns
- **t3.large** (2 vCPU, 8GB) — up to ~500 campaigns

### Horizontal (future)

1. Move PostgreSQL to RDS
2. Use ECR for Docker images
3. Deploy multiple app containers behind ALB
4. Use ECS or EKS for orchestration

---

## Security Checklist

- [ ] Strong `POSTGRES_PASSWORD` (32+ chars)
- [ ] Strong `NEXTAUTH_SECRET` (use `openssl rand -base64 32`)
- [ ] Strong `CRON_SECRET` (use `openssl rand -base64 32`)
- [ ] SSH key-only auth (disable password login)
- [ ] Firewall: only ports 22, 80, 443 open
- [ ] SSL enabled via Let's Encrypt
- [ ] `.env` file not committed to git
- [ ] Reddit tokens encrypted at rest (future improvement)
- [ ] Regular security updates: `sudo apt update && sudo apt upgrade`
- [ ] Docker images updated regularly

---

*Last updated: 2026-02-13*
