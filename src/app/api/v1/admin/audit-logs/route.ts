import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const adminEmail = searchParams.get("adminEmail");

    const where: any = {};
    if (action) where.action = action;
    if (adminEmail) where.adminEmail = { contains: adminEmail, mode: "insensitive" };

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json({ success: true, logs, count: logs.length });
  } catch (error: any) {
    console.error("[Admin Audit Logs API Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
