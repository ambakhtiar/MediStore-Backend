var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/app.ts
import express2 from "express";
import cors from "cors";

// src/routes/index.ts
import express from "express";

// src/modules/medicine/medicine.routes.ts
import { Router } from "express";

// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// src/generated/prisma/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// src/generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.3.0",
  "engineVersion": "9d6ad21cbbceab97458517b147a6a09ff43aa735",
  "activeProvider": "postgresql",
  "inlineSchema": '// This is your Prisma schema file\n// https://pris.ly/d/prisma-schema\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../src/generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\n// ENUMS\nenum UserRole {\n  CUSTOMER\n  SELLER\n  ADMIN\n}\n\nenum UserStatus {\n  UNBAN\n  BAN\n}\n\nenum OrderStatus {\n  PLACED\n  CANCELLED\n  CONFIRMS\n  PROCESSING\n  SHIPPED\n  DELIVERED\n}\n\n// MODELS\n\nmodel User {\n  id            String     @id @default(uuid())\n  name          String\n  email         String     @unique\n  password      String?\n  emailVerified Boolean    @default(false)\n  image         String?\n  phone         String?\n  role          UserRole   @default(CUSTOMER)\n  status        UserStatus @default(UNBAN)\n  createdAt     DateTime   @default(now())\n  updatedAt     DateTime   @updatedAt\n\n  // relations\n  sessions        Session[]\n  accounts        Account[]\n  cart            Cart?\n  sellerMedicines Medicine[] @relation("SellerMedicines")\n  orders          Order[]\n  reviews         Review[]\n\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id @default(uuid())\n  expiresAt DateTime\n  token     String   @unique\n  ipAddress String?\n  userAgent String?\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  userId String\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id @default(uuid())\n  accountId             String\n  providerId            String\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  userId String\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id @default(uuid())\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n\nmodel Category {\n  id                     String   @id @default(uuid())\n  name                   String   @unique\n  slug                   String?  @unique\n  description            String?\n  isPrescriptionRequired Boolean? @default(false)\n  createdAt              DateTime @default(now())\n  updatedAt              DateTime @updatedAt\n\n  medicines Medicine[]\n\n  @@map("category")\n}\n\nmodel Medicine {\n  id           String   @id @default(uuid())\n  name         String\n  genericName  String?\n  description  String?\n  price        Float\n  stock        Int\n  manufacturer String?\n  imageUrl     String?\n  isFeatured   Boolean  @default(false)\n  isActive     Boolean  @default(true)\n  createdAt    DateTime @default(now())\n  updatedAt    DateTime @updatedAt\n\n  categoryId String?\n  category   Category?   @relation(fields: [categoryId], references: [id])\n  sellerId   String?\n  seller     User?       @relation("SellerMedicines", fields: [sellerId], references: [id], onDelete: Cascade)\n  cartItems  CartItem[]\n  orderItems OrderItem[]\n  reviews    Review[]\n\n  @@index([name])\n  @@index([categoryId])\n  @@map("medicine")\n}\n\nmodel Cart {\n  id        String     @id @default(uuid())\n  userId    String     @unique\n  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)\n  items     CartItem[]\n  createdAt DateTime   @default(now())\n  updatedAt DateTime   @updatedAt\n\n  @@map("cart")\n}\n\nmodel CartItem {\n  id         String   @id @default(uuid())\n  cartId     String\n  medicineId String\n  quantity   Int\n  unitPrice  Float\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  cart     Cart     @relation(fields: [cartId], references: [id], onDelete: Cascade)\n  medicine Medicine @relation(fields: [medicineId], references: [id])\n\n  @@unique([cartId, medicineId])\n  @@index([cartId])\n  @@index([medicineId])\n  @@map("cart_item")\n}\n\nmodel Order {\n  id              String      @id @default(uuid())\n  userId          String\n  total           Float\n  status          OrderStatus @default(PLACED)\n  shippingName    String?\n  shippingPhone   String\n  shippingAddress String\n  createdAt       DateTime    @default(now())\n  updatedAt       DateTime    @updatedAt\n\n  user          User                 @relation(fields: [userId], references: [id], onDelete: Cascade)\n  items         OrderItem[]\n  statusHistory OrderStatusHistory[]\n\n  @@index([userId])\n  @@index([status])\n  @@map("order")\n}\n\nmodel OrderItem {\n  id              String      @id @default(uuid())\n  orderId         String\n  medicineId      String\n  quantity        Int\n  unitPrice       Float\n  orderItemStatus OrderStatus @default(PLACED)\n  createdAt       DateTime    @default(now())\n  updatedAt       DateTime    @updatedAt\n\n  order    Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)\n  medicine Medicine @relation(fields: [medicineId], references: [id])\n\n  @@index([orderId])\n  @@index([medicineId])\n  @@map("order_item")\n}\n\nmodel OrderStatusHistory {\n  id        String      @id @default(uuid())\n  orderId   String\n  status    OrderStatus\n  changedAt DateTime    @default(now())\n  changedBy String? // \u0995\u09C7 change \u0995\u09B0\u09C7\u099B\u09C7 (admin/seller id)\n  notes     String? // optional notes\n  createdAt DateTime    @default(now())\n\n  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)\n\n  @@index([orderId])\n  @@index([status])\n  @@map("order_status_history")\n}\n\nmodel Review {\n  id         String   @id @default(uuid())\n  userId     String\n  medicineId String\n  rating     Int\n  comment    String?\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n  medicine Medicine @relation(fields: [medicineId], references: [id], onDelete: Cascade)\n\n  @@unique([userId, medicineId])\n  @@index([medicineId])\n  @@map("review")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"UserRole"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"cart","kind":"object","type":"Cart","relationName":"CartToUser"},{"name":"sellerMedicines","kind":"object","type":"Medicine","relationName":"SellerMedicines"},{"name":"orders","kind":"object","type":"Order","relationName":"OrderToUser"},{"name":"reviews","kind":"object","type":"Review","relationName":"ReviewToUser"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"Category":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"isPrescriptionRequired","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"medicines","kind":"object","type":"Medicine","relationName":"CategoryToMedicine"}],"dbName":"category"},"Medicine":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"genericName","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"price","kind":"scalar","type":"Float"},{"name":"stock","kind":"scalar","type":"Int"},{"name":"manufacturer","kind":"scalar","type":"String"},{"name":"imageUrl","kind":"scalar","type":"String"},{"name":"isFeatured","kind":"scalar","type":"Boolean"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"category","kind":"object","type":"Category","relationName":"CategoryToMedicine"},{"name":"sellerId","kind":"scalar","type":"String"},{"name":"seller","kind":"object","type":"User","relationName":"SellerMedicines"},{"name":"cartItems","kind":"object","type":"CartItem","relationName":"CartItemToMedicine"},{"name":"orderItems","kind":"object","type":"OrderItem","relationName":"MedicineToOrderItem"},{"name":"reviews","kind":"object","type":"Review","relationName":"MedicineToReview"}],"dbName":"medicine"},"Cart":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"CartToUser"},{"name":"items","kind":"object","type":"CartItem","relationName":"CartToCartItem"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"cart"},"CartItem":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"cartId","kind":"scalar","type":"String"},{"name":"medicineId","kind":"scalar","type":"String"},{"name":"quantity","kind":"scalar","type":"Int"},{"name":"unitPrice","kind":"scalar","type":"Float"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"cart","kind":"object","type":"Cart","relationName":"CartToCartItem"},{"name":"medicine","kind":"object","type":"Medicine","relationName":"CartItemToMedicine"}],"dbName":"cart_item"},"Order":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"total","kind":"scalar","type":"Float"},{"name":"status","kind":"enum","type":"OrderStatus"},{"name":"shippingName","kind":"scalar","type":"String"},{"name":"shippingPhone","kind":"scalar","type":"String"},{"name":"shippingAddress","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"OrderToUser"},{"name":"items","kind":"object","type":"OrderItem","relationName":"OrderToOrderItem"},{"name":"statusHistory","kind":"object","type":"OrderStatusHistory","relationName":"OrderToOrderStatusHistory"}],"dbName":"order"},"OrderItem":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"orderId","kind":"scalar","type":"String"},{"name":"medicineId","kind":"scalar","type":"String"},{"name":"quantity","kind":"scalar","type":"Int"},{"name":"unitPrice","kind":"scalar","type":"Float"},{"name":"orderItemStatus","kind":"enum","type":"OrderStatus"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"order","kind":"object","type":"Order","relationName":"OrderToOrderItem"},{"name":"medicine","kind":"object","type":"Medicine","relationName":"MedicineToOrderItem"}],"dbName":"order_item"},"OrderStatusHistory":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"orderId","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"OrderStatus"},{"name":"changedAt","kind":"scalar","type":"DateTime"},{"name":"changedBy","kind":"scalar","type":"String"},{"name":"notes","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"order","kind":"object","type":"Order","relationName":"OrderToOrderStatusHistory"}],"dbName":"order_status_history"},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"medicineId","kind":"scalar","type":"String"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"comment","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"ReviewToUser"},{"name":"medicine","kind":"object","type":"Medicine","relationName":"MedicineToReview"}],"dbName":"review"}},"enums":{},"types":{}}');
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// src/generated/prisma/internal/prismaNamespace.ts
var prismaNamespace_exports = {};
__export(prismaNamespace_exports, {
  AccountScalarFieldEnum: () => AccountScalarFieldEnum,
  AnyNull: () => AnyNull2,
  CartItemScalarFieldEnum: () => CartItemScalarFieldEnum,
  CartScalarFieldEnum: () => CartScalarFieldEnum,
  CategoryScalarFieldEnum: () => CategoryScalarFieldEnum,
  DbNull: () => DbNull2,
  Decimal: () => Decimal2,
  JsonNull: () => JsonNull2,
  MedicineScalarFieldEnum: () => MedicineScalarFieldEnum,
  ModelName: () => ModelName,
  NullTypes: () => NullTypes2,
  NullsOrder: () => NullsOrder,
  OrderItemScalarFieldEnum: () => OrderItemScalarFieldEnum,
  OrderScalarFieldEnum: () => OrderScalarFieldEnum,
  OrderStatusHistoryScalarFieldEnum: () => OrderStatusHistoryScalarFieldEnum,
  PrismaClientInitializationError: () => PrismaClientInitializationError2,
  PrismaClientKnownRequestError: () => PrismaClientKnownRequestError2,
  PrismaClientRustPanicError: () => PrismaClientRustPanicError2,
  PrismaClientUnknownRequestError: () => PrismaClientUnknownRequestError2,
  PrismaClientValidationError: () => PrismaClientValidationError2,
  QueryMode: () => QueryMode,
  ReviewScalarFieldEnum: () => ReviewScalarFieldEnum,
  SessionScalarFieldEnum: () => SessionScalarFieldEnum,
  SortOrder: () => SortOrder,
  Sql: () => Sql2,
  TransactionIsolationLevel: () => TransactionIsolationLevel,
  UserScalarFieldEnum: () => UserScalarFieldEnum,
  VerificationScalarFieldEnum: () => VerificationScalarFieldEnum,
  defineExtension: () => defineExtension,
  empty: () => empty2,
  getExtensionContext: () => getExtensionContext,
  join: () => join2,
  prismaVersion: () => prismaVersion,
  raw: () => raw2,
  sql: () => sql
});
import * as runtime2 from "@prisma/client/runtime/client";
var PrismaClientKnownRequestError2 = runtime2.PrismaClientKnownRequestError;
var PrismaClientUnknownRequestError2 = runtime2.PrismaClientUnknownRequestError;
var PrismaClientRustPanicError2 = runtime2.PrismaClientRustPanicError;
var PrismaClientInitializationError2 = runtime2.PrismaClientInitializationError;
var PrismaClientValidationError2 = runtime2.PrismaClientValidationError;
var sql = runtime2.sqltag;
var empty2 = runtime2.empty;
var join2 = runtime2.join;
var raw2 = runtime2.raw;
var Sql2 = runtime2.Sql;
var Decimal2 = runtime2.Decimal;
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var prismaVersion = {
  client: "7.3.0",
  engine: "9d6ad21cbbceab97458517b147a6a09ff43aa735"
};
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var DbNull2 = runtime2.DbNull;
var JsonNull2 = runtime2.JsonNull;
var AnyNull2 = runtime2.AnyNull;
var ModelName = {
  User: "User",
  Session: "Session",
  Account: "Account",
  Verification: "Verification",
  Category: "Category",
  Medicine: "Medicine",
  Cart: "Cart",
  CartItem: "CartItem",
  Order: "Order",
  OrderItem: "OrderItem",
  OrderStatusHistory: "OrderStatusHistory",
  Review: "Review"
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var UserScalarFieldEnum = {
  id: "id",
  name: "name",
  email: "email",
  password: "password",
  emailVerified: "emailVerified",
  image: "image",
  phone: "phone",
  role: "role",
  status: "status",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SessionScalarFieldEnum = {
  id: "id",
  expiresAt: "expiresAt",
  token: "token",
  ipAddress: "ipAddress",
  userAgent: "userAgent",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  userId: "userId"
};
var AccountScalarFieldEnum = {
  id: "id",
  accountId: "accountId",
  providerId: "providerId",
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  idToken: "idToken",
  accessTokenExpiresAt: "accessTokenExpiresAt",
  refreshTokenExpiresAt: "refreshTokenExpiresAt",
  scope: "scope",
  password: "password",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  userId: "userId"
};
var VerificationScalarFieldEnum = {
  id: "id",
  identifier: "identifier",
  value: "value",
  expiresAt: "expiresAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var CategoryScalarFieldEnum = {
  id: "id",
  name: "name",
  slug: "slug",
  description: "description",
  isPrescriptionRequired: "isPrescriptionRequired",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var MedicineScalarFieldEnum = {
  id: "id",
  name: "name",
  genericName: "genericName",
  description: "description",
  price: "price",
  stock: "stock",
  manufacturer: "manufacturer",
  imageUrl: "imageUrl",
  isFeatured: "isFeatured",
  isActive: "isActive",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  categoryId: "categoryId",
  sellerId: "sellerId"
};
var CartScalarFieldEnum = {
  id: "id",
  userId: "userId",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var CartItemScalarFieldEnum = {
  id: "id",
  cartId: "cartId",
  medicineId: "medicineId",
  quantity: "quantity",
  unitPrice: "unitPrice",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var OrderScalarFieldEnum = {
  id: "id",
  userId: "userId",
  total: "total",
  status: "status",
  shippingName: "shippingName",
  shippingPhone: "shippingPhone",
  shippingAddress: "shippingAddress",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var OrderItemScalarFieldEnum = {
  id: "id",
  orderId: "orderId",
  medicineId: "medicineId",
  quantity: "quantity",
  unitPrice: "unitPrice",
  orderItemStatus: "orderItemStatus",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var OrderStatusHistoryScalarFieldEnum = {
  id: "id",
  orderId: "orderId",
  status: "status",
  changedAt: "changedAt",
  changedBy: "changedBy",
  notes: "notes",
  createdAt: "createdAt"
};
var ReviewScalarFieldEnum = {
  id: "id",
  userId: "userId",
  medicineId: "medicineId",
  rating: "rating",
  comment: "comment",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SortOrder = {
  asc: "asc",
  desc: "desc"
};
var QueryMode = {
  default: "default",
  insensitive: "insensitive"
};
var NullsOrder = {
  first: "first",
  last: "last"
};
var defineExtension = runtime2.Extensions.defineExtension;

// src/generated/prisma/enums.ts
var UserStatus = {
  UNBAN: "UNBAN",
  BAN: "BAN"
};

// src/generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/lib/prisma.ts
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/lib/auth.ts
var auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "CUSTOMER",
        required: false
      },
      phone: {
        type: "string",
        required: false
      },
      status: {
        type: "string",
        defaultValue: "UNBAN",
        required: false
      }
    }
  },
  // baseURL: process.env.FRONTEND_URL || "https://medistore-client-eta.vercel.app",
  trustedOrigins: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    process.env.BETTER_AUTH_URL || "http://localhost:5000"
  ],
  emailAndPassword: {
    enabled: true
  },
  socialProviders: {
    google: {
      prompt: "select_account consent",
      accessType: "offline",
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60
      // 5 minutes
    }
  },
  advanced: {
    cookiePrefix: process.env.APP_NAME || "MediStore",
    useSecureCookies: process.env.NODE_ENV === "production",
    crossSubDomainCookies: {
      enabled: false
    },
    defaultCookieAttributes: {
      sameSite: "none",
      // For Cross-Origin 
      secure: true
      // if sameSite "none" then secure is "true"
    },
    disableCSRFCheck: true
    // Allow requests without Origin header (Postman, mobile apps, etc.)
  }
});

// src/middleware/auth.ts
var auth2 = (...rules) => {
  return async (req, res, next) => {
    const session = await auth.api.getSession({
      headers: req.headers
    });
    if (!session) {
      return res.status(403).json({
        success: false,
        message: "You are not authorizes!"
      });
    }
    req.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role
    };
    if (rules.length && !rules.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden! Access Denied!"
      });
    }
    next();
  };
};
var auth_default = auth2;

