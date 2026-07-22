import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required." }, { status: 401 });
    }

    const consultations = await prisma.consultation.findMany({
      where: { userId: user.id },
      include: { payment: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: consultations.map(c => ({
        id: c.id,
        consultation_id: c.id,
        service_name: c.category,
        request_type: "pay_now",
        status: c.status,
        scheduled_date: c.scheduledDate,
        scheduled_time: c.scheduledTime,
        meeting_mode: c.meetingMode,
        created_at: c.createdAt.toISOString(),
        transaction: c.payment ? {
          amount: c.payment.amount,
          utr_number: c.payment.utrNumber,
          screenshot_path: c.payment.screenshotUrl,
          status: c.payment.status,
        } : null
      })),
    });
  } catch (error: any) {
    console.error("[Consultation Orders GET Error]:", error);
    return NextResponse.json({ success: false, message: error.message || "Failed to fetch orders." }, { status: 500 });
  }
}
