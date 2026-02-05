/*
  Warnings:

  - You are about to drop the column `orderStatus` on the `order` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "order_orderStatus_idx";

-- AlterTable
ALTER TABLE "order" DROP COLUMN "orderStatus",
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'PLACED';

-- CreateIndex
CREATE INDEX "order_status_idx" ON "order"("status");
