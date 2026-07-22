import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = { contains: status, mode: "insensitive" };
    }

    const consultations = await prisma.consultation.findMany({
      where,
      include: { user: true, payment: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: consultations.map(c => ({
        id: c.id,
        consultation_id: c.id,
        user_id: c.userId,
        full_name: c.name || c.user.name,
        email: c.user.email,
        mobile: c.mobile || c.user.phone || "",
        legal_issue: c.category,
        description: c.summary,
        preferred_language: c.language,
        status: c.status,
        scheduled_date: c.scheduledDate,
        scheduled_time: c.scheduledTime,
        meeting_mode: c.meetingMode,
        amount: c.payment?.amount,
        utr_number: c.payment?.utrNumber,
        screenshot_url: c.payment?.screenshotUrl,
        created_at: c.createdAt.toISOString(),
      })),
      total: consultations.length,
    });
  } catch (error: any) {
    console.error("[Admin Consultations GET Error]:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
