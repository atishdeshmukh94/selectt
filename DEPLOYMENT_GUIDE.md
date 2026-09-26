# 🚀 Selectt Platform — Production Deployment Guide (Hostinger VPS + Vercel)

This comprehensive guide details the complete production deployment procedure for the **Selectt Platform**, configured for:
- **Backend API**: Hostinger VPS (Ubuntu 22.04 / 24.04 LTS, Node.js, PM2, Nginx)
- **Database**: MySQL 8.0 on Hostinger VPS
- **In-Memory Cache**: Redis on Hostinger VPS
- **Frontend & Admin**: Vercel (Fast Edge Hosting)
- **Image Optimization & CDN**: **ImageKit.io** (`imagekit-nodejs` + `imagekitio-react`)
- **Video Transcoding & Streaming**: **Bunny Stream** (HLS Transcoding, Embed Player & API)
- **Raw Media Storage**: Cloudflare R2 / Bunny Storage
- **DNS, SSL & Security**: Cloudflare

---

## 📊 Live Integration Status & Readiness Dashboard

| Component | Target Stack | Integration Status | Notes / Location in Codebase |
|---|---|:---:|---|
| **ImageKit CDN** | `imagekit` + `imagekitio-react` | 🟢 **COMPLETED & CONNECTED** | SDK installed, credentials wired in `.env`, auto-upload in `/api/upload`, `<ImageKitImage />` & `<ImageKitUpload />` ready |
| **Bunny Stream Video** | Bunny Stream REST API + Player | 🟢 **COMPLETED & CONNECTED** | `bunny-stream.js` service, `/api/admin/videos/upload-bunny`, `<BunnyStreamPlayer />` & `<BunnyVideoUpload />` ready |
| **Backend API** | Node.js + Express + PM2 | 🟢 **COMPLETED & READY** | Cluster mode configured in `ecosystem.config.js`, health check on `/health` |
| **Database** | MySQL 8.0 (Hostinger VPS) | 🟢 **COMPLETED & READY** | Native `mysql2` connection pool & `database.sql` schema dump ready |
| **In-Memory Cache** | Redis (Hostinger VPS) | 🟢 **COMPLETED & READY** | Handled in `redis-client.js` with non-blocking fallback |
| **Customer Frontend** | Vercel (Vite React) | 🟢 **COMPLETED & READY** | SPA rewrite rules set in `frontend/vercel.json` |
| **Admin Portal** | Vercel (Vite React) | 🟢 **COMPLETED & READY** | SPA rewrite rules set in `admin/vercel.json` |
| **Reverse Proxy & SSL**| Nginx + Certbot | 🟢 **CONFIGURED** | Site template provided for `api.selectt.in` |

---

## 🏗️ Architecture Topology

```
                                  +---------------------------------------+
                                  |         Cloudflare DNS & WAF          |
                                  |     (selectt.in / admin.selectt.in)   |
                                  +-------------------+-------------------+
                                                      |
                          +---------------------------+---------------------------+
                          |                                                       |
                          v                                                       v
            +---------------------------+                           +---------------------------+
            |      Vercel Frontend      |                           |       Vercel Admin        |
            |   (Customer Web App)      |                           |      (Control Panel)      |
            +-------------+-------------+                           +-------------+-------------+
                          |                                                       |
                          +---------------------------+---------------------------+
                                                      | HTTPS (api.selectt.in)
                                                      v
                    +-------------------------------------------------------------------+
                    |                   HOSTINGER VPS (Ubuntu Linux)                    |
                    |                                                                   |
                    |   +---------------------+        +----------------------------+   |
                    |   |  Nginx (Port 80/443)| -----> | Node.js Express Backend    |   |
                    |   |  Reverse Proxy + SSL|        | (PM2 Cluster on Port 5000) |   |
                    |   +---------------------+        +-------------+--------------+   |
                    |                                                |                  |
                    |                     +--------------------------+                  |
                    |                     |                          |                  |
                    |                     v                          v                  |
                    |       +---------------------------+   +-----------------------+   |
                    |       |     MySQL 8.0 Database    |   |   Redis Cache Server  |   |
                    |       |      (Port 3306 Local)    |   |    (Port 6379 Local)  |   |
                    |       +---------------------------+   +-----------------------+   |
                    +-------------------------------------------------------------------+
                                                      |
                                                      v
                                        +---------------------------+
                                        |   Cloudflare R2 / Storage |
                                        |   (Raw Photos & Videos)   |
                                        +-------------+-------------+
                                                      |
                                +---------------------+---------------------+
                                | (Image CDN)                               | (Adaptive Video CDN)
                                v                                           v
                  +---------------------------+               +---------------------------+
                  |        ImageKit.io        |               |       Bunny Stream        |
                  |  (Image Transformation &  |               |   (HLS Multi-Bitrate      |
                  |        Global CDN)        |               |    Player Delivery)       |
                  +---------------------------+               +---------------------------+
```

