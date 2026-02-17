# Deployment Guide

## Docker Deployment

### Prerequisites

- Docker installed on server
- PostgreSQL database (local or managed service)
- Domain with SSL (recommended)

### Build Docker Image

```bash
# Build the image
docker build -t reddit-marketing-tool .

# Or pull from registry
docker pull your-registry/reddit-marketing-tool:latest
```

### Run Container

```bash
docker run -d \
  --name reddit-marketing \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e NEXTAUTH_SECRET="your-secret" \
  -e NEXTAUTH_URL="https://your-domain.com" \
  -e REDDIT_CLIENT_ID="your-client-id" \
  -e REDDIT_CLIENT_SECRET="your-client-secret" \
  -e OPENAI_API_KEY="sk-..." \
  -e CRON_SECRET="your-cron-secret" \
  reddit-marketing-tool
```

### Docker Compose (Recommended)

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/reddit_marketing
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - REDDIT_CLIENT_ID=${REDDIT_CLIENT_ID}
      - REDDIT_CLIENT_SECRET=${REDDIT_CLIENT_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - CRON_SECRET=${CRON_SECRET}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=reddit_marketing
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f app
```

---

## EC2 Deployment

### 1. Launch EC2 Instance

- **Instance Type:** t3.small or larger
- **OS:** Ubuntu 22.04 LTS
- **Security Group:** Allow HTTP (80), HTTPS (443), SSH (22)

### 2. Install Docker

```bash
sudo apt update
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker ubuntu
# Log out and back in
```

### 3. Clone Project

```bash
cd /opt
sudo git clone https://github.com/your-repo/reddit-marketing-tool.git
cd reddit-marketing-tool
sudo cp .env.example .env
# Edit .env with production values
```

### 4. Configure Environment

```env
DATABASE_URL="postgresql://user:password@rds-endpoint:5432/reddit_marketing"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="https://your-domain.com"
REDDIT_CLIENT_ID="your-client-id"
REDDIT_CLIENT_SECRET="your-client-secret"
OPENAI_API_KEY="sk-..."
CRON_SECRET="random-string-for-cron-auth"
```

### 5. Set Up Database

Option A: **RDS PostgreSQL**
- Create RDS instance in same VPC
- Use RDS endpoint in DATABASE_URL

Option B: **Local PostgreSQL**
```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres createdb reddit_marketing
```

### 6. Build and Run

```bash
# Build Docker image
sudo docker build -t reddit-marketing .

# Run container
sudo docker run -d \
  --name reddit-marketing \
  --restart unless-stopped \
  -p 127.0.0.1:3000:3000 \
  --env-file .env \
  reddit-marketing
```

### 7. Set Up Nginx Reverse Proxy

```bash
sudo apt install nginx certbot python3-certbot-nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/reddit-marketing
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/reddit-marketing /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

### 8. Set Up Cron Job

```bash
# Add to crontab
crontab -e

# Add line (run every 10 minutes)
*/10 * * * * curl -H "CRON_SECRET: your-cron-secret" https://your-domain.com/api/cron/automation
```

### 9. Monitoring

```bash
# View logs
sudo docker logs reddit-marketing

# Restart service
sudo docker restart reddit-marketing

# Check resource usage
sudo docker stats
```

---

## Health Checks

Verify deployment:

```bash
# Check if container is running
curl http://localhost:3000

# Check automation endpoint
curl -H "CRON_SECRET: your-secret" http://localhost:3000/api/cron/automation
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 502 Bad Gateway | Check if container is running, check Nginx logs |
| Database connection failed | Verify DATABASE_URL, check security group |
| OAuth not working | Verify REDDIT_CLIENT_ID/SECRET in env |
| Rate limiting | Reduce daily limits, check Reddit API status |
| Automation not running | Verify cron job, check CRON_SECRET |
