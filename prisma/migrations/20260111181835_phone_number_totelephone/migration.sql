/*
  Warnings:

  - You are about to drop the column `phoneNumber` on the `Customer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "phoneNumber",
ADD COLUMN     "telephone" TEXT;