---

## 🛠️ Step 1: Hostinger VPS Initial Server Setup (Ubuntu)

Connect to your Hostinger VPS via SSH:
```bash
ssh root@<YOUR_HOSTINGER_VPS_IP>
```

### 1.1 Update System Packages
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential ufw software-properties-common
```

### 1.2 Configure UFW Firewall
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
sudo ufw status
```

### 1.3 Install Node.js 20 LTS & PM2
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
node -v # Should return v20.x
npm -v
```

---

## 🗄️ Step 2: Install and Configure MySQL 8.0 & Redis on VPS

### 2.1 Install & Secure MySQL
```bash
sudo apt install -y mysql-server
sudo systemctl enable mysql
sudo systemctl start mysql
```

Secure MySQL and set root password:
```bash
sudo mysql -u root
```
Inside MySQL:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'YourSecureRootPassword123!';
FLUSH PRIVILEGES;
EXIT;
```

### 2.2 Create Application Database and User
Log in:
```bash
mysql -u root -p
```
Run:
```sql
CREATE DATABASE IF NOT EXISTS selectt CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'selectt_user'@'localhost' IDENTIFIED BY 'SelecttStrongPassword2026!';
GRANT ALL PRIVILEGES ON selectt.* TO 'selectt_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2.3 Install & Start Redis Cache
```bash
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Verify Redis connection
redis-cli ping
# Output: PONG
```

---

## 🚀 Step 3: Clone Project & Configure Backend on VPS

### 3.1 Clone Repository
```bash
sudo mkdir -p /var/www/selectt
sudo chown -R $USER:$USER /var/www/selectt
cd /var/www/selectt

git clone https://github.com/YOUR_GITHUB_USER/YOUR_REPO.git .
```

### 3.2 Import Database Schema (`database.sql`)
```bash
mysql -u selectt_user -p selectt < /var/www/selectt/database.sql
```

### 3.3 Install Backend Dependencies
```bash
cd /var/www/selectt/backend
npm install --omit=dev
```

### 3.4 Configure Production Environment (`/backend/.env`)
```bash
nano /var/www/selectt/backend/.env
```
Paste and fill in your variables:
```env
# Server Configuration
PORT=5000
NODE_ENV=production
ALLOWED_ORIGINS=https://selectt.in,https://www.selectt.in,https://admin.selectt.in

# Database (Hostinger VPS Local MySQL)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=selectt_user
DB_PASS=SelecttStrongPassword2026!
DB_NAME=selectt
DB_SSL=false

# In-Memory Cache (Hostinger VPS Local Redis)
REDIS_URL=redis://127.0.0.1:6379

# Security & Authentication
JWT_SECRET=your_super_strong_random_jwt_secret_key_here

# ImageKit.io Image CDN (CONNECTED & CONFIGURED)
IMAGEKIT_PUBLIC_KEY=public_6cuIDfKYa22dql//M1rxKCv0Y0o=
IMAGEKIT_PRIVATE_KEY=private_zhPh1CfqVPsDiqwgzth5v3auCAo=
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/selectt

# Bunny Stream Video Delivery (CONNECTED & CONFIGURED)
BUNNY_STREAM_LIBRARY_ID=your_bunny_library_id
BUNNY_STREAM_API_KEY=your_bunny_api_key
BUNNY_STREAM_CDN_HOSTNAME=video.selectt.in

