# Hostinger Linux/VPS Security & Hardening Guide — Selectt Platform

**Target OS:** Ubuntu 22.04 / 24.04 LTS  
**Provider:** Hostinger VPS  
**Security Level:** Production Enterprise Hardening  

---

## 1. System & User Hardening

### A. Dedicated Non-Root Application User
Never run the Node.js application or Nginx worker processes as `root`.
```bash
sudo adduser --system --group --shell /bin/bash selectt
sudo chown -R selectt:selectt /var/www/selectt
```

### B. SSH Security Hardening
Edit `/etc/ssh/sshd_config`:
```ini
# Disable root login
PermitRootLogin no

# Disable password authentication (use SSH Keys only)
PasswordAuthentication no

# Set idle timeout
ClientAliveInterval 300
ClientAliveCountMax 2

# Limit authentication attempts
MaxAuthTries 3
```
Restart SSH daemon:
```bash
sudo systemctl restart sshd
```

### C. Fail2ban Intrusion Prevention
Install Fail2ban to automatically block brute-force attempts on SSH and HTTP:
```bash
sudo apt install -y fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable --now fail2ban
```

---

## 2. Network & Firewall Hardening (UFW)

Ensure only necessary public ingress ports (HTTP 80, HTTPS 443, SSH 22) are open.
**Never expose MySQL (3306), Redis (6379), or Node (5000) to the public Internet.**

```bash
sudo ufw reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'
sudo ufw enable
sudo ufw status verbose
```

---

## 3. Database Security Hardening (MySQL & Redis)

### A. MySQL 8.0 Isolation
1. Verify `bind-address = 127.0.0.1` in `/etc/mysql/mysql.conf.d/mysqld.cnf`.
2. Run `sudo mysql_secure_installation`:
   - Set password validation policy to MEDIUM/STRONG.
   - Remove anonymous users.
   - Disallow root login remotely.
   - Remove test database.
3. Grant only minimum required privileges to `selectt_user` on `selectt_production`.

### B. Redis Protection
In `/etc/redis/redis.conf`:
```ini
bind 127.0.0.1 ::1
protected-mode yes
requirepass YOUR_STRONG_REDIS_PASSWORD_HERE
maxmemory 256mb
maxmemory-policy allkeys-lru
```
Restart Redis:
```bash
sudo systemctl restart redis-server
```

---

## 4. Reverse Proxy & Web Server Hardening (Nginx)

1. **Disable Nginx Version Emission:** `server_tokens off;`
2. **Deny Access to Hidden & Sensitive Files:**
   ```nginx
   location ~ /\. { deny all; access_log off; log_not_found off; }
   location ~* \.(sql|bak|log|conf|sh|env|json|pem|key)$ { deny all; access_log off; log_not_found off; }
   ```
3. **Prevent Script Execution in Upload Directories:**
   ```nginx
   location /uploads/ {
       location ~* \.(php|pl|py|jsp|asp|sh|cgi|exe)$ {
           deny all;
       }
   }
   ```
4. **Enforce Strict Transport Security (HSTS):**
   ```nginx
   add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
   ```

---

## 5. Automated Backups & Disaster Recovery

Setup daily automated cron job for database backups with 14-day retention:
Create `/usr/local/bin/backup_selectt.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/selectt"
DATE=$(date +"%Y%m%d_%H%M%S")
mkdir -p $BACKUP_DIR

# Dump Database
mysqldump -u selectt_user -p'YOUR_DB_PASSWORD' selectt_production | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Delete backups older than 14 days
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +14 -exec rm {} \;
```
Make executable and add to crontab:
```bash
chmod +x /usr/local/bin/backup_selectt.sh
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup_selectt.sh") | crontab -
```
