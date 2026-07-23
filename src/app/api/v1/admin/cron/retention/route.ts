import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { user: admin, errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    const RETENTION_DAYS = 60;
    const cutoffDate = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);

    // 1. Clean up payment screenshots & UTRs > 60 days
    const oldPayments = await prisma.payment.findMany({
      where: { createdAt: { lt: cutoffDate } },
    });

    let cleanedScreenshots = 0;
    let cleanedUtrs = 0;

    for (const p of oldPayments) {
      if (p.screenshotUrl || p.utrNumber) {
        await prisma.payment.update({
          where: { id: p.id },
          data: {
            screenshotUrl: null,
            utrNumber: "[ANONYMIZED_60D]",
          },
        });
        if (p.screenshotUrl) cleanedScreenshots++;
        if (p.utrNumber) cleanedUtrs++;
      }
    }

    // 2. Clean up consultation schedules > 60 days
    const oldConsultations = await prisma.consultation.findMany({
      where: { createdAt: { lt: cutoffDate } },
    });

    let cleanedSchedules = 0;
    for (const c of oldConsultations) {
      if (c.scheduledTime || c.adminRemarks) {
        await prisma.consultation.update({
          where: { id: c.id },
          data: {
            scheduledTime: null,
            adminRemarks: "[PURGED_60D]",
          },
        });
        cleanedSchedules++;
      }
    }

    // 3. Delete notifications older than 60 days
    const deletedNotifications = await prisma.notification.deleteMany({
      where: { createdAt: { lt: cutoffDate } },
    });

    // 4. Log Audit Entry
    await prisma.auditLog.create({
      data: {
        adminEmail: admin.email,
        action: "DATA_RETENTION_CLEANUP",
        notes: `Purged ${cleanedScreenshots} screenshots, ${cleanedUtrs} UTRs, ${cleanedSchedules} schedules, ${deletedNotifications.count} notifications older than 60 days.`,
      },
    });

    await prisma.adminLog.create({
      data: {
        adminEmail: admin.email,
        action: "DATA_RETENTION_CLEANUP",
        details: `Purged ${cleanedScreenshots} screenshots, ${cleanedUtrs} UTRs, ${cleanedSchedules} schedules, ${deletedNotifications.count} notifications older than 60 days.`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Data retention cleanup executed successfully.",
      purged: {
        screenshots: cleanedScreenshots,
        utrs: cleanedUtrs,
        schedules: cleanedSchedules,
        notifications: deletedNotifications.count,
        cutoff_date: cutoffDate.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("[Data Retention Cleanup Error]:", error);
    return NextResponse.json({ success: false, message: error.message || "Cleanup failed." }, { status: 500 });
  }
}
