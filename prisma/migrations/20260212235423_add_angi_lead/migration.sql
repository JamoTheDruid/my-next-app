-- CreateTable
CREATE TABLE "AngiLead" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "stateProvince" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "primaryPhone" TEXT NOT NULL,
    "phoneExt" TEXT,
    "secondaryPhone" TEXT,
    "secondaryPhoneExt" TEXT,
    "primaryMaskedNumber" BOOLEAN NOT NULL DEFAULT false,
    "srOid" BIGINT NOT NULL,
    "leadOid" BIGINT NOT NULL,
    "fee" DECIMAL(65,30) NOT NULL,
    "taskName" TEXT NOT NULL,
    "comments" TEXT NOT NULL,
    "matchType" TEXT NOT NULL,
    "leadDescription" TEXT NOT NULL,
    "spEntityId" BIGINT NOT NULL,
    "spCompanyName" TEXT NOT NULL,
    "contactStatus" TEXT NOT NULL,
    "crmKey" TEXT,
    "leadSource" TEXT NOT NULL,
    "trustedFormUrl" TEXT,
    "automatedContactCompliant" BOOLEAN NOT NULL,
    "automatedContactConsentId" TEXT,

    CONSTRAINT "AngiLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AngiInterviewEntry" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "AngiInterviewEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AngiLead_leadOid_key" ON "AngiLead"("leadOid");

-- AddForeignKey
ALTER TABLE "AngiInterviewEntry" ADD CONSTRAINT "AngiInterviewEntry_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "AngiLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
