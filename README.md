<div align="center">

# 💊 MediStore — Backend API

**An enterprise-grade, multi-role REST API powering Bangladesh's online medicine e-commerce platform — built for reliability, security, and scale.**

[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933.svg?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000.svg?logo=express&logoColor=white)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748.svg?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.x-4169E1.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Zod](https://img.shields.io/badge/Zod-3.x-3068B7.svg)](https://zod.dev/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000.svg?logo=vercel&logoColor=white)](https://medistore-med.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-8B5CF6.svg)](LICENSE)

<p>
  <a href="#-project-overview">Overview</a> •
  <a href="#-role-based-access-rbac">RBAC</a> •
  <a href="#-system-architecture">Architecture</a> •
  <a href="#-database-schema">Database</a> •
  <a href="#-api-reference">API Docs</a> •
  <a href="#-getting-started">Setup</a>
</p>

</div>

---

## 📖 Project Overview

**MediStore Backend** is a production-ready RESTful API server for an online medicine e-commerce platform. It solves a critical real-world problem in Bangladesh — the lack of a trustworthy, organized digital platform where customers can purchase medicines, sellers can manage inventory, and administrators can maintain platform integrity.

The system implements strict **Role-Based Access Control (RBAC)**, session-based authentication via Better Auth, and a clean modular architecture designed for maintainability and production deployment.

> **Live API Base URL:** `https://medistore-med.vercel.app`
>
> **Frontend:** [https://medistore-medicine.vercel.app](https://medistore-medicine.vercel.app) · **Frontend Repo:** [MediStore-Frontend](https://github.com/ambakhtiar/MediStore-Frontend)

---

## 🛡️ Role-Based Access (RBAC)

The platform adapts every endpoint based on the authenticated user's role. Three roles govern the entire permission structure:

| Role | Core Capabilities |
|:---|:---|
| 🛒 **Customer** | Browse medicines, place orders, cancel pending orders, review delivered products |
| 🏪 **Seller** | Manage their own medicine inventory, process orders, view seller analytics |
| 👑 **Admin** | Full platform oversight — user management, ban/unban, all medicines & orders |

---

## 🏗 System Architecture

The application follows a strict **Controller → Service → Repository** pattern via Prisma ORM, ensuring full decoupling of business logic from routing and data access.

```
Client Request
      │
      ▼
┌─────────────────────────────────────┐
│  Express Router                     │
│  · Route registration per module   │
│  · Middleware chain attachment      │
└─────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│  Auth & RBAC Middleware             │
│  · Better Auth session validation  │
│  · Role-based route protection     │
│  · Ban check on every login        │
└─────────────────────────────────────┘
      │
      ▼
┌──────────────┐   ┌──────────────┐
│  Controller  │──▶│   Service    │
│  (thin layer)│   │(business logic)│
└──────────────┘   └──────┬───────┘
                          │
                          ▼
                   ┌──────────────┐
                   │  Prisma ORM  │
                   └──────┬───────┘
                          │
                   ┌──────▼───────┐
                   │  PostgreSQL  │
                   └──────────────┘
```

### 📂 Folder Structure

```
src/
├── config/              # Centralised, type-safe environment config
├── middleware/          # Auth, RBAC Guard, Global Error, Not Found
│   ├── auth.ts
│   ├── errorHandler.ts
│   └── validator.ts
├── modules/             # Domain-driven feature modules
│   ├── auth/            # Login, Register, Session management
│   ├── medicine/        # CRUD, search, filtering, stock
│   ├── order/           # Order lifecycle management
│   ├── category/        # Category CRUD (Admin only)
│   ├── review/          # Delivery-gated review system
│   └── user/            # Profile, ban/unban management
├── prisma/              # Prisma schema & migrations
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── types/               # TypeScript interfaces
├── utils/               # Helper functions & AppError class
├── app.ts               # Express app setup
└── server.ts            # Entry point
```

Each module follows a strict **3-file pattern**:
```
modules/[name]/
├── [name].controller.ts    # Thin: calls service, formats response
├── [name].service.ts       # All business logic + domain rules
└── [name].routes.ts        # Route definitions + middleware chain
```

---

## 🚀 Core Features

- **🔐 Session-Based Auth** — Better Auth with ban enforcement; banned users receive 403 on every login attempt
- **💊 Multi-Seller Inventory** — Sellers independently manage their own medicine catalogue with stock tracking, discount percentages, and featured flags
- **🛒 Full Order Lifecycle** — `PENDING → PROCESSING → SHIPPED → DELIVERED → CANCELLED` with per-status history tracking
- **⭐ Delivery-Gated Reviews** — Customers can only review a medicine they have received; prevents spam and fake ratings
- **🚫 Admin Ban System** — Admins can ban/unban any user; banned users are locked out at the auth layer
- **☁️ Optional Image Uploads** — Cloudinary integration for medicine and profile images
- **📊 Role Dashboards** — Seller stats and admin platform-wide analytics endpoints
- **🔒 Layered Security** — Helmet, CORS, rate limiting, Zod input validation, bcrypt, SQL injection prevention via Prisma

---

## 🗄️ Database Schema

All entities use UUID primary keys. The schema enforces referential integrity through Prisma relations.

```prisma
model User {
  id            String     @id @default(uuid())
  name          String
  email         String     @unique
  role          Role       @default(CUSTOMER)
  status        Status     @default(ACTIVE)
  orders        Order[]
  reviews       Review[]
  medicines     Medicine[] // Seller's inventory
  sessions      Session[]
}

enum Role   { CUSTOMER  SELLER  ADMIN }
enum Status { ACTIVE    BAN }

model Medicine {
  id                 String   @id @default(uuid())
  name               String
  genericName        String
  manufacturer       String
  price              Float
  discountPercentage Float?   @default(0)
  stock              Int
  isFeatured         Boolean  @default(false)
  categoryId         String
  sellerId           String
  orderItems         OrderItem[]
  reviews            Review[]
}

model Order {
  id              String      @id @default(uuid())
  orderNumber     String      @unique
  totalAmount     Float
  status          OrderStatus @default(PENDING)
  shippingAddress String
  items           OrderItem[]
  statusHistory   OrderStatusHistory[]
}

enum OrderStatus { PENDING  PROCESSING  SHIPPED  DELIVERED  CANCELLED }

model Review {
  id         String @id @default(uuid())
  rating     Int    // 1–5
  comment    String?
  userId     String
  medicineId String
  @@unique([userId, medicineId])  // One review per product per customer
}
```

**Key Design Decisions:**

- `@@unique([userId, medicineId])` on `Review` prevents duplicate reviews without application-level checks
- `OrderStatusHistory` tracks every status transition with timestamps for full audit trail
- `status: BAN` on `User` is checked at the authentication middleware layer — not the controller — so no ban bypass is possible

---

## 🔒 Security Design

| Layer | Mechanism |
|---|---|
| Password storage | bcrypt (12 salt rounds) |
| Session management | Better Auth with HttpOnly cookies |
| Input validation | Zod schemas before every controller |
| SQL injection | Prevented by Prisma ORM parameterisation |
| XSS protection | Helmet.js security headers |
| Rate limiting | Express rate-limit middleware |
| CORS | Restricted to approved frontend origins |
| Ban enforcement | Checked at auth middleware, not controller |

---

## 🔌 API Reference

**Base URL:** `https://medistore-med.vercel.app`

### Authentication

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register — Customer or Seller | Public |
| POST | `/api/auth/login` | Authenticate; banned users get 403 | Public |
| POST | `/api/auth/logout` | Invalidate current session | 🔐 |
| GET | `/api/auth/session` | Fetch current session details | 🔐 |

### Medicines

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/medicines` | Browse all medicines with filters & pagination | Public |
| GET | `/api/medicines/:id` | Single medicine detail | Public |
| POST | `/api/seller/medicines` | Add new medicine | 🔐 Seller |
| PUT | `/api/seller/medicines/:id` | Update medicine | 🔐 Seller (own) |
| DELETE | `/api/seller/medicines/:id` | Remove medicine | 🔐 Seller (own) |

### Categories

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/categories` | All categories | Public |
| POST | `/api/categories` | Create category | 🔐 Admin |
| PUT | `/api/categories/:id` | Update category | 🔐 Admin |
| DELETE | `/api/categories/:id` | Delete category | 🔐 Admin |

### Orders

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/orders` | Place a new order | 🔐 Customer |
| GET | `/api/orders` | My order history | 🔐 Customer |
| GET | `/api/orders/:id` | Order detail | 🔐 Private |
| PATCH | `/api/orders/:id/cancel` | Cancel (before Processing) | 🔐 Customer |
| PATCH | `/api/seller/orders/:id/status` | Advance order status | 🔐 Seller |

### Reviews

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/reviews/medicines/:id` | Submit review (delivered orders only) | 🔐 Customer |
| GET | `/api/reviews/medicines/:id` | Fetch all reviews for a medicine | Public |
| PUT | `/api/reviews/:id` | Edit own review | 🔐 Customer |
| DELETE | `/api/reviews/:id` | Delete own review | 🔐 Customer |

### Seller Dashboard

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/seller/dashboard` | Sales stats, stock overview | 🔐 Seller |
| GET | `/api/seller/medicines` | My listed medicines | 🔐 Seller |
| GET | `/api/seller/orders` | Orders for my medicines | 🔐 Seller |

### Admin Panel

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/admin/dashboard` | Platform-wide analytics | 🔐 Admin |
| GET | `/api/admin/users` | All registered users | 🔐 Admin |
| PATCH | `/api/admin/users/:id/status` | **Ban / Unban a user** | 🔐 Admin |
| GET | `/api/admin/medicines` | All medicines across sellers | 🔐 Admin |
| GET | `/api/admin/orders` | All platform orders | 🔐 Admin |

### Standardised API Response Format

```json
// Success
{ "ok": true, "status": 200, "message": "...", "data": { } }

// Error
{ "ok": false, "status": 400, "message": "...", "error": { "details": "..." } }
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or cloud — Supabase, Neon, Railway)
- npm or yarn

### 1. Clone & Install

```bash
git clone https://github.com/ambakhtiar/MediStore-Backend.git
cd MediStore-Backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

### 3. Database Setup

```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed   # Seeds admin account + sample data
```

### 4. Start Dev Server

```bash
npm run dev
# Server starts at http://localhost:5000
```

---

## 🔧 Environment Variables

```env
# ── Database ─────────────────────────────────────────
DATABASE_URL="postgresql://user:password@localhost:5432/medistore"

# ── Server ────────────────────────────────────────────
PORT=5000
NODE_ENV=development

# ── Better Auth ───────────────────────────────────────
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"

# ── CORS ──────────────────────────────────────────────
FRONTEND_URL="http://localhost:3000"

# ── Cloudinary (optional) ─────────────────────────────
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

> ⚠️ Never commit `.env` to version control.

---

## 🌱 Database Seeding

```bash
npx prisma db seed
```

Creates: 1 Admin account · 10+ medicine categories · 50+ sample medicines

**Seeded Admin Credentials:**
```
Email:    admin@medistore.com
Password: 11223344
```

---

## 📜 NPM Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `tsx watch src/server.ts` | Dev server with hot-reload |
| `build` | `prisma generate && tsc` | Compile for production |
| `start` | `node dist/server.js` | Serve production build |
| `seed` | `prisma db seed` | Seed the database |

---

## 🚀 Deployment (Vercel)

1. Push repository to GitHub
2. Import at [vercel.com/new](https://vercel.com/new)
3. Set all environment variables in the Vercel dashboard
4. Click **Deploy** — subsequent pushes to `main` deploy automatically

---

## 🔗 Links

| | |
|---|---|
| **Live API** | [medistore-med.vercel.app](https://medistore-med.vercel.app) |
| **Live Frontend** | [medistore-medicine.vercel.app](https://medistore-medicine.vercel.app) |
| **Frontend Repo** | [MediStore-Frontend](https://github.com/ambakhtiar/MediStore-Frontend) |
| **Demo Video** | [Google Drive](https://drive.google.com/file/d/1rUm70KWWNz2Up-CCXjgP0KVZCTt18e9q/view?usp=sharing) |

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.

---

<div align="center">
  <p>Designed & developed by <strong>Abdullah Muhammad Bakhtiar</strong></p>
  <a href="https://github.com/ambakhtiar/MediStore-Backend">Backend</a> ·
  <a href="https://github.com/ambakhtiar/MediStore-Frontend">Frontend</a> ·
  <a href="https://medistore-medicine.vercel.app">Live Demo</a>
</div>