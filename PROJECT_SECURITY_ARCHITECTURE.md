# Production System & Security Architecture — Selectt Platform

```
                    INTERNET (Public Traffic)
                               │
                               ▼
                   YOUR DOMAIN (DNS / Cloudflare)
                   selectt.in / admin.selectt.in
                               │
                         HTTPS / TLS 1.3
                               │
                               ▼
                  ┌─────────────────────────┐
                  │    NGINX Reverse Proxy  │
                  │  (Rate Limit, SSL, HSTS)│
                  └────────────┬────────────┘
                               │
                ┌──────────────┴──────────────┐
                ▼                             ▼
       Static SPA Assets             Reverse Proxy (/api/)
    /var/www/selectt/frontend/dist        localhost:5000 / localhost:3000
    /var/www/selectt/admin/dist               │
                                              ▼
                                 ┌─────────────────────────┐
                                 │   Node.js Express API   │
                                 │  (PM2 Cluster Supervisor│
                                 └────────────┬────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    ▼                         ▼                         ▼
         ┌───────────────────┐      ┌───────────────────┐     ┌───────────────────┐
         │     Database      │      │    Media Storage  │     │   External APIs   │
         │  MySQL 8.0 Engine │      │  ImageKit.io CDN  │     │  Razorpay (Pay)   │
         │  Redis Cache (LRU)│      │ Bunny Stream Video│     │ Gallabox WhatsApp │
         │ (127.0.0.1 bound) │      │ Local /uploads/   │     │  SMTP / SendGrid  │
         └───────────────────┘      └───────────────────┘     └───────────────────┘
```

---

## 1. Architecture Component Breakdown

### A. Edge & Reverse Proxy Layer (Nginx)
- **Technology:** Nginx 1.18+ / 1.24+ on Hostinger Ubuntu VPS
- **Purpose:** TLS/SSL Termination, Gzip HTTP compression, Static asset delivery (Vite build outputs for Marketplace and Admin), Rate limiting bursts, IP filtering, and proxying `/api/` traffic.
- **Security Boundary:** First line of defense against the public Internet.
- **Protections Enforced:**
  - `server_tokens off;` (Hides Nginx version)
  - `X-Frame-Options "SAMEORIGIN"` (Clickjacking prevention)
  - `X-Content-Type-Options "nosniff"` (MIME sniffing prevention)
  - `Strict-Transport-Security` (Enforced HTTPS)
  - Hidden file protection (Denies `/\.` and sensitive file extensions `.env`, `.sql`, `.key`)
  - Rate limiting zones (`30 req/s` general API, `5 req/s` auth/OTP)

---

### B. Application Backend Layer (Node.js & Express)
- **Technology:** Node.js 20.x LTS, Express 5.2.1, PM2 Process Manager
- **Port:** `localhost:5000` (Configurable via `PORT` in `.env`)
- **Trust Boundary:** Private local loopback (`127.0.0.1`), accessible only via Nginx reverse proxy.
- **Sensitive Data Handled:** User credentials, JWT payloads, customer PII (phone, email, KYC docs), payment hashes.
- **Authentication & Authorization:**
  - **Customer JWT:** Signed with `JWT_SECRET` for 7 days (`role: 'customer'`).
  - **Admin JWT:** Signed with `JWT_SECRET` for 7 days (`role: 'admin'`).
  - **RBAC Middleware:** `[authMiddleware, isAdmin]` protects all 34 administrative CRUD endpoints.
  - **IDOR Protection:** Queries enforce `WHERE customer_id = req.user.id`.

---

### C. Database Layer (MySQL 8.0 & Redis)
- **Technology:** MySQL Server 8.0 + Redis 7.0
- **Network Binding:** Strictly bound to `127.0.0.1` (Zero public exposure).
- **Access Model:** Least-privilege MySQL user `selectt_user` granted access only to `selectt_production`.
- **Query Security:** 100% Parameterized queries (`?` placeholders via `mysql2` connection pool) to eliminate SQL injection.
- **Failure Modes:** MySQL pool connection timeout handling; Redis failover fallback.

---

### D. Media & Cloud Storage Layer
- **Image CDN & DAM:** [ImageKit.io](https://imagekit.io) via Server SDK (`backend/imagekit.js`) and Client SDK.
- **Video Streaming CDN:** [Bunny.net Stream](https://bunny.net) via REST API (`backend/bunny-stream.js`) with HLS/MP4 adaptive streaming.
- **Local Fallback:** `/uploads/` processed with `sharp` webp conversion (2200px max, 82% quality) and 300px thumbnails.

---

### E. Third-Party Integrations Layer
- **Razorpay:** Server-side HMAC-SHA256 signature verification on `POST /api/payments/verify`.
- **Gallabox WhatsApp:** Automated template dispatch for OTP verification and administrative lead/sell alerts.
- **Nodemailer:** SMTP notifications for bookings and lead confirmations.

---

## 2. Security Zones & Trust Boundaries

```
[ UNTRUSTED ] Public Internet -> Browsers / Mobile Clients / Potential Attackers
      │
[ DMZ / EDGE ] Nginx Reverse Proxy (Port 80/443 -> SSL Termination -> Rate Limiting)
      │
[ TRUSTED APP ] Express API (Port 5000 / PM2 Cluster -> Helmet -> RBAC -> JWT Verification)
      │
[ INTERNAL DATA ] MySQL 8.0 (Port 3306 @ localhost) + Redis (Port 6379 @ localhost)
      │
[ SECURE OUTBOUND ] Razorpay / ImageKit / Bunny.net / Gallabox (HTTPS + API Key Authentication)
```

---

## 3. Data Flow Diagram: End-to-End Customer Request

1. **Client Request:** Browser requests `https://selectt.in/cars`.
2. **Nginx Ingress:** Nginx receives HTTPS on Port 443, verifies TLS cert, evaluates rate limiting zone.
3. **Static Match:** Requests for HTML/JS/CSS are served directly from `/var/www/selectt/frontend/dist` with `Cache-Control` headers.
4. **API Match:** Request for `/api/cars` is proxied to `http://127.0.0.1:5000/api/cars`.
5. **Backend Processing:**
   - Express runs Helmet, HPP, CORS origin validation, Morgan logging.
   - Executes parameterized query `SELECT * FROM cars WHERE status = 'active'` against MySQL connection pool.
   - Returns sanitized JSON payload.
6. **Nginx Response:** Nginx compresses output (Gzip level 6) and transmits response back over encrypted HTTPS stream.
