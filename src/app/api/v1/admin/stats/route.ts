import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    const [
      totalUsers,
      totalLawyers,
      totalConsultations,
      activeConsultations,
      totalVaultDocs,
      totalErrorLogs,
      payments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.lawyer.count(),
      prisma.consultation.count(),
      prisma.consultation.count({ where: { status: { in: ["WAITING", "SCHEDULED"] } } }),
      prisma.fileMetadata.count(),
      prisma.systemErrorLog.count(),
      prisma.payment.aggregate({
        where: { status: "VERIFIED" },
        _sum: { amount: true },
      }),
    ]);

    const totalRevenueINR = payments._sum.amount || 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalLawyers,
        pendingLawyers: 0,
        totalConsultations,
        activeConsultations,
        totalVaultDocs,
        totalErrorLogs,
        totalRevenueINR,
      },
    });
  } catch (error: any) {
    console.error("[Admin Stats API Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