// src/lib/error.ts
var ServiceError = class _ServiceError extends Error {
  statusCode;
  details;
  constructor(message, statusCode = 400, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, _ServiceError.prototype);
  }
};

// src/modules/medicine/medicine.service.ts
var getAllMedicines = async (filters) => {
  const {
    search,
    category,
    manufacturer,
    sellerId,
    isFeatured,
    minPrice,
    maxPrice,
    inStock,
    page = 1,
    limit = 20,
    skip,
    sortBy = "createdAt",
    sortOrder = "desc"
  } = filters;
  const andConditions = [{ isActive: true }];
  if (search) {
    andConditions.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { genericName: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } }
      ]
    });
  }
  if (manufacturer) {
    andConditions.push({ manufacturer: { contains: manufacturer, mode: "insensitive" } });
  }
  if (sellerId) {
    andConditions.push({ sellerId });
  }
  if (minPrice !== void 0 || maxPrice !== void 0) {
    const price = {};
    if (minPrice !== void 0) price.gte = minPrice;
    if (maxPrice !== void 0) price.lte = maxPrice;
    andConditions.push({ price });
  }
  if (typeof inStock === "boolean") {
    andConditions.push(inStock ? { stock: { gt: 0 } } : { stock: { lte: 0 } });
  }
  if (typeof isFeatured === "boolean") {
    andConditions.push({ isFeatured });
  }
  if (category) {
    andConditions.push({
      OR: [
        { categoryId: category },
        { category: { name: { equals: category, mode: "insensitive" } } }
      ]
    });
  }
  try {
    const where = andConditions.length ? { AND: andConditions } : {};
    const [items, total] = await Promise.all([
      prisma.medicine.findMany({
        where,
        take: limit,
        skip,
        orderBy: { [sortBy]: sortOrder },
        include: {
          seller: true,
          category: true
        }
      }),
      prisma.medicine.count({ where })
    ]);
    return {
      ok: true,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: items
    };
  } catch (err) {
    console.error("searchMedicines error:", err);
    throw new ServiceError("Database error while searching medicines", 500);
  }
};
var getMedicinesBySeller = async (sellerId, filters = {}) => {
  try {
    if (!sellerId) {
      return { ok: false, error: { message: "sellerId is required" } };
    }
    const {
      page = 1,
      limit = 20,
      skip = (page - 1) * limit,
      sortBy = "createdAt",
      sortOrder = "desc",
      search,
      category,
      manufacturer,
      minPrice,
      maxPrice,
      inStock,
      isFeatured
    } = filters;
    const andConditions = [{ sellerId }];
    if (search) {
      andConditions.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { genericName: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } }
        ]
      });
    }
    if (manufacturer) {
      andConditions.push({ manufacturer: { contains: manufacturer, mode: "insensitive" } });
    }
    if (minPrice !== void 0 || maxPrice !== void 0) {
      const price = {};
      if (minPrice !== void 0) price.gte = minPrice;
      if (maxPrice !== void 0) price.lte = maxPrice;
      andConditions.push({ price });
    }
    if (typeof inStock === "boolean") {
      andConditions.push(inStock ? { stock: { gt: 0 } } : { stock: { lte: 0 } });
    }
    if (typeof isFeatured === "boolean") {
      andConditions.push({ isFeatured });
    }
    if (category) {
      andConditions.push({
        OR: [
          { categoryId: category },
          { category: { name: { equals: category, mode: "insensitive" } } }
        ]
      });
    }
    const where = andConditions.length ? { AND: andConditions } : {};
    const [items, total] = await Promise.all([
      prisma.medicine.findMany({
        where,
        take: limit,
        skip,
        orderBy: { [sortBy]: sortOrder },
        include: { category: true }
      }),
      prisma.medicine.count({ where })
    ]);
    return {
      ok: true,
      data: {
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        },
        data: items
      }
    };
  } catch (err) {
    console.error("getMedicinesBySeller error:", err);
    return { ok: false, error: { message: "Failed to fetch seller medicines" } };
  }
};
var getMedicineById = async (id) => {
  try {
    const medicine = await prisma.medicine.findUnique({
      where: { id },
      include: {
        category: true,
        seller: true
      }
    });
    return medicine;
  } catch (error) {
    console.error("getMedicineById error:", error);
    throw error;
  }
};
var addMedicine = async (data, sellerId) => {
  try {
    if (typeof data.price !== "number" || data.price < 0) throw new ServiceError("Invalid price", 400);
    const { name, genericName, description, price, stock, manufacturer, imageUrl, categoryId } = data;
    return await prisma.medicine.create({
      data: {
        name,
        genericName,
        description,
        price,
        stock,
        manufacturer,
        imageUrl,
        categoryId,
        sellerId
      }
    });
  } catch (err) {
    throw new ServiceError("Database error while adding medicine", 500);
  }
};
var updateMedicine = async (id, data, sellerId) => {
  const medicine = await prisma.medicine.findUnique({ where: { id } });
  if (!medicine) throw new ServiceError("Medicine not found", 404);
  if (medicine.sellerId !== sellerId) throw new ServiceError("Unauthorized", 403);
  const { name, genericName, description, price, stock, manufacturer, imageUrl, categoryId, isActive } = data;
  try {
    return await prisma.medicine.update({
      where: { id },
      data: {
        name,
        genericName,
        description,
        price,
        stock,
        manufacturer,
        imageUrl,
        categoryId,
        isActive
      }
    });
  } catch (err) {
    throw new ServiceError("Database error while updating medicine", 500);
  }
};
var deleteMedicine = async (id, sellerId) => {
  const medicine = await prisma.medicine.findUnique({ where: { id } });
  if (!medicine) throw new ServiceError("Medicine not found", 404);
  if (medicine.sellerId !== sellerId) throw new ServiceError("Unauthorized", 403);
  try {
    return await prisma.medicine.delete({ where: { id } });
  } catch (err) {
    throw new ServiceError("Database error while deleting medicine", 500);
  }
};
var updateStock = async (id, stock, sellerId) => {
  if (typeof stock !== "number" || stock < 0) {
    throw new ServiceError("Invalid stock value", 400);
  }
  const medicine = await prisma.medicine.findUnique({ where: { id } });
  if (!medicine) throw new ServiceError("Medicine not found", 404);
  if (medicine.sellerId !== sellerId) throw new ServiceError("Unauthorized", 403);
  try {
    return await prisma.medicine.update({
      where: { id },
      data: { stock }
    });
  } catch (err) {
    throw new ServiceError("Database error while updating stock", 500);
  }
};
var medicineService = {
  getAllMedicines,
  getMedicinesBySeller,
  getMedicineById,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  updateStock
};

