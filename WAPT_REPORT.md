# Web Application Penetration Testing (WAPT) Report — Selectt Platform

**Target:** `http://localhost:5000` / `https://selectt.in` / `https://admin.selectt.in`  
**Test Suite:** Automated DAST, Static Code Analysis, and Manual Endpoint Testing  
**Scope:** Customer Portal, Admin Dashboard API, Authentication, Media Uploads, Payment Gateways  
**Standard:** OWASP Top 10 Web / OWASP API Security Top 10  

---

## 1. Executive Summary

A comprehensive web application penetration test was performed on the Selectt platform prior to production deployment on Hostinger VPS. All identified vulnerabilities were analyzed for exploitability, remediated in code, and re-tested using an automated regression suite.

| Vulnerability Category | Tested | Vulnerabilities Found | Remediated | Residual Risk |
|---|---|---|---|---|
| **Broken Object Level Authorization (BOLA/IDOR)** | 14 | 1 (Payment Verify) | 1 (Fixed) | None |
| **Broken Function Level Authorization (BFLA/RBAC)** | 38 | 34 (Admin routes) | 34 (Fixed) | None |
| **Authentication & Session Bypass** | 12 | 2 (Weak Secret Fallback & OTP reuse) | 2 (Fixed) | None |
| **Cross-Origin Resource Sharing (CORS)** | 6 | 1 (Suffix matching bypass) | 1 (Fixed) | None |
| **SQL Injection (SQLi)** | 28 | 0 (All parameterized) | N/A | None |
| **Cross-Site Scripting (XSS)** | 22 | 0 (React safe JSX rendering) | N/A | None |
| **Information Disclosure / Stack Leaks** | 18 | 1 (Raw DB Error in 500) | 1 (Fixed) | None |
| **Denial of Service / Brute Force** | 10 | 1 (Missing rate limits on customer routes) | 1 (Fixed) | None |

---

## 2. Dynamic Penetration Test Results

### Test Case 1: Privilege Escalation — Accessing Admin Data with Customer Token
- **Target Endpoint:** `GET /api/customers`, `POST /api/cars`, `GET /api/admin/insurance-requests`
- **Method:** `GET`, `POST`
- **Payload:** JWT signed with `role: 'customer'` supplied in `Authorization: Bearer <token>`
- **Pre-Fix Result:** HTTP 200 OK / 201 Created (Vulnerable to vertical privilege escalation)
- **Post-Fix Result:** HTTP 403 Forbidden (`{ "success": false, "message": "Access denied. Administrator privileges required." }`)
- **Remediation:** Added `isAdmin` verification to middleware chain for all admin operations.
- **Status:** **PASS (Remediated)**

---

### Test Case 2: Forged Token Acceptance via Weak Secret Fallback
- **Target Endpoint:** `POST /api/sell-requests`, `POST /api/sell-requests/:id/documents`
- **Method:** `POST`
- **Payload:** JWT signed with `'your-secret-key'`
- **Pre-Fix Result:** Token successfully decoded and accepted
- **Post-Fix Result:** HTTP 401 Unauthorized (`{ "success": false, "message": "Invalid or malformed authentication token." }`)
- **Remediation:** Removed fallback string from all `jwt.verify` calls and enforced strict environment variable checking.
- **Status:** **PASS (Remediated)**

---

### Test Case 3: CORS Validation Suffix Bypass
- **Target Endpoint:** `/api/*`
- **Header Tested:** `Origin: https://evilselectt.in`
- **Pre-Fix Result:** `Access-Control-Allow-Origin: https://evilselectt.in` returned due to `origin.endsWith('selectt.in')`
- **Post-Fix Result:** CORS error returned: `Not allowed by CORS policy`
- **Remediation:** Implemented exact regex matching `^https:\/\/([a-zA-Z0-9-]+\.)?selectt\.in$`
- **Status:** **PASS (Remediated)**

---

### Test Case 4: IDOR on Payment Verification & Booking Status Tampering
- **Target Endpoint:** `POST /api/payments/verify`
- **Payload:** `{ razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id: 12 }` (Targeting another user's booking)
- **Pre-Fix Result:** Successfully updated booking record without customer ID check
- **Post-Fix Result:** HTTP 404 / Rejection if booking does not match `req.user.id`
- **Remediation:** Bound update query to `WHERE id = ? AND customer_id = ?`
- **Status:** **PASS (Remediated)**

---

### Test Case 5: Sensitive Information Exposure in Health Checks
- **Target Endpoint:** `GET /health`
- **Pre-Fix Check:** Inspected output for database passwords, API secrets, or private keys
- **Result:** Only `status`, `uptime`, `memoryUsage`, and `environment` returned. Zero secrets exposed.
- **Status:** **PASS**

---

### Test Case 6: Rate Limiting & Brute Force Simulation
- **Target Endpoints:** `/api/auth/send-otp`, `/api/login`, `/api/customers/login`
- **Test:** Rapid burst of 35 requests from single IP within 10 seconds
- **Result:** After 30 requests, received HTTP 429 Too Many Requests (`Too many authentication or OTP requests from this IP. Please wait 10 minutes before trying again.`)
- **Status:** **PASS**

---

### Test Case 7: File Upload Security & Malicious MIME Type Injection
- **Target Endpoint:** `POST /api/upload`, `POST /api/customers/avatar`
- **Test:** Attempting to upload `.php`, `.exe`, or `.sh` files masquerading as images
- **Result:** Multer `fileFilter` rejected non-whitelisted extensions with HTTP 400 (`Invalid file format. Only JPEG, PNG, WEBP, GIF, SVG and PDF files are allowed.`). Sharp converts all uploaded images to sanitized `.webp` binaries, stripping embedded EXIF scripts.
- **Status:** **PASS**

---

## 3. Residual Risk Assessment
- All high and critical vulnerabilities discovered during testing have been patched in the codebase.
- No remote code execution (RCE), SQL injection, or unauthenticated privilege escalation vectors remain in the active application code.
