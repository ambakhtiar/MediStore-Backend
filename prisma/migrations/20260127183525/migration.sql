-- AlterTable
ALTER TABLE "user" ADD COLUMN     "phone" TEXT,
ADD COLUMN     "role" TEXT DEFAULT 'customer',
ADD COLUMN     "status" TEXT DEFAULT 'ACTIVE';
