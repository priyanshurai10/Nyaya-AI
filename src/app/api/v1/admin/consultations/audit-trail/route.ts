import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      data: logs.map(l => ({
        id: l.id,
        action: l.action,
        description: l.notes || l.targetRecordId || "",
        admin: l.adminEmail,
        timestamp: l.createdAt.toISOString(),
      }))
    });
  } catch (error: any) {
    console.error("[Admin Audit Trail GET Error]:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
