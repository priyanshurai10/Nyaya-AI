import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const where: any = {};
    if (category && category !== "ALL") {
      where.category = category;
    }

    const logs = await prisma.systemErrorLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json({ success: true, logs, count: logs.length });
  } catch (error: any) {
    console.error("[Admin System Logs API Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
