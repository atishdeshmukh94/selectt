# Bugs Found and Fixed — Selectt Platform

This document logs all functional, security, logic, and configuration bugs identified and fixed during the pre-production audit.

---

## 1. Summary of Bug Counts
- **Total Bugs Identified:** 11
- **Total Bugs Fixed:** 11
- **Remaining Unresolved Bugs:** 0

---

## 2. Detailed Bug Log

### Bug #1: Unprotected Admin Endpoints (RBAC Privilege Escalation)
- **Component:** `backend/index.js`, `backend/auth-middleware.js`
- **Root Cause:** 34 admin endpoints used only `authMiddleware` which allowed customer tokens to perform administrative CRUD operations.
- **Fix:** Applied `isAdmin` middleware across all 34 endpoints and upgraded `auth-middleware.js` to return proper 403 Forbidden responses.
- **Verification:** Tested via `npm test` automated suite.
- **Status:** **FIXED**

### Bug #2: Insecure JWT Secret Fallback String
- **Component:** `backend/index.js` (lines 1972 & 2051)
- **Root Cause:** `process.env.JWT_SECRET || 'your-secret-key'` allowed forged tokens when JWT_SECRET was unset.
- **Fix:** Removed `'your-secret-key'` fallback and required `process.env.JWT_SECRET`.
- **Verification:** Verified forged token rejection in test suite.
- **Status:** **FIXED**

### Bug #3: Permissive CORS Domain Suffix Bypass
- **Component:** `backend/index.js` (lines 66-70)
- **Root Cause:** `origin.endsWith('selectt.in')` matched malicious third-party domains like `evilselectt.in`.
- **Fix:** Replaced with exact regex `^https:\/\/([a-zA-Z0-9-]+\.)?selectt\.in$`.
- **Verification:** Verified CORS rejection on unauthorized domains.
- **Status:** **FIXED**

### Bug #4: Payment Verification IDOR Vulnerability
- **Component:** `backend/index.js` (`POST /api/payments/verify`)
- **Root Cause:** Query updated booking status by `id` without verifying `customer_id = req.user.id`.
- **Fix:** Added `customer_id = req.user.id` filter and verified `affectedRows`.
- **Verification:** Tested via manual IDOR payload execution.
- **Status:** **FIXED**

### Bug #5: OTP Reuse / Replay Vulnerability
- **Component:** `backend/index.js` (`POST /api/auth/verify-otp`)
- **Root Cause:** OTP codes were validated but not deleted immediately after verification.
- **Fix:** Added immediate deletion `DELETE FROM otps WHERE phone = ?`.
- **Verification:** Verified second use of same OTP returns 400 Invalid OTP.
- **Status:** **FIXED**

### Bug #6: Missing Rate Limiting on Customer Authentication & Public Forms
- **Component:** `backend/index.js`
- **Root Cause:** Only admin login and OTP routes had rate limiters.
- **Fix:** Added `authLimiter` to `/api/customers/login` and `/api/customers/register`, and `formSubmissionLimiter` to `/api/leads`, `/api/insurance/request`, and `/api/sell-requests`.
- **Verification:** Verified 429 status on burst requests.
- **Status:** **FIXED**

### Bug #7: Raw Database Error Exposure in HTTP 500 Responses
- **Component:** `backend/index.js`
- **Root Cause:** Error callbacks returned `res.status(500).json({ error: err.message })`, leaking SQL table structures.
- **Fix:** Hardened error responses to return generic safe messages in production mode (`NODE_ENV === 'production'`).
- **Verification:** Verified sanitized response body.
- **Status:** **FIXED**

### Bug #8: Floating WhatsApp Button Bouncing Glitch
- **Component:** `frontend/src/components/common/WhatsAppChatButton.jsx`
- **Root Cause:** Animation included continuous vertical jumping bounce that was distracting to users.
- **Fix:** Removed keyframe translateY bounce while keeping typewriter expand/collapse behavior.
- **Verification:** Tested in React dev server and verified static placement.
- **Status:** **FIXED**

### Bug #9: Duplicate `allowedOrigins` Variable Declaration in Backend
- **Component:** `backend/index.js`
- **Root Cause:** Duplicate declaration of `const allowedOrigins` caused syntax error during startup check.
- **Fix:** Spliced duplicate declaration and verified with `node -c index.js`.
- **Verification:** `node -c index.js` exited 0 with no errors.
- **Status:** **FIXED**

### Bug #10: Missing Security Headers in Nginx Proxy
- **Component:** `nginx/nginx.conf`
- **Root Cause:** Reverse proxy lacked `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, and `server_tokens off`.
- **Fix:** Added complete OWASP-compliant security headers and sensitive file blocking.
- **Verification:** Verified syntax and header configurations.
- **Status:** **FIXED**

### Bug #11: Outdated Vulnerable Dependencies in Backend and Frontend
- **Component:** `backend/package.json`, `frontend/package.json`, `admin/package.json`
- **Root Cause:** Transitive vulnerabilities in `morgan`, `qs`, `uuid`, `esbuild`, `browserslist`.
- **Fix:** Executed `npm audit fix` across all workspaces.
- **Verification:** 0 vulnerabilities in Admin, minimal safe dev in frontend and backend.
- **Status:** **FIXED**
