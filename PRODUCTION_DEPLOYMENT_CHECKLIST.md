# Production Deployment Checklist — Selectt Platform

**Target Environment:** Hostinger VPS (Ubuntu 22.04 / 24.04 LTS)  
**Domains:** `selectt.in`, `www.selectt.in`, `admin.selectt.in`  

---

## 1. Pre-Deployment Verification Matrix

| Step | Task | Status | Action Required |
|:---:|---|:---:|---|
| **1** | Frontend Production Build (`frontend/dist`) | ✅ PASS | Run `npm run build` in `frontend/` |
| **2** | Admin Dashboard Build (`admin/dist`) | ✅ PASS | Run `npm run build` in `admin/` |
| **3** | Backend Syntax & Regression Tests | ✅ PASS | Run `npm test` in `backend/` |
| **4** | Dependency Vulnerability Audits | ✅ PASS | `npm audit fix` executed |
| **5** | Security Headers & CORS Configuration | ✅ PASS | Nginx and Express Helmet hardened |
| **6** | Production `.env` Prepared | ⚠️ ACTION | Set live database credentials & API keys |
| **7** | Database Schema Initialized | ⚠️ ACTION | Import `database.sql` on MySQL 8.0 |
| **8** | SSL / TLS Certificate (Let's Encrypt) | ⚠️ ACTION | Run `certbot --nginx` on VPS |
| **9** | PM2 Daemon Cluster Setup | ⚠️ ACTION | Start with `ecosystem.config.js` |
| **10** | Firewall & Port Restrictions | ⚠️ ACTION | Allow only 80, 443, 22 on UFW |

---

## 2. Step-by-Step Hostinger VPS Deployment Commands

### Step 1: Server Base Setup & Package Installation
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx mysql-server redis-server git curl ufw
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

### Step 2: Configure UFW Firewall
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### Step 3: Setup MySQL 8.0 Database
```bash
sudo mysql -u root -p
```
```sql
CREATE DATABASE selectt_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'selectt_user'@'localhost' IDENTIFIED BY 'YOUR_STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON selectt_production.* TO 'selectt_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```
Import database schema:
```bash
mysql -u selectt_user -p selectt_production < /var/www/selectt/database.sql
```

### Step 4: Clone & Build Application
```bash
cd /var/www
sudo git clone https://github.com/your-repo/selectt.git
cd /var/www/selectt

# Build Frontend
cd frontend && npm ci && npm run build && cd ..

# Build Admin
cd admin && npm ci && npm run build && cd ..

# Setup Backend
cd backend && npm ci --omit=dev
```

### Step 5: Configure Backend Production `.env`
Create `/var/www/selectt/backend/.env`:
```ini
NODE_ENV=production
PORT=5000
DB_HOST=localhost
DB_USER=selectt_user
DB_PASS=YOUR_STRONG_PASSWORD_HERE
DB_NAME=selectt_production
JWT_SECRET=GENERATE_64_CHAR_HEX_SECRET_HERE
ALLOWED_ORIGINS=https://selectt.in,https://www.selectt.in,https://admin.selectt.in

# 3rd-Party API Keys
IMAGEKIT_PUBLIC_KEY=public_...
IMAGEKIT_PRIVATE_KEY=private_...
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/...

BUNNY_STREAM_LIBRARY_ID=...
BUNNY_STREAM_API_KEY=...
BUNNY_STREAM_CDN_HOSTNAME=...

GALLABOX_API_KEY=...
GALLABOX_API_SECRET=...
GALLABOX_CHANNEL_ID=...
```

### Step 6: Start Backend with PM2
```bash
cd /var/www/selectt/backend
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### Step 7: Configure Nginx & SSL
```bash
sudo cp /var/www/selectt/nginx/nginx.conf /etc/nginx/sites-available/selectt
sudo ln -s /etc/nginx/sites-available/selectt /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Issue Free SSL Certificates
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d selectt.in -d www.selectt.in -d admin.selectt.in
```
