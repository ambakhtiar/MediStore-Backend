/*
  Warnings:

  - You are about to drop the column `status` on the `order` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "order_status_idx";

-- AlterTable
ALTER TABLE "order" DROP COLUMN "status",
ADD COLUMN     "orderStatus" "OrderStatus" NOT NULL DEFAULT 'PLACED';

-- AlterTable
ALTER TABLE "order_item" ADD COLUMN     "orderItemStatus" "OrderStatus" NOT NULL DEFAULT 'PLACED';

-- CreateIndex
CREATE INDEX "order_orderStatus_idx" ON "order"("orderStatus");
