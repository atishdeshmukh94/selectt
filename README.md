# Selectt - Certified Pre-Owned Car Marketplace & Management Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql)](https://www.mysql.com/)

**Selectt** is an end-to-end, multi-tier web application platform for buying, selling, evaluating, and managing certified pre-owned cars in India. The platform includes a customer-facing marketplace web app, an administrative backend API, a real-time admin portal dashboard, and complete database schemas.

---

## 🚀 Repository Structure

```
selectt/
├── frontend/               # React + Vite Customer-facing Marketplace Web App
├── backend/                # Node.js + Express API & Database Services
├── admin/                  # React + Vite Admin Dashboard & Control Center
├── database.sql            # Full MySQL / MariaDB Schema Dump & Seed Data
├── docker-compose.yml      # Docker Multi-container Orchestration Config
├── nginx/                  # Nginx Reverse Proxy Configuration
└── README.md               # Complete Setup & Architecture Guide
```

---

## 🌟 Key Features

### 🛍️ Customer Marketplace (`/frontend`)
- **Live Certified Inventory**: Interactive filter bar for **Explore By**, **Price Range**, **Make & Model**, **Year**, **Fuel Type**, **KM Driven**, **Body Type**, **Transmission**, and **Owner Count**.
- **Instant Search**: Live auto-completing search modal with multi-field term matching.
- **Car Detail Page**: 200-point inspection breakdown, high-res gallery view, feature chips, financial EMI calculator, and test drive booking form.
- **Sell Your Car**: Multi-step valuation widget & free home inspection appointment scheduler.
- **Used Car Loan & Buyback Guarantees**: Interactive eligibility assessment tools and buyback estimator.
- **City & Hub Selector**: Location-aware inventory filtering across major metropolitan cities.

### 🛡️ Admin Dashboard (`/admin`)
- **Inventory Management**: Add, update, feature, or mark pre-owned cars as sold out.
- **Sell Request Pipeline**: Track incoming customer sell requests, schedule physical inspection slots, and update inspection status.
- **Test Drive & Lead Tracker**: Manage customer test drive requests and callback leads.
- **Dynamic Site Banners & Content**: Control site marquee tickers, hero sliders, promotional banners, and location hubs without code redeployments.
- **Role-based Authentication**: Secure admin logins with JWT access control.

### ⚡ Backend API (`/backend`)
- **RESTful Endpoints**: Modular routing for cars, brands, locations, loans, sell requests, blogs, settings, and auth.
- **MySQL / MariaDB Data Access**: Prepared SQL statements and transaction safety.
- **File & Media Storage**: Upload handlers for vehicle photographs and inspection report documents.
- **WhatsApp & SMS Service Hooks**: Customer notification integrations.

---

## 🛠️ Tech Stack

- **Frontend & Admin**: React 18, Vite, Tailwind CSS, Lucide Icons, Tabler Icons, Framer Motion, React Router DOM v6.
- **Backend API**: Node.js, Express.js, MySQL2, JSON Web Tokens (JWT), Bcrypt.js, CORS, Multer.
- **Database**: MySQL 8.0 / MariaDB 10.4.
- **DevOps**: Docker, Docker Compose, Nginx.

---

## ⚙️ Quick Start Setup Guide

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MySQL / MariaDB**: Server running on localhost (or Docker)

---

### 2. Database Setup
1. Open your MySQL client (e.g., phpMyAdmin, MySQL Workbench, or CLI).
2. Create a new database named `selectt`:
   ```sql
   CREATE DATABASE selectt;
   ```
3. Import the provided schema & initial dataset:
   ```bash
   mysql -u root -p selectt < database.sql
   ```

---

### 3. Backend API Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (refer to `.env.example`):
   ```env
   PORT=5000
   NODE_ENV=development
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=
   DB_NAME=selectt
   JWT_SECRET=your_jwt_secret_key_here
   ```
4. Start the backend server:
   ```bash
   npm start
   ```
   *The server will start at `http://localhost:5000`.*

---

### 4. Frontend Customer Web App Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *Access the customer app at `http://localhost:5173`.*

---

### 5. Admin Portal Setup
1. Open a new terminal and navigate to the admin directory:
   ```bash
   cd admin
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the admin server:
   ```bash
   npm run dev
   ```
   *Access the admin portal at `http://localhost:5174`.*

---

## 🐳 Docker Deployment (Optional)

You can spin up the entire application stack (Database + Backend + Frontend + Admin) using Docker Compose:

```bash
docker-compose up --build -d
```

---

## 📄 Database Schema Overview (`database.sql`)

The repository includes a production-ready database dump containing the following core tables:
- `cars` - Pre-owned vehicle specs, prices, images, inspection details, and availability status.
- `brands` - Vehicle brand and model metadata.
- `users` - Customer accounts, authentication, and wishlist data.
- `sell_requests` - Customer car submission pipeline and evaluation details.
- `test_drives` - Scheduled vehicle test drives and booking inquiries.
- `locations` - Car hubs, available cities, and address mappings.
- `banners` & `settings` - Global marketing site settings, promotional banners, and marquee messages.

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