// src/helpers/paginationSortingHelpers.ts
var paginationSortingHelpers = (option) => {
  const page = Number(option.page) || 1;
  const limit = Number(option.limit) || 10;
  const skip = (page - 1) * limit;
  const sortBy = option.sortBy || "createdAt";
  const sortOrder = option.sortOrder || "desc";
  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder
  };
};
var paginationSortingHelpers_default = paginationSortingHelpers;

// src/modules/medicine/medicine.controller.ts
var send = (res, code, message, data) => res.status(code).json({ message, data });
var getAllMedicines2 = async (req, res, next) => {
  try {
    const { search, category, manufacturer } = req.query;
    const searchString = typeof search === "string" ? search.trim() : void 0;
    const categoryString = typeof category === "string" ? category.trim() : void 0;
    const manufacturerString = typeof manufacturer === "string" ? manufacturer.trim() : void 0;
    const sellerId = typeof req.query.sellerId === "string" ? req.query.sellerId : void 0;
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : void 0;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : void 0;
    const inStock = typeof req.query.inStock === "string" ? req.query.inStock === "true" ? true : req.query.inStock === "false" ? false : void 0 : void 0;
    const isFeatured = typeof req.query.isFeatured === "string" ? req.query.isFeatured === "true" ? true : req.query.isFeatured === "false" ? false : void 0 : void 0;
    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelpers_default(req.query);
    if (minPrice !== void 0 && Number.isNaN(minPrice)) {
      return send(res, 400, "Invalid minPrice");
    }
    if (maxPrice !== void 0 && Number.isNaN(maxPrice)) {
      return send(res, 400, "Invalid maxPrice");
    }
    if (minPrice !== void 0 && maxPrice !== void 0 && minPrice > maxPrice) {
      return send(res, 400, "minPrice cannot be greater than maxPrice");
    }
    const filters = {
      search: searchString,
      category: categoryString,
      manufacturer: manufacturerString,
      sellerId,
      minPrice,
      maxPrice,
      inStock,
      isFeatured,
      page,
      limit,
      skip,
      sortBy,
      sortOrder
    };
    const data = await medicineService.getAllMedicines(filters);
    return send(res, 200, "Medicines fetched successfully", data);
  } catch (err) {
    next(err);
  }
};
var getMedicinesBySeller2 = async (req, res, next) => {
  try {
    if (!req.user?.id) return send(res, 401, "Unauthorized");
    const { search, category, manufacturer } = req.query;
    const searchString = typeof search === "string" ? search.trim() : void 0;
    const categoryString = typeof category === "string" ? category.trim() : void 0;
    const manufacturerString = typeof manufacturer === "string" ? manufacturer.trim() : void 0;
    const sellerId = typeof req.query.sellerId === "string" ? req.query.sellerId : void 0;
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : void 0;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : void 0;
    const inStock = typeof req.query.inStock === "string" ? req.query.inStock === "true" ? true : req.query.inStock === "false" ? false : void 0 : void 0;
    const isFeatured = typeof req.query.isFeatured === "string" ? req.query.isFeatured === "true" ? true : req.query.isFeatured === "false" ? false : void 0 : void 0;
    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelpers_default(req.query);
    if (minPrice !== void 0 && Number.isNaN(minPrice)) {
      return send(res, 400, "Invalid minPrice");
    }
    if (maxPrice !== void 0 && Number.isNaN(maxPrice)) {
      return send(res, 400, "Invalid maxPrice");
    }
    if (minPrice !== void 0 && maxPrice !== void 0 && minPrice > maxPrice) {
      return send(res, 400, "minPrice cannot be greater than maxPrice");
    }
    const filters = {
      search: searchString,
      category: categoryString,
      manufacturer: manufacturerString,
      sellerId,
      minPrice,
      maxPrice,
      inStock,
      isFeatured,
      page,
      limit,
      skip,
      sortBy,
      sortOrder
    };
    const result = await medicineService.getMedicinesBySeller(req.user?.id, filters);
    if (!result.ok) {
      return send(res, 500, result.error?.message || "Failed to fetch medicines");
    }
    return send(res, 200, "Seller medicines fetched successfully", result.data);
  } catch (err) {
    next(err);
  }
};
var getMedicineById2 = async (req, res, next) => {
  try {
    const medicine = await medicineService.getMedicineById(req.params.id);
    if (!medicine) return send(res, 404, "Medicine not found");
    return send(res, 200, "Medicine fetched successfully", medicine);
  } catch (err) {
    next(err);
  }
};
var addMedicine2 = async (req, res, next) => {
  try {
    if (!req.user?.id) return send(res, 401, "Unauthorized");
    const medicine = await medicineService.addMedicine(req.body, req.user.id);
    return send(res, 201, "Medicine created successfully", medicine);
  } catch (err) {
    next(err);
  }
};
var updateMedicine2 = async (req, res, next) => {
  try {
    if (!req.user?.id) return send(res, 401, "Unauthorized");
    const medicine = await medicineService.updateMedicine(req.params.id, req.body, req.user.id);
    return send(res, 200, "Medicine updated successfully", medicine);
  } catch (err) {
    next(err);
  }
};
var deleteMedicine2 = async (req, res, next) => {
  try {
    if (!req.user?.id) return send(res, 401, "Unauthorized");
    await medicineService.deleteMedicine(req.params.id, req.user.id);
    return send(res, 200, "Medicine deleted successfully");
  } catch (err) {
    next(err);
  }
};
var updateStock2 = async (req, res, next) => {
  try {
    if (!req.user?.id) return send(res, 401, "Unauthorized");
    const { stock } = req.body;
    const medicine = await medicineService.updateStock(req.params.id, stock, req.user.id);
    return send(res, 200, "Stock updated successfully", medicine);
  } catch (err) {
    next(err);
  }
};
var medicineController = {
  getAllMedicines: getAllMedicines2,
  getMedicinesBySeller: getMedicinesBySeller2,
  getMedicineById: getMedicineById2,
  addMedicine: addMedicine2,
  updateMedicine: updateMedicine2,
  deleteMedicine: deleteMedicine2,
  updateStock: updateStock2
};

// src/modules/medicine/medicine.routes.ts
var router = Router();
router.get("/", medicineController.getAllMedicines);
router.get("/seller", auth_default("SELLER" /* SELLER */), medicineController.getMedicinesBySeller);
router.get("/:id", medicineController.getMedicineById);
router.post("/", auth_default("SELLER" /* SELLER */), medicineController.addMedicine);
router.put("/:id", auth_default("SELLER" /* SELLER */), medicineController.updateMedicine);
router.delete("/:id", auth_default("SELLER" /* SELLER */), medicineController.deleteMedicine);
router.patch("/:id/stock", auth_default("SELLER" /* SELLER */), medicineController.updateStock);
var medicineRouter = router;

// src/modules/user/user.routes.ts
import { Router as Router2 } from "express";

