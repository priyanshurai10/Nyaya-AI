-- AlterTable User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "dob" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "gender" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "maritalStatus" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bloodGroup" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "nationality" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "occupation" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "education" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "aadhaarEnc" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "panEnc" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "altMobile" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "district" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "state" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "country" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "pincode" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "preferredLanguage" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emergencyContactName" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emergencyContactNumber" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "previousCases" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "currentCases" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "preferredLawyer" TEXT;

-- AlterTable transactions
ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "admin_notes" TEXT;
ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "adminNotes" TEXT;

-- AlterTable Transaction
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "admin_notes" TEXT;
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "adminNotes" TEXT;

-- AlterTable Payment
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "adminNotes" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "admin_notes" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "declineReason" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3);
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "verifiedBy" TEXT;

-- AlterTable consultation_requests
ALTER TABLE "consultation_requests" ADD COLUMN IF NOT EXISTS "scheduled_date" TEXT;
ALTER TABLE "consultation_requests" ADD COLUMN IF NOT EXISTS "scheduled_time" TEXT;
ALTER TABLE "consultation_requests" ADD COLUMN IF NOT EXISTS "meeting_mode" TEXT;
ALTER TABLE "consultation_requests" ADD COLUMN IF NOT EXISTS "admin_notes" TEXT;

-- AlterTable Consultation
ALTER TABLE "Consultation" ADD COLUMN IF NOT EXISTS "scheduledDate" TEXT;
ALTER TABLE "Consultation" ADD COLUMN IF NOT EXISTS "scheduledTime" TEXT;
ALTER TABLE "Consultation" ADD COLUMN IF NOT EXISTS "meetingMode" TEXT;
ALTER TABLE "Consultation" ADD COLUMN IF NOT EXISTS "adminRemarks" TEXT;
ALTER TABLE "Consultation" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3);

-- CreateTable PaymentScreenshot
CREATE TABLE IF NOT EXISTS "PaymentScreenshot" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentScreenshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable ConsultationSchedule
CREATE TABLE IF NOT EXISTS "ConsultationSchedule" (
    "id" TEXT NOT NULL,
    "consultationId" TEXT NOT NULL,
    "scheduledDate" TEXT NOT NULL,
    "scheduledTime" TEXT NOT NULL,
    "meetingMode" TEXT NOT NULL DEFAULT 'PHONE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsultationSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable ConsultationHistory
CREATE TABLE IF NOT EXISTS "ConsultationHistory" (
    "id" TEXT NOT NULL,
    "consultationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "performedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsultationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable AdminLog
CREATE TABLE IF NOT EXISTS "AdminLog" (
    "id" TEXT NOT NULL,
    "adminEmail" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetUserEmail" TEXT,
    "targetRecordId" TEXT,
    "ipAddress" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminLog_pkey" PRIMARY KEY ("id")
);
