import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { generatePaymentId, generateConsultationId } from "@/lib/id-generator";

export const dynamic = "force-dynamic";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://nyaya-ai-production-04ba.up.railway.app";

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required." }, { status: 401 });
    }

    const formData = await req.formData();
    const serviceName = (formData.get("service_name") as string) || "Talk to Senior Specialist";
    const amountStr = (formData.get("amount") as string) || "200";
    const amount = parseFloat(amountStr);
    const paymentMethod = (formData.get("payment_method") as string) || "upi";
    const fullName = (formData.get("full_name") as string) || user.name;
    const mobileNumber = (formData.get("mobile_number") as string) || user.phone || "";
    const preferredLanguage = (formData.get("preferred_language") as string) || "English";
    const legalIssueType = (formData.get("legal_issue_type") as string) || "General Legal Advice";
    const description = (formData.get("description") as string) || "";

    const txId = generatePaymentId();
    const displayId = generateConsultationId();

    // Store in Prisma database
    const payment = await prisma.payment.create({
      data: {
        id: txId,
        userId: user.id,
        fullName,
        email: user.email,
        mobile: mobileNumber,
        issue: legalIssueType,
        amount,
        status: "PENDING",
      },
    });

    const consultation = await prisma.consultation.create({
      data: {
        id: displayId,
        userId: user.id,
        paymentId: txId,
        name: fullName,
        mobile: mobileNumber,
        language: preferredLanguage,
        time: "ASAP",
        category: legalIssueType,
        summary: description,
        status: "WAITING",
      },
    });

    // Write to ConsultationHistory
    await prisma.consultationHistory.create({
      data: {
        consultationId: displayId,
        userId: user.id,
        action: "SUBMITTED",
        status: "WAITING",
        notes: `Consultation request initiated for ₹${amount}.`,
        performedBy: user.email,
      },
    });

    // Write to UserActivityTimeline
    await prisma.userActivityTimeline.create({
      data: {
        userId: user.id,
        activityType: "PAYMENT_SUBMITTED",
        title: "Legal Consultation Requested",
        description: `Requested consultation for ${legalIssueType} (Amount: ₹${amount}).`,
      },
    });

    // Create Notification
    await prisma.notification.create({
      data: {
        id: `NOT-${Date.now()}`,
        userId: user.id,
        title: "Consultation Request Initiated",
        message: `Your consultation request (${displayId}) has been submitted. Please upload payment proof to proceed.`,
        category: "PAYMENT",
        paymentId: txId,
        consultationId: displayId,
      },
    });

    // Log Email Event
    await prisma.emailLog.create({
      data: {
        recipient: "priyanshurai121111@gmail.com",
        subject: "New Consultation Payment Request",
        template: "ADMIN_NEW_PAYMENT_ALERT",
        status: "SENT",
      },
    });

    // Also forward to FastAPI Python backend if available
    try {
      const authHeader = req.headers.get("authorization");
      await fetch(`${BACKEND_URL}/api/v1/consultation/payment/submit`, {
        method: "POST",
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: formData,
      });
    } catch (err) {
      console.warn("Backend proxy warn:", err);
    }

    return NextResponse.json({
      success: true,
      transaction_id: txId,
      consultation_id: displayId,
      display_id: displayId,
      message: "Payment request initiated successfully.",
    });
  } catch (error: any) {
    console.error("[Consultation Payment Submit Error]:", error);
    return NextResponse.json({ success: false, message: error.message || "Failed to initiate payment." }, { status: 500 });
  }
}
