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

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return NextResponse.json({
      success: true,
      data: notifications.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        category: n.category,
        is_read: n.isRead,
        payment_id: n.paymentId,
        consultation_id: n.consultationId,
        created_at: n.createdAt.toISOString(),
      })),
      unread_count: unreadCount,
    });
  } catch (error: any) {
    console.error("[Notifications GET Error]:", error);
    return NextResponse.json({ success: false, message: error.message || "Failed to fetch notifications." }, { status: 500 });
  }
}
