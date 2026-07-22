import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://nyaya-ai-production-04ba.up.railway.app";

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    const payments = await prisma.payment.findMany({
      where,
      include: { user: true, consultations: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: payments.map(p => ({
        payment_id: p.id,
        user_id: p.userId,
        user_name: p.fullName || p.user.name,
        user_email: p.email || p.user.email,
        user_mobile: p.mobile || p.user.phone || "",
        legal_issue: p.issue,
        amount: p.amount,
        utr_number: p.utrNumber,
        screenshot_url: p.screenshotUrl,
        status: p.status.toLowerCase(),
        consultation_id: p.consultations[0]?.id || null,
        created_at: p.createdAt.toISOString(),
      })),
      total: payments.length,
    });
  } catch (error: any) {
    console.error("[Admin Payments GET Error]:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
