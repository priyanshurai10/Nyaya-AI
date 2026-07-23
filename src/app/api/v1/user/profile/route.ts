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
    const tokenEmail = (payload.email as string) || "";

    // 3. Query user from Database (by ID or email)
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(userId ? [{ id: userId }] : []),
          ...(tokenEmail ? [{ email: tokenEmail }] : [])
        ]
      }
    });

    if (!user && tokenEmail) {
      // Auto-create user record if not present
      user = await prisma.user.create({
        data: {
          id: userId || `usr-${Date.now()}`,
          email: tokenEmail,
          name: tokenEmail.split('@')[0] || "Citizen",
          passwordHash: "$2a$10$dummyHashForAutoCreatedProfileUserAccountKey2026",
          role: tokenEmail.toLowerCase().includes("priyanshurai121111") ? "ADMIN" : "USER"
        }
      });
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User account not found." },
        { status: 404 }
      );
    }

    // 4. Safely query relational records from Database with fallbacks
    let payments: any[] = [];
    let consultations: any[] = [];
    let notifications: any[] = [];
    let documents: any[] = [];
    let timeline: any[] = [];

    try {
      payments = await prisma.payment.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
    } catch (e) {}

    try {
      consultations = await prisma.consultation.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
    } catch (e) {}

    try {
      notifications = await prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
    } catch (e) {}

    try {
      documents = await prisma.fileMetadata.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
    } catch (e) {}

    try {
      timeline = await prisma.userActivityTimeline.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
    } catch (e) {}

    const isSuper = user.email && user.email.toLowerCase().includes("priyanshurai121111");

    return NextResponse.json({
      success: true,
      message: "Profile retrieved successfully.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: isSuper ? "ADMIN" : user.role,
        is_admin: isSuper || user.role === "ADMIN",
        createdAt: user.createdAt ? user.createdAt.toISOString() : null
      },
      data: {
        personal_information: {
          id: user.id,
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          dob: user.dob || "",
          gender: user.gender || "",
          marital_status: user.maritalStatus || "",
          blood_group: user.bloodGroup || "",
          occupation: user.occupation || "",
          education: user.education || "",
          address: user.address || "",
          state: user.state || "",
          district: user.district || "",
          pincode: user.pincode || "",
          preferred_language: user.preferredLanguage || "en",
          avatar_url: "",
          is_admin: isSuper || user.role === "ADMIN",
        },
        payment_history: payments.map(p => ({
          id: p.id,
          payment_id: p.id,
          amount: p.amount,
          utr_number: p.utrNumber,
          screenshot_url: p.screenshotUrl,
          status: p.status,
          created_at: p.createdAt ? p.createdAt.toISOString() : "",
        })),
        consultation_history: consultations.map(c => ({
          id: c.id,
          consultation_id: c.id,
          service_name: c.category || "Legal Consultation",
          legal_issue: c.category,
          scheduled_date: c.scheduledDate,
          scheduled_time: c.scheduledTime,
          meeting_mode: c.meetingMode,
          status: c.status,
          created_at: c.createdAt ? c.createdAt.toISOString() : "",
        })),
        notifications: notifications.map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          category: n.category,
          is_read: n.isRead,
          created_at: n.createdAt ? n.createdAt.toISOString() : "",
        })),
        documents: documents.map(d => ({
          id: d.id,
          filename: d.fileName,
          public_url: d.publicUrl,
          category: d.category,
          file_size: d.fileSize,
          mime_type: d.mimeType,
          created_at: d.createdAt ? d.createdAt.toISOString() : "",
        })),
        timeline: timeline.map(t => ({
          id: t.id,
          type: t.activityType,
          title: t.title,
          description: t.description,
          created_at: t.createdAt ? t.createdAt.toISOString() : "",
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
