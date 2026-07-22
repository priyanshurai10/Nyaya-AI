import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    const lawyers = await prisma.lawyer.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, lawyers, count: lawyers.length });
  } catch (error: any) {
    console.error("[Admin Lawyers GET Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { user: adminUser, errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { lawyerId, status } = body;

    if (!lawyerId || !status) {
      return NextResponse.json(
        { success: false, error: "lawyerId and status are required" },
        { status: 400 }
      );
    }

    const updatedLawyer = await prisma.lawyer.update({
      where: { id: lawyerId },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      lawyer: updatedLawyer,
      message: `Lawyer status updated to ${status}`,
    });
  } catch (error: any) {
    console.error("[Admin Lawyers PUT Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
