-- DropForeignKey
ALTER TABLE "medicine" DROP CONSTRAINT "medicine_sellerId_fkey";

-- AddForeignKey
ALTER TABLE "medicine" ADD CONSTRAINT "medicine_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
