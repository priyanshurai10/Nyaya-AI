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
    let scheduledDate = "";
    let scheduledTime = "";
    let meetingMode = "PHONE";

    try {
      const formData = await req.formData();
      scheduledDate = (formData.get("scheduled_date") as string) || "";
      scheduledTime = (formData.get("scheduled_time") as string) || "";
      meetingMode = (formData.get("meeting_mode") as string) || "PHONE";
    } catch {
      try {
        const json = await req.json();
        scheduledDate = json.scheduled_date || "";
        scheduledTime = json.scheduled_time || "";
        meetingMode = json.meeting_mode || "PHONE";
      } catch {}
    }

    if (!scheduledDate || !scheduledTime) {
      return NextResponse.json({ success: false, message: "scheduled_date and scheduled_time are required." }, { status: 400 });
    }

    const consultation = await prisma.consultation.update({
      where: { id: consultationId },
      data: {
        status: "Consultation Scheduled",
        scheduledDate,
        scheduledTime,
        meetingMode,
      },
    });

    await prisma.notification.create({
      data: {
        id: `NOT-${Date.now()}`,
        userId: consultation.userId,
        title: "📅 Consultation Scheduled!",
        message: `Your consultation has been scheduled for ${scheduledDate} at ${scheduledTime} via ${meetingMode.replace('_', ' ')}. Contact: +91 75418 81152`,
        category: "CONSULTATION",
      },
    });

    // Forward to FastAPI backend for Brevo email trigger
    try {
      const authHeader = req.headers.get("authorization");
      const backendFormData = new FormData();
      backendFormData.append("scheduled_date", scheduledDate);
      backendFormData.append("scheduled_time", scheduledTime);
      backendFormData.append("meeting_mode", meetingMode);
      await fetch(`${BACKEND_URL}/api/v1/admin/consultations/consultations/${consultationId}/schedule`, {
        method: "POST",
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: backendFormData,
      });
    } catch (err) {
      console.warn("Backend schedule proxy warning:", err);
    }

    return NextResponse.json({
      success: true,
      message: "Consultation scheduled successfully. User notified via email.",
    });
  } catch (error: any) {
    console.error("[Admin Consultation Schedule Error]:", error);
    return NextResponse.json({ success: false, message: error.message || "Scheduling failed." }, { status: 500 });
  }
}
