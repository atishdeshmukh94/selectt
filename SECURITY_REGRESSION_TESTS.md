# Automated Security Regression Test Suite — Selectt Platform

**Test Script Location:** `backend/scripts/test_hardened_suite.js`  
**Execution Command:** `npm test` (inside `backend/` directory)  
**Total Test Cases:** 8  
**Pass Rate:** **100% (8/8 Passed)**  

---

## 1. Test Suite Specifications & Verification Logic

```
====================================================
RUNNING REGRESSION TEST SUITE AGAINST HARDENED SERVER
====================================================

✅ PASS - Health Check & Zero Secrets Exposure (HTTP 200)
✅ PASS - Unauthenticated Admin Route Rejection (HTTP 401)
✅ PASS - Customer Token Blocked from Admin Customers List (HTTP 403 Forbidden)
✅ PASS - Customer Token Blocked from Creating Cars (HTTP 403 Forbidden)
✅ PASS - Customer Token Blocked from Admin Insurance Requests (HTTP 403 Forbidden)
✅ PASS - Weak Fallback Secret Key Forgery Rejection (HTTP 401 Invalid Token)
✅ PASS - Legitimate Admin Token Access (HTTP 200 OK)
✅ PASS - HTTP Security Headers - Helmet Active (X-Content-Type-Options: nosniff)

====================================================
TEST SUMMARY: 8/8 PASSED (100% SUCCESS)
====================================================
```

---

## 2. Detailed Test Case Implementations

### Test 1: Zero Secrets Exposure in Health Checks
- **Objective:** Ensure `/health` endpoint exposes operational metrics without leaking environment variables, database passwords, or JWT secrets.
- **Assertion:** `res.statusCode === 200` AND response body does not contain `DB_PASS`, `JWT_SECRET`, or `password`.

### Test 2: Unauthenticated Route Access Protection
- **Objective:** Verify protected admin routes immediately reject requests with missing `Authorization` header.
- **Assertion:** `res.statusCode === 401` (`Access denied. No token provided.`).

### Test 3: Vertical Privilege Escalation (RBAC Prevention) — Customer Accessing Customer List
- **Objective:** Verify customer JWT (`role: 'customer'`) cannot access `/api/customers`.
- **Assertion:** `res.statusCode === 403` (`Access denied. Administrator privileges required.`).

### Test 4: Vertical Privilege Escalation (RBAC Prevention) — Customer Creating Inventory
- **Objective:** Verify customer JWT cannot inject car listings via `/api/cars`.
- **Assertion:** `res.statusCode === 403` (`Access denied. Administrator privileges required.`).

### Test 5: Vertical Privilege Escalation (RBAC Prevention) — Customer Accessing Insurance Records
- **Objective:** Verify customer JWT cannot access administrative insurance quote records.
- **Assertion:** `res.statusCode === 403` (`Access denied. Administrator privileges required.`).

### Test 6: Forged Token Rejection (Weak Fallback Secret Exploitation)
- **Objective:** Verify tokens signed with dummy key `'your-secret-key'` are rejected when `JWT_SECRET` is enforced.
- **Assertion:** `res.statusCode === 401` (`Invalid or malformed authentication token.`).

### Test 7: Authorized Admin Operations
- **Objective:** Ensure legitimate admin tokens with `role: 'admin'` and signed with `process.env.JWT_SECRET` succeed normally.
- **Assertion:** `res.statusCode === 200` and returns expected inventory/customer payload.

### Test 8: Security Headers Verification
- **Objective:** Confirm Helmet security headers are emitted on responses.
- **Assertion:** `res.headers['x-content-type-options'] === 'nosniff'`.