// src/modules/user/user.service.ts
var ServiceError2 = class _ServiceError extends Error {
  statusCode;
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, _ServiceError.prototype);
  }
};
var getAllUsers = async () => {
  try {
    return await prisma.user.findMany({
      orderBy: { createdAt: "desc" }
    });
  } catch (err) {
    console.error("getAllUsers error:", err);
    throw new ServiceError2("Database error while fetching users", 500);
  }
};
var updateUserStatus = async (id, status) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new ServiceError2("User not found", 404);
    return await prisma.user.update({
      where: { id },
      data: { status }
    });
  } catch (err) {
    console.error("updateUserStatus error:", err);
    throw new ServiceError2("Database error while updating user status", 500);
  }
};
var userService = {
  getAllUsers,
  updateUserStatus
};

// src/modules/user/user.controller.ts
var send2 = (res, code, message, data) => res.status(code).json({ message, data });
var sendError = (res, err, fallback) => {
  const status = err instanceof ServiceError2 ? err.statusCode : 500;
  const message = err?.message || fallback;
  return res.status(status).json({ message });
};
var getAllUsers2 = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    return send2(res, 200, "Users fetched successfully", users);
  } catch (err) {
    return sendError(res, err, "Failed to fetch users");
  }
};
var updateUserStatus2 = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (status !== UserStatus.BAN && status !== UserStatus.UNBAN) {
      return res.status(400).json({ message: "Invalid status" });
    }
    await userService.updateUserStatus(id, status);
    const updatedUser = await userService.updateUserStatus(id, status);
    return send2(res, 200, "User status updated successfully", updatedUser);
  } catch (err) {
    return sendError(res, err, "Failed to update user status");
  }
};
var userController = {
  getAllUsers: getAllUsers2,
  updateUserStatus: updateUserStatus2
};

// src/modules/user/user.routes.ts
var router2 = Router2();
router2.get("/", auth_default("ADMIN" /* ADMIN */), userController.getAllUsers);
router2.patch("/:id/status", auth_default("ADMIN" /* ADMIN */), userController.updateUserStatus);
var userRouter = router2;

// src/modules/category/category.routes.ts
import { Router as Router3 } from "express";

// src/modules/category/category.service.ts
var ServiceError3 = class _ServiceError extends Error {
  statusCode;
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, _ServiceError.prototype);
  }
};
var slugify = (s) => s.toString().trim().toLowerCase().replace(/[^a-z0-9\- ]+/g, "").replace(/\s+/g, "-").replace(/\-+/g, "-");
var ensureUniqueSlug = async (base) => {
  let candidate = base;
  let i = 1;
  while (true) {
    const exists = await prisma.category.findUnique({ where: { slug: candidate } });
    if (!exists) return candidate;
    candidate = `${base}-${i++}`;
  }
};
var getAllCategories = async () => {
  try {
    return await prisma.category.findMany({
      orderBy: { createdAt: "desc" }
    });
  } catch (err) {
    console.error("getAllCategories error:", err);
    throw new ServiceError3("Database error while fetching categories", 500);
  }
};
var getCategoryById = async (id) => {
  try {
    return await prisma.category.findUnique({ where: { id } });
  } catch (err) {
    console.error("getCategoryById error:", err);
    throw new ServiceError3("Database error while fetching category", 500);
  }
};
var createCategory = async (data) => {
  const name = (data.name || "").trim();
  if (!name) throw new ServiceError3("Name is required", 400);
  const baseSlug = data.slug && data.slug.trim() ? slugify(data.slug) : slugify(name);
  try {
    const existingByName = await prisma.category.findUnique({ where: { name } });
    if (existingByName) {
      throw new ServiceError3("Category with this name already exists", 409);
    }
    const uniqueSlug = await ensureUniqueSlug(baseSlug);
    return await prisma.category.create({
      data: {
        name,
        slug: uniqueSlug,
        description: data.description ?? null,
        isPrescriptionRequired: data.isPrescriptionRequired ?? false
      }
    });
  } catch (err) {
    console.error("createCategory error:", err);
    if (err?.code === "P2002" && Array.isArray(err?.meta?.target)) {
      const field = err.meta.target.join(", ");
      throw new ServiceError3(`Duplicate value for unique field: ${field}`, 409);
    }
    throw new ServiceError3("Database error while creating category", 500);
  }
};
var updateCategory = async (id, data) => {
  try {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) throw new ServiceError3("Category not found", 404);
    const updateData = {};
    if (data.name !== void 0) updateData.name = data.name.trim();
    if (data.description !== void 0) updateData.description = data.description ?? null;
    if (data.isPrescriptionRequired !== void 0 && data.isPrescriptionRequired !== null) {
      const raw3 = data.isPrescriptionRequired;
      if (typeof raw3 === "boolean") {
        updateData.isPrescriptionRequired = raw3;
      } else if (typeof raw3 === "string") {
        updateData.isPrescriptionRequired = raw3 === "true";
      } else {
        updateData.isPrescriptionRequired = Boolean(raw3);
      }
    }
    if (data.slug !== void 0) {
      const baseSlug = data.slug && data.slug.trim() ? slugify(data.slug) : slugify(updateData.name ?? existing.name);
      if (baseSlug !== existing.slug) {
        updateData.slug = await ensureUniqueSlug(baseSlug);
      } else {
        updateData.slug = existing.slug;
      }
    }
    return await prisma.category.update({
      where: { id },
      data: updateData
    });
  } catch (err) {
    console.error("updateCategory error:", err);
    if (err instanceof ServiceError3) throw err;
    if (err?.code === "P2002" && Array.isArray(err?.meta?.target)) {
      const field = err.meta.target.join(", ");
      throw new ServiceError3(`Duplicate value for unique field: ${field}`, 409);
    }
    throw new ServiceError3("Database error while updating category", 500);
  }
};
var deleteCategory = async (id) => {
  try {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) throw new ServiceError3("Category not found", 404);
    return await prisma.category.delete({ where: { id } });
  } catch (err) {
    console.error("deleteCategory error:", err);
    if (err instanceof ServiceError3) throw err;
    throw new ServiceError3("Database error while deleting category", 500);
  }
};
var categoryService = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};

// src/modules/category/category.controller.ts
var send3 = (res, code, message, data) => res.status(code).json({ message, data });
var sendError2 = (res, err, fallback) => {
  const status = err instanceof ServiceError3 ? err.statusCode : 500;
  const message = err?.message || fallback;
  return res.status(status).json({ message });
};
var getAllCategories2 = async (_req, res) => {
  try {
    const categories = await categoryService.getAllCategories();
    return send3(res, 200, "Categories fetched successfully", categories);
  } catch (err) {
    return sendError2(res, err, "Failed to fetch categories");
  }
};
var getCategoryById2 = async (req, res) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    if (!category) return send3(res, 404, "Category not found");
    return send3(res, 200, "Category fetched successfully", category);
  } catch (err) {
    return sendError2(res, err, "Failed to fetch category");
  }
};
var createCategory2 = async (req, res) => {
  try {
    const { name, slug, description, isPrescriptionRequired } = req.body;
    if (!name || typeof name !== "string") return send3(res, 400, "Name is required");
    const category = await categoryService.createCategory({ name, slug, description, isPrescriptionRequired });
    return send3(res, 201, "Category created successfully", category);
  } catch (err) {
    return sendError2(res, err, "Failed to create category");
  }
};
var updateCategory2 = async (req, res) => {
  try {
    const { name, slug, description, isPrescriptionRequired } = req.body;
    const updated = await categoryService.updateCategory(req.params.id, { name, slug, description, isPrescriptionRequired });
    return send3(res, 200, "Category updated successfully", updated);
  } catch (err) {
    return sendError2(res, err, "Failed to update category");
  }
};
var deleteCategory2 = async (req, res) => {
  try {
    const data = await categoryService.deleteCategory(req.params.id);
    return send3(res, 200, "Category deleted successfully", data);
  } catch (err) {
    return sendError2(res, err, "Failed to delete category");
  }
};
var categoryController = {
  getAllCategories: getAllCategories2,
  getCategoryById: getCategoryById2,
  createCategory: createCategory2,
  updateCategory: updateCategory2,
  deleteCategory: deleteCategory2
};

// src/modules/category/category.routes.ts
var router3 = Router3();
router3.get("/", categoryController.getAllCategories);
router3.get("/:id", categoryController.getCategoryById);
router3.post("/", auth_default("ADMIN" /* ADMIN */), categoryController.createCategory);
router3.put("/:id", auth_default("ADMIN" /* ADMIN */), categoryController.updateCategory);
router3.delete("/:id", auth_default("ADMIN" /* ADMIN */), categoryController.deleteCategory);
var categoryRouter = router3;

// src/modules/profile/profile.routes.ts
import { Router as Router4 } from "express";

// src/modules/profile/profile.service.ts
var ServiceError4 = class _ServiceError extends Error {
  statusCode;
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, _ServiceError.prototype);
  }
};
var getProfile = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) throw new ServiceError4("User not found", 404);
    return user;
  } catch (err) {
    console.error("getProfile error:", err);
    if (err instanceof ServiceError4) throw err;
    throw new ServiceError4("Database error while fetching profile", 500);
  }
};
var updateProfile = async (userId, data) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ServiceError4("User not found", 404);
    const { name, image, phone } = data;
    const updateData = {};
    if (name !== void 0) updateData.name = name;
    if (image !== void 0) updateData.image = image;
    if (phone !== void 0) updateData.phone = phone;
    const result = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });
    return result;
  } catch (err) {
    console.error("updateProfile error:", err);
    if (err instanceof ServiceError4) throw err;
    throw new ServiceError4("Failed to update profile", 500);
  }
};
var changePassword = async (currentPassword, newPassword, options = {}) => {
  const { revokeOtherSessions = true, headers = {} } = options;
  try {
    const res = await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions
      },
      headers
    });
    if (res && typeof res === "object") {
      if ("ok" in res && res.ok === false) {
        const msg = res.message || "Failed to change password";
        const status = res.status || 400;
        throw new ServiceError4(msg, status);
      }
      if ("status" in res && res.status >= 400) {
        const msg = res.message || "Failed to change password";
        throw new ServiceError4(msg, res.status);
      }
    }
    return;
  } catch (err) {
    if (err instanceof ServiceError4) throw err;
    const message = String(err?.message ?? "");
    if (err?.status === 401) {
      throw new ServiceError4("Unauthorized. Please login and try again.", 401);
    }
    if (err?.status === 403 || /incorrect|invalid/i.test(message)) {
      throw new ServiceError4("Current password is incorrect", 403);
    }
    if (/network|fetch|ECONNREFUSED|timeout/i.test(message)) {
      throw new ServiceError4("Unable to reach authentication service. Try again later.", 503);
    }
    console.error("changePassword service error:", err);
    throw new ServiceError4("Failed to change password", 500);
  }
};
var profileService = {
  getProfile,
  updateProfile,
  changePassword
};

