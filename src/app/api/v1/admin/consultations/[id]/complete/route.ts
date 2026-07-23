import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://nyaya-ai-production-04ba.up.railway.app";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    const consultationId = params.id;

    const consultation = await prisma.consultation.update({
      where: { id: consultationId },
      data: {
        status: "Consultation Completed",
        completedAt: new Date(),
      },
    });

    // Write to ConsultationHistory
    await prisma.consultationHistory.create({
      data: {
        consultationId,
        userId: consultation.userId,
        action: "COMPLETED",
        status: "Consultation Completed",
        notes: `Consultation session marked completed by admin.`,
        performedBy: "ADMIN",
      },
    });

    // Write to UserActivityTimeline
    await prisma.userActivityTimeline.create({
      data: {
        userId: consultation.userId,
        activityType: "CONSULTATION_COMPLETED",
        title: "Consultation Completed",
        description: `Consultation session (${consultationId}) completed successfully.`,
      },
    });

    // Write to AdminLog & AuditLog
    await prisma.adminLog.create({
      data: {
        adminEmail: "priyanshurai121111@gmail.com",
        action: "CONSULTATION_COMPLETED",
        targetUserEmail: consultation.name,
        targetRecordId: consultationId,
        details: `Marked consultation ${consultationId} complete.`,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminEmail: "priyanshurai121111@gmail.com",
        action: "CONSULTATION_COMPLETED",
        targetUserEmail: consultation.name,
        targetRecordId: consultationId,
        newStatus: "Consultation Completed",
        notes: `Consultation completed.`,
      },
    });

    await prisma.notification.create({
      data: {
        id: `NOT-${Date.now()}`,
        userId: consultation.userId,
        title: "✅ Consultation Completed!",
        message: "Your legal consultation has been marked as completed. Thank you for trusting Nyaya AI.",
        category: "CONSULTATION",
        consultationId,
      },
    });

    // Log Email Event
    await prisma.emailLog.create({
      data: {
        recipient: consultation.name,
        subject: `Consultation Completed – ${consultationId}`,
        template: "USER_CONSULTATION_COMPLETED",
        status: "SENT",
      },
    });

    // Forward to FastAPI backend for Brevo email trigger
    try {
      const authHeader = req.headers.get("authorization");
      await fetch(`${BACKEND_URL}/api/v1/admin/consultations/consultations/${consultationId}/complete`, {
        method: "POST",
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
      });
    } catch (err) {
      console.warn("Backend complete proxy warning:", err);
    }

    return NextResponse.json({
      success: true,
      message: "Consultation marked as completed. User notified.",
    });
  } catch (error: any) {
    console.error("[Admin Consultation Complete Error]:", error);
    return NextResponse.json({ success: false, message: error.message || "Completion failed." }, { status: 500 });
  }
}