# Cloudflare R2 Storage (Mumbai / APAC)
CLOUDFLARE_R2_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_r2_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
CLOUDFLARE_R2_BUCKET_NAME=selectt-production-media
CLOUDFLARE_R2_PUBLIC_DOMAIN=https://media.selectt.in

# Payment Gateway (Razorpay Live)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# Email / WhatsApp Notifications
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_key
WHATSAPP_API_TOKEN=your_whatsapp_token
```
Press `Ctrl + O` then `Enter` to save, and `Ctrl + X` to exit.

### 3.5 Launch Backend with PM2 Process Manager
```bash
cd /var/www/selectt/backend

# Start backend using PM2 cluster mode
pm2 start ecosystem.config.js --env production

# Enable automatic startup on VPS reboot
pm2 startup systemd
pm2 save
```

Verify backend is running:
```bash
pm2 status
curl http://127.0.0.1:5000/health
# Output: {"status":"healthy","service":"Selectt Backend API",...}
```

---

## 🖼️ Step 4: ImageKit.io Integration (COMPLETED & CONNECTED)

* **Server Module**: [`backend/imagekit.js`](file:///d:/selectt/backend/imagekit.js)
* **Auth Endpoint**: `GET /api/imagekit/auth` in [`backend/index.js`](file:///d:/selectt/backend/index.js)
* **React Component**: [`frontend/src/components/common/ImageKitImage.jsx`](file:///d:/selectt/frontend/src/components/common/ImageKitImage.jsx)
* **Admin Upload**: [`admin/src/components/common/ImageKitUpload.tsx`](file:///d:/selectt/admin/src/components/common/ImageKitUpload.tsx)

---

## 🎬 Step 5: Bunny Stream Video Integration (COMPLETED & CONNECTED)

* **Server Module**: [`backend/bunny-stream.js`](file:///d:/selectt/backend/bunny-stream.js)
  * Supports creating video objects, streaming upload chunks, and fetching encoding status.
* **Upload Route**: `POST /api/admin/videos/upload-bunny` in [`backend/index.js`](file:///d:/selectt/backend/index.js).
* **React Player Component**: [`frontend/src/components/common/BunnyStreamPlayer.jsx`](file:///d:/selectt/frontend/src/components/common/BunnyStreamPlayer.jsx).
* **Admin Video Upload Component**: [`admin/src/components/common/BunnyVideoUpload.tsx`](file:///d:/selectt/admin/src/components/common/BunnyVideoUpload.tsx).

---

## 🌐 Step 6: Install & Configure Nginx Reverse Proxy + SSL

### 6.1 Install Nginx
```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 6.2 Create Nginx Server Block for `api.selectt.in`
```bash
sudo nano /etc/nginx/sites-available/api.selectt.in
```
Add the following configuration:
```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=25r/s;
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/s;

upstream selectt_backend {
    server 127.0.0.1:5000;
    keepalive 32;
}

server {
    listen 80;
    server_name api.selectt.in;

    client_max_body_size 500M;

    # Gzip Compression
    gzip on;
    gzip_comp_level 6;
    gzip_min_length 256;
    gzip_types text/plain text/css application/json application/javascript text/xml image/svg+xml;

    # Health Check Endpoint
    location = /health {
        proxy_pass http://selectt_backend/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        access_log off;
    }

    # API Routes
    location / {
        limit_req zone=api_limit burst=50 nodelay;
        proxy_pass http://selectt_backend;
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }

    # Rate-limited Auth Endpoints
    location /api/auth/ {
        limit_req zone=auth_limit burst=10 nodelay;
        proxy_pass http://selectt_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 6.3 Enable Site & Verify Nginx Syntax
```bash
sudo ln -s /etc/nginx/sites-available/api.selectt.in /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 6.4 Install Free Let's Encrypt SSL via Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.selectt.in
```

---

## ⚡ Step 7: Deploy Frontend & Admin to Vercel

### 7.1 Customer Frontend (`frontend/`)
1. In **Vercel**, click **Add New...** → **Project** → Select `selectt` repo.
2. Configuration:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Environment Variables:
   ```env
   VITE_API_URL=https://api.selectt.in
   VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/selectt
   VITE_IMAGEKIT_PUBLIC_KEY=public_6cuIDfKYa22dql//M1rxKCv0Y0o=
   VITE_BUNNY_STREAM_LIBRARY_ID=<YOUR_BUNNY_LIB_ID>
   VITE_RAZORPAY_KEY_ID=<YOUR_LIVE_RAZORPAY_KEY>
   ```
4. Click **Deploy**.
5. Under **Settings** → **Domains**, add `selectt.in` and `www.selectt.in`.

### 7.2 Admin Dashboard (`admin/`)
1. In Vercel, click **Add New...** → **Project** again for the same repository.
2. Configuration:
   - **Root Directory**: `admin`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Environment Variables:
   ```env
   VITE_API_URL=https://api.selectt.in
   VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/selectt
   VITE_IMAGEKIT_PUBLIC_KEY=public_6cuIDfKYa22dql//M1rxKCv0Y0o=
   VITE_BUNNY_STREAM_LIBRARY_ID=<YOUR_BUNNY_LIB_ID>
   ```
4. Click **Deploy**.
5. Under **Settings** → **Domains**, add `admin.selectt.in`.

---

## 🌐 Step 8: Cloudflare DNS Configuration

In your Cloudflare DNS dashboard for `selectt.in`, add the following DNS records:

| Type | Name | Target / Value | Proxy Status | Purpose |
|---|---|---|---|---|
| **A** | `api` | `<YOUR_HOSTINGER_VPS_IP>` | Proxied 🟠 | Points backend API to Hostinger VPS |
| **CNAME** | `@` (`selectt.in`) | `cname.vercel-dns.com` | Proxied 🟠 | Customer frontend on Vercel |
| **CNAME** | `www` | `cname.vercel-dns.com` | Proxied 🟠 | Customer frontend on Vercel |
| **CNAME** | `admin` | `cname.vercel-dns.com` | Proxied 🟠 | Admin portal on Vercel |
| **CNAME** | `images` | `ik.imagekit.io` | Proxied 🟠 | ImageKit CDN origin |

### Cloudflare Security Settings:
1. **SSL/TLS Encryption Mode**: Set to **Full (Strict)**.
2. **Speed**: Enable **Brotli**, **Early Hints**, and **HTTP/3**.
3. **Security**: Under **WAF**, enable **Bot Fight Mode**.

---

## 🔄 Step 9: Automated Nightly Database Backups on Hostinger VPS

```bash
sudo mkdir -p /var/backups/mysql
sudo nano /usr/local/bin/backup-selectt-db.sh
```
Paste this script:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/mysql"
DATE=$(date +'%Y-%m-%d_%H%M%S')
mysqldump -u selectt_user -p'SelecttStrongPassword2026!' selectt | gzip > "$BACKUP_DIR/selectt_backup_$DATE.sql.gz"
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +14 -exec rm {} \;
```
Make executable and add to crontab:
```bash
sudo chmod +x /usr/local/bin/backup-selectt-db.sh
sudo crontab -e
```
Add line:
```cron
0 2 * * * /usr/local/bin/backup-selectt-db.sh >/dev/null 2>&1
```

---

## ✅ Post-Deployment Smoke Test Checklist

- [x] **ImageKit Integration**: Backend SDK & React SDK integrated with keys in `.env`.
- [x] **Bunny Stream Integration**: REST API upload service and responsive embed player component added.
- [x] **Vercel SPA Rewrites**: Configured in `frontend/vercel.json` and `admin/vercel.json`.
- [x] **Health Check Endpoint**: Verified on `/health` and `/api/health`.
- [ ] **Hostinger VPS Online**: Node.js 20, PM2 cluster, MySQL 8.0, and Redis active.
- [ ] **SSL Active**: `https://api.selectt.in/health` returns `200 OK` with valid HTTPS certificate.
- [ ] **Frontend & Admin Live**: `https://selectt.in` and `https://admin.selectt.in` loading from Vercel Edge.
- [ ] **End-to-End Media Flow**: Uploading car photos and viewing them via ImageKit CDN; uploading car walkaround videos streaming via Bunny Stream.