// src/modules/profile/profile.controller.ts
var send4 = (res, code, message, data) => res.status(code).json({ message, data });
var sendError3 = (res, err, fallback) => {
  const status = err instanceof ServiceError4 ? err.statusCode : 500;
  const message = err?.message || fallback;
  return res.status(status).json({ message });
};
var getProfile2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return send4(res, 401, "Unauthorized");
    const user = await profileService.getProfile(userId);
    return send4(res, 200, "Profile fetched successfully", user);
  } catch (err) {
    return sendError3(res, err, "Failed to fetch profile");
  }
};
var updateProfile2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return send4(res, 401, "Unauthorized");
    const updated = await profileService.updateProfile(userId, req.body);
    return send4(res, 200, "Profile updated successfully", updated);
  } catch (err) {
    return sendError3(res, err, "Failed to update profile");
  }
};
var changePassword2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return send4(res, 401, "Unauthorized");
    const { currentPassword, newPassword, revokeOtherSessions = true } = req.body ?? {};
    if (!currentPassword || !newPassword) {
      return send4(res, 400, "Both currentPassword and newPassword are required");
    }
    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return send4(res, 400, "New password must be at least 8 characters");
    }
    if (newPassword === currentPassword) {
      return send4(res, 400, "New password & current password do not same");
    }
    const headers = { cookie: req.headers.cookie ?? "" };
    await profileService.changePassword(currentPassword, newPassword, {
      revokeOtherSessions,
      headers
    });
    return send4(res, 200, "Password changed successfully");
  } catch (err) {
    return sendError3(res, err, "Failed to change password");
  }
};
var profileController = {
  getProfile: getProfile2,
  updateProfile: updateProfile2,
  changePassword: changePassword2
};

// src/modules/profile/profile.routes.ts
var router4 = Router4();
router4.get("/me", auth_default(), profileController.getProfile);
router4.put("/me", auth_default(), profileController.updateProfile);
router4.patch("/me/password", auth_default(), profileController.changePassword);
var profileRouter = router4;

// src/modules/cart/cart.routes.ts
import { Router as Router5 } from "express";

// src/modules/cart/cart.service.ts
var ServiceError5 = class _ServiceError extends Error {
  statusCode;
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, _ServiceError.prototype);
  }
};
var addMedicineToCart = async (userId, data) => {
  const { medicineId, quantity } = data;
  if (!medicineId || typeof medicineId !== "string") {
    throw new ServiceError5("medicineId is required", 400);
  }
  const qty = Number(quantity ?? 1);
  if (!Number.isInteger(qty) || qty <= 0) {
    throw new ServiceError5("quantity must be a positive integer", 400);
  }
  try {
    return await prisma.$transaction(async (tx) => {
      const medicine = await tx.medicine.findUnique({
        where: { id: medicineId },
        select: {
          id: true,
          name: true,
          genericName: true,
          imageUrl: true,
          manufacturer: true,
          price: true,
          stock: true,
          isActive: true,
          categoryId: true,
          sellerId: true
        }
      });
      if (!medicine) throw new ServiceError5("Medicine not found", 404);
      if (!medicine.isActive) throw new ServiceError5("Medicine is not available", 400);
      let cart = await tx.cart.findUnique({ where: { userId } });
      if (!cart) {
        cart = await tx.cart.create({ data: { userId } });
      }
      const existing = await tx.cartItem.findUnique({
        where: { cartId_medicineId: { cartId: cart.id, medicineId } }
      });
      const currentUnitPrice = medicine.price;
      if (existing) {
        const newQty = existing.quantity + qty;
        if (newQty > medicine.stock) throw new ServiceError5("Requested quantity exceeds stock", 409);
        const updated = await tx.cartItem.update({
          where: { id: existing.id },
          data: {
            quantity: newQty,
            unitPrice: currentUnitPrice
          },
          include: {
            medicine: {
              select: {
                id: true,
                name: true,
                genericName: true,
                imageUrl: true,
                manufacturer: true,
                isActive: true,
                stock: true,
                categoryId: true,
                sellerId: true
              }
            }
          }
        });
        return formatCartItem(updated);
      }
      if (qty > medicine.stock) throw new ServiceError5("Requested quantity exceeds stock", 409);
      const created = await tx.cartItem.create({
        data: {
          cartId: cart.id,
          medicineId,
          quantity: qty,
          unitPrice: currentUnitPrice
        },
        include: {
          medicine: {
            select: {
              id: true,
              name: true,
              genericName: true,
              imageUrl: true,
              manufacturer: true,
              isActive: true,
              stock: true,
              categoryId: true,
              sellerId: true
            }
          }
        }
      });
      return formatCartItem(created);
    });
  } catch (err) {
    if (err instanceof ServiceError5) throw err;
    console.error("addItem error:", err);
    throw new ServiceError5("Failed to add item to cart", 500);
  }
};
var getCart = async (userId) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          orderBy: { createdAt: "desc" },
          include: {
            medicine: {
              select: {
                id: true,
                name: true,
                genericName: true,
                imageUrl: true,
                manufacturer: true,
                price: true,
                stock: true,
                isActive: true,
                categoryId: true,
                sellerId: true
              }
            }
          }
        }
      }
    });
    if (!cart) {
      return { items: [], subtotal: 0 };
    }
    const items = cart.items.map((it) => ({
      id: it.id,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      medicine: {
        id: it.medicine.id,
        name: it.medicine.name,
        genericName: it.medicine.genericName,
        imageUrl: it.medicine.imageUrl,
        manufacturer: it.medicine.manufacturer,
        isActive: it.medicine.isActive,
        stock: it.medicine.stock,
        categoryId: it.medicine.categoryId,
        sellerId: it.medicine.sellerId
      },
      createdAt: it.createdAt,
      updatedAt: it.updatedAt
    }));
    const subtotal = items.reduce((total, it) => total + it.unitPrice * it.quantity, 0);
    const cartCount = cart.items.length;
    return { items, subtotal, cartCount };
  } catch (err) {
    console.error("getCart error:", err);
    throw new ServiceError5("Failed to fetch cart", 500);
  }
};
var updateItem = async (userId, cartItemId, quantity) => {
  if (!cartItemId) throw new ServiceError5("cart item id is required", 400);
  if (quantity === void 0 || quantity === null) throw new ServiceError5("quantity is required", 400);
  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 0) throw new ServiceError5("quantity must be a non-negative integer", 400);
  try {
    return await prisma.$transaction(async (tx) => {
      const cartItem = await tx.cartItem.findUnique({
        where: { id: cartItemId },
        include: {
          cart: { select: { userId: true, id: true } },
          medicine: { select: { id: true, stock: true, price: true, isActive: true, name: true, genericName: true, imageUrl: true, manufacturer: true } }
        }
      });
      if (!cartItem) throw new ServiceError5("Cart item not found", 404);
      if (cartItem.cart.userId !== userId) throw new ServiceError5("Unauthorized", 403);
      if (!cartItem.medicine.isActive) throw new ServiceError5("Medicine is not available", 400);
      if (qty === 0) {
        await tx.cartItem.delete({ where: { id: cartItemId } });
        return { deleted: true };
      }
      if (qty > cartItem.medicine.stock) throw new ServiceError5("Requested quantity exceeds stock", 409);
      const updated = await tx.cartItem.update({
        where: { id: cartItemId },
        data: { quantity: qty, unitPrice: cartItem.medicine.price },
        include: {
          medicine: {
            select: {
              id: true,
              name: true,
              genericName: true,
              imageUrl: true,
              manufacturer: true,
              isActive: true,
              stock: true,
              categoryId: true,
              sellerId: true
            }
          }
        }
      });
      return formatCartItem(updated);
    });
  } catch (err) {
    if (err instanceof ServiceError5) throw err;
    console.error("updateItem error:", err);
    throw new ServiceError5("Failed to update cart item", 500);
  }
};
var removeItem = async (userId, cartItemId) => {
  if (!cartItemId) throw new ServiceError5("cart item id is required", 400);
  try {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: { select: { userId: true } } }
    });
    if (!cartItem) throw new ServiceError5("Cart item not found", 404);
    if (cartItem.cart.userId !== userId) throw new ServiceError5("Unauthorized", 403);
    await prisma.cartItem.delete({ where: { id: cartItemId } });
    return;
  } catch (err) {
    if (err instanceof ServiceError5) throw err;
    console.error("removeItem error:", err);
    throw new ServiceError5("Failed to remove cart item", 500);
  }
};
var formatCartItem = (ci) => ({
  id: ci.id,
  quantity: ci.quantity,
  unitPrice: ci.unitPrice,
  medicine: {
    id: ci.medicine.id,
    name: ci.medicine.name,
    genericName: ci.medicine.genericName,
    imageUrl: ci.medicine.imageUrl,
    manufacturer: ci.medicine.manufacturer,
    isActive: ci.medicine.isActive,
    stock: ci.medicine.stock
  },
  createdAt: ci.createdAt,
  updatedAt: ci.updatedAt
});
var cartService = {
  addMedicineToCart,
  getCart,
  updateItem,
  removeItem
};

// src/modules/cart/cart.controller.ts
var send5 = (res, code, message, data) => res.status(code).json({ message, data });
var sendError4 = (res, err, fallback) => {
  const status = err instanceof ServiceError5 ? err.statusCode : 500;
  const message = err?.message || fallback;
  return res.status(status).json({ message });
};
var addMedicineToCart2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return send5(res, 401, "Unauthorized");
    const { medicineId, quantity } = req.body ?? {};
    const item = await cartService.addMedicineToCart(userId, { medicineId, quantity });
    return send5(res, 201, "Item added to cart", item);
  } catch (err) {
    return sendError4(res, err, "Failed to add item to cart");
  }
};
var getCart2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return send5(res, 401, "Unauthorized");
    const cart = await cartService.getCart(userId);
    return send5(res, 200, "Cart fetched", cart);
  } catch (err) {
    return sendError4(res, err, "Failed to fetch cart");
  }
};
var updateItem2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return send5(res, 401, "Unauthorized");
    const cartItemId = req.params.id;
    const { quantity } = req.body ?? {};
    const updated = await cartService.updateItem(userId, cartItemId, quantity);
    return send5(res, 200, "Cart item updated", updated);
  } catch (err) {
    return sendError4(res, err, "Failed to update cart item");
  }
};
var removeItem2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return send5(res, 401, "Unauthorized");
    const cartItemId = req.params.id;
    await cartService.removeItem(userId, cartItemId);
    return send5(res, 200, "Cart item removed");
  } catch (err) {
    return sendError4(res, err, "Failed to remove cart item");
  }
};
var cartController = {
  addMedicineToCart: addMedicineToCart2,
  getCart: getCart2,
  updateItem: updateItem2,
  removeItem: removeItem2
};

