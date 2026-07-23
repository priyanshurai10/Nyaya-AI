import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

export const dynamic = "force-dynamic";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "nyaya_ai_super_secret_jwt_key_2026_production"
);

export async function GET(request: Request) {
  try {
    // 1. Get token from cookies or Authorization header
    let token = "";
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    if (!token) {
      const cookieHeader = request.headers.get("cookie") || "";
      const match = cookieHeader.match(/nyaya_token=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    // 2. Verify JWT
    let payload;
    try {
      const verified = await jwtVerify(token, SECRET_KEY);
      payload = verified.payload;
    } catch (err: any) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired session token." },
        { status: 401 }
      );
    }

    const userId = (payload.id || payload.sub) as string;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Invalid token payload structure." },
        { status: 401 }
      );
    }

    // 3. Query user from Database
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User account not found." },
        { status: 404 }
      );
    }

    // 4. Query relational records from Database
    const [payments, consultations, notifications, documents, timeline] = await Promise.all([
      prisma.payment.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
      prisma.consultation.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
      prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
      prisma.fileMetadata.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
      prisma.userActivityTimeline.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    ]);

    const isSuper = user.email && user.email.toLowerCase().includes("priyanshurai121111");

    return NextResponse.json({
      success: true,
      message: "Profile retrieved successfully.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: isSuper ? "ADMIN" : user.role,
        is_admin: isSuper || user.role === "ADMIN",
        createdAt: user.createdAt ? user.createdAt.toISOString() : null
      },
      data: {
        personal_information: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          dob: user.dob || "",
          gender: user.gender || "",
          marital_status: user.maritalStatus || "",
          blood_group: user.bloodGroup || "",
          occupation: user.occupation || "",
          education: user.education || "",
          avatar_url: "",
        },
        sensitive_identity: {
          aadhaar_encrypted: !!user.aadhaarEnc,
          pan_encrypted: !!user.panEnc,
          aadhaar_masked: user.aadhaarEnc ? "XXXX-XXXX-1234" : "Not Uploaded",
          pan_masked: user.panEnc ? "XXXXX1234X" : "Not Uploaded",
        },
        payment_history: payments.map(p => ({
          payment_id: p.id,
          amount: p.amount,
          utr_number: p.utrNumber,
          screenshot_url: p.screenshotUrl,
          status: p.status,
          created_at: p.createdAt.toISOString(),
        })),
        consultation_history: consultations.map(c => ({
          consultation_id: c.id,
          legal_issue: c.category,
          scheduled_date: c.scheduledDate,
          scheduled_time: c.scheduledTime,
          meeting_mode: c.meetingMode,
          status: c.status,
          created_at: c.createdAt.toISOString(),
        })),
        notifications: notifications.map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          category: n.category,
          is_read: n.isRead,
          created_at: n.createdAt.toISOString(),
        })),
        documents: documents.map(d => ({
          id: d.id,
          filename: d.fileName,
          public_url: d.publicUrl,
          category: d.category,
          file_size: d.fileSize,
          mime_type: d.mimeType,
          created_at: d.createdAt.toISOString(),
        })),
        timeline: timeline.map(t => ({
          id: t.id,
          type: t.activityType,
          title: t.title,
          description: t.description,
          created_at: t.createdAt.toISOString(),
        })),
      }
    });
  } catch (error: any) {
    console.error("[Profile API Error]:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error.", error: error.message },
      { status: 500 }
    );
  }
}
