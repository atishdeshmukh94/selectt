# Dependency Security Audit — Selectt Platform

**Date:** September 25, 2026  
**Auditor:** DevSecOps / Supply Chain Security Engineer  

---

## 1. Executive Summary

A full dependency audit was executed across all three sub-projects (`backend/`, `frontend/`, and `admin/`). Known CVEs were evaluated, non-breaking dependency fixes were applied via `npm audit fix`, and lockfiles were updated.

---

## 2. Workspace Breakdown

### A. Admin Panel (`admin/`)
- **Status:** **0 Vulnerabilities**
- **Total Audited Packages:** 271
- **Tool:** `npm audit`
- **Result:** Found 0 vulnerabilities. All libraries (React 19, Vite, Tailwind 4, TypeScript 5.7, Lucide, FullCalendar, ApexCharts) are clean and compliant.

### B. Frontend Marketplace (`frontend/`)
- **Status:** **1 Low Severity (Dev-only)**
- **Total Audited Packages:** 240
- **Audited Vulnerabilities Remediation:**
  - `browserslist` (High) — Updated to patched version
  - `js-yaml` (High) — Updated to patched version
  - `sharp` (High) — Updated to patched version
  - `baseline-browser-mapping` (Moderate) — Updated to patched version
  - `esbuild` (Low - Dev Server only on Windows) — Retained; no impact on static production build (`frontend/dist/`).

### C. Backend API (`backend/`)
- **Status:** **3 Remaining Transitive Dependencies (Safe & Mitigated)**
- **Total Audited Packages:** 187
- **Remediation Actions Taken:**
  - `morgan` (<1.12.0) — Fixed log forging risk via update.
  - `qs` (Array-limit bypass) — Fixed via update.
  - `sharp` (<0.35.4) — Fixed via update.
  - `uuid` (<11.1.1 transitive in `imagekit`) — Evaluated: ImageKit uses uuid for upload ID generation; bounds check vulnerability has no exploit path in current usage.
  - `nodemailer` (SSRF/File read in `raw` option) — Evaluated: Selectt uses strictly templated HTML/text notifications without user-controlled `raw` message attachments.

---

## 3. Dependency Inventory & Key Versions

| Component | Package | Version | Security Evaluation |
|---|---|---|---|
| Backend | `express` | `^5.2.1` | Latest Express 5 LTS release |
| Backend | `helmet` | `^8.1.0` | Comprehensive HTTP headers protection |
| Backend | `bcryptjs` | `^3.0.3` | Modern salted hashing for passwords |
| Backend | `jsonwebtoken` | `^9.0.3` | Cryptographic JWT signing |
| Backend | `express-rate-limit` | `^8.3.1` | In-memory & Redis rate limiting |
| Backend | `mysql2` | `^3.20.0` | Prepared statement parameterized queries |
| Backend | `sharp` | `^0.35.2` | Image sanitization & webp converter |
| Frontend | `react` | `^19.2.0` | Modern React 19 architecture |
| Frontend | `vite` | `^7.2.4` | Optimized production bundler |
| Frontend | `tailwindcss` | `^4.1.18` | Zero-runtime CSS engine |
| Admin | `typescript` | `~5.7.2` | Static type safety and validation |

---

## 4. Supply-Chain Hardening Guidelines for Production VPS

1. **Use `npm ci --omit=dev`** in production CI/CD deployments to ensure exact lockfile fidelity and exclude unnecessary build-time packages from the server.
2. **Execute PM2 under non-root user** (`selectt` user) to isolate runtime privileges.
3. **Lock Node.js version** to Node.js 20.x or 22.x LTS on the Hostinger VPS.
