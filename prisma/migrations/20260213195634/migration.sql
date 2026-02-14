/*
  Warnings:

  - You are about to drop the column `balance` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `JournalEntry` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `JournalEntry` table. All the data in the column will be lost.
  - You are about to drop the column `creditAccountId` on the `JournalEntry` table. All the data in the column will be lost.
  - You are about to drop the column `debitAccountId` on the `JournalEntry` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[orgId,code]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[financeId]` on the table `JournalEntry` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orgId` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entryDate` to the `JournalEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `JournalEntry` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');

-- CreateEnum
CREATE TYPE "AccountSubtype" AS ENUM ('CASH', 'ACCOUNTS_RECEIVABLE', 'PREPAID_EXPENSES', 'INVENTORY', 'FIXED_ASSETS', 'ACCUMULATED_DEPRECIATION', 'OTHER_ASSET', 'ACCOUNTS_PAYABLE', 'CREDIT_CARD', 'TAX_PAYABLE', 'PAYROLL_LIABILITY', 'LOANS_PAYABLE', 'DEFERRED_REVENUE', 'OTHER_LIABILITY', 'OWNER_EQUITY', 'RETAINED_EARNINGS', 'OTHER_EQUITY', 'SERVICE_REVENUE', 'OTHER_REVENUE', 'COGS', 'PAYROLL_EXPENSE', 'RENT', 'UTILITIES', 'INSURANCE', 'FUEL', 'MAINTENANCE', 'MARKETING', 'SOFTWARE', 'MEALS', 'DEPRECIATION_EXPENSE', 'OTHER_EXPENSE');

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "balance",
ADD COLUMN     "code" TEXT,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "orgId" TEXT NOT NULL,
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "subtype" "AccountSubtype",
ADD COLUMN     "type" "AccountType" NOT NULL;

-- AlterTable
ALTER TABLE "JournalEntry" DROP COLUMN "amount",
DROP COLUMN "content",
DROP COLUMN "creditAccountId",
DROP COLUMN "debitAccountId",
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "customerId" TEXT,
ADD COLUMN     "entryDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "financeId" TEXT,
ADD COLUMN     "memo" TEXT,
ADD COLUMN     "orgId" TEXT NOT NULL,
ADD COLUMN     "projectId" TEXT,
ADD COLUMN     "propertyId" TEXT,
ADD COLUMN     "reference" TEXT,
ALTER COLUMN "title" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalLine" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "amountCents" BIGINT NOT NULL,
    "description" TEXT,
    "externalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JournalLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountBalance" (
    "accountId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "balanceCents" BIGINT NOT NULL DEFAULT 0,
    "lastEntryId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountBalance_pkey" PRIMARY KEY ("accountId")
);

-- CreateIndex
CREATE INDEX "JournalLine_orgId_accountId_idx" ON "JournalLine"("orgId", "accountId");

-- CreateIndex
CREATE INDEX "JournalLine_orgId_entryId_idx" ON "JournalLine"("orgId", "entryId");

-- CreateIndex
CREATE INDEX "JournalLine_orgId_accountId_createdAt_idx" ON "JournalLine"("orgId", "accountId", "createdAt");

-- CreateIndex
CREATE INDEX "JournalLine_orgId_accountId_externalId_idx" ON "JournalLine"("orgId", "accountId", "externalId");

-- CreateIndex
CREATE INDEX "AccountBalance_orgId_idx" ON "AccountBalance"("orgId");

-- CreateIndex
CREATE INDEX "Account_orgId_type_idx" ON "Account"("orgId", "type");

-- CreateIndex
CREATE INDEX "Account_orgId_subtype_idx" ON "Account"("orgId", "subtype");

-- CreateIndex
CREATE INDEX "Account_parentId_idx" ON "Account"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_orgId_code_key" ON "Account"("orgId", "code");

-- CreateIndex
CREATE INDEX "AngiInterviewEntry_leadId_idx" ON "AngiInterviewEntry"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "JournalEntry_financeId_key" ON "JournalEntry"("financeId");

-- CreateIndex
CREATE INDEX "JournalEntry_orgId_entryDate_idx" ON "JournalEntry"("orgId", "entryDate");

-- CreateIndex
CREATE INDEX "JournalEntry_orgId_createdAt_idx" ON "JournalEntry"("orgId", "createdAt");

-- CreateIndex
CREATE INDEX "JournalEntry_orgId_reference_idx" ON "JournalEntry"("orgId", "reference");

-- CreateIndex
CREATE INDEX "JournalEntry_createdById_idx" ON "JournalEntry"("createdById");

-- CreateIndex
CREATE INDEX "JournalEntry_customerId_idx" ON "JournalEntry"("customerId");

-- CreateIndex
CREATE INDEX "JournalEntry_projectId_idx" ON "JournalEntry"("projectId");

-- CreateIndex
CREATE INDEX "JournalEntry_propertyId_idx" ON "JournalEntry"("propertyId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_financeId_fkey" FOREIGN KEY ("financeId") REFERENCES "Finance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalLine" ADD CONSTRAINT "JournalLine_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalLine" ADD CONSTRAINT "JournalLine_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "JournalEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalLine" ADD CONSTRAINT "JournalLine_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountBalance" ADD CONSTRAINT "AccountBalance_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountBalance" ADD CONSTRAINT "AccountBalance_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
