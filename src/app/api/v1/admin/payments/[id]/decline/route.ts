import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://nyaya-ai-production-04ba.up.railway.app";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user: admin, errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    const paymentId = params.id;
    let reason = "Payment details could not be verified.";

    try {
      const formData = await req.formData();
      reason = (formData.get("reason") as string) || reason;
    } catch {
      try {
        const json = await req.json();
        reason = json.reason || reason;
      } catch {}
    }

    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "DECLINED",
        declineReason: reason,
      },
    });

    await prisma.consultation.updateMany({
      where: { paymentId },
      data: {
        status: "Payment Declined",
      },
    });

    // Write to ConsultationHistory
    const relatedConsult = await prisma.consultation.findFirst({ where: { paymentId } });
    if (relatedConsult) {
      await prisma.consultationHistory.create({
        data: {
          consultationId: relatedConsult.id,
          userId: payment.userId,
          action: "DECLINED",
          status: "Payment Declined",
          notes: `Payment declined by Admin (${admin.email}). Reason: ${reason}`,
          performedBy: admin.email,
        },
      });
    }

    // Write to UserActivityTimeline
    await prisma.userActivityTimeline.create({
      data: {
        userId: payment.userId,
        activityType: "PAYMENT_DECLINED",
        title: "Payment Declined",
        description: `Payment verification failed. Reason: ${reason}`,
      },
    });

    // Write to AdminLog & AuditLog
    await prisma.adminLog.create({
      data: {
        adminEmail: admin.email,
        action: "PAYMENT_DECLINED",
        targetUserEmail: payment.email,
        targetRecordId: paymentId,
        details: `Declined payment ₹${payment.amount}. Reason: ${reason}`,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminEmail: admin.email,
        action: "PAYMENT_DECLINED",
        targetUserEmail: payment.email,
        targetRecordId: paymentId,
        newStatus: "DECLINED",
        notes: `Reason: ${reason}`,
      },
    });

    await prisma.notification.create({
      data: {
        id: `NOT-${Date.now()}`,
        userId: payment.userId,
        title: "❌ Payment Declined",
        message: `Your payment of ₹${payment.amount} could not be verified. Reason: ${reason}`,
        category: "PAYMENT",
        paymentId,
      },
    });

    // Log Email Event
    await prisma.emailLog.create({
      data: {
        recipient: payment.email,
        subject: "Payment Could Not Be Verified – Action Required",
        template: "USER_PAYMENT_DECLINED",
        status: "SENT",
      },
    });

    // Proxy to Python backend to trigger Brevo email
    try {
      const authHeader = req.headers.get("authorization");
      const backendFormData = new FormData();
      backendFormData.append("reason", reason);
      await fetch(`${BACKEND_URL}/api/v1/admin/consultations/payments/${paymentId}/decline`, {
        method: "POST",
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: backendFormData,
      });
    } catch (err) {
      console.warn("Backend email proxy warning:", err);
    }

    return NextResponse.json({
      success: true,
      message: "Payment declined. User notified via email.",
    });
  } catch (error: any) {
    console.error("[Admin Payment Decline Error]:", error);
    return NextResponse.json({ success: false, message: error.message || "Decline failed." }, { status: 500 });
  }
}
