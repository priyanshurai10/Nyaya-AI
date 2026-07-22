import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { vaultStorage } from "@/lib/storage";

export const dynamic = "force-dynamic";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://nyaya-ai-production-04ba.up.railway.app";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required." }, { status: 401 });
    }

    const txId = params.id;
    const formData = await req.formData();
    const utrNumber = formData.get("utr_number") as string;
    const screenshot = formData.get("screenshot") as File | null;

    if (!utrNumber) {
      return NextResponse.json({ success: false, message: "UTR number is required." }, { status: 400 });
    }

    let screenshotUrl = "";
    if (screenshot) {
      const saved = await vaultStorage.saveVaultFile(screenshot, "Payment_Screenshots");
      screenshotUrl = saved.publicUrl;
    }

    // Update Prisma database
    await prisma.payment.updateMany({
      where: { id: txId },
      data: {
        utrNumber,
        screenshotUrl,
        status: "UNDER_REVIEW",
      },
    });

    await prisma.consultation.updateMany({
      where: { paymentId: txId },
      data: {
        utr: utrNumber,
        screenshotUrl,
        status: "WAITING",
      },
    });

    // Create Notification
    await prisma.notification.create({
      data: {
        id: `NOT-${Date.now()}`,
        userId: user.id,
        title: "Payment Submitted",
        message: `Your payment verification (UTR: ${utrNumber}) has been submitted and is under review.`,
        category: "PAYMENT",
      },
    });

    // Forward to FastAPI Python backend (triggers Brevo email to Admin priyanshurai121111@gmail.com)
    try {
      const authHeader = req.headers.get("authorization");
      const backendFormData = new FormData();
      backendFormData.append("utr_number", utrNumber);
      if (screenshot) backendFormData.append("screenshot", screenshot);

      await fetch(`${BACKEND_URL}/api/v1/consultation/payment/verify/${txId}`, {
        method: "POST",
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: backendFormData,
      });
    } catch (err) {
      console.warn("Backend verification proxy warning:", err);
    }

    return NextResponse.json({
      success: true,
      message: "Payment details submitted for review successfully.",
    });
  } catch (error: any) {
    console.error("[Payment Verify API Error]:", error);
    return NextResponse.json({ success: false, message: error.message || "Failed to verify payment." }, { status: 500 });
  }
}
