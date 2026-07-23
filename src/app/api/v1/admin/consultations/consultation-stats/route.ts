import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    const [
      totalUsers,
      totalPayments,
      pendingPayments,
      verifiedPayments,
      declinedPayments,
      totalConsultations,
      scheduledConsultations,
      completedConsultations,
      revenueResult
    ] = await Promise.all([
      prisma.user.count(),
      prisma.payment.count(),
      prisma.payment.count({ where: { status: { in: ["PENDING", "UNDER_REVIEW", "pending", "under_review"] } } }),
      prisma.payment.count({ where: { status: { in: ["VERIFIED", "verified"] } } }),
      prisma.payment.count({ where: { status: { in: ["DECLINED", "declined"] } } }),
      prisma.consultation.count(),
      prisma.consultation.count({ where: { status: { contains: "Scheduled" } } }),
      prisma.consultation.count({ where: { status: { contains: "Completed" } } }),
      prisma.payment.aggregate({
        where: { status: { in: ["VERIFIED", "verified"] } },
        _sum: { amount: true },
      })
    ]);

    const totalRevenue = revenueResult._sum.amount || 0;

    // Compute actual signup count per day for past 7 days from DB
    const now = new Date();
    const signupsChart = [];
    for (let i = 6; i >= 0; i--) {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 0, 0, 0);
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 23, 59, 59);
      const count = await prisma.user.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });
      const dayLabel = startOfDay.toLocaleDateString("en-US", { weekday: "short" });
      signupsChart.push({ day: dayLabel, date: startOfDay.toISOString().split("T")[0], count });
    }

    return NextResponse.json({
      success: true,
      data: {
        total_users: totalUsers,
        total_payments: totalPayments,
        pending_payments: pendingPayments,
        verified_payments: verifiedPayments,
        declined_payments: declinedPayments,
        total_consultations: totalConsultations,
        waiting_consultations: Math.max(0, totalConsultations - (scheduledConsultations + completedConsultations)),
        scheduled_consultations: scheduledConsultations,
        completed_consultations: completedConsultations,
        total_revenue: totalRevenue,
        signups_chart: signupsChart,
      }
    });
  } catch (error: any) {
    console.error("[Admin Consultation Stats Error]:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
