# Role-Based Access Control (RBAC) & Authorization Matrix — Selectt

**Application:** Selectt Marketplace & Management Suite  
**Enforcement Layer:** Server-Side Express Middleware (`authMiddleware`, `isAdmin`, `customerAuth`)  

---

## 1. Defined System Roles

1. **Anonymous / Guest (`guest`)**: Unauthenticated public website visitors.
2. **Customer (`customer`)**: Authenticated car buyers and sellers (authenticated via WhatsApp OTP or Phone/Password).
3. **Admin Staff / Super Admin (`admin`)**: Authenticated dealership administrators and managers (authenticated via Admin Portal credentials).

---

## 2. Resource Access Control Matrix

| Resource / Endpoint Scope | Guest | Customer | Admin | Enforcement Mechanism |
|---|:---:|:---:|:---:|---|
| **Public Inventory (`GET /api/cars`, `/api/cars/:id`)** | ✅ Read | ✅ Read | ✅ Read | Public route with active status filter |
| **Search & Filters (`GET /api/cars/brands`, `/api/cars/cities`)** | ✅ Read | ✅ Read | ✅ Read | Public route |
| **Blog & Content (`GET /api/blogs`, `/api/content`)** | ✅ Read | ✅ Read | ✅ Read | Public route |
| **Submit Lead / Enquiry (`POST /api/leads`)** | ✅ Create | ✅ Create | ✅ Create | Public route + Form Rate Limiter |
| **Submit Sell Request (`POST /api/sell-requests`)** | ✅ Create | ✅ Create | ✅ Create | Public route + Form Rate Limiter |
| **Request Insurance Quote (`POST /api/insurance/request`)** | ✅ Create | ✅ Create | ✅ Create | Public route + Form Rate Limiter |
| **Customer Profile (`GET/PUT /api/customers/profile`)** | ❌ Denied | ✅ Own Record | ❌ (Uses Admin API) | `customerAuth` (`WHERE id = req.user.id`) |
| **Customer Wishlist (`GET/POST /api/wishlist`)** | ❌ Denied | ✅ Own List | ❌ | `customerAuth` (`WHERE customer_id = req.user.id`) |
| **Customer Bookings (`GET /api/bookings/mine`)** | ❌ Denied | ✅ Own Bookings | ❌ (Uses Admin API) | `customerAuth` (`WHERE customer_id = req.user.id`) |
| **Payment Verification (`POST /api/payments/verify`)** | ❌ Denied | ✅ Own Booking | ❌ | `customerAuth` (`WHERE id = ? AND customer_id = ?`) |
| **Admin Inventory Management (`POST/PUT/DELETE /api/cars`)** | ❌ Denied | ❌ Denied | ✅ Full Access | `[authMiddleware, isAdmin]` |
| **Customer Master (`GET/PUT/DELETE /api/customers`)** | ❌ Denied | ❌ Denied | ✅ Full Access | `[authMiddleware, isAdmin]` |
| **Sell Requests Workflow (`PUT /api/sell-requests/:id/status`)**| ❌ Denied | ❌ Denied | ✅ Full Access | `[authMiddleware, isAdmin]` |
| **Test Drive Bookings Management (`PUT /api/test-drives/*`)** | ❌ Denied | ❌ Denied | ✅ Full Access | `[authMiddleware, isAdmin]` |
| **Media Library (`POST /api/upload`, `DELETE /api/media`)** | ❌ Denied | ❌ Denied | ✅ Full Access | `[authMiddleware, isAdmin]` |
| **System Settings & Integrations (`GET/POST /api/settings`)** | ❌ Denied | ❌ Denied | ✅ Full Access | `[authMiddleware, isAdmin]` |
| **Financial & Payment Reports (`GET /api/reports/*`)** | ❌ Denied | ❌ Denied | ✅ Full Access | `[authMiddleware, isAdmin]` |
| **User & Staff Management (`GET/POST/DELETE /api/users`)** | ❌ Denied | ❌ Denied | ✅ Super Admin | `[authMiddleware, isAdmin]` |

---

## 3. Horizontal vs Vertical Privilege Escalation Controls

- **Vertical Privilege Escalation Protection:** All 34 administrative endpoints now strictly require `req.user.role === 'admin'`. Customer JWT tokens presented at admin endpoints receive `403 Forbidden`.
- **Horizontal Privilege Escalation (IDOR) Protection:** Customer endpoints (profile, wishlist, bookings, payment verification) strictly scope database queries using `req.user.id` extracted from the cryptographically verified JWT payload, preventing any customer from querying or modifying another customer's data.
