# Cadence - AWS Lightsail Deployment Guide

This guide will walk you through deploying Cadence to AWS Lightsail with your domain `cadencenotes.com`.

## Architecture Overview

- **Frontend**: Static files served by Nginx
- **Backend**: Node.js app running via Docker
- **Database**: PostgreSQL on the same Lightsail instance
- **Web Server**: Nginx (reverse proxy + static file serving)
- **SSL**: Let's Encrypt (free)
- **Domain**: cadencenotes.com via Route 53

## Prerequisites

- AWS account with Route 53 domain `cadencenotes.com`
- SSH access to your local machine
- Git installed locally

## Step 1: Create Lightsail Instance

1. Go to [AWS Lightsail Console](https://lightsail.aws.amazon.com/)
2. Click "Create instance"
3. **Instance location**: Choose region closest to your users (e.g., `us-east-1`)
4. **Pick your instance image**:
   - Platform: Linux/Unix
   - Blueprint: OS Only → Ubuntu 22.04 LTS
5. **Choose your instance plan**: $20/month (2 GB RAM, 2 vCPUs)
   - This is sufficient for moderate traffic
   - Can upgrade later if needed
6. **Instance name**: `cadence-production`
7. Click "Create instance"
8. Wait ~2 minutes for instance to start

## Step 2: Configure Networking

1. In Lightsail, go to your instance → **Networking** tab
2. Click **Create static IP**
   - Name it: `cadence-static-ip`
   - Attach to your instance
   - Note the IP address (e.g., `3.123.45.67`)
3. **Firewall rules** - Ensure these ports are open:
   - SSH (22)
   - HTTP (80)
   - HTTPS (443)
   - PostgreSQL (5432) - for development only, remove in production

## Step 3: Configure Route 53 DNS

1. Go to [Route 53 Console](https://console.aws.amazon.com/route53/)
2. Go to **Hosted zones** → Click on `cadencenotes.com`
3. Click **Create record**:
   - **Record name**: Leave empty (for root domain)
   - **Record type**: A
   - **Value**: Your Lightsail static IP (e.g., `3.123.45.67`)
   - **TTL**: 300
   - Click **Create records**
4. Create another record for www subdomain:
   - **Record name**: www
   - **Record type**: A
   - **Value**: Same static IP
   - Click **Create records**

**Note**: DNS propagation can take 5-60 minutes.

## Step 4: Connect to Your Instance

1. Download SSH key from Lightsail:
   - Go to **Account** → **SSH keys** tab
   - Download default key for your region (e.g., `LightsailDefaultKey-us-east-1.pem`)
   - Move it to `~/.ssh/` and set permissions:
     ```bash
     mv ~/Downloads/LightsailDefaultKey-us-east-1.pem ~/.ssh/
     chmod 400 ~/.ssh/LightsailDefaultKey-us-east-1.pem
     ```

2. SSH into your instance:
   ```bash
   ssh -i ~/.ssh/LightsailDefaultKey-us-east-1.pem ubuntu@YOUR_STATIC_IP
   ```

## Step 5: Install Required Software

Once connected via SSH, run these commands:

### Update system
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Node.js 22
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Should show v22.x.x
```

### Install Docker
```bash
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io
sudo usermod -aG docker ubuntu
```

Log out and back in for docker permissions:
```bash
exit
ssh -i ~/.ssh/LightsailDefaultKey-us-east-1.pem ubuntu@YOUR_STATIC_IP
```

### Install PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Install Nginx
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Install Certbot (for SSL)
```bash
sudo apt install -y certbot python3-certbot-nginx
```

## Step 6: Configure PostgreSQL

```bash
sudo -u postgres psql
```

In PostgreSQL shell:
```sql
CREATE DATABASE cadence;
CREATE USER cadence_user WITH PASSWORD 'PASSWORD HERE';
GRANT ALL PRIVILEGES ON DATABASE cadence TO cadence_user;
\q
```

Edit PostgreSQL config to allow local connections:
```bash
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

Add this line before other lines:
```
local   cadence         cadence_user                            md5
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

## Step 7: Deploy Application Code

### Clone your repository
```bash
cd /home/ubuntu
git clone https://github.com/jram930/micro-journal.git cadence
cd cadence
```

## Step 8: Build and Deploy Backend

```bash
cd /home/ubuntu/cadence

# Create production .env file from .env.default
cp backend/.env.default backend/.env
nano backend/.env
```

Update the values in the `.env` file:
```env
PORT=3000
NODE_ENV=production

# Database - update with your password from Step 6
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=cadence_user
DB_PASSWORD=CHANGE_THIS_TO_STRONG_PASSWORD  # Use the password you set in PostgreSQL
DB_DATABASE=cadence

# JWT Secret - generate with: openssl rand -base64 32
JWT_SECRET=PASTE_GENERATED_SECRET_HERE

# Anthropic API Key - get from https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
```

**Important**: Generate a strong JWT secret:
```bash
openssl rand -base64 32
# Copy the output and paste it as JWT_SECRET value
```

Build and run backend Docker container:
```bash
cd backend
docker build -t cadence-backend .
docker run -d \
  --name cadence-backend \
  --restart unless-stopped \
  --network host \
  --env-file .env \
  cadence-backend
```

Check if it's running:
```bash
docker ps
curl http://localhost:3000/api/health
```

## Step 9: Run Database Migrations

```bash
cd /home/ubuntu/cadence/backend
npm install
npm run migration:run
```

## Step 10: Seed Database (Optional)

```bash
npm run db:seed
```

This will create the test users (jared/luke) with their journal entries.

## Step 11: Build and Deploy Frontend

```bash
cd /home/ubuntu/cadence/frontend
npm install
npm run build
```

Copy build files to Nginx directory:
```bash
sudo mkdir -p /var/www/cadence/frontend
sudo cp -r dist/* /var/www/cadence/frontend/
sudo chown -R www-data:www-data /var/www/cadence
```

## Step 12: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/cadence
```

Copy the content from `nginx.conf` in your project, but **temporarily** remove SSL config:

```nginx
server {
    listen 80;
    server_name cadencenotes.com www.cadencenotes.com;

    root /var/www/cadence/frontend;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

    # API proxy to backend
    location /api {
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

    # Frontend routes (SPA)
    location / {
        try_files $uri $uri/ /index.html;

        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    location ~ /\. {
        deny all;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/cadence /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

## Step 13: Set Up SSL with Let's Encrypt

Wait for DNS to propagate (check with `nslookup cadencenotes.com`), then:

```bash
sudo certbot --nginx -d cadencenotes.com -d www.cadencenotes.com
```

Follow prompts:
- Enter your email
- Agree to terms
- Choose to redirect HTTP to HTTPS (option 2)

Certbot will automatically update your Nginx config with SSL!

Test auto-renewal:
```bash
sudo certbot renew --dry-run
```

## Step 14: Set Up Automatic Restarts

Create systemd service for backend:
```bash
sudo nano /etc/systemd/system/cadence-backend.service
```

Add:
```ini
[Unit]
Description=Cadence Backend
After=docker.service
Requires=docker.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/cadence/backend
ExecStartPre=/usr/bin/docker stop cadence-backend || true
ExecStartPre=/usr/bin/docker rm cadence-backend || true
ExecStart=/usr/bin/docker run --name cadence-backend --network host --env-file /home/ubuntu/cadence/backend/.env cadence-backend
ExecStop=/usr/bin/docker stop cadence-backend
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable cadence-backend
sudo systemctl start cadence-backend
sudo systemctl status cadence-backend
```

## Step 15: Test Your Deployment

1. Visit `https://cadencenotes.com` in your browser
2. You should see the login page
3. Try logging in with: `jared` / `Tiger123`
4. Create a journal entry
5. Check the stats and AI features

## Monitoring and Maintenance

### Check logs
```bash
# Backend logs
docker logs -f cadence-backend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u cadence-backend -f
```

### Restart services
```bash
# Restart backend
sudo systemctl restart cadence-backend

# Restart Nginx
sudo systemctl restart nginx

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Update application
```bash
cd /home/ubuntu/cadence
git pull origin main

# Rebuild backend
cd backend
docker build -t cadence-backend .
sudo systemctl restart cadence-backend

# Rebuild frontend
cd ../frontend
npm run build
sudo cp -r dist/* /var/www/cadence/frontend/
```

## Cost Estimate

- **Lightsail instance**: $20/month (2 GB RAM)
- **Route 53**: $0.50/month (hosted zone)
- **SSL Certificate**: Free (Let's Encrypt)
- **Data transfer**: 2 TB free with Lightsail

**Total**: ~$20.50/month

## Troubleshooting

### Backend won't start
```bash
docker logs cadence-backend
# Check .env file has correct values
cat backend/.env
```

### SSL certificate fails
```bash
# Make sure DNS is pointing to your server
nslookup cadencenotes.com
# Check Nginx is running
sudo systemctl status nginx
# Check port 80 is accessible
curl http://cadencenotes.com
```

### 502 Bad Gateway
```bash
# Check if backend is running
docker ps
curl http://localhost:3000/api/health
# Check Nginx config
sudo nginx -t
```

### Database connection errors
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql
# Test connection
psql -U cadence_user -d cadence -h localhost
```

## Security Checklist

- [ ] Changed all default passwords
- [ ] Generated strong JWT secret
- [ ] Configured CORS to only allow your domain
- [ ] SSL certificate installed and auto-renewing
- [ ] Firewall rules properly configured
- [ ] Regular backups enabled (see below)
- [ ] Removed database seed users for production

## Database Backups

Set up daily backups:
```bash
# Create backup script
cat > /home/ubuntu/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
mkdir -p $BACKUP_DIR
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
sudo -u postgres pg_dump cadence > $BACKUP_DIR/cadence_$TIMESTAMP.sql
# Keep only last 7 days
find $BACKUP_DIR -name "cadence_*.sql" -mtime +7 -delete
EOF

chmod +x /home/ubuntu/backup.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /home/ubuntu/backup.sh") | crontab -
```

## Next Steps

1. Monitor your application for a few days
2. Set up CloudWatch monitoring (optional)
3. Consider setting up a staging environment
4. Implement proper logging and error tracking (e.g., Sentry)
5. Remove seed data and create your real user accounts

## Support

For issues or questions:
- Check logs first
- Review this guide
- Search AWS Lightsail documentation
