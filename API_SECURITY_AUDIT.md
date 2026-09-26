# API Security Inventory & Assessment — Selectt Platform

**Date:** September 25, 2026  
**Total Endpoints Evaluated:** 158  
**Architecture:** RESTful Express 5 with JWT Authentication and Role-Based Access Control (RBAC)  

---

## 1. Key Endpoint Categories & Security Matrix

| Method | Endpoint Path | Authentication | Authorization | Rate Limiting | Validation | Risk Level |
|---|---|---|---|---|---|---|
| `GET` | `/health` / `/api/health` | Public | None | API Limiter | None | Low (Safe) |
| `POST` | `/api/login` | Public | None | Auth Limiter (30/10m) | Body schema (username/pass) | Medium (Safe) |
| `POST` | `/api/auth/send-otp` | Public | None | Auth Limiter (30/10m) | Phone regex validation | Medium (Safe) |
| `POST` | `/api/auth/verify-otp` | Public | None | Auth Limiter (30/10m) | OTP lookup + auto-delete | Medium (Safe) |
| `POST` | `/api/customers/register` | Public | None | Auth Limiter (30/10m) | Phone/Email formatting | Medium (Safe) |
| `POST` | `/api/customers/login` | Public | None | Auth Limiter (30/10m) | Phone/Password check | Medium (Safe) |
| `GET` | `/api/customers/profile` | Customer JWT | Customer Role (`req.user.id`) | API Limiter | Auth token | Low (Safe) |
| `PUT` | `/api/customers/profile` | Customer JWT | Customer Role (`req.user.id`) | API Limiter | Whitelisted update fields | Low (Safe) |
| `POST` | `/api/customers/avatar` | Customer JWT | Customer Role (`req.user.id`) | API Limiter | Multer MIME & Sharp WebP | Low (Safe) |
| `GET` | `/api/wishlist` | Customer JWT | Customer Role (`req.user.id`) | API Limiter | Auth token | Low (Safe) |
| `POST` | `/api/wishlist/:carId` | Customer JWT | Customer Role (`req.user.id`) | API Limiter | Params validation | Low (Safe) |
| `POST` | `/api/leads` | Public | None | Form Limiter (25/15m) | Name/Phone required | Low (Safe) |
| `POST` | `/api/insurance/request` | Public | None | Form Limiter (25/15m) | Body fields | Low (Safe) |
| `POST` | `/api/sell-requests` | Public / Optional JWT | None / Customer Binding | Form Limiter (25/15m) | Make/Model required | Low (Safe) |
| `GET` | `/api/sell-requests/mine` | Customer JWT | Customer Role (`req.user.id`) | API Limiter | Customer ID binding | Low (Safe) |
| `POST` | `/api/payments/create-order` | Customer JWT | Customer Role | API Limiter | Razorpay SDK validation | Low (Safe) |
| `POST` | `/api/payments/verify` | Customer JWT | Customer Role (`customer_id` check) | API Limiter | HMAC-SHA256 signature | Low (Safe) |
| `GET` | `/api/cars` (Admin) | Admin JWT | Admin Role (`isAdmin`) | API Limiter | Token validation | Low (Safe) |
| `POST` | `/api/cars` (Admin) | Admin JWT | Admin Role (`isAdmin`) | API Limiter | Body schema | Low (Safe) |
| `PUT` | `/api/cars/:id` (Admin) | Admin JWT | Admin Role (`isAdmin`) | API Limiter | Body schema | Low (Safe) |
| `DELETE` | `/api/cars/:id` (Admin) | Admin JWT | Admin Role (`isAdmin`) | API Limiter | Params check | Low (Safe) |
| `GET` | `/api/customers` (Admin) | Admin JWT | Admin Role (`isAdmin`) | API Limiter | Token validation | Low (Safe) |
| `GET` | `/api/customers/:id` (Admin) | Admin JWT | Admin Role (`isAdmin`) | API Limiter | Params check | Low (Safe) |
| `PUT` | `/api/customers/:id` (Admin) | Admin JWT | Admin Role (`isAdmin`) | API Limiter | Whitelist fields | Low (Safe) |
| `DELETE` | `/api/customers/:id` (Admin) | Admin JWT | Admin Role (`isAdmin`) | API Limiter | Params check | Low (Safe) |
| `GET` | `/api/sell-requests` (Admin) | Admin JWT | Admin Role (`isAdmin`) | API Limiter | Token validation | Low (Safe) |
| `PUT` | `/api/sell-requests/:id/status` (Admin) | Admin JWT | Admin Role (`isAdmin`) | API Limiter | Status string | Low (Safe) |
| `DELETE` | `/api/sell-requests/:id` (Admin) | Admin JWT | Admin Role (`isAdmin`) | API Limiter | Params check | Low (Safe) |
| `GET` | `/api/leads` (Admin) | Admin JWT | Admin Role (`isAdmin`) | API Limiter | Token validation | Low (Safe) |
| `GET` | `/api/admin/insurance-requests` | Admin JWT | Admin Role (`isAdmin`) | API Limiter | Token validation | Low (Safe) |
| `POST` | `/api/upload` (Admin) | Admin JWT | Admin Role (`isAdmin`) | API Limiter | Multer + Sharp WebP | Low (Safe) |
| `GET` | `/api/media` (Admin) | Admin JWT | Admin Role (`isAdmin`) | API Limiter | Token validation | Low (Safe) |
| `DELETE` | `/api/media` (Admin) | Admin JWT | Admin Role (`isAdmin`) | API Limiter | File path sanitization | Low (Safe) |

---

## 2. API Security Protections Implemented
1. **HTTP Parameter Pollution (HPP):** `hpp()` middleware active to prevent array poisoning of query parameters.
2. **Helmet HTTP Headers:** `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-XSS-Protection`.
3. **CORS Enforcement:** Strict regex pattern `/^https:\/\/([a-zA-Z0-9-]+\.)?selectt\.in$/` and localhost dev ports.
4. **Rate Limiting:** Multi-tiered (General API: 5000 req/15m; Auth/OTP: 30 req/10m; Public Forms: 25 req/15m).
5. **Payload Size Limit:** JSON body restricted to `10mb`; file uploads restricted to `15MB` (Backend) / `20MB` (Nginx).
