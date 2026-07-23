import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required." }, { status: 401 });
    }

    const notificationId = params.id;

    if (notificationId === "mark-all-read") {
      await prisma.notification.updateMany({
        where: { userId: user.id, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: "All notifications marked as read." });
    }

    await prisma.notification.updateMany({
      where: { id: notificationId, userId: user.id },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true, message: "Notification marked as read." });
  } catch (error: any) {
    console.error("[Notification Mark Read Error]:", error);
    return NextResponse.json({ success: false, message: error.message || "Failed to mark notification as read." }, { status: 500 });
  }
}