// src/modules/cart/cart.routes.ts
var router5 = Router5();
router5.post("/items", auth_default("CUSTOMER" /* CUSTOMER */), cartController.addMedicineToCart);
router5.get("/", auth_default("CUSTOMER" /* CUSTOMER */), cartController.getCart);
router5.put("/items/:id", auth_default("CUSTOMER" /* CUSTOMER */), cartController.updateItem);
router5.delete("/items/:id", auth_default("CUSTOMER" /* CUSTOMER */), cartController.removeItem);
var cartRouter = router5;

// src/modules/order/order.routes.ts
import { Router as Router6 } from "express";

// src/modules/order/order.service.ts
var VALID_TRANSITIONS = {
  PLACED: ["PROCESSING", "CANCELLED", "CONFIRMS"],
  CONFIRMS: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: []
};
var normalizeStatus = (s) => String(s ?? "").toUpperCase();
var ServiceError6 = class _ServiceError extends Error {
  statusCode;
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, _ServiceError.prototype);
  }
};
var createStatusHistory = async (tx, orderId, status, changedBy, notes) => {
  return await tx.orderStatusHistory.create({
    data: {
      orderId,
      status,
      changedBy,
      notes
    }
  });
};
var createOrder = async (userId, data) => {
  const { shippingName, shippingPhone, shippingAddress } = data;
  if (!shippingAddress || typeof shippingAddress !== "string" || shippingAddress.trim() === "") {
    throw new ServiceError6("Active shippingPhone number & shippingAddress is required", 400);
  }
  if (!shippingPhone || typeof shippingPhone !== "string" || shippingPhone.trim() === "") {
    throw new ServiceError6("Active shippingPhone number & shippingAddress is required", 409);
  }
  try {
    return await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              medicine: {
                select: { id: true, price: true, stock: true, isActive: true, sellerId: true, name: true }
              }
            }
          }
        }
      });
      if (!cart || cart.items.length === 0) {
        throw new ServiceError6("Cart is empty", 400);
      }
      for (const item of cart.items) {
        const med = item.medicine;
        if (!med) throw new ServiceError6(`Medicine not found for cart item ${item.id}`, 404);
        if (!med.isActive) throw new ServiceError6(`Medicine ${med.name} is not available`, 400);
        if (item.quantity > med.stock) {
          throw new ServiceError6(`Insufficient stock for ${med.name}`, 409);
        }
      }
      const total = cart.items.reduce((total2, it) => total2 + it.medicine.price * it.quantity, 0);
      const order = await tx.order.create({
        data: {
          userId,
          total,
          status: "PLACED",
          shippingName: shippingName ?? null,
          shippingPhone,
          shippingAddress
        }
      });
      await createStatusHistory(tx, order.id, "PLACED", userId, "Order created");
      const orderItemCreates = cart.items.map(
        (it) => tx.orderItem.create({
          data: {
            orderId: order.id,
            medicineId: it.medicine.id,
            quantity: it.quantity,
            unitPrice: it.medicine.price
          }
        })
      );
      const stockUpdates = cart.items.map(
        (it) => tx.medicine.update({
          where: { id: it.medicine.id },
          data: { stock: { decrement: it.quantity } }
        })
      );
      await Promise.all([...orderItemCreates, ...stockUpdates]);
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      const created = await tx.order.findUnique({
        where: { id: order.id },
        include: {
          items: {
            include: {
              medicine: { select: { id: true, name: true, imageUrl: true, manufacturer: true } }
            }
          },
          user: { select: { id: true, name: true, email: true } }
        }
      });
      console.info(`Order created: ${order.id} by user ${userId} total=${total}`);
      return created;
    });
  } catch (err) {
    if (err instanceof ServiceError6) throw err;
    console.error("createOrder error:", err);
    throw new ServiceError6("Failed to create order", 500);
  }
};
var listOrders = async (user, opts = {}) => {
  try {
    const { skip = 0, take = 50 } = opts;
    if (user.role === "ADMIN") {
      const orders2 = await prisma.order.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              medicine: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                  genericName: true,
                  manufacturer: true,
                  sellerId: true,
                  seller: true
                }
              }
            }
          },
          user: { select: { id: true, name: true, email: true } }
        }
      });
      return orders2;
    }
    const sellerId = String(user.id);
    if (user.role === "SELLER") {
      const orders2 = await prisma.order.findMany({
        skip,
        take,
        where: {
          // orders that include at least one item from this seller
          items: {
            some: {
              medicine: {
                sellerId
              }
            }
          }
        },
        orderBy: { createdAt: "desc" },
        include: {
          // include only items that belong to this seller
          items: {
            where: {
              medicine: {
                sellerId
              }
            },
            include: {
              medicine: true
            }
          },
          user: {
            select: { id: true, name: true }
          }
        }
      });
      return orders2;
    }
    const orders = await prisma.order.findMany({
      skip,
      take,
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { items: { include: { medicine: true } } }
    });
    return orders;
  } catch (err) {
    console.error("listOrders error:", err);
    throw new ServiceError6("Failed to list orders", 500);
  }
};
var getOrder = async (user, orderId) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { medicine: true }
        },
        user: { select: { id: true, name: true, email: true } }
      }
    });
    if (!order) throw new ServiceError6("Order not found", 404);
    if (user.role === "ADMIN") return order;
    if (user.role === "SELLER") {
      const hasSellerItem = order.items.some((it) => it.medicine.sellerId === user.id);
      if (!hasSellerItem) throw new ServiceError6("Unauthorized", 403);
      return order;
    }
    if (order.userId !== user.id) throw new ServiceError6("Unauthorized", 403);
    return order;
  } catch (err) {
    if (err instanceof ServiceError6) throw err;
    console.error("getOrder error:", err);
    throw new ServiceError6("Failed to fetch order", 500);
  }
};
var cancelOrderByCustomer = async (user, orderId) => {
  const upper = normalizeStatus("CANCELLED");
  try {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: { include: { medicine: { select: { id: true, name: true, stock: true, sellerId: true } } } }
        }
      });
      if (!order) throw new ServiceError6("Order not found", 404);
      if (order.userId !== user.id) throw new ServiceError6("Unauthorized", 403);
      const current = order.status;
      if (current !== "PLACED") {
        throw new ServiceError6("You can cancel the order only before it is confirmed or processed by seller", 400);
      }
      for (const it of order.items) {
        await tx.medicine.update({
          where: { id: it.medicine.id },
          data: { stock: { increment: it.quantity } }
        });
      }
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status: upper },
        include: { items: { include: { medicine: true } }, user: { select: { id: true, name: true, email: true } } }
      });
      console.info(`Order ${orderId} cancelled by customer ${user.id}`);
      return updated;
    });
  } catch (err) {
    if (err instanceof ServiceError6) throw err;
    console.error("cancelOrderByCustomer error:", err);
    throw new ServiceError6("Failed to cancel order", 500);
  }
};
var getOrderStatus = async (orderId) => {
  try {
    const result = await prisma.order.findUnique({
      where: {
        id: orderId
      },
      select: {
        status: true
      }
    });
    return result;
  } catch (err) {
    if (err instanceof ServiceError6) throw err;
    console.error("getOrderStatus error:", err);
    throw new ServiceError6("Failed to get order status", 500);
  }
};
var updateOrderStatusByAdmin = async (user, orderId, newStatus) => {
  const upper = normalizeStatus(newStatus);
  const VALID_STATUSES = Object.keys(VALID_TRANSITIONS);
  if (!VALID_STATUSES.includes(upper)) {
    throw new ServiceError6("Invalid status", 400);
  }
  try {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: { include: { medicine: { select: { id: true, sellerId: true, name: true } } } }
        }
      });
      if (!order) throw new ServiceError6("Order not found", 404);
      if (user.role !== "ADMIN") {
        throw new ServiceError6("Unauthorized", 403);
      }
      const current = order.status;
      if (current === upper) {
        return await tx.order.findUnique({
          where: { id: orderId },
          include: { items: { include: { medicine: true } }, user: { select: { id: true, name: true, email: true } } }
        });
      }
      if (upper === "CANCELLED" && ["SHIPPED", "DELIVERED"].includes(current)) {
        throw new ServiceError6("Cannot cancel order after it has been shipped or delivered", 400);
      }
      const allowed = VALID_TRANSITIONS[current] ?? [];
      if (!allowed.includes(upper)) {
        throw new ServiceError6(`Invalid status transition from ${current} to ${upper}`, 400);
      }
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status: upper },
        include: {
          items: { include: { medicine: true } },
          user: { select: { id: true, name: true, email: true } },
          statusHistory: { orderBy: { changedAt: "asc" } }
        }
      });
      await createStatusHistory(
        tx,
        orderId,
        upper,
        user.id,
        `Status changed from ${current} to ${upper} by admin`
      );
      return updated;
    });
  } catch (err) {
    if (err instanceof ServiceError6) throw err;
    console.error("updateOrderStatusByActor error:", err);
    throw new ServiceError6("Failed to update order status", 500);
  }
};
var updateOrderItemStatusBySeller = async (user, orderItemId, newStatus) => {
  const upper = normalizeStatus(newStatus);
  if (!Object.keys(VALID_TRANSITIONS).includes(upper)) {
    throw new ServiceError6("Invalid status", 400);
  }
  try {
    return await prisma.$transaction(async (tx) => {
      const item = await tx.orderItem.findUnique({
        where: { id: orderItemId },
        include: { medicine: { select: { sellerId: true, id: true, name: true } }, order: { select: { id: true, status: true } } }
      });
      if (!item) throw new ServiceError6("Order item not found", 404);
      if (user.role === "SELLER" && item.medicine.sellerId !== user.id) {
        throw new ServiceError6("Unauthorized: you don't own this item", 403);
      }
      const current = item.orderItemStatus;
      if (current === upper) {
        return await tx.orderItem.findUnique({ where: { id: orderItemId }, include: { medicine: true, order: true } });
      }
      const allowed = VALID_TRANSITIONS[current] ?? [];
      if (!allowed.includes(upper)) {
        throw new ServiceError6(`Invalid status transition from ${current} to ${upper}`, 400);
      }
      const updatedItem = await tx.orderItem.update({
        where: { id: orderItemId },
        data: { orderItemStatus: upper },
        include: { medicine: true, order: true }
      });
      return updatedItem;
    });
  } catch (err) {
    if (err instanceof ServiceError6) throw err;
    console.error("updateOrderItemStatusBySeller error:", err);
    throw new ServiceError6("Failed to update order item status", 500);
  }
};
var getOrderStatusHistory = async (orderId) => {
  try {
    const history = await prisma.orderStatusHistory.findMany({
      where: { orderId },
      orderBy: { changedAt: "asc" }
    });
    return history;
  } catch (err) {
    console.error("getOrderStatusHistory error:", err);
    throw new ServiceError6("Failed to fetch order status history", 500);
  }
};
var getDeliveredMedicinesForReview = async (userId) => {
  try {
    const deliveredOrders = await prisma.order.findMany({
      where: {
        userId,
        status: "DELIVERED"
      },
      include: {
        items: {
          include: {
            medicine: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                genericName: true
              }
            }
          }
        }
      }
    });
    const deliveredMedicines = deliveredOrders.flatMap(
      (order) => order.items.map((item) => ({
        medicineId: item.medicine.id,
        medicineName: item.medicine.name,
        medicineImage: item.medicine.imageUrl,
        genericName: item.medicine.genericName,
        orderId: order.id,
        orderDate: order.createdAt
      }))
    );
    const existingReviews = await prisma.review.findMany({
      where: { userId },
      select: { medicineId: true }
    });
    const reviewedMedicineIds = new Set(existingReviews.map((r) => r.medicineId));
    const pendingReviews = deliveredMedicines.filter(
      (med) => !reviewedMedicineIds.has(med.medicineId)
    );
    const uniquePendingReviews = Array.from(
      new Map(pendingReviews.map((item) => [item.medicineId, item])).values()
    );
    return uniquePendingReviews;
  } catch (err) {
    console.error("getDeliveredMedicinesForReview error:", err);
    throw new ServiceError6("Failed to fetch delivered medicines", 500);
  }
};
var orderService = {
  createOrder,
  listOrders,
  getOrder,
  getOrderStatus,
  cancelOrderByCustomer,
  updateOrderStatusByAdmin,
  updateOrderItemStatusBySeller,
  getOrderStatusHistory,
  getDeliveredMedicinesForReview
};

