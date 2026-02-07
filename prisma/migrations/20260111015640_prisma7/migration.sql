/*
  Warnings:

  - A unique constraint covering the columns `[provider,providerId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `key` on the `Role` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "RoleKey" AS ENUM ('ADMIN', 'MANAGER', 'EMPLOYEE', 'CUSTOMER', 'GUEST');

-- DropIndex
DROP INDEX "User_providerId_key";

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "key",
ADD COLUMN     "key" "RoleKey" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Role_key_key" ON "Role"("key");

-- CreateIndex
CREATE UNIQUE INDEX "User_provider_providerId_key" ON "User"("provider", "providerId");
