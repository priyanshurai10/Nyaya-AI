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

    // Update Prisma payment & consultation status
    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "VERIFIED",
        verifiedAt: new Date(),
        verifiedBy: admin.email,
      },
    });

    await prisma.consultation.updateMany({
      where: { paymentId },
      data: {
        status: "Payment Verified – Awaiting Schedule",
      },
    });

    // Create Notification in DB
    await prisma.notification.create({
      data: {
        id: `NOT-${Date.now()}`,
        userId: payment.userId,
        title: "✅ Payment Verified!",
        message: `Your payment of ₹${payment.amount} has been verified. Your consultation will be scheduled soon. Contact: +91 75418 81152`,
        category: "PAYMENT",
      },
    });

    // Proxy to Python FastAPI backend to trigger Brevo User Verification Email
    try {
      const authHeader = req.headers.get("authorization");
      await fetch(`${BACKEND_URL}/api/v1/admin/consultations/payments/${paymentId}/verify`, {
        method: "POST",
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
      });
    } catch (err) {
      console.warn("Backend email proxy warning:", err);
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully. User notified via email.",
    });
  } catch (error: any) {
    console.error("[Admin Payment Verify Error]:", error);
    return NextResponse.json({ success: false, message: error.message || "Verification failed." }, { status: 500 });
  }
}