// src/modules/order/order.controller.ts
var send6 = (res, code, message, data) => res.status(code).json({ message, data });
var sendError5 = (res, err, fallback) => {
  const status = err instanceof ServiceError6 ? err.statusCode : 500;
  const message = err?.message || fallback;
  return res.status(status).json({ message });
};
var createOrder2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return send6(res, 401, "Unauthorized");
    const { shippingName, shippingPhone, shippingAddress } = req.body ?? {};
    const order = await orderService.createOrder(userId, {
      shippingName,
      shippingPhone,
      shippingAddress
    });
    return send6(res, 201, "Order placed successfully", order);
  } catch (err) {
    return sendError5(res, err, "Failed to place order");
  }
};
var listOrders2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user?.id) return send6(res, 401, "Unauthorized");
    const orders = await orderService.listOrders(user);
    return send6(res, 200, "Orders fetched", orders);
  } catch (err) {
    return sendError5(res, err, "Failed to fetch orders");
  }
};
var getOrder2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user?.id) return send6(res, 401, "Unauthorized");
    const orderId = req.params.id;
    const order = await orderService.getOrder(user, orderId);
    return send6(res, 200, "Order fetched", order);
  } catch (err) {
    return sendError5(res, err, "Failed to fetch order");
  }
};
var getOrderStatus2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user?.id) return send6(res, 401, "Unauthorized");
    const orderId = req.params.id;
    const status = await orderService.getOrderStatus(orderId);
    return send6(res, 200, "Order fetched", status);
  } catch (err) {
    return sendError5(res, err, "Failed to fetch order");
  }
};
var cancelOrderByCustomer2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user?.id) return send6(res, 401, "Unauthorized");
    const orderId = req.params.id;
    const updated = await orderService.cancelOrderByCustomer(user, orderId);
    return send6(res, 200, "Order cancelled", updated);
  } catch (err) {
    return sendError5(res, err, "Failed to cancel order");
  }
};
var updateOrderItemStatusBySeller2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user?.id) return send6(res, 401, "Unauthorized");
    const orderItemId = req.params.id;
    const { status } = req.body ?? {};
    if (!status) return send6(res, 400, "status is required");
    const updated = await orderService.updateOrderItemStatusBySeller(user, orderItemId, status);
    return send6(res, 200, "Order item status updated", updated);
  } catch (err) {
    return sendError5(res, err, "Failed to update order item status");
  }
};
var updateOrderStatusByAdmin2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user?.id) return send6(res, 401, "Unauthorized");
    const orderId = req.params.id;
    const { status } = req.body ?? {};
    if (!status) return send6(res, 400, "status is required");
    const updated = await orderService.updateOrderStatusByAdmin(user, orderId, status);
    return send6(res, 200, "Order status updated", updated);
  } catch (err) {
    return sendError5(res, err, "Failed to update order status");
  }
};
var getOrderStatusHistory2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user?.id) return send6(res, 401, "Unauthorized");
    const orderId = req.params.id;
    const history = await orderService.getOrderStatusHistory(orderId);
    return send6(res, 200, "Status history fetched", history);
  } catch (err) {
    return sendError5(res, err, "Failed to fetch status history");
  }
};
var getDeliveredMedicinesForReview2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user?.id) return send6(res, 401, "Unauthorized");
    const medicines = await orderService.getDeliveredMedicinesForReview(user.id);
    return send6(res, 200, "Delivered medicines fetched", medicines);
  } catch (err) {
    return sendError5(res, err, "Failed to fetch delivered medicines");
  }
};
var orderController = {
  createOrder: createOrder2,
  listOrders: listOrders2,
  getOrder: getOrder2,
  getOrderStatus: getOrderStatus2,
  cancelOrderByCustomer: cancelOrderByCustomer2,
  updateOrderStatusByAdmin: updateOrderStatusByAdmin2,
  updateOrderItemStatusBySeller: updateOrderItemStatusBySeller2,
  getOrderStatusHistory: getOrderStatusHistory2,
  getDeliveredMedicinesForReview: getDeliveredMedicinesForReview2
};

// src/modules/order/order.routes.ts
var router6 = Router6();
router6.post("/", auth_default("CUSTOMER" /* CUSTOMER */), orderController.createOrder);
router6.get("/", auth_default(), orderController.listOrders);
router6.get("/delivered-medicines", auth_default(), orderController.getDeliveredMedicinesForReview);
router6.get("/:id", auth_default(), orderController.getOrder);
router6.get("/:id/track", auth_default(), orderController.getOrderStatus);
router6.patch("/:id/cancel", auth_default(), orderController.cancelOrderByCustomer);
router6.get("/:id/status-history", auth_default(), orderController.getOrderStatusHistory);
router6.patch("/seller/order-item/:id/status", auth_default("SELLER" /* SELLER */), orderController.updateOrderItemStatusBySeller);
router6.patch("/admin/order/:id/status", auth_default("ADMIN" /* ADMIN */), orderController.updateOrderStatusByAdmin);
var orderRouter = router6;

// src/modules/review/review.routes.ts
import { Router as Router7 } from "express";

