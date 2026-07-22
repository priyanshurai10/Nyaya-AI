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

    await prisma.notification.create({
      data: {
        id: `NOT-${Date.now()}`,
        userId: consultation.userId,
        title: "✅ Consultation Completed!",
        message: "Your legal consultation has been marked as completed. Thank you for trusting Nyaya AI.",
        category: "CONSULTATION",
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
