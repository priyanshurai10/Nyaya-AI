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

    return NextResponse.json({
      success: true,
      data: {
        total_users: totalUsers,
        total_payments: totalPayments,
        pending_payments: pendingPayments,
        verified_payments: verifiedPayments,
        declined_payments: declinedPayments,
        total_consultations: totalConsultations,
        waiting_consultations: totalConsultations - (scheduledConsultations + completedConsultations),
        scheduled_consultations: scheduledConsultations,
        completed_consultations: completedConsultations,
        total_revenue: totalRevenue,
        signups_chart: [
          { day: "Mon", count: Math.max(1, Math.floor(totalUsers * 0.15)) },
          { day: "Tue", count: Math.max(1, Math.floor(totalUsers * 0.2)) },
          { day: "Wed", count: Math.max(1, Math.floor(totalUsers * 0.25)) },
          { day: "Thu", count: Math.max(1, Math.floor(totalUsers * 0.1)) },
          { day: "Fri", count: Math.max(1, Math.floor(totalUsers * 0.3)) },
        ]
      }
    });
  } catch (error: any) {
    console.error("[Admin Consultation Stats Error]:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
