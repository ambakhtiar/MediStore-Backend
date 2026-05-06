# MediStore API - Pharmacy Management Backend ⚙️ 🚀

> High-performance, type-safe API powering the MediStore pharmacy ecosystem.

[![Live API](https://img.shields.io/badge/Live-API-brightgreen)](https://medistore-med.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Backend-blue)](https://github.com/ambakhtiar/medistore_server)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-blue)](https://www.prisma.io/)

## 📋 Table of Contents
- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Security](#-security)
- [Links](#-links)

## 🎯 About
**MediStore API** is the core engine of the MediStore platform. It handles complex healthcare transactions, multi-role authentication, and provides a secure interface for inventory management and administrative oversight.

- **Purpose:** Centralized medicine data management and secure order processing.
- **Main capabilities:** RBAC, Soft-deletion, Transactional orders, and Real-time stats.
- **Architecture:** Modular architecture with module-specific routes, controllers, and services.

## ✨ Features

### Authentication & Authorization
- 🔐 **Better Auth Integration:** Session-based security with support for social providers.
- 🎭 **Multi-role RBAC:** Specialized permissions for Customer, Seller, and Admin.

### Core Features
- 💊 **Medicine Lifecycle:** Comprehensive CRUD for medicines with seller-item isolation.
- 🛒 **Cart & Checkout:** Transactional order placement with stock validation.
- 📊 **Admin Insights:** System-wide statistics generation for business analysis.
- 📜 **Order Tracking:** Full history of order status changes.

### Security
- 🛡️ **Ban System:** Capability to suspend malicious users globally.
- 🔍 **Zod Validation:** Strict request body and parameter validation.
- 🔒 **CORS & Helmet:** Industry-standard security headers and access control.

## 🛠️ Tech Stack

- **Runtime:** Node.js 20+
- **Framework:** Express 5 (v5.x)
- **Language:** TypeScript
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Authentication:** Better Auth
- **Validation:** Zod
- **Build Tool:** tsup
- **Deployment:** Vercel

## 🗄️ Database Schema

### Medicine Model (Partial)
```prisma
model Medicine {
    id          String   @id @default(uuid())
    name        String
    genericName String
    price       Float
    stock       Int
    isActive    Boolean  @default(true) // Soft delete support
    sellerId    String
    seller      User     @relation(fields: [sellerId], references: [id])
}
```

### User Model (Partial)
```prisma
enum UserRole { CUSTOMER, SELLER, ADMIN }
enum UserStatus { UNBAN, BAN }

model User {
    id     String     @id @default(uuid())
    email  String     @unique
    role   UserRole   @default(CUSTOMER)
    status UserStatus @default(UNBAN)
}
```

## 🔌 API Endpoints

### 🛡️ Admin Module
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/admin/stats` | Get system statistics | Admin |
| GET | `/api/users` | List all users | Admin |
| PATCH | `/api/users/:id/status` | Ban/Unban user | Admin |

### 💊 Medicine Module
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/medicines` | List medicines (Search/Filter) | Public |
| POST | `/api/medicines` | Create new medicine | Seller |
| DELETE | `/api/medicines/:id` | Soft-delete medicine | Seller (Owner) |

### 📦 Order Module
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/orders` | Place a new order | Customer |
| GET | `/api/orders` | Get user/seller orders | Authenticated |
| PATCH | `/api/orders/:id/status` | Update status | Admin / Seller |

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL (Neon recommended)
- npm or yarn

### Installation

1. **Clone repository**
```bash
git clone https://github.com/ambakhtiar/medistore_server.git
cd medistore_server
```

2. **Install dependencies**
```bash
npm install
```

3. **Database Setup**
```bash
npx prisma generate
npx prisma db push
```

4. **Seed Data (Admin User)**
```bash
npm run seed:admin
```

5. **Start server**
```bash
npm run dev
```

## 🔐 Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | `postgresql://user:pass@host/db` |
| `BETTER_AUTH_SECRET` | Secret for auth encryption | Yes | `your_secret_here` |
| `FRONTEND_URL` | Application frontend URL | Yes | `https://medistore-medicine.vercel.app` |

## 📦 Deployment
The backend is deployed on **Vercel** as serverless functions.
1. Build command: `npm run build`
2. Output directory: `api`
3. Ensure Environment Variables are set in Vercel dashboard.

## 🔒 Security Features
- **Authentication:** Token and Session-based using Better Auth.
- **Authorization:** Custom middleware checking `UserRole`.
- **Data Integrity:** Soft-delete logic for Medicines to preserve Order history.
- **Input Sanitization:** Automated via Zod schema parsing.

## 🗂️ Project Structure
```text
src/
├── middleware/      # Auth & RBAC filters
├── modules/         # Modular logic (admin, medicine, order, user)
│   ├── [module].controller.ts
│   ├── [module].service.ts
│   └── [module].routes.ts
├── lib/             # Shared Prisma & Auth instances
└── types/           # Global type declarations
```

## 🔗 Links
- **Frontend App:** [medistore-medicine.vercel.app](https://medistore-medicine.vercel.app)
- **Live API:** [medistore-med.vercel.app](https://medistore-med.vercel.app)
- **Documentation:** [In-Repo API Guide]

---
Developed with ❤️ by [AM Bakhtiar](https://github.com/ambakhtiar)
