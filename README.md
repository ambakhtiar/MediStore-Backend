# MediStore Backend API 💊

> RESTful API for MediStore - Online Medicine E-commerce Platform

[![Live API](https://img.shields.io/badge/Live-API-success?style=for-the-badge)](https://medistore-server-sepia.vercel.app)
[![Backend Repo](https://img.shields.io/badge/GitHub-Backend-green?style=for-the-badge&logo=github)](https://github.com/ambakhtiar/MediStore-Backend)
[![Frontend Repo](https://img.shields.io/badge/GitHub-Frontend-blue?style=for-the-badge&logo=github)](https://github.com/ambakhtiar/MediStore-Frontend)

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Security](#security)
- [License](#license)

## 🎯 About

MediStore Backend is a robust RESTful API built with Node.js, Express, and PostgreSQL. It provides secure authentication, role-based access control, and comprehensive medicine e-commerce functionality.

**Live API:** [https://medistore-server-sepia.vercel.app](https://medistore-server-sepia.vercel.app)

<!-- **API Documentation:** Available at `/api/docs` (if implemented) -->

## ✨ Features

### 🔐 Authentication & Authorization
- User registration with role selection (Customer/Seller)
- Secure login with session management (Better Auth)
- Batter-Auth based authentication
- Role-based access control (Customer, Seller, Admin)
- **Ban system:** Banned users cannot login
- Password hashing with bcrypt
- Protected routes with middleware

### 💊 Medicine Management
- CRUD operations for medicines (Seller only)
- Medicine categorization
- Stock management
- Advanced search and filtering
- Pagination support
- Multi Seller feature

### 🛒 Order Processing
- Create orders with multiple items
- Order status tracking (Pending → Processing → Shipped → Delivered)
- Order cancellation (before confirmation)
- Cash on Delivery (COD) payment
- Order history for customers
- Order management for sellers and admins

### 👥 User Management
- User profile management
- Admin can view all users
- **Ban/Unban functionality** (Admin only)
- User status tracking (Active/Banned)
- Seller verification system

### ⭐ Review System
- Customers can review delivered products
- Edit and delete own reviews
- Rating system (1-5 stars)
- Review validation (must have delivered order)

### 🏷️ Category Management
- CRUD operations for categories (Admin only)
- Category-based medicine filtering
- Prescription requirement flag

## 🛠️ Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** Better Auth
- **Validation:** Zod
- **Security:** Helmet, CORS
- **Deployment:** Vercel 

## 🗄️ Database Schema

### Users Table
```prisma
model User {
  id            String   @id @default(uuid())
  name          String
  email         String   @unique
  password      String
  phone         String?
  role          Role     @default(CUSTOMER)
  status        Status   @default(ACTIVE)
  image         String?
  emailVerified Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  orders        Order[]
  reviews       Review[]
  medicines     Medicine[] // For sellers
  sessions      Session[]
}

enum Role {
  CUSTOMER
  SELLER
  ADMIN
}

enum Status {
  ACTIVE
  BAN
}
```

### Categories Table
```prisma
model Category {
  id                      String     @id @default(uuid())
  name                    String     @unique
  slug                    String     @unique
  description             String?
  isPrescriptionRequired  Boolean    @default(false)
  createdAt               DateTime   @default(now())
  updatedAt               DateTime   @updatedAt
  
  // Relations
  medicines               Medicine[]
}
```

### Medicines Table
```prisma
model Medicine {
  id                  String    @id @default(uuid())
  name                String
  genericName         String
  manufacturer        String
  description         String
  price               Float
  discountPercentage  Float?    @default(0)
  stock               Int
  imageUrl            String?
  dosageForm          String
  strength            String
  categoryId          String
  sellerId            String
  isActive            Boolean   @default(true)
  isFeatured          Boolean   @default(false)
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  
  // Relations
  category            Category  @relation(fields: [categoryId], references: [id])
  seller              User      @relation(fields: [sellerId], references: [id])
  orderItems          OrderItem[]
  reviews             Review[]
}
```

### Orders Table
```prisma
model Order {
  id              String       @id @default(uuid())
  orderNumber     String       @unique
  userId          String
  totalAmount     Float
  status          OrderStatus  @default(PENDING)
  shippingAddress String
  phone           String
  notes           String?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  
  // Relations
  user            User         @relation(fields: [userId], references: [id])
  items           OrderItem[]
  statusHistory   OrderStatusHistory[]
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}
```

### OrderItems Table
```prisma
model OrderItem {
  id          String   @id @default(uuid())
  orderId     String
  medicineId  String
  quantity    Int
  unitPrice   Float
  totalPrice  Float
  createdAt   DateTime @default(now())
  
  // Relations
  order       Order    @relation(fields: [orderId], references: [id])
  medicine    Medicine @relation(fields: [medicineId], references: [id])
}
```

### Reviews Table
```prisma
model Review {
  id          String   @id @default(uuid())
  rating      Int      // 1-5
  comment     String?
  userId      String
  medicineId  String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  user        User     @relation(fields: [userId], references: [id])
  medicine    Medicine @relation(fields: [medicineId], references: [id])
  
  @@unique([userId, medicineId])
}
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| POST | `/api/auth/logout` | Logout user | Private |
| GET | `/api/auth/session` | Get current session | Private |

**Note:** Login checks user status - banned users receive 403 error

### Medicines (Public)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/medicines` | Get all medicines with filters | Public |
| GET | `/api/medicines/:id` | Get medicine details | Public |

### Categories
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/categories` | Get all categories | Public |
| POST | `/api/categories` | Create category | Admin |
| PUT | `/api/categories/:id` | Update category | Admin |
| DELETE | `/api/categories/:id` | Delete category | Admin |

### Orders
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/orders` | Create new order | Customer |
| GET | `/api/orders` | Get user's orders | Private |
| GET | `/api/orders/:id` | Get order details | Private |
| PATCH | `/api/orders/:id/cancel` | Cancel order | Customer |

### Seller Routes
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/seller/dashboard` | Get seller stats | Seller |
| GET | `/api/seller/medicines` | Get seller's medicines | Seller |
| POST | `/api/seller/medicines` | Add new medicine | Seller |
| PUT | `/api/seller/medicines/:id` | Update medicine | Seller |
| DELETE | `/api/seller/medicines/:id` | Delete medicine | Seller |
| GET | `/api/seller/orders` | Get seller's orders | Seller |
| PATCH | `/api/seller/orders/:id/status` | Update order status | Seller |

### Admin Routes
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/admin/dashboard` | Get platform statistics | Admin |
| GET | `/api/admin/users` | Get all users | Admin |
| PATCH | `/api/admin/users/:id/status` | **Ban/Unban user** | Admin |
| GET | `/api/admin/medicines` | Get all medicines | Admin |
| GET | `/api/admin/orders` | Get all orders | Admin |

### Reviews
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/reviews/medicines/:id` | Create review | Customer |
| GET | `/api/reviews/medicines/:id` | Get medicine reviews | Public |
| GET | `/api/reviews/users/:userId` | Get user's reviews | Private |
| PUT | `/api/reviews/:id` | Update review | Customer |
| DELETE | `/api/reviews/:id` | Delete review | Customer |
| GET | `/api/orders/delivered-medicines` | Get medicines for review | Customer |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/ambakhtiar/MediStore-Backend.git
cd MediStore-Backend
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration (see [Environment Variables](#environment-variables))

4. **Set up database**
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (creates admin user)
npx prisma db seed
```

5. **Run development server**
```bash
npm run dev
# or
yarn dev
```

6. **Server running at**
```
http://localhost:5000
```

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/medistore"

# Server
PORT=5000
NODE_ENV=development

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:5000"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3000"

# JWT (if using separate JWT)
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"

# File Upload (Cloudinary - optional)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### Environment Variables Explanation

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `PORT` | Server port number | Yes |
| `NODE_ENV` | Environment (development/production) | Yes |
| `BETTER_AUTH_SECRET` | Secret key for Better Auth | Yes |
| `BETTER_AUTH_URL` | Backend URL for auth | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |
| `JWT_SECRET` | JWT signing secret | If using JWT |
| `CLOUDINARY_*` | Cloudinary credentials | If using Cloudinary |

## 📦 Deployment

### Deploy to Vercel

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
vercel
```

3. **Set environment variables**
```bash
vercel env add DATABASE_URL
vercel env add BETTER_AUTH_SECRET
# Add all other env variables
```

4. **Deploy to production**
```bash
vercel --prod
```

### Deploy to Render

1. Create new Web Service on [render.com](https://render.com)
2. Connect GitHub repository
3. Set build command: `npm install && npx prisma generate && npm run build`
4. Set start command: `npm start`
5. Add environment variables
6. Deploy

## 🔒 Security Features

- ✅ CORS configuration
- ✅ Rate limiting
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection
- ✅ Password hashing (bcrypt)
- ✅ JWT/Session-based authentication
- ✅ Input validation (Zod)
- ✅ **Ban system for malicious users**
- ✅ Role-based access control 
- ✅ Helmet.js for security headers

## 🗂️ Project Structure

```
src/
├── config/              # Configuration files
│   └── database.ts
├── middleware/          # Express middleware
│   ├── auth.ts
│   ├── errorHandler.ts
│   └── validator.ts
├── modules/             # Feature modules
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.routes.ts
│   ├── medicine/
│   ├── order/
│   ├── category/
│   ├── review/
│   └── user/
├── prisma/              # Prisma schema & migrations
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── types/               # TypeScript types
├── utils/               # Utility functions
│   ├── helpers.ts
│   └── error.ts
├── app.ts               # Express app setup
└── server.ts            # Server entry point
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🌱 Database Seeding

The seed file creates:
- 1 Admin user
- 10+ Medicine categories
- 50+ Sample medicines

```bash
npx prisma db seed
```

**Admin Credentials (from seed):**
```
Email: admin@medistore.com
Password: 11223344
```

## 📝 API Response Format

### Success Response
```json
{
  "ok": true,
  "status": 200,
  "message": "Success message",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "ok": false,
  "status": 400,
  "message": "Error message",
  "error": {
    "details": "Detailed error information"
  }
}
```

## 🔗 Links

- **Frontend Repository:** [MediStore-Frontend](https://github.com/ambakhtiar/MediStore-Frontend)
- **Live Backend:** [medistore-server-sepia.vercel.app](https://medistore-server-sepia.vercel.app)
- **Live Frontend:** [medistore-client-eta.vercel.app](https://medistore-client-eta.vercel.app)
- **Demo Video:** [Google Drive](https://drive.google.com/file/d/1rUm70KWWNz2Up-CCXjgP0KVZCTt18e9q/view?usp=sharing)

## 👨‍💻 Developer

**Abdullah Muhammad Bakhtiar**
- GitHub: [@ambakhtiar](https://github.com/ambakhtiar)
- Project: MediStore Backend API - Programming Hero Assignment 4

## 📄 License

This project is created for educational purposes as part of Programming Hero Full-Stack Web Development Course.

---

Built with 💊 for Programming Hero Assignment 4