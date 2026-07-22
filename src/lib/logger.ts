import { prisma } from "./prisma";

export async function logSystemError(params: {
  category: "API_ERROR" | "EMAIL_FAILURE" | "STORAGE_FAILURE" | "AUTH_FAILURE" | "DB_ERROR";
  endpoint?: string;
  userId?: string;
  message: string;
  stackTrace?: string;
}) {
  try {
    await prisma.systemErrorLog.create({
      data: {
        category: params.category,
        endpoint: params.endpoint || null,
        userId: params.userId || null,
        message: params.message,
        stackTrace: params.stackTrace || null,
      },
    });
  } catch (err) {
    console.error("Failed to persist SystemErrorLog:", err);
  }
}

export async function logAudit(params: {
  adminEmail: string;
  action: string;
  targetUserEmail?: string;
  targetRecordId?: string;
  ipAddress?: string;
  userAgent?: string;
  previousStatus?: string;
  newStatus?: string;
  notes?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        adminEmail: params.adminEmail,
        action: params.action,
        targetUserEmail: params.targetUserEmail || null,
        targetRecordId: params.targetRecordId || null,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
        previousStatus: params.previousStatus || null,
        newStatus: params.newStatus || null,
        notes: params.notes || null,
      },
    });
  } catch (err) {
    console.error("Failed to persist AuditLog:", err);
  }
}

export async function logUserActivity(params: {
  userId: string;
  activityType: string;
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await prisma.userActivityTimeline.create({
      data: {
        userId: params.userId,
        activityType: params.activityType,
        title: params.title,
        description: params.description,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      },
    });
  } catch (err) {
    console.error("Failed to persist UserActivityTimeline:", err);
  }
}