// src/modules/review/review.service.ts
var ServiceError7 = class _ServiceError extends Error {
  statusCode;
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, _ServiceError.prototype);
  }
};
var validateRating = (r) => {
  const n = Number(r);
  if (!Number.isInteger(n) || n < 1 || n > 5) {
    throw new ServiceError7("rating must be an integer between 1 and 5", 400);
  }
  return n;
};
var createReview = async (userId, medicineId, data) => {
  const rating = validateRating(data.rating);
  const comment = data.comment ?? null;
  try {
    return await prisma.$transaction(async (tx) => {
      const medicine = await tx.medicine.findUnique({ where: { id: medicineId } });
      if (!medicine) throw new ServiceError7("Medicine not found", 404);
      const delivered = await tx.order.findFirst({
        where: {
          userId,
          status: "DELIVERED",
          items: { some: { medicineId } }
        },
        select: { id: true }
      });
      if (!delivered) {
        throw new ServiceError7("You can only review medicines you have received (DELIVERED)", 403);
      }
      const existing = await tx.review.findUnique({
        where: { userId_medicineId: { userId, medicineId } }
      });
      if (existing) {
        throw new ServiceError7("Review already exists. Use PUT to update.", 409);
      }
      const created = await tx.review.create({
        data: {
          userId,
          medicineId,
          rating,
          comment
        }
      });
      const agg = await tx.review.aggregate({
        where: { medicineId },
        _avg: { rating: true },
        _count: { rating: true }
      });
      const averageRating = agg._avg.rating ?? null;
      const reviewCount = agg._count.rating ?? 0;
      return { review: created, meta: { averageRating, reviewCount } };
    });
  } catch (err) {
    if (err instanceof ServiceError7) throw err;
    console.error("createReview error:", err);
    throw new ServiceError7("Failed to create review", 500);
  }
};
var updateReview = async (user, medicineId, data) => {
  const rating = data.rating !== void 0 ? validateRating(data.rating) : void 0;
  const comment = data.comment ?? void 0;
  try {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.review.findUnique({
        where: { userId_medicineId: { userId: user.id, medicineId } }
      });
      if (!existing) throw new ServiceError7("Review not found", 404);
      if (user.role !== "ADMIN" && existing.userId !== user.id) {
        throw new ServiceError7("Unauthorized", 403);
      }
      const data2 = {};
      if (rating !== void 0) data2.rating = rating;
      if (comment !== void 0) data2.comment = comment;
      const updated = await tx.review.update({
        where: { id: existing.id },
        data: data2
      });
      const agg = await tx.review.aggregate({
        where: { medicineId },
        _avg: { rating: true },
        _count: { rating: true }
      });
      const averageRating = agg._avg.rating ?? null;
      const reviewCount = agg._count.rating ?? 0;
      return { review: updated, meta: { averageRating, reviewCount } };
    });
  } catch (err) {
    if (err instanceof ServiceError7) throw err;
    console.error("updateReview error:", err);
    throw new ServiceError7("Failed to update review", 500);
  }
};
var deleteReview = async (user, reviewId) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.review.findUnique({
        where: { id: reviewId }
      });
      if (!existing) throw new ServiceError7("Review not found", 404);
      if (user.role !== "ADMIN" && existing.userId !== user.id) {
        throw new ServiceError7("Unauthorized", 403);
      }
      await tx.review.delete({ where: { id: reviewId } });
      return;
    });
  } catch (err) {
    if (err instanceof ServiceError7) throw err;
    console.error("deleteReview error:", err);
    throw new ServiceError7("Failed to delete review", 500);
  }
};
var getReviewsByMedicine = async (medicineId, opts) => {
  const { page, limit, skip, sortBy, sortOrder } = opts;
  try {
    const [reviews, agg] = await Promise.all([
      prisma.review.findMany({
        where: { medicineId },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { user: { select: { id: true, name: true, image: true } } }
      }),
      prisma.review.aggregate({
        where: { medicineId },
        _avg: { rating: true },
        _count: { rating: true }
      })
    ]);
    return {
      reviews,
      meta: {
        averageRating: agg._avg.rating ?? null,
        reviewCount: agg._count.rating ?? 0
      }
    };
  } catch (err) {
    console.error("listReviewsByMedicine error:", err);
    throw new ServiceError7("Failed to list reviews", 500);
  }
};
var getReviewsByUser = async (userId, opts) => {
  const { page, limit, skip, sortBy, sortOrder } = opts;
  try {
    const reviews = await prisma.review.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      // include: { medicine: { select: { id: true, name: true, imageUrl: true } } },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        medicine: {
          select: { id: true, name: true, genericName: true, imageUrl: true }
        }
      }
    });
    return { reviews };
  } catch (err) {
    console.error("listReviewsByUser error:", err);
    throw new ServiceError7("Failed to list user reviews", 500);
  }
};
var getReview = async (id) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true } }, medicine: { select: { id: true, name: true } } }
    });
    if (!review) throw new ServiceError7("Review not found", 404);
    return review;
  } catch (err) {
    if (err instanceof ServiceError7) throw err;
    console.error("getReview error:", err);
    throw new ServiceError7("Failed to fetch review", 500);
  }
};
var reviewService = {
  createReview,
  updateReview,
  deleteReview,
  getReviewsByMedicine,
  getReviewsByUser,
  getReview
};

// src/modules/review/review.controller.ts
var send7 = (res, code, message, data) => res.status(code).json({ message, data });
var sendError6 = (res, err, fallback) => {
  const status = err instanceof ServiceError7 ? err.statusCode : 500;
  const message = err?.message || fallback;
  return res.status(status).json({ message });
};
var createReview2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user?.id) return send7(res, 401, "Unauthorized");
    const medicineId = req.params.id;
    const { rating, comment } = req.body ?? {};
    const result = await reviewService.createReview(user.id, medicineId, { rating, comment });
    return send7(res, 201, "Review created", result);
  } catch (err) {
    return sendError6(res, err, "Failed to create review");
  }
};
var updateReview2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return send7(res, 401, "Unauthorized");
    const medicineId = req.params.id;
    const { rating, comment } = req.body ?? {};
    const result = await reviewService.updateReview(user, medicineId, { rating, comment });
    return send7(res, 200, "Review updated", result);
  } catch (err) {
    return sendError6(res, err, "Failed to update review");
  }
};
var deleteReview2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user?.id) return send7(res, 401, "Unauthorized");
    const reviewId = req.params.id;
    await reviewService.deleteReview(user, reviewId);
    return send7(res, 200, "Review deleted");
  } catch (err) {
    return sendError6(res, err, "Failed to delete review");
  }
};
var getReviewsByMedicine2 = async (req, res) => {
  try {
    const medicineId = req.params.id;
    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelpers_default(req.query);
    const data = await reviewService.getReviewsByMedicine(medicineId, { page, limit, skip, sortBy, sortOrder });
    return send7(res, 200, "Reviews fetched", data);
  } catch (err) {
    return sendError6(res, err, "Failed to fetch reviews");
  }
};
var getReviewsByUser2 = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelpers_default(req.query);
    const data = await reviewService.getReviewsByUser(userId, { page, limit, skip, sortBy, sortOrder });
    return send7(res, 200, "User reviews fetched", data);
  } catch (err) {
    return sendError6(res, err, "Failed to fetch user reviews");
  }
};
var getReview2 = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const review = await reviewService.getReview(reviewId);
    return send7(res, 200, "Review fetched", review);
  } catch (err) {
    return sendError6(res, err, "Failed to fetch review");
  }
};
var reviewController = {
  createReview: createReview2,
  updateReview: updateReview2,
  deleteReview: deleteReview2,
  getReviewsByMedicine: getReviewsByMedicine2,
  getReviewsByUser: getReviewsByUser2,
  getReview: getReview2
};

// src/modules/review/review.routes.ts
var router7 = Router7();
router7.post("/medicines/:id", auth_default("CUSTOMER" /* CUSTOMER */), reviewController.createReview);
router7.put("/medicines/:id", auth_default("CUSTOMER" /* CUSTOMER */), reviewController.updateReview);
router7.delete("/:id", auth_default(), reviewController.deleteReview);
router7.get("/medicines/:id", reviewController.getReviewsByMedicine);
router7.get("/users/:userId", auth_default("CUSTOMER" /* CUSTOMER */), reviewController.getReviewsByUser);
router7.get("/:id", reviewController.getReview);
var reviewRouter = router7;

// src/routes/index.ts
var router8 = express.Router();
router8.use("/medicines", medicineRouter);
router8.use("/categories", categoryRouter);
router8.use("/profile", profileRouter);
router8.use("/cart", cartRouter);
router8.use("/orders", orderRouter);
router8.use("/reviews", reviewRouter);
router8.use("/admin/users", auth_default("ADMIN" /* ADMIN */), userRouter);
var routes_default = router8;

// src/app.ts
import { toNodeHandler } from "better-auth/node";

// src/middleware/notFound.ts
var notFound = (req, res) => {
  res.status(404).json({
    message: "Route not found !",
    path: req.originalUrl,
    date: Date()
  });
};

// src/lib/logger.ts
var isProd = process.env.NODE_ENV || "production";
var logger = {
  info: (...args) => {
    if (isProd) console.log(JSON.stringify({ level: "info", time: (/* @__PURE__ */ new Date()).toISOString(), args }));
    else console.info(...args);
  },
  warn: (...args) => {
    if (isProd) console.warn(JSON.stringify({ level: "warn", time: (/* @__PURE__ */ new Date()).toISOString(), args }));
    else console.warn(...args);
  },
  error: (...args) => {
    if (isProd) console.error(JSON.stringify({ level: "error", time: (/* @__PURE__ */ new Date()).toISOString(), args }));
    else console.error(...args);
  }
};
var logger_default = logger;

// src/middleware/globalErrorHandler.ts
var isDev = process.env.NODE_ENV !== "production";
function mapPrismaError(err) {
  let status = 500;
  let message = "Database error";
  if (err instanceof prismaNamespace_exports.PrismaClientValidationError) {
    status = 400;
    message = "Invalid input";
  } else if (err instanceof prismaNamespace_exports.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        status = 409;
        message = "Duplicate entry";
        break;
      case "P2025":
        status = 404;
        message = "Record not found";
        break;
      case "P2003":
        status = 400;
        message = "Foreign key constraint failed";
        break;
      default:
        status = 400;
        message = "Database request error";
    }
  } else if (err instanceof prismaNamespace_exports.PrismaClientInitializationError) {
    status = 503;
    message = "Database initialization error";
  } else if (err instanceof prismaNamespace_exports.PrismaClientUnknownRequestError) {
    status = 500;
    message = "Database unknown error";
  } else if (err instanceof prismaNamespace_exports.PrismaClientRustPanicError) {
    status = 500;
    message = "Database internal error";
  }
  return { status, message };
}
function errorHandler(err, req, res, next) {
  let statusCode = 500;
  let clientMessage = "Internal Server Error";
  if (err instanceof ServiceError) {
    statusCode = err.statusCode || 400;
    clientMessage = err.message || clientMessage;
  } else if (err instanceof prismaNamespace_exports.PrismaClientKnownRequestError || err instanceof prismaNamespace_exports.PrismaClientValidationError || err instanceof prismaNamespace_exports.PrismaClientInitializationError || err instanceof prismaNamespace_exports.PrismaClientUnknownRequestError || err instanceof prismaNamespace_exports.PrismaClientRustPanicError) {
    const mapped = mapPrismaError(err);
    statusCode = mapped.status;
    clientMessage = mapped.message;
  } else if (err && typeof err.status === "number" && typeof err.message === "string") {
    statusCode = err.status;
    clientMessage = err.message;
  } else {
    clientMessage = "Internal Server Error";
  }
  try {
    logger_default.error({
      message: err?.message ?? String(err),
      path: req.path,
      method: req.method,
      user: req.user?.id ?? null,
      statusCode,
      // include full error only in dev logs
      error: isDev ? err : void 0
    });
  } catch (logErr) {
    console.error("Logger failed:", logErr);
    console.error(err);
  }
  const body = { message: clientMessage };
  if (isDev) body.error = { stack: err?.stack, details: err?.details ?? void 0 };
  res.status(statusCode).json(body);
}

// src/app.ts
var app = express2();
var allowedOrigins = [
  process.env.APP_URL || "http://localhost:3000",
  process.env.PROD_APP_URL
  // Production frontend URL
].filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.includes(origin) || /^https:\/\/next-blog-client.*\.vercel\.app$/.test(origin) || /^https:\/\/.*\.vercel\.app$/.test(origin);
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"]
  })
);
app.set("trust proxy", true);
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express2.json());
app.use("/api", routes_default);
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use(notFound);
app.use(errorHandler);
var app_default = app;

// src/index.ts
var index_default = app_default;
export {
  index_default as default
};
